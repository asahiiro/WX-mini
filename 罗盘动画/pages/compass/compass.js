
var x1, x2, angle = 0
Page({
  data: {
    animation: {}
  },
  animation: null,
  onShow: function () {
    this.animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
  },
  start: function(e) {
    x1 = e.touches[0].clientX
  },
  end: function(e) {
    x2 = e.changedTouches[0].clientX
    if (x1 < x2) {
      angle = angle + 80
    } else {
      angle = angle - 80
    }
    this.setData({
      animation: this.animation.rotate(angle).step().export()
    })
  },
  rotate: function() {
    this.animation.rotate(Math.random() * 720 - 360).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  scale: function() {
    this.animation.scale(Math.random() * 2).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  translate: function () {
    this.animation.translate(Math.random() * 100 - 50, Math.random() * 100 - 50).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  skew: function() {
    this.animation.skew(Math.random() * 90, Math.random() * 90).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  rotateAndScale: function () {
    this.animation.rotate(Math.random() * 720 - 360)
    this.animation.scale(Math.random() * 2).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  rotateThenScale: function () {
    this.animation.rotate(Math.random() * 720 - 360).step()
    this.animation.scale(Math.random() * 2).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  all: function() {
    this.animation.rotate(Math.random() * 720 - 360)
    this.animation.scale(Math.random() * 2)
    this.animation.translate(Math.random() * 100 - 50, Math.random() * 100 - 50)
    this.animation.skew(Math.random() * 90, Math.random() * 90).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  allOrder: function () {
    this.animation.rotate(Math.random() * 720 - 360).step()
    this.animation.scale(Math.random() * 2).step()
    this.animation.translate(Math.random() * 100 - 50, Math.random() * 100 - 50).step()
    this.animation.skew(Math.random() * 90, Math.random() * 90).step()
    this.setData({
      animation: this.animation.export()
    })
  },
  reset: function() {
    this.animation.rotate(0).scale(1).translate(0, 0).skew(0, 0).step({duration: 0})
    this.setData({
      animation: this.animation.export()
    })
  }
})
