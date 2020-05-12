// pages/searchList/searchList.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kw: '',
    pageNum: 1,
    isGlobal: "02",
    searchList: []
  },
  // 搜索查询
  _getSearchList(kw = this.data.kw) {
    if (kw) {
      api._post("/goods/fuzzySearchGoods", {
        goodsName: kw,
        isGlobalGoods: this.data.isGlobal,
        pageNum: this.data.pageNum
      }).then(res => {
        let searchList = this.data.searchList;
        console.log(res)
        if (res.data.list.length) {
          this.setData({
            searchList: searchList.concat(res.data.list),
            pageNum: ++this.data.pageNum
          });
        } else {
          util._toast('暂无数据');
        }
      });
    } else {
      util._toast("请输入商品名");
    }

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
      this._getSearchList();
    } else {
      util._toast("请输入商品名");
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      isGlobal: options.isGlobal == '01' ? options.isGlobal : "02"
    }, () => {
      this._getSearchList();
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