const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty-select');

// 난이도별 설정값
const difficultySettings = {
  easyha: { pipeSpeed: 1, gap: 150, gravity: 0.35 }, // EASY하 모드
  normal: { pipeSpeed: 1, gap: 120, gravity: 0.5 },  // NORMAL 모드
  hard:   { pipeSpeed: 2, gap: 120, gravity: 0.5 }   // 하드 모드
};

let currentDifficulty = 'hard'; // 기본값: 하드 모드

// Game variables
let bird, pipes, score, gravity, velocity, isGameOver, gameInterval, pipeSpeed, gap;

function applyDifficulty() {
  const setting = difficultySettings[currentDifficulty];
  pipeSpeed = setting.pipeSpeed;
  gap = setting.gap;
  gravity = setting.gravity;
}

function resetGame() {
  applyDifficulty();
  bird = { x: 60, y: 200, w: 32, h: 32 };
  pipes = [];
  score = 0;
  velocity = 0;
  isGameOver = false;
  restartBtn.style.display = 'none';
  scoreDiv.textContent = 'Score: 0';
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 1000/60);
}

function drawBird() {
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
  ctx.strokeStyle = '#333';
  ctx.strokeRect(bird.x, bird.y, bird.w, bird.h);
}

function drawPipes() {
  ctx.fillStyle = '#43a047';
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.w, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipe.w, canvas.height - pipe.bottom);
  });
}

function addPipe() {
  const minHeight = 40;
  const maxHeight = canvas.height - gap - minHeight;
  const top = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  pipes.push({
    x: canvas.width,
    w: 50,
    top: top,
    bottom: top + gap,
    passed: false
  });
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x -= pipeSpeed;
  });
  // Remove pipes that are out of screen
  if (pipes.length && pipes[0].x + pipes[0].w < 0) {
    pipes.shift();
  }
  // Add new pipe
  if (pipes.length === 0 || pipes[pipes.length-1].x < canvas.width - 180) {
    addPipe();
  }
}

function checkCollision() {
  // Ground or ceiling
  if (bird.y < 0 || bird.y + bird.h > canvas.height) return true;
  // Pipes
  return pipes.some(pipe => {
    const inX = bird.x + bird.w > pipe.x && bird.x < pipe.x + pipe.w;
    const inY = bird.y < pipe.top || bird.y + bird.h > pipe.bottom;
    return inX && inY;
  });
}

function updateScore() {
  pipes.forEach(pipe => {
    if (!pipe.passed && pipe.x + pipe.w < bird.x) {
      score++;
      pipe.passed = true;
      scoreDiv.textContent = 'Score: ' + score;
    }
  });
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Bird physics
  velocity += gravity;
  bird.y += velocity;

  // Pipes
  updatePipes();

  // Draw
  drawPipes();
  drawBird();

  // Collision
  if (checkCollision()) {
    gameOver();
    return;
  }

  // Score
  updateScore();
}

function flap() {
  if (isGameOver) return;
  velocity = -7;
}

function gameOver() {
  isGameOver = true;
  clearInterval(gameInterval);
  restartBtn.style.display = '';
}

function restartGame() {
  resetGame();
}

window.addEventListener('keydown', function(e) {
  if (e.code === 'Space' || e.key === ' ') flap();
});
canvas.addEventListener('mousedown', flap);
restartBtn.onclick = restartGame;

difficultySelect.value = currentDifficulty;
difficultySelect.addEventListener('change', function() {
  currentDifficulty = difficultySelect.value;
  resetGame();
});

resetGame();
