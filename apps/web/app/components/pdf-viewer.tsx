type PdfViewerProps = {
  /** Same-origin URL of the PDF, rendered by the browser's built-in viewer. */
  src: string;
  /** Absolute URL of the same PDF, which Google's viewer fetches for the fallback. */
  absoluteSrc: string;
  title: string;
};

const viewerClass = "block h-[80vh] min-h-[32rem] w-full";

/**
 * Uses the browser's native PDF viewer via <object>. Browsers that can't display PDFs
 * inline (most mobile browsers) render the object's children instead, which embed
 * Google Docs Viewer.
 *
 * Google's viewer needs a publicly reachable URL, so the fallback can't load files
 * served from localhost during development.
 */
export function PdfViewer({ src, absoluteSrc, title }: PdfViewerProps) {
  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absoluteSrc)}`;

  return (
    <div className="overflow-hidden rounded-xl border bg-muted shadow-sm">
      <object
        // Open parameters honoured by most native viewers: no sidebar, fit to width.
        data={`${src}#navpanes=0&view=FitH`}
        type="application/pdf"
        title={title}
        aria-label={title}
        className={viewerClass}
        data-testid="pdf-viewer"
      >
        <iframe
          src={googleViewerUrl}
          title={title}
          className={`${viewerClass} border-0 bg-card`}
          data-testid="pdf-viewer-fallback"
        />
      </object>
    </div>
  );
}
