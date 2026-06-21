/**
 * Best-effort detection of GPU rendering support (WebGPU or WebGL2/1).
 * Runs only in the browser; returns `false` on the server. Used to decide
 * whether to mount the signature shader or fall back to a static visual.
 */
export function supportsGpuRendering(): boolean {
  if (typeof window === "undefined") return false;

  // `"gpu" in navigator` only signals the API exists, not that a usable adapter
  // is available (blocklisted drivers still expose it). A definitive check needs
  // the async `navigator.gpu.requestAdapter()`, which would break this sync
  // gate; WebGL below is the real fallback path, so this optimistic check is OK.
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

interface LowPowerNavigator extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * Coarse heuristic for devices where running a continuous WebGL shader is not
 * worth the battery/jank: Data Saver on, low memory, few logical cores, or a
 * small (phone-sized) viewport. GPU support alone (most phones report WebGL)
 * isn't enough of a signal, so we gate the shader on this too.
 */
export function prefersLightweightVisual(): boolean {
  if (typeof window === "undefined") return true;

  const nav = navigator as LowPowerNavigator;
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  if (window.matchMedia("(max-width: 768px)").matches) return true;

  return false;
}
