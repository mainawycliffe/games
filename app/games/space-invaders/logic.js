export function createGameState(canvasWidth, canvasHeight) {
  const player = { x: canvasWidth / 2 - 15, y: canvasHeight - 40, w: 30, h: 20, speed: 5 };
  const playerLasers = [];
  const alienLasers = [];
  const invaders = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      invaders.push({
        x: c * 45 + 50,
        y: r * 30 + 50,
        w: 25,
        h: 18,
        alive: true,
      });
    }
  }

  return {
    player,
    playerLasers,
    alienLasers,
    invaders,
    invaderVelocity: 1,
    invaderDirection: 1,
    lastPlayerShot: 0,
  };
}

export function updateGame(
  state,
  keys,
  timestamp,
  canvasWidth,
  canvasHeight,
  onWin,
  onLose,
  onScoreIncrease,
) {
  if (keys["ArrowLeft"] && state.player.x > 0) state.player.x -= state.player.speed;
  if (keys["ArrowRight"] && state.player.x < canvasWidth - state.player.w)
    state.player.x += state.player.speed;

  if (keys["Space"] && timestamp - state.lastPlayerShot > 400) {
    state.playerLasers.push({
      x: state.player.x + state.player.w / 2 - 2,
      y: state.player.y,
      w: 4,
      h: 10,
      speed: 6,
    });
    state.lastPlayerShot = timestamp;
  }

  for (let i = state.playerLasers.length - 1; i >= 0; i--) {
    state.playerLasers[i].y -= state.playerLasers[i].speed;
    if (state.playerLasers[i].y < 0) state.playerLasers.splice(i, 1);
  }

  const livingInvaders = state.invaders.filter((inv) => inv.alive);
  if (livingInvaders.length === 0) {
    onWin();
    return;
  }

  if (Math.random() < 0.015 && livingInvaders.length > 0) {
    const randomAlien = livingInvaders[Math.floor(Math.random() * livingInvaders.length)];
    state.alienLasers.push({
      x: randomAlien.x + randomAlien.w / 2,
      y: randomAlien.y + randomAlien.h,
      w: 4,
      h: 10,
      speed: 4,
    });
  }

  for (let i = state.alienLasers.length - 1; i >= 0; i--) {
    const aLaser = state.alienLasers[i];
    aLaser.y += aLaser.speed;

    if (
      aLaser.x < state.player.x + state.player.w &&
      aLaser.x + aLaser.w > state.player.x &&
      aLaser.y < state.player.y + state.player.h &&
      aLaser.y + aLaser.h > state.player.y
    ) {
      onLose();
      return;
    }
    if (aLaser.y > canvasHeight) state.alienLasers.splice(i, 1);
  }

  let shiftDown = false;
  livingInvaders.forEach((inv) => {
    inv.x += state.invaderVelocity * state.invaderDirection;
    if (inv.x + inv.w > canvasWidth || inv.x < 0) shiftDown = true;

    if (inv.y + inv.h >= state.player.y) {
      onLose();
      return;
    }
  });

  if (shiftDown) {
    state.invaderDirection *= -1;
    state.invaderVelocity += 0.15;
    state.invaders.forEach((inv) => (inv.y += 12));
  }

  for (let l = state.playerLasers.length - 1; l >= 0; l--) {
    const laser = state.playerLasers[l];
    for (let i = 0; i < state.invaders.length; i++) {
      const inv = state.invaders[i];
      if (
        inv.alive &&
        laser.x < inv.x + inv.w &&
        laser.x + laser.w > inv.x &&
        laser.y < inv.y + inv.h &&
        laser.y + laser.h > inv.y
      ) {
        inv.alive = false;
        state.playerLasers.splice(l, 1);
        onScoreIncrease(100);
        break;
      }
    }
  }
}
