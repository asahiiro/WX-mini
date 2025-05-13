const db = wx.cloud.database();
Page({
  data: {
    peopleCount: '',
    date: ''
  },

  onLoad() {
    // 获取用户OpenID
    wx.cloud.callFunction({
      name: 'getOpenId',
      success: res => {
        wx.setStorageSync('openid', res.result.openid);
      },
      fail: err => {
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

    // Step 1: Request subscription message permission
    wx.requestSubscribeMessage({
      tmplIds: ['your_template_id'], // Replace with your actual template ID
      success: res => {
        if (res['your_template_id'] === 'accept') {
          // Step 2: Save reservation to database
          db.collection('reservations').add({
            data: {
              userId: wx.getStorageSync('openid') || 'test_user',
              peopleCount: parseInt(peopleCount),
              reserveTime: date,
              status: 'pending',
              createTime: db.serverDate()
            },
            success: res => {
              // Step 3: Send subscription message
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
              // Step 4: Navigate to success page
              wx.navigateTo({
                url: '/pages/success/success'
              });
            },
            fail: err => {
              wx.showToast({ title: '预约失败', icon: 'none' });
            }
          });
        } else {
          // User denied permission, still save reservation
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
              wx.showToast({ title: '预约失败', icon: 'none' });
            }
          });
        }
      },
      fail: err => {
        console.error('订阅消息请求失败', err);
        // Even if subscription fails, proceed with reservation
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
            wx.showToast({ title: '预约失败', icon: 'none' });
          }
        });
      }
    });
  }
});