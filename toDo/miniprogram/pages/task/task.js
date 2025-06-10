Page({
  data: {
    listId: null,
    taskId: null,
    task: {},
    remark: '',
  },

  onLoad(options) {
    this.loadData(options);
  },

  onShow() {
    if (this.data.listId && this.data.taskId) {
      this.loadData({ listId: this.data.listId, taskId: this.data.taskId });
    }
  },

  loadData(options) {
    const { listId, taskId: taskIdStr } = options;
    const taskId = parseInt(taskIdStr, 10);
    if (!listId || isNaN(taskId)) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      wx.navigateBack();
      return;
    }
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[listId] || [];
    const task = listTasks.find(t => t.id === taskId);
    if (!task) {
      wx.showToast({ title: '任务不存在', icon: 'error' });
      wx.navigateBack();
      return;
    }
    this.setData({ 
      listId,
      taskId,
      task,
      remark: task.remark || '',
    });
  },

  updateRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  saveRemark() {
    const { listId, taskId, remark } = this.data;
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[listId] || [];
    const taskIndex = listTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      listTasks[taskIndex].remark = remark || null;
      tasks[listId] = listTasks;
      wx.setStorageSync('tasks', tasks);
      this.setData({ 'task.remark': remark || null });
      wx.showToast({ title: '备注已保存', icon: 'success' });
    }
  },

  goToEditTask() {
    const { listId, taskId } = this.data;
    wx.navigateTo({
      url: `/pages/addTask/addTask?listId=${listId}&taskId=${taskId}`,
    });
  },

  getRepeatLabel(repeat, customDays) {
    if (!repeat || repeat === 'none') return '无';
    if (repeat === 'daily') return '每天';
    if (repeat === 'workday') return '工作日';
    if (repeat === 'weekly') return '每周';
    if (repeat === 'yearly') return '每年';
    if (repeat === 'custom') return '自定义: ' + (customDays?.length ? customDays.join(', ') : '无');
    return '';
  },
});