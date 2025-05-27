Page({
  data: {
    tasks: [],
    newTaskTitle: '',
    newSubTaskTitles: {}
  },

  onLoad() {
    this.loadTasks();
    this.startCountdown();
  },

  onUnload() {
    clearInterval(this.timer);
  },

  // 加载任务
  loadTasks() {
    const tasks = wx.getStorageSync('tasks') || [];
    this.setData({ tasks: this.updateCountdown(tasks) });
  },

  // 计算倒计时
  updateCountdown(tasks) {
    return tasks.map(task => {
      task.countdown = task.deadline ? this.getCountdown(task.deadline) : '';
      task.subTasks = task.subTasks.map(subTask => ({
        ...subTask,
        countdown: subTask.deadline ? this.getCountdown(subTask.deadline) : ''
      }));
      return task;
    });
  },

  getCountdown(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    if (diff <= 0) return '已过期';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}天${hours}小时`;
  },

  // 实时更新倒计时
  startCountdown() {
    this.timer = setInterval(() => {
      this.setData({ tasks: this.updateCountdown(this.data.tasks) });
    }, 60000); // 每分钟更新
  },

  // 输入任务标题
  inputTaskTitle(e) {
    this.setData({ newTaskTitle: e.detail.value });
  },

  // 添加任务
  addTask() {
    if (!this.data.newTaskTitle) return;
    const tasks = [...this.data.tasks, {
      id: Date.now(),
      title: this.data.newTaskTitle,
      deadline: '',
      completed: false,
      subTasks: [],
      showSubTasks: false
    }];
    this.setData({ tasks, newTaskTitle: '' });
    wx.setStorageSync('tasks', tasks);
  },

  // 输入子任务标题
  inputSubTaskTitle(e) {
    const parentId = e.currentTarget.dataset.id;
    this.setData({
      newSubTaskTitles: { ...this.data.newSubTaskTitles, [parentId]: e.detail.value }
    });
  },

  // 添加子任务
  addSubTask(e) {
    const parentId = e.currentTarget.dataset.id;
    const title = this.data.newSubTaskTitles[parentId];
    if (!title) return;
    const tasks = this.data.tasks.map(task => {
      if (task.id === parentId) {
        task.subTasks.push({
          id: Date.now(),
          parentId,
          title,
          deadline: '',
          completed: false
        });
      }
      return task;
    });
    this.setData({ tasks, [`newSubTaskTitles.${parentId}`]: '' });
    wx.setStorageSync('tasks', tasks);
  },

  // 切换任务完成状态
  toggleTask(e) {
    const id = e.currentTarget.dataset.id;
    const tasks = this.data.tasks.map(task => {
      if (task.id === id) task.completed = !task.completed;
      return task;
    });
    this.setData({ tasks });
    wx.setStorageSync('tasks', tasks);
  },

  // 切换子任务完成状态
  toggleSubTask(e) {
    const { parentId, id } = e.currentTarget.dataset;
    const tasks = this.data.tasks.map(task => {
      if (task.id === parentId) {
        task.subTasks = task.subTasks.map(subTask => {
          if (subTask.id === id) subTask.completed = !subTask.completed;
          return subTask;
        });
      }
      return task;
    });
    this.setData({ tasks });
    wx.setStorageSync('tasks', tasks);
  },

  // 展开/收起子任务
  toggleSubTasks(e) {
    const id = e.currentTarget.dataset.id;
    const tasks = this.data.tasks.map(task => {
      if (task.id === id) task.showSubTasks = !task.showSubTasks;
      return task;
    });
    this.setData({ tasks });
  },
  //跳转到添加任务
  navigateToAddTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/addTask/addTask?id=${id}` });
  },

  // 跳转到任务详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/taskDetail/taskDetail?id=${id}` });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的待办事项',
      path: '/pages/index/index'
    };
  }
});