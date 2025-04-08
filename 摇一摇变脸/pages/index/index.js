// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      index:0,
      imgArr:[
        '../../images2/图片1.png',
        '../../images2/图片2.png',
        '../../images2/图片3.png',
        '../../images2/图片4.png',
        '../../images2/图片5.png',
        '../../images2/图片6.png',
        '../../images2/图片7.png',
        '../../images2/图片12.png',
        '../../images2/图片9.png',
        '../../images2/图片10.png'
      ]
  },
  createRandomnum:function() {
    return Math.floor(Math.random()*10);//原理自学
   },
changeface:function(){
  
  this.setData({
    index:this.createRandomnum()
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
      var that=this;
      wx.onAccelerometerChange(function(res){
          if(res.x>0.5||res.y>0.5||res.z>0.5){
            wx.showToast({
              title: '摇一摇成功',
              icon:"success",
              duration:2000
            })
            that.changeface()
          }
      })  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})