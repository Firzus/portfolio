import {
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  WireframeGeometry,
} from "three";

/** Draws a placeholder wireframe shape until the prototype defines the real scene. */
export function mountScene(canvas: HTMLCanvasElement, { animate }: { animate: boolean }): void {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const shape = new LineSegments(
    new WireframeGeometry(new IcosahedronGeometry(1.6, 1)),
    new LineBasicMaterial({ color: 0xd9dbe0 }),
  );
  shape.position.x = 1.4;
  scene.add(shape);

  const resize = () => {
    const { clientWidth, clientHeight } = canvas;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(canvas);

  if (animate) {
    renderer.setAnimationLoop((time) => {
      shape.rotation.set(time * 0.0001, time * 0.00015, 0);
      renderer.render(scene, camera);
    });
  }
}
