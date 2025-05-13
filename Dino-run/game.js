const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 获取屏幕信息
const sysInfo = wx.getSystemInfoSync();
const screenWidth = sysInfo.windowWidth;
const screenHeight = sysInfo.windowHeight;
const pixelRatio = sysInfo.pixelRatio;

// 设置 Canvas 尺寸
canvas.width = screenWidth * pixelRatio;
canvas.height = screenHeight * pixelRatio;
ctx.scale(pixelRatio, pixelRatio);
ctx.imageSmoothingEnabled = false;

// 加载图片
const treesImage = wx.createImage();
treesImage.src = 'images/trees.png';
let treesLoaded = false;
treesImage.onload = () => { treesLoaded = true; console.log('trees.png loaded'); };
treesImage.onerror = () => { console.log('Failed to load trees.png'); };

const waterImage = wx.createImage();
waterImage.src = 'images/water.png';
let waterLoaded = false;
waterImage.onload = () => { waterLoaded = true; console.log('water.png loaded'); };
waterImage.onerror = () => { console.log('Failed to load water.png'); };

const groundImage = wx.createImage();
groundImage.src = 'images/ground.png';
let groundLoaded = false;
groundImage.onload = () => { groundLoaded = true; console.log('ground.png loaded'); };
groundImage.onerror = () => { console.log('Failed to load ground.png'); };

const cloudsImage = wx.createImage();
cloudsImage.src = 'images/clouds.png';
let cloudsLoaded = false;
cloudsImage.onload = () => { cloudsLoaded = true; console.log('clouds.png loaded'); };
cloudsImage.onerror = () => { console.log('Failed to load clouds.png'); };

const sunImage = wx.createImage();
sunImage.src = 'images/sun.png';
let sunLoaded = false;
sunImage.onload = () => { sunLoaded = true; console.log('sun.png loaded'); };
sunImage.onerror = () => { console.log('Failed to load sun.png'); };

const dinoImage = wx.createImage();
dinoImage.src = 'images/Dino.png';
let dinoLoaded = false;
dinoImage.onload = () => { dinoLoaded = true; console.log('Dino.png loaded'); };
dinoImage.onerror = () => { console.log('Failed to load Dino.png'); };

const fireImage = wx.createImage();
fireImage.src = 'images/fire.png';
let fireLoaded = false;
fireImage.onload = () => { fireLoaded = true; console.log('fire.png loaded'); };
fireImage.onerror = () => { console.log('Failed to load fire.png'); };

const cactus1Image = wx.createImage();
cactus1Image.src = 'images/cactus1.png';
let cactus1Loaded = false;
cactus1Image.onload = () => { cactus1Loaded = true; console.log('cactus1.png loaded'); };
cactus1Image.onerror = () => { console.log('Failed to load cactus1.png'); };

const cactus2Image = wx.createImage();
cactus2Image.src = 'images/cactus2.png';
let cactus2Loaded = false;
cactus2Image.onload = () => { cactus2Loaded = true; console.log('cactus2.png loaded'); };
cactus2Image.onerror = () => { console.log('Failed to load cactus2.png'); };

const cactus3Image = wx.createImage();
cactus3Image.src = 'images/cactus3.png';
let cactus3Loaded = false;
cactus3Image.onload = () => { cactus3Loaded = true; console.log('cactus3.png loaded'); };
cactus3Image.onerror = () => { console.log('Failed to load cactus3.png'); };

// 云朵数据
const clouds = [];
const cloudFrameHeight = 16;
const cloudSourceWidth = 64;
const cloudSourceHeight = 15;
const cloudDisplayWidth = cloudSourceWidth * 4;
const cloudDisplayHeight = cloudSourceHeight * 4;
const cloudSpeed = -0.5;
const cloudFrameOffsets = [0, 1, 1];

// 太阳动画数据
const sunFrameWidth = 32;
const sunFrameHeight = 32;
const sunDisplayWidth = sunFrameWidth * 4;
const sunDisplayHeight = sunFrameHeight * 4;
let sunFrame = 0;
let sunFrameCounter = 0;
const sunFrameDelay = 20;

// 地面数据
const groundSourceWidth = 45;
const groundSourceHeight = 12;
const groundDisplayWidth = groundSourceWidth * 4;
const groundDisplayHeight = groundSourceHeight * 4;

// 树背景数据
const treesSourceWidth = 256;
const treesSourceHeight = 128;
const treesDisplayWidth = treesSourceWidth * 3;
const treesDisplayHeight = treesSourceHeight * 3;

// 水面背景数据
const waterSourceWidth = 256;
const waterSourceHeight = 32;
const waterDisplayWidth = waterSourceWidth * 4;
const waterDisplayHeight = waterSourceHeight * 4;

// 恐龙数据
const dinoFrameWidth = 24;
const dinoFrameHeight = 21; // 裁剪底部 3 像素
const dinoDisplayWidth = dinoFrameWidth * 4;
const dinoDisplayHeight = dinoFrameHeight * 4;
const dinoX = 50;
const dinoGroundY = screenHeight - groundDisplayHeight - dinoDisplayHeight;
const dinoCollisionWidth = dinoDisplayWidth * 0.7; // 70% for leniency
const dinoCollisionHeight = dinoDisplayHeight * 0.7; // 70% for leniency
let dino = {
  x: dinoX,
  y: dinoGroundY,
  frame: 0,
  state: 'running', // running, jumping, hit
  jumpVelocity: 0,
  jumpFrameCounter: 0,
  hitFrameCounter: 0
};

// 火焰数据
const fireFrameWidth = 16;
const fireFrameHeight = 16;
const fireDisplayWidth = fireFrameWidth * 4;
const fireDisplayHeight = fireFrameHeight * 4;
const fireCollisionWidth = 8 * 4;
const fireCollisionHeight = 6 * 4;
const fireFrameDelay = 5;

// 仙人掌数据
const cactus1Width = 15;
const cactus1Height = 22;
const cactus1DisplayWidth = cactus1Width * 4;
const cactus1DisplayHeight = cactus1Height * 4;
const cactus1CollisionWidth = cactus1Width * 4;
const cactus1CollisionHeight = cactus1Height * 4;

const cactus2Width = 25;
const cactus2Height = 21;
const cactus2DisplayWidth = cactus2Width * 4;
const cactus2DisplayHeight = cactus2Height * 4;
const cactus2CollisionWidth = cactus2Width * 4;
const cactus2CollisionHeight = cactus2Height * 4;

const cactus3Width = 17;
const cactus3Height = 19;
const cactus3DisplayWidth = cactus3Width * 4;
const cactus3DisplayHeight = cactus3Height * 4;
const cactus3CollisionWidth = cactus3Width * 4;
const cactus3CollisionHeight = cactus3Height * 4;

// 障碍物数据
let obstacles = [];
const obstacleSpawnInterval = 90; // ~3.6 秒
let obstacleSpawnCounter = 0;
const minObstacleGap = dinoDisplayWidth * 5; // 5 个恐龙宽度 (480 像素)

// 动画帧
const runningFrameIndices = [8, 9, 4, 5, 6, 7]; // 帧 9, 10, 5, 6, 7, 8
const hitFrameIndices = [14, 15, 16]; // 帧 15-17
const hitFrameDelay = 5;

// 背景移动速度
const backgroundSpeed = -4; // 保持快速
let groundOffset = 0;
let treesOffset = 0;
let waterOffset = 0;

// 游戏状态
let gameOver = false;

// 计分
let score = 0;

// 初始化云朵
function initClouds() {
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.floor(Math.random() * screenWidth),
      y: Math.floor(Math.random() * (screenHeight * 0.5)),
      frame: Math.floor(Math.random() * 3)
    });
  }
}

// 绘制天空
function drawSky() {
  ctx.fillStyle = '#76ced9';
  ctx.fillRect(0, 0, screenWidth, screenHeight);
}

// 绘制绿色背景树
function drawTreesBackground() {
  if (!treesLoaded) return;
  const yPos = Math.floor(screenHeight - treesDisplayHeight);
  let x = treesOffset % treesDisplayWidth;
  if (x > 0) x -= treesDisplayWidth;
  while (x < screenWidth) {
    ctx.drawImage(treesImage, Math.floor(x), yPos, treesDisplayWidth, treesDisplayHeight);
    x += treesDisplayWidth;
  }
}

// 绘制水面背景
function drawWaterBackground() {
  if (!waterLoaded) return;
  const yPos = Math.floor(screenHeight - waterDisplayHeight);
  let x = waterOffset % waterDisplayWidth;
  if (x > 0) x -= waterDisplayWidth;
  while (x < screenWidth) {
    ctx.drawImage(waterImage, Math.floor(x), yPos, waterDisplayWidth, waterDisplayHeight);
    x += waterDisplayWidth;
  }
}

// 绘制地面
function drawGround() {
  if (!groundLoaded) return;
  const yPos = Math.floor(screenHeight - groundDisplayHeight);
  let x = groundOffset % groundDisplayWidth;
  if (x > 0) x -= groundDisplayWidth;
  while (x < screenWidth) {
    ctx.drawImage(
      groundImage,
      1, 0, groundSourceWidth, groundSourceHeight,
      Math.floor(x), yPos, groundDisplayWidth, groundDisplayHeight
    );
    x += groundDisplayWidth;
  }
}

// 绘制恐龙
function drawDino() {
  if (!dinoLoaded) return;
  let frameIndex;
  if (dino.state === 'running') {
    const frame = Math.floor(dino.frame) % runningFrameIndices.length;
    frameIndex = runningFrameIndices[frame];
  } else if (dino.state === 'jumping') {
    frameIndex = dino.jumpFrameCounter < 10 ? 11 : 12; // 帧 12, 13
  } else if (dino.state === 'hit') {
    const frame = Math.floor(dino.hitFrameCounter / hitFrameDelay);
    frameIndex = hitFrameIndices[Math.min(frame, hitFrameIndices.length - 1)];
  }
  const sx = frameIndex * dinoFrameWidth;
  const sy = 0;
  ctx.drawImage(
    dinoImage,
    sx, sy, dinoFrameWidth, dinoFrameHeight,
    Math.floor(dino.x), Math.floor(dino.y), dinoDisplayWidth, dinoDisplayHeight
  );
}

// 绘制障碍物
function drawObstacles() {
  obstacles.forEach(obstacle => {
    if (obstacle.type === 'fire' && fireLoaded) {
      const sx = obstacle.frame * fireFrameWidth;
      ctx.drawImage(
        fireImage,
        sx, 0, fireFrameWidth, fireFrameHeight,
        Math.floor(obstacle.x), Math.floor(obstacle.y), fireDisplayWidth, fireDisplayHeight
      );
    } else if (obstacle.type === 'cactus') {
      let image, width, height;
      if (obstacle.cactusType === 1 && cactus1Loaded) {
        image = cactus1Image;
        width = cactus1DisplayWidth;
        height = cactus1DisplayHeight;
      } else if (obstacle.cactusType === 2 && cactus2Loaded) {
        image = cactus2Image;
        width = cactus2DisplayWidth;
        height = cactus2DisplayHeight;
      } else if (obstacle.cactusType === 3 && cactus3Loaded) {
        image = cactus3Image;
        width = cactus3DisplayWidth;
        height = cactus3DisplayHeight;
      }
      if (image) {
        ctx.drawImage(
          image,
          0, 0, width / 4, height / 4, // 源尺寸（未缩放）
          Math.floor(obstacle.x), Math.floor(obstacle.y), width, height
        );
      }
    }
  });
}

// 绘制分数
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'black';
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;
  ctx.fillText(`得分: ${Math.floor(score)}`, 10, 30);
  ctx.shadowColor = 'none'; // 重置阴影
}

// 更新恐龙状态
function updateDino() {
  if (dino.state === 'running') {
    dino.frame += 0.2;
    if (dino.frame >= runningFrameIndices.length) dino.frame = 0;
  } else if (dino.state === 'jumping') {
    dino.y += dino.jumpVelocity;
    dino.jumpVelocity += 0.3; // 重力保持 0.3
    dino.jumpFrameCounter++;
    if (dino.y >= dinoGroundY) {
      dino.y = dinoGroundY;
      dino.state = 'running';
      dino.jumpVelocity = 0;
      dino.jumpFrameCounter = 0;
      dino.frame = 0;
    }
  } else if (dino.state === 'hit') {
    dino.hitFrameCounter++;
    if (dino.hitFrameCounter >= hitFrameDelay * hitFrameIndices.length) {
      gameOver = true;
      wx.showModal({
        title: 'Game Over',
        content: `你撞到了障碍物！得分: ${Math.floor(score)}`,
        showCancel: false,
        confirmText: 'OK',
        success: () => {
          wx.exitMiniProgram();
        }
      });
    }
  }
}

// 生成障碍物
function spawnObstacle() {
  if (obstacleSpawnCounter >= obstacleSpawnInterval && obstacles.length < 2) {
    // 检查最近的障碍物距离
    let canSpawn = true;
    if (obstacles.length > 0) {
      const lastObstacle = obstacles[obstacles.length - 1];
      if (screenWidth - lastObstacle.x < minObstacleGap) {
        canSpawn = false;
      }
    }
    if (canSpawn) {
      const isFire = Math.random() < 0.5;
      let yPos, type, cactusType;
      if (isFire) {
        type = 'fire';
        yPos = screenHeight - groundDisplayHeight - fireDisplayHeight;
      } else {
        type = 'cactus';
        cactusType = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
        yPos = screenHeight - groundDisplayHeight - (cactusType === 1 ? cactus1DisplayHeight : cactusType === 2 ? cactus2DisplayHeight : cactus3DisplayHeight);
      }
      obstacles.push({
        type,
        cactusType: type === 'cactus' ? cactusType : undefined,
        x: screenWidth,
        y: yPos,
        frame: type === 'fire' ? 0 : 0,
        frameCounter: 0
      });
      obstacleSpawnCounter = 0;
    }
  } else {
    obstacleSpawnCounter++;
  }
}

// 更新障碍物
function updateObstacles() {
  obstacles.forEach(obstacle => {
    obstacle.x += backgroundSpeed;
    if (obstacle.type === 'fire') {
      obstacle.frameCounter++;
      if (obstacle.frameCounter >= fireFrameDelay) {
        obstacle.frame = (obstacle.frame + 1) % 6;
        obstacle.frameCounter = 0;
      }
    }
  });
  obstacles = obstacles.filter(obstacle => obstacle.x > -Math.max(fireDisplayWidth, cactus1DisplayWidth, cactus2DisplayWidth, cactus3DisplayWidth));
}

// 检查碰撞
function checkCollisions() {
  if (dino.state === 'hit') return; // 受击时跳过碰撞检测
  const dinoLeft = dino.x + (dinoDisplayWidth - dinoCollisionWidth) / 2;
  const dinoRight = dinoLeft + dinoCollisionWidth;
  const dinoTop = dino.y + (dinoDisplayHeight - dinoCollisionHeight) / 2;
  const dinoBottom = dinoTop + dinoCollisionHeight;

  for (const obstacle of obstacles) {
    let obsLeft, obsRight, obsTop, obsBottom;
    if (obstacle.type === 'fire') {
      obsLeft = obstacle.x + (fireDisplayWidth - fireCollisionWidth) / 2;
      obsRight = obsLeft + fireCollisionWidth;
      obsTop = obstacle.y + (fireDisplayHeight - fireCollisionHeight);
      obsBottom = obstacle.y + fireDisplayHeight;
    } else if (obstacle.type === 'cactus') {
      let collisionWidth, collisionHeight;
      if (obstacle.cactusType === 1) {
        collisionWidth = cactus1CollisionWidth;
        collisionHeight = cactus1CollisionHeight;
      } else if (obstacle.cactusType === 2) {
        collisionWidth = cactus2CollisionWidth;
        collisionHeight = cactus2CollisionHeight;
      } else {
        collisionWidth = cactus3CollisionWidth;
        collisionHeight = cactus3CollisionHeight;
      }
      const displayWidth = obstacle.cactusType === 1 ? cactus1DisplayWidth : obstacle.cactusType === 2 ? cactus2DisplayWidth : cactus3DisplayWidth;
      const displayHeight = obstacle.cactusType === 1 ? cactus1DisplayHeight : obstacle.cactusType === 2 ? cactus2DisplayHeight : cactus3DisplayHeight;
      obsLeft = obstacle.x; // No horizontal offset (full width)
      obsRight = obsLeft + collisionWidth;
      obsTop = obstacle.y; // No vertical offset (full height)
      obsBottom = obsTop + collisionHeight;
    }

    if (
      dinoRight > obsLeft &&
      dinoLeft < obsRight &&
      dinoBottom > obsTop &&
      dinoTop < obsBottom
    ) {
      dino.state = 'hit';
      dino.hitFrameCounter = 0;
      break;
    }
  }
}

// 更新背景偏移
function updateBackground() {
  groundOffset += backgroundSpeed;
  if (groundOffset < -groundDisplayWidth) groundOffset += groundDisplayWidth;
  treesOffset += backgroundSpeed * 0.5;
  if (treesOffset < -treesDisplayWidth) treesOffset += treesDisplayWidth;
  waterOffset += backgroundSpeed * 0.8;
  if (waterOffset < -waterDisplayWidth) waterOffset += waterDisplayWidth;
}

// 处理触摸事件
wx.onTouchStart(() => {
  if (dino.state === 'running') {
    dino.state = 'jumping';
    dino.jumpVelocity = -10; // 保持为 -10
    dino.jumpFrameCounter = 0;
  }
});

// 绘制太阳动画
function drawSun() {
  if (!sunLoaded) return;
  const sx = sunFrame * sunFrameWidth;
  const sy = 0;
  const sunX = Math.floor(screenWidth - sunDisplayWidth - 20);
  const sunY = Math.floor(20);
  ctx.drawImage(
    sunImage,
    sx, sy, sunFrameWidth, sunFrameHeight,
    sunX, sunY, sunDisplayWidth, sunDisplayHeight
  );
  if (dino.state !== 'hit') { // 仅在未受击时更新动画
    sunFrameCounter++;
    if (sunFrameCounter >= sunFrameDelay) {
      sunFrameCounter = 0;
      sunFrame = (sunFrame + 1) % 6;
    }
  }
}

// 绘制云朵
function drawClouds() {
  if (!cloudsLoaded) return;
  clouds.forEach(cloud => {
    const sx = 0;
    const sy = cloud.frame * cloudFrameHeight + cloudFrameOffsets[cloud.frame];
    ctx.drawImage(
      cloudsImage,
      sx, sy, cloudSourceWidth, cloudSourceHeight,
      Math.floor(cloud.x), Math.floor(cloud.y), cloudDisplayWidth, cloudDisplayHeight
    );
    if (dino.state !== 'hit') { // 仅在未受击时移动云朵
      cloud.x += cloudSpeed;
      if (cloud.x < -cloudDisplayWidth) {
        cloud.x = screenWidth;
        cloud.y = Math.floor(Math.random() * (screenHeight * 0.5));
        cloud.frame = Math.floor(Math.random() * 3);
      }
    }
  });
}

// 主渲染循环
function gameLoop() {
  if (gameOver) return;

  if (dino.state !== 'hit') {
    updateBackground();
    spawnObstacle();
    updateObstacles();
    score += 0.1; // 减慢到原来的 1/10
  }
  updateDino();
  checkCollisions();

  drawSky();
  drawTreesBackground();
  drawWaterBackground();
  drawGround();
  drawObstacles();
  drawDino();
  drawClouds();
  drawSun();
  drawScore();

  requestAnimationFrame(gameLoop);
}

// 初始化并启动
initClouds();
gameLoop();