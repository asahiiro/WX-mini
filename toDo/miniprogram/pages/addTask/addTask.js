const { getTasks, saveTask, showToast } = require('../../utils.js');

Page({
  data: {
    listId: null,
    taskId: null,
    task: {
      name: '',
      dueDate: '',
      repeat: 'none',
      customDays: [],
      remark: '',
    },
    repeatOptions: [
      { label: '无', value: 'none' },
      { label: '每天', value: 'daily' },
      { label: '工作日', value: 'workday' },
      { label: '每周', value: 'weekly' },
      { label: '每年', value: 'yearly' },
      { label: '自定义', value: 'custom' },
    ],
    days: [
      { label: '周一', value: 'Monday' },
      { label: '周二', value: 'Tuesday' },
      { label: '周三', value: 'Wednesday' },
      { label: '周四', value: 'Thursday' },
      { label: '周五', value: 'Friday' },
      { label: '周六', value: 'Saturday' },
      { label: '周日', value: 'Sunday' },
    ],
    isCustomRepeat: false,
    isEditing: false, // 添加标志以区分新建/编辑模式
  },

  onLoad(options) {
    console.log('addTask 参数:', options);
    if (!options.listId) {
      showToast('缺少清单ID', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({
      listId: Number(options.listId),
      taskId: options.taskId ? Number(options.taskId) : null,
      isEditing: !!options.taskId, // 设置编辑模式
    });
    if (options.taskId) {
      this.loadTask();
    }
  },

  onShow() {
    if (this.data.taskId) {
      this.loadTask();
    }
  },

  async loadTask() {
    try {
      const tasks = await getTasks(this.data.listId);
      const task = tasks.find(t => t.id === this.data.taskId);
      if (!task) {
        showToast('任务不存在', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({
        task: {
          name: task.name || '',
          dueDate: task.dueDate || '',
          repeat: task.repeat || 'none',
          customDays: task.customDays || [],
          remark: task.remark || '',
        },
        isCustomRepeat: task.repeat === 'custom',
      });
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
    }
  },

  updateTaskName(e) {
    const value = e.detail.value.trim();
    this.setData({
      'task.name': value,
    });
    console.log('任务名称更新:', value); // 添加日志调试
  },

  updateDueDate(e) {
    this.setData({
      'task.dueDate': e.detail.value,
    });
  },

  updateRepeat(e) {
    const repeat = e.detail.value;
    this.setData({
      'task.repeat': repeat,
      isCustomRepeat: repeat === 'custom',
      'task.customDays': repeat === 'custom' ? this.data.task.customDays : [],
    });
  },

  selectCustomDays(e) {
    const customDays = e.detail.value;
    this.setData({
      'task.customDays': customDays,
    });
  },

  updateRemark(e) {
    this.setData({
      'task.remark': e.detail.value.trim(),
    });
  },

  async submitTask() {
    const { task, listId } = this.data;
    console.log('提交任务:', task); // 添加日志调试
    if (!task.name) {
      showToast('任务名称不能为空');
      return;
    }
    try {
      const taskToSave = {
        ...task,
        listId,
        id: this.data.taskId || Date.now(),
        completed: false,
      };
      if (this.data.taskId) {
        const tasks = await getTasks(listId);
        const existingTask = tasks.find(t => t.id === this.data.taskId);
        if (existingTask) {
          taskToSave._id = existingTask._id;
        }
      }
      await saveTask(taskToSave);
      showToast('保存任务成功', 'success');
      wx.redirectTo({
        url: `/pages/list/list?id=${listId}&t=${Date.now()}`,
      });
    } catch (e) {
      console.error('保存任务失败:', e);
      showToast('保存任务失败', 'error');
    }
  },
});