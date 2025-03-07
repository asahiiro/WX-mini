// pages/index/index.js
Page({
  data: {
    targetNumber: 0,
    guess: '', 
    message: '猜一个1-100之间的数字吧！',
    //动画初始
    characterActive: false,
    chatBubbleActive:false,
    //切换主题初始
    theme: 'theme-light',
    backgroundImage: '/image/pixel/Bakery pixel art (1).jpg',
    characterImage: '/image/angeh.png',
    iconImage: '/icon/sunf.png',
    lightBackgroundImage: '/image/pixel/Bakery pixel art (1).jpg', 
    lightCharacterImage: '/image/angeh.png', 
    lightIconImage: '/icon/sunf.png',
    darkBackgroundImage: '/image/pixel/Bakery pixel art.jpg',
    darkCharacterImage: '/image/tokoh.png',
    darkIconImage: '/icon/moonstar.png' 
  },

  //切换主题
  //背景，人物，图标
  //各种框的颜色和阴影
  toggleTheme() {
    const isLight = this.data.theme === 'theme-light'; 
    this.setData({
      theme: isLight ? 'theme-dark' : 'theme-light', 
      backgroundImage: isLight ? this.data.darkBackgroundImage : this.data.lightBackgroundImage, 
      characterImage: isLight ? this.data.darkCharacterImage : this.data.lightCharacterImage, 
      iconImage: isLight ? this.data.darkIconImage : this.data.lightIconImage 
    });
  },


  //人物动画
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
              setTimeout(animate, 150); 
            }
          }, 300);
        }
      };
      animate();
    },

    //泡泡动画
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
              setTimeout(animate, 150);
            }
          }, 300);
        }
      };
      animate();
    },
  

//游戏机制

  //加载
  onLoad: function () {
    this.resetGame();
  },

  //输入
  inputGuess: function (e) {
    this.setData({
      guess: e.detail.value
    });
  },


  //判断
    checkGuess: function () {
      const guess = parseInt(this.data.guess);
      const target = this.data.targetNumber;
  
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
          message: '嘿嘿，猜小了呢！再努力一下！'
        });
      } else {
        this.setData({
          message: '哇哇！你怎么知道是' + target + '！'
        });
        this.animateCharacter(3);
        this.animateChatBubble(3);
      }
    },


    //重置
  resetGame: function () {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    this.setData({
      targetNumber: randomNum,
      guess: '',
      message: '猜一个1-100之间的数字吧！'
    });
    this.animateCharacter(1);
    this.animateChatBubble(1);
  }
});