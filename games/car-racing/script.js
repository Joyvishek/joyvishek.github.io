document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('status');
    const startBtn = document.getElementById('start');
    const leftBtn = document.getElementById('left');
    const rightBtn = document.getElementById('right');

    const LANES = 3;
    const ROAD_MARGIN = 20;
    const roadWidth = canvas.width - ROAD_MARGIN * 2;
    const laneWidth = roadWidth / LANES;
    const CAR_W = laneWidth * 0.6;
    const CAR_H = 40;

    let best = parseInt(localStorage.getItem('carRacingBestScore') || '0', 10);
    bestEl.textContent = best;

    let lane, playerY, enemies, score, speed, distance, running, lastSpawn, markerOffset, animId, lastTime;

    function laneX(l) {
        return ROAD_MARGIN + l * laneWidth + laneWidth / 2 - CAR_W / 2;
    }

    function init() {
        lane = 1;
        playerY = canvas.height - CAR_H - 20;
        enemies = [];
        score = 0;
        speed = 2.2;
        distance = 0;
        lastSpawn = 0;
        markerOffset = 0;
        running = true;
        lastTime = performance.now();
        scoreEl.textContent = '0';
        statusEl.textContent = 'Use ← → or A/D to steer';
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(loop);
    }

    function spawnEnemy() {
        const l = Math.floor(Math.random() * LANES);
        const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#e67e22', '#1abc9c'];
        enemies.push({
            lane: l,
            y: -CAR_H,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }

    function collides(ax, ay, bx, by) {
        return ax < bx + CAR_W && ax + CAR_W > bx && ay < by + CAR_H && ay + CAR_H > by;
    }

    function loop(now) {
        const dt = now - lastTime;
        lastTime = now;
        if (!running) return;

        distance += speed;
        score = Math.floor(distance / 5);
        scoreEl.textContent = score;
        speed = 2.2 + distance / 4000;

        markerOffset = (markerOffset + speed) % 40;

        lastSpawn += dt;
        const spawnInterval = Math.max(500, 1100 - speed * 100);
        if (lastSpawn > spawnInterval) {
            lastSpawn = 0;
            spawnEnemy();
        }

        const px = laneX(lane);
        enemies.forEach(e => e.y += speed);
        enemies = enemies.filter(e => e.y < canvas.height + CAR_H);

        for (const e of enemies) {
            const ex = laneX(e.lane);
            if (collides(px, playerY, ex, e.y)) {
                endGame();
                break;
            }
        }

        draw(px);
        if (running) animId = requestAnimationFrame(loop);
    }

    function draw(px) {
        ctx.fillStyle = '#2f2f2f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#555';
        ctx.fillRect(ROAD_MARGIN, 0, roadWidth, canvas.height);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 16]);
        for (let l = 1; l < LANES; l++) {
            const x = ROAD_MARGIN + l * laneWidth;
            ctx.beginPath();
            ctx.moveTo(x, markerOffset - 40);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        enemies.forEach(e => drawCar(laneX(e.lane), e.y, e.color));
        drawCar(px, playerY, '#667eea');
    }

    function drawCar(x, y, color) {
        const w = CAR_W;
        const h = CAR_H;
        const r = w * 0.22;

        ctx.save();

        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        roundRect(x + 2, y + 3, w, h, r);
        ctx.fill();

        // body
        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, shade(color, -20));
        grad.addColorStop(0.5, color);
        grad.addColorStop(1, shade(color, -20));
        ctx.fillStyle = grad;
        roundRect(x, y, w, h, r);
        ctx.fill();

        // wheels
        ctx.fillStyle = '#1a1a1a';
        const wheelW = w * 0.14;
        const wheelH = h * 0.22;
        ctx.fillRect(x - wheelW * 0.4, y + h * 0.12, wheelW, wheelH);
        ctx.fillRect(x + w - wheelW * 0.6, y + h * 0.12, wheelW, wheelH);
        ctx.fillRect(x - wheelW * 0.4, y + h * 0.66, wheelW, wheelH);
        ctx.fillRect(x + w - wheelW * 0.6, y + h * 0.66, wheelW, wheelH);

        // windshield + rear window
        ctx.fillStyle = 'rgba(200,230,255,0.85)';
        roundRect(x + w * 0.16, y + h * 0.14, w * 0.68, h * 0.22, r * 0.4);
        ctx.fill();
        roundRect(x + w * 0.16, y + h * 0.64, w * 0.68, h * 0.22, r * 0.4);
        ctx.fill();

        // center roof stripe
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x + w * 0.46, y + h * 0.1, w * 0.08, h * 0.8);

        // lights
        ctx.fillStyle = '#fff5c2';
        ctx.fillRect(x + w * 0.08, y + h * 0.02, w * 0.18, h * 0.06);
        ctx.fillRect(x + w * 0.74, y + h * 0.02, w * 0.18, h * 0.06);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(x + w * 0.08, y + h * 0.92, w * 0.18, h * 0.06);
        ctx.fillRect(x + w * 0.74, y + h * 0.92, w * 0.18, h * 0.06);

        ctx.restore();
    }

    function roundRect(x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function shade(hex, percent) {
        const num = parseInt(hex.slice(1), 16);
        let r = (num >> 16) + percent;
        let g = ((num >> 8) & 0xff) + percent;
        let b = (num & 0xff) + percent;
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    }

    function endGame() {
        running = false;
        cancelAnimationFrame(animId);
        statusEl.textContent = 'Game Over! Score: ' + score;
        if (score > best) {
            best = score;
            localStorage.setItem('carRacingBestScore', best);
            bestEl.textContent = best;
        }
    }

    function move(dir) {
        if (!running) return;
        lane = Math.min(LANES - 1, Math.max(0, lane + dir));
    }

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                move(-1);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                move(1);
                break;
        }
    });

    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); move(-1); }, { passive: false });
    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); move(1); }, { passive: false });
    leftBtn.addEventListener('click', () => move(-1));
    rightBtn.addEventListener('click', () => move(1));

    startBtn.addEventListener('click', init);

    lane = 1;
    playerY = canvas.height - CAR_H - 20;
    enemies = [];
    draw(laneX(lane));
});
