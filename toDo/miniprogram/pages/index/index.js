Page({
  data: {
    listData: [],
  },

  // 页面加载时获取列表数据
  onLoad() {
    this.loadLists();
  },

  // 页面显示时刷新列表数据
  onShow() {
    this.loadLists();
  },

  // 从本地存储加载列表
  loadLists() {
    const lists = wx.getStorageSync('lists') || [];
    this.setData({ listData: lists });
    console.log('Loaded lists:', JSON.stringify(lists));
    if (!lists.length) {
      console.warn('No lists found in storage');
      wx.showToast({ title: '暂无列表，请创建新列表', icon: 'none' });
    }
  },

  // 点击列表项跳转到详情页面
  goToList(e) {
    const id = e.currentTarget.dataset.id;
    console.log('Navigating to list:', id);
    wx.navigateTo({
      url: `/pages/list/list?id=${id}`,
    });
  },

  // 创建新列表
  createList() {
    const lists = wx.getStorageSync('lists') || [];
    const newId = lists.length ? Math.max(...lists.map(l => Number(l.id))) + 1 : 1;
    const newList = {
      id: newId,
      name: '新列表',
      background: '#DBEAFE',
      backgroundType: 'color',
      icon: '📋',
    };
    lists.push(newList);
    wx.setStorageSync('lists', lists);
    console.log('Created list:', JSON.stringify(newList));
    console.log('Updated lists:', JSON.stringify(lists));
    this.loadLists();
    wx.navigateTo({
      url: `/pages/list/list?id=${newId}`,
    });
  },

  // 删除指定列表
  deleteList(e) {
    const id = e.currentTarget.dataset.id;
    let lists = wx.getStorageSync('lists') || [];
    lists = lists.filter(l => String(l.id) !== String(id));
    wx.setStorageSync('lists', lists);
    this.loadLists();
    console.log('Deleted list with id:', id);
    wx.showToast({ title: '列表已删除', icon: 'success' });
  },
});