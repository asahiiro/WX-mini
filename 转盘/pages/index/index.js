Page({
  data: {
    animation: {},
    isSpinning: false,
    prizes: [
      { id: 1, name: "一等奖", probability: 0.05 },
      { id: 2, name: "二等奖", probability: 0.1 },
      { id: 3, name: "三等奖", probability: 0.15 },
      { id: 4, name: "谢谢参与", probability: 0.7 }
    ],
    result: ""
  },

  onLoad: function () {
    this.animation = wx.createAnimation({
      duration: 4000,
      timingFunction: "ease-out"
    });
  },

  startLottery: function () {
    if (this.data.isSpinning) return;

    this.setData({
      isSpinning: true,
      result: ""
    });

    const prize = this.getRandomPrize();
    const prizeIndex = this.data.prizes.findIndex(p => p.id === prize.id);

    const baseAngle = 360 / this.data.prizes.length; // 90° per prize
    // Target the center of each section (45°, 135°, 225°, 315°)
    const targetAngle = 360 * 5 + (prizeIndex * baseAngle) + (baseAngle / 2);

    this.animation.rotate(targetAngle).step();
    this.setData({
      animation: this.animation.export()
    });

    setTimeout(() => {
      this.setData({
        isSpinning: false,
        result: `恭喜您获得：${prize.name}`
      });
      wx.showToast({
        title: `获得${prize.name}`,
        icon: "success",
        duration: 2000
      });
    }, 4000);
  },

  getRandomPrize: function () {
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const prize of this.data.prizes) {
      cumulativeProbability += prize.probability;
      if (rand <= cumulativeProbability) {
        return prize;
      }
    }
    return this.data.prizes[this.data.prizes.length - 1];
  },

  reset: function () {
    this.animation.rotate(0).step({ duration: 0 });
    this.setData({
      animation: this.animation.export(),
      isSpinning: false,
      result: ""
    });
  }
});