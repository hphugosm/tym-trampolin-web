// Signature hero shader — fluid aurora field in brand colors.
// Reacts to cursor (ripple) and scroll (phase drift). Desktop only,
// DPR-capped, respects prefers-reduced-motion. Fallback: static CSS bg.

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

// hash & noise
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i), f),
                 dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                 dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.55;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = uv;
  p.x *= uRes.x / uRes.y;

  float t = uTime * 0.06;

  // cursor ripple — soft displacement well around the mouse
  vec2 m = uMouse;
  m.x *= uRes.x / uRes.y;
  float md = length(p - m);
  vec2 pull = normalize(p - m + 0.0001) * exp(-md * 3.2) * 0.24;

  // domain-warped fbm — the "liquid" field
  vec2 q = vec2(fbm(p * 1.6 + t + pull), fbm(p * 1.6 - t * 0.7 + pull));
  vec2 r = vec2(fbm(p * 1.6 + q * 1.9 + vec2(1.7, 9.2) + t * 0.35),
                fbm(p * 1.6 + q * 1.9 + vec2(8.3, 2.8) - t * 0.22));
  float f = fbm(p * 1.6 + r * 2.2 - uScroll * 0.4);

  // trampoline bounce line — a slow standing wave along the bottom
  float wave = sin(p.x * 2.4 + uTime * 0.5) * 0.04 + sin(p.x * 5.1 - uTime * 0.32) * 0.02;
  float bounce = smoothstep(0.30 + wave, 0.0, uv.y) * 0.35;

  // brand palette: ink -> deep blue -> cyan -> violet edge
  vec3 ink = vec3(0.012, 0.031, 0.078);
  vec3 deep = vec3(0.03, 0.09, 0.22);
  vec3 cyan = vec3(0.31, 0.78, 1.0);
  vec3 violet = vec3(0.49, 0.55, 1.0);

  float glow = smoothstep(0.25, 0.95, f + bounce);
  vec3 col = mix(ink, deep, smoothstep(0.0, 0.7, f));
  col = mix(col, cyan * 0.85, glow * 0.5);
  col = mix(col, violet * 0.8, smoothstep(0.55, 1.0, r.y) * glow * 0.45);

  // cursor highlight
  col += cyan * exp(-md * 5.0) * 0.12;

  // vignette to ink at the edges — hero text stays readable
  float vig = smoothstep(1.25, 0.45, length(uv - vec2(0.5, 0.45)));
  col = mix(ink, col, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function initHeroShader(canvas: HTMLCanvasElement): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth <= 768) return;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) return null;
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uScroll = gl.getUniformLocation(prog, 'uScroll');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0, h = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.floor(r.width * DPR));
    h = Math.max(1, Math.floor(r.height * DPR));
    canvas.width = w;
    canvas.height = h;
    gl!.viewport(0, 0, w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  window.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    tx = (e.clientX - r.left) / Math.max(1, r.width);
    ty = 1 - (e.clientY - r.top) / Math.max(1, r.height);
  }, { passive: true });

  let scroll = 0;
  window.addEventListener('scroll', () => {
    scroll = window.scrollY / Math.max(1, window.innerHeight);
  }, { passive: true });

  // Pause when hero is off-screen
  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  }).observe(canvas);

  const start = performance.now();
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;
    gl!.uniform2f(uRes, w, h);
    gl!.uniform1f(uTime, (performance.now() - start) / 1000);
    gl!.uniform2f(uMouse, mx, my);
    gl!.uniform1f(uScroll, scroll);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }
  frame();

  // teardown on view transition away
  document.addEventListener('astro:before-swap', () => cancelAnimationFrame(raf), { once: true });
}

// Auto-init when the canvas is present
function boot() {
  const canvas = document.getElementById('hero-shader') as HTMLCanvasElement | null;
  if (canvas && !canvas.dataset.shaderInit) {
    canvas.dataset.shaderInit = '1';
    initHeroShader(canvas);
  }
}
boot();
document.addEventListener('astro:page-load', boot);
