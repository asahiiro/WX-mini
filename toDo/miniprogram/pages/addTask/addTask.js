const { getTasks, saveTask, showToast } = require('../../utils.js');

Page({
  data: {
    listId: null,
    taskId: null,
    taskName: '', // Align with WXML input binding
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
    daysOfWeek: [
      { label: '周一', value: 'Monday', checked: false },
      { label: '周二', value: 'Tuesday', checked: false },
      { label: '周三', value: 'Wednesday', checked: false },
      { label: '周四', value: 'Thursday', checked: false },
      { label: '周五', value: 'Friday', checked: false },
      { label: '周六', value: 'Saturday', checked: false },
      { label: '周日', value: 'Sunday', checked: false },
    ],
    isCustomRepeat: false,
    isEditing: false,
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
      isEditing: !!options.taskId,
    });
    if (options.taskId) {
      this.loadTask();
    }
    wx.setNavigationBarTitle({ title: this.data.isEditing ? '编辑任务' : '新建任务' });
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
      // Update daysOfWeek with checked status based on customDays
      const daysOfWeek = this.data.daysOfWeek.map(day => ({
        ...day,
        checked: task.customDays?.includes(day.value) || false,
      }));
      this.setData({
        taskName: task.name || '',
        task: {
          name: task.name || '',
          dueDate: task.dueDate || '',
          repeat: task.repeat || 'none',
          customDays: task.customDays || [],
          remark: task.remark || '',
        },
        daysOfWeek,
        isCustomRepeat: task.repeat === 'custom',
      });
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
    }
  },

  updateTaskName(e) {
    const name = e.detail.value.trim();
    this.setData({
      taskName: name,
      'task.name': name, // Sync with task object
    });
  },

  selectDueDate(e) {
    const dueDate = e.detail.value;
    this.setData({
      'task.dueDate': dueDate,
    });
    console.log('选择截止日期:', dueDate);
  },

  selectRepeat(e) {
    const repeat = e.detail.value;
    this.setData({
      'task.repeat': repeat,
      isCustomRepeat: repeat === 'custom',
      'task.customDays': repeat === 'custom' ? this.data.task.customDays : [],
    });
    console.log('选择重复方式:', repeat);
  },

  selectCustomDays(e) {
    const customDays = e.detail.value;
    this.setData({
      'task.customDays': customDays,
      daysOfWeek: this.data.daysOfWeek.map(day => ({
        ...day,
        checked: customDays.includes(day.value),
      })),
    });
    console.log('选择自定义重复日期:', customDays);
  },

  updateRemark(e) {
    this.setData({
      'task.remark': e.detail.value.trim(),
    });
  },

  async submitTask() {
    const { task, taskName, listId, taskId, isEditing } = this.data;
    if (!taskName) {
      showToast('任务名称不能为空');
      return;
    }
    try {
      const taskToSave = {
        ...task,
        name: taskName, // Ensure taskName is used
        listId: Number(listId),
        id: taskId || Date.now(),
        completed: isEditing ? (await getTasks(listId)).find(t => t.id === taskId)?.completed || false : false,
        repeatLabel: this.data.repeatOptions.find(opt => opt.value === task.repeat)?.label || '无',
      };
      if (isEditing && taskId) {
        const tasks = await getTasks(listId);
        const existingTask = tasks.find(t => t.id === taskId);
        if (existingTask) {
          taskToSave._id = existingTask._id;
        }
      }
      await saveTask(taskToSave);
      showToast(isEditing ? '保存修改成功' : '创建任务成功', 'success');
      wx.redirectTo({
        url: `/pages/list/list?id=${listId}&t=${Date.now()}`,
      });
    } catch (e) {
      console.error('保存任务失败:', e);
      showToast('保存任务失败', 'error');
    }
  },
});