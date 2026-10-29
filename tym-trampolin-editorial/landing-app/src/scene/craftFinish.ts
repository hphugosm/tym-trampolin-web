import { Color, MeshPhysicalMaterial, ShaderChunk, Vector4 } from "three";

export interface CraftFinish {
  uniforms: { weights: { value: Vector4 }; bulbLight: { value: number } };
  dispose: () => void;
}

const declarations = /* glsl */ `
varying vec3 vCraftPosition;
uniform vec4 uCraftWeights;
uniform float uBulbLight;
uniform vec3 uBulbWarm;
uniform vec3 uCraftBlue;
uniform vec3 uCraftIce;
uniform vec3 uCraftGraphite;
uniform vec3 uCraftWhite;
uniform vec3 uCraftGold;
// Derivative-aware strokes remain quiet at oblique angles and on small screens.
float craftStroke(float distanceToLine, float width) {
  float aa = max(fwidth(distanceToLine), 0.0005);
  return 1.0 - smoothstep(width, width + aa, abs(distanceToLine));
}
float craftSine(float phase) {
  return sin(phase) * (1.0 - smoothstep(0.65, 3.14, fwidth(phase)));
}
float craftBox(vec2 p, vec2 halfSize) {
  vec2 q = abs(p) - halfSize;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}
`;

/** Deterministic, object-space surface finishes layered over the original flint. */
export function applyCraftFinish(material: MeshPhysicalMaterial): CraftFinish {
  const uniforms = {
    weights: { value: new Vector4() },
    bulbLight: { value: 0 },
  };
  const previousCompile = material.onBeforeCompile;
  const previousKey = material.customProgramCacheKey;
  const colors = {
    uCraftBlue: { value: new Color("#173DA5") },
    uCraftIce: { value: new Color("#DCE7FF") },
    uCraftGraphite: { value: new Color("#252A34") },
    uCraftWhite: { value: new Color("#F3F5F9") },
    uCraftGold: { value: new Color("#C5AB72") },
    uBulbWarm: { value: new Color("#FFD7A0") },
  };
  material.onBeforeCompile = function (shader, renderer) {
    previousCompile.call(this, shader, renderer);
    Object.assign(shader.uniforms, colors, {
      uCraftWeights: uniforms.weights,
      uBulbLight: uniforms.bulbLight,
    });
    shader.vertexShader =
      `varying vec3 vCraftPosition;\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvCraftPosition = transformed;",
      );
    shader.fragmentShader = declarations + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <alphamap_fragment>",
        /* glsl */ `
      vec3 cp = vCraftPosition;
      float craftAmount = clamp(dot(uCraftWeights, vec4(1.0)), 0.0, 1.0);
      float cr = length(cp.xy);
      float ca = atan(cp.y, cp.x + 1e-7);
      float tooling = craftSine(cr * 360.0 + sin(ca * 3.0) * 0.6);
      float brushing = craftSine(ca * 220.0 + cr * 9.0);
      float gearGroove = craftStroke(cr - 0.67, 0.008) + craftStroke(cr - 1.075, 0.006);
      vec3 gearColor = mix(uCraftIce, uCraftWhite, 0.68) * (0.88 + tooling * 0.016 + brushing * 0.009);
      gearColor *= 1.0 - gearGroove * 0.18;
      float glassHead = smoothstep(-0.63, -0.58, cp.y);
      float screw = sin(cp.y * 83.0 + atan(cp.z, cp.x + 1e-7) * 1.3);
      float bulbContact = 1.0 - smoothstep(-1.15, -1.10, cp.y);
      vec3 bulbBase = mix(uCraftIce * (0.61 + screw * 0.09), uCraftGraphite, bulbContact);
      vec3 bulbColor = mix(bulbBase, mix(uCraftWhite, uCraftIce, 0.07), glassHead);
      float packageExtent = max(abs(cp.x), abs(cp.y));
      float pinMask = smoothstep(0.855, 0.89, packageExtent);
      float dieMask = (1.0 - smoothstep(0.35, 0.38, packageExtent)) * smoothstep(0.14, 0.19, cp.z);
      vec2 cell = abs(fract(cp.xy * 22.0) - 0.5) / 22.0;
      float circuitry = craftStroke(min(cell.x, cell.y), 0.00065);
      float dieFrame = craftStroke(craftBox(cp.xy, vec2(0.31)), 0.002);
      float etch = craftStroke(cp.y + 0.57, 0.002) * (1.0 - smoothstep(0.27, 0.3, abs(cp.x)));
      etch += craftStroke(cp.y + 0.60, 0.0015) * (1.0 - smoothstep(0.17, 0.2, abs(cp.x)));
      vec3 ceramic = uCraftGraphite * 0.58 + uCraftIce * etch * 0.13;
      vec3 dieColor = mix(uCraftBlue * 0.38, uCraftIce, (circuitry * 0.21 + dieFrame * 0.48));
      vec3 chipColor = mix(mix(ceramic, dieColor, dieMask), uCraftGold * 0.83 + uCraftIce * 0.17, pinMask);
      float rocketNozzle = 1.0 - smoothstep(-1.18, -1.14, cp.y);
      float rocketFin = smoothstep(0.455, 0.49, length(cp.xz)) * (1.0 - smoothstep(-0.38, -0.31, cp.y));
      float rocketNose = smoothstep(0.79, 0.82, cp.y);
      float blueBand = 1.0 - smoothstep(0.025, 0.037, abs(cp.y + 0.21));
      float seam = craftStroke(cp.y - 0.68, 0.003) + craftStroke(cp.y + 0.71, 0.003);
      seam += craftStroke(sin(atan(cp.z, cp.x + 1e-7) * 4.0), 0.008) * 0.32;
      vec2 windowP = vec2(cp.x * 1.08, (cp.y - 0.30) * 0.83);
      float windowDistance = length(windowP);
      float frontMask = smoothstep(0.24, 0.35, cp.z);
      float windowMask = (1.0 - smoothstep(0.115, 0.122, windowDistance)) * frontMask;
      float windowFrame = craftStroke(windowDistance - 0.14, 0.012) * frontMask;
      vec2 rivetCell = vec2(abs(fract(atan(cp.z, cp.x + 1e-7) * 2.54648 + 0.5) - 0.5) * 0.39, cp.y + 0.65);
      float rivet = 1.0 - smoothstep(0.006, 0.012, length(rivetCell));
      vec3 rocketColor = mix(uCraftWhite, uCraftBlue, max(max(rocketNose, rocketFin), blueBand));
      rocketColor *= 1.0 - clamp(seam, 0.0, 1.0) * 0.22;
      rocketColor = mix(rocketColor, uCraftIce * 0.63, clamp(windowFrame + rivet, 0.0, 1.0));
      rocketColor = mix(rocketColor, uCraftBlue * 0.09 + uCraftIce * 0.018, windowMask);
      rocketColor = mix(rocketColor, uCraftGraphite * (0.6 + 0.12 * sin(cp.y * 90.0)), rocketNozzle);
      diffuseColor.rgb = diffuseColor.rgb * (1.0 - craftAmount) + gearColor * uCraftWeights.x
        + bulbColor * uCraftWeights.y + chipColor * uCraftWeights.z + rocketColor * uCraftWeights.w;
      #include <alphamap_fragment>
      float craftHeight = uCraftWeights.x * (tooling * 0.0018 - gearGroove * 0.012)
        + uCraftWeights.y * (1.0 - glassHead) * screw * 0.008
        + uCraftWeights.z * (circuitry * dieMask * 0.001 - etch * 0.002)
        - uCraftWeights.w * (seam * 0.003 + windowFrame * 0.003);
    `,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        /* glsl */ `
      float gearRoughness = 0.24 + tooling * 0.018 + gearGroove * 0.09;
      float bulbRoughness = mix(0.27, 0.095, glassHead);
      float chipRoughness = mix(mix(0.68, 0.18 + circuitry * 0.025, dieMask), 0.23, pinMask);
      float rocketRoughness = mix(mix(0.23, 0.09, windowMask), 0.32, rocketNozzle);
      roughnessFactor = roughnessFactor * (1.0 - craftAmount) + dot(uCraftWeights, vec4(gearRoughness, bulbRoughness, chipRoughness, rocketRoughness));
      #include <metalnessmap_fragment>
    `,
      )
      .replace(
        "#include <normal_fragment_begin>",
        /* glsl */ `
      metalnessFactor = metalnessFactor * (1.0 - craftAmount) + dot(uCraftWeights,
        vec4(0.94, (1.0 - glassHead) * (1.0 - bulbContact) * 0.93, mix(0.02, 0.91, pinMask), mix(0.12, 0.86, clamp(rocketNozzle + windowFrame, 0.0, 1.0))));
      #include <normal_fragment_begin>
    `,
      )
      .replace(
        "#include <clearcoat_normal_fragment_begin>",
        /* glsl */ `
      vec3 craftDx = dFdx(-vViewPosition), craftDy = dFdy(-vViewPosition);
      vec3 craftR1 = cross(craftDy, normal), craftR2 = cross(normal, craftDx);
      float craftDet = dot(craftDx, craftR1);
      vec3 craftGradient = sign(craftDet) * (dFdx(craftHeight) * craftR1 + dFdy(craftHeight) * craftR2);
      normal = normalize(max(abs(craftDet), 1e-10) * normal - craftGradient * 0.12);
      #include <clearcoat_normal_fragment_begin>
    `,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `
      #include <emissivemap_fragment>
      // Warm light scatters through the translucent shell; the separate
      // interior tungsten geometry supplies the sharply resolved filament.
      float bulbPower = clamp(uBulbLight, 0.0, 1.0) * glassHead * uCraftWeights.y;
      vec2 bulbHaloPosition = vec2(cp.x * 2.6, (cp.y - 0.36) * 2.0);
      float filamentHalo = exp(-dot(bulbHaloPosition, bulbHaloPosition) * 3.5);
      totalEmissiveRadiance += uBulbWarm * bulbPower * (0.055 + filamentHalo * 0.075);
    `,
      )
      .replace(
        "#include <lights_physical_fragment>",
        /* glsl */ `
      #include <lights_physical_fragment>
      #ifdef USE_CLEARCOAT
        material.clearcoat *= dot(uCraftWeights, vec4(0.14, glassHead, dieMask * 0.75, 0.87));
      #endif
    `,
      )
      .replace(
        "#include <transmission_fragment>",
        ShaderChunk.transmission_fragment.replace(
          "material.transmission = transmission;",
          "material.transmission = transmission * glassHead * uCraftWeights.y;",
        ),
      );
  };
  material.customProgramCacheKey = () =>
    `${previousKey.call(material)}:craft-finishes-v2`;
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
