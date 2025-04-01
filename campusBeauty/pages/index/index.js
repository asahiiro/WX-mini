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
      { id: 1, name: 'FLOWERS (Piano Solo)', src: 'https://m10.music.126.net/20250401143718/8efe4c47a7ec81bcb0b8d0efd6b02d5c/ymusic/ab76/f7c8/56cb/64c610e646de1053beb64bf3f8a8b99c.mp3?vuutv=xZ+C5fUlIdHYtulCXJ0lWug0usC9zLVLG/usUkG/5rMg929DfEqfL45vTiqdwnh/8kdewqZhwTXiKFDmQcpPKtDqyUhtH/8wKcA+0xsEquc=', cover: 'https://p1.music.126.net/bCJpaqv8muvLMeijDhvV8g==/5953855464618947.jpg?param=90y90' },
      { id: 2, name: '心に秘めた愛', src: 'https://m10.music.126.net/20250401144020/3ae71b4e4508b9423c1f5c2332632fb5/ymusic/4228/120e/74c5/50f67bc9c670e3b7172aa1876ebde3d7.mp3?vuutv=RoteRCS6pzdbkOkPboQrw1X7Py6f943RxJZvRGSKngvyeW9fPA9xR4YhBZDv6obMdDkipNB94EXjYOcVFtgTPa5Ccj+d8DEuUz3jTCAQHFo=', cover: 'https://p2.music.126.net/bCJpaqv8muvLMeijDhvV8g==/5953855464618947.jpg?param=90y90' },
      { id: 3, name: '希望', src: 'https://m804.music.126.net/20250401144205/6d7b5c24e745e3474e1b5feb8c765db0/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/11455720264/868d/22cf/8b50/b9922a736b2562d81011f24c87f190df.mp3?vuutv=9BiMvN5GPUlh08TDZONTT7+X4aq8sNj0+2Ebodhsu+KCwKHDBqIbwFwRR1LbOp7X5Cf4G967VN3n1UK5x3hMum7UWR6MbbxjKFIJc6yFJUI=&authSecret=00000195efff129c15eb0a3084db08b9', cover: 'https://p2.music.126.net/E6l0JieXt26BxRiuqmt15Q==/109951166554301464.jpg?param=90y90'},
      { id: 4,name:'',src: 'https://m704.music.126.net/20250401144321/5901db4f010c8b3e71bfad273544b066/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/36444514346/8211/80a0/5dbc/7ab4cfe47a844d8ce7681ceb4ca97299.mp3?vuutv=I99tr4u8uQC4GILlVcntnOWDeQ3hbAbp76SFQTQ2j7UoVF8se40JwEyHcxnAI4f1jtKqhjbWNE3vws+68MEiJ5NOWBZBgzrxIFo0ngSjmI0=&authSecret=00000195f0003b0c13630a329daf0006',cover :'https://p2.music.126.net/YEC31F-uiAdvLZQb5vYRCg==/109951169655626261.jpg?param=34y34'
      }
    ],
    currentMusicId: null,
    isPlaying: false,
    showMusicPanel: false,
    volume: 50,
    panelAnimation: {},
    currentTime: 0, // 当前播放时间（秒）
    duration: 0 // 总时长（秒）
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
      this.setData({ isPlaying: false, currentTime: 0 });
    });
    this.backgroundAudioManager.onTimeUpdate(() => {
      this.setData({
        currentTime: Math.floor(this.backgroundAudioManager.currentTime),
        duration: Math.floor(this.backgroundAudioManager.duration || 0)
      });
    });
    this.backgroundAudioManager.onEnded(() => {
      this.setData({ isPlaying: false, currentTime: 0 });
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
    const music = this.data.musicList.find(m => m.id === id);
    if (music) {
      this.backgroundAudioManager.src = music.src;
      this.backgroundAudioManager.title = music.name;
      this.backgroundAudioManager.coverImg = music.cover;
      this.backgroundAudioManager.play();
      this.setData({
        currentMusicId: id,
        isPlaying: true,
        currentTime: 0
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

  seekMusic(e) {
    const seekTime = e.detail.value;
    this.backgroundAudioManager.seek(seekTime);
    this.setData({
      currentTime: seekTime
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