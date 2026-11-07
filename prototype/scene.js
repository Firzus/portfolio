// The two worlds of the journey, modelled in code so no model file is sent to
// the browser: the night room with the boy at his desk, and the virtual
// gallery where each project hangs as a large screen under a column of light.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { gsap } from "gsap";

const CYAN = new THREE.Color("#5fe3ea");
const CITY = new THREE.Color("#4aa8ff");
const WARM = new THREE.Color("#ffb46b");

const PANEL_W = 6.4;
const PANEL_H = 4;
const PANEL_GAP = 9;
const PANEL_Y = 2.6;

/** Throws when WebGL is unavailable, so the caller can keep the 2D stills. */
export async function createWorld(
  canvas,
  { images, reduced = false, lowPower = false, onProgress = () => {} },
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 200);
  const room = buildRoom();
  onProgress(0.35);
  const textures = await loadTextures(images, (p) => onProgress(0.35 + p * 0.5));
  const gallery = buildGallery(textures, lowPower);
  onProgress(0.9);

  const headset = buildHeadset();
  headset.visible = false;
  camera.add(headset);
  room.scene.add(camera);

  let active = room.scene;
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(active, camera);
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.6, 0.82);
  if (!lowPower) composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const look = new THREE.Vector3();
  const view = { pos: new THREE.Vector3(), target: new THREE.Vector3() };
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let focus = 0;
  let mode = "room";
  let portrait = false;

  function roomShot() {
    return portrait
      ? {
          pos: new THREE.Vector3(-1.85, 1.75, 1.55),
          target: new THREE.Vector3(0.15, 0.9, -1.15),
          fov: 50,
        }
      : {
          pos: new THREE.Vector3(-2.0, 1.6, 0.9),
          target: new THREE.Vector3(0.25, 0.95, -1.2),
          fov: 42,
        };
  }
  // Boy's eyes, looking at his screen.
  const eyeShot = {
    pos: new THREE.Vector3(0.02, 1.2, -0.86),
    target: new THREE.Vector3(0.02, 1.08, -1.7),
    fov: 52,
  };

  function galleryShot(i) {
    const x = (i - 1) * PANEL_GAP;
    const aspect = camera.aspect;
    const fov = 40;
    const half = THREE.MathUtils.degToRad(fov / 2);
    // Fit the screen's width on narrow viewports and its height on wide ones.
    const byHeight = (PANEL_H * 0.5 + 1.7) / Math.tan(half);
    const byWidth = (PANEL_W * 0.5 + 0.6) / (Math.tan(half) * aspect);
    const d = Math.max(byHeight, byWidth);
    // Aim below the screen so it sits in the upper part, clear of the project name.
    return {
      pos: new THREE.Vector3(x, PANEL_Y - 0.2, d),
      target: new THREE.Vector3(x, PANEL_Y - 0.9, 0),
      fov,
    };
  }

  function applyShot(shot) {
    view.pos.copy(shot.pos);
    view.target.copy(shot.target);
    camera.fov = shot.fov;
    camera.updateProjectionMatrix();
  }

  function tweenShot(shot, duration, ease = "power2.inOut") {
    const from = { ...view.pos },
      fromT = { ...view.target };
    const state = { t: 0, fov: camera.fov };
    return gsap.to(state, {
      t: 1,
      fov: shot.fov,
      duration,
      ease,
      onUpdate() {
        view.pos.set(from.x, from.y, from.z).lerp(shot.pos, state.t);
        view.target.set(fromT.x, fromT.y, fromT.z).lerp(shot.target, state.t);
        camera.fov = state.fov;
        camera.updateProjectionMatrix();
      },
    });
  }

  function setScene(next) {
    active = next === "gallery" ? gallery.scene : room.scene;
    active.add(camera);
    renderPass.scene = active;
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    const wasPortrait = portrait;
    portrait = camera.aspect < 0.95;
    camera.updateProjectionMatrix();
    if (mode === "room" && (wasPortrait !== portrait || view.pos.lengthSq() === 0))
      applyShot(roomShot());
    if (mode === "gallery") applyShot(galleryShot(focus));
  }

  const timer = new THREE.Timer();
  let running = true;
  let frame = 0;
  function tick() {
    frame = requestAnimationFrame(tick);
    if (!running) return;
    timer.update();
    const t = timer.getElapsed();
    pointer.sx += (pointer.x - pointer.sx) * 0.04;
    pointer.sy += (pointer.y - pointer.sy) * 0.04;
    const drift = reduced ? 0 : 1;
    camera.position.copy(view.pos);
    camera.position.x += pointer.sx * 0.12 * drift;
    camera.position.y += pointer.sy * 0.06 * drift;
    look.copy(view.target);
    camera.lookAt(look);
    if (active === room.scene) room.update(t, drift);
    else gallery.update(t, drift);
    composer.render();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  applyShot(roomShot());
  tick();
  onProgress(1);

  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
  });

  return {
    get mode() {
      return mode;
    },
    pause(paused) {
      running = !paused;
    },
    /** Jumps to a state without animation (reduced motion, direct links). */
    show(next, index = focus) {
      mode = next;
      focus = index;
      headset.visible = false;
      room.boy.visible = true;
      room.deskHeadset.visible = true;
      setScene(next);
      applyShot(next === "gallery" ? galleryShot(index) : roomShot());
      gallery.setFocus(index, true);
    },
    /** Room → the boy's eyes → the headset comes down over the camera. Resolves on black. */
    putOn() {
      const tl = gsap.timeline();
      tl.add(tweenShot(eyeShot, 1.7, "power3.inOut"));
      tl.call(
        () => {
          room.boy.visible = false;
          room.deskHeadset.visible = false;
        },
        [],
        1.25,
      );
      tl.call(
        () => {
          headset.visible = true;
          headset.position.set(0, 0.42, -0.32);
          headset.rotation.set(-0.6, 0, 0);
        },
        [],
        1.35,
      );
      tl.to(headset.position, { y: 0, z: -0.12, duration: 0.85, ease: "power2.in" }, 1.4);
      tl.to(headset.rotation, { x: 0, duration: 0.85, ease: "power2.out" }, 1.4);
      return tl.then();
    },
    /** Called on black: the gallery appears and the camera flies to the focused screen. */
    enterGallery(index = focus) {
      mode = "gallery";
      focus = index;
      headset.visible = false;
      setScene("gallery");
      gallery.setFocus(index, true);
      const end = galleryShot(index);
      applyShot({
        pos: end.pos.clone().add(new THREE.Vector3(0, 1.6, 9)),
        target: end.target.clone().add(new THREE.Vector3(0, 0.6, 0)),
        fov: 55,
      });
      return tweenShot(end, 1.8, "power3.out").then();
    },
    /** Called on black: back in the room behind the headset, which lifts away. */
    takeOff() {
      mode = "room";
      setScene("room");
      applyShot(eyeShot);
      headset.visible = true;
      headset.position.set(0, 0, -0.12);
      headset.rotation.set(0, 0, 0);
      const tl = gsap.timeline();
      tl.to(headset.position, { y: 0.5, z: -0.3, duration: 0.8, ease: "power2.inOut" }, 0.1);
      tl.to(headset.rotation, { x: -0.7, duration: 0.8, ease: "power2.inOut" }, 0.1);
      tl.call(
        () => {
          headset.visible = false;
        },
        [],
        0.85,
      );
      tl.call(
        () => {
          room.boy.visible = true;
          room.deskHeadset.visible = true;
        },
        [],
        1.3,
      );
      tl.add(tweenShot(roomShot(), 1.6, "power3.inOut"), 0.6);
      return tl.then();
    },
    focusProject(index, instant = false) {
      focus = index;
      gallery.setFocus(index, instant);
      if (mode !== "gallery") return Promise.resolve();
      if (instant) {
        applyShot(galleryShot(index));
        return Promise.resolve();
      }
      return tweenShot(galleryShot(index), 1.2, "power3.inOut").then();
    },
    /** Close-up of the desk, used to render the contact picture. */
    frameDesk() {
      applyShot({
        pos: new THREE.Vector3(0.75, 1.25, -0.95),
        target: new THREE.Vector3(0.3, 0.95, -1.6),
        fov: 45,
      });
    },
    snapshot(type = "image/jpeg", quality = 0.9) {
      composer.render();
      return canvas.toDataURL(type, quality);
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
    },
  };
}

function loadTextures(urls, onProgress) {
  const loader = new THREE.TextureLoader();
  let done = 0;
  return Promise.all(
    urls.map(
      (url) =>
        new Promise((resolve) => {
          loader.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = 8;
              onProgress(++done / urls.length);
              resolve(tex);
            },
            undefined,
            () => {
              onProgress(++done / urls.length);
              resolve(null);
            },
          );
        }),
    ),
  );
}

/* Light volumes: an open cone whose glow fades along its length and at its edges. */
function beamMaterial(color, strength = 0.35) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color.clone() },
      uStrength: { value: strength },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float edge = pow(abs(dot(vNormal, vView)), 2.2);
        float along = pow(vUv.y, 1.6) * smoothstep(0.0, 0.35, vUv.y);
        float shimmer = 0.85 + 0.15 * sin(vUv.x * 40.0 + uTime * 0.6);
        gl_FragColor = vec4(uColor * edge * along * uStrength * shimmer, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

function beam(from, to, radiusTop, radiusBottom, color, strength) {
  const dir = new THREE.Vector3().subVectors(from, to);
  const length = dir.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 48, 1, true),
    beamMaterial(color, strength),
  );
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return mesh;
}

function dust(count, box, color, size) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = box.min.x + Math.random() * (box.max.x - box.min.x);
    positions[i * 3 + 1] = box.min.y + Math.random() * (box.max.y - box.min.y);
    positions[i * 3 + 2] = box.min.z + Math.random() * (box.max.z - box.min.z);
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  points.userData = { base: positions.slice(), seeds, box };
  return points;
}

function driftDust(points, t, speed) {
  const { base, seeds, box } = points.userData;
  const pos = points.geometry.attributes.position.array;
  const height = box.max.y - box.min.y;
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    pos[i * 3] = base[i * 3] + Math.sin(t * 0.2 + s * 20) * 0.05;
    pos[i * 3 + 1] = box.min.y + ((base[i * 3 + 1] - box.min.y + t * speed * (0.3 + s)) % height);
    pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.17 + s * 13) * 0.05;
  }
  points.geometry.attributes.position.needsUpdate = true;
}

function std(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });
}

function box(w, h, d, material, x, y, z, { cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function limb(radius, from, to, material) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(dir.length() - radius * 2, 0.01), 6, 16),
    material,
  );
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* A screen that shows an editor at work, drawn once into a texture. */
function screenTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 600;
  const g = c.getContext("2d");
  g.fillStyle = "#0b131b";
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "#101c27";
  g.fillRect(0, 0, 200, c.height);
  g.fillStyle = "#16303a";
  g.fillRect(620, 40, 380, 300);
  g.fillStyle = "#5fe3ea";
  g.fillRect(660, 220, 90, 90);
  g.fillStyle = "#2a6f86";
  g.fillRect(780, 150, 160, 160);
  const colours = ["#5fe3ea", "#c8d3dc", "#7d8b97", "#f2b56b", "#c8d3dc"];
  let y = 40;
  for (let i = 0; i < 26; i++) {
    const indent = 230 + ((i * 7) % 4) * 26;
    let x = indent;
    const words = 2 + ((i * 5) % 5);
    for (let w = 0; w < words && x < 600; w++) {
      const len = 30 + ((i * 13 + w * 29) % 90);
      g.fillStyle = colours[(i + w) % colours.length];
      g.globalAlpha = 0.85;
      g.fillRect(x, y, Math.min(len, 600 - x), 9);
      x += len + 14;
    }
    y += 21;
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function buildRoom() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#06090d");
  scene.fog = new THREE.FogExp2("#06090d", 0.09);

  const wall = std("#1b232c");
  const floorMat = std("#17130f", { roughness: 0.7 });
  const wood = std("#2a2119", { roughness: 0.6 });
  const metal = std("#20262c", { roughness: 0.4, metalness: 0.6 });
  const plastic = std("#121519", { roughness: 0.5 });

  // Shell: floor, back wall, left wall, right wall with a window opening.
  scene.add(box(6, 0.1, 6, floorMat, 0, -0.05, 0, { cast: false }));
  scene.add(box(6, 2.8, 0.1, wall, 0, 1.4, -2.05, { cast: false }));
  scene.add(box(0.1, 2.8, 6, wall, -2.4, 1.4, 0, { cast: false }));
  scene.add(box(6, 0.1, 6, wall, 0, 2.85, 0, { cast: false }));
  const wx = 2.05,
    wy0 = 0.95,
    wy1 = 2.25,
    wz0 = -1.5,
    wz1 = 0.2;
  scene.add(box(0.1, wy0, 6, wall, wx, wy0 / 2, 0, { cast: false }));
  scene.add(box(0.1, 2.8 - wy1, 6, wall, wx, (wy1 + 2.8) / 2, 0, { cast: false }));
  scene.add(
    box(0.1, wy1 - wy0, 3 + wz0, wall, wx, (wy0 + wy1) / 2, (-3 + wz0) / 2, { cast: false }),
  );
  scene.add(
    box(0.1, wy1 - wy0, 3 - wz1, wall, wx, (wy0 + wy1) / 2, (3 + wz1) / 2, { cast: false }),
  );

  // Blinds: the slats cut the city light into bands across the room.
  const slat = std("#3a434c", { roughness: 0.5 });
  for (let y = wy0 + 0.04; y < wy1; y += 0.085) {
    const s = box(0.05, 0.035, wz1 - wz0, slat, wx - 0.08, y, (wz0 + wz1) / 2);
    s.rotation.z = 0.5;
    scene.add(s);
  }

  // Desk, monitor, keyboard, lamp and the headset waiting on the desk.
  const desk = new THREE.Group();
  desk.add(box(1.6, 0.05, 0.75, wood, 0.1, 0.74, -1.62));
  for (const [x, z] of [
    [-0.62, -1.3],
    [0.82, -1.3],
    [-0.62, -1.95],
    [0.82, -1.95],
  ])
    desk.add(box(0.05, 0.72, 0.05, metal, x, 0.36, z));
  desk.add(box(0.08, 0.28, 0.06, metal, 0.02, 0.9, -1.88));
  desk.add(box(0.28, 0.02, 0.18, metal, 0.02, 0.775, -1.86));
  desk.add(box(0.92, 0.54, 0.04, plastic, 0.02, 1.18, -1.86));
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.88, 0.5),
    new THREE.MeshBasicMaterial({ map: screenTexture(), toneMapped: false }),
  );
  screen.position.set(0.02, 1.18, -1.837);
  desk.add(screen);
  desk.add(box(0.46, 0.02, 0.15, plastic, -0.02, 0.775, -1.42));
  desk.add(box(0.07, 0.025, 0.11, plastic, 0.32, 0.775, -1.42));
  // Lamp on the left of the desk.
  desk.add(box(0.14, 0.02, 0.14, metal, -0.55, 0.775, -1.8));
  desk.add(
    limb(0.012, new THREE.Vector3(-0.55, 0.78, -1.8), new THREE.Vector3(-0.5, 1.15, -1.72), metal),
  );
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.12, 24, 1, true),
    std("#2a2f35", { side: THREE.DoubleSide }),
  );
  shade.position.set(-0.46, 1.12, -1.66);
  shade.rotation.x = 0.5;
  desk.add(shade);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.025, 12, 12),
    new THREE.MeshBasicMaterial({ color: WARM, toneMapped: false }),
  );
  bulb.position.set(-0.46, 1.08, -1.64);
  desk.add(bulb);
  const headsetOnDesk = buildHeadset(true);
  headsetOnDesk.position.set(-0.32, 0.83, -1.38);
  headsetOnDesk.rotation.set(0, 0.5, 0);
  headsetOnDesk.scale.setScalar(0.9);
  desk.add(headsetOnDesk);
  scene.add(desk);

  // Shelf with boxes and a game box on the back wall.
  scene.add(box(1.1, 0.03, 0.22, wood, -1.3, 1.75, -1.92));
  scene.add(box(0.2, 0.26, 0.16, std("#24323d"), -1.65, 1.9, -1.9));
  scene.add(box(0.14, 0.2, 0.16, std("#3a2a22"), -1.42, 1.87, -1.9));
  scene.add(box(0.36, 0.1, 0.18, std("#1f2a30"), -1.05, 1.82, -1.9));
  // Bed edge on the left, in the shadow.
  scene.add(box(1.0, 0.42, 2.0, std("#1d2630"), -1.85, 0.21, 0.6));
  scene.add(box(0.95, 0.12, 1.9, std("#2b3742"), -1.85, 0.47, 0.6));

  // Chair.
  const chair = new THREE.Group();
  chair.add(box(0.5, 0.07, 0.48, plastic, 0, 0.5, -0.78));
  const back = box(0.44, 0.34, 0.05, plastic, 0, 0.74, -0.52);
  back.rotation.x = -0.12;
  chair.add(back);
  chair.add(
    limb(0.025, new THREE.Vector3(0, 0.08, -0.78), new THREE.Vector3(0, 0.47, -0.78), metal),
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    chair.add(
      limb(
        0.018,
        new THREE.Vector3(0, 0.08, -0.78),
        new THREE.Vector3(Math.cos(a) * 0.3, 0.04, -0.78 + Math.sin(a) * 0.3),
        metal,
      ),
    );
  }
  scene.add(chair);

  const boy = buildBoy();
  scene.add(boy);

  // Light: the city through the blinds, the screen on the boy, a warm lamp, a little sky.
  scene.add(new THREE.HemisphereLight("#2a4660", "#0b0806", 0.35));
  const city = new THREE.SpotLight(CITY, 90, 12, 0.5, 0.9, 1.4);
  city.position.set(4.6, 3.1, -0.55);
  city.target.position.set(0.2, 0.2, -0.4);
  city.castShadow = true;
  city.shadow.mapSize.set(2048, 2048);
  city.shadow.bias = -0.0008;
  city.shadow.radius = 3;
  scene.add(city, city.target);
  const screenLight = new THREE.PointLight("#9fdcff", 2.4, 2.6, 1.6);
  screenLight.position.set(0.02, 1.2, -1.5);
  scene.add(screenLight);
  const lamp = new THREE.PointLight(WARM, 1.6, 2.4, 1.8);
  lamp.position.set(-0.46, 1.02, -1.6);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(512, 512);
  scene.add(lamp);
  const rim = new THREE.PointLight(CYAN, 1.2, 3, 2);
  rim.position.set(0.9, 1.6, -0.2);
  scene.add(rim);

  const shaft = beam(
    new THREE.Vector3(2.1, 1.65, -0.65),
    new THREE.Vector3(0.5, 0.0, -0.3),
    0.6,
    1.1,
    CITY,
    0.22,
  );
  scene.add(shaft);
  const motes = dust(
    90,
    new THREE.Box3(new THREE.Vector3(0.6, 0.3, -1.2), new THREE.Vector3(1.9, 1.9, 0.2)),
    "#a8d8ff",
    0.007,
  );
  scene.add(motes);

  return {
    scene,
    boy,
    deskHeadset: headsetOnDesk,
    update(t, drift) {
      shaft.material.uniforms.uTime.value = t;
      if (drift) driftDust(motes, t, 0.03);
      boy.userData.breathe(t * drift);
    },
  };
}

/* The boy: an original character, seen from behind at his desk, in a dark hoodie. */
function buildBoy() {
  const boy = new THREE.Group();
  const hoodie = std("#26343f", { roughness: 0.95 });
  const trousers = std("#1a1e24", { roughness: 0.9 });
  const skin = std("#c49578", { roughness: 0.7 });
  const hair = std("#1b1410", { roughness: 0.95 });
  const shoe = std("#d9dde0", { roughness: 0.6 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const torso = new THREE.Group();
  torso.add(limb(0.17, V(0, 0.6, -0.72), V(0, 1.0, -0.8), hoodie));
  const shoulders = limb(0.11, V(-0.17, 0.98, -0.8), V(0.17, 0.98, -0.8), hoodie);
  torso.add(shoulders);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), hoodie);
  hood.scale.set(1.2, 0.55, 0.7);
  hood.position.set(0, 1.03, -0.7);
  torso.add(hood);
  torso.add(limb(0.045, V(0, 1.04, -0.82), V(0, 1.12, -0.86), skin));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 20), skin);
  head.scale.set(0.95, 1.08, 1);
  head.position.set(0, 1.21, -0.88);
  head.castShadow = true;
  torso.add(head);
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.113, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hair,
  );
  hairCap.position.set(0, 1.225, -0.872);
  hairCap.rotation.x = 0.35;
  hairCap.castShadow = true;
  torso.add(hairCap);
  for (let i = 0; i < 7; i++) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 6), hair);
    const a = (i / 7) * Math.PI * 1.4 - 0.7;
    tuft.position.set(Math.sin(a) * 0.07, 1.3, -0.85 + Math.cos(a) * 0.05);
    tuft.rotation.set(-0.6 + Math.random() * 0.3, 0, Math.sin(a) * 0.6);
    torso.add(tuft);
  }
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), skin);
    ear.position.set(side * 0.1, 1.2, -0.87);
    torso.add(ear);
    // Arms reach to the keyboard.
    torso.add(limb(0.055, V(side * 0.2, 0.97, -0.8), V(side * 0.22, 0.72, -1.0), hoodie));
    torso.add(limb(0.05, V(side * 0.22, 0.72, -1.0), V(side * 0.14, 0.8, -1.36), hoodie));
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), skin);
    hand.scale.set(1, 0.6, 1.3);
    hand.position.set(side * 0.13, 0.8, -1.4);
    torso.add(hand);
  }
  boy.add(torso);
  for (const side of [-1, 1]) {
    boy.add(limb(0.075, V(side * 0.1, 0.58, -0.72), V(side * 0.12, 0.58, -1.12), trousers));
    boy.add(limb(0.065, V(side * 0.12, 0.58, -1.12), V(side * 0.14, 0.1, -1.1), trousers));
    boy.add(box(0.1, 0.08, 0.24, shoe, side * 0.14, 0.04, -1.16));
  }
  boy.userData.breathe = (t) => {
    torso.position.y = Math.sin(t * 1.6) * 0.004;
    torso.rotation.x = Math.sin(t * 1.6) * 0.004;
  };
  return boy;
}

/* The headset: a rounded visor with a strap and a thin cyan line of light. */
function buildHeadset(onDesk = false) {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 0.11, 0.1, 4, 0.035),
    std("#aab1b8", { roughness: 0.45 }),
  );
  shell.castShadow = true;
  group.add(shell);
  const face = new THREE.Mesh(
    new RoundedBoxGeometry(0.2, 0.09, 0.02, 3, 0.02),
    std("#08090b", { roughness: 0.15, metalness: 0.3 }),
  );
  face.position.z = 0.05;
  group.add(face);
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.006, 0.004),
    new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }),
  );
  line.position.set(0, -0.025, 0.062);
  group.add(line);
  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(0.11, 0.012, 8, 32, Math.PI),
    std("#2a3036"),
  );
  strap.rotation.set(onDesk ? Math.PI / 2 : -Math.PI / 2, 0, 0);
  strap.position.z = -0.05;
  group.add(strap);
  if (!onDesk) {
    // Worn: faces the camera, close enough to fill the view as it comes down.
    group.rotation.y = Math.PI;
    group.scale.setScalar(1.4);
  }
  return group;
}

function buildGallery(textures, lowPower) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#03070a");
  scene.fog = new THREE.FogExp2("#03070a", 0.035);

  // Floor: a dark plane with a fine light grid that fades into the fog.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: CYAN.clone() }, uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec3 vWorld;
        void main() {
          vec2 g = abs(fract(vWorld.xz * 0.5) - 0.5) / fwidth(vWorld.xz * 0.5);
          float line = 1.0 - min(min(g.x, g.y), 1.0);
          float fade = exp(-length(vWorld.xz - vec2(0.0, 4.0)) * 0.07);
          float pulse = 0.6 + 0.4 * sin(vWorld.z * 0.4 - uTime * 0.8);
          vec3 base = vec3(0.012, 0.025, 0.032);
          gl_FragColor = vec4(base + uColor * line * fade * 0.35 * pulse, 1.0);
        }`,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const panels = textures.map((tex, i) => {
    const group = new THREE.Group();
    group.position.set((i - 1) * PANEL_GAP, PANEL_Y, 0);
    const material = new THREE.MeshBasicMaterial({
      map: tex,
      color: tex ? 0xffffff : 0x18323a,
      toneMapped: false,
      transparent: true,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), material);
    group.add(screen);
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W + 0.12, PANEL_H + 0.12),
      new THREE.MeshBasicMaterial({
        color: CYAN,
        toneMapped: false,
        transparent: true,
        opacity: 0.55,
      }),
    );
    frame.position.z = -0.01;
    group.add(frame);
    const column = beam(
      new THREE.Vector3(0, 9, -0.6),
      new THREE.Vector3(0, -PANEL_Y, -0.6),
      0.6,
      3.6,
      CYAN,
      0.22,
    );
    group.add(column);
    const reflection = new THREE.Mesh(
      new THREE.PlaneGeometry(PANEL_W, PANEL_H),
      new THREE.MeshBasicMaterial({
        map: tex,
        color: 0x6aa6b0,
        toneMapped: false,
        transparent: true,
        opacity: 0.12,
      }),
    );
    reflection.scale.y = -1;
    reflection.position.y = -PANEL_Y * 2;
    group.add(reflection);
    scene.add(group);
    return { group, material, frame, column };
  });

  // Distant monoliths give the space depth.
  const mono = std("#0b1419", {
    roughness: 0.3,
    metalness: 0.5,
    emissive: new THREE.Color("#06181c"),
  });
  for (let i = 0; i < 14; i++) {
    const h = 4 + Math.random() * 10;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(1 + Math.random() * 2, h, 1 + Math.random() * 2),
      mono,
    );
    m.position.set((Math.random() - 0.5) * 70, h / 2, -14 - Math.random() * 30);
    scene.add(m);
  }

  const motes = dust(
    lowPower ? 300 : 900,
    new THREE.Box3(new THREE.Vector3(-18, 0, -10), new THREE.Vector3(18, 9, 10)),
    "#9ff4f8",
    0.035,
  );
  scene.add(motes);

  const state = { focus: 0 };
  function setFocus(index, instant) {
    state.focus = index;
    panels.forEach((p, i) => {
      const on = i === index;
      const target = { opacity: on ? 1 : 0.35 };
      if (instant) p.material.opacity = target.opacity;
      else gsap.to(p.material, { ...target, duration: 0.6, ease: "power2.out" });
      p.frame.material.opacity = on ? 0.6 : 0.12;
      p.column.material.uniforms.uStrength.value = on ? 0.26 : 0.1;
    });
  }

  return {
    scene,
    setFocus,
    update(t, drift) {
      floor.material.uniforms.uTime.value = t;
      panels.forEach((p, i) => {
        p.column.material.uniforms.uTime.value = t;
        p.group.position.y = PANEL_Y + Math.sin(t * 0.6 + i) * 0.04 * drift;
      });
      if (drift) driftDust(motes, t, 0.15);
    },
  };
}
