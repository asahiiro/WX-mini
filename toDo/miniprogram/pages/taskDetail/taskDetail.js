Page({
  data: {
    task: {},
    taskId: null
  },

  onLoad(options) {
    const tasks = wx.getStorageSync('tasks') || [];
    const task = tasks.find(t => t.id == options.id) || {};
    this.setData({ task, taskId: options.id });
  },

  inputTitle(e) {
    this.setData({ 'task.title': e.detail.value });
  },

  inputDeadline(e) {
    this.setData({ 'task.deadline': e.detail.value });
  },

  inputNotes(e) {
    this.setData({ 'task.notes': e.detail.value });
  },

  saveTask() {
    const tasks = wx.getStorageSync('tasks') || [];
    const updatedTasks = tasks.map(t => (t.id == this.data.taskId ? { ...t, ...this.data.task } : t));
    wx.setStorageSync('tasks', updatedTasks);
    wx.navigateBack();
  },

  deleteTask() {
    const tasks = wx.getStorageSync('tasks') || [];
    const updatedTasks = tasks.filter(t => t.id != this.data.taskId);
    wx.setStorageSync('tasks', updatedTasks);
    wx.navigateBack();
  }
});