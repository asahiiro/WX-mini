Page({
  data: {
    listId: null,
    taskId: null,
    taskName: '',
    dueDate: '',
    repeat: 'none',
    customDays: [],
    isEditing: false,
    daysOfWeek: [
      { label: '周一', value: 'Monday' },
      { label: '周二', value: 'Tuesday' },
      { label: '周三', value: 'Wednesday' },
      { label: '周四', value: 'Thursday' },
      { label: '周五', value: 'Friday' },
      { label: '周六', value: 'Saturday' },
      { label: '周日', value: 'Sunday' },
    ],
    repeatOptions: [
      { label: '无', value: 'none' },
      { label: '每天', value: 'daily' },
      { label: '工作日', value: 'workday' },
      { label: '每周', value: 'weekly' },
      { label: '每年', value: 'yearly' },
      { label: '自定义', value: 'custom' },
    ],
  },

  onLoad(options) {
    const { listId, taskId: taskIdStr } = options;
    this.setData({ listId });
    if (taskIdStr) {
      const taskId = parseInt(taskIdStr, 10);
      const tasks = wx.getStorageSync('tasks') || {};
      const listTasks = tasks[listId] || [];
      const task = listTasks.find(t => t.id === taskId);
      if (task) {
        this.setData({
          taskId,
          isEditing: true,
          taskName: task.name || '',
          dueDate: task.dueDate || '',
          repeat: task.repeat || 'none',
          customDays: task.customDays || [],
        });
      } else {
        wx.showToast({ title: '任务不存在', icon: 'error' });
        wx.navigateBack();
      }
    }
  },

  selectDueDate(e) {
    this.setData({ dueDate: e.detail.value });
  },

  selectRepeat(e) {
    const repeat = e.detail.value;
    this.setData({
      repeat,
      customDays: repeat === 'custom' ? this.data.customDays : [],
    });
  },

  selectCustomDays(e) {
    this.setData({ customDays: e.detail.value });
  },

  updateTaskName(e) {
    this.setData({ taskName: e.detail.value });
  },

  submitTask(e) {
    const taskName = e.detail.value.taskName || '';
    if (!taskName.trim()) {
      wx.showToast({ title: '任务名称不能为空', icon: 'none' });
      return;
    }

    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[this.data.listId] || [];
    const task = {
      id: this.data.isEditing ? this.data.taskId : Date.now(),
      name: taskName,
      dueDate: this.data.dueDate || null,
      repeat: this.data.repeat,
      customDays: this.data.repeat === 'custom' ? this.data.customDays : [],
      completed: this.data.isEditing ? (listTasks.find(t => t.id === this.data.taskId)?.completed || false) : false,
    };

    if (this.data.isEditing) {
      const index = listTasks.findIndex(t => t.id === this.data.taskId);
      if (index !== -1) {
        listTasks[index] = task;
        wx.showToast({ title: '任务已更新', icon: 'success' });
      }
    } else {
      listTasks.push(task);
      wx.showToast({ title: '任务创建成功', icon: 'success' });
    }

    tasks[this.data.listId] = listTasks;
    wx.setStorageSync('tasks', tasks);
    wx.navigateBack();
  },
});