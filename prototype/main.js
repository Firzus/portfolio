import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const styles = getComputedStyle(document.documentElement);
const token = (name) => styles.getPropertyValue(name).trim();

// Created only where the scroll scenes run (wide screens, motion allowed); elsewhere scrolling stays native.
let smoother = null;

/*
 * The design skill's scene checker (scenes.mjs) jumps through the page with
 * Stage.lenis.scrollTo and photographs two frames later; ScrollSmoother would
 * still be easing at that point. This adapter makes those jumps immediate.
 * Remove it with the prototype, once the page no longer goes through the checker.
 */
window.Stage = {
  lenis: {
    scrollTo(y) {
      if (smoother) {
        smoother.scrollTop(y);
        smoother.scrollTo(y, false);
        smoother.effects();
      }
      window.scrollTo(0, y);
      ScrollTrigger.update();
    },
  },
};

/* The room and its light control */

const room = document.querySelector('[data-slot="room"]');
const canvas = room.querySelector("canvas");
const lightInput = document.getElementById("light");
const lightValue = document.getElementById("light-value");
let roomControls = null;

try {
  const { createRoom } = await import("./scene.js");
  roomControls = createRoom(canvas, {
    lightColor: token("--color-light"),
    groundColor: token("--color-surface"),
    animate: !reduceMotion,
  });
  roomControls.setAngle(Number(lightInput.value));
  room.dataset.state = "live";

  lightInput.addEventListener("input", () => {
    lightValue.value = `${lightInput.value}°`;
    roomControls.setAngle(Number(lightInput.value));
  });

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) roomControls.start();
    else roomControls.stop();
  }).observe(room);

  if (finePointer && !reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      roomControls.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        -((event.clientY / window.innerHeight) * 2 - 1),
      );
    });
  }
} catch (error) {
  // Without WebGL the still photograph of the room stays and the light field stays hidden.
  console.warn("Room scene unavailable:", error);
}

/* Scroll scenes and the motion layer */

const hero = document.querySelector(".hero");
const showcase = document.querySelector(".showcase");
const stub = document.querySelector('[data-slot="stub"]');
const card = document.querySelector('[data-slot="card"]');

const media = gsap.matchMedia();

media.add(
  {
    desktop: "(min-width: 1100px)",
    // Always true, so the callback also runs where neither of the other conditions holds.
    any: "all",
    reduce: "(prefers-reduced-motion: reduce)",
  },
  ({ conditions }) => {
    const { desktop, reduce } = conditions;
    const live = desktop && !reduce;

    // The previous run's smoother, if any, was killed when its media context reverted.
    smoother = null;
    if (live) {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1,
        smoothTouch: false,
      });
    }

    hero.classList.toggle("is-live", live);
    hero.classList.toggle("is-rest", !live);
    showcase.classList.toggle("is-live", live);
    showcase.classList.toggle("is-rest", !live);

    if (live) {
      // The stub takes over from the shrunken card, and steps aside where the contact
      // section and the footer already show the name and the e-mail address.
      let pastHero = false;
      let atContact = false;
      const showStub = () => (stub.dataset.state = pastHero && !atContact ? "shown" : "hidden");
      ScrollTrigger.create({
        trigger: hero,
        start: "top -90%",
        end: "max",
        onToggle: (self) => ((pastHero = self.isActive), showStub()),
      });
      ScrollTrigger.create({
        trigger: ".contact",
        start: "top bottom",
        end: "max",
        onToggle: (self) => ((atContact = self.isActive), showStub()),
      });

      // Hero: the card shrinks towards the bottom-left corner while the camera walks into the room.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=100%",
            pin: ".hero__stage",
            scrub: true,
            onUpdate: (self) => roomControls?.setProgress(self.progress),
          },
        })
        .to(
          card,
          {
            scale: 0.3,
            x: () => -card.offsetLeft + 24,
            y: () => window.innerHeight - card.offsetTop - card.offsetHeight - 24,
            ease: "none",
          },
          0,
        )
        .to(card, { autoAlpha: 0, duration: 0.15, ease: "none" }, 0.85);

      // Showcase: the map is held while the four cards cross it from right to left.
      const track = showcase.querySelector(".showcase__track");
      const title = showcase.querySelector(".showcase__title");
      const distance = () =>
        track.scrollWidth - window.innerWidth * 0.5 - track.lastElementChild.offsetWidth / 2;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: showcase,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.5}`,
            pin: ".showcase__stage",
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(track, { x: () => -distance(), ease: "none", duration: 1 }, 0)
        .to(title, { xPercent: -40, autoAlpha: 0, ease: "none", duration: 0.12 }, 0.02)
        .fromTo(
          showcase.querySelector(".showcase__ground img"),
          { scale: 1.12 },
          { scale: 1, ease: "none", duration: 1 },
          0,
        );
    }

    if (reduce) return;

    // A slow scroll-linked drift on each project picture: the moving picture of the page.
    gsap.utils.toArray(".plate").forEach((plate) => {
      gsap.fromTo(
        plate.querySelector(".plate__img"),
        { scale: 1.3, yPercent: -4 },
        {
          scale: 1.12,
          yPercent: 4,
          ease: "none",
          scrollTrigger: { trigger: plate, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      gsap.from(plate.querySelectorAll(".plate__kind, .plate__title, .plate__fact, .plate__desc"), {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: plate, start: "top 70%", once: true },
      });
    });

    // Entrance for the parts of each quiet section: heading, then text, then picture.
    gsap.utils.toArray(".intro, .about, .contact").forEach((section) => {
      gsap.from(section.querySelectorAll("[data-reveal]"), {
        y: 28,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 80%", once: true },
      });
    });

    if (!live) {
      gsap.utils.toArray(".piece").forEach((piece) => {
        gsap.from(piece, {
          y: 32,
          autoAlpha: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: piece, start: "top 85%", once: true },
        });
      });
    }

    // First screen: the card's parts arrive in order, already readable within a second.
    gsap.from(card.children, {
      y: 16,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.1,
    });
  },
);

// Images load lazily and the web font changes text widths: both move every trigger.
window.addEventListener("load", () => ScrollTrigger.refresh());
void document.fonts?.ready.then(() => ScrollTrigger.refresh());
