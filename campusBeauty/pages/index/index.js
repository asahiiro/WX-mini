// pages/index/index.js
Page({
  data: {
    flowers: [
      { id: 1, name: '白樱花', desc: '如雪飘落，纯净无暇', images: ['/images/white-sakura-1.jpg', '/images/white-sakura-2.jpg', '/images/white-sakura-3.jpg', '/images/white-sakura-4.jpg', '/images/white-sakura-5.jpg', '/images/white-sakura-6.jpg', '/images/white-sakura-7.jpg', '/images/white-sakura-8.jpg', '/images/white-sakura-9.jpg'] },
      { id: 2, name: '粉樱花', desc: '春风轻吻，娇艳欲滴', images: ['/images/pink-sakura-1.jpg', '/images/pink-sakura-2.jpg'] },
      { id: 3, name: '白玉兰', desc: '洁白高雅，清香袭人', images: ['/images/white-magnolia-1.jpg', '/images/white-magnolia-2.jpg'] },
      { id: 4, name: '紫玉兰', desc: '紫韵天成，华贵静谧', images: ['/images/purple-magnolia.jpg'] },
      { id: 5, name: '紫花地丁', desc: '小巧玲珑，紫意盎然', images: ['/images/viola.jpg'] },
      { id: 6, name: '迎春花', desc: '金黄迎春，暖意融融', images: ['/images/yingchun-1.jpg', '/images/yingchun-2.jpg', '/images/yingchun-3.jpg'] }
    ],
    currentBgSrc: '',
    bgAnimation: {},
    musicList: [
      { id: 1, name: '春风', src: 'http://example.com/music/spring.mp3' },
      { id: 2, name: '花开', src: 'http://example.com/music/flower.mp3' },
      { id: 3, name: '静夜', src: 'http://example.com/music/night.mp3' }
    ],
    currentMusicId: null,
    isPlaying: false,
    showMusicPanel: false,
    volume: 50,
    panelAnimation: {}
  },

  onLoad() {
    this.startBackgroundAnimation();
    this.setData({
      currentBgSrc: this.data.flowers[0].images[0]
    });
    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    this.backgroundAudioManager.onPause(() => {
      this.setData({ isPlaying: false });
    });
    this.backgroundAudioManager.onStop(() => {
      this.setData({ isPlaying: false });
    });
  },

  startBackgroundAnimation() {
    const animation = wx.createAnimation({
      duration: 12000,
      timingFunction: 'ease-in-out',
      loop: true
    });
    animation
      .translate(50, 50)
      .scale(1.2)
      .step()
      .translate(-50, -50)
      .scale(1.1)
      .step();
    this.setData({
      bgAnimation: animation.export()
    });
  },

  onVerticalChange(e) {
    const current = e.detail.current;
    if (current > 0) {
      const flowerIndex = current - 1;
      const firstImage = this.data.flowers[flowerIndex].images[0];
      this.setData({
        currentBgSrc: firstImage
      });
    }
  },

  onHorizontalChange(e) {
    const flowerId = e.currentTarget.dataset.flowerId;
    const current = e.detail.current;
    const flower = this.data.flowers.find(f => f.id === flowerId);
    if (flower) {
      this.setData({
        currentBgSrc: flower.images[current]
      });
    }
  },

  toggleMusicPanel() {
    const show = !this.data.showMusicPanel;
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    });
    if (show) {
      animation.translateY(0).opacity(1).step(); // 从隐藏位置滑到紧靠图标
    } else {
      animation.translateY(100).opacity(0).step(); // 滑回隐藏位置
    }
    this.setData({
      showMusicPanel: show,
      panelAnimation: animation.export()
    });
  },

  selectMusic(e) {
    const id = e.currentTarget.dataset.id;
    const music = this.data.musicList.find(m => m.id === id);
    if (music) {
      this.backgroundAudioManager.src = music.src;
      this.backgroundAudioManager.title = music.name;
      this.backgroundAudioManager.play();
      this.setData({
        currentMusicId: id,
        isPlaying: true
      });
    }
  },

  playPauseMusic() {
    if (this.data.isPlaying) {
      this.backgroundAudioManager.pause();
    } else {
      if (!this.backgroundAudioManager.src && this.data.musicList.length > 0) {
        this.selectMusic({ currentTarget: { dataset: { id: this.data.musicList[0].id } } });
      } else {
        this.backgroundAudioManager.play();
      }
    }
  },

  stopMusic() {
    this.backgroundAudioManager.stop();
    this.setData({
      isPlaying: false
    });
  },

  adjustVolume(e) {
    const volume = e.detail.value / 100;
    this.backgroundAudioManager.volume = volume;
    this.setData({
      volume: e.detail.value
    });
  }
});