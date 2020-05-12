// pages/orderRefund/orderRefund.js
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: "",
    amt: "",
    reason: "",
    orderDetail: null
  },
  // 设置参数
  _setParam(e) {
    let path = e.currentTarget.dataset.param;
    this.setData({
      [path]: e.detail
    });
  },
  // 验证数据
  _validata() {
    let {
      orderId,
      amt,
      reason,
      orderDetail
    } = this.data;
    if (!orderId) {
      return "该订单不存在";
    } else if (!amt) {
      return "请输入退款金额";
    } else {
      if (!validate.validMoney(amt)) {
        return "金额格式有误";
      } else if (amt > orderDetail.finalAmt) {
        return `最多退${orderDetail.finalAmt}元`;
      }
    }
    if (!reason) {
      return "请输入退款原因";
    }
    return false;
  },
  // 提交退款
  _confirm() {
    let msg = this._validata();
    if (!msg) {
      let {
        orderId,
        amt,
        reason
      } = this.data;
      api._post("/order/userOrderRefund", {
        orderId: orderId,
        refundAmt: amt,
        refundReason: reason
      }).then(res => {
        util._toast("申请成功");
        this.setData({
          ["orderDetail.orderState"]: "14"
        });
      });
    } else {
      util._toast(msg);
    }
  },
  // 取消退款
  _cancel() {
    api._post("/order/userOrderRefundCancel", {
      orderId: this.data.orderId
    }).then(res => {
      if (res.success) {
        util._toast("取消成功");
        this._getOrderDetail();
      }
    });
  },
  // 获取订单详情
  _getOrderDetail(orderId = this.data.orderId) {
    api._post('/order/getOrderListDetl', {
      orderId: orderId
    }).then(res => {
      let data = {
        orderDetail: res.data
      };
      if (res.data.refund) {
        data["amt"] = res.data.refund.orderAmt;
        data["reason"] = res.data.refund.refundReason;
      }
      this.setData(data);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderId = options.id || false;
    if (orderId) {
      this.setData({
        orderId
      });
      this._getOrderDetail(orderId);
    }
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