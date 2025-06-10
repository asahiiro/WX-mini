const { getTasks, getLists, showToast } = require('../../utils.js');
const db = wx.cloud.database();

Page({
  data: {
    query: '',
    searchResults: [],
  },

  onLoad() {
  },

  updateQuery(e) {
    this.setData({ query: e.detail.value.trim() });
  },

  async searchTasks() {
    const { query } = this.data;
    if (!query) {
      showToast('请输入搜索内容');
      return;
    }
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      const lists = await getLists();
      const res = await db.collection('tasks').where({
        _openid: openid,
        name: db.command.regexp({
          regexp: query,
          options: 'i',
        }),
      }).get();
      const tasks = res.data.map(task => ({
        ...task,
        id: Number(task.id),
        listName: lists.find(l => l.id === task.listId)?.name || '未知清单',
      }));
      this.setData({ searchResults: tasks });
      if (!tasks.length) {
        showToast('未找到匹配任务');
      }
    } catch (e) {
      console.error('搜索任务失败:', e);
      showToast('搜索任务失败', 'error');
    }
  },

  goToTask(e) {
    const { listId, taskId } = e.currentTarget.dataset;
    wx.redirectTo({
      url: `/pages/task/task?listId=${listId}&taskId=${taskId}&t=${Date.now()}`,
    });
  },
});