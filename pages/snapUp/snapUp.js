// pages/snapUp/snapUp.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    goodsList: [],
    pageNum: 1
  },
  // 获取商品
  _getGoodsList(pageNum = this.data.pageNum) {
    let open = app.globalData.open;
    this.setData({
      open: open
    }, () => {
      if (!open) {
        if (!this.data.goodsList.length) {
          let {
            snapUpData
          } = require("../../utils/simulationData.js");
          this.setData({
            goodsList: snapUpData
          });
        }
      } else {
        let location = app.globalData.location || "";
        if (location != "") {
          api._post('/goods/rushToBuyGoods', {
            pageNum: pageNum,
            lat: location.lat,
            lng: location.lng
          }).then(res => {
            if (res.success && res.data.list.length > 0) {
              let goodsList = this.data.goodsList;
              goodsList = goodsList.concat(res.data.list);
              this.setData({
                goodsList: goodsList,
                pageNum: pageNum += 1
              })
            } else {
              util._toast("暂无数据");
            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this._getGoodsList();
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
    if (!app.globalData.location) {
      app.getLocation().then(() => {
        this.setData({
          pageNum: 1
        }, () => {
          this._getGoodsList();
        });
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
    this.setData({
      pageNum: 1
    }, () => {
      this._getGoodsList();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._getGoodsList();
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