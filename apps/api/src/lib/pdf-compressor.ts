// Client for the PDF processor API (pdf-processor.diuqbank.com).

export type Fetcher = typeof fetch;

/**
 * Compresses a PDF with Ghostscript's ebook preset. Returns null when the service
 * fails or doesn't make the file smaller: compression only cuts AI cost, so callers
 * carry on with the original.
 */
export async function compressPdf(
  pdf: Uint8Array<ArrayBuffer>,
  options: { url: string; apiKey: string; fetch?: Fetcher },
): Promise<Uint8Array<ArrayBuffer> | null> {
  const body = new FormData();
  body.append("pdf", new File([pdf], "paper.pdf", { type: "application/pdf" }));
  try {
    const res = await (options.fetch ?? fetch)(
      new URL("/api/pdfs/compress", options.url),
      {
        method: "POST",
        headers: { "X-API-Key": options.apiKey },
        body,
        signal: AbortSignal.timeout(60_000),
      },
    );
    if (!res.ok) {
      console.warn(
        `PDF compression failed: ${res.status} ${await res.text().catch(() => "")}`,
      );
      return null;
    }
    const compressed = new Uint8Array(await res.arrayBuffer());
    return compressed.byteLength < pdf.byteLength ? compressed : null;
  } catch (err) {
    console.warn("PDF compression failed", err);
    return null;
  }
}
