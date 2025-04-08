Page({
  data: {
    building: '点击开始摇一摇',
    desc: '',
    distance: null,
    distanceColor: '#666',
    userLocation: null,
    buildings: [
      { name: '紫竹餐厅', latitude: 40.252133, longitude: 116.140109, desc: '校园美食聚集地' },
      { name: '玉兰食堂', latitude: 40.253898, longitude: 116.141107, desc: '学生用餐好去处' },
      { name: '图书馆', latitude: 40.25251, longitude: 116.144722, desc: '知识的海洋' },
      { name: '第一教学楼', latitude: 40.248686, longitude: 116.144285, desc: '学术核心区域' },
      { name: '第二教学楼', latitude: 40.253388, longitude: 116.143502, desc: '现代化教学楼' },
      { name: '大学生活动中心', latitude: 40.253046, longitude: 116.141536, desc: '课外活动中心' },
      { name: '体育馆', latitude: 40.246868, longitude: 116.142657, desc: '运动爱好者天堂' },
      { name: '风雨操场', latitude: 40.248228, longitude: 116.139806, desc: '室内运动场地' },
      { name: '玉屏山', latitude: 40.258956, longitude: 116.141504, desc: '校园自然景观' },
      { name: '第二操场', latitude: 40.257505, longitude: 116.145428, desc: '户外运动场' },
      { name: '实验楼', latitude: 40.250087, longitude: 116.145781, desc: '科研实验基地' }
    ]
  },

  // 获取用户位置
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.setData({
            userLocation: {
              latitude: res.latitude,
              longitude: res.longitude
            }
          });
          resolve(res);
        },
        fail: (err) => {
          wx.showToast({ title: '请授权位置信息', icon: 'none' });
          reject(err);
        }
      });
    });
  },

  // 计算两点间距离（单位：米）
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 地球半径（米）
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c); // 返回整数距离
  },

  // 随机选择建筑
  randomBuilding() {
    const { buildings } = this.data;
    const randomIndex = Math.floor(Math.random() * buildings.length);
    return buildings[randomIndex];
  },

  // 开始摇一摇
  startShake() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => this.handleShake(),
            fail: () => wx.showToast({ title: '请授权位置信息', icon: 'none' })
          });
        } else {
          this.handleShake();
        }
      }
    });
  },

  // 处理摇一摇逻辑
  handleShake() {
    this.getLocation().then(() => {
      const selectedBuilding = this.randomBuilding();
      const { userLocation } = this.data;
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        selectedBuilding.latitude,
        selectedBuilding.longitude
      );
      const distanceColor = distance < 500 ? '#07c160' : distance < 1000 ? '#ff9900' : '#ff4444';

      wx.vibrateLong();
      this.setData({ building: '摇晃中...', desc: '', distance: null });
      setTimeout(() => {
        this.setData({
          building: selectedBuilding.name,
          desc: selectedBuilding.desc,
          distance: distance,
          distanceColor: distanceColor
        });
      }, 500);
    }).catch(err => {
      console.error(err);
    });
  },

  onLoad() {
    wx.onAccelerometerChange((res) => {
      const threshold = 1.5;
      if (Math.abs(res.x) > threshold || Math.abs(res.y) > threshold || Math.abs(res.z) > threshold) {
        this.handleShake();
      }
    });
  }
});