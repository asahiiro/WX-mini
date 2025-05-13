App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-8gypolju2461fc18',
      traceUser: true
    });
  }
});