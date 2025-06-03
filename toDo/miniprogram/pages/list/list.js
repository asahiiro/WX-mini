// pages/list/list.js
Page({
  data: {
    list: {},
    tasks: [],
    showModal: false,
    backgroundType: 'color',
    imageOptions: ['图片1', '图片2', '图片3'],
    iconOptions: ['📋', '📌', '📅', '✅'],
    selectedImageIndex: 0,
    selectedIconIndex: 0,
  },

  onLoad(options) {
    const id = options.id;
    const lists = wx.getStorageSync('lists') || [];
    const tasks = wx.getStorageSync('tasks') || {};
    const list = lists[id] || { id, name: '新列表', background: '#ffffff', icon: '📋' };
    this.setData({ list, tasks: tasks[id] || [] });
  },

  // 更新：跳转到 task 页面
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
    if (repeat === 'none') return '';
    if (repeat === 'daily') return '每天';
    if (repeat === 'workday') return '工作日';
    if (repeat === 'weekly') return '每周';
    if (repeat === 'yearly') return '每年';
    if (repeat === 'custom') return '自定义: ' + (customDays.length ? customDays.join(', ') : '无');
    return '';
  },

  showEditModal() {
    const iconIndex = this.data.iconOptions.indexOf(this.data.list.icon);
    this.setData({
      showModal: true,
      selectedIconIndex: iconIndex >= 0 ? iconIndex : 0,
      backgroundType: this.data.list.background.startsWith('http') ? 'image' : 'color',
    });
  },

  hideModal() {
    this.setData({ showModal: false });
  },

  inputName(e) {
    this.setData({ 'list.name': e.detail.value });
  },

  inputColor(e) {
    this.setData({ 'list.background': e.detail.value });
  },

  changeBackgroundType(e) {
    this.setData({ backgroundType: e.detail.value });
  },

  selectImage(e) {
    const index = e.detail.value;
    const imageUrls = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ];
    this.setData({
      selectedImageIndex: index,
      'list.background': imageUrls[index],
    });
  },

  selectIcon(e) {
    const index = e.detail.value;
    this.setData({
      selectedIconIndex: index,
      'list.icon': this.data.iconOptions[index],
    });
  },

  saveChanges() {
    const lists = wx.getStorageSync('lists') || [];
    lists[this.data.list.id] = this.data.list;
    wx.setStorageSync('lists', lists);
    this.setData({ showModal: false });
  },
});