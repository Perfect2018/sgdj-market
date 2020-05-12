// pages/map/map.js
const app = getApp();
const BMap = require('../../libs/bmap-wx.min.js');
const util = require('../../utils/util.js');
let bmap;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchCon: '', //输入内容
    searchResult: [], //搜索列表
    iconPath: '/images/sgdj_location.png',
    longitude: '108.96460581408435', //经度
    latitude: '34.27722814081429', //纬度
    address: '',
    scale: 16, //地图的扩大倍数
    markers: [{ //标记点用于在地图上显示标记的位置
      id: 1,
      latitude: '',
      longitude: '',
      iconPath: '/images/sgdj_location.png',
      width: 1,
      height: 1
    }],
  },
  move(e){
    //console.log(123456,e);
    return false;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 实例化百度地图API核心类
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    //获取当前位置经纬度
    let str = 'markers[0].longitude',
      str2 = 'markers[0].latitude';
    this.setData({
      longitude: app.globalData.location.lng,
      latitude: app.globalData.location.lat,
      [str]: app.globalData.location.lng,
      [str2]: app.globalData.location.lat,
    });

  },
  // 绑定input输入 --搜索
  bindKeyInput(e) {
    let success = data => { //请求成功
      let searchResult = [];
      //搜索列表只显示10条
      if (data.result.length > 10) {
        searchResult = data.result.splice(0, 10);
      }else{
        searchResult = data.result;
      }
      this.setData({
        searchResult: searchResult
      });
    }
    // 发起suggestion检索请求 --模糊查询
    bmap.suggestion({
      query: e.detail.value,
      city_limit: false,
      success: success
    });
  },
  // 点击搜索列表某一项
  tapSearchResult(e) {
    let value = e.currentTarget.dataset.value;
    let str = 'markers[0].longitude',
      str2 = 'markers[0].latitude';
    this.setData({
      longitude: value.location.lng,
      latitude: value.location.lat,
      searchResult: [],
      searchCon: value.name,
      address: value.province + value.city + value.district + value.name,
      [str]: value.location.lng,
      [str2]: value.location.lat,
    })
  },
  // markets
  getLngLat() {
    this.mapCtx = wx.createMapContext("myMap");
    let latitude, longitude;
    this.mapCtx.getCenterLocation({
      success: (res) => {
        latitude = res.latitude;
        longitude = res.longitude;
        let str = 'markers[0].longitude',
          str2 = 'markers[0].latitude';
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          [str]: res.longitude,
          [str2]: res.latitude,
        })
        this.regeocoding(); //根据经纬度-》解析地址名称 
      }
    })

    //修改坐标位置 
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: latitude,
        longitude: longitude,
      },
      animationEnd() {
        //console.log('animation end')
      }
    })
  },
  //地图视野变化触发的事件
  regionchange(e) {
    // 地图发生变化的时候，获取中间点，也就是用户选择的位置
    if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
      this.getLngLat();
    }
  },
  markertap(e) {
    //console.log(e.markerId)
    //console.log(e);
  },
  controltap(e) {
    //console.log(e.controlId)
  },

  // 发起regeocoding逆地址解析 -- 从经纬度转换为地址信息
  regeocoding() {
    //console.log(this.data.latitude + ',' + this.data.longitude)
    bmap.regeocoding({
      location: this.data.latitude + ',' + this.data.longitude,
      success: (res) => {
        this.setData({
          address: res.wxMarkerData[0].address
        })
      },
      fail: (res) => {
        // util._modal('请开启位置服务权限并重试!')
      },

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