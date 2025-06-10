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