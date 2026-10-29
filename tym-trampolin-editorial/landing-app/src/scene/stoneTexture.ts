import { Color, MeshStandardMaterial } from "three";

export interface StoneTexture {
  uniforms: { strength: { value: number } };
  dispose: () => void;
}

// Mineral structure is evaluated in the original stone coordinates. Neither
// deformation nor ambient rotation can make the grain swim over the surface.
const mineralShader = /* glsl */ `
varying vec3 vStoneRestPosition;
uniform float uStoneStrength;
uniform vec3 uStoneFlint;
uniform vec3 uStoneOchre;
uniform vec3 uStoneChalk;
uniform vec3 uStoneDark;
float stoneHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float stoneNoise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(stoneHash(i), stoneHash(i+vec3(1,0,0)), f.x),
                 mix(stoneHash(i+vec3(0,1,0)), stoneHash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(stoneHash(i+vec3(0,0,1)), stoneHash(i+vec3(1,0,1)), f.x),
                 mix(stoneHash(i+vec3(0,1,1)), stoneHash(i+vec3(1,1,1)), f.x), f.y), f.z);
}
`;

/** A texture-free flint finish, with one scalar uniform controlling its fade. */
export function applyStoneTexture(
  material: MeshStandardMaterial,
): StoneTexture {
  const uniforms = { strength: { value: 1 } };
  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey;
  const colors = {
    uStoneFlint: { value: new Color("#777267") },
    uStoneOchre: { value: new Color("#998269") },
    uStoneChalk: { value: new Color("#B8B0A0") },
    uStoneDark: { value: new Color("#4B4842") },
  };
  material.onBeforeCompile = function (shader, renderer) {
    previousCompile.call(this, shader, renderer);
    Object.assign(shader.uniforms, colors, {
      uStoneStrength: uniforms.strength,
    });
    shader.vertexShader =
      `attribute vec3 aRestPosition;\nvarying vec3 vStoneRestPosition;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvStoneRestPosition = aRestPosition;",
      );
    shader.fragmentShader = mineralShader + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <color_fragment>",
        /* glsl */ `
      #include <color_fragment>
      vec3 stoneP = vStoneRestPosition;
      float mineral = stoneNoise(stoneP * 3.4);
      float inclusion = smoothstep(0.66, 0.83, mineral);
      float grain = stoneNoise(stoneP * 77.0);
      float chips = stoneNoise(stoneP * 15.0 + 4.2);
      float flake = sin(dot(stoneP, vec3(5.1, 9.3, 3.7)) + chips * 7.0);
      float crackAA = max(fwidth(flake), 0.018);
      float crack = 1.0 - smoothstep(0.008, 0.008 + crackAA, abs(flake));
      // Broad cloudy flint and small mineral inclusions, with no graphic rings
      // or blue pigment: branded light is supplied by the scene lighting.
      vec3 mineralColor = mix(uStoneDark, uStoneFlint, 0.38 + mineral * 0.62);
      mineralColor = mix(mineralColor, uStoneOchre, smoothstep(0.35, 0.72, mineral) * 0.36);
      mineralColor = mix(mineralColor, uStoneChalk, inclusion * 0.42);
      mineralColor *= 0.85 + grain * 0.15 + chips * 0.12;
      mineralColor = mix(mineralColor, uStoneDark * 0.68, crack * 0.21);
      diffuseColor.rgb = mix(diffuseColor.rgb, mineralColor, uStoneStrength);
      float stoneHeight = chips * 0.42 + grain * 0.07 - crack * 0.08;
    `,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `
      #include <roughnessmap_fragment>
      roughnessFactor = mix(roughnessFactor, clamp(0.86 + chips * 0.10, 0.0, 1.0), uStoneStrength);
    `,
      )
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `
      #include <normal_fragment_maps>
      vec3 stoneDx = dFdx(-vViewPosition);
      vec3 stoneDy = dFdy(-vViewPosition);
      vec3 stoneR1 = cross(stoneDy, normal);
      vec3 stoneR2 = cross(normal, stoneDx);
      float stoneDet = dot(stoneDx, stoneR1);
      vec3 stoneGradient = sign(stoneDet) * (dFdx(stoneHeight) * stoneR1 + dFdy(stoneHeight) * stoneR2);
      normal = normalize(max(abs(stoneDet), 1e-10) * normal - stoneGradient * 0.018 * uStoneStrength);
    `,
      );
  };
  material.customProgramCacheKey = () =>
    `${previousKey.call(material)}:natural-flint-v3`;
  material.needsUpdate = true;
  let disposed = false;
  return {
    uniforms,
    dispose() {
      if (disposed) return;
      disposed = true;
      material.onBeforeCompile = previousCompile;
      material.customProgramCacheKey = previousKey;
      material.needsUpdate = true;
    },
  };
}
