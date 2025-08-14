"use client";

// Minimal PDF viewer: fullscreen toggle + embedded object with graceful fallback.

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFViewerProps {
  url: string;
  className?: string;
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const src = url;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  // Track native fullscreen changes (user may press ESC)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-end mb-3 md:mb-4">
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-400 transition-colors rounded-full"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </>
          )}
        </Button>
      </div>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md transition-all duration-300",
          isFullscreen && "h-screen rounded-none"
        )}
      >
        {/* Primary embed */}
        {!embedFailed && (
          <object
            data={src}
            type="application/pdf"
            className="w-full h-full min-h-[500px] md:min-h-[700px]"
            aria-label="PDF Document"
            onError={() => setEmbedFailed(true)}
          >
            {/* Fallback will render below if object unsupported */}
          </object>
        )}
        {/* Fallback (or if object errors) using Google viewer */}
        {embedFailed && (
          <iframe
            src={`https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
              src
            )}`}
            className="w-full h-full min-h-[500px] md:min-h-[700px]"
            title="PDF Document"
          />
        )}
      </div>
    </div>
  );
}
