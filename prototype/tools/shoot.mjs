// Captures a URL to an image with the design skill's headless Chrome client.
// Usage: node prototype/tools/shoot.mjs <url> <out.jpg> [width] [height] [settleMs] [--reduced] [--hide=<css selector>]
import { Browser } from "../../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs";

const [url, out, w = "1600", h = "1000", settle = "3000"] = process.argv.slice(2);
const reducedMotion = process.argv.includes("--reduced");
const browser = await Browser.launch({ width: +w, height: +h });
try {
  const page = await browser.newPage({ width: +w, height: +h, reducedMotion });
  await page.goto(url, { settleMs: +settle });
  const hide = process.argv.find((a) => a.startsWith("--hide="))?.slice(7);
  // Consent banners cover the page; hiding them leaves every choice unanswered.
  if (hide)
    await page.eval(
      `document.querySelectorAll(${JSON.stringify(hide)}).forEach((el) => el.remove()); document.documentElement.style.overflow = document.body.style.overflow = "auto";`,
    );
  await page.screenshot({ path: out, format: out.endsWith(".png") ? "png" : "jpeg", quality: 86 });
  console.log("saved", out);
} finally {
  await browser.close();
}
