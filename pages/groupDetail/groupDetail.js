// pages/groupDetail/groupDetail.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsId:'',
    goodsDetail:{},
    price:'',
    type:'',
    shopId: '',
    count: 0, //购物车数量
    // 是否抖动
    shakeOff: false,
    loginMould: false,
  },

  // 获取商品详情
  _getGoodsDetail(goodsId) {
    api._post('/goods/get_goods_detail', {
      id: goodsId
    }).then(res => {
      // console.log(res)
      if (res.success) {
        let temp = res.dataDto;
        if (temp && temp.note) {
          temp.note = temp.note.split('\n');
        } else {
          temp.note = [];
        }
        this.setData({
          goodsDetail: temp,
          price:temp.couponRate,
          shopId:temp.shopId
        });
        this._getCount()
      }
    });
  },

  // 获取购物车数量
  _getCount(shopId=this.data.shopId) {
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
   // 取消登录
   _closeLoginMould() {
    this.setData({
      loginMould: false
    });
  },
  // 登录
  _login(e) {
    app._login(e).then(res => {
      this._getCount();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      goodsId:options.id,
      // shopId:options.shopId,
      type:options.type,
      count:options.count
    })
    this._getGoodsDetail(this.data.goodsId)
    // this._getCount(this.data.shopId)
    // console.log(this.data.goodsId)
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
      title:this.data.goodsDetail.goodsName + ' ' + this.data.goodsDetail.couponRate
    }
  }
})