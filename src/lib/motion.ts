/** Whether the reader asked for reduced motion. Reads the browser: call it in effects only. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Whether the page is driven by a mouse or trackpad, which can hover and scroll finely. */
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let resolveLoader: () => void = () => {};

/**
 * Resolves once the loading screen is gone, or at once when it does not play. GPU work should
 * wait for it: compiling shaders blocks the main thread long enough to make the loader stutter.
 */
export const loaderDone = new Promise<void>((resolve) => (resolveLoader = resolve));
export const signalLoaderDone = () => resolveLoader();

/** Session key set once the loading screen has played, so later full page loads skip it. */
export const loaderPlayedKey = "loader-played";

/** Session key carrying the click point of a navigation to the next document. */
export const transitionOriginKey = "transition-origin";

/**
 * Runs in the head before the first paint, so the stylesheet knows at once whether scripts run,
 * whether the drop replaces the native scrollbar (adding it later shifts the page sideways), and
 * whether the loading screen already played this session, and the page transition starts from
 * where the previous page was clicked.
 */
export const headScript = `(function(){var d=document.documentElement;d.classList.add("js");if(matchMedia("(hover: hover) and (pointer: fine)").matches)d.classList.add("custom-scroll");try{if(sessionStorage.getItem("${loaderPlayedKey}"))d.classList.add("skip-loader");var o=JSON.parse(sessionStorage.getItem("${transitionOriginKey}")||"null");sessionStorage.removeItem("${transitionOriginKey}");if(o){d.style.setProperty("--vt-x",o.x+"px");d.style.setProperty("--vt-y",o.y+"px")}}catch(e){}})();`;
