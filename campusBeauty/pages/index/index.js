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
      { id: 1, name: 'FLOWERS (Piano Solo)', src: 'https://data-wyzmv.kinsta.page/audio/FLOWER.mp3', cover: 'https://p1.music.126.net/bCJpaqv8muvLMeijDhvV8g==/5953855464618947.jpg?param=90y90' },
      { id: 2, name: '心に秘めた愛', src: 'https://data-wyzmv.kinsta.page/audio/FLOWER-.mp3', cover: 'https://p2.music.126.net/bCJpaqv8muvLMeijDhvV8g==/5953855464618947.jpg?param=90y90' },
      { id: 3, name: '希望', src: 'https://data-wyzmv.kinsta.page/audio/hope.mp3', cover: 'https://p2.music.126.net/E6l0JieXt26BxRiuqmt15Q==/109951166554301464.jpg?param=90y90' },
      { id: 4, name: '物語の始まり', src: "https://data-wyzmv.kinsta.page/audio/story's-begin.mp3", cover: 'https://p2.music.126.net/YEC31F-uiAdvLZQb5vYRCg==/109951169655626261.jpg?param=34y34' }
    ],
    currentMusicId: null,
    isPlaying: false,
    showMusicPanel: false,
    volume: 50,
    panelAnimation: {},
    currentTime: 0,
    duration: 0
  },

  onLoad() {
    this.startBackgroundAnimation();
    this.setData({
      currentBgSrc: this.data.flowers[0].images[0]
    });
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onPlay(() => {
      this.setData({ isPlaying: true });
    });
    this.innerAudioContext.onPause(() => {
      this.setData({ isPlaying: false });
    });
    this.innerAudioContext.onStop(() => {
      this.setData({ isPlaying: false, currentTime: 0 });
    });
    this.innerAudioContext.onEnded(() => {
      this.setData({ isPlaying: false, currentTime: 0 });
    });
    this.innerAudioContext.onTimeUpdate(() => {
      this.setData({
        currentTime: Math.floor(this.innerAudioContext.currentTime),
        duration: Math.floor(this.innerAudioContext.duration || 0)
      });
    });
    this.innerAudioContext.onError((res) => {
      console.error('音频播放错误:', res);
      this.setData({ isPlaying: false });
    });
  },

  onUnload() {
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
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
      animation.translateY(0).opacity(1).step();
    } else {
      animation.translateY(100).opacity(0).step();
    }
    this.setData({
      showMusicPanel: show,
      panelAnimation: animation.export()
    });
  },

  selectMusic(e) {
    const id = e.currentTarget.dataset.id;
    const music = this.data.musicList.find(m => m.id === parseInt(id));
    if (music) {
      this.innerAudioContext.stop();
      this.innerAudioContext.src = music.src;
      this.innerAudioContext.play();
      this.setData({
        currentMusicId: music.id,
        isPlaying: true,
        currentTime: 0
      });
    }
  },

  playPauseMusic() {
    if (this.data.isPlaying) {
      this.innerAudioContext.pause();
    } else {
      if (!this.innerAudioContext.src && this.data.musicList.length > 0) {
        this.selectMusic({ currentTarget: { dataset: { id: this.data.musicList[0].id } } });
      } else {
        this.innerAudioContext.play();
      }
    }
  },

  seekMusic(e) {
    const seekTime = e.detail.value;
    this.innerAudioContext.seek(seekTime);
    this.setData({
      currentTime: seekTime
    });
  },

  adjustVolume(e) {
    const volume = e.detail.value / 100;
    this.innerAudioContext.volume = volume;
    this.setData({
      volume: e.detail.value
    });
  }
});