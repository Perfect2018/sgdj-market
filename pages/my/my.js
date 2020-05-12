// pages/my/my.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    userInfo: app.globalData.userInfo,
    queryPocketMoney: '0.00',
    cashRollCount: 0,
    groupCount: 0,
    isLogin: false
  },
  // 获取基础信息
  _getInitData() {
    api._post('/cust/selectCustMoneyAndTeam').then(res => {
      if (res.success) {
        // console.log(res)
        this.setData({
          queryPocketMoney: res.data.pocketMoney,
          cashRollCount: res.data.custCashRollList,
          groupCount: res.data.distributionsTeam
        });
      }
    })
  },
  // 拨打电话
  _makePhoneCall(e) {
    let phoneNumber = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber
    });
  },

  // 页面跳转
  _toView(e) {
    if (app.globalData.isLogin) {
      let navigatePath = e.currentTarget.dataset.navigate;
      let type = e.currentTarget.dataset.type;
      // console.log(type)
      let url = `../${navigatePath}/${navigatePath}`;
      if (type) {
        url = `../${navigatePath}/${navigatePath}?type=${type}`;
      }
      wx.navigateTo({
        url: url
      });
    } else {
      util._toast('请登录');
    }
  },
  // 暂未开放
  _defaultView() {
    util._toast('暂未开放');
  },
  // 获取用户信息
  _getUserInfo(e) {
    app._login(e).then(res => {
      this.setData({
        isLogin: true,
        userInfo: e.detail.userInfo
      });
      this._getInitData();
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(app.globalData.isLogin + "-----" + app.globalData.open)
    this.setData({
      userInfo: app.globalData.userInfo,
      isLogin: app.globalData.isLogin,
      open: app.globalData.open
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
    if (app.globalData.isLogin) {
      this._getInitData();
    }
    if (!this.data.open) {
      this.setData({
        open: app.globalData.open
      });
    }
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
    return {
      title: "蔬果到家",
      path: "/pages/welcome/welcome",
      imageUrl: 'https://submarket.shuguodj.com/outByteImgById?id=5e6b59320147fd04e379ff19'
    }
  }
})