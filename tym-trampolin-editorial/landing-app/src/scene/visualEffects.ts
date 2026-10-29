import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  LineCurve3,
  Mesh,
  MeshStandardMaterial,
  NormalBlending,
  PlaneGeometry,
  ShaderMaterial,
  TubeGeometry,
  Vector3,
  type Material,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const planeVertex = /* glsl */ `
  varying vec2 vEffectUv;
  void main() {
    vEffectUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Soft painted light: normal blending keeps glows visible on a white section. */
function radialMaterial(color: string, shadow = false) {
  return new ShaderMaterial({
    uniforms: { strength: { value: 0 }, color: { value: new Color(color) } },
    vertexShader: planeVertex,
    fragmentShader: /* glsl */ `
      uniform float strength;
      uniform vec3 color;
      varying vec2 vEffectUv;
      void main() {
        float radius = length((vEffectUv - 0.5) * 2.0);
        float feather = 1.0 - smoothstep(0.65, 1.0, radius);
        float opacity = exp(-radius * radius * 5.0) * feather * strength;
        gl_FragColor = vec4(color, clamp(opacity, 0.0, 1.0));
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: !shadow,
    blending: NormalBlending,
    toneMapped: false,
  });
}

export interface VisualEffects {
  filament: Mesh;
  filamentMaterial: MeshStandardMaterial;
  bulbHalo: Mesh;
  engineHalo: Mesh;
  shadow: Mesh;
  geometries: BufferGeometry[];
  materials: Material[];
  dispose: () => void;
}

/** Owned once by the scene, with all animation controlled through scalar uniforms. */
export function createVisualEffects(): VisualEffects {
  const supports = [-0.22, 0.22].map(
    (x) =>
      new TubeGeometry(
        new LineCurve3(new Vector3(x, -0.58, 0), new Vector3(x, 0.32, 0)),
        1,
        0.009,
        6,
        false,
      ),
  );
  const coilPoints = Array.from({ length: 129 }, (_, index) => {
    const fraction = index / 128;
    const angle = fraction * Math.PI * 2 * 8;
    return new Vector3(
      -0.22 + fraction * 0.44,
      0.36 + Math.cos(angle) * 0.04,
      Math.sin(angle) * 0.04,
    );
  });
  const coil = new TubeGeometry(
    new CatmullRomCurve3(coilPoints),
    64,
    0.009,
    6,
    false,
  );
  const pieces = [...supports, coil];
  const filamentGeometry = mergeGeometries(pieces, false);
  pieces.forEach((geometry) => geometry.dispose());
  if (!filamentGeometry)
    throw new Error("Could not create the bulb filament geometry.");
  const filamentMaterial = new MeshStandardMaterial({
    color: "#FFE1A0",
    emissive: "#FF9D35",
    emissiveIntensity: 3,
    roughness: 0.36,
    metalness: 0.55,
  });
  const filament = new Mesh(filamentGeometry, filamentMaterial);
  filament.visible = false;

  const plane = new PlaneGeometry(1, 1);
  const bulbMaterial = radialMaterial("#FFE1A0");
  const engineMaterial = radialMaterial("#2455FF");
  const shadowMaterial = radialMaterial("#0A0C12", true);
  const bulbHalo = new Mesh(plane, bulbMaterial);
  const engineHalo = new Mesh(plane, engineMaterial);
  const shadow = new Mesh(plane, shadowMaterial);
  // Broad transparent billboards may be centered outside the viewport.
  bulbHalo.frustumCulled =
    engineHalo.frustumCulled =
    shadow.frustumCulled =
      false;

  const geometries: BufferGeometry[] = [filamentGeometry, plane];
  const materials: Material[] = [
    filamentMaterial,
    bulbMaterial,
    engineMaterial,
    shadowMaterial,
  ];
  let disposed = false;
  return {
    filament,
    filamentMaterial,
    bulbHalo,
    engineHalo,
    shadow,
    geometries,
    materials,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const mesh of [filament, bulbHalo, engineHalo, shadow])
        mesh.removeFromParent();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    },
  };
}
