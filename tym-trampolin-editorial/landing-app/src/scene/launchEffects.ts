import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Mesh,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type Camera,
  type Material,
} from "three";

export interface LaunchEffectState {
  ignition: number;
  launch: number;
  progress: number;
  ambient?: boolean;
}
export interface SmokeSample {
  x: number;
  y: number;
  z: number;
  scale: number;
}
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (start: number, end: number, value: number) => {
  const x = clamp((value - start) / (end - start));
  return x * x * (3 - 2 * x);
};
/** Pure scrub sampling: no stored particle age or integration history. */
export function sampleLaunchSmoke(
  index: number,
  count: number,
  state: LaunchEffectState,
  out: SmokeSample,
): SmokeSample {
  const age = count <= 1 ? 0 : index / (count - 1);
  const angle = index * 2.399963229728653;
  const spread = (0.12 + state.launch * 1.1) * age;
  out.x = Math.cos(angle) * spread;
  out.y = -0.15 - age * (0.5 + state.launch * 4.8);
  out.z = Math.sin(angle) * spread * 0.55;
  out.scale =
    (0.26 + age * 0.95 + state.launch * 0.35) * smooth(0, 0.65, state.ignition);
  return out;
}
const noise = /* glsl */ `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
`;
export function createLaunchEffects(quality: "standard" | "low" = "standard") {
  const count = quality === "low" ? 12 : 24;
  const geometry = new PlaneGeometry(1, 1);
  const ages = new Float32Array(count);
  for (let index = 0; index < count; index++)
    ages[index] = index / Math.max(1, count - 1);
  geometry.setAttribute("aCloudAge", new InstancedBufferAttribute(ages, 1));
  const flameMaterial = new ShaderMaterial({
    uniforms: {
      strength: { value: 0 },
      time: { value: 0 },
      white: { value: new Color("#FFF4D4") },
      orange: { value: new Color("#FF741C") },
      blue: { value: new Color("#2455FF") },
    },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */ `${noise}
      varying vec2 vUv;uniform float strength;uniform float time;uniform vec3 white;uniform vec3 orange;uniform vec3 blue;
      void main(){
        float tail=1.-vUv.y;
        float turbulence=noise2(vec2(vUv.x*8.,tail*11.-time*3.));
        float width=(.035+.43*pow(1.-tail,.65))*(.88+.12*turbulence);
        float lateral=abs(vUv.x-.5);
        float edge=1.-smoothstep(width*.35,width,lateral);
        float ends=smoothstep(0.,.1,vUv.y)*(1.-smoothstep(.93,1.,vUv.y));
        float core=pow(max(0.,1.-lateral/max(width,.001)),3.)*(1.-tail*.7);
        vec3 color=mix(orange,white,core);
        color=mix(color,blue,smoothstep(.82,1.,vUv.y)*.7);
        gl_FragColor=vec4(color,edge*ends*strength*(.78+.22*turbulence));
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: 2,
    blending: NormalBlending,
    toneMapped: false,
  });
  const smokeMaterial = new ShaderMaterial({
    uniforms: {
      strength: { value: 0 },
      time: { value: 0 },
      color: { value: new Color("#616673") },
    },
    vertexShader: /* glsl */ `attribute float aCloudAge;varying vec2 vUv;varying float vAge;void main(){vUv=uv;vAge=aCloudAge;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */ `${noise}
      varying vec2 vUv;varying float vAge;uniform float strength;uniform float time;uniform vec3 color;
      void main(){vec2 p=(vUv-.5)*2.;float n=noise2(p*3.4+vec2(vAge*19.,time*.12));float radius=length(p)+(n-.5)*.28;
      float cloud=(1.-smoothstep(.3,.98,radius))*(.55+n*.45);
      float ageFade=smoothstep(0.,.14,vAge)*(1.-smoothstep(.7,1.,vAge));
      gl_FragColor=vec4(mix(color,vec3(.62),n*.35),cloud*ageFade*strength*.4);
      #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: NormalBlending,
    toneMapped: false,
  });
  const group = new Group();
  group.name = "Deterministic launch fire and smoke";
  const flameGroup = new Group();
  const first = new Mesh(geometry, flameMaterial);
  const second = new Mesh(geometry, flameMaterial);
  second.rotation.y = Math.PI / 2;
  flameGroup.add(first, second);
  const flames = [first, second];
  const smoke = new InstancedMesh(geometry, smokeMaterial, count);
  smoke.instanceMatrix.setUsage(DynamicDrawUsage);
  smoke.frustumCulled = false;
  smoke.renderOrder = 2;
  flameGroup.renderOrder = 3;
  group.add(smoke, flameGroup);
  group.visible = false;
  const nozzle = new Vector3();
  const offset = new Vector3();
  const scale = new Vector3();
  const rocketScale = new Vector3();
  const rocketQuaternion = new Quaternion();
  const cameraQuaternion = new Quaternion();
  const matrix = new Matrix4();
  const sample: SmokeSample = { x: 0, y: 0, z: 0, scale: 0 };
  const geometries: BufferGeometry[] = [geometry];
  const materials: Material[] = [flameMaterial, smokeMaterial];
  const gpuResources = [geometry, flameMaterial, smokeMaterial, smoke];
  let disposed = false;
  return {
    group,
    flameMaterial,
    smokeMaterial,
    gpuResources,
    diagnostics: { smokeCount: count, geometries: 1, materials: 2 },
    /** Attach group directly to the scene; rocket and camera world matrices must be current. */
    update(
      state: LaunchEffectState,
      time: number,
      rocket: Object3D,
      camera: Camera,
    ) {
      const fade = 1 - smooth(0.94, 0.985, state.progress);
      const activity = clamp(state.ignition) * fade;
      group.visible = activity > 0.001;
      flameMaterial.uniforms.strength.value = activity;
      smokeMaterial.uniforms.strength.value = activity;
      const shaderTime = state.ambient ? time : 0;
      flameMaterial.uniforms.time.value = shaderTime;
      smokeMaterial.uniforms.time.value = shaderTime;
      if (!group.visible) return;
      nozzle.set(0, -1.42, 0);
      rocket.localToWorld(nozzle);
      rocket.getWorldQuaternion(rocketQuaternion);
      rocket.getWorldScale(rocketScale);
      const modelScale = Math.abs(rocketScale.x);
      camera.getWorldQuaternion(cameraQuaternion);
      flameGroup.position.copy(nozzle);
      flameGroup.quaternion.copy(rocketQuaternion);
      const length = (0.75 + clamp(state.launch) * 2.8) * modelScale;
      for (const flame of flames) {
        flame.position.y = -length / 2;
        flame.scale.set((0.68 + state.launch * 0.24) * modelScale, length, 1);
      }
      for (let index = 0; index < count; index++) {
        sampleLaunchSmoke(index, count, state, sample);
        offset
          .set(sample.x, sample.y, sample.z)
          .multiplyScalar(modelScale)
          .applyQuaternion(rocketQuaternion)
          .add(nozzle);
        scale.setScalar(sample.scale * modelScale);
        matrix.compose(offset, cameraQuaternion, scale);
        smoke.setMatrixAt(index, matrix);
      }
      smoke.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      smoke.dispose();
      geometries.forEach((resource) => resource.dispose());
      materials.forEach((resource) => resource.dispose());
    },
  };
}
