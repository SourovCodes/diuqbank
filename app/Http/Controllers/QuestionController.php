<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Requests\QuestionPdfPresignedUrlRequest;
use App\Http\Requests\QuestionRequest;

use App\Http\Resources\QuestionResource;

use App\Models\Question;
use App\Models\UserReport;
use App\Enums\UserReportType;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QuestionController extends Controller
{


    public function generatePresignedUrl(QuestionPdfPresignedUrlRequest $request)
    {
        $fileSize = $request->file_size;
        $fileType = $request->file_type;

        $userID = auth()->id();

        $uuid = Str::uuid();
        $tempKey = "temp-uploads/$userID/$uuid.pdf";

        // Create a presigned URL for the file upload with private ACL
        $presignedUrl = \Storage::disk('s3')->temporaryUploadUrl(
            $tempKey,
            now()->addMinutes(5),
            [
                'ContentType' => $fileType,
                'ContentLength' => $fileSize,
            ]
        );

        return response()->json([
            'url' => $presignedUrl['url'],
            'pdf_key' => $tempKey,
        ]);
    }

    public function store(QuestionRequest $request)
    {
        if (!Storage::disk('s3')->exists($request->pdf_key)) {
            toast('PDF file not found. Please upload the file again.', 'error');
            abort(400, 'PDF not uploaded');
        }

        // Check for duplicates among published questions
        $section = $request->section;
        $duplicates = Question::query()
            ->published()
            ->where('department_id', $request->department_id)
            ->where('course_id', $request->course_id)
            ->where('semester_id', $request->semester_id)
            ->where('exam_type_id', $request->exam_type_id)
            ->when(is_null($section), fn ($q) => $q->whereNull('section'), fn ($q) => $q->where('section', $section))
            ->with(['department', 'semester', 'course', 'examType'])
            ->get();

        $duplicateReason = $request->input('duplicate_reason');

        if ($duplicates->count() > 0 && blank($duplicateReason)) {
            toast('Duplicate detected: matches '.$duplicates->count().' published question(s).', 'error');

            return response()->json([
                'message' => 'Duplicate question detected with '.$duplicates->count().' published question(s).',
                'duplicates' => QuestionResource::collection($duplicates),
            ], 422);
        }
        $uuid = Str::uuid();
        $finalKey = "questions/$uuid.pdf";
        Storage::disk('s3')->copy($request->pdf_key, $finalKey);
        // Set the file as public for read access
        Storage::disk('s3')->setVisibility($finalKey, 'public');
        Storage::disk('s3')->delete($request->pdf_key);

        $status = ($duplicates->count() > 0) ? QuestionStatus::PENDING_REVIEW : QuestionStatus::PUBLISHED;

        $question = Question::create(array_merge($request->validated(), [
            'user_id' => auth()->id(),
            'pdf_key' => $finalKey,
            'pdf_size' => Storage::disk('s3')->size($finalKey),
            'is_watermarked' => false,
            'status' => $status,
        ]));

        if ($duplicates->count() > 0) {
            UserReport::create([
                'user_id' => auth()->id(),
                'question_id' => $question->id,
                'type' => UserReportType::DUPLICATE_ALLOW_REQUEST,
                'details' => (string) $duplicateReason,
                'reviewed' => false,
            ]);
            toast('Question submitted for review due to possible duplicate.', 'warning');
        } else {
            toast('Question created successfully! 🎉');
        }

        return new QuestionResource($question);
    }


    public function update(QuestionRequest $request, Question $question)
    {
        if ($question->user_id !== auth()->id()) {
            toast('You are not authorized to edit this question.', 'error');
            abort(403, 'Unauthorized');
        }

        $updateData = $request->validated();

        // Determine candidate attributes after update for duplicate checking
        $candidateDepartmentId = $updateData['department_id'] ?? $question->department_id;
        $candidateCourseId = $updateData['course_id'] ?? $question->course_id;
        $candidateSemesterId = $updateData['semester_id'] ?? $question->semester_id;
        $candidateExamTypeId = $updateData['exam_type_id'] ?? $question->exam_type_id;
        $candidateSection = array_key_exists('section', $updateData) ? $updateData['section'] : $question->section;

        // Check for duplicates among published questions, excluding the current question
        $updateDuplicates = Question::query()
            ->published()
            ->where('department_id', $candidateDepartmentId)
            ->where('course_id', $candidateCourseId)
            ->where('semester_id', $candidateSemesterId)
            ->where('exam_type_id', $candidateExamTypeId)
            ->when(is_null($candidateSection), fn ($q) => $q->whereNull('section'), fn ($q) => $q->where('section', $candidateSection))
            ->where('id', '!=', $question->id)
            ->with(['department', 'semester', 'course', 'examType'])
            ->get();

        $updateDuplicateReason = $request->input('duplicate_reason');
        if ($updateDuplicates->count() > 0 && blank($updateDuplicateReason)) {
            toast('Duplicate detected: matches '.$updateDuplicates->count().' published question(s).', 'error');

            return response()->json([
                'message' => 'Duplicate question detected with '.$updateDuplicates->count().' published question(s).',
                'duplicates' => QuestionResource::collection($updateDuplicates),
            ], 422);
        }

        // If pdf_key is provided, handle PDF file operations
        if ($request->pdf_key) {
            if (!Storage::disk('s3')->exists($request->pdf_key)) {
                toast('PDF file not found. Please upload the file again.', 'error');
                abort(400, 'PDF not uploaded');
            }
            $uuid = Str::uuid();
            $finalKey = "questions/$uuid.pdf";
            Storage::disk('s3')->copy($request->pdf_key, $finalKey);
            // Set the file as public for read access
            Storage::disk('s3')->setVisibility($finalKey, 'public');
            Storage::disk('s3')->delete($request->pdf_key);

            // Delete the old PDF file if it exists
            if ($question->pdf_key && Storage::disk('s3')->exists($question->pdf_key)) {
                Storage::disk('s3')->delete($question->pdf_key);
            }

            $updateData = array_merge($updateData, [
                'pdf_key' => $finalKey,
                'pdf_size' => Storage::disk('s3')->size($finalKey),
                'is_watermarked' => false,
            ]);
        } else {
            // Remove pdf_key from update data if it's null to avoid overwriting existing value
            unset($updateData['pdf_key']);
        }

        // If duplicates exist and reason is provided, mark pending review; else publish/keep existing
        if ($updateDuplicates->count() > 0 && !blank($updateDuplicateReason)) {
            $updateData['status'] = QuestionStatus::PENDING_REVIEW;
        } elseif ($request->pdf_key) {
            // On actual PDF replacement and no duplicate issue, publish
            $updateData['status'] = QuestionStatus::PUBLISHED;
        }

        $question->update($updateData);

        if ($updateDuplicates->count() > 0 && !blank($updateDuplicateReason)) {
            UserReport::create([
                'user_id' => auth()->id(),
                'question_id' => $question->id,
                'type' => UserReportType::DUPLICATE_ALLOW_REQUEST,
                'details' => (string) $updateDuplicateReason,
                'reviewed' => false,
            ]);
            toast('Changes submitted for review due to possible duplicate.', 'warning');
        } else {
            toast('Question updated successfully! ✨');
        }

        return new QuestionResource($question->loadMissing('department', 'semester', 'course', 'examType'));
    }


}
