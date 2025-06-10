const { getLists, saveList, deleteList, getTasks, showToast, showConfirm, getOpenId } = require('../../utils.js');
const db = wx.cloud.database();

Page({
  data: {
    listData: [],
    defaultLists: [
      { id: 'today', name: '我的一天', icon: '🌞', background: '#FFFFFF', backgroundType: 'color' },
      { id: 'planned', name: '计划中', icon: '📅', background: '#FFFFFF', backgroundType: 'color' },
    ],
    isLoading: false,
    userInfo: { avatarUrl: 'https://data-wyzmv.kinsta.page/icon/cloud.png', nickName: '微信用户' },
    pendingTasks: 0,
    completedTasks: 0,
  },

  onLoad() {
    this.loadUserInfo();
    this.loadListData();
    this.loadTaskStats();
  },

  onShow() {
    this.loadListData();
    this.loadTaskStats();
  },

  loadUserInfo() {
    this.setData({
      userInfo: { avatarUrl: 'https://data-wyzmv.kinsta.page/icon/cloud.png', nickName: '微信用户' }
    });
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '用于展示个人头像和昵称',
      success: (res) => {
        const { avatarUrl, nickName } = res.userInfo;
        this.setData({ userInfo: { avatarUrl, nickName } });
        showToast('获取用户信息成功', 'success');
      },
      fail: () => {
        showToast('获取用户信息失败', 'error');
      },
    });
  },

  async loadListData() {
    this.setData({ isLoading: true });
    try {
      console.log('加载列表数据');
      const lists = await getLists();
      this.setData({ listData: lists, isLoading: false });
      if (!lists.length) {
        showToast('暂无自定义列表，请创建新列表');
      }
    } catch (e) {
      console.error('加载列表失败:', e);
      this.setData({ isLoading: false });
      showToast('加载列表失败', 'error');
    }
  },

  async loadTaskStats() {
    try {
      const openid = wx.getStorageSync('openid') || await getOpenId();
      const res = await db.collection('tasks').where({ _openid: openid }).get();
      const tasks = res.data;
      this.setData({
        pendingTasks: tasks.filter(t => !t.completed).length,
        completedTasks: tasks.filter(t => t.completed).length,
      });
    } catch (e) {
      console.error('加载任务统计失败:', e);
      showToast('加载任务统计失败', 'error');
    }
  },

  goToList(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: `/pages/list/list?id=${id}&t=${Date.now()}` });
  },

  goToSearch() {
    wx.redirectTo({ url: `/pages/search/search?t=${Date.now()}` });
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
      wx.redirectTo({ url: `/pages/list/list?id=${newId}&t=${Date.now()}` });
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