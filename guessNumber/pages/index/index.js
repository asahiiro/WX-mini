// pages/index/index.js
Page({
  data: {
    targetNumber: 0,    // 目标数字
    guess: '',         // 用户输入的猜测
    message: '嗨，我是小智！猜一个1-100之间的数字吧！'  // 人物的提示消息
  },

  // 页面加载时初始化游戏
  onLoad: function () {
    this.resetGame();
  },

  // 输入框绑定，实时更新guess值
  inputGuess: function (e) {
    this.setData({
      guess: e.detail.value
    });
  },

  // 检查用户猜测
  checkGuess: function () {
    const guess = parseInt(this.data.guess);
    const target = this.data.targetNumber;

    if (isNaN(guess) || guess < 1 || guess > 100) {
      this.setData({
        message: '请输入一个1-100之间的有效数字哦！'
      });
      return;
    }

    if (guess > target) {
      this.setData({
        message: '哎呀，猜大了！再试一次吧！'
      });
    } else if (guess < target) {
      this.setData({
        message: '嘿，猜小了！再努力一下！'
      });
    } else {
      this.setData({
        message: '哇！恭喜你猜中了！就是' + target + '！'
      });
    }
  },

  // 重置游戏
  resetGame: function () {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    this.setData({
      targetNumber: randomNum,
      guess: '',
      message: '游戏重置啦！猜一个1-100之间的数字吧！'
    });
  }
});