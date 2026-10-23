/** A small, deterministic constellation following the leading end of the orbit. */
export function createPortalGlitter(canvas, cx, cy, radius) {
  const context = canvas.getContext('2d');
  if (!context) return { draw() {}, dispose() {} };
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(innerWidth * ratio);
  canvas.height = Math.ceil(innerHeight * ratio);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  context.scale(ratio, ratio);
  const particles = Array.from({ length: 800 }, (_, i) => ({
    outer: i >= 400,
    age: ((i % 400) + .5) / 400,
    spread: Math.sin(i * 127.1) * Math.cos(i * 31.7),
    size: .55 + (Math.sin(i * 17.3) + 1) * .5,
    phase: i * 2.39996,
  }));
  return {
    draw(progress) {
      context.clearRect(0, 0, innerWidth, innerHeight);
      const fade = Math.min(1, progress / .08, (1 - progress) / .08);
      if (fade <= 0) return;
      // The SVG dash spans .228 of the circle and travels two turns clockwise.
      const head = Math.PI / 2 + (2 * progress + .228) * Math.PI * 2;
      const x = cx + Math.cos(head) * radius, y = cy + Math.sin(head) * radius;
      const glow = context.createRadialGradient(x, y, 0, x, y, 15);
      glow.addColorStop(0, '#fff4cfcc');
      glow.addColorStop(.25, '#edcd8570');
      glow.addColorStop(1, '#d9ad5000');
      context.globalAlpha = fade;
      context.fillStyle = glow;
      context.fillRect(x - 15, y - 15, 30, 30);
      for (const particle of particles) {
        const age = (particle.age + progress * 3) % 1;
        const angle = head - age * .228 * Math.PI * 2;
        // Magenta sits beyond the gold layer's outer edge at every point in the tail.
        const goldWidth = 4 + age * 16;
        const drift = particle.outer
          ? goldWidth + 6 + Math.abs(particle.spread) * 12
          : particle.spread * goldWidth;
        const px = cx + Math.cos(angle) * (radius + drift);
        const py = cy + Math.sin(angle) * (radius + drift) + age * age * 6;
        const twinkle = .55 + .45 * Math.sin(progress * 48 + particle.phase) ** 2;
        context.globalAlpha = fade * (1 - age) ** 1.7 * twinkle;
        context.fillStyle = particle.outer
          ? (particle.age < .3 ? '#d44cab' : '#9b167e')
          : (particle.age < .3 ? '#fff0bf' : '#c99b43');
        context.beginPath();
        context.arc(px, py, particle.size, 0, Math.PI * 2);
        context.fill();
        if (particle.size > 1.4 && twinkle > .9) {
          context.fillRect(px - 3, py - .35, 6, .7);
          context.fillRect(px - .35, py - 3, .7, 6);
        }
      }
      context.globalAlpha = 1;
    },
    dispose() { context.clearRect(0, 0, innerWidth, innerHeight); },
  };
}
