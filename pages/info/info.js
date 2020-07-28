// pages/info/info.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search:"",
    list:[],
    types:'01',
  },

  getInfo(){
    api._get('').then(res=>{
      if(res.success){

      }else{
        util._toast("请稍后重试")
      }
    })
  },

  getParams(e){
    this.setData({
      search:e.detail
    })
  },

  // 搜索
  search(e){
    api._post("",{
      kw:this.data.search
    }).then(res=>{
      if(res.success){

      }
    })
  },

  // 选择类型
  choose(e){
    this.setData({
      types:e.currentTarget.dataset.type
    })
  },

  toView(e){
    let navigate = e.currentTarget.dataset.navigate
    let id = e.currentTarget.dataset.id
    if(navigate=='infoDetail'){
      wx.navigateTo({
        url: `../${navigate}/${navigate}?id=${id}`,
      })
    }else{
      wx.navigateTo({
        url: `../${navigate}/${navigate}`,
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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