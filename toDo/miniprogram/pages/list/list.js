const { getLists, saveList, getTasks, saveTask, showToast, getRepeatLabel } = require('../../utils.js');

Page({
  data: {
    list: {},
    incompleteTasks: [],
    completedTasks: [],
    showModal: false,
    iconOptions: ['📋', '📌', '📅', '✅'],
    selectedIconIndex: 0,
    isLoading: false,
  },

  onLoad(options) {
    if (options.id) {
      this.loadData(options.id);
    } else {
      showToast('缺少列表ID', 'error');
      wx.navigateBack();
    }
  },

  onShow() {
    if (this.data.list.id) {
      this.loadData(this.data.list.id);
    }
  },

  async loadData(id) {
    this.setData({ isLoading: true });
    try {
      console.log('加载列表数据，ID:', id);
      const lists = await getLists();
      const list = lists.find(l => String(l.id) === String(id));
      if (!list) {
        showToast('列表不存在', 'error');
        wx.navigateBack();
        return;
      }
      const tasks = await getTasks(Number(id));
      this.sortTasks(tasks);
      this.setData({
        list,
        selectedIconIndex: this.data.iconOptions.indexOf(list.icon) >= 0 ? this.data.iconOptions.indexOf(list.icon) : 0,
        isLoading: false,
      });
      console.log('列表加载成功:', list);
    } catch (e) {
      console.error('加载数据失败:', e);
      this.setData({ isLoading: false });
      showToast('加载数据失败', 'error');
      wx.navigateBack();
    }
  },

  sortTasks(tasks) {
    const sortedTasks = tasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return a.id - b.id;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
    this.setData({
      incompleteTasks: sortedTasks.filter(task => !task.completed),
      completedTasks: sortedTasks.filter(task => task.completed),
    }, () => {
      console.log('setData 完成:', this.data.incompleteTasks, this.data.completedTasks);
    });
    console.log('任务分类:', { incomplete: this.data.incompleteTasks, completed: this.data.completedTasks });
  },

  async toggleTaskComplete(e) {
    const taskId = parseInt(e.currentTarget.dataset.taskId, 10);
    try {
      console.log('切换任务完成状态，ID:', taskId);
      const tasks = await getTasks(this.data.list.id);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('任务未找到，TaskID:', taskId);
        showToast('任务未找到', 'error');
        return;
      }
      task.completed = !task.completed;
      await saveTask(task);
      const updatedTasks = await getTasks(this.data.list.id);
      this.sortTasks(updatedTasks);
      showToast(task.completed ? '任务已完成' : '任务未完成', 'success');
    } catch (e) {
      console.error('更新任务失败:', e);
      showToast('更新任务失败', 'error');
    }
  },

  goToTaskDetail(e) {
    const taskId = e.currentTarget.dataset.taskId;
    const listId = this.data.list.id;
    if (!taskId || !listId) {
      console.error('跳转任务详情失败，无效参数:', { taskId, listId });
      showToast('参数错误', 'error');
      return;
    }
    console.log('跳转到任务详情:', { listId, taskId });
    wx.navigateTo({ url: `/pages/task/task?listId=${listId}&taskId=${taskId}` });
  },

  goToCreateTask() {
    wx.navigateTo({ url: `/pages/addTask/addTask?listId=${this.data.list.id}` });
  },

  showEditModal() {
    this.setData({ showModal: true });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  inputName(e) {
    this.setData({ 'list.name': e.detail.value.trim() });
  },

  selectIcon(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({
      selectedIconIndex: index,
      'list.icon': this.data.iconOptions[index],
    });
  },

  async saveChanges() {
    if (!this.data.list.name || this.data.list.name.length > 20) {
      showToast('列表名称不能为空且不超过20字');
      return;
    }
    try {
      console.log('保存列表更改:', this.data.list);
      await saveList(this.data.list);
      this.setData({ showModal: false });
      showToast('列表已保存', 'success');
    } catch (e) {
      console.error('保存列表失败:', e);
      showToast('保存列表失败', 'error');
    }
  },

  getRepeatLabel,
});