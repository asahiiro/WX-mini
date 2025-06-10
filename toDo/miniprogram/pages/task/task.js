const { getTasks, saveTask, showToast } = require('../../utils.js');

Page({
  data: {
    listId: null,
    taskId: null,
    task: {},
    isLoading: true,
  },

  onLoad(options) {
    console.log('task 参数:', options);
    if (!options.listId || !options.taskId) {
      showToast('缺少参数', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({
      listId: Number(options.listId),
      taskId: Number(options.taskId),
    });
    this.loadTask();
  },

  onShow() {
    if (this.data.listId && this.data.taskId) {
      this.loadTask();
    }
  },

  async loadTask() {
    try {
      this.setData({ isLoading: true });
      const tasks = await getTasks(this.data.listId);
      const task = tasks.find(t => t.id === this.data.taskId);
      if (!task) {
        showToast('任务不存在', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({ task, isLoading: false });
      wx.setNavigationBarTitle({ title: task.name || '任务' });
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
      this.setData({ isLoading: false });
    }
  },

  updateRemark(e) {
    const remark = e.detail.value.trim();
    this.setData({
      'task.remark': remark,
    });
  },

  async saveRemark() {
    const { task } = this.data;
    if (!task.remark && task.remark !== '') {
      showToast('备注为空');
      return;
    }
    try {
      await saveTask(task);
      showToast('保存备注成功', 'success');
    } catch (e) {
      console.error('保存备注失败:', e);
      showToast('保存备注失败', 'error');
    }
  },

  editTask() {
    wx.redirectTo({
      url: `/pages/addTask/addTask?listId=${this.data.listId}&taskId=${this.data.taskId}&t=${Date.now()}`,
    });
  },
});