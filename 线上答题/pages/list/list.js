// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paper:[
      {
        title:'微信小程序的官方名称是什么？',
        choice:['A. 小程序','B. 微信小程序','C. 微信应用','D. 微信插件']
      },
      {
        title:'微信小程序的开发主要使用哪些语言？',
        choice:['A. HTML、CSS、JavaScript','B. WXML、WXSS、JavaScript','C. Java、Python、C++','D. PHP、MySQL、HTML']
      },
      {
        title:'以下哪种文件类型是微信小程序的标记语言文件？',
        choice:['A. .js','B. .css','C. .wxml','D. .html']
      },
      {
        title:'微信小程序的生命周期有几个阶段？',
        choice:['A. 3个','B. 4个','C. 5个','D. 2个']
      },
      {
        title:'在微信小程序中，如何获取用户的地理位置？',
        choice:['A. 使用`wx.getUserInfo()`',' B. 使用`wx.getLocation()`','C. 使用`wx.login()`','D. 使用`wx.request()`']
      },
    ]
  },
submit:function(e){
  console.log(e)
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