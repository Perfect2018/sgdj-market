// pages/cashRoll/cashRoll.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cashRollList: [],//现金券
    custCoupons:[],//优惠券
    // 过期时间
    validEndDate:'',
    // 领取时间
    validStartDate:''
  },
  // 获取现金券列表
  _getCashRollList() {
    api._post('/shopCashRoll/selectCustCashRoll').then(res => {
      // console.log(res)
      if (res.success) {
        let temp = res.data.custCashRoll.filter(elem => elem.cashRollMoney > 0);
        let temp1 = res.data.custCoupons;
        this.setData({
          cashRollList: temp,
          custCoupons:temp1,
        });
      }
    })
  },
  // 跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `../${navigatePath}/${navigatePath}?id=${id}`
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getCashRollList();
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