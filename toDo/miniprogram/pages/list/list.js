const { getLists, saveList, getTasks, saveTask, showToast, showConfirm } = require('../../utils.js');
const db = wx.cloud.database();

Page({
  data: {
    listId: null,
    list: {},
    tasks: [],
    completedTasks: [],
    isLoading: true,
    showModal: false,
    editListName: '',
    editIcon: '',
    editIconIndex: 0,
    icons: ['📋', '📝', '✅', '📅', '📌'],
    isDefaultList: false,
  },

  onLoad(options) {
    console.log('list 参数:', options);
    if (!options.id) {
      showToast('缺少清单ID', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ 
      listId: options.id === 'today' || options.id === 'planned' ? options.id : Number(options.id),
      isDefaultList: options.id === 'today' || options.id === 'planned',
    });
    this.loadList();
    this.loadTasks();
  },

  onShow() {
    this.loadList();
    this.loadTasks();
  },

  async loadList() {
    try {
      if (this.data.isDefaultList) {
        const defaultLists = [
          { id: 'today', name: '我的一天', icon: '🌞', background: '#FFFFFF', backgroundType: 'color' },
          { id: 'planned', name: '计划中', icon: '📅', background: '#FFFFFF', backgroundType: 'color' },
        ];
        const list = defaultLists.find(l => l.id === this.data.listId);
        this.setData({ list });
        wx.setNavigationBarTitle({ title: list.name });
        return;
      }
      const lists = await getLists();
      console.log('获取清单:', lists);
      const list = lists.find(l => l.id === this.data.listId);
      if (!list) {
        showToast('清单不存在', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({ list });
      wx.setNavigationBarTitle({ title: list.name || '清单' });
    } catch (e) {
      console.error('加载清单失败:', e);
      showToast('加载清单失败', 'error');
    }
  },

  async loadTasks() {
    try {
      this.setData({ isLoading: true });
      let tasks = [];
      if (this.data.listId === 'today') {
        tasks = await this.getTodayTasks();
      } else if (this.data.listId === 'planned') {
        tasks = await this.getPlannedTasks();
      } else {
        tasks = await getTasks(this.data.listId);
      }
      // 计算倒计时天数
      tasks = tasks.map(task => ({
        ...task,
        daysLeft: task.dueDate ? this.calculateDaysLeft(task.dueDate) : null,
      }));
      console.log('加载任务:', tasks);
      this.setData({
        tasks: tasks.filter(t => !t.completed),
        completedTasks: tasks.filter(t => t.completed),
        isLoading: false,
      });
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
      this.setData({ isLoading: false });
    }
  },

  calculateDaysLeft(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    // 设置为当天的 00:00:00 以确保天数计算准确
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  async getTodayTasks() {
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      const res = await db.collection('tasks').where({ _openid: openid }).get();
      const today = new Date();
      const day = today.toLocaleString('en-US', { weekday: 'long' });
      const tasks = res.data.filter(task => {
        if (task.dueDate && new Date(task.dueDate) <= today) return true;
        if (task.repeat === 'daily') return true;
        if (task.repeat === 'workday' && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) return true;
        if (task.repeat === 'weekly' && task.createdDate && new Date(task.createdDate).getDay() === today.getDay()) return true;
        if (task.repeat === 'custom' && task.customDays?.includes(day)) return true;
        return false;
      });
      return tasks.map(t => ({ ...t, id: Number(t.id) }));
    } catch (e) {
      console.error('获取今日任务失败:', e);
      throw e;
    }
  },

  async getPlannedTasks() {
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      const res = await db.collection('tasks').where({ 
        _openid: openid,
        dueDate: db.command.exists(true),
      }).get();
      return res.data.map(t => ({ ...t, id: Number(t.id) }));
    } catch (e) {
      console.error('获取计划任务失败:', e);
      throw e;
    }
  },

  showEditModal() {
    if (this.data.isDefaultList) {
      showToast('默认列表不可编辑');
      return;
    }
    const { list, icons } = this.data;
    const editIconIndex = icons.indexOf(list.icon || '📋');
    this.setData({
      showModal: true,
      editListName: list.name || '',
      editIcon: list.icon || '📋',
      editIconIndex: editIconIndex >= 0 ? editIconIndex : 0,
    });
    console.log('打开编辑模态框:', this.data);
  },

  updateListName(e) {
    this.setData({ editListName: e.detail.value.trim() });
  },

  selectIcon(e) {
    const index = parseInt(e.detail.value, 10);
    const icon = this.data.icons[index];
    this.setData({
      editIcon: icon,
      editIconIndex: index,
    });
    console.log('选择图标:', { index, icon });
  },

  hideEditModal() {
    this.setData({ showModal: false });
    console.log('关闭编辑模态框');
  },

  async saveList() {
    if (this.data.isDefaultList) return;
    const { editListName, editIcon, list } = this.data;
    if (!editListName) {
      showToast('清单名称不能为空');
      return;
    }
    if (editListName.length > 20) {
      showToast('清单名称不能超过20字');
      return;
    }
    try {
      const updatedList = {
        id: list.id,
        name: editListName,
        icon: editIcon,
        backgroundType: list.backgroundType || 'color',
        background: list.background || '',
        _id: list._id,
      };
      const savedList = await saveList(updatedList);
      this.setData({
        list: savedList,
        showModal: false,
      });
      wx.setNavigationBarTitle({ title: editListName });
      showToast('保存清单成功', 'success');
    } catch (e) {
      console.error('保存清单失败:', e);
      showToast('保存清单失败', 'error');
    }
  },

  async toggleTaskStatus(e) {
    const taskId = Number(e.currentTarget.dataset.taskId);
    try {
      const tasks = await getTasks(this.data.listId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        showToast('任务不存在', 'error');
        return;
      }
      task.completed = !task.completed;
      await saveTask(task);
      this.loadTasks();
      showToast(task.completed ? '标记为已完成' : '标记为未完成', 'success');
    } catch (e) {
      console.error('更新任务状态失败:', e);
      showToast('更新任务状态失败', 'error');
    }
  },

  goToTask(e) {
    const taskId = Number(e.currentTarget.dataset.taskId);
    wx.redirectTo({
      url: `/pages/task/task?listId=${this.data.listId}&taskId=${taskId}&t=${Date.now()}`,
    });
  },

  addTask() {
    if (this.data.isDefaultList) {
      showToast('默认列表不可添加任务');
      return;
    }
    wx.redirectTo({
      url: `/pages/addTask/addTask?listId=${this.data.listId}&t=${Date.now()}`,
    });
    console.log('跳转到新建任务页面:', this.data.listId);
  },

  async deleteList() {
    if (this.data.isDefaultList) {
      showToast('默认列表不可删除');
      return;
    }
    const confirmed = await showConfirm('删除清单', '确定删除此清单及其所有任务？');
    if (!confirmed) return;
    try {
      await deleteList(this.data.listId);
      showToast('删除清单成功', 'success');
      wx.navigateBack();
    } catch (e) {
      console.error('删除清单失败:', e);
      showToast('删除清单失败', 'error');
    }
  },
});