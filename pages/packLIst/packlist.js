// pages/packLIst/packlist.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redisKey:'',
    list:'',
    number:'',
    sumMoney:'',
    surplus:'',
  },

  getList(){
    api._post('/custRedPackage/queryNumberOfRedEnvelope',{redisKey:this.data.redisKey}).then(res=>{
      if(res.success){
        // console.log(res.data)
        this.setData({
          list:res.data,
          number:res.temporaryData.number,
          sumMoney:res.temporaryData.sumMoney,
          surplus:res.temporaryData.number - res.data.length
        })
      }
    })
  },

  back(){
    wx.navigateBack({
      delta:2
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      redisKey:options.redisKey
    })
    this.getList()
    // console.log(options)
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