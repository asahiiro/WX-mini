const db = wx.cloud.database();
Page({
  data: {
    bannerList: [],
    dishList: [],
    introImage: 'https://lh3.googleusercontent.com/proxy/u-9JU-sPBCnrdbz39d88jk7MhgxHJo5lkBpDLd-XFh3tTLYTVP5LwnHUl_8RNNZLbMELZ1rn8HolyPuw7Ox11mWQb-lxaPCx62OGRg', // 替换为云存储图片
    comboList: [
      {
        id: 'combo1',
        name: '双人浪漫套餐',
        price: 128,
        description: '包含宫保鸡丁、红烧肉、芒果布丁，适合情侣约会'
      },
      {
        id: 'combo2',
        name: '家庭欢乐套餐',
        price: 268,
        description: '包含糖醋鱼、港式点心拼盘、麻婆豆腐，适合家庭聚餐'
      }
    ]
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

  onBannerTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  onDishTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${id}`
    });
  },

  toReserve() {
    wx.navigateTo({
      url: '/pages/reserve/reserve'
    });
  }
});