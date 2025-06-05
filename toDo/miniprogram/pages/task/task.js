// pages/task/task.js
Page({
  data: {
    listId: null,
    taskId: null,
    task: {},
    remark: '', // Temporary storage for remark input
  },

  onLoad(options) {
    const { listId, taskId } = options;
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[listId] || [];
    const task = listTasks[taskId] || {};
    this.setData({ 
      listId, 
      taskId, 
      task,
      remark: task.remark || '' // Initialize remark
    });
  },

  // Update remark input
  updateRemark(e) {
    this.setData({ remark: e.detail.value });
  },

  // Save remark to local storage
  saveRemark() {
    const { listId, taskId, remark, task } = this.data;
    
    // Optional: Validate remark if needed (e.g., non-empty)
    // if (!remark.trim()) {
    //   wx.showToast({ title: '备注不能为空', icon: 'none' });
    //   return;
    // }

    // Update task with new remark
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[listId] || [];
    listTasks[taskId] = { ...task, remark: remark || null };
    tasks[listId] = listTasks;
    wx.setStorageSync('tasks', tasks);

    // Update displayed task
    this.setData({ 'task.remark': remark || null });

    wx.showToast({ title: '备注已保存', icon: 'success' });
  },

  // Navigate to edit page
  goToEditTask() {
    const { listId, taskId } = this.data;
    wx.navigateTo({
      url: `/pages/addTask/addTask?listId=${listId}&taskId=${taskId}`,
    });
  },

  // Get repeat option label
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