// pages/index/index.js
const { getLists, saveList, deleteList, showToast, showConfirm } = require('../../utils.js');

Page({
  data: {
    listData: [],
    isLoading: false,
  },

  onLoad() {
    this.loadListData();
  },

  onShow() {
    this.loadListData();
  },

  async loadListData() {
    this.setData({ isLoading: true });
    try {
      console.log('加载列表数据');
      const lists = await getLists();
      this.setData({ listData: lists, isLoading: false });
      if (!lists.length) {
        showToast('暂无列表，请创建新列表');
      }
    } catch (e) {
      console.error('加载列表失败:', e);
      this.setData({ isLoading: false });
      showToast('加载列表失败', 'error');
    }
  },

  goToList(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/list/list?id=${id}` });
  },

  async createList() {
    try {
      console.log('创建新列表');
      const lists = await getLists();
      const newId = lists.length ? Math.max(...lists.map(l => Number(l.id))) + 1 : 1;
      const newList = {
        id: newId,
        name: '新列表',
        background: '#DBEAFE',
        backgroundType: 'color',
        icon: '📋',
      };
      await saveList(newList);
      this.loadListData();
      wx.navigateTo({ url: `/pages/list/list?id=${newId}` });
    } catch (e) {
      console.error('创建列表失败:', e);
      showToast('创建列表失败', 'error');
    }
  },

  async deleteList(e) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await showConfirm('删除列表', '确定删除此列表？');
    if (!confirmed) return;

    try {
      console.log('删除列表:', id);
      await deleteList(id);
      this.loadListData();
      showToast('列表已删除', 'success');
    } catch (e) {
      console.error('删除列表失败:', e);
      showToast('删除列表失败', 'error');
    }
  },
});