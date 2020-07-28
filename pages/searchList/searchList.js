// pages/searchList/searchList.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    kw: '',
    pageNum: 1,
    isGlobal: "02",
    searchList: [],
    shopList: [],
    count: 0,
    shopId: '',
    // 店铺是否关闭
    shopOff: false,
    loginMould: false,
    type: '01'
  },
  // 搜索查询
  _getSearchList(kw = this.data.kw) {
    let shopId = this.data.shopId
    if (!shopId) {
      shopId = ''
    }
    // console.log(shopId)
    if (kw) {
      api._post("/goods/fuzzySearchGoods", {
        goodsName: kw,
        isGlobalGoods: this.data.isGlobal,
        pageNum: this.data.pageNum,
        shopId
      }).then(res => {
        let searchList = this.data.searchList;
        // console.log(res)
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
  searchShopList(kw = this.data.kw) {
    if (kw) {
      api._post("/shopstate/fuzzySearchShop", {
        shopName: kw
      }).then(res => {
        // console.log(res)
        if(res.success){
          if (res.data.length) {
            this.setData({
              shopList: res.data
            })
          } else {
            util._toast('暂无数据');
          }
        }else{
          util._toast("查询失败")
        }
      })
    } else {
      util._toast("请输入店铺名称")
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
    let type = this.data.type
    if (kw) {
      this._getSearchList();
    } else {
      util._toast("请输入商品名");
    }
    if(type=="00"){
      this.searchShopList()
    }
    // switch (type) {
    //   case '00':
    //     this.searchShopList()
    //     break;
    //   case '01':
    //     this._getSearchList()
    //     break;
    //   default:
    //     break;
    // }
  },

  // 添加购物车
  _addCart(e) {
    // console.log(e)
    // console.log(this.data.shopId)
    if (app.globalData.isLogin) {
      let goods = e.detail.goods;
      // console.log(goods)
      // if(goods.maxBuy && this.data.count>1){
      //     util._toast('该商品限购一份')
      // }else{
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
          if (res.error.msg) {
            util._toast(res.error.msg)
          } else {
            util._toast("添加失败");
          }

        }
      })
      // }
    } else {
      this.setData({
        loginMould: true
      });
    }
  },


  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    if (this.data.count) {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    } else {
      util._toast("请添加商品");
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    this.setData({
      type: options.type,
      shopId: options.id,
      count: options.count,
      isGlobal: options.isGlobal == '01' ? options.isGlobal : "02"
    }, () => {
      this._search();
    });
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