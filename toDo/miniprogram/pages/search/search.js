const { getLists, showToast, getOpenId } = require('../../utils.js');
// 显式声明 db
const db = wx.cloud.database();

Page({
  data: {
    query: '',
    searchResults: [],
  },

  onLoad() {},

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
      console.log('搜索关键词:', query);
      const openid = wx.getStorageSync('openid') || await getOpenId();
      console.log('用户 openid:', openid);
      const lists = await getLists();
      console.log('清单数据:', lists);

      // 客户端查询所有任务并过滤
      const res = await db.collection('tasks').where({
        _openid: openid,
      }).get();

      console.log('数据库查询结果:', res.data);

      // 客户端过滤任务名称
      const tasks = res.data
        .filter(task => task.name && task.name.toLowerCase().includes(query.toLowerCase()))
        .map(task => ({
          ...task,
          id: task.id,
          listName: lists.find(l => l.id == task.listId)?.name || '未知清单',
        }));

      console.log('过滤后的任务:', tasks);
      this.setData({ searchResults: tasks });
      if (!tasks.length) {
        showToast('未找到匹配任务');
      }
    } catch (e) {
      console.error('搜索任务失败:', e);
      showToast(`搜索失败: ${e.message || '未知错误'}`, 'error');
    }
  },

  goToTask(e) {
    const { listId, taskId } = e.currentTarget.dataset;
    console.log('跳转到任务:', { listId, taskId });
    wx.redirectTo({
      url: `/pages/task/task?listId=${listId}&taskId=${taskId}&t=${Date.now()}`,
    });
  },
});