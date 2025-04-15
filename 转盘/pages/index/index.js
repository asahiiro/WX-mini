Page({
  data: {
    isRotating: false,
    angle: 0,
    canvasSize: 450,
    drawChances: 5,
    activeButton: '',
    numberJump: false,
    prizes: [
      { name: '品牌手机', icon: 'https://data-wyzmv.kinsta.page/icon/礼物.png', tempPath: '' },
      { name: '加湿器', icon: 'https://data-wyzmv.kinsta.page/icon/礼物.png', tempPath: '' },
      { name: '5元红包', icon: 'https://data-wyzmv.kinsta.page/icon/red-envelope.png', tempPath: '' },
      { name: '谢谢参与', icon: 'https://data-wyzmv.kinsta.page/icon/kawaii-ghost.png', tempPath: '' },
      { name: '20积分', icon: 'https://data-wyzmv.kinsta.page/icon/coin.png', tempPath: '' },
      { name: '10积分', icon: 'https://data-wyzmv.kinsta.page/icon/coin.png', tempPath: '' },
    ],
  },

  onButtonTouchStart(e) {
    if (!this.data.isRotating && (e.currentTarget.dataset.id === 'reset' || this.data.drawChances > 0)) {
      const buttonId = e.currentTarget.dataset.id;
      this.setData({ activeButton: buttonId });
      setTimeout(() => {
        if (this.data.activeButton === buttonId) {
          this.setData({ activeButton: buttonId + '-press' });
        }
      }, 100);
    }
  },

  onButtonTouchEnd() {
    this.setData({ activeButton: '' });
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const maxCanvasSize = Math.min(systemInfo.windowWidth * 0.9, 450);
    this.setData({ canvasSize: maxCanvasSize });
    this.preloadIcons().then(() => {
      this.initTurntable();
    });
  },

  preloadIcons() {
    const promises = this.data.prizes.map((prize, index) =>
      new Promise((resolve) => {
        wx.downloadFile({
          url: prize.icon,
          success: (res) => {
            const updatedPrizes = [...this.data.prizes];
            updatedPrizes[index].tempPath = res.tempFilePath;
            this.setData({ prizes: updatedPrizes });
            console.log('图标预加载成功：', prize.icon);
            resolve();
          },
          fail: (err) => {
            console.error('图标预加载失败：', prize.icon, err);
            resolve();
          },
        });
      })
    );
    return Promise.all(promises);
  },

  initTurntable() {
    this.ctx = wx.createCanvasContext('turntableCanvas');
    this.drawTurntable(0);
  },

  drawTurntable(angle) {
    const ctx = this.ctx;
    const canvasWidth = this.data.canvasSize;
    const canvasHeight = this.data.canvasSize;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = canvasWidth * 0.4;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((angle * Math.PI) / 180);

    const prizes = this.data.prizes;
    const colors = ['#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226'];
    const anglePerPrize = 360 / prizes.length;

    for (let i = 0; i < prizes.length; i++) {
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, (i * anglePerPrize * Math.PI) / 180, ((i + 1) * anglePerPrize * Math.PI) / 180);
      ctx.fill();

      ctx.save();
      ctx.rotate(((i + 0.5) * anglePerPrize * Math.PI) / 180);
      const textX = Math.max(80, canvasWidth * 0.2);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Pixel';
      ctx.fillText(prizes[i].name, textX, 10);
      if (prizes[i].tempPath) {
        ctx.drawImage(prizes[i].tempPath, 40, -20, 40, 40);
      } else {
        console.warn('图标未加载：', prizes[i].icon);
      }
      ctx.restore();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#780000';
    ctx.lineWidth = 6;
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();

    ctx.beginPath();
    ctx.fillStyle = '#c1121f';
    ctx.moveTo(centerX, centerY - 34);
    ctx.lineTo(centerX - 9, centerY);
    ctx.lineTo(centerX + 9, centerY);
    ctx.fill();

    ctx.draw();
    console.log('转盘绘制，角度：', angle, '画布尺寸：', canvasWidth);
  },

  startRotate() {
    if (this.data.isRotating || this.data.drawChances <= 0) {
      console.log('无法抽奖：', this.data.isRotating ? '正在旋转' : '次数用尽');
      return;
    }

    // 立即减少次数并触发跳动
    this.setData({
      drawChances: this.data.drawChances - 1,
      numberJump: true,
    });
    setTimeout(() => this.setData({ numberJump: false }), 300);

    console.log('开始新一轮旋转，剩余次数：', this.data.drawChances);
    this.setData({ isRotating: true });

    let currentAngle = this.data.angle;
    let velocity = 30 + Math.random() * 10;
    const decelerate = 0.98;
    const stopVelocity = 1;
    const minAngle = 360 * 4;
    const startTime = Date.now();

    const animate = () => {
      currentAngle += velocity;
      velocity *= decelerate;

      this.drawTurntable(currentAngle % 360);
      this.setData({ angle: currentAngle });

      if (velocity <= stopVelocity && currentAngle >= minAngle) {
        const finalAngle = currentAngle % 360;
        const anglePerPrize = 360 / this.data.prizes.length;
        let prizeIndex = Math.floor((360 - finalAngle - 90) / anglePerPrize) % this.data.prizes.length;
        if (prizeIndex < 0) prizeIndex += this.data.prizes.length;

        this.drawTurntable(finalAngle);
        this.setData({
          isRotating: false,
          angle: currentAngle,
        });
        console.log('旋转停止，结果：', this.data.prizes[prizeIndex].name, '角度：', finalAngle, '剩余次数：', this.data.drawChances);
        console.log('奖品范围：', this.data.prizes.map((p, i) => `${p.name}: ${(i * 60 - 90) % 360}-${((i + 1) * 60 - 90) % 360}°`));
        wx.showModal({
          title: '抽奖结果',
          content: `恭喜获得：${this.data.prizes[prizeIndex].name}`,
          showCancel: false,
        });
        return;
      }

      if (Date.now() - startTime > 8000) {
        console.error('旋转超时，强制停止');
        const finalAngle = currentAngle % 360;
        let prizeIndex = Math.floor((360 - finalAngle - 90) / (360 / this.data.prizes.length)) % this.data.prizes.length;
        if (prizeIndex < 0) prizeIndex += this.data.prizes.length;

        this.setData({
          isRotating: false,
        });
        this.drawTurntable(finalAngle);
        wx.showModal({
          title: '错误',
          content: '抽奖超时，获得：' + this.data.prizes[prizeIndex].name,
          showCancel: false,
        });
        return;
      }

      setTimeout(animate, 20);
    };

    animate();
  },

  reset() {
    if (this.data.isRotating) {
      console.log('正在旋转，无法重置');
      return;
    }

    this.setData({
      numberJump: true,
    });
    setTimeout(() => this.setData({ numberJump: false }), 300);

    this.setData({
      isRotating: false,
      angle: 0,
      drawChances: 5,
    });
    this.drawTurntable(0);
    console.log('转盘已重置，次数：', this.data.drawChances);
  },
});