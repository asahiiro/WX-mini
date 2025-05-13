const db = wx.cloud.database();
Page({
  data: {
    bannerList: [],
    dishList: []
  },

  onLoad() {
    this.loadBanners();
    this.loadDishes();
  },

  loadBanners() {
    db.collection('banners').get({
      success: res => {
        this.setData({
          bannerList: res.data
        });
      },
      fail: err => {
        wx.showToast({ title: '加载轮播图失败', icon: 'none' });
      }
    });
  },

  loadDishes() {
    db.collection('dishes').get({
      success: res => {
        this.setData({
          dishList: res.data
        });
      },
      fail: err => {
        wx.showToast({ title: '加载菜品失败', icon: 'none' });
      }
    });
  },

  onRefresh() {
    this.loadDishes();
    wx.stopPullDownRefresh();
  },

  toReserve() {
    wx.navigateTo({
      url: '/pages/reserve/reserve'
    });
  }
});