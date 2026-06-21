export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme";

/*
  Inline script injected before paint to avoid FOUC.
  Resolves theme from localStorage, falling back to the OS preference,
  then sets the `.dark` class and `color-scheme` on <html> synchronously.
  Kept dependency-free and minified-friendly so it runs as early as possible.
*/
export const themeInitScript = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var m=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s==="dark"||s==="light"?s:(m?"dark":"light");var e=document.documentElement;e.classList.toggle("dark",t==="dark");e.style.colorScheme=t;}catch(_){}})();`;
