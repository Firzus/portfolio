import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
  gsap.from("[data-reveal]", {
    autoAlpha: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out",
  });
}

const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-scene]");
if (canvas) {
  // Loaded on demand so three.js does not delay the first paint.
  void import("./scene").then(({ mountScene }) => mountScene(canvas, { animate: !reducedMotion }));
}
