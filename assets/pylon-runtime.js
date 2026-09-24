/* pylonlending.com static clone runtime: real WebGL hero ribbon + real Rive players */
(function () {
  var VERT = "attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}";
  var FRAG = document.getElementById("pylon-blob-frag").textContent;
  function compile(gl, type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; }
  function blob(canvas) {
    var gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false }); if (!gl) return;
    var vs = compile(gl, gl.VERTEX_SHADER, VERT), fs = compile(gl, gl.FRAGMENT_SHADER, FRAG); if (!vs || !fs) return;
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    var posLoc = gl.getAttribLocation(prog, "a_position"), timeLoc = gl.getUniformLocation(prog, "u_time"), resLoc = gl.getUniformLocation(prog, "u_resolution"), mouseLoc = gl.getUniformLocation(prog, "u_mouse"), strLoc = gl.getUniformLocation(prog, "u_mouseStrength");
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var mt = { x: 0, y: 0 }, ms = { x: 0, y: 0 }, active = false, strength = 0;
    function upd(cx, cy) { var r = canvas.getBoundingClientRect(); var a = r.width / r.height; mt.x = ((cx - r.left) / r.width - 0.5) * a; mt.y = 0.5 - (cy - r.top) / r.height; }
    canvas.addEventListener("mousemove", function (e) { active = true; upd(e.clientX, e.clientY); });
    canvas.addEventListener("mouseleave", function () { active = false; });
    canvas.addEventListener("touchmove", function (e) { if (e.touches.length) { active = true; upd(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: true });
    canvas.addEventListener("touchend", function () { active = false; });
    function resize() { var dpr = Math.min(window.devicePixelRatio, 2); var w = canvas.clientWidth, h = canvas.clientHeight; if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; gl.viewport(0, 0, canvas.width, canvas.height); } }
    new ResizeObserver(resize).observe(canvas); resize();
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var start = performance.now(), visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);
    (function render() {
      if (visible) {
        var t = (performance.now() - start) / 1000;
        ms.x += (mt.x - ms.x) * 0.06; ms.y += (mt.y - ms.y) * 0.06; strength += ((active ? 1 : 0) - strength) * 0.04;
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(prog); gl.enableVertexAttribArray(posLoc); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.uniform1f(timeLoc, t); gl.uniform2f(resLoc, canvas.width, canvas.height); gl.uniform2f(mouseLoc, ms.x, ms.y); gl.uniform1f(strLoc, strength); gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      requestAnimationFrame(render);
    })();
  }
  document.querySelectorAll("canvas[data-gradient-blob]").forEach(blob);
  // Rive: same runtime the site uses (@rive-app/canvas), Contain / Center, default animation, load when in view
  var rives = document.querySelectorAll("canvas[data-riv]");
  if (rives.length && window.rive) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || en.target.dataset.started) return; en.target.dataset.started = "1";
        var c = en.target;
        var b64 = (window.__PYLON_RIV || {})[c.dataset.riv.split("/").pop()]; var bin = b64 ? Uint8Array.from(atob(b64), function (ch) { return ch.charCodeAt(0); }).buffer : null; new rive.Rive(Object.assign(bin ? { buffer: bin } : { src: c.dataset.riv }, { canvas: c, autoplay: true, layout: new rive.Layout({ fit: rive.Fit.Contain, alignment: rive.Alignment.Center }), onLoad: function () { this.resizeDrawingSurfaceToCanvas(); c.style.opacity = "1"; }.bind ? function () { c.style.opacity = "1"; } : undefined }));
      });
    }, { threshold: 0.2 });
    rives.forEach(function (c) { c.style.transition = "opacity .3s ease .1s"; c.style.opacity = "0"; io.observe(c); });
  }
})();
