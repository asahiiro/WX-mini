// pages/index/index.js
Page({
  data: {
    targetNumber: 0,    // 目标数字
    guess: '',         // 用户输入的猜测
    message: '猜一个1-100之间的数字吧！', // 人物的提示消息
    characterActive: false,
    chatBubbleActive:false
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

    // 动画函数：触发人物动画，times 为动画次数
    animateCharacter: function (times) {
      let count = 0;
      const animate = () => {
        if (count < times) {
          this.setData({
            characterActive: true
          });
          setTimeout(() => {
            this.setData({
              characterActive: false
            });
            count++;
            if (count < times) {
              setTimeout(animate, 150); // 间隔 500 毫秒后进行下一次动画
            }
          }, 300); // 动画持续 300 毫秒
        }
      };
      animate();
    },

    animateChatBubble: function (times) {
      let count = 0;
      const animate = () => {
        if (count < times) {
          this.setData({
            chatBubbleActive: true
          });
          setTimeout(() => {
            this.setData({
              chatBubbleActive: false
            });
            count++;
            if (count < times) {
              setTimeout(animate, 150); // 间隔 150 毫秒后进行下一次动画
            }
          }, 300); // 动画持续 300 毫秒，与 WXSS 中的动画时间一致
        }
      };
      animate();
    },
  
    // 检查用户猜测
    checkGuess: function () {
      const guess = parseInt(this.data.guess);
      const target = this.data.targetNumber;
  
      // 触发两次动画
      this.animateCharacter(2);
      this.animateChatBubble(1);
  
      if (isNaN(guess) || guess < 1 || guess > 100) {
        this.setData({
          message: '这个数只在1-100之间哦！'
        });
        return;
      }
  
      if (guess > target) {
        this.setData({
          message: '哎呀，猜大了呢！再试一次吧！'
        });
      } else if (guess < target) {
        this.setData({
          message: '嘿，猜小了呢！再努力一下！'
        });
      } else {
        this.setData({
          message: '哇！恭喜你猜中了！就是' + target + '！'
        });
        this.animateChatBubble(3);
      }
    },

    //换背景图片，换人物图片，换图标
    //换边框颜色

  // 重置游戏
  resetGame: function () {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    this.setData({
      targetNumber: randomNum,
      guess: '',
      message: '游戏重置啦！猜一个1-100之间的数字吧！'
    });
    this.animateCharacter(1);
    this.animateChatBubble(1);
  }
});