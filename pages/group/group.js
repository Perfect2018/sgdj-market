// pages/group/group.js
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [],
    teamIncomeAmt:0,
    teamSum:0,
    pageNum:1
  },
  // 获取初始化数据
  _getInitData(pageNum = this.data.pageNum) {
    api._post('/cust/selectDistributionTeam', {
      pageNum: pageNum
    }).then(res => {
      if (res.success && res.data.teamList.list.length) {
        pageNum += 1;
        this.setData({
          groupList: this.data.groupList.concat(res.data.teamList.list),
          teamIncomeAmt: res.data.teamIncomeAmt,
          teamSum: res.data.teamList.total,
          pageNum: pageNum
        })
      }else{
        util._toast("暂无数据");
      }
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
    this._getInitData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})