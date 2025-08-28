<?php

return [

    /*
    |--------------------------------------------------------------------------
    | PDF Processing Settings
    |--------------------------------------------------------------------------
    |
    | This file contains configuration settings for PDF compression and
    | watermarking using Ghostscript. You can adjust these settings to
    | control the quality and processing of uploaded PDFs.
    |
    */

    'compression' => [
        /*
        |--------------------------------------------------------------------------
        | Enable PDF Processing
        |--------------------------------------------------------------------------
        |
        | Set this to true to enable automatic PDF compression and watermarking
        | for uploaded files. When disabled, PDFs will be stored as-is without
        | any processing.
        |
        */
        'enabled' => env('PDF_COMPRESSION_ENABLED', true),

        /*
        |--------------------------------------------------------------------------
        | Ghostscript Settings
        |--------------------------------------------------------------------------
        |
        | Ghostscript configuration for PDF compression.
        |
        */
        'ghostscript' => [
            // PDF compatibility level
            'compatibility_level' => '1.4',
            
            // PDF settings profile: /screen, /ebook, /printer, /prepress
            'pdf_settings' => '/printer',
            
            // Image compression settings - Higher resolutions for better quality
            'color_image_resolution' => 300,
            'grayscale_image_resolution' => 300,
            'monochrome_image_resolution' => 600,
            
            // Compression thresholds - Higher thresholds preserve more quality
            'color_image_threshold' => 1.5,
            'grayscale_image_threshold' => 1.5,
            'monochrome_image_threshold' => 2.0,
            
            // Compression timeout in seconds
            'timeout' => 180,
        ],

        /*
        |--------------------------------------------------------------------------
        | Size Reduction Threshold
        |--------------------------------------------------------------------------
        |
        | This setting is now legacy - original PDFs are never replaced.
        | Compression is only applied to watermarked versions for public access.
        |
        */
        'min_reduction_threshold' => 0.2, // Legacy setting - no longer used for original replacement

        /*
        |--------------------------------------------------------------------------
        | Maximum File Size for Compression
        |--------------------------------------------------------------------------
        |
        | Maximum file size in bytes to attempt compression. Very large files
        | may take too long or cause memory issues. Set to null for no limit.
        |
        */
        'max_file_size' => 50 * 1024 * 1024, // 50MB
    ],

];
