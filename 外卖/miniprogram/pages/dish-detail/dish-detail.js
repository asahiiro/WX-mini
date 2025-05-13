const db = wx.cloud.database();
Page({
  data: {
    dish: {}
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadDish(id);
    } else {
      wx.showToast({ title: '菜品ID无效', icon: 'none' });
    }
  },

  loadDish(id) {
    db.collection('dishes').doc(id).get({
      success: res => {
        this.setData({
          dish: res.data
        });
      },
      fail: err => {
        console.error('加载菜品失败:', err);
        wx.showToast({ title: '加载菜品失败', icon: 'none' });
      }
    });
  },

  toReserve() {
    wx.navigateTo({
      url: '/pages/reserve/reserve'
    });
  },

  backToHome() {
    wx.navigateBack({
      delta: 1
    });
  }
});