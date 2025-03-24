Page({
  data: {
    weather: null,
    forecasts: null,
    lastThreeDays: null,
    isLoading: true,
    currentTheme: 'default',
    menuX: 0, // 初始位置，后续会被设置为 menuWidth
    showWindDirection: true,
    showWindPower: true,
    menuWidth: 525, // 默认宽度，稍后会被 getSystemInfo 更新
    themes: {
      'default': { navBarBgColor: '#01319f', navBarFrontColor: '#ffffff' },
      'snowy': { navBarBgColor: '#daeef8', navBarFrontColor: '#000000' },
      'rainy': { navBarBgColor: '#1d252f', navBarFrontColor: '#ffffff' },
      'sunny': { navBarBgColor: '#0d5dc3', navBarFrontColor: '#ffffff' },
      'cloudy': { navBarBgColor: '#fae4b7', navBarFrontColor: '#ffffff' },
      'overcast': { navBarBgColor: '#667683', navBarFrontColor: '#ffffff' }
    }
  },

  onLoad: function() {
    this.getSystemInfo();
    this.getAdcode();
  },

  getSystemInfo: function() {
    const that = this;
    wx.getSystemInfo({
      success: function(res) {
        const menuWidth = res.windowWidth * 0.7; // 菜单宽度为屏幕宽度的 70%
        that.setData({ 
          menuWidth: menuWidth,
          menuX: res.windowWidth // 初始隐藏在右侧
        });
      },
      fail: function() {
        wx.showToast({ title: '获取设备信息失败', icon: 'none' });
        that.setData({ 
          menuWidth: 525,
          menuX: 750 // 默认隐藏在右侧（假设屏幕宽度 750rpx）
        });
      }
    });
  },

  getAdcode: function() {
    const adcode = 110114;
    this.getLiveWeather(adcode);
    this.getForecastWeather(adcode);
  },

  getLiveWeather: function(adcode) {
    const that = this;
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126', // 请替换为你的高德 API Key
        city: adcode,
        extensions: 'base'
      },
      success(res) {
        if (res.data.status === '1') {
          const liveWeather = res.data.lives[0];
          const theme = that.getWeatherTheme(liveWeather.weather);
          liveWeather.weekText = that.getWeekText(liveWeather.week);
          that.setData({ weather: liveWeather, currentTheme: theme });
          that.setNavBarColor();
        } else {
          wx.showToast({ title: '获取实况天气失败', icon: 'none' });
        }
      },
      fail() {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  },

  getForecastWeather: function(adcode) {
    const that = this;
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126', // 请替换为你的高德 API Key
        city: adcode,
        extensions: 'all'
      },
      success(res) {
        if (res.data.status === '1') {
          let forecasts = res.data.forecasts[0].casts;
          forecasts.forEach(item => {
            item.week = that.getWeekText(item.week);
          });
          forecasts = forecasts.map(cast => {
            return {
              ...cast,
              dayIcon: that.getWeatherIcon(cast.dayweather, true),
              nightIcon: that.getWeatherIcon(cast.nightweather, false)
            };
          });
          that.setData({
            forecasts: forecasts,
            lastThreeDays: forecasts.slice(-3),
            isLoading: false
          });
        } else {
          wx.showToast({ title: '获取预报天气失败', icon: 'none' });
          that.setData({ isLoading: false });
        }
      },
      fail() {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        that.setData({ isLoading: false });
      }
    });
  },

  onMovableChange: function(e) {
    this.setData({ menuX: e.detail.x }); // 实时更新位置
  },

  onTouchEnd: function(e) {
    const x = this.data.menuX;
    const menuWidth = this.data.menuWidth;
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    if (x < screenWidth - menuWidth / 2) {
      this.setData({ menuX: screenWidth - menuWidth }); // 完全显示
    } else {
      this.setData({ menuX: screenWidth }); // 完全隐藏
    }
  },

  changeTheme: function(e) {
    const theme = e.detail.value;
    this.setData({ currentTheme: theme });
    this.setNavBarColor();
  },

  toggleWindDirection: function(e) {
    this.setData({ showWindDirection: e.detail.value });
  },

  toggleWindPower: function(e) {
    this.setData({ showWindPower: e.detail.value });
  },

  getWeekText: function(week) {
    const weekMap = {
      '1': '星期一', '2': '星期二', '3': '星期三', '4': '星期四',
      '5': '星期五', '6': '星期六', '7': '星期日'
    };
    return weekMap[week] || '未知';
  },

  getWeatherIcon: function(weather, isDay) {
    const baseUrl = 'https://data-wyzmv.kinsta.page/icon/';
    let weatherType = '';
    if (weather.includes('雨')) {
      weatherType = 'rainy';
    } else if (weather.includes('雪')) {
      weatherType = 'snowy';
    } else if (weather.includes('晴')) {
      weatherType = 'sunny';
      return `${baseUrl}${weatherType}${isDay ? '-day' : '-night'}.png`;
    } else if (weather.includes('云')) {
      weatherType = 'cloudy';
      return `${baseUrl}${weatherType}${isDay ? '-day' : '-night'}.png`;
    } else if (weather.includes('阴')) {
      weatherType = 'cloud';
    } else {
      weatherType = 'kawaii-ghost';
    }
    return `${baseUrl}${weatherType}.png`;
  },

  getWeatherTheme: function(weather) {
    if (weather.includes('雪')) return 'snowy';
    if (weather.includes('雨')) return 'rainy';
    if (weather.includes('晴')) return 'sunny';
    if (weather.includes('云')) return 'cloudy';
    if (weather.includes('阴')) return 'overcast';
    return 'default';
  },

  setNavBarColor: function() {
    const theme = this.data.themes[this.data.currentTheme] || this.data.themes['default'];
    wx.setNavigationBarColor({
      frontColor: theme.navBarFrontColor,
      backgroundColor: theme.navBarBgColor,
      animation: { duration: 400, timingFunc: 'easeIn' }
    });
  }
});