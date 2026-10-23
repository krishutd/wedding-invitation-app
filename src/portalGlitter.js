/** A continuous ribbon of layered gold stardust follows the orbit. */
export function createPortalGlitter(canvas, cx, cy, radius) {
  const context = canvas.getContext('2d');
  if (!context) return { draw() {}, dispose() {} };
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.ceil(innerWidth * ratio);
  canvas.height = Math.ceil(innerHeight * ratio);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  context.scale(ratio, ratio);
  const particles = Array.from({ length: 5205 }, (_, i) => ({
    age: (i + .5) / 5205,
    spread: Math.sin(i * 127.1) * Math.cos(i * 31.7),
    size: .45 + (Math.sin(i * 17.3) + 1) * .55,
    phase: i * 2.39996,
    scatter: .5 + (Math.sin(i * 43.7) + 1) * .5,
  }));
  return {
    draw(progress) {
      context.clearRect(0, 0, innerWidth, innerHeight);
      const fade = Math.min(1, progress / .08, (1 - progress) / .08);
      if (fade <= 0) return;
      // Match the SVG dash and its 2.75 turns, including the initial .75 solo turn.
      const head = Math.PI / 2 + (2.75 * progress + .539448) * Math.PI * 2;
      const x = cx + Math.cos(head) * radius, y = cy + Math.sin(head) * radius;
      const glow = context.createRadialGradient(x, y, 0, x, y, 24);
      glow.addColorStop(0, '#fff4cfcc');
      glow.addColorStop(.25, '#edcd8570');
      glow.addColorStop(1, '#d9ad5000');
      context.globalAlpha = fade;
      context.fillStyle = glow;
      context.fillRect(x - 24, y - 24, 48, 48);
      for (const particle of particles) {
        const age = (particle.age + progress * 3) % 1;
        // Older grains peel away from the moving ribbon and dissolve gently.
        const scatter = age * age * particle.scatter;
        const angle = head - age * .68614 * Math.PI * 2
          + Math.sin(particle.phase) * scatter * .055;
        const goldWidth = 7 + age * 19;
        // One overlapping gold field, with no separate outer band or empty gap.
        const drift = particle.spread * goldWidth * 1.45
          + Math.sin(particle.phase) * scatter * 16;
        const px = cx + Math.cos(angle) * (radius + drift);
        const py = cy + Math.sin(angle) * (radius + drift) + scatter * 10;
        const twinkle = .55 + .45 * Math.sin(progress * 48 + particle.phase) ** 2;
        context.globalAlpha = fade * (1 - age) ** 1.35 * twinkle;
        context.fillStyle = particle.spread > .35 ? '#fff0bf'
          : particle.spread < -.3 ? '#b98227' : '#dfb554';
        context.beginPath();
        context.arc(px, py, particle.size, 0, Math.PI * 2);
        context.fill();
        if (particle.size > 1.35 && twinkle > .96) {
          context.globalAlpha *= .75;
          context.fillStyle = '#fff2c9';
          context.fillRect(px - 3.5, py - .3, 7, .6);
          context.fillRect(px - .3, py - 3.5, .6, 7);
        }
      }
      context.globalAlpha = 1;
    },
    dispose() { context.clearRect(0, 0, innerWidth, innerHeight); },
  };
}
