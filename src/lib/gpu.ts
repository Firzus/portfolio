/**
 * Best-effort detection of GPU rendering support (WebGPU or WebGL2/1).
 * Runs only in the browser; returns `false` on the server. Used to decide
 * whether to mount the signature shader or fall back to a static visual.
 */
export function supportsGpuRendering(): boolean {
  if (typeof window === "undefined") return false;

  if ("gpu" in navigator) return true;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return gl != null;
  } catch {
    return false;
  }
}
