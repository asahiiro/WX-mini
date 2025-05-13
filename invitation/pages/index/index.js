Page({
  data: {
    isPlayingMusic: false
  },
  bgm: null,
  music_url: 'https://webfs.kugou.com/202504221551/376a090c4012bae61d0983265067b9cb/v3/8c044816632d7b54feb7fb0ab7f6224d/yp/p_0_1998759/ap1014_us1727153440_mii0w1iw8z2ai2iphcu80ooo2ki81120_pi406_mx64561561_s3394445902.mp3',
  music_coverImgUrl: 'cloud://cloud1-0g03sug671ddb6b1-c40a5a11.636c-cloud1-0g03sug671ddb6b1-c40a5a11-1306541280/mu.png',
  onReady: function() {
    // 创建getBackgroundAudioManager实例对象
    this.bgm = wx.getBackgroundAudioManager()
    // 音频标题
    this.bgm.title = 'merry me'
    // 专辑名称
    this.bgm.epname = 'wedding'
    // 歌手名
    this.bgm.singer = 'singer'
    // 专辑封面
    this.bgm.coverImgUrl = this.music_coverImgUrl
    this.bgm.onCanplay(() => {
      this.bgm.pause()
    })
    // 指定音频的数据源
    this.bgm.src = this.music_url
  },
  // 播放器的单击事件
  play: function() {
    if (this.data.isPlayingMusic) {
      this.bgm.pause()
    } else {
      this.bgm.play()
    }
    this.setData({
      isPlayingMusic: !this.data.isPlayingMusic
    })
  },
  // 一键拨打电话
  // 新郎电话
  callGroom: function() {
    wx.makePhoneCall({
      phoneNumber: '13700000000'
    })
  },
  // 新娘电话
  callBride: function() {
    wx.makePhoneCall({
      phoneNumber: '15600000000'
    })
  }
})