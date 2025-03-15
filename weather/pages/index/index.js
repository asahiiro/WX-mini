Page({
  data: {
    weather: null,      // 存储实况天气数据
    forecasts: null,    // 存储预报天气数据
    isLoading: true     // 加载状态
    
  },

  // 页面加载时触发
  onLoad: function() {
    this.getAdcode();
  },

  // 通过逆地理编码获取 adcode
  getAdcode: function() {
    const that = this;
    const adcode = 110114;
    that.getLiveWeather(adcode);      // 获取实况天气
    that.getForecastWeather(adcode);  // 获取预报天气
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
          const liveWeather = res.data.lives[0];
          // 将数字星期转换为汉字
          liveWeather.weekText = that.getWeekText(liveWeather.week);
          that.setData({
            weather: liveWeather
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
          const forecasts = res.data.forecasts[0].casts;
          // 将数字星期转换为汉字
          forecasts.forEach(item => {
            item.week= that.getWeekText(item.week);
          });
          that.setData({
            forecasts: forecasts,  // 存储处理后的预报天气数据
            isLoading: false      // 加载完成
          });
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
  },
  // 将数字星期转换为汉字
  getWeekText: function(week) {
    const weekMap = {
      '1': '星期一',
      '2': '星期二',
      '3': '星期三',
      '4': '星期四',
      '5': '星期五',
      '6': '星期六',
      '7': '星期日'
    };
    return weekMap[week] || '未知';
  }
});
