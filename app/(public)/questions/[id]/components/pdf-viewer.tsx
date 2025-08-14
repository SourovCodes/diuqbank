"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
  fileSize: number;
  className?: string;
}

function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export function PDFViewer({
  pdfUrl,
  fileName,
  fileSize,
  className,
}: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleEmbedError = () => {
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden shadow-xl",
        isFullscreen && "fixed inset-0 z-50 rounded-none border-0",
        className
      )}
    >
      {/* PDF Viewer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/60 dark:border-slate-600/60">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">
            {fileName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              PDF • {formatFileSize(fileSize)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 px-3"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenExternal}
            className="h-8 px-3"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleDownload}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm h-8 px-4"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* PDF Viewer Content */}
      <div
        className={cn(
          "relative bg-slate-100 dark:bg-slate-800",
          isFullscreen
            ? "h-[calc(100vh-88px)]"
            : "h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]"
        )}
      >
        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900">
            <div className="text-center space-y-4 p-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  Unable to display PDF
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  The PDF could not be embedded. You can still download or open
                  it in a new tab.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleOpenExternal}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={fileName}
            onError={handleEmbedError}
          />
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
}
