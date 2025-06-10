App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-8gypolju2461fc18',
      traceUser: true,
    });
    this.migrateData();
    // 加载自定义字体
    wx.loadFontFace({
      family: 'Pixel',
      source: 'url("https://cloud.tencent.com/ark-pixel-12px-monospaced-zh_cn.ttf")',
      success: () => {
        console.log('字体加载成功');
      },
      fail: (err) => {
        console.error('字体加载失败:', err);
      }
    });

    // 初始化动态云数据
    this.globalData.clouds = this.generateClouds(15);
  },

  generateClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
      clouds.push({
        id: i,
        size: Math.random() * 200 + 100,
        left: Math.random() * 100,
        top: Math.random() * 80,
        animationDelay: Math.random() * 5,
        zIndex: Math.floor(Math.random() * 10),
      });
    }
    return clouds;
  },

  globalData: {
    clouds: [],
  },

  navigateTo(options) {
    const url = options.url.includes('?') ? `${options.url}&t=${Date.now()}` : `${options.url}?t=${Date.now()}`;
    wx.redirectTo({
      ...options,
      url,
    });
  },

  navigateBack(options) {
    wx.navigateBack({
      ...options,
      success: () => {
        const pages = getCurrentPages();
        if (pages.length > 0) {
          pages[pages.length - 1].onShow();
        }
      },
    });
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