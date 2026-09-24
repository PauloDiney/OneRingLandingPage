/*
 * A real-time study of the Ring: a single fragment shader that ray-marches a
 * polished gold band under studio light. No library — WebGL 1, one triangle.
 *
 * Everything the scroll controls arrives as a uniform:
 *   rotation   the band turns like a coin on its edge (yaw) and tips (tilt)
 *   distance   the camera approaches
 *   warm       studio softboxes dim as fire light rises from below
 */

export type RingState = {
  tilt: number;
  yaw: number;
  roll: number;
  distance: number;
  warm: number;
  exposure: number;
};

export type RingRenderer = {
  render: (state: RingState, time: number) => void;
  dispose: () => void;
};

const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform mat3 uRot;       // world -> object
uniform float uDist;
uniform float uWarm;
uniform float uExposure;

const float R = 1.0;     // radius to the middle of the band
const float T = 0.082;   // radial half-thickness
const float W = 0.235;   // half-width along the axis
const float RND = 0.07;  // edge rounding
const float TANF = 0.2679; // tan(15deg): a 30deg lens, product-shot compression
const float BOUND = 1.2;

float lift() { return sin(uTime * 0.55) * 0.035; }

float map(vec3 p) {
  p.y -= lift();
  p = uRot * p;
  vec2 q = vec2(length(p.xz) - R, p.y);
  // Comfort-fit profile: the outer face is gently domed, the inner one flat.
  float dome = 0.03 * (1.0 - clamp((q.y * q.y) / (W * W), 0.0, 1.0));
  q.x -= dome * step(0.0, q.x);
  vec2 d = abs(q) - vec2(T, W) + RND;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - RND;
}

vec3 normalAt(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0005;
  return normalize(
    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx)
  );
}

// A dark studio: an overhead softbox, two tall strips, a faint fill —
// and, as uWarm rises, the glow of a fire somewhere below.
vec3 studio(vec3 d) {
  vec3 cool = vec3(0.86, 0.92, 1.0);
  vec3 key = mix(cool, vec3(1.0, 0.84, 0.68), uWarm);
  float keyI = mix(1.0, 0.28, uWarm);

  vec3 c = vec3(0.012, 0.013, 0.016) * (0.7 + 0.3 * d.y);

  float top = smoothstep(0.5, 0.82, d.y) * smoothstep(0.8, 0.3, abs(d.x));
  c += key * top * 3.4 * keyI;

  vec2 h = normalize(d.xz + 1e-5);
  float left = smoothstep(0.93, 0.99, dot(h, normalize(vec2(-1.0, -0.3))))
             * smoothstep(-0.5, -0.15, d.y) * smoothstep(0.75, 0.45, d.y);
  c += key * left * 4.2 * keyI;

  float right = smoothstep(0.955, 0.995, dot(h, normalize(vec2(1.0, -0.55))))
              * smoothstep(-0.35, 0.0, d.y) * smoothstep(0.65, 0.35, d.y);
  c += mix(cool, key, 0.5) * right * 2.8 * keyI;

  c += key * pow(max(d.z, 0.0), 4.0) * 0.3 * keyI;

  float below = smoothstep(0.0, -0.8, d.y);
  c += vec3(1.0, 0.5, 0.2) * below * 4.2 * uWarm;
  float core = pow(max(dot(d, normalize(vec3(0.25, -0.75, 0.6))), 0.0), 10.0);
  c += vec3(1.0, 0.42, 0.12) * core * 9.0 * uWarm;

  return c;
}

// Short march for the reflection bounce: the inside of a ring mirrors itself.
float traceBounce(vec3 ro, vec3 rd) {
  float t = 0.02;
  for (int i = 0; i < 36; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0008) return t;
    t += d;
    if (t > 2.6) break;
  }
  return -1.0;
}

float occlusion(vec3 p, vec3 n) {
  float o = 0.0;
  float w = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.03 * float(i);
    o += w * (h - map(p + n * h));
    w *= 0.6;
  }
  return clamp(1.0 - 3.2 * o, 0.25, 1.0);
}

vec3 shade(vec3 p, vec3 rd) {
  vec3 n = normalAt(p);
  vec3 r = reflect(rd, n);
  float nv = clamp(dot(n, -rd), 0.0, 1.0);

  vec3 F0 = vec3(1.0, 0.72, 0.33); // polished gold
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - nv, 5.0);

  vec3 env;
  float tb = traceBounce(p + n * 0.002, r);
  if (tb > 0.0) {
    vec3 p2 = p + r * tb;
    vec3 r2 = reflect(r, normalAt(p2));
    env = studio(r2) * F0 * 0.85;
  } else {
    env = studio(r);
  }

  return F * env * occlusion(p, n);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 2.0;
  vec3 ro = vec3(0.0, 0.0, uDist);
  vec3 rd = normalize(vec3(uv * TANF, -1.0));

  // Only march pixels whose ray passes the ring's bounding sphere.
  float b = dot(ro, rd);
  float h = b * b - (dot(ro, ro) - BOUND * BOUND);
  if (h < 0.0) { gl_FragColor = vec4(0.0); return; }
  h = sqrt(h);
  float t = max(-b - h, 0.0);
  float tEnd = -b + h;

  float dMin = 1e5;
  float tMin = t;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < dMin) { dMin = d; tMin = t; }
    if (d < 0.0003 * t) { hit = true; break; }
    t += d * 0.92;
    if (t > tEnd) break;
  }

  // Missed rays that grazed the band get partial coverage: smooth silhouettes
  // without multisampling.
  float pixel = tMin * 2.0 * TANF / uRes.y;
  float alpha = hit ? 1.0 : clamp(1.0 - dMin / (pixel * 1.2), 0.0, 1.0);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  vec3 col = shade(ro + rd * (hit ? t : tMin), rd);
  col = aces(col * uExposure);
  col = pow(col, vec3(1.0 / 2.2));
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) console.warn('[ring] shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** world → object rotation, column-major for uniformMatrix3fv. */
function rotation({ tilt, yaw, roll }: RingState) {
  // R = Rx(-tilt) · Ry(-yaw) · Rz(-roll)
  const [cx, sx] = [Math.cos(-tilt), Math.sin(-tilt)];
  const [cy, sy] = [Math.cos(-yaw), Math.sin(-yaw)];
  const [cz, sz] = [Math.cos(-roll), Math.sin(-roll)];

  const rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx]; // row-major
  const ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];

  const mul = (a: number[], b: number[]) => {
    const o = new Array<number>(9);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
    return o;
  };

  const m = mul(mul(rx, ry), rz);
  // Row-major → column-major.
  return new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);
}

type Options = {
  /** Upper bound on device pixel ratio. The shader is per-pixel work. */
  maxDpr?: number;
};

/** Returns null when WebGL is unavailable or the shader fails: callers fall back. */
export function createRingRenderer(canvas: HTMLCanvasElement, { maxDpr = 1.5 }: Options = {}): RingRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One oversized triangle covers the viewport.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    res: gl.getUniformLocation(program, 'uRes'),
    time: gl.getUniformLocation(program, 'uTime'),
    rot: gl.getUniformLocation(program, 'uRot'),
    dist: gl.getUniformLocation(program, 'uDist'),
    warm: gl.getUniformLocation(program, 'uWarm'),
    exposure: gl.getUniformLocation(program, 'uExposure'),
  };

  // Resolution follows the element's size; quality drops if frames run long.
  let quality = 1;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * quality;
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  let last = 0;
  let slow = 0;

  return {
    render(state, time) {
      // Adaptive resolution: a run of long frames steps quality down, never up.
      if (last) {
        const dt = time - last;
        slow = dt > 0.028 && dt < 0.25 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 24 && quality > 0.55) {
          quality *= 0.8;
          slow = 0;
          resize();
        }
      }
      last = time;

      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, time);
      gl.uniformMatrix3fv(u.rot, false, rotation(state));
      gl.uniform1f(u.dist, state.distance);
      gl.uniform1f(u.warm, state.warm);
      gl.uniform1f(u.exposure, state.exposure);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
