/**
 * Minimal shape of the HTTP response object used by the static file server to
 * set headers. Matches both Express `Response` and Node's `ServerResponse`.
 */
interface ResponseWithSetHeader {
  setHeader(name: string, value: string): void;
}

/**
 * Marks statically served uploads (`/uploads`) as embeddable from other
 * origins.
 *
 * helmet applies `Cross-Origin-Resource-Policy: same-origin` to every API
 * response by default (ADR-023). That default silently broke course
 * thumbnails: the UI runs on a different origin than the API, so the browser
 * refused to render `<img>` tags pointing at `/uploads/...` while direct
 * navigation to the same URL kept working. Overriding CORP to `cross-origin`
 * only for uploaded assets restores embedding without loosening the header on
 * the rest of the API. See issue #76.
 */
export function setUploadsCrossOriginHeaders(res: ResponseWithSetHeader): void {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
}
