// pages/index/index.js
Page({
  data: {
    lists: [], // 存储所有列表
  },

  onLoad() {
    // 加载本地存储的列表数据
    const lists = wx.getStorageSync('lists') || [];
    this.setData({ lists });
  },

  // 创建新列表并跳转
  createList() {
    const lists = this.data.lists;
    const newList = {
      id: lists.length,
      name: '新列表',
      background: '#ffffff', // 默认白色背景
      icon: '📋', // 默认图标
    };
    lists.push(newList);
    wx.setStorageSync('lists', lists);
    this.setData({ lists });

    // 跳转到新列表页面
    wx.navigateTo({
      url: `/pages/list/list?id=${newList.id}`,
    });
  },

  // 跳转到已有列表
  goToList(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/list/list?id=${id}`,
    });
  },
});