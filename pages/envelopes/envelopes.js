// pages/envelopes/envelopes.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow:true,
    isShow1:false,
    isShow2:false,
    count:'',
    total:'',
    content:'',
    redPackList:'',
    headImageUrl:'',
    name:'',
    remark:'',
    redisKey:'',
    mark:'',
    money:''
  },

  getPack(e){
    // console.log(e)
    let redisKey = e.currentTarget.dataset.key
    let mark = e.currentTarget.dataset.mark
    let image = e.currentTarget.dataset.image 
    let name = e.currentTarget.dataset.name
    let remark = e.currentTarget.dataset.remark
    if(!mark){
      api._post('/custRedPackage/grabTheRedPackage',{redisKey:redisKey}).then(res=>{
        // console.log(res)
        if(res.success){
          
          this.setData({
            mark:!mark,
            isShow:false,
            isShow1:true,
            headImageUrl:image,
            name:name,
            remark:remark,
            redisKey,
            money:res.data
          },()=>{
            util._toast('领取成功')
          })
        }
      })
    }else{
     this.setData({
       isShow:false,
       isShow1:true,
       headImageUrl:image,
       name:name,
       remark:remark,
       redisKey:redisKey
     })
    }
  },

  // 获取红包列表
  selectPack(){
    api._post('/custRedPackage/queryRedPackageList').then(res=>{
      // console.log(res.data)
      this.setData({
        redPackList:res.data
      })
    })
  },

  _taskValidate(){
    if(!this.data.total || parseFloat(this.data.total)<1){
      return "红包总金额不能小于1元"
    }else if(!this.data.count){
      return "红包个数不能为零哦"
    }else if(!this.data.content){
      return "请输入留言内容"
    }
    return false
  },

  cancel(){
    wx.navigateBack()
  },

  _toGive(){
    this.setData({
      isShow:false,
      isShow1:false,
      isShow2:true
    })
  },

  submit(){
    // console.log(111)
    let count = this.data.count
    let total = this.data.total
    let content = this.data.content
    let msg = this._taskValidate()
    if(!msg){
      api._post('/custRedPackage/redEnvelopes',{
        number:count,
        amount:total,
        remark:content
      }).then(res=>{
        // console.log(res)
        if(res.success){
          api._post('/wxpay/prepayRedpage',{
            id:res.data
          }).then(res=>{
            wx.hideLoading();
            wx.requestPayment({
              timeStamp: res.timeStamp,
              nonceStr: res.nonceStr,
              package: res.package,
              signType: 'MD5',
              paySign: res.paySign,
              success: (res) => {
                util._toast("支付成功");
                // resolve();
                  wx.navigateBack()
              },
              fail: (res) => {
                // console.log(res)
                util._toast("支付失败");
                // reject();
                // if (!flag) {
                //   wx.navigateTo({
                //     // url: `../orderDetail/orderDetail?id=${orderId}`
                //     url: "../orderList/orderList"
                //   });
                // }
              }
            })
          })
          // util._toast("发放成功")
          // setTimeout(function(){
          //   wx.navigateBack()
          // },200)
        }
      })
    
    }else{
      util._toast(msg)
    }
   
  },

  close(){
    wx.navigateBack()
  },

  // 查看更多信息
  getMore(e){
    // console.log(e)
    // console.log(this.data.redisKey)
    wx.navigateTo({
      url: '../packLIst/packlist?redisKey='+this.data.redisKey,
    })
  },

  _setParams(e){
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    this.setData({
      [key]:value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(app.globalData)
    this.selectPack()
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