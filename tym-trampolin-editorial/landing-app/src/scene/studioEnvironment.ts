import { Color, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from "three";

/** Reflection-only studio. Bake once with PMREM, then dispose this source scene. */
export function createStudioEnvironment(): {
  scene: Scene;
  dispose: () => void;
} {
  const scene = new Scene();
  scene.background = new Color("#151820");
  const panelGeometry = new PlaneGeometry(1, 1);
  // Linear radiance above 1 gives metals a clear highlight against the dark room.
  const white = new MeshBasicMaterial({
    color: new Color("#FFFFFF").multiplyScalar(5),
    toneMapped: false,
  });
  const ice = new MeshBasicMaterial({
    color: new Color("#DCE7FF").multiplyScalar(3),
    toneMapped: false,
  });
  const blue = new MeshBasicMaterial({
    color: new Color("#2455FF").multiplyScalar(1.6),
    toneMapped: false,
  });
  const materials = [white, ice, blue];
  function panel(
    name: string,
    material: MeshBasicMaterial,
    position: [number, number, number],
    width: number,
    height: number,
  ) {
    const mesh = new Mesh(panelGeometry, material);
    mesh.name = name;
    mesh.position.set(...position);
    mesh.scale.set(width, height, 1);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  }
  panel("Large softbox key", white, [-4.5, 3.5, 5], 4.5, 6);
  panel("Ice strip", ice, [5, 0.5, 1], 0.8, 6);
  panel("Overhead softbox", white, [0, 6, -1], 5, 2);
  panel("Blue rim panel", blue, [-3, -0.5, -5], 2, 4);
  let disposed = false;
  return {
    scene,
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.clear();
      scene.background = null;
      panelGeometry.dispose();
      materials.forEach((material) => material.dispose());
    },
  };
}
