// 全画面のフラグメントシェーダを1枚描くだけの、小さなWebGPUビュー(Test2 などで使う)。
export function createGpuView(wgsl) {
  let adapter = null, device = null, canvas = null, ctx = null, pipeline = null, buf = null, bind = null;
  let raf = 0, running = false, host = null;
  const mouse = [0, 0], target = [0, 0];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function init() {
    adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('no adapter');
    device = await adapter.requestDevice();
    device.lost.then(info => { console.warn('WebGPU device lost:', info.message); stop(); host.classList.add('no-gpu'); });
    device.addEventListener('uncapturederror', e => console.warn('WebGPU error:', e.error.message));
    canvas = document.createElement('canvas');
    canvas.className = 'ts-gpu';
    host.prepend(canvas);
    ctx = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'opaque' });
    const module = device.createShaderModule({ code: wgsl });
    pipeline = device.createRenderPipeline({
      layout: 'auto', vertex: { module, entryPoint: 'vs' },
      fragment: { module, entryPoint: 'fs', targets: [{ format }] }, primitive: { topology: 'triangle-list' },
    });
    buf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    bind = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: buf } }] });
    window.addEventListener('pointermove', e => { target[0] = e.clientX / innerWidth * 2 - 1; target[1] = -(e.clientY / innerHeight * 2 - 1); });
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    mouse[0] += (target[0] - mouse[0]) * 0.05; mouse[1] += (target[1] - mouse[1]) * 0.05;
    device.queue.writeBuffer(buf, 0, new Float32Array([w, h, reduce ? 4 : now / 1000, 0, mouse[0], mouse[1], 0, 0]));
    const enc = device.createCommandEncoder();
    const pass = enc.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: { r: 0, g: 0, b: 0, a: 1 } }] });
    pass.setPipeline(pipeline); pass.setBindGroup(0, bind); pass.draw(3); pass.end();
    device.queue.submit([enc.finish()]);
  }

  async function start(el) {
    host = el;
    if (!navigator.gpu) { host.classList.add('no-gpu'); return false; }
    try {
      if (!canvas) await init();
      host.classList.remove('no-gpu');
      if (!running) { running = true; raf = requestAnimationFrame(frame); }
      return true;
    } catch (e) { console.warn('WebGPU init failed', e); host.classList.add('no-gpu'); return false; }
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  document.addEventListener('visibilitychange', () => {
    if (!canvas || !device) return;
    if (document.hidden) stop();
    else if (host && !host.closest('[hidden]') && getComputedStyle(host).display !== 'none' && !running) { running = true; raf = requestAnimationFrame(frame); }
  });
  return { start, stop };
}
