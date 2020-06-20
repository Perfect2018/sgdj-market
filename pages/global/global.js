// pages/global/global.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    kw: '',
    goodsList: [],
    pageNum: 1
  },
  // 搜索监听
  _searchChange(e) {
    this.setData({
      kw: e.detail
    });
  },
  // 搜索
  _search() {
    let kw = this.data.kw;
    if (kw) {
      this.setData({
        kw: ''
      });
      wx.navigateTo({
        url: `../searchList/searchList?kw=${kw}&isGlobal=01`
      });
    } else {
      util._toast("请输入商品名");
    }
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
            globalData
          } = require("../../utils/simulationData.js");
          this.setData({
            goodsList: globalData
          });
        }
      } else {
        api._post('/goods/getGlobalGoodsList', {
          pageNum: pageNum
        }).then(res => {
          // console.log(res)
          if (res.success && res.data.list.length > 0) {
            let goodsList = this.data.goodsList;
            goodsList = goodsList.concat(res.data.list)
            this.setData({
              goodsList: goodsList,
              pageNum: ++pageNum
            })
          } else {
            util._toast("暂无数据");
          }
        });
      }
    });
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