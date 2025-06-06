const app = new getApp()

const appid = 'wxa3791deb7961ed5a'    // 填写APPID
const secret = '9ef1b730c158498bbdd67ba8806a008f'   // 填写APPSECERT（真实开发中是在服务器端填写，此处仅在本地开发，用小程序模拟服务器端，所以填在了小程序端）
const tempid = 'UnBiBCHR-vsa5xlu0REktlvHNX2fMlm1y7cVRp3TwvA'   // 填写模板ID

Page({
  data: {
    picker: {
      arr: ['0', '1', '2', '3', '4', '5', '6'],
      index: 1
    }
  },
  pickerChange: function(e) {
    this.setData({
      'picker.index': e.detail.value
    })
  },
  // 验证姓名
  nameChange: function(e) {
    this.checkName(e.detail.value)
  },
  // 验证手机号
  phoneChange: function(e) {
    this.checkPhone(e.detail.value)
  },
  // checkName()方法
  checkName: function(data) {
    var reg = /^[\u4E00-\u9FA5A-Za-z]+$/;
    return this.check(data, reg, '姓名输入错误！')
  },
  // checkPhone()方法
  checkPhone: function(data) {
    var reg = /^(((13)|(15)|(17)|(18))\d{9})$/;
    return this.check(data, reg, '手机号码输入有误！')
  },
  // check()方法
  check: function(data, reg, errMsg) {
    if (!reg.test(data)) {
      wx.showToast({
        title: errMsg,
        icon: 'none',
        duration: 1500
      })
      return false
    }
    return true
  },
  formSubmit: function(e) {
    var name = e.detail.value.name
    var phone = e.detail.value.phone
    if (this.checkName(name) && this.checkPhone(phone)) {
      // 在此处可编写代码将e.detail.value提交到服务器
      wx.login({
        success: res => {
          server.post({
            code: res.code
          }, () => {
            // 将表单提交给服务器，传入code
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500
            })
            // 提交成功后，由服务器发送订阅消息
            server.sendTemplateMessage(res => {
              console.log('订阅消息发送结果：', res.data)
            })
          })
        },
      })
    }
  },
  allowSubscribe: function() {
    if (!app.globalData.hasSubscribeMessage) {
      wx.requestSubscribeMessage({
        tmplIds: [tempid], // 在此处填写模板id
        success(res) {
          console.log(res)
          app.globalData.hasSubscribeMessage = res.errMsg.split(':')[1]
        }
      })
    }
  }
})
// 模拟服务器端代码
var server = {
  appid: appid, // 在此处填写自己的appid
  secret: secret, // 在此处填写自己的secret
  // 用于保存用户的openid
  user: {
    openid: ''
  },
  // 用于接收表单，调用this.getOpenid()根据code换取openid
  post: function(data, success) {
    console.log('收到客户端提交的数据：', data)
    this.getOpenid(data.code, res => {
     // let jsonString = JSON.stringify(res);
      console.log('用户openid：' , res.data.openid)
    this.user.openid = res.data.openid
      success()
    })
  },
  // 用于发送订阅消息
  getOpenid: function(code, success) {
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      data: {
        appid: this.appid,
        secret: this.secret,
        grant_type: 'authorization_code',
        js_code: code
      },
      success: success
    })
  },
  // 用于发送订阅消息
  sendTemplateMessage: function(success) {
    var user = this.user
    var data = {
      touser: user.openid,
      template_id: 'UnBiBCHR-vsa5xlu0REktlvHNX2fMlm1y7cVRp3TwvA',  // 在此处填写模板id
      page: 'guest',
      data: {
        thing7: { value: 'HTL&HTL' },
        thing2: { value: '北京市海淀区XX路XX酒店' },
        date1: { value: '2025年2月14日' }      
      }
    }
    this.getAccessToken(res => {
      var token = res.data.access_token
      console.log('服务器access_token：' + token)
      var url = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + token
      wx.request({
        url: url,
        method: 'post',
        data: data,
        success: success
      })
    })
  },
  // 用于获取access_token
  getAccessToken: function(success) {
    var url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + this.appid + '&secret=' + this.secret
    wx.request({
      url: url,
      success: success
    })
  }
}