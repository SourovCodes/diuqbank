import { Download, ExternalLink, FileText } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";

type PdfViewerProps = {
  /** Same-origin URL of the PDF, rendered by the browser's built-in viewer. */
  src: string;
  title: string;
};

/**
 * Uses the browser's native PDF viewer via <object>. Browsers that can't display PDFs
 * inline (most mobile browsers) render the object's children instead: links to open
 * or download the file.
 */
export function PdfViewer({ src, title }: PdfViewerProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-muted shadow-xs">
      <object
        // Open parameters honoured by most native viewers: no sidebar, fit to width.
        data={`${src}#navpanes=0&view=FitH`}
        type="application/pdf"
        title={title}
        aria-label={title}
        className="block h-[80vh] min-h-[32rem] w-full"
        data-testid="pdf-viewer"
      >
        <div
          className="flex h-full flex-col items-center justify-center gap-4 bg-card p-6 text-center"
          data-testid="pdf-viewer-fallback"
        >
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <FileText className="size-6" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="font-medium">This browser can’t show the PDF here</p>
            <p className="text-sm text-muted-foreground">
              Open it in a new tab or download it instead.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={src}
              target="_blank"
              rel="noopener"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ExternalLink aria-hidden />
              Open in new tab
            </a>
            <a href={src} download className={buttonVariants({ size: "sm" })}>
              <Download aria-hidden />
              Download
            </a>
          </div>
        </div>
      </object>
    </div>
  );
}
