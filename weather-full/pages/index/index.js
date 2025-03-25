Page({
  data: {
    currentIndex: 1,
    isMenuOpen: false,
    weather: null,
    forecasts: null,
    lastThreeDays: null,
    isLoading: true,
    currentTheme: 'default',
    showThemePicker: false,
    showWind: true,
    cityInput: '',
    switchColor: '#ffffff',
    themeOptions: [
      { key: 'default', name: '默认' },
      { key: 'sunny', name: '晴天' },
      { key: 'cloudy', name: '多云' },
      { key: 'overcast', name: '阴天' },
      { key: 'rainy', name: '雨天' },
      { key: 'snowy', name: '雪天' }
    ],
    themes: {
      'default': { navBarBgColor: '#01319f', navBarFrontColor: '#ffffff', switchColor: '#01319f' },
      'snowy': { navBarBgColor: '#daeef8', navBarFrontColor: '#000000', switchColor: '#daeef8' },
      'rainy': { navBarBgColor: '#1d252f', navBarFrontColor: '#ffffff', switchColor: '#79c3ff' },
      'sunny': { navBarBgColor: '#0d5dc3', navBarFrontColor: '#ffffff', switchColor: '#ffd000' },
      'cloudy': { navBarBgColor: '#fae4b7', navBarFrontColor: '#ffffff', switchColor: '#8d5c00' },
      'overcast': { navBarBgColor: '#667683', navBarFrontColor: '#ffffff', switchColor: '#6d6d6d' }
    }
  },


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
        key: '2f7c1f0473c07d78c0f430480094e126',
        location: `${longitude},${latitude}`
      },
      success(res) {
        if (res.data.status === '1') {
          const adcode = res.data.regeocode.addressComponent.adcode;
          that.getLiveWeather(adcode); 
          that.getForecastWeather(adcode); 
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
          liveWeather.liveIcon = this.getWeatherIcon(liveWeather.weather, true);
          this.setData({
            weather: liveWeather,
            currentTheme: theme,
            switchColor: this.data.themes[theme].switchColor
          });
          this.setNavBarColor();
        } else {
          wx.showToast({ title: '获取实况天气失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      },
      complete: () => {
        this.setData({ isLoading: false });
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
            lastThreeDays: forecasts.slice(-3)
          });
        } else {
          wx.showToast({ title: '获取预报天气失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络请求失败', icon: 'none' });
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
      showThemePicker: false
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
      showThemePicker: false,
      switchColor: this.data.themes[theme].switchColor
    });
    this.setNavBarColor();
    this.closeMenu();
  },

  refreshWeather: function() {
    this.setData({ isLoading: true });
    this.getAdcode();
    this.closeMenu();
  },

  toggleWindDisplay: function(e) {
    this.setData({
      showWind: e.detail.value
    });
  },

  onCityInput: function(e) {
    this.setData({
      cityInput: e.detail.value
    });
  },

  searchCityWeather: function() {
    const city = this.data.cityInput.trim();
    if (!city) {
      wx.showToast({ title: '请输入城市名', icon: 'none' });
      return;
    }

    this.setData({ isLoading: true });
    wx.request({
      url: 'https://restapi.amap.com/v3/config/district',
      data: {
        key: '2f7c1f0473c07d78c0f430480094e126',
        keywords: city,
        subdistrict: 0
      },
      success: (res) => {
        if (res.data.status === '1' && res.data.districts.length > 0) {
          const adcode = res.data.districts[0].adcode;
          this.getLiveWeather(adcode);
          this.getForecastWeather(adcode);
          this.closeMenu();
        } else {
          wx.showToast({ title: '未找到该城市', icon: 'none' });
          this.setData({ isLoading: false });
        }
      },
      fail: () => {
        wx.showToast({ title: '查询失败，请检查网络', icon: 'none' });
        this.setData({ isLoading: false });
      }
    });
  }
});