const db = wx.cloud.database();
Page({
  data: {
    peopleCount: '',
    date: ''
  },

  onLoad() {
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        console.log('getOpenId 成功:', res);
        if (res.result && res.result.openid) {
          wx.setStorageSync('openid', res.result.openid);
        } else {
          console.error('响应中无 openid:', res);
          wx.showToast({ title: '获取OpenID失败', icon: 'none' });
        }
      },
      fail: err => {
        console.error('getOpenId 失败:', err);
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      }
    });
  },

  onPeopleCountInput(e) {
    this.setData({ peopleCount: e.detail.value });
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  submitReservation() {
    const { peopleCount, date } = this.data;
    if (!peopleCount || !date) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.requestSubscribeMessage({
      tmplIds: ['IgwyXmLF_wbGs4dG0yjgyvsbVJYTo13iXJRo8y5WoS0'], // 替换为实际模板 ID
      success: res => {
        console.log('订阅消息结果:', res);
        if (res['IgwyXmLF_wbGs4dG0yjgyvsbVJYTo13iXJRo8y5WoS0'] === 'accept') {
          db.collection('reservations').add({
            data: {
              userId: wx.getStorageSync('openid') || 'test_user',
              peopleCount: parseInt(peopleCount),
              reserveTime: date,
              status: 'pending',
              createTime: db.serverDate()
            },
            success: res => {
              wx.cloud.callFunction({
                name: 'sendSubscriptionMessage',
                data: {
                  reservationId: res._id
                },
                success: res => {
                  console.log('订阅消息发送成功', res);
                },
                fail: err => {
                  console.error('订阅消息发送失败', err);
                }
              });
              wx.navigateTo({
                url: '/pages/success/success'
              });
            },
            fail: err => {
              console.error('保存预约失败:', err);
              wx.showToast({ title: '预约失败', icon: 'none' });
            }
          });
        } else {
          db.collection('reservations').add({
            data: {
              userId: wx.getStorageSync('openid') || 'test_user',
              peopleCount: parseInt(peopleCount),
              reserveTime: date,
              status: 'pending',
              createTime: db.serverDate()
            },
            success: res => {
              wx.navigateTo({
                url: '/pages/success/success'
              });
            },
            fail: err => {
              console.error('保存预约失败:', err);
              wx.showToast({ title: '预约失败', icon: 'none' });
            }
          });
        }
      },
      fail: err => {
        console.error('订阅消息失败:', err);
        db.collection('reservations').add({
          data: {
            userId: wx.getStorageSync('openid') || 'test_user',
            peopleCount: parseInt(peopleCount),
            reserveTime: date,
            status: 'pending',
            createTime: db.serverDate()
          },
          success: res => {
            wx.navigateTo({
              url: '/pages/success/success'
            });
          },
          fail: err => {
            console.error('保存预约失败:', err);
            wx.showToast({ title: '预约失败', icon: 'none' });
          }
        });
      }
    });
  }
});