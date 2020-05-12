// pages/orderDetail/orderDetail.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    orderDetailSteps: [{
        text: '待付款'
      },
      {
        text: '待接单'
      },
      {
        text: '配送中'
      },
      
      {
        text: '已完成'
      },
      {
        text: '退款售后'
      }
    ],
    stepsAction: 0,
    orderDetail: {}
  },
    // 拨打电话
    _makePhoneCall(e) {
      let phoneNumber = e.currentTarget.dataset.phone;
      wx.makePhoneCall({
        phoneNumber
      });
    },
  // 复制
  _copy(e) {
    let value = e.currentTarget.dataset.value + '';
    wx.setClipboardData({
      data: value,
      success() {
        wx.hideToast();
        util._toast("复制成功");
      }
    });
  },
  // 跳转页面
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}?id=${id}`
    });
  },
  //去支付 
  _toPay(e) {
    util._loading("加载中...");
    let orderId = e.currentTarget.dataset.id;
    wx.setStorageSync("cancelOrderNo", this.data.orderDetail.orderNo);
    api._prepay(orderId, true);
  },
  // 取消订单
  _cancelOrder() {
    wx.showModal({
      title: '提示',
      content: '确认取消订单',
      confirmColor: '#f80',
      success: (res) => {
        if (res.confirm) {
          let orderNo = this.data.orderDetail.orderNo;
          api._post('/order/changeOrderStateByCust', {
            orderNo: orderNo,
            orderState: "03"
          }).then(res => {
            if (res.success) {
              wx.setStorageSync("cancelOrderNo", orderNo);
              util._toast("取消成功");
              wx.navigateBack();
            } else {
              util._toast("未知错误");
            }
          });
        }
      }
    });
  },
  // 确认收货
  _toTake() {
    let orderNo = this.data.orderDetail.orderNo;
    api._post('/order/changeOrderStateByCust', {
      orderNo: orderNo,
      orderState: "10"
    }).then(res => {
      if (res.success) {
        util._toast("收货成功");
        wx.redirectTo({
          url: '/pages/orderList/orderList?type=1',
        })
      } else {
        util._toast("未知错误");
      }
    });
  },
  // 获取订单详情
  _getOrderDetail(orderId = this.data.orderId) {
    api._post('/order/getOrderListDetl', {
      orderId: orderId
    }).then(res => {
      let stepsAction, data = {
        orderDetail: res.data
      };
      // console.log(res.data)
      switch (res.data.orderState) {
        case "08":
          // 待付款
          stepsAction = 0;
          break;
        case "07":
          // 已付款
          stepsAction = 1;
          break;
        case "09":
          // 配送中
          stepsAction = 2;
          break;
        case "12":
          // 待拼单
          stepsAction = 1;
          break;
        case "10":
          // 已完成
          stepsAction = 3;
          break;
        case "13":
          let temp = this.data.orderDetailSteps;
          temp.pop();
          temp.push({
            text: "已退款"
          });
          data.orderDetailSteps = temp;
          // 已退单
          stepsAction = 3;
          break;
        case "14":
          // 退款完成
          stepsAction = 3;
          break;
      }
      data.stepsAction = stepsAction;
      this.setData(data);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      orderId: options.id
    }, () => {
      this._getOrderDetail();
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