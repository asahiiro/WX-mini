// pages/index/index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({

  /**
   * 页面的初始数据
   */
  data: {
      motto:"Hello World",
      avatarUrl: defaultAvatarUrl,
      theme: wx.getSystemInfoSync().theme,
     
      choosenLocation:{
        latitude:0,
        longitude:0
      },
      gotLocation:{
        latitude:0,
        longitude:0
      },
      flag1:false,
      flag2:false
  },
  onChooseAvatar(e){
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  

chooseLocation:function(e){
    let obj=this
    wx.chooseLocation({
      success:function(res){
          console.log(res)
          obj.setData({
              choosenLocation:res,
              flag1:true
          })
      },
      fail:function(res){},
      complete:function(res){}
    })
},
getLocation:function(e){
  let obj=this
 
  wx.getLocation({
    type:"gcj02",
    altitude:false,
    success:function(res){
      console.log("res2:",res)
      obj.setData({
        gotLocation:res,
        flag2:true
      })
    },
    fail:function(res){
      console.log("res")
    },
    complete:function(res){}
  })
},
calculate:function(e){
  let lat1=this.data.choosenLocation.latitude
  let lat2=this.data.gotLocation.latitude
  let lng1=this.data.choosenLocation.longitude
  let lng2=this.data.gotLocation.longitude
  console.log(lat1)
  //计算两点位置距离
  var rad1=lat1*Math.PI/180.0;
  var rad2=lat2*Math.PI/180.0;
  var a=rad1-rad2;
  var b=lng1*Math.PI/180.0-lng2*Math.PI/180.0;
  var r=6378137;         //地球半径
  var distance=r*2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2)+ Math.cos(rad1)*Math.cos(rad2)*Math.pow(Math.sin(b/2),2)));
      //return distance;
  distance=distance/1000
  distance=distance.toFixed(5)
  this.setData({
      motto:distance+'km'
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.onThemeChange((result) => {
      this.setData({
        theme: result.theme
      })
    })
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