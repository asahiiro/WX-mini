// game.js
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 获取屏幕信息
const sysInfo = wx.getSystemInfoSync();
const screenWidth = sysInfo.windowWidth; // 逻辑宽度
const screenHeight = sysInfo.windowHeight; // 逻辑高度
const pixelRatio = sysInfo.pixelRatio; // 设备像素比率

// 设置 Canvas 尺寸（考虑像素比率）
canvas.width = screenWidth * pixelRatio;
canvas.height = screenHeight * pixelRatio;
ctx.scale(pixelRatio, pixelRatio); // 缩放上下文以使用逻辑像素绘制

// 禁用图片平滑插值，确保像素化效果
ctx.imageSmoothingEnabled = false;

// 加载 trees.png
const treesImage = wx.createImage();
treesImage.src = 'images/trees.png';
let treesLoaded = false;

treesImage.onload = () => {
  treesLoaded = true;
  console.log('trees.png loaded successfully');
};

treesImage.onerror = () => {
  console.log('Failed to load trees.png');
};

// 加载 water.png
const waterImage = wx.createImage();
waterImage.src = 'images/water.png';
let waterLoaded = false;

waterImage.onload = () => {
  waterLoaded = true;
  console.log('water.png loaded successfully');
};

waterImage.onerror = () => {
  console.log('Failed to load water.png');
};

// 加载 ground.png
const groundImage = wx.createImage();
groundImage.src = 'images/ground.png';
let groundLoaded = false;

groundImage.onload = () => {
  groundLoaded = true;
  console.log('ground.png loaded successfully');
};

groundImage.onerror = () => {
  console.log('Failed to load ground.png');
};

// 加载 clouds.png
const cloudsImage = wx.createImage();
cloudsImage.src = 'images/clouds.png';
let cloudsLoaded = false;

cloudsImage.onload = () => {
  cloudsLoaded = true;
  console.log('clouds.png loaded successfully');
};

cloudsImage.onerror = () => {
  console.log('Failed to load clouds.png');
};

// 加载 sun.png
const sunImage = wx.createImage();
sunImage.src = 'images/sun.png';
let sunLoaded = false;

sunImage.onload = () => {
  sunLoaded = true;
  console.log('sun.png loaded successfully');
};

sunImage.onerror = () => {
  console.log('Failed to load sun.png');
};

// 加载 Dino.png
const dinoImage = wx.createImage();
dinoImage.src = 'images/Dino.png';
let dinoLoaded = false;

dinoImage.onload = () => {
  dinoLoaded = true;
  console.log('Dino.png loaded successfully');
};

dinoImage.onerror = () => {
  console.log('Failed to load Dino.png');
};

// 云朵数据
const clouds = [];
const cloudFrameHeight = 16; // 每帧高度 (48 / 3)
const cloudSourceWidth = 64; // 源宽度
const cloudSourceHeight = 15; // 源高度（减 1 像素以去除白边）
const cloudDisplayWidth = cloudSourceWidth * 4; // 显示宽度（4 倍）
const cloudDisplayHeight = cloudSourceHeight * 4; // 显示高度（4 倍）
const cloudSpeed = -0.5; // 每帧向左移动 0.5 像素
const cloudFrameOffsets = [0, 1, 1]; // 第 1 和第 2 帧偏移 1 像素

// 太阳动画数据
const sunFrameWidth = 32; // 每帧宽度 (192 / 6)
const sunFrameHeight = 32; // 每帧高度
const sunDisplayWidth = sunFrameWidth * 4; // 显示宽度（4 倍）
const sunDisplayHeight = sunFrameHeight * 4; // 显示高度（4 倍）
let sunFrame = 0;
let sunFrameCounter = 0;
const sunFrameDelay = 20; // 每 20 帧切换一次

// 地面数据
const groundSourceWidth = 45; // 裁剪左 1 像素，右 2 像素（48 - 1 - 2）
const groundSourceHeight = 12; // 裁剪下 3 行透明像素（15 - 3）
const groundDisplayWidth = groundSourceWidth * 4; // 4 倍放大
const groundDisplayHeight = groundSourceHeight * 4; // 显示高度

// 树背景数据
const treesSourceWidth = 256;
const treesSourceHeight = 128;
const treesDisplayWidth = treesSourceWidth * 3; // 3 倍放大（0.75 * 4）
const treesDisplayHeight = treesSourceHeight * 3;

// 水面背景数据
const waterSourceWidth = 256;
const waterSourceHeight = 32;
const waterDisplayWidth = waterSourceWidth * 4; // 4 倍放大
const waterDisplayHeight = waterSourceHeight * 4;

// 恐龙数据
const dinoFrameWidth = 24; // 每帧宽度 (576 / 24)
const dinoFrameHeight = 21; // 每帧高度（裁剪底部 3 像素，24 - 3）
const dinoDisplayWidth = dinoFrameWidth * 4; // 显示宽度（4 倍）
const dinoDisplayHeight = dinoFrameHeight * 4; // 显示高度（4 倍）
const dinoX = 50; // 横向固定位置（屏幕左侧）
const dinoGroundY = screenHeight - groundDisplayHeight - dinoDisplayHeight; // 底边对齐地面顶部
let dino = {
  x: dinoX,
  y: dinoGroundY,
  frame: 0, // 当前帧
  state: 'running', // 状态：running, jumping
  jumpVelocity: 0, // 跳跃速度
  jumpFrameCounter: 0, // 跳跃动画帧计数
};


// 背景移动速度
const backgroundSpeed = -2; // 每帧向左移动 2 像素
let groundOffset = 0; // 地面平铺偏移
let treesOffset = 0; // 树背景平铺偏移
let waterOffset = 0; // 水面平铺偏移

// 初始化云朵
function initClouds() {
  for (let i = 0; i < 5; i++) { // 生成 5 朵云
    clouds.push({
      x: Math.floor(Math.random() * screenWidth), // 整数坐标
      y: Math.floor(Math.random() * (screenHeight * 0.5)), // 云朵在上半屏幕
      frame: Math.floor(Math.random() * 3), // 随机选择 0, 1, 2 帧
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
  if (!treesLoaded) {
    console.log('trees.png not loaded yet');
    return;
  }
  const yPos = Math.floor(screenHeight - treesDisplayHeight); // 底边对齐，整数
  // 使用偏移实现循环移动
  let x = treesOffset % treesDisplayWidth;
  if (x > 0) x -= treesDisplayWidth; // 确保从负偏移开始
  while (x < screenWidth) {
    ctx.drawImage(treesImage, Math.floor(x), yPos, treesDisplayWidth, treesDisplayHeight);
    x += treesDisplayWidth;
  }
}

// 绘制水面背景
function drawWaterBackground() {
  if (!waterLoaded) {
    console.log('water.png not loaded yet');
    return;
  }
  const yPos = Math.floor(screenHeight - waterDisplayHeight); // 底边对齐，整数
  // 使用偏移实现循环移动
  let x = waterOffset % waterDisplayWidth;
  if (x > 0) x -= waterDisplayWidth; // 确保从负偏移开始
  while (x < screenWidth) {
    ctx.drawImage(waterImage, Math.floor(x), yPos, waterDisplayWidth, waterDisplayHeight);
    x += waterDisplayWidth;
  }
}

// 绘制地面
function drawGround() {
  if (!groundLoaded) {
    console.log('ground.png not loaded yet');
    return;
  }
  const yPos = Math.floor(screenHeight - groundDisplayHeight); // 底边对齐，整数
  // 使用偏移实现循环移动
  let x = groundOffset % groundDisplayWidth;
  if (x > 0) x -= groundDisplayWidth; // 确保从负偏移开始
  while (x < screenWidth) {
    ctx.drawImage(
      groundImage,
      1, 0, groundSourceWidth, groundSourceHeight, // 源区域（裁剪左 1 像素，右 2 像素，上 12 像素）
      Math.floor(x), yPos, groundDisplayWidth, groundDisplayHeight // 目标区域
    );
    x += groundDisplayWidth;
  }
}

const runningFrameIndices = [8, 9, 4, 5, 6, 7];

// 绘制恐龙
function drawDino() {
  if (!dinoLoaded) {
    console.log('Dino.png not loaded yet');
    return;
  }
  let frameIndex;
  if (dino.state === 'running') {
    // 奔跑动画：使用指定的帧顺序
    const frame = Math.floor(dino.frame) % runningFrameIndices.length; // 0 到 5
    frameIndex = runningFrameIndices[frame]; // 获取对应索引
  } else if (dino.state === 'jumping') {
    // 跳跃动画：帧 12-13（索引 11-12），播放一次，放慢到 10 帧
    if (dino.jumpFrameCounter < 10) {
      frameIndex = 11; // 第一帧（帧 12，索引 11），持续 10 帧
    } else {
      frameIndex = 12; // 第二帧（帧 13，索引 12），保持直到落地
    }
  }
  const sx = frameIndex * dinoFrameWidth;
  const sy = 0;
  ctx.drawImage(
    dinoImage,
    sx, sy, dinoFrameWidth, dinoFrameHeight, // 源区域（高度裁剪为 21）
    Math.floor(dino.x), Math.floor(dino.y), dinoDisplayWidth, dinoDisplayHeight // 目标区域
  );
}

// 更新恐龙状态
function updateDino() {
  if (dino.state === 'running') {
    // 奔跑动画：每 5 帧切换（速度适中）
    dino.frame += 0.2; // 0.2 * 25 帧 = 5 帧切换一次
    if (dino.frame >= runningFrameIndices.length) dino.frame = 0; // 循环 6 帧
  } else if (dino.state === 'jumping') {
    // 跳跃物理
    dino.y += dino.jumpVelocity;
    dino.jumpVelocity += 0.5; // 重力加速度
    // 跳跃动画：计数器递增
    dino.jumpFrameCounter++;
    // 回到地面
    if (dino.y >= dinoGroundY) {
      dino.y = dinoGroundY;
      dino.state = 'running';
      dino.jumpVelocity = 0;
      dino.jumpFrameCounter = 0;
      dino.frame = 0;
    }
  }
}

// 绘制云朵
function drawClouds() {
  if (!cloudsLoaded) {
    console.log('clouds.png not loaded yet');
    return;
  }
  clouds.forEach(cloud => {
    const sx = 0; // 精灵图 x 坐标
    const sy = cloud.frame * cloudFrameHeight + cloudFrameOffsets[cloud.frame]; // 偏移去除白边
    ctx.drawImage(
      cloudsImage,
      sx, sy, cloudSourceWidth, cloudSourceHeight, // 源区域
      Math.floor(cloud.x), Math.floor(cloud.y), cloudDisplayWidth, cloudDisplayHeight // 目标区域
    );

    // 更新云朵位置
    cloud.x += cloudSpeed;
    if (cloud.x < -cloudDisplayWidth) {
      cloud.x = screenWidth; // 移到屏幕右边
      cloud.y = Math.floor(Math.random() * (screenHeight * 0.5));
      cloud.frame = Math.floor(Math.random() * 3); // 随机选择新云样式
    }
  });
}

// 绘制太阳动画
function drawSun() {
  if (!sunLoaded) {
    console.log('sun.png not loaded yet');
    return;
  }

  const sx = sunFrame * sunFrameWidth;
  const sy = 0;
  const sunX = Math.floor(screenWidth - sunDisplayWidth - 20); // 右上角，留 20 像素边距
  const sunY = Math.floor(20);

  ctx.drawImage(
    sunImage,
    sx, sy, sunFrameWidth, sunFrameHeight, // 源区域
    sunX, sunY, sunDisplayWidth, sunDisplayHeight // 目标区域
  );

  // 更新动画帧
  sunFrameCounter++;
  if (sunFrameCounter >= sunFrameDelay) {
    sunFrameCounter = 0;
    sunFrame = (sunFrame + 1) % 6; // 循环 0-5
  }
}

// 处理触摸事件
wx.onTouchStart(() => {
  if (dino.state === 'running') {
    dino.state = 'jumping';
    dino.jumpVelocity = -10; // 初始上跳速度
    dino.jumpFrameCounter = 0;
  }
});

// 更新背景偏移
function updateBackground() {
  groundOffset += backgroundSpeed;
  if (groundOffset < -groundDisplayWidth) {
    groundOffset += groundDisplayWidth; // 循环偏移
  }
  treesOffset += backgroundSpeed * 0.5; // 树背景移动慢一些，增加层次感
  if (treesOffset < -treesDisplayWidth) {
    treesOffset += treesDisplayWidth;
  }
  waterOffset += backgroundSpeed * 0.8; // 水面移动稍慢
  if (waterOffset < -waterDisplayWidth) {
    waterOffset += waterDisplayWidth;
  }
}

// 主渲染循环
function gameLoop() {
  // 更新状态
  updateBackground();
  updateDino();

  // 绘制
  drawSky();
  drawTreesBackground();
  drawWaterBackground();
  drawGround();
  drawDino();
  drawClouds();
  drawSun();

  requestAnimationFrame(gameLoop);
}

// 初始化并启动
initClouds();
gameLoop();