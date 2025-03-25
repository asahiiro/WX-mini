Page({
  data: {
    currentIndex: 1,
    isMenuOpen: false,
    weather: null,
    forecasts: null,
    lastThreeDays: null,
    isLoading: true,
    currentTheme: 'default',
    showThemePicker: false, // 控制主题选择列表的显示
    themeOptions: [
      { key: 'default', name: '默认' },
      { key: 'sunny', name: '晴天' },
      { key: 'cloudy', name: '多云' },
      { key: 'overcast', name: '阴天' },
      { key: 'rainy', name: '雨天' },
      { key: 'snowy', name: '雪天' }
    ],
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
    this.getAdcode();
  },

  getAdcode: function() {
    const adcode = 110114;
    this.getLiveWeather(adcode);
    this.getForecastWeather(adcode);
  },

  getLiveWeather: function(adcode) {
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',
        city: adcode,
        extensions: 'base'
      },
      success: (res) => {
        if (res.data.status === '1') {
          const liveWeather = res.data.lives[0];
          const theme = this.getWeatherTheme(liveWeather.weather);
          this.setData({
            weather: liveWeather,
            currentTheme: theme
          });
          this.setNavBarColor();
        } else {
          wx.showToast({ title: '获取实况天气失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      }
    });
  },

  getForecastWeather: function(adcode) {
    wx.request({
      url: 'https://restapi.amap.com/v3/weather/weatherInfo',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',
        city: adcode,
        extensions: 'all'
      },
      success: (res) => {
        if (res.data.status === '1') {
          let forecasts = res.data.forecasts[0].casts.map(item => ({
            ...item,
            week: this.getWeekText(item.week),
            dayIcon: this.getWeatherIcon(item.dayweather, true),
            nightIcon: this.getWeatherIcon(item.nightweather, false)
          }));
          this.setData({
            forecasts: forecasts,
            lastThreeDays: forecasts.slice(-3),
            isLoading: false
          });
        } else {
          wx.showToast({ title: '获取预报天气失败', icon: 'none' });
          this.setData({ isLoading: false });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        this.setData({ isLoading: false });
      }
    });
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
    if (weather.includes('雨')) return `${baseUrl}rainy.png`;
    if (weather.includes('雪')) return `${baseUrl}snowy.png`;
    if (weather.includes('晴')) return `${baseUrl}sunny-${isDay ? 'day' : 'night'}.png`;
    if (weather.includes('云')) return `${baseUrl}cloudy-${isDay ? 'day' : 'night'}.png`;
    if (weather.includes('阴')) return `${baseUrl}cloud.png`;
    return `${baseUrl}kawaii-ghost.png`;
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
  },

  openMenu: function() {
    this.setData({ currentIndex: 0, isMenuOpen: true });
  },

  closeMenu: function() {
    this.setData({ currentIndex: 1, isMenuOpen: false, showThemePicker: false });
  },

  onSwiperChange: function(e) {
    const current = e.detail.current;
    this.setData({
      currentIndex: current,
      isMenuOpen: current === 0,
      showThemePicker: false // 滑动时关闭主题选择
    });
  },

  toggleThemePicker: function() {
    this.setData({
      showThemePicker: !this.data.showThemePicker
    });
  },

  selectTheme: function(e) {
    const theme = e.currentTarget.dataset.theme;
    this.setData({
      currentTheme: theme,
      showThemePicker: false
    });
    this.setNavBarColor();
    this.closeMenu();
  },

  refreshWeather: function() {
    this.setData({ isLoading: true });
    this.getAdcode();
    this.closeMenu();
  }
});