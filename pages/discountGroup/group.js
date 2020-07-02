// pages/discountGroup/group.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId: '',
    shop: {},
    count: 0, //购物车数量
    goodsList: [],
    groupNum:1,
    // 是否抖动
    shakeOff: false,
    loginMould: false,
  },

   // 获取店铺初始数据
   _getShop(shopId = this.data.shopId) {
    api._post('/shopstate/getShopByShopId', {
      shopId: shopId
    }).then(res => {
      if (res.success) {
        this.setData({
          shop: res.data.shopInfo,
        });
      }
    });
  },

  // 搜索
  search(e) {
    let id = e.currentTarget.dataset.id
    let count = e.currentTarget.dataset.count
    // console.log(e)
    // console.log(this.data.shopId)
    wx.navigateTo({
      url: `../searchList/searchList?id=` + id + "&count=" + count
    });
  },

  // 社区团购
  group() {
    api._post('/goods/queryNotGlobalGroupGoods',{
      shopId:this.data.shopId,
      pageNum:this.data.groupNum
    }).then(res=>{
      // console.log(res)
      if(res.data.size == '0'){
        if(res.data.pageNum == '1'){
          util._toast('该店暂无团购商品，请稍后查看')
        }else{
          util._toast('暂无数据')
        }
      }
      if(res.data.list.length){
        this.setData({
          goodsList:res.data.list,
          groupNum:++this.data.groupNum,
          // isGroup:true,
          // discountNum:1
        })
      }
    })
  },

  // 获取购物车数量
  _getCount(shopId = this.data.shopId) {
    if (app.globalData.isLogin) {
      api._post('/shoppingCart/queryCustGoodsCartCount/', {
        shopId: shopId
      }).then(res => {
        if (res.success) {
          // console.log(res.data)
          this.setData({
            count: res.data
          });
        }
      })
    }
  },

  // 添加购物车
  _addCart(e) {
    if (app.globalData.isLogin) {
      // console.log(e)
      let goods = e.currentTarget.dataset.goods;

      api._post('/shoppingCart/insertShoppingCart/', {
        id: goods.id,
        shopId: goods.shopId,
        shopName: goods.shopName,
        goodsName: goods.goodsName,
        img1: goods.img1,
        couponRate: goods.couponRate,
        noeUnit: goods.noeUnit,
        twoNuit: goods.twoNuit
      }).then(res => {
        // console.log(res)   
        if (res.success) {
          // console.log(res)
          let count = this.data.count;
          this.setData({
            count: ++count,
            shakeOff: true
          });
          setTimeout(() => {
            this.setData({
              shakeOff: false
            });
          }, 1000);
          util._toast("添加成功");
        } else {
          if(res.error.msg){
            util._toast(res.error.msg)
          }else{
            util._toast("添加失败");
          }
         
        }
      })
    } else {
      this.setData({
        loginMould: true
      });
    }
  },

  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    let shopId = this.data.shopId
    if (navigatePath == "shoppingCart") {
      if (app.globalData.isLogin) {
        if (this.data.count) {
          wx.navigateTo({
            url: `../${navigatePath}/${navigatePath}?id=${id}`
          });
        } else {
          util._toast("请添加商品");
        }
      } else {
        this.setData({
          loginMould: true
        })
        // util._toast("请登录");
      }
    } else {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}&shopId=${shopId}`
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      shopId: options.shopId,
      // shop: options.shopInfo ? JSON.parse(options.shopInfo):''
    },()=>{
      this.group()
      this._getShop()
    })
    this._getCount()
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
    this._getCount()
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
    return{
      title:' ',
      path:'/pages/discountGroup/group'+'?shopId='+this.data.shopId
    }
  }
})