<?php

namespace App\Http\Controllers;

use App\Enums\QuestionStatus;
use App\Http\Requests\QuestionPdfPresignedUrlRequest;
use App\Http\Requests\QuestionRequest;

use App\Http\Resources\QuestionResource;

use App\Models\Question;
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
        $uuid = Str::uuid();
        $finalKey = "questions/$uuid.pdf";
        Storage::disk('s3')->copy($request->pdf_key, $finalKey);
        // Set the file as public for read access
        Storage::disk('s3')->setVisibility($finalKey, 'public');
        Storage::disk('s3')->delete($request->pdf_key);

        $question = Question::create(array_merge($request->validated(), [
            'user_id' => auth()->id(),
            'pdf_key' => $finalKey,
            'pdf_size' => Storage::disk('s3')->size($finalKey),
            'is_watermarked' => false,
            'status' => QuestionStatus::PUBLISHED,
        ]));

        toast('Question created successfully! 🎉');

        return new QuestionResource($question);
    }


    public function update(QuestionRequest $request, Question $question)
    {
        if ($question->user_id !== auth()->id()) {
            toast('You are not authorized to edit this question.', 'error');
            abort(403, 'Unauthorized');
        }

        $updateData = $request->validated();

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
                'status' => QuestionStatus::PUBLISHED,
            ]);
        } else {
            // Remove pdf_key from update data if it's null to avoid overwriting existing value
            unset($updateData['pdf_key']);
        }

        $question->update($updateData);

        toast('Question updated successfully! ✨');

        return new QuestionResource($question->loadMissing('department', 'semester', 'course', 'examType'));
    }


}
