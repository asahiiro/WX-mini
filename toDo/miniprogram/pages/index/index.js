// pages/index/index.js
Page({
  data: {
    lists: [],
  },

  onLoad() {
    const lists = wx.getStorageSync('lists') || [];
    console.log('Loaded lists:', lists); // Debug: Check data
    this.setData({ lists });
  },

  createList() {
    const lists = this.data.lists;
    const newList = {
      id: lists.length,
      name: '新列表',
      background: '#ffffff',
      icon: '📋',
    };
    lists.push(newList);
    wx.setStorageSync('lists', lists);
    this.setData({ lists });
    console.log('Created list:', newList); // Debug: Confirm creation
    wx.navigateTo({
      url: `/pages/list/list?id=${newList.id}`,
    });
  },

  goToList(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Navigating to list:', id); // Debug: Confirm navigation
    wx.navigateTo({
      url: `/pages/list/list?id=${id}`,
    });
  },
});