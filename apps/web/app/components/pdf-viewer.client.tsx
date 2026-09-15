// Client-only: pdf.js needs the DOM, so this module is never loaded during SSR.
import { Minus, Plus } from "lucide-react";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const DEFAULT_ZOOM_INDEX = 2;
// A4 height / width, used for placeholders before a page has rendered.
const PAGE_RATIO = 1.414;

export default function PdfViewer({ url }: { url: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number>();
  const [numPages, setNumPages] = useState(0);
  const [failed, setFailed] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  // Fit pages to the viewer width, re-measuring when the layout changes.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setAvailableWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const zoom = ZOOM_STEPS[zoomIndex] ?? 1;
  const pageWidth = availableWidth
    ? Math.floor(availableWidth * zoom)
    : undefined;
  const placeholder = (
    <Skeleton
      className="rounded-sm"
      style={{
        width: pageWidth ?? "100%",
        height: pageWidth ? pageWidth * PAGE_RATIO : 600,
      }}
    />
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex h-11 items-center justify-between gap-2 border-b px-3 text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {failed
            ? "Preview unavailable"
            : numPages
              ? `${numPages} ${numPages === 1 ? "page" : "pages"}`
              : "Loading…"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom out"
            disabled={zoomIndex === 0 || failed}
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          >
            <Minus />
          </Button>
          <button
            type="button"
            className="w-12 rounded-md text-center text-xs text-muted-foreground tabular-nums hover:text-foreground"
            aria-label="Reset zoom"
            onClick={() => setZoomIndex(DEFAULT_ZOOM_INDEX)}
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Zoom in"
            disabled={zoomIndex === ZOOM_STEPS.length - 1 || failed}
            onClick={() =>
              setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
            }
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="h-[75vh] min-h-[28rem] overflow-auto bg-muted/50 p-3 sm:p-6"
        data-testid="pdf-viewer"
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={() => setFailed(true)}
          loading={placeholder}
          error={
            <p className="py-24 text-center text-sm text-muted-foreground">
              This PDF couldn’t be previewed. Use “Open in new tab” instead.
            </p>
          }
          className="mx-auto flex w-fit flex-col items-center gap-4"
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page
              key={index}
              pageNumber={index + 1}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={placeholder}
              className="overflow-hidden rounded-sm bg-white shadow-md"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
