# PDF Compression Setup Guide

This document explains how to set up and configure PDF compression for the DIU Question Bank application.

## Overview

The PDF compression system automatically optimizes uploaded PDF files using Ghostscript to:
- Reduce file sizes significantly (typically 30-70% reduction)
- Standardize PDF dimensions and quality
- Improve loading times for end users
- Reduce storage costs

## Installation Requirements

### 1. Install Ghostscript

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install ghostscript
```

#### CentOS/RHEL:
```bash
sudo yum install ghostscript
# or for newer versions:
sudo dnf install ghostscript
```

#### macOS:
```bash
brew install ghostscript
```

#### Windows:
Download and install from: https://www.ghostscript.com/download/gsdnld.html

### 2. Verify Installation
```bash
gs --version
```
This should output the Ghostscript version if installed correctly.

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# PDF Compression Settings
PDF_COMPRESSION_ENABLED=true
```

### Queue Configuration

Ensure your queue is properly configured in `.env`:

```env
QUEUE_CONNECTION=database
# or
QUEUE_CONNECTION=redis
# or any other queue driver you prefer
```

### Start Queue Worker

To process compression jobs, run:

```bash
php artisan queue:work
```

For production, set up a process monitor like Supervisor to keep the queue worker running.

## Configuration Options

The PDF compression settings can be customized in `config/pdf.php`:

### Basic Settings

- `compression.enabled`: Enable/disable compression (default: true)
- `compression.min_reduction_threshold`: Minimum size reduction to replace original (default: 10%)
- `compression.max_file_size`: Maximum file size to attempt compression (default: 50MB)

### Ghostscript Settings

- `ghostscript.compatibility_level`: PDF version compatibility (default: 1.4)
- `ghostscript.pdf_settings`: Quality profile - `/screen`, `/ebook`, `/printer`, `/prepress` (default: `/prepress`)
- `ghostscript.color_image_resolution`: DPI for color images (default: 150)
- `ghostscript.grayscale_image_resolution`: DPI for grayscale images (default: 150)
- `ghostscript.monochrome_image_resolution`: DPI for monochrome images (default: 300)
- `ghostscript.timeout`: Maximum compression time in seconds (default: 120)

## How It Works

1. **Upload**: User uploads a PDF file
2. **Storage**: PDF is stored in S3/configured storage
3. **Queue Job**: Compression job is dispatched to queue
4. **Processing**: 
   - Downloads PDF to temporary local storage
   - Runs Ghostscript compression with optimized settings
   - Checks if compression achieved significant size reduction
   - Uploads compressed version back to storage (if beneficial)
   - Updates the `pdf_size` field in database with new compressed size
   - Cleans up temporary files
5. **Completion**: Original PDF is replaced with compressed version and database reflects new size

## Compression Settings Explained

### Quality Profiles

- `/screen`: Lowest quality, smallest files (72 DPI)
- `/ebook`: Good for e-readers (150 DPI)
- `/printer`: Good for printing (300 DPI)
- `/prepress`: High quality for professional printing (300+ DPI)

**Recommended**: `/prepress` for best balance of quality and compression.

### Image Resolution

- **Color/Grayscale**: 150 DPI is optimal for web viewing while maintaining good quality
- **Monochrome**: 300 DPI preserves text clarity
- Higher DPI = better quality but larger files
- Lower DPI = smaller files but reduced quality

## Monitoring and Troubleshooting

### Logs

Compression activities are logged with the following information:
- Original file sizes
- Compressed file sizes
- Compression ratios
- Errors and failures

Check Laravel logs at `storage/logs/laravel.log` for compression activity.

### Common Issues

1. **Ghostscript not found**:
   - Ensure Ghostscript is installed and in PATH
   - Check with `gs --version`

2. **Compression taking too long**:
   - Increase timeout in config
   - Check if files are too large
   - Ensure sufficient memory and disk space

3. **Jobs not processing**:
   - Ensure queue worker is running: `php artisan queue:work`
   - Check queue connection in `.env`
   - Verify database has jobs table

4. **Memory issues**:
   - Reduce max_file_size setting
   - Increase PHP memory_limit
   - Consider processing large files with reduced quality settings

### Performance Tips

1. **Queue Workers**: Run multiple queue workers for better throughput
2. **Storage**: Use local storage for temporary files to avoid network latency
3. **Memory**: Ensure adequate PHP memory limit for large files
4. **Monitoring**: Set up monitoring for queue length and job failures

## Testing

To test the compression system:

1. Upload a large PDF file through the application
2. Check the queue for pending jobs: `php artisan queue:work --once`
3. Monitor logs for compression results
4. Verify the compressed file in storage

## Disabling Compression

To disable compression temporarily:

```env
PDF_COMPRESSION_ENABLED=false
```

Or permanently by setting in `config/pdf.php`:

```php
'enabled' => false,
```

## Production Considerations

1. **Process Monitoring**: Use Supervisor or similar to keep queue workers running
2. **Error Handling**: Monitor failed jobs and set up alerts
3. **Resource Limits**: Configure appropriate timeouts and memory limits
4. **Backup Strategy**: Consider keeping originals for a period before deletion
5. **Scaling**: For high volume, consider dedicated compression servers
