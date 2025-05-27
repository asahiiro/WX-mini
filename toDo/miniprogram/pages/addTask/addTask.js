Page({
  data: {
    title: '',
    isAllDay: false, // 全天开关，默认关闭
    date: '',
    time: '',
    tagOptions: [
      { value: 'work', label: '工作' },
      { value: 'personal', label: '个人' },
      { value: 'urgent', label: '紧急' }
    ],
    tags: [],
    repeatOptions: ['无', '每天', '每周', '每月'],
    repeatIndex: 0
  },

  inputTitle(e) {
    this.setData({ title: e.detail.value });
  },

  toggleAllDay(e) {
    this.setData({
      isAllDay: e.detail.value,
      time: e.detail.value ? '' : this.data.time // 全天开启时清空时间
    });
  },

  changeDate(e) {
    this.setData({ date: e.detail.value });
  },

  changeTime(e) {
    this.setData({ time: e.detail.value });
  },

  changeTags(e) {
    this.setData({ tags: e.detail.value });
  },

  changeRepeat(e) {
    this.setData({ repeatIndex: e.detail.value });
  },

  saveTask(e) {
    const formData = e.detail.value;
    const task = {
      id: Date.now(),
      title: formData.title,
      deadline: formData.isAllDay ? formData.date : (formData.date && formData.time ? `${formData.date} ${formData.time}` : formData.date),
      isAllDay: formData.isAllDay,
      tags: formData.tags,
      repeat: this.data.repeatOptions[formData.repeat],
      completed: false
    };
    const tasks = wx.getStorageSync('tasks') || [];
    tasks.push(task);
    wx.setStorageSync('tasks', tasks);
    wx.navigateBack();
  },

  cancel() {
    wx.navigateBack();
  }
});