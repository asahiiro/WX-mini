Page({
  data: {
    weather: null,      // 存储实况天气数据
    forecasts: null,    // 存储预报天气数据
    lastThreeDays: null,//存储后三天的天气数据
    isLoading: true,   // 加载状态
    currentTheme: 'default', // 默认主题
    themes: {
      'default': {
        navBarBgColor: '#01319f', // 导航栏背景色
        navBarFrontColor: '#ffffff' // 标题和图标颜色
      },
      'snowy': {
        navBarBgColor: '#daeef8',
        navBarFrontColor: '#000000'
      },
      'rainy': {
        navBarBgColor: '#1d252f',
        navBarFrontColor: '#ffffff'
      },
      'sunny': {
        navBarBgColor: '#0d5dc3',
        navBarFrontColor: '#ffffff'
      },
      'cloudy': {
        navBarBgColor: '#fae4b7',
        navBarFrontColor: '#ffffff'
      },
      'overcast': {
        navBarBgColor: '#667683', // 中灰色背景
        navBarFrontColor: '#ffffff' // 白色文字
      }
    }
  },

  // 页面加载时触发
  onLoad: function() {
    this.getAdcode();
  },

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
          //确定要切换的主题
          const theme = that.getWeatherTheme(liveWeather.weather);
          // 将数字星期转换为汉字
          liveWeather.weekText = that.getWeekText(liveWeather.week);
          that.setData({
            weather: liveWeather,
            currentTheme:theme
          });
          that.setNavBarColor(); // 更新导航栏颜色
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
          let forecasts = res.data.forecasts[0].casts;
          // 将数字星期转换为汉字
          forecasts.forEach(item => {
            item.week= that.getWeekText(item.week);
          });

          //添加天气对应的图标
          forecasts = forecasts.map(cast => {
            return {
              ...cast,
              dayIcon: that.getWeatherIcon(cast.dayweather, true),   // 白天图标 URL
              nightIcon: that.getWeatherIcon(cast.nightweather, false) // 晚上图标 URL
            };
          });

          that.setData({
            forecasts: forecasts,  // 存储处理后的预报天气数据
            lastThreeDays: forecasts.slice(-3),
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
  },
  
    // 获取天气图标的 URL
    getWeatherIcon(weather, isDay) {
      const baseUrl = 'https://data-wyzmv.kinsta.page/icon/'; // 替换为你的图片托管地址
      let weatherType = '';
  
      // 根据天气描述确定天气类型
      if (weather.includes('雨')) {
        weatherType = 'rainy';
        // 雨天白天和晚上使用同一张图片
      } else if (weather.includes('雪')) {
        weatherType = 'snowy';
        // 雪天白天和晚上使用同一张图片
      } else if (weather.includes('晴')) {
        weatherType = 'sunny';
        // 晴天需要区分白天和晚上
        return `${baseUrl}${weatherType}${isDay ? '-day' : '-night'}.png`;
      } else if (weather.includes('云')) {
        weatherType = 'cloudy';
        return `${baseUrl}${weatherType}${isDay ? '-day' : '-night'}.png`;
        // 多云需要区分白天和晚上
      } else if (weather.includes('阴')) {
        weatherType = 'cloud';
        // 阴天白天和晚上使用同一张图片
      } else {
        weatherType = 'kawaii-ghost';
        // 默认情况使用同一张图片
      }
  
      // 对于不区分白天和晚上的天气，直接返回相同的 URL
      return `${baseUrl}${weatherType}.png`;
    },

    // 获取天气相关主题
    getWeatherTheme(weather) {
      let weatherType = '';
      if (weather.includes('雪')) {
        weatherType = 'snowy';
      } else if (weather.includes('雨')) {
        weatherType = 'rainy';
      } else if (weather.includes('晴')) {
        weatherType = 'sunny';
      } else if (weather.includes('云')) {
        weatherType = 'cloudy';
      } else if (weather.includes('阴')) {
        weatherType = 'overcast';
      } else {
        weatherType = 'default';
      }
      return weatherType;
    },
    setNavBarColor: function() {
      const theme = this.data.themes[this.data.currentTheme] || this.data.themes['default'];
      wx.setNavigationBarColor({
        frontColor: theme.navBarFrontColor, // 标题和图标颜色
        backgroundColor: theme.navBarBgColor, // 导航栏背景色
        animation: {
          duration: 400, // 动画时长（毫秒）
          timingFunc: 'easeIn' // 动画效果
        }
      });
    }
});
