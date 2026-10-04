import { useEffect, useRef } from "react";

const COLORS = ["#ffdc73", "#ff8eb9", "#9dffc2", "#8ddcff", "#c7a0ff", "#fff5d6"];
const FIREWORKS = [
  [0, 0.2, 0.2], [0.3, 0.8, 0.25], [0.9, 0.5, 0.13],
  [1.5, 0.12, 0.38], [1.9, 0.88, 0.4], [2.5, 0.35, 0.18],
  [2.9, 0.7, 0.2], [3.6, 0.18, 0.3], [3.6, 0.82, 0.3],
  [4.3, 0.35, 0.15], [4.3, 0.65, 0.15], [4.6, 0.5, 0.25],
];
const random = (min, max) => min + Math.random() * (max - min);

// One finite canvas show avoids hundreds of animated DOM nodes on a phone.
function playCelebration(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let width = 0;
  let height = 0;
  let particles = [];
  let rockets = [];
  let frame;
  let elapsed = 0;
  let previous;
  let nextFirework = 0;
  let encore = false;
  let finished = false;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  const confetti = () => {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 65; i++) {
        const life = random(3.2, 4.8);
        particles.push({
          kind: "confetti",
          x: side < 0 ? width * 0.03 : width * 0.97,
          y: height * 0.72,
          vx: -side * random(width * 0.18, width * 0.65),
          vy: -random(height * 0.65, height * 1.12),
          gravity: height * 0.65,
          drag: 0.65,
          color: COLORS[i % COLORS.length],
          size: random(5, 10),
          angle: random(0, Math.PI * 2),
          spin: random(-9, 9),
          life,
          remaining: life,
        });
      }
    }
  };

  const explode = ({ x, y, color }) => {
    const radius = Math.min(width * 0.3, height * 0.22, 190);
    for (let i = 0; i < 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const speed = radius * random(0.65, 1.5);
      const life = random(1, 1.8);
      particles.push({
        kind: "spark",
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 55,
        drag: 1.25,
        color: i % 5 === 0 ? "#fff5d6" : color,
        size: random(1.2, 2.5),
        life,
        remaining: life,
      });
    }
  };

  const launch = ([, x, y], index) => {
    rockets.push({
      x: width * x,
      y: height + 20,
      target: height * y,
      speed: height * 1.5,
      color: COLORS[index % COLORS.length],
    });
  };

  const draw = (now) => {
    // Cap delta after a busy frame so mobile rendering stays smooth.
    const dt = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.04);
    previous = now;
    elapsed += dt;
    ctx.clearRect(0, 0, width, height);
    while (nextFirework < FIREWORKS.length && elapsed >= FIREWORKS[nextFirework][0]) {
      launch(FIREWORKS[nextFirework], nextFirework);
      nextFirework++;
    }
    if (!encore && elapsed >= 1.3) {
      confetti();
      encore = true;
    }

    ctx.lineCap = "round";
    rockets = rockets.filter((rocket) => {
      rocket.y -= rocket.speed * dt;
      if (rocket.y <= rocket.target) {
        explode({ ...rocket, y: rocket.target });
        return false;
      }
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = rocket.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y);
      ctx.lineTo(rocket.x, rocket.y + 26);
      ctx.stroke();
      return true;
    });

    particles = particles.filter((particle) => {
      particle.remaining -= dt;
      if (particle.remaining <= 0 || particle.y > height + 40) return false;
      particle.vx *= Math.exp(-particle.drag * dt);
      particle.vy += particle.gravity * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      ctx.globalAlpha = Math.min(1, particle.remaining / (particle.life * 0.35));
      ctx.fillStyle = particle.color;
      if (particle.kind === "confetti") {
        particle.angle += particle.spin * dt;
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        // A changing face width makes the paper tumble as it falls.
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(particle.angle))), 1);
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        ctx.restore();
      } else {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.vx * 0.07, particle.y - particle.vy * 0.07);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
        ctx.fillStyle = "#fff5d6";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      return true;
    });
    ctx.globalAlpha = 1;
    if (nextFirework < FIREWORKS.length || particles.length || rockets.length) {
      frame = requestAnimationFrame(draw);
    } else {
      finished = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
    }
  };

  const visibilityChanged = () => {
    cancelAnimationFrame(frame);
    previous = undefined;
    if (!document.hidden && !finished) frame = requestAnimationFrame(draw);
  };
  document.addEventListener("visibilitychange", visibilityChanged);
  confetti();
  // A burst on the first frame makes the reveal immediate; rockets follow it.
  explode({ x: width * 0.5, y: height * 0.2, color: COLORS[0] });
  if (!document.hidden) frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibilityChanged);
    ctx.clearRect(0, 0, width, height);
  };
}

export default function CelebrationEffects() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop;
    const update = () => {
      stop?.();
      stop = motion.matches ? undefined : playCelebration(canvasRef.current);
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      stop?.();
      motion.removeEventListener("change", update);
    };
  }, []);

  return <canvas ref={canvasRef} className="celebration-effects" aria-hidden="true" />;
}
