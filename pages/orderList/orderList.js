// pages/orderList/orderList.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({
  staticData: {
    pageNum: 1
  },
  /**
   * 页面的初始数据
   */
  data: {
    orderStateList: [{
        active: 0,
        state: "08"
      },
      // 待付款
      
      // 待接单
      {
        active: 1,
        state: "07"
      },
      // 配送中
      {
        active: 2,
        state: "09"
      },
      // 已完成
      {
        active: 3,
        state: "10"
      },
      // 已退款
      {
        active: 4,
        state: "13"
      },
      
    ],
    orderActive: 0,
    orderList: []
  },
  // 状态改变
  _orderActiveChange(e) {
    this.staticData.pageNum = 1;
    this.setData({
      orderList: [],
      orderActive: e.detail.index
    }, () => {
      this._getOrderList();
    })
  },
  // 获取订单列表
  _getOrderList(pageNum = this.staticData.pageNum) {
    let orderActive = this.data.orderActive;
    let orderState;
    this.data.orderStateList.forEach(elem => {
      if (orderActive == elem.active) {
        orderState = elem.state
      }
    });
    console.log(orderState)
    api._post('/order/getOrderList', {
      orderState: orderState,
      pageNum: pageNum
    }).then(res => {
      if (res.success && res.data.list.length) {
        let orderList = this.data.orderList;
        this.staticData.pageNum += 1;
        this.setData({
          orderList: orderList.concat(res.data.list)
        });
      } else {
        util._toast('没有更多数据了')
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.staticData.pageNum = 1;
    this.setData({
      orderActive: options.type || 0,
    }, () => {
      this._getOrderList();
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
    // 检测是否有订单被取消
    let cancelOrderNo = wx.getStorageSync("cancelOrderNo") || false;
    if (cancelOrderNo) {
      wx.setStorageSync("cancelOrderNo", false);
      let temp = this.data.orderList.filter(elem => elem.orderNo != cancelOrderNo);
      this.setData({
        orderList: temp
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
    this._getOrderList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})