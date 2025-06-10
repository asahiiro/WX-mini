// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-8gypolju2461fc18',
      traceUser: true,
    });
    this.migrateData();
  },

  async migrateData() {
    try {
      console.log('开始数据迁移');
      const { getLists, saveList, getTasks, saveTask } = require('./utils.js');
      
      const migrated = wx.getStorageSync('migrated');
      if (migrated) {
        console.log('数据已迁移，跳过');
        return;
      }

      const localLists = wx.getStorageSync('lists') || [];
      console.log('本地列表:', localLists);
      for (const list of localLists) {
        await saveList(list);
      }

      const localTasks = wx.getStorageSync('tasks') || {};
      console.log('本地任务:', localTasks);
      for (const listId in localTasks) {
        const tasks = localTasks[listId];
        for (const task of tasks) {
          task.listId = parseInt(listId);
          await saveTask(task);
        }
      }

      wx.setStorageSync('migrated', true);
      wx.showToast({ title: '数据迁移完成', icon: 'success' });
      wx.removeStorageSync('lists');
      wx.removeStorageSync('tasks');
      console.log('数据迁移完成');
    } catch (e) {
      console.error('数据迁移失败:', e);
      wx.showToast({ title: '数据迁移失败', icon: 'error' });
    }
  }
});