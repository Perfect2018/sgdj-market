// pages/shopList/shopList.js
const app = getApp();
const api = require('../../utils/api.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    adImage: '5d7f5315635dce1af9610d83',
    shopList: []
  },
  // 获取店铺列表
  _getShopList(categoryId) {
    let location = app.globalData.location;
    api._post('/category/getCategoryShopBylatitudeAndLongitude', {
      lat: location.lat,
      lng: location.lng,
      categoryId: categoryId,
    }).then(res => {
      // console.log(res.data)
      if (res.success) {
        let shopList = this.data.shopList.concat(res.data);
        this.setData({
          shopList: shopList
        });
      }
    })
  },

  dispatching(){
    let location = app.globalData.location
    api._post('/shopstate/getIsWholesaleShopBylatAndLng', {
      lat: location.lat,
      lng: location.lng,
    }).then(res => {
      // console.log(res.data)
      if (res.success) {
        let shopList = this.data.shopList.concat(res.data);
        this.setData({
          shopList: shopList
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(typeof(options.id))
    
    let categoryId = options.id;
    if(categoryId){
      this._getShopList(categoryId);
    }else{
      this.dispatching()
    }
    
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