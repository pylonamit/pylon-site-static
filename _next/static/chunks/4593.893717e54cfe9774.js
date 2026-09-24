"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4593],{84593:function(e,t,o){o.r(t);var r=o(85893),n=o(67294);let a=`
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`,c=`
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_mouseStrength;

// --- Simplex 3D noise (Ashima / webgl-noise) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 p = (v_uv - 0.5) * aspect;
  float t = u_time * 0.035;

  // Breathing — very gentle scale pulse
  float breath = 1.0 + 0.015 * sin(u_time * 0.12);
  p /= breath;

  // Mouse — soft warp, no splash
  vec2 toMouse = p - u_mouse;
  float mouseDist = length(toMouse);
  float mouseForce = u_mouseStrength * 0.06 * exp(-mouseDist * mouseDist * 5.0);
  p += normalize(toMouse + 0.0001) * mouseForce;

  // Noise coords: right-to-left drift with subtle rotation
  vec2 np = p;
  np.x += u_time * 0.605;
  float angle = u_time * 0.04;
  float r_swirl = length(p) * 0.05;
  np.x += cos(angle + length(p) * 3.0) * r_swirl;
  np.y += sin(angle + length(p) * 3.0) * r_swirl;

  // === Domain warping — reduced distortion, steady scroll ===
  float slow = t * 0.04;
  vec2 q = vec2(
    snoise(vec3(np * vec2(0.04, 1.6), slow)),
    snoise(vec3(np * vec2(0.04, 1.6) + vec2(7.3, 2.1), slow))
  );

  vec2 r = vec2(
    snoise(vec3(np * vec2(0.05, 1.5) + 0.8 * q + vec2(1.7, 9.2), slow)),
    snoise(vec3(np * vec2(0.05, 1.5) + 0.8 * q + vec2(8.3, 2.8), slow))
  );

  float f = snoise(vec3(np * vec2(0.04, 1.6) + 1.0 * r, slow));

  // === Two organic morphing strands ===
  float bandSep = 0.14;

  // Subtle warp — strands stay nearly straight
  float xWarp = (q.x + r.y) * 0.006;
  float yWarp = (q.y + r.x) * 0.004;
  vec2 wp = p + vec2(xWarp, yWarp);

  // Both strands same uniform thickness
  float thickness = 0.138;
  float thickVar1 = thickness;
  float thickVar2 = thickness;

  // Distance from each strand center
  float d1 = abs(wp.y - bandSep);
  float d2 = abs(wp.y + bandSep);
  float dMin = min(d1, d2);

  // Sharp-edged strands with varying thickness
  float band1 = 1.0 - smoothstep(thickVar1 * 0.5, thickVar1 * 0.7, d1);
  float band2 = 1.0 - smoothstep(thickVar2 * 0.5, thickVar2 * 0.7, d2);
  float mask = max(band1, band2);

  // Bridge glow between strands to prevent sparseness
  float bridgeGlow = exp(-dMin * dMin * 30.0) * 0.15;
  mask = max(mask, bridgeGlow);
  mask = smoothstep(0.05, 0.6, mask);

  // === Color: flowing regions of blue, green, purple, red ===
  float n = f * 0.5 + 0.5;
  float depth = clamp(1.0 - dMin / 0.20, 0.0, 1.0);

  vec3 cBlue   = vec3(0.376, 0.647, 0.980); // blue-400
  vec3 cGreen  = vec3(0.204, 0.827, 0.600); // emerald-500
  vec3 cPurple = vec3(0.753, 0.518, 0.988); // purple-400
  vec3 cAmber  = vec3(0.984, 0.573, 0.235); // orange-400
  vec3 cRed    = vec3(0.969, 0.380, 0.380); // red-400

  float colorParam = fract(q.x * 0.5 + r.y * 0.5 + 0.5);
  float t4 = colorParam * 4.0;
  vec3 color = mix(cBlue, cGreen, clamp(t4, 0.0, 1.0));
  color = mix(color, cPurple, clamp(t4 - 1.0, 0.0, 1.0));
  color = mix(color, cAmber, clamp(t4 - 2.0, 0.0, 1.0));
  color = mix(color, cRed, clamp(t4 - 3.0, 0.0, 1.0));

  // Lighten toward edges, deepen in center
  color = mix(color, vec3(1.0), (1.0 - depth) * 0.12);

  // === Posterize — step colors for digital feel ===
  color = floor(color * 8.0 + 0.5) / 8.0;

  // === Translucent ribbon: fold depth varies opacity ===
  float foldDepth = smoothstep(-0.4, 0.7, f);
  float alpha = mask * mix(0.7, 1.0, foldDepth);
  alpha = smoothstep(0.1, 0.7, alpha);
  alpha = clamp(alpha, 0.0, 1.0);

  // === Scanlines — slow drifting vertical lines ===
  float scanX = gl_FragCoord.x + u_time * 12.0;
  float scanline = sin(scanX * 1.5) * 0.5 + 0.5;
  scanline = smoothstep(0.3, 0.7, scanline);
  alpha *= mix(0.80, 1.0, scanline);

  gl_FragColor = vec4(color, alpha);
}`;function i(e,t,o){let r=e.createShader(t);return r?(e.shaderSource(r,o),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error("Shader compile error:",e.getShaderInfoLog(r)),e.deleteShader(r),null):null}t.default=e=>{let{className:t=""}=e,o=(0,n.useRef)(null),l=(0,n.useRef)(0);return(0,n.useEffect)(()=>{let e=o.current;if(!e)return;let t=e.getContext("webgl",{alpha:!0,premultipliedAlpha:!1,antialias:!1});if(!t)return;let r=i(t,t.VERTEX_SHADER,a),n=i(t,t.FRAGMENT_SHADER,c);if(!r||!n)return;let s=function(e,t,o){let r=e.createProgram();return r?(e.attachShader(r,t),e.attachShader(r,o),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS))?r:(console.error("Program link error:",e.getProgramInfoLog(r)),e.deleteProgram(r),null):null}(t,r,n);if(!s)return;let v=t.getAttribLocation(s,"a_position"),m=t.getUniformLocation(s,"u_time"),u=t.getUniformLocation(s,"u_resolution"),p=t.getUniformLocation(s,"u_mouse"),d=t.getUniformLocation(s,"u_mouseStrength"),h=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,h),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t.STATIC_DRAW);let f={x:0,y:0},x={x:0,y:0},g=!1,y=0,w=(t,o)=>{let r=e.getBoundingClientRect(),n=r.width/r.height,a=(t-r.left)/r.width,c=(o-r.top)/r.height;f.x=(a-.5)*n,f.y=.5-c},_=e=>{g=!0,w(e.clientX,e.clientY)},b=()=>{g=!1},A=e=>{e.touches.length>0&&(g=!0,w(e.touches[0].clientX,e.touches[0].clientY))},S=()=>{g=!1};e.addEventListener("mousemove",_),e.addEventListener("mouseleave",b),e.addEventListener("touchmove",A,{passive:!0}),e.addEventListener("touchend",S);let z=()=>{let o=Math.min(window.devicePixelRatio,2),r=e.clientWidth,n=e.clientHeight;(e.width!==r*o||e.height!==n*o)&&(e.width=r*o,e.height=n*o,t.viewport(0,0,e.width,e.height))},R=new ResizeObserver(z);R.observe(e),z(),t.enable(t.BLEND),t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA);let E=performance.now(),L=!0,k=()=>{if(!L){l.current=requestAnimationFrame(k);return}let o=(performance.now()-E)/1e3;x.x+=(f.x-x.x)*.06,x.y+=(f.y-x.y)*.06;let r=g?1:0;y+=(r-y)*.04,t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),t.useProgram(s),t.enableVertexAttribArray(v),t.bindBuffer(t.ARRAY_BUFFER,h),t.vertexAttribPointer(v,2,t.FLOAT,!1,0,0),t.uniform1f(m,o),t.uniform2f(u,e.width,e.height),t.uniform2f(p,x.x,x.y),t.uniform1f(d,y),t.drawArrays(t.TRIANGLES,0,6),l.current=requestAnimationFrame(k)},P=new IntersectionObserver(e=>{let[t]=e;L=t.isIntersecting},{threshold:0});return P.observe(e),l.current=requestAnimationFrame(k),()=>{cancelAnimationFrame(l.current),P.disconnect(),R.disconnect(),e.removeEventListener("mousemove",_),e.removeEventListener("mouseleave",b),e.removeEventListener("touchmove",A),e.removeEventListener("touchend",S),t.deleteProgram(s),t.deleteShader(r),t.deleteShader(n),t.deleteBuffer(h)}},[]),(0,r.jsx)("canvas",{ref:o,className:`h-full w-full bg-transparent ${t}`,style:{touchAction:"none"}})}}}]);