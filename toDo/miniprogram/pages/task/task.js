// pages/task/task.js
Page({
  data: {
    listId: null,
    taskId: null,
    task: {},
  },

  onLoad(options) {
    const { listId, taskId } = options;
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[listId] || [];
    const task = listTasks[taskId] || {};
    this.setData({ listId, taskId, task });
  },

  // 跳转到编辑页面
  goToEditTask() {
    const { listId, taskId } = this.data;
    wx.navigateTo({
      url: `/pages/addTask/addTask?listId=${listId}&taskId=${taskId}`,
    });
  },

  // 获取重复选项的显示标签
  getRepeatLabel(repeat, customDays) {
    if (repeat === 'none') return '无';
    if (repeat === 'daily') return '每天';
    if (repeat === 'workday') return '工作日';
    if (repeat === 'weekly') return '每周';
    if (repeat === 'yearly') return '每年';
    if (repeat === 'custom') return '自定义: ' + (customDays.length ? customDays.join(', ') : '无');
    return '';
  },
});