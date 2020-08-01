// pages/release/release.js
const api = require('../../utils/api.js');
const validate = require("../../utils/validate.js");
const util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messageType:"",
    title:"",
    number:"",
    content:"",
    date:'',
    address:'陕西省西安市',
    user:"",
    phone:"",
    code:"",
    // 验证码倒计时
    stateTime: 0,
    img1:"",
    img2:"",
    img3:""
  },

  // 供需类型
  _setType(e){
    this.setData({
      messageType:e.detail.value
    })
  },

  // 时间选择
  select(e){
    this.setData({
      date:e.detail.value
    })
  },

  // 获取验证码
  getCode(){
    if (this.data.stateTime > 0) {
      return;
    }
    let phone = this.data.phone;
    if(!phone){
      util._toast("请输入手机号")
      return;
    }else if(!validate.validPhone(phone)){
      util._toast("手机号格式错误")
      return;
    }
    
    this.setData({
      stateTime:60
    })

    let timer = setInterval(()=>{
      let stateTime = this.data.stateTime;
      if(stateTime>0){
        stateTime-=1;
        this.setData({
          stateTime:stateTime
        })
      }else{
        clearInterval(timer)
      }
    },1000)
    // console.log(phone)
    api._post("/sendSms",{
      mobile:phone
    }).then(res=>{
      if(!res.success){
        clearInterval(timer);
        util._toast("发送失败");
      }
    })
  },

  getParams(e){
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    this.setData({
      [key]:value
    })
  },

  // 上传图片
  upload(e){
    let baseUrl = e.currentTarget.dataset.baseurl;
    wx.navigateTo({
      url: `../imageCropper/imageCropper?baseUrl=${baseUrl}`
    });
  },

  // 删除图片
  del(e){
    let baseUrl = e.currentTarget.dataset.baseurl;
    this.setData({
      [baseUrl]:''
    })
  },

  // 确认发布
  confirm(){
    // console.log(this.data)
    if(!this.data.messageType){
      util._toast("请选择供需类型")
      return;
    }else if(!this.data.title){
      util._toast("请输入信息标题")
      return;
    }else if(!this.data.number){
      util._toast("请输入产品数量")
      return;
    }else if(!this.data.content){
      util._toast("请输入信息内容")
      return;
    }else if(!this.data.img1 || !this.data.img2 || !this.data.img3){
      util._toast("请上传图片")
      return;
    }else if(!this.data.date){
      util._toast("请选择时间")
      return;
    }else if(!this.data.address){
      util._toast("请输入地理位置")
      return;
    }else if(!this.data.user){
      util._toast("请输入联系人姓名")
      return;
    }else if(!this.data.phone){
      util._toast("请输入联系人电话")
      return;
    }else if(!this.data.code){
      util._toast("请输入验证码")
      return;
    }
    // console.log("确认发布")
    api._post('/message/insertMessage',{
      titleName:this.data.title,
      messageType:this.data.messageType,
      numbers:this.data.number,
      describle:this.data.content,
      img1:this.data.img1,
      img2:this.data.img2,
      img3:this.data.img3,
      endTime:this.data.date,
      userName:this.data.user,
      phone:this.data.phone,
      address:this.data.address,
      vcode:this.data.code
    }).then(res=>{
      if(res.success){
        util._toast("发布成功")
        wx.navigateBack({
          complete: (res) => {},
        })
      }else{
        util._toast(res.error.msg)  
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     // 获取图片
     let temp = wx.getStorageSync("tempImage") || false;
     // console.log(temp)
     if (temp) {
       this.setData({
         [temp.baseUrl]: temp.id
       });
       wx.setStorageSync("tempImage", false);
     }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})