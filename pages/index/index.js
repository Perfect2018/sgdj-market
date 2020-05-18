//index.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
const BMap = require('../../libs/bmap-wx.min.js');
let bmap, locationTimer; //定时获取位置信息
Page({
  /**
   * 页面的初始数据
   */
  data: {
    open: false,
    goodsList: [],
    pageNum: 1,
    // 动画实例
    animation: {},
    loginMould: false,
    adImage: "",
    swiperImageList: [],
    classifyList: [],
    hotShopList: [{
      id: '2b0757c8be8e43a59ad6ce1b23eced82',
      imgUrl: "/images/sgdj_hot1.jpg"
    }, {
      imgUrl: "/images/sgdj_hot2.jpg"
    }],
    shopList: [],
    searchHolder: '暂未获取到位置信息'
  },
  // 小程序跳转
  _toMiniProgram() {
    wx.navigateToMiniProgram({
      appId: 'wx91553ce9bb66243e'
    });
  },
  // 切换页面
  _switchPage() {
    let open = app.globalData.open;
    this.setData({
      open: open
    }, () => {
      if (open) {
        this._getSwiperImageList();
        this._getCategoryList();
        this._getShopList();
        this._getShopId();
      } else {
        this._getGoods();
      }
    });
  },
  // 我要开店
  _openShop() {
    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../shopAdd/shopAdd'
      });
    } else {
      this.setData({
        loginMould: true
      });
    }
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    if (navigatePath == "shopList" || navigatePath == "shop") {
      if (app.globalData.location) {
        if (id) {
          wx.navigateTo({
            url: `../${navigatePath}/${navigatePath}?id=${id}`
          });
        } else {
          util._toast("请刷新重试")
        }
      } else {
        app.getLocation();
      }

    } else {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  },

  // 红包
  _toEnvelopes(e){
    // let navigatePath = e.currentTarget.dataset.navigate;
    wx.navigateTo({
      url: '../envelopes/envelopes',
    })
  },
  _toApp(e){
    let id = e.currentTarget.dataset.item;
    if(id == '5e941e4f635dce1f7c4225b8'){
      wx.navigateToMiniProgram({
        appId: 'wx91553ce9bb66243e',
        path: '',
        // envVersion: "develop",
        // fail: () => {
        //   wx.switchTab({
        //     url: '../goods/goods'
        //   });
        // }
      });
    }
  },
  // 搜索聚焦监听
  _searchFocus(e) {
    wx.navigateTo({
      url: `../searchList/searchList`
    });
  },
  // 获取批发配送店铺
  _getShopId() {
    let location = app.globalData.location || "";
    if (location != "") {
      api._post('/shopstate/getIsWholesaleShopBylatAndLng', {
        lat: location.lat,
        lng: location.lng
      }).then(res => {
        let temp = this.data.hotShopList.concat([]);
        temp[1].id = res;
        this.setData({
          hotShopList: temp
        });
      });
    }
  },

  // 获取明星店铺
  _getShopList() {
    let location = app.globalData.location || "";
    if (location != "") {
      api._post('/shopstate/getStartShopBylatitudeAndLongitude', {
        lat: location.lat,
        lng: location.lng
      }).then(res => {
        // console.log(res.data)
        if (res.data.length) {
          this.setData({
            shopList: res.data
          });
        }
      });
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      open:app.globalData.open
    })
    // 实例化百度地图API核心类
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    this._switchPage();
  
  },
  // 获取商品
  _getGoods() {
    let {
      indexData
    } = require("../../utils/simulationData.js");
    this.setData({
      goodsList: indexData
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
    if (!this.data.open) {
      this._switchPage();
    }
    if (!app.globalData.location) {
      app.getLocation().then(() => {
        this._getShopList();
        this._getShopId();
        this.getLocationRegeo();
        locationTimer = setInterval(this.getLocationRegeo, 60000);
      });
    } else {
      this.getLocationRegeo();
      locationTimer = setInterval(this.getLocationRegeo, 60000);
    }

    // 红包摆动动画
    // // 1.创建动画实例
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction:'linear'
    })

    this.data.animation = animation
    var next = true;
    // 连续动画关键步骤
    setInterval(function(){
      if(next){
        animation.translateX(4).step();
        animation.rotate(19).step();
        next = !next;
      }else{
        animation.translateX(-4).step();
        animation.rotate(-19).step();
        next = !next;
      }
      // 3.将动画export导出，把动画数据传递组件animation的属性
      this.setData({
        animation:animation.export()
      })
    }.bind(this),300)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(locationTimer); //清除定时器
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
    this._switchPage();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: "蔬果到家新零售",
      path: '/pages/welcome/welcome'
    }
  },
  // 获取所有分类
  _getCategoryList() {
    api._post('/category/selectAllCategory').then(res => {
      this.setData({
        classifyList: res.data
      });
    });
  },
  // 获取轮播图片
  _getSwiperImageList() {
    api._post('/advert/selectAdvertList').then(res => {
      let index = 0;
      let temp = [];
      res.data.forEach((elem, i) => {
        if (elem.advertType == "01") {
          this.setData({
            adImage: elem
          });
        } else {
          temp.push(elem)
        }
        this.setData({
          swiperImageList: temp
        });
      })
    });
  },
  // 取消登录
  _closeLoginMould() {
    this.setData({
      loginMould: false
    });
  },
  // 登录
  _login(e) {
    app._login(e);
  },
  // 实时获取用户位置 (逆向解析)
  getLocationRegeo(location = app.globalData.location || "") {
    wx.getLocation({
      success: (res) => {
        // console.log(res)
        location = {
          lng: res.longitude,
          lat: res.latitude
        }
        wx.setStorageSync("location", location);
        app.globalData.location = location;
        bmap.regeocoding({
          location: `${location.lat},${location.lng}`,
          success: (res) => {
            // console.log(res)
            this.setData({
              searchHolder: res.wxMarkerData[0].address
            })
          }
        });
      }
    });
  }
})