<?php

return [

    /*
    |--------------------------------------------------------------------------
    | PDF Compression Settings
    |--------------------------------------------------------------------------
    |
    | This file contains configuration settings for PDF compression using
    | Ghostscript. You can adjust these settings to control the quality
    | and compression level of uploaded PDFs.
    |
    */

    'compression' => [
        /*
        |--------------------------------------------------------------------------
        | Enable PDF Compression
        |--------------------------------------------------------------------------
        |
        | Set this to true to enable automatic PDF compression for uploaded files.
        | When disabled, PDFs will be stored as-is without compression.
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
            'pdf_settings' => '/prepress',
            
            // Image compression settings
            'color_image_resolution' => 150,
            'grayscale_image_resolution' => 150,
            'monochrome_image_resolution' => 300,
            
            // Compression thresholds
            'color_image_threshold' => 1.0,
            'grayscale_image_threshold' => 1.0,
            'monochrome_image_threshold' => 1.0,
            
            // Compression timeout in seconds
            'timeout' => 120,
        ],

        /*
        |--------------------------------------------------------------------------
        | Size Reduction Threshold
        |--------------------------------------------------------------------------
        |
        | Only replace the original PDF if compression achieves at least this
        | percentage of size reduction. Set to 0.1 for 10% minimum reduction.
        |
        */
        'min_reduction_threshold' => 0.1, // 10% minimum reduction

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
