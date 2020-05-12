// pages/withdraw/withdraw.js
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cashMoney: 0,
    pocketMoney: 0,
    money: "",
    name: ""
  },
  // 提现
  _getMoney() {
    let msg = false;
    if (!validate.validMoney(this.data.money)) {
      msg = '格式有误，请重新输入';
    } else if (this.data.money < 50) {
      msg = '提现今额不可小于50元';
    } else if (this.data.money > this.data.cashMoney) {
      msg = '可提现金额不足';
    } else if (!this.data.name) {
      msg = '请输入合法姓名';
    }
    if (!msg) {
      let money = this.data.money;
      api._post('/shopstate/merchantWithdrawals', {
        state: "03",
        name: this.data.name,
        amount: money
      }).then(res => {
        this.setData({
          name: "",
          money: "",
          cashMoney: Number(this.data.cashMoney - money).toFixed(2)
        });
        if (res.success) {
          util._toast('提现成功');
        } else {
          util._toast('提现失败');
        }
      });
    } else {
      util._toast(msg);
    }
  },
  // 获取初始化数据
  _getInitData() {
    api._post('/cust/selectCustMoney').then(res => {
      if (res.success) {
        this.setData({
          cashMoney: res.data.cashMoney,
          pocketMoney: res.data.pocketMoney
        })
      }
    });
  },
  // 设置参数
  _setParam(e) {
    let path = e.currentTarget.dataset.param;
    this.setData({
      [path]: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._getInitData();
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