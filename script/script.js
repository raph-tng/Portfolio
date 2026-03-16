// ==================== DARK MODE TOGGLE ====================

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// ==================== BACKGROUND CANVAS ====================

const canvas = document.querySelector("#background-canvas");
const ctx = canvas.getContext('2d');

// for intro motion
let mouseMoved = false;

const pointer = {
    x: .5 * window.innerWidth,
    y: .5 * window.innerHeight,
}
const params = {
    pointsNumber: 40,
    widthFactor: .3,
    mouseThreshold: .6,
    spring: .4,
    friction: .5
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
        x: pointer.x,
        y: pointer.y,
        dx: 0,
        dy: 0,
    }
}

window.addEventListener("click", e => {
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("mousemove", e => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", e => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

setupCanvas();
update(0);
window.addEventListener("resize", setupCanvas);


function update(t) {

    // for intro motion
    if (!mouseMoved) {
        pointer.x = (.5 + .3 * Math.cos(.002 * t) * (Math.sin(.005 * t))) * window.innerWidth;
        pointer.y = (.5 + .2 * (Math.cos(.005 * t)) + .1 * Math.cos(.01 * t)) * window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    trail.forEach((p, pIdx) => {
        const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
        const spring = pIdx === 0 ? .4 * params.spring : params.spring;
        p.dx += (prev.x - p.x) * spring;
        p.dy += (prev.y - p.y) * spring;
        p.dx *= params.friction;
        p.dy *= params.friction;
        p.x += p.dx;
        p.y += p.dy;
    });

    ctx.lineCap = "round";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6200ea');
    gradient.addColorStop(1, '#b388ff');
    ctx.strokeStyle = gradient;
	 ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < trail.length - 1; i++) {
        const xc = .5 * (trail[i].x + trail[i + 1].x);
        const yc = .5 * (trail[i].y + trail[i + 1].y);
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
        ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
        ctx.stroke();
    }
    ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    ctx.stroke();
    
    window.requestAnimationFrame(update);
}

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// ==================== DNA HELIX ANIMATION ====================

const dnaCanvas = document.getElementById('dna-helix-canvas');
const dnaCtx = dnaCanvas.getContext('2d');

function setupDnaCanvas() {
    dnaCanvas.width = window.innerWidth;
    const timelineSection = document.querySelector('.timeline');
    if (timelineSection) {
        dnaCanvas.height = timelineSection.offsetHeight;
    }
}

function drawDnaHelix() {
    const scrollPercentage = calculateTimelineScrollProgress() * 1.1; // Accélération de l'hélice
    dnaCtx.clearRect(0, 0, dnaCanvas.width, dnaCanvas.height);
    
    const centerX = dnaCanvas.width / 2;
    const amplitude = 60;
    const frequency = 0.02;
    const maxHeight = dnaCanvas.height * Math.min(scrollPercentage, 1);
    
    // Draw the two strands of the helix
    const strand1Color = '#6200ea';
    const strand2Color = '#ffab00';
    
    dnaCtx.lineWidth = 3;
    dnaCtx.lineCap = 'round';
    
    // Strand 1
    dnaCtx.strokeStyle = strand1Color;
    dnaCtx.beginPath();
    for (let y = 0; y < maxHeight; y += 2) {
        const x = centerX + Math.sin(y * frequency) * amplitude;
        if (y === 0) {
            dnaCtx.moveTo(x, y);
        } else {
            dnaCtx.lineTo(x, y);
        }
    }
    dnaCtx.stroke();
    
    // Strand 2
    dnaCtx.strokeStyle = strand2Color;
    dnaCtx.beginPath();
    for (let y = 0; y < maxHeight; y += 2) {
        const x = centerX - Math.sin(y * frequency) * amplitude;
        if (y === 0) {
            dnaCtx.moveTo(x, y);
        } else {
            dnaCtx.lineTo(x, y);
        }
    }
    dnaCtx.stroke();
    
    // Add glow effect
    dnaCtx.shadowColor = 'rgba(98, 0, 234, 0.5)';
    dnaCtx.shadowBlur = 10;
    dnaCtx.shadowOffsetX = 0;
    dnaCtx.shadowOffsetY = 0;
}

function calculateTimelineScrollProgress() {
    const timelineSection = document.querySelector('.timeline');
    if (!timelineSection) return 0;
    
    const rect = timelineSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress: 0 when timeline enters viewport, 1 when it exits
    let progress = (windowHeight - rect.top) / (windowHeight + rect.height);
    progress = Math.max(0, Math.min(1, progress));
    
    return progress;
}

function animateDna() {
    drawDnaHelix();
    requestAnimationFrame(animateDna);
}

// Initialize DNA canvas
setupDnaCanvas();
animateDna();
window.addEventListener('resize', setupDnaCanvas);
window.addEventListener('scroll', drawDnaHelix);