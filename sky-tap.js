console.log("Script loaded ✅");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficulty");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let clouds = [], powerUps = [], bombs = [];
let score = 0, lives = 3;
let lastCloud = 0, lastPowerUp = 0, lastBomb = 0;
let cloudInterval = 2500, powerUpInterval = 5000, bombInterval = 800;
let gameStarted = false;
let superFastMode = false;

const bgImg = new Image(); bgImg.src = "assets/background.png";
const cloudImg = new Image(); cloudImg.src = "assets/cloud.png";
const bombImg = new Image(); bombImg.src = "assets/bomb.png";

bgImg.onload = () => startCountdown();
bgImg.onerror = () => startCountdown(); // Start even if image fails to load

function startCountdown() {
  let countdown = 3;
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdown > 0 ? countdown : "Gooo!", WIDTH / 2, HEIGHT / 2);
    if (countdown === 0) {
      clearInterval(interval);
      gameStarted = true;
      updateGame();
    }
    countdown--;
  }, 1000);
}

function resetGame() {
  clouds = [];
  powerUps = [];
  bombs = [];
  score = 0;
  lives = 3;
  gameStarted = false;
  gameOverScreen.style.display = "none";
  canvas.style.display = "block";
  setDifficulty(difficultySelect ? difficultySelect.value : "normal");
  startCountdown();
}

function endGame() {
  gameStarted = false;
  canvas.style.display = "none";
  finalScore.textContent = `Your score: ${score}`;
  gameOverScreen.style.display = "block";
}

restartBtn.addEventListener("click", resetGame);

function setDifficulty(level) {
  if (level === "easy") {
    cloudInterval = 3500;
    bombInterval = 3000;
    powerUpInterval = 4000;
  } else if (level === "normal") {
    cloudInterval = 2500;
    bombInterval = 800;
    powerUpInterval = 5000;
  } else if (level === "hard") {
    cloudInterval = 1800;
    bombInterval = 500;
    powerUpInterval = 6000;
  } else if (level === "insane") {
    cloudInterval = 1200;
    bombInterval = 300;
    powerUpInterval = 8000;
  }
  superFastMode = false;
}

if (difficultySelect) {
  setDifficulty(difficultySelect.value);
  difficultySelect.addEventListener("change", e => {
    setDifficulty(e.target.value);
  });
} else {
  setDifficulty("normal");
}

function spawnCloud() {
  const size = 50;
  clouds = [];
  // Spawn cloud
  const cloudX = Math.random() * (WIDTH - size - 50); // leave room for bomb
  const cloudY = Math.random() * (HEIGHT - size);
  clouds.push({
    x: cloudX,
    y: cloudY,
    size: size,
    angle: Math.random() * 360,
    createdAt: Date.now()
  });
  // Spawn bomb beside cloud (right side, same y)
  bombs.push({
    x: Math.min(cloudX + size + 10, WIDTH - 40),
    y: cloudY,
    size: 40,
    createdAt: Date.now()
  });
}

function spawnPowerUp() {
  const size = 40;
  if (lives >= 5) return;
  powerUps.push({
    x: Math.random() * (WIDTH - size),
    y: Math.random() * (HEIGHT - size),
    size: size,
    createdAt: Date.now()
  });
}

function spawnBomb() {
  const size = 40;
  bombs.push({
    x: Math.random() * (WIDTH - size),
    y: Math.random() * (HEIGHT - size),
    size: size,
    createdAt: Date.now()
  });
}

function drawCloud(c) {
  ctx.save();
  ctx.translate(c.x + c.size / 2, c.y + c.size / 2);
  ctx.rotate((c.angle * Math.PI) / 180);
  ctx.drawImage(cloudImg, -c.size / 2, -c.size / 2, c.size, c.size);
  ctx.restore();
}

function drawPowerUp(p) {
  const age = Date.now() - p.createdAt;
  const pulse = Math.sin(age / 100) * 5;
  const alpha = 1 - age / 1000;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ff69b4";
  ctx.beginPath();
  ctx.arc(p.x + p.size / 2, p.y + p.size / 2 + pulse, p.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "16px Arial";
  ctx.fillText("+❤️", p.x + 5, p.y + p.size / 2 + 5 + pulse);
  ctx.restore();
}

function drawBomb(b) {
  const age = Date.now() - b.createdAt;
  const pulse = Math.sin(age / 100) * 5;
  const alpha = 1 - age / 5000;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(bombImg, b.x, b.y + pulse, b.size, b.size);
  ctx.restore();
}

function drawHUD() {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Score: ${score}`, 20, 20);
  ctx.fillText(`Lives: ${lives}`, 20, 60);
  ctx.restore();
}

function updateGame() {
  if (!gameStarted) return;

  // Difficulty-based speed up for easy mode
  if (difficultySelect && difficultySelect.value === "easy") {
    if (score >= 50 && !superFastMode) {
      cloudInterval = 600;
      bombInterval = 250;
      superFastMode = true;
    } else if (score >= 10 && score < 50 && cloudInterval !== 1200) {
      cloudInterval = 1200;
      bombInterval = 600;
      superFastMode = false;
    } else if (score < 10 && cloudInterval !== 3500) {
      cloudInterval = 3500;
      bombInterval = 3000;
      superFastMode = false;
    }
  }

  const now = Date.now();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);

  if (now - lastCloud > cloudInterval) {
    spawnCloud(); lastCloud = now;
  }
  if (now - lastPowerUp > powerUpInterval) {
    spawnPowerUp(); lastPowerUp = now;
  }
  if (now - lastBomb > bombInterval) {
    spawnBomb(); lastBomb = now;
  }

  // Clouds: if missed in super fast mode, decrease lives
  clouds = clouds.filter(c => {
    if (now - c.createdAt > 3000) {
      if (superFastMode) {
        lives = Math.max(0, lives - 1);
        if (lives <= 0) endGame();
      }
      return false;
    }
    drawCloud(c); return true;
  });

  powerUps = powerUps.filter(p => {
    if (now - p.createdAt > 1000) return false;
    drawPowerUp(p); return true;
  });

  bombs = bombs.filter(b => {
    if (now - b.createdAt > 5000) return false; // Bombs stay for 5 seconds
    drawBomb(b); return true;
  });

  drawHUD();

  // End game if lives reach 0
  if (lives <= 0) {
    endGame();
    return;
  }

  requestAnimationFrame(updateGame);
}

canvas.addEventListener("click", e => {
  if (!gameStarted) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i];
    const dx = x - (c.x + c.size / 2);
    const dy = y - (c.y + c.size / 2);
    if (Math.sqrt(dx * dx + dy * dy) < c.size / 2) {
      clouds.splice(i, 1);
      score++;
      clickSound.play().catch(() => {});
      return;
    }
  }

  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i];
    const dx = x - (p.x + p.size / 2);
    const dy = y - (p.y + p.size / 2);
    if (Math.sqrt(dx * dx + dy * dy) < p.size / 2) {
      powerUps.splice(i, 1);
      lives = Math.min(lives + 1, 5);
      lifeSound.play().catch(() => {});
      return;
    }
  }

  for (let i = 0; i < bombs.length; i++) {
    const b = bombs[i];
    const dx = x - (b.x + b.size / 2);
    const dy = y - (b.y + b.size / 2);
    if (Math.sqrt(dx * dx + dy * dy) < b.size / 2) {
      bombs.splice(i, 1);
      lives -= 2;
      boomSound.play().catch(() => {});
      if (lives <= 0) endGame();
      return;
    }
  }
});