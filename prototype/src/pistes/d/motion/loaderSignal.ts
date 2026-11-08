/**
 * Resolves once the loading screen is gone, or at once when it does not play. GPU work waits for
 * it: compiling the shaders blocks the main thread long enough to make the loader stutter.
 */
let resolve: () => void = () => {};
export const loaderDone = new Promise<void>((r) => (resolve = r));
export const signalLoaderDone = () => resolve();
