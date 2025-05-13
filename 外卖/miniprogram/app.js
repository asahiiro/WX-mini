App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-8gypolju2461fc18', // 替换为实际云环境 ID
      traceUser: true
    }).then(() => {
      console.log('云初始化成功');
    }).catch(err => {
      console.error('云初始化失败:', err);
    });
  }
});