const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const heartParticles = [];
const textToRepeat = "i love you";
const totalParticles = 380; 

// --- NUEVOS ELEMENTOS DEL FONDO ---
const backgroundEvents = [];

function initHeart() {
  heartParticles.length = 0;
  for (let i = 0; i < totalParticles; i++) {
    let theta = Math.random() * Math.PI * 2;
    let x = 16 * Math.pow(Math.sin(theta), 3);
    let y = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta);
    
    let fillFactor = Math.pow(Math.random(), 0.65); 

    heartParticles.push({
      relX: x * fillFactor,
      relY: -y * fillFactor,
      size: Math.floor(Math.random() * 3) + 10,
      speed: 0.3 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2 
    });
  }
}

initHeart();
window.addEventListener('resize', initHeart);

let globalTime = 0;

// Función para crear un evento aleatorio en el fondo de vez en cuando
function triggerBackgroundEvent() {
  const rand = Math.random();
  
  if (rand < 0.3) {
    // Evento 1: Línea de código que cae lentamente (Matrix sutil)
    backgroundEvents.push({
      type: 'drop',
      x: Math.random() * canvas.width,
      y: -20,
      speed: 1 + Math.random() * 2,
      alpha: 0.4,
      text: "i love you"
    });
  } else if (rand < 0.7) {
    // Evento 2: Píxel estrella digital que parpadea
    backgroundEvents.push({
      type: 'twinkle',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      alpha: 0,
      targetAlpha: 0.3 + Math.random() * 0.4,
      state: 'fading-in', // fading-in, fading-out
      size: Math.random() * 2 + 1
    });
  } else {
    // Evento 3: Onda expansiva circular muy tenue desde el centro
    backgroundEvents.push({
      type: 'wave',
      radius: 10,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.8,
      alpha: 0.15
    });
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const baseScale = Math.min(canvas.width, canvas.height) / 35;

  // =========================================================
  // 1. RENDERIZAR Y ACTUALIZAR EVENTOS DEL FONDO (Atrás)
  // =========================================================
  
  // Decidir de forma muy aleatoria si lanzamos un evento (baja probabilidad para mantenerlo sutil)
  if (Math.random() < 0.015 && backgroundEvents.length < 15) {
    triggerBackgroundEvent();
  }

  for (let i = backgroundEvents.length - 1; i >= 0; i--) {
    let ev = backgroundEvents[i];

    if (ev.type === 'drop') {
      ev.y += ev.speed;
      ev.alpha -= 0.002; // Se desvanece poco a poco
      
      ctx.save();
      ctx.font = '11px "Courier New", monospace';
      ctx.fillStyle = `rgba(255, 0, 30, ${ev.alpha})`;
      ctx.fillText(ev.text, ev.x, ev.y);
      ctx.restore();

      if (ev.y > canvas.height || ev.alpha <= 0) backgroundEvents.splice(i, 1);
    } 
    
    else if (ev.type === 'twinkle') {
      if (ev.state === 'fading-in') {
        ev.alpha += 0.01;
        if (ev.alpha >= ev.targetAlpha) ev.state = 'fading-out';
      } else {
        ev.alpha -= 0.005;
      }

      ctx.save();
      ctx.fillStyle = `rgba(255, 80, 100, ${ev.alpha})`;
      ctx.fillRect(ev.x, ev.y, ev.size, ev.size);
      ctx.restore();

      if (ev.alpha <= 0) backgroundEvents.splice(i, 1);
    } 
    
    else if (ev.type === 'wave') {
      ev.radius += 2.5; // Velocidad de expansión de la onda
      ev.alpha -= 0.0008; // Se desvanece lentamente mientras crece

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, ev.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 0, 40, ${ev.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      if (ev.radius >= ev.maxRadius || ev.alpha <= 0) backgroundEvents.splice(i, 1);
    }
  }

  // =========================================================
  // 2. RENDERIZAR EL CORAZÓN PRINCIPAL (Adelante)
  // =========================================================
  heartParticles.forEach((p) => {
    let alpha = 0.35 + Math.sin(globalTime * p.speed + p.phase) * 0.25;

    ctx.save();
    ctx.translate(centerX + p.relX * baseScale, centerY + p.relY * baseScale);
    
    ctx.font = `${p.size}px "Courier New", monospace`;
    ctx.fillStyle = `rgba(255, 40, 60, ${alpha})`;
    
    ctx.shadowColor = "rgba(255, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    
    ctx.textAlign = "center";
    ctx.fillText(textToRepeat, 0, 0);
    ctx.restore();
  });

  globalTime += 0.01; 
  requestAnimationFrame(animate);
}

animate();