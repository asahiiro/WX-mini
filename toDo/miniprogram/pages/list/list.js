Page({
  data: {
    list: {},
    incompleteTasks: [],
    completedTasks: [],
    showModal: false,
    iconOptions: ['📋', '📌', '📅', '✅'],
    selectedIconIndex: 0,
  },

  onLoad(options) {
    this.loadData(options.id);
  },

  onShow() {
    if (this.data.list.id) {
      this.loadData(this.data.list.id);
    }
  },

  loadData(id) {
    if (!id) {
      wx.showToast({ title: '缺少列表ID', icon: 'error' });
      wx.navigateBack();
      return;
    }
    const lists = wx.getStorageSync('lists') || [];
    const list = lists.find(l => String(l.id) === String(id));
    if (!list) {
      wx.showToast({ title: '列表不存在', icon: 'error' });
      wx.navigateBack();
      return;
    }
    const tasks = wx.getStorageSync('tasks') || {};
    const taskList = tasks[id] || [];
    this.sortTasks(taskList);
    this.setData({ list });
  },

  sortTasks(tasks) {
    const incompleteTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    this.setData({
      incompleteTasks,
      completedTasks,
    });
  },

  toggleTaskComplete(e) {
    const taskId = parseInt(e.currentTarget.dataset.taskId, 10);
    const completed = e.detail.value; // true 表示勾选，false 表示取消勾选
    const tasks = wx.getStorageSync('tasks') || {};
    let listTasks = tasks[this.data.list.id] || [];
    const taskIndex = listTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      wx.showToast({ title: '任务未找到', icon: 'error' });
      return;
    }

    // 获取当前任务
    const currentTask = listTasks[taskIndex];
    
    // 创建新任务并保留原有信息
    const newTask = {
      ...currentTask,
      id: Date.now(), // 新任务需要新 ID
      completed: completed,
    };

    // 删除旧任务
    listTasks.splice(taskIndex, 1);
    // 添加新任务
    listTasks.push(newTask);

    tasks[this.data.list.id] = listTasks;
    wx.setStorageSync('tasks', tasks);

    // 更新页面
    this.sortTasks(listTasks);

    wx.showToast({
      title: completed ? '任务已完成' : '任务未完成',
      icon: 'success',
    });
  },

  goToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({
      url: `/pages/task/task?listId=${this.data.list.id}&taskId=${taskId}`,
    });
  },

  goToCreateTask() {
    wx.navigateTo({
      url: `/pages/addTask/addTask?listId=${this.data.list.id}`,
    });
  },

  getRepeatLabel(repeat, customDays) {
    if (!repeat || repeat === 'none') return '';
    if (repeat === 'daily') return '每天';
    if (repeat === 'workday') return '工作日';
    if (repeat === 'weekly') return '每周';
    if (repeat === 'yearly') return '每年';
    if (repeat === 'custom') return '自定义: ' + (customDays?.length ? customDays.join(', ') : '无');
    return '';
  },

  showEditModal() {
    const index = this.data.iconOptions.indexOf(this.data.list.icon);
    this.setData({
      showModal: true,
      selectedIconIndex: index >= 0 ? index : 0,
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  inputName(e) {
    this.setData({ 'list.name': e.detail.value });
  },

  selectIcon(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      selectedIconIndex: index,
      'list.icon': this.data.iconOptions[index],
    });
  },

  saveChanges() {
    if (!this.data.list.name || this.data.list.name.length > 20) {
      wx.showToast({ title: '列表名称不能为空且不超过20字', icon: 'none' });
      return;
    }
    const lists = wx.getStorageSync('lists') || [];
    const index = lists.findIndex(l => String(l.id) === String(this.data.list.id));
    if (index >= 0) {
      lists[index] = { ...this.data.list };
    } else {
      lists.push({ ...this.data.list });
    }
    wx.setStorageSync('lists', lists);
    this.setData({ showModal: false });
    wx.showToast({ title: '列表已保存', icon: 'success' });
  },
});