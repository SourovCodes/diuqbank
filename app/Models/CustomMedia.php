<?php

namespace App\Models;


use setasign\Fpdi\Fpdi;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Support\Facades\Storage;


class CustomMedia extends Media
{
    public function getWatermarkedPdfUrlAttribute()
    {


        if (!$this->hasGeneratedConversion('watermarked')) {
            return $this->getUrl();
        }
        return Storage::disk($this->disk)->url("{$this->id}/pdf/{$this->file_name}");
    }


    public function addWatermark($text = 'Watermarked')
    {
        if ($this->mime_type !== 'application/pdf') {
            throw new \Exception("Watermarking is only supported for PDF files.");
        }

        try {
            // Step 1: Download the PDF from S3 to a temporary local path
            $tempPdfPath = storage_path("app/tmp/pdf/{$this->id}.pdf");

            Storage::disk('local')->put("tmp/pdf/{$this->id}.pdf", Storage::disk($this->disk)->get($this->getPathRelativeToRoot()));

            // Verify that the file exists and is not empty
            if (!file_exists($tempPdfPath) || filesize($tempPdfPath) === 0) {
                throw new \Exception("Failed to download PDF from S3 or file is empty.");
            }

            // Step 2: Define a local path for the watermarked file
            $watermarkedPath = storage_path("app/tmp/pdf/{$this->id}-watermarked.pdf");

            $this->addWatermarkToPdf($tempPdfPath, $watermarkedPath, "For more questions: https://diuqbank.com");

            // Verify that the watermarked file was created and is not empty
            if (!file_exists($watermarkedPath) || filesize($watermarkedPath) === 0) {
                throw new \Exception("Failed to create watermarked PDF.");
            }

            // Step 5: Upload the watermarked PDF back to S3
            $watermarkedS3Path = "{$this->id}/pdf/{$this->file_name}";
            Storage::disk($this->disk)->put($watermarkedS3Path, file_get_contents($watermarkedPath));

            // Step 6: Clean up temporary local files
            if (file_exists($tempPdfPath)) {
                unlink($tempPdfPath);
            }

            if (file_exists($watermarkedPath)) {
                unlink($watermarkedPath);
            }
            $this->markAsConversionGenerated('watermarked');

            return $watermarkedS3Path; // Return the S3 path of the watermarked file

        } catch (\Throwable $e) {
            throw new \Exception("Failed to watermark media ID: {$this->id}. Error: " . $e->getMessage());
        }
    }

    public function addWatermarkToPdf($sourceFile, $outputFile, $watermarkText)
    {
        $pdf = new Fpdi();

        // Get the number of pages in the source PDF
        $pageCount = $pdf->setSourceFile($sourceFile);

        // Loop through each page of the PDF
        for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
            // Get the page size and orientation
            $pageInfo = $pdf->getTemplateSize($pdf->importPage($pageNo));
            $orientation = ($pageInfo['width'] > $pageInfo['height']) ? 'L' : 'P';

            // Add a new page with the same dimensions and orientation as the source
            $pdf->AddPage($orientation, [$pageInfo['width'], $pageInfo['height']]);

            // Import the page
            $tplId = $pdf->importPage($pageNo);
            $pdf->useTemplate($tplId);

            // Set font and color for watermark text
            $pdf->SetFont('Arial', 'B', 10); // Select font and size
            $pdf->SetTextColor(150, 150, 150); // Light gray

            // Add watermark text to top-left corner
            $pdf->SetXY(10, 10); // Coordinates: 10mm from top and left
            $pdf->Write(10, $watermarkText); // Write text
        }

        // Output the PDF to a file
        $pdf->Output('F', $outputFile);
    }


}
