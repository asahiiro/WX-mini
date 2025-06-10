我现在正在开发一个微信小程序，功能类似 to do listt ，使用的是微信云开发，包括一个云函数 login
里面有index.js
// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({
  env: 'cloud1-8gypolju2461fc18' // 你的云环境ID
});
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  return {
    openid: wxContext.OPENID,
  };
};
还有package.json
{
  "name": "login",
  "version": "1.0.0",
  "description": "获取用户OpenID",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}

包含app.wxss
/* app.wxss */
:root {
  --secondary-color: #034cd7;
  --background-gradient: linear-gradient(180deg, #002a9a 0%, #034cd7 100%);
  --card-background: linear-gradient(180deg, rgba(220, 234, 255, 0.9), rgba(220, 234, 255, 0.85));
  --border-color: #4682B4;
  --shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
  --border-radius: 16rpx;
  --spacing: 28rpx;
  --font-family: 'PingFang SC', -apple-system, Arial, sans-serif;
}

page {
  font-family: var(--font-family);
  background: linear-gradient(180deg, #1E3A8A 0%, #034cd7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  color: #1E3A8A;
}

text {
  background: linear-gradient(180deg, #1E3A8A 0%, #034cd7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  color: #1E3A8A !important;
}

text:not([class]) {
  background: linear-gradient(180deg, #1E3A8A 0%, #034cd7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  color: #1E3A8A !important;
}

包含一个utils.js
const db = wx.cloud.database();

const utils = {
  async getOpenId() {
    try {
      console.log('调用 login 云函数');
      const res = await wx.cloud.callFunction({ name: 'login' });
      if (!res.result || !res.result.openid) {
        throw new Error('云函数未返回 OpenID');
      }
      const openid = res.result.openid;
      wx.setStorageSync('openid', openid);
      console.log('OpenID:', openid);
      utils.showToast('获取 OpenID 成功', 'success');
      return openid;
    } catch (e) {
      console.error('获取 OpenID 失败:', e);
      utils.showToast('获取 OpenID 失败，请检查云函数', 'error');
      throw e;
    }
  },

  async getTasks(listId) {
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      console.log('查询任务，ListID:', listId, 'OpenID:', openid);
      const res = await db.collection('tasks').where({
        listId: Number(listId),
        _openid: db.command.eq(openid)
      }).get();
      // 确保 id 为数字
      const tasks = res.data.map(task => ({ ...task, id: Number(task.id) }));
      console.log('获取任务:', tasks);
      return tasks || [];
    } catch (e) {
      console.error('获取任务失败:', e);
      utils.showToast('获取任务失败', 'error');
      throw e;
    }
  },

  async saveTask(task) {
    try {
      console.log('保存任务:', task);
      // 清理保留字段
      const { _id, _openid, ...cleanTask } = task;
      cleanTask.listId = Number(task.listId); // 确保 listId 为数字
      if (_id) {
        console.log('更新任务，_id:', _id);
        await db.collection('tasks').doc(_id).update({ 
          data: cleanTask 
        });
      } else {
        const res = await db.collection('tasks').add({ 
          data: cleanTask 
        });
        task._id = res._id;
      }
      utils.showToast('保存任务成功', 'success');
      return task;
    } catch (e) {
      console.error('保存任务失败:', e);
      console.error('错误详情:', e.message, e.stack);
      utils.showToast('保存任务失败', 'error');
      throw e;
    }
  },

  async getLists() {
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      const res = await db.collection('lists').where({
        _openid: db.command.eq(openid)
      }).get();
      console.log('获取列表:', res.data);
      return res.data || [];
    } catch (e) {
      console.error('获取列表失败:', e);
      utils.showToast('获取列表失败', 'error');
      throw e;
    }
  },

  async saveList(list) {
    try {
      console.log('保存列表:', list);
      if (list._id) {
        await db.collection('lists').doc(list._id).update({ data: { ...list, _openid: undefined } });
      } else {
        const res = await db.collection('lists').add({ data: list });
        list._id = res._id;
      }
      utils.showToast('保存列表成功', 'success');
      return list;
    } catch (e) {
      console.error('保存列表失败:', e);
      utils.showToast('保存列表失败', 'error');
      throw e;
    }
  },

  async deleteList(listId) {
    try {
      const openid = wx.getStorageSync('openid') || await utils.getOpenId();
      console.log('删除列表:', listId);
      await db.collection('lists').where({
        id: listId,
        _openid: db.command.eq(openid)
      }).remove();
      await db.collection('tasks').where({
        listId: listId,
        _openid: db.command.eq(openid)
      }).remove();
      utils.showToast('删除列表成功', 'success');
    } catch (e) {
      console.error('删除列表失败:', e);
      utils.showToast('删除列表失败', 'error');
      throw e;
    }
  },

  getRepeatLabel(repeat, customDays) {
    if (!repeat || repeat === 'none') return '无';
    const labels = {
      daily: '每天',
      workday: '工作日',
      weekly: '每周',
      yearly: '每年',
      custom: `自定义: ${customDays?.length ? customDays.join(', ') : '无'}`,
    };
    return labels[repeat] || '';
  },

  showToast(title, icon = 'none', duration = 1500) {
    wx.showToast({ title, icon, duration });
  },

  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success: (res) => resolve(res.confirm),
      });
    });
  },
};

module.exports = utils;

和pages(里面有四个页面 index list task addTask)，先给你每个页面的js 和 wxml 代码，wxss代码等到用到的时候会给你

index

// pages/index/index.js
const { getLists, saveList, deleteList, showToast, showConfirm } = require('../../utils.js');

Page({
  data: {
    listData: [],
    isLoading: false,
  },

  onLoad() {
    this.loadListData();
  },

  onShow() {
    this.loadListData();
  },

  async loadListData() {
    this.setData({ isLoading: true });
    try {
      console.log('加载列表数据');
      const lists = await getLists();
      this.setData({ listData: lists, isLoading: false });
      if (!lists.length) {
        showToast('暂无列表，请创建新列表');
      }
    } catch (e) {
      console.error('加载列表失败:', e);
      this.setData({ isLoading: false });
      showToast('加载列表失败', 'error');
    }
  },

  goToList(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/list/list?id=${id}` });
  },

  async createList() {
    try {
      console.log('创建新列表');
      const lists = await getLists();
      const newId = lists.length ? Math.max(...lists.map(l => Number(l.id))) + 1 : 1;
      const newList = {
        id: newId,
        name: '新列表',
        background: '#DBEAFE',
        backgroundType: 'color',
        icon: '📋',
      };
      await saveList(newList);
      this.loadListData();
      wx.navigateTo({ url: `/pages/list/list?id=${newId}` });
    } catch (e) {
      console.error('创建列表失败:', e);
      showToast('创建列表失败', 'error');
    }
  },

  async deleteList(e) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await showConfirm('删除列表', '确定删除此列表？');
    if (!confirmed) return;

    try {
      console.log('删除列表:', id);
      await deleteList(id);
      this.loadListData();
      showToast('列表已删除', 'success');
    } catch (e) {
      console.error('删除列表失败:', e);
      showToast('删除列表失败', 'error');
    }
  },
});

<view class="container">
  <view class="list-container">
    <block wx:if="{{listData.length > 0}}" wx:for="{{listData}}" wx:key="id">
      <view class="list-item" style="background: {{item.background}}" bindtap="goToList" data-id="{{item.id}}" hover-class="list-item-hover">
        <text class="list-icon">{{item.icon}}</text>
        <text class="list-name">{{item.name}}</text>
        <text class="delete-btn" bindtap="deleteList" data-id="{{item.id}}">×</text>
      </view>
    </block>
    <view wx:if="{{listData.length === 0}}" class="empty-state">
      <text>暂无列表，点击右下角创建</text>
    </view>
  </view>
  <button class="create-btn" bindtap="createList" hover-class="create-btn-hover">+</button>
</view>

list

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

<view class="list-page {{list.backgroundType === 'image' ? 'image-bg' : 'color-bg'}}">
  <view class="header">
    <text class="header-title">{{list.name || '新列表'}}</text>
    <text class="edit-icon" bindtap="showEditModal">✏️</text>
  </view>

  <!-- 任务列表 -->
  <view class="task-list">
    <!-- 未完成任务 -->
    <block wx:for="{{incompleteTasks}}" wx:key="id">
      <view class="task-item">
        <view class="task-content" bindtap="goToTaskDetail" data-task-id="{{item.id}}">
          <text class="task-name {{item.completed ? 'completed' : ''}}">{{item.name || '未命名任务'}}</text>
          <view class="task-info">
            <text wx:if="{{item.dueDate}}" class="task-due">截止: {{item.dueDate}}</text>
            <text wx:if="{{item.repeat && item.repeat !== 'none'}}" class="task-repeat">重复: {{getRepeatLabel(item.repeat, item.customDays)}}</text>
          </view>
        </view>
        <view class="task-status {{item.completed ? 'completed' : ''}}" bindtap="toggleTaskComplete" data-task-id="{{item.id}}"></view>
      </view>
    </block>

    <!-- 已完成分界线 -->
    <view wx:if="{{completedTasks.length > 0}}" class="divider">
      <view class="divider-line"></view>
      <text class="divider-text">已完成</text>
      <view class="divider-line"></view>
    </view>

    <!-- 已完成任务 -->
    <block wx:for="{{completedTasks}}" wx:key="id">
      <view class="task-item">
        <view class="task-content" bindtap="goToTaskDetail" data-task-id="{{item.id}}">
          <text class="task-name {{item.completed ? 'completed' : ''}}">{{item.name || '未命名任务'}}</text>
          <view class="task-info">
            <text wx:if="{{item.dueDate}}" class="task-due">截止: {{item.dueDate}}</text>
            <text wx:if="{{item.repeat && item.repeat !== 'none'}}" class="task-repeat">重复: {{getRepeatLabel(item.repeat, item.customDays)}}</text>
          </view>
        </view>
        <view class="task-status {{item.completed ? 'completed' : ''}}" bindtap="toggleTaskComplete" data-task-id="{{item.id}}"></view>
      </view>
    </block>

    <view wx:if="{{incompleteTasks.length === 0 && completedTasks.length === 0}}" class="empty-state">
      <text>暂无任务，点击右下角 + 添加新任务</text>
    </view>
  </view>

  <!-- 编辑弹窗 -->
  <view class="modal {{showModal ? 'show' : 'hide'}}">
    <view class="modal-content">
      <view class="modal-item">
        <text class="modal-label">列表名称</text>
        <input class="modal-input" bindinput="inputName" value="{{list.name}}" placeholder="请输入列表名称" />
      </view>
      <view class="modal-item">
        <text class="modal-label">选择图标</text>
        <picker class="modal-picker" bindchange="selectIcon" range="{{iconOptions}}" value="{{selectedIconIndex}}">
          <view class="picker-content">{{iconOptions[selectedIconIndex] || '选择图标'}}</view>
        </picker>
      </view>
      <view class="modal-buttons">
        <text class="close-btn" bindtap="hideModal">× 退出</text>
        <text class="confirm-btn" bindtap="saveChanges">✔ 保存</text>
      </view>
    </view>
  </view>

  <!-- 悬浮按钮 -->
  <button class="float-btn" bindtap="goToCreateTask">+</button>
</view>

task

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

<view class="task-page">
  <view class="task-info">
    <view class="info-item">
      <text class="label">任务名称</text>
      <text class="value {{task.completed ? 'completed' : ''}}">{{task.name}}</text>
    </view>
    <view class="info-item">
      <text class="label">完成状态</text>
      <text class="value">{{task.completed ? '已完成' : '未完成'}}</text>
    </view>
    <view class="info-item" wx:if="{{task.dueDate}}">
      <text class="label">截止日期</text>
      <text class="value">{{task.dueDate}}</text>
    </view>
    <view class="info-item" wx:if="{{task.repeat !== 'none'}}">
      <text class="label">重复</text>
      <text class="value">{{getRepeatLabel(task.repeat, task.customDays)}}</text>
    </view>
    <view class="info-item">
      <text class="label">备注</text>
      <textarea class="remark-input" value="{{task.remark || ''}}" placeholder="请输入备注" bindinput="updateRemark" auto-height></textarea>
    </view>
  </view>
  <view class="button-group">
    <button class="save-remark-btn" bindtap="saveRemark">保存备注</button>
    <button class="edit-btn" bindtap="goToEditTask">修改</button>
  </view>
</view>

addTask

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

<view class="task-page">
  <form class="form" bindsubmit="submitTask">
    <view class="form-item">
      <text class="label">任务名称</text>
      <input class="input" name="taskName" value="{{taskName}}" placeholder="请输入任务名称" focus="{{true}}" bindinput="updateTaskName" maxlength="50" />
    </view>
    <view class="form-item">
      <text class="label">截止日期（可选）</text>
      <picker class="picker" mode="date" bindchange="selectDueDate" value="{{dueDate}}">
        <view class="picker-content">{{dueDate || '选择日期'}}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">重复（可选）</text>
      <radio-group class="radio-group" bindchange="selectRepeat">
        <label class="radio-label" wx:for="{{repeatOptions}}" wx:key="value">
          <radio value="{{item.value}}" checked="{{repeat === item.value}}" />{{item.label}}
        </label>
      </radio-group>
    </view>
    <view hidden="{{repeat !== 'custom'}}" class="form-item custom-days">
      <text class="label">选择重复的星期</text>
      <checkbox-group class="checkbox-group" bindchange="selectCustomDays">
        <label class="checkbox-label" wx:for="{{daysOfWeek}}" wx:key="value">
          <checkbox value="{{item.value}}" checked="{{customDays.includes(item.value)}}">{{item.label}}</checkbox>
        </label>
      </checkbox-group>
    </view>
    <button class="save-btn" formType="submit">{{isEditing ? '保存修改' : '创建任务'}}</button>
  </form>
</view>


你先理解一下这些代码，之后再修改