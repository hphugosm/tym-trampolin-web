(() => {
  const canvas = document.getElementById("particles");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let particles = [];
  let sparks = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

    particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.5 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: Math.random() * -0.15 - 0.02,
      a: Math.random() * 0.55 + 0.2,
    }));

    sparks = Array.from({ length: 22 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: Math.random() * 8 + 4,
      vx: Math.random() * 1.2 + 0.3,
      vy: Math.random() * 0.8 + 0.15,
      a: Math.random() * 0.55 + 0.18,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      g.addColorStop(0, `rgba(145,220,255,${p.a})`);
      g.addColorStop(1, "rgba(145,220,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
    });

    sparks.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x > w + 20 || s.y > h + 20) {
        s.x = Math.random() * w * 0.35;
        s.y = h * (0.55 + Math.random() * 0.4);
      }
      ctx.strokeStyle = `rgba(255,190,90,${s.a})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.len, s.y - s.len * 0.7);
      ctx.stroke();
    });

    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
})();
