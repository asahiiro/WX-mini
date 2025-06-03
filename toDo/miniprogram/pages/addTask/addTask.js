// pages/addTask/addTask.js
Page({
  data: {
    listId: null,
    taskName: '',
    dueDate: '', // 截止日期
    repeat: 'none', // 重复选项：none, daily, workday, weekly, yearly, custom
    customDays: [], // 自定义重复的星期
    daysOfWeek: [
      { label: '周一', value: 'Monday' },
      { label: '周二', value: 'Tuesday' },
      { label: '周三', value: 'Wednesday' },
      { label: '周四', value: 'Thursday' },
      { label: '周五', value: 'Friday' },
      { label: '周六', value: 'Saturday' },
      { label: '周日', value: 'Sunday' },
    ],
  },

  onLoad(options) {
    this.setData({ listId: options.listId }); // 获取列表ID
  },

  // 选择截止日期
  selectDueDate(e) {
    this.setData({ dueDate: e.detail.value });
  },

  // 选择重复选项
  selectRepeat(e) {
    const repeat = e.detail.value;
    this.setData({ 
      repeat,
      customDays: repeat === 'custom' ? this.data.customDays : [], // 清空自定义天
    });
  },

  // 选择自定义重复的星期
  selectCustomDays(e) {
    this.setData({ customDays: e.detail.value });
  },

  // 提交任务
  submitTask(e) {
    const taskName = e.detail.value.taskName;
    if (!taskName) {
      wx.showToast({ title: '任务名称不能为空', icon: 'none' });
      return;
    }

    // 构建任务数据
    const task = {
      name: taskName,
      dueDate: this.data.dueDate || null,
      repeat: this.data.repeat,
      customDays: this.data.repeat === 'custom' ? this.data.customDays : [],
    };

    // 保存任务到本地存储
    const tasks = wx.getStorageSync('tasks') || {};
    const listTasks = tasks[this.data.listId] || [];
    listTasks.push(task);
    tasks[this.data.listId] = listTasks;
    wx.setStorageSync('tasks', tasks);

    wx.showToast({ title: '任务创建成功', icon: 'success' });
    wx.navigateBack(); // 返回列表页面
  },
});