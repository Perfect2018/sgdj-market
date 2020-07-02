// pages/welcome/welcome.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
let timer;
Page({
  _into: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  /**
   * 页面的初始数据
   */
  data: {
    welcomeUrl: '../../images/wel.jpg',
    counter: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api._post("/wxpay/openAppSc").then(res => {
      app.globalData.open = res;
      this._into();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    timer = setInterval(() => {
      if (!this.data.counter) {
        this._into();
        clearInterval(timer);
      } else {
        this.setData({
          counter: this.data.counter - 1
        });
      }
      // console.log(this.data.counter)
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})