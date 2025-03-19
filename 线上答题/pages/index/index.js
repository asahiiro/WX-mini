// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stu:[
      {name :'',
      num:'',
      gender:'',
      points:[]
    }
  ]
  },

submit: function(e){
  var that = this;
console.log(e)
if (!(e.detail.value.gender && e.detail.value.name && e.detail.value.num && (e.detail.value.skills[0]||e.detail.value.skills[1]||e.detail.value.skills[2]||e.detail.value.skills[3]))) {
  wx.showToast({
      title: "请将信息填写完整",
      icon: 'error',
      mask: true,
  })
}else{

 that.setData({
   'stu[0].name': e.detail.value.name,
   'stu[0].gender': e.detail.value.gender,
   'stu[0].num': e.detail.value.num,
   'stu[0].points': e.detail.value.skills,
 })
 console.log("ok")
 wx.navigateTo({
  url: '/pages/list/list'
})
}
}

  

 

  



})