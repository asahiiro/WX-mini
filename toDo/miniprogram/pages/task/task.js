// pages/task/task.js
const { getTasks, saveTask, showToast, getRepeatLabel } = require('../../utils.js');

Page({
  data: {
    listId: null,
    taskId: null,
    task: {},
    remark: '',
  },

  onLoad(options) {
    console.log('task 页面 onLoad，参数:', options);
    if (!options.listId || !options.taskId) {
      showToast('缺少必要参数', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this.loadData(options);
  },

  onShow() {
    if (this.data.listId && this.data.taskId) {
      console.log('task 页面 onShow，刷新数据:', { listId: this.data.listId, taskId: this.data.taskId });
      this.loadData({ listId: this.data.listId, taskId: this.data.taskId });
    }
  },

  async loadData({ listId, taskId: taskIdStr }) {
    const taskId = parseInt(taskIdStr, 10);
    if (!listId || isNaN(taskId)) {
      console.error('参数无效:', { listId, taskIdStr, taskId });
      showToast('参数错误', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    try {
      console.log('加载任务，ListID:', listId, 'TaskID:', taskId);
      const tasks = await getTasks(Number(listId));
      console.log('获取任务数据:', tasks);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('任务不存在，TaskID:', taskId);
        showToast('任务不存在', 'error');
        setTimeout(() => wx.navigateBack(), 1500);
        return;
      }
      this.setData({ 
        listId: Number(listId),
        taskId,
        task,
        remark: task.remark || '',
      });
      console.log('任务加载成功:', task);
    } catch (e) {
      console.error('加载任务失败:', e);
      showToast('加载任务失败', 'error');
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  updateRemark(e) {
    console.log('更新备注:', e.detail.value);
    this.setData({ remark: e.detail.value.trim() });
  },

  async saveRemark() {
    const { listId, taskId, remark } = this.data;
    if (!listId || !taskId) {
      console.error('保存备注失败，无效参数:', { listId, taskId });
      showToast('参数错误', 'error');
      return;
    }
    try {
      console.log('保存备注，ListID:', listId, 'TaskID:', taskId, 'Remark:', remark);
      const tasks = await getTasks(Number(listId));
      console.log('获取任务数据:', tasks);
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error('任务不存在，TaskID:', taskId);
        showToast('任务不存在', 'error');
        return;
      }
      task.remark = remark || null;
      await saveTask(task);
      this.setData({ 'task.remark': remark || null });
      showToast('备注已保存', 'success');
    } catch (e) {
      console.error('保存备注失败:', e);
      showToast('保存备注失败', 'error');
    }
  },

  goToEditTask() {
    const { listId, taskId } = this.data;
    if (!listId || !taskId) {
      console.error('跳转编辑任务失败，无效参数:', { listId, taskId });
      showToast('参数错误', 'error');
      return;
    }
    console.log('跳转到编辑任务:', { listId, taskId });
    wx.navigateTo({ url: `/pages/addTask/addTask?listId=${listId}&taskId=${taskId}` });
  },

  getRepeatLabel,
});