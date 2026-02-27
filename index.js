const bg = document.getElementById('bgCanvas');
const ctx = bg.getContext('2d');
const earthCanvas = document.getElementById('earthCanvas');
const ectx = earthCanvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const typewriterEl = document.getElementById('typewriter');
const typewriterWords = ['Software Engineer', 'Backend Developer', 'Laravel Developer'];
const summaryEl = document.getElementById('summaryTypewriter');
const summaryText = summaryEl ? summaryEl.dataset.text || '' : '';
const faviconEl = document.getElementById('favicon');
const faviconCanvas = document.createElement('canvas');
const faviconCtx = faviconCanvas.getContext('2d');
const faviconDots = [];
let faviconRotation = 0;

function printConsoleSignature() {
    const ascii = [
        '=========================================================',
        '  ____ _   _    _    ____ __   __',
        ' / ___| | | |  / \\  |__  /\\ \\ / /',
        "| |  _| |_| | / _ \\   / /  \\ V / ",
        '| |_| |  _  |/ ___ \\ / /_   | |  ',
        ' \\____|_| |_/_/   \\_\\____|  |_|  ',
    ].join('\n');
    const details = [
        ascii,
        '=========================================================',
        'Ghazy Othman',
        'Software Engineer | Backend Developer | Laravel Developer',
        'ghazy.h.othman@gmail.com',
        '=========================================================',
    ].join('\n');
    console.log(details);
}

function startTypewriter() {
    if (!typewriterEl) return;
    if (prefersReducedMotion) {
        typewriterEl.textContent = typewriterWords[0];
        return;
    }

    let wordIndex = 0;
    let charIndex = 0;
    let direction = 1;
    let nextTick = performance.now() + 700;

    function tick(now) {
        if (now < nextTick) {
            requestAnimationFrame(tick);
            return;
        }

        const word = typewriterWords[wordIndex];
        charIndex += direction;
        typewriterEl.textContent = word.slice(0, charIndex);

        if (direction === 1 && charIndex === word.length) {
            direction = -1;
            nextTick = now + 1100;
        } else if (direction === -1 && charIndex === 0) {
            direction = 1;
            wordIndex = (wordIndex + 1) % typewriterWords.length;
            nextTick = now + 300;
        } else {
            nextTick = now + (direction === 1 ? 90 : 45);
        }

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

function initFaviconDots() {
    if (!faviconCtx) return;
    faviconCanvas.width = 64;
    faviconCanvas.height = 64;
    const count = 220;
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        faviconDots.push({
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.sin(phi) * Math.sin(theta),
            z: Math.cos(phi)
        });
    }
}

function renderFavicon() {
    if (!faviconEl || !faviconCtx) return;
    const size = faviconCanvas.width;
    const radius = size / 2;
    faviconCtx.clearRect(0, 0, size, size);

    faviconRotation += 0.02;

    faviconCtx.beginPath();
    faviconCtx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
    faviconCtx.fillStyle = '#071428';
    faviconCtx.fill();

    for (const p of faviconDots) {
        const x = p.x * Math.cos(faviconRotation) - p.z * Math.sin(faviconRotation);
        const z = p.x * Math.sin(faviconRotation) + p.z * Math.cos(faviconRotation);
        const y = p.y;
        const scale = 0.8 + z * 0.2;
        const px = x * radius * 0.85 * scale + radius;
        const py = y * radius * 0.85 * scale + radius;
        if (z > -0.25) {
            faviconCtx.beginPath();
            faviconCtx.fillStyle = `rgba(52,208,255,${0.35 + z * 0.5})`;
            faviconCtx.arc(px, py, 1.2 * scale, 0, Math.PI * 2);
            faviconCtx.fill();
        }
    }

    faviconEl.href = faviconCanvas.toDataURL('image/png');
}

function startFaviconAnimation() {
    if (!faviconEl) return;
    initFaviconDots();
    if (prefersReducedMotion) {
        renderFavicon();
        return;
    }

    let last = 0;
    function tick(now) {
        if (now - last > 80) {
            renderFavicon();
            last = now;
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function startSummaryTypewriter() {
    if (!summaryEl) return;
    if (prefersReducedMotion) {
        summaryEl.textContent = summaryText;
        summaryEl.classList.add('is-done');
        return;
    }

    let index = 0;
    let nextTick = performance.now() + 200;

    function tick(now) {
        if (now < nextTick) {
            requestAnimationFrame(tick);
            return;
        }

        summaryEl.textContent = summaryText.slice(0, index);
        index += 1;
        nextTick = now + 14;

        if (index <= summaryText.length) {
            requestAnimationFrame(tick);
            return;
        }

        summaryEl.textContent = summaryText;
        summaryEl.classList.add('is-done');
    }

    requestAnimationFrame(tick);
}

function resizeBg() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    bg.width = innerWidth * dpr;
    bg.height = innerHeight * dpr;
    bg.style.width = innerWidth + 'px';
    bg.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (prefersReducedMotion) drawParticles();
}

window.addEventListener('resize', resizeBg);
resizeBg();

const PARTICLE_COUNT = Math.max(50, Math.floor((innerWidth * innerHeight) / 5000));
const particles = [];
function rand(min, max) { return Math.random() * (max - min) + min; }

for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: rand(0, innerWidth),
        y: rand(0, innerHeight),
        vx: rand(-0.2, 0.2),
        vy: rand(-0.2, 0.2),
        r: rand(0.8, 1.6),
        phase: Math.random() * Math.PI * 2,
        active: Math.random() > 0.3
    });
}

function stepParticles(dt) {
    for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx += rand(-0.02, 0.02);
        p.vy += rand(-0.02, 0.02);
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (p.x < -10) p.x = innerWidth + 10;
        if (p.x > innerWidth + 10) p.x = -10;
        if (p.y < -10) p.y = innerHeight + 10;
        if (p.y > innerHeight + 10) p.y = -10;
        if (Math.random() < 0.002) p.active = !p.active;
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const g = ctx.createLinearGradient(0, 0, innerWidth, innerHeight);
    g.addColorStop(0, 'rgba(3,12,23,0.9)');
    g.addColorStop(1, 'rgba(6,14,28,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (!a.active) continue;
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            if (!b.active) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const d = Math.hypot(dx, dy);
            const th = 120 + Math.abs(Math.sin((a.phase + b.phase) + performance.now() * 0.0004)) * 40;
            if (d < th) {
                const alpha = 0.12 * (1 - d / th);
                ctx.strokeStyle = `rgba(52,208,255,${alpha})`;
                ctx.lineWidth = 1 * (1 - d / th) + 0.2;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }
    }

    for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle = p.active ? 'rgba(52,208,255,0.9)' : 'rgba(255,255,255,0.06)';
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

let last = performance.now();
function loop(now) {
    const dt = Math.min(40, now - last);
    stepParticles(dt);
    drawParticles();
    last = now;
    requestAnimationFrame(loop);
}

if (!prefersReducedMotion) {
    requestAnimationFrame(loop);
} else {
    drawParticles();
}

startTypewriter();
startSummaryTypewriter();
startFaviconAnimation();
printConsoleSignature();

function resizeEarth() {
    const size = earthCanvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    earthCanvas.width = size * dpr;
    earthCanvas.height = size * dpr;
    ectx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (prefersReducedMotion) renderEarth();
}

new ResizeObserver(resizeEarth).observe(earthCanvas);
resizeEarth();

const DOT_COUNT = 900;
const earthDots = [];

for (let i = 0; i < DOT_COUNT; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = 2 * Math.PI * Math.random();
    earthDots.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi)
    });
}

let rotation = 0;

function renderEarth() {
    const size = earthCanvas.clientWidth;
    const radius = size / 2;
    ectx.clearRect(0, 0, size, size);

    rotation += 0.003;

    for (const p of earthDots) {
        const x = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z = p.x * Math.sin(rotation) + p.z * Math.cos(rotation);
        const y = p.y;

        const scale = 0.8 + z * 0.2;
        const px = x * radius * scale + radius;
        const py = y * radius * scale + radius;

        if (z > -0.2) {
            ectx.beginPath();
            ectx.fillStyle = 'rgba(52,208,255,' + (0.45 + z * 0.55) + ')';
            ectx.arc(px, py, 1.35 * scale, 0, Math.PI * 2);
            ectx.fill();
        }
    }
}

function drawEarth() {
    renderEarth();
    requestAnimationFrame(drawEarth);
}

if (!prefersReducedMotion) {
    requestAnimationFrame(drawEarth);
} else {
    renderEarth();
}
