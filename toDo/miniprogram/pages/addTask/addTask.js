const { getTasks, saveTask, showToast } = require('../../utils.js');

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
    console.log('addTask 参数:', options);
    if (!options.listId) {
      console.error('缺少 listId 参数:', options);
      showToast('缺少列表ID', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.setData({ listId: Number(options.listId) });
    if (options.taskId) {
      const taskId = parseInt(options.taskId, 10);
      if (isNaN(taskId)) {
        console.error('无效 taskId:', options.taskId);
        showToast('任务ID无效', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.loadTask(taskId);
    }
  },

  async loadTask(taskId) {
    try {
      console.log('加载任务，ListID:', this.data.listId, 'TaskID:', taskId);
      const tasks = await getTasks(this.data.listId);
      console.log('获取任务数据:', tasks);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('任务不存在，TaskID:', taskId);
        showToast('任务不存在', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({
        taskId,
        isEditing: true,
        taskName: task.name || '',
        dueDate: task.dueDate || '',
        repeat: task.repeat || 'none',
        customDays: task.customDays || [],
      });
      console.log('任务加载成功:', task);
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  selectDueDate(e) {
    this.setData({ dueDate: e.detail.value });
  },

  selectRepeat(e) {
    const repeat = this.data.repeatOptions[e.detail.value].value;
    this.setData({
      repeat,
      customDays: repeat === 'custom' ? this.data.customDays : [],
    });
    console.log('选择重复类型:', repeat, 'CustomDays:', this.data.customDays);
  },

  selectCustomDays(e) {
    const customDays = e.detail.value;
    this.setData({ customDays });
    console.log('选择自定义星期:', customDays);
  },

  updateTaskName(e) {
    this.setData({ taskName: e.detail.value.trim() });
  },

  async submitTask(e) {
    const taskName = e.detail.value.taskName.trim();
    if (!taskName) {
      showToast('任务名称不能为空');
      return;
    }
    if (taskName.length > 50) {
      showToast('任务名称不能超过50字');
      return;
    }
    if (this.data.repeat === 'custom' && !this.data.customDays.length) {
      showToast('自定义重复需选择至少一个星期');
      return;
    }

    try {
      console.log('提交任务:', taskName);
      const tasks = await getTasks(this.data.listId);
      let task = {
        listId: this.data.listId,
        id: this.data.isEditing ? this.data.taskId : Date.now(),
        name: taskName,
        dueDate: this.data.dueDate || null,
        repeat: this.data.repeat,
        customDays: this.data.repeat === 'custom' ? this.data.customDays : [],
        completed: false,
      };
      if (this.data.isEditing) {
        const existingTask = tasks.find(t => t.id === this.data.taskId);
        if (existingTask) {
          task = { ...existingTask, ...task };
        } else {
          console.error('任务不存在，TaskID:', this.data.taskId);
          showToast('任务不存在', 'error');
          return;
        }
      }
      await saveTask(task);
      showToast(this.data.isEditing ? '任务已更新' : '任务创建成功', 'success');
      wx.navigateBack();
    } catch (e) {
      console.error('保存任务失败:', e);
      showToast('保存任务失败', 'error');
    }
  },
});