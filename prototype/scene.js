import * as THREE from "three";

const BEAM_VERTEX = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    vAlong = uv.y;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

// Fakes volumetric light: brighter towards the source and the cone's axis, with slow drifting density.
const BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uStrength;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vAlong;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vec3 view = normalize(cameraPosition - vWorld);
    float facing = abs(dot(normalize(vNormal), view));
    float core = pow(facing, 2.2);
    float fade = mix(0.3, 1.0, pow(vAlong, 0.8));
    float density = 0.65 + 0.35 * noise(vWorld * 1.6 + vec3(0.0, -uTime * 0.12, uTime * 0.05));
    float a = core * fade * density * uStrength;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/**
 * Builds the dim room of the first screen: pillars in darkness and one beam of
 * light entering from a high opening. Returns controls for the page script.
 */
export function createRoom(canvas, { lightColor, groundColor, animate }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const ground = new THREE.Color(groundColor);
  const light = new THREE.Color(lightColor);

  const scene = new THREE.Scene();
  scene.background = ground;
  scene.fog = new THREE.FogExp2(ground, 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
  const cameraStart = new THREE.Vector3(0, 1.7, 10);
  const cameraEnd = new THREE.Vector3(0.4, 1.9, 6.2);
  camera.position.copy(cameraStart);

  const stone = new THREE.MeshStandardMaterial({ color: 0x1a2226, roughness: 0.92, metalness: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), stone);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), stone);
  backWall.position.set(0, 10, -9);
  backWall.receiveShadow = true;
  scene.add(backWall);

  const pillarGeometry = new THREE.BoxGeometry(0.55, 7, 0.55);
  for (const [x, z] of [
    [-4.2, -4],
    [-1.4, -4],
    [1.4, -4],
    [4.2, -4],
    [-4.2, 0.5],
    [4.2, 0.5],
    [-4.2, 5],
    [4.2, 5],
  ]) {
    const pillar = new THREE.Mesh(pillarGeometry, stone);
    pillar.position.set(x, 3.5, z);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    scene.add(pillar);
  }

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.6), stone);
  plinth.position.set(0, 0.45, 0.5);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  scene.add(plinth);

  scene.add(new THREE.HemisphereLight(0x6f8a92, 0x050708, 0.18));

  const source = new THREE.Vector3(0, 8.6, -8.2);
  const spot = new THREE.SpotLight(light, 520, 40, 0.34, 0.55, 1.4);
  spot.position.copy(source);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  scene.add(spot);
  scene.add(spot.target);

  const opening = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.32),
    new THREE.MeshBasicMaterial({ color: light.clone().multiplyScalar(1.6), fog: false }),
  );
  opening.position.set(source.x, source.y, -8.98);
  scene.add(opening);

  const beamMaterial = new THREE.ShaderMaterial({
    vertexShader: BEAM_VERTEX,
    fragmentShader: BEAM_FRAGMENT,
    uniforms: {
      uColor: { value: light.clone() },
      uTime: { value: 0 },
      uStrength: { value: 0.75 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  // uv.y runs from 0 at the wide end to 1 at the narrow end, the light source.
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 3.4, 1, 48, 1, true), beamMaterial);
  scene.add(beam);

  const up = new THREE.Vector3(0, 1, 0);
  const target = new THREE.Vector3();
  function aim(degrees) {
    const angle = THREE.MathUtils.degToRad(degrees);
    target.set(Math.sin(angle) * 9, 0, -8.2 + Math.cos(angle) * 9);
    spot.target.position.copy(target);
    spot.target.updateMatrixWorld();
    const axis = source.clone().sub(target);
    const length = axis.length();
    beam.scale.set(1, length, 1);
    beam.position.copy(source).add(target).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(up, axis.normalize());
  }

  let progress = 0;
  const pointer = new THREE.Vector2();
  const look = new THREE.Vector3(0, 2.4, -2);
  function placeCamera() {
    camera.position.lerpVectors(cameraStart, cameraEnd, progress);
    camera.position.x += pointer.x * 0.35;
    camera.position.y += pointer.y * 0.18;
    camera.lookAt(look);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the pillars in frame on narrow screens by widening the lens instead of cropping.
    camera.fov = w / h < 0.8 ? 66 : 48;
    camera.updateProjectionMatrix();
  }

  const clock = new THREE.Clock();
  let running = false;
  let frame = 0;
  function render() {
    beamMaterial.uniforms.uTime.value = clock.getElapsedTime();
    placeCamera();
    renderer.render(scene, camera);
  }
  function loop() {
    render();
    if (running) frame = requestAnimationFrame(loop);
  }

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running) render();
  });
  resizeObserver.observe(canvas.parentElement);
  resize();

  return {
    setAngle(degrees) {
      aim(degrees);
      if (!running) render();
    },
    setProgress(value) {
      progress = value;
      if (!running) render();
    },
    setPointer(x, y) {
      pointer.set(x, y);
    },
    start() {
      if (!animate || running) return;
      running = true;
      frame = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frame);
    },
    render,
  };
}
