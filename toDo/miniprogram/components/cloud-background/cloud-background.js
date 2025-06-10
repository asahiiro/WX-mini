Component({
  data: {
    clouds: [],
  },
  lifetimes: {
    attached() {
      const app = getApp();
      this.setData({ clouds: app.globalData.clouds });
    },
  },
});