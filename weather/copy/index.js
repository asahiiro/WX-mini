Page({
  data: {
    weather: null,      // 存储实况天气数据
    forecasts: null,    // 存储预报天气数据
    lastThreeDays: null,//存储后三天的天气数据
    isLoading: true     // 加载状态
  },

  // 页面加载时触发
  onLoad: function() {
    this.getUserLocation();  // 获取用户位置
  },

  // 获取用户位置权限
  getUserLocation: function() {
    const that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.getLocation();  // 授权成功后获取经纬度
            },
            fail() {
              wx.showToast({
                title: '请授权地理位置',
                icon: 'none'
              });
            }
          });
        } else {
          that.getLocation();  // 已授权，直接获取经纬度
        }
      }
    });
  },

  // 获取经纬度
  getLocation: function() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',  // 使用 WGS84 坐标系
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        that.getAdcode(longitude, latitude);  // 调用逆地理编码
      },
      fail() {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
        that.setData({ isLoading: false });
      }
    });
  },

  // 通过逆地理编码获取 adcode
  getAdcode: function(longitude, latitude) {
    const that = this;
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',  // 你的高德 API Key
        location: `${longitude},${latitude}`
      },
      success(res) {
        if (res.data.status === '1') {
          const adcode = res.data.regeocode.addressComponent.adcode;
          that.getLiveWeather(adcode);      // 获取实况天气
          that.getForecastWeather(adcode);  // 获取预报天气
        } else {
          wx.showToast({
            title: '获取位置信息失败',
            icon: 'none'
          });
          that.setData({ isLoading: false });
        }
      },
      fail() {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        that.setData({ isLoading: false });
      }
    });
  },

  // 获取实况天气数据
  getLiveWeather: function(adcode) {
    const that = this;
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',  // 你的高德 API Key
        city: adcode,
        extensions: 'base'  // 获取实况天气
      },
      success(res) {
        if (res.data.status === '1') {
          that.setData({
            weather: res.data.lives[0]  // 存储实况天气数据
          });
        } else {
          wx.showToast({
            title: '获取实况天气失败',
            icon: 'none'
          });
        }
      },
      fail() {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取预报天气数据
  getForecastWeather: function(adcode) {
    const that = this;
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',  // 你的高德 API Key
        city: adcode,
        extensions: 'all'  // 获取预报天气
      },
      success(res) {
        if (res.data.status === '1') {
          that.setData({
            forecasts: res.data.forecasts[0].casts,  // 存储预报天气数据
            lastThreeDays: res.data.forecasts[0].casts.slice(-3),
            isLoading: false  // 加载完成
          });
          console.log(this.data.forecasts[0]);
        } else {
          wx.showToast({
            title: '获取预报天气失败',
            icon: 'none'
          });
          that.setData({ isLoading: false });
        }
      },
      fail() {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        that.setData({ isLoading: false });
      }
    });
  }
});