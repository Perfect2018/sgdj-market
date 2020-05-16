// pages/shop/shop.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
// const share = require('../../utils/share')
let timer = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 右上角分享的图片
    // sharePicUrl:'',
    QRUrl: '',
    discountCode: "",
    // 是否抖动
    shakeOff: false,
    // 店铺是否关闭
    shopOff: false,
    loginMould: false,
    toFixed: false,
    is_set: false,
    shopId: '',
    shop: {},
    shopNoticeImgList: [],
    isGlobal: '02',
    isGlobalActive: '02',
    shopActive: 0,
    categoryActive: 0,
    goodsList: [],
    shopCategoryList: [],
    pageNum: 1,
    count: 0,
    showPhone: false,
    showTextarea: false,
    couponList: [],
    goodId:'',
    groupNum:1,
    discountNum:1,
    isDiscount:false,
    isGroup:false
  },

  // 搜索
  search(e){
    let id = e.currentTarget.dataset.id
    let count = e.currentTarget.dataset.count
    // console.log(e)
    // console.log(this.data.shopId)
    wx.navigateTo({
      url: `../searchList/searchList?id=`+ id + "&count="+count
    });
  },
  
 
  // 长按保存图片
  _saveQRImage(e) {
    let src = e.target.dataset.img; //获取img
    api._download(src).then(res => {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: res => {
          util._toast('保存成功');
        },
        fail: err => {
          util._toast('保存失败');
        }
      });
    });
  },
  // 拨打电话
  _makePhoneCall(e) {
    let phoneNumber = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber
    });
  },
  //图片预览
  _previewImage(e) {
    let src = e.target.dataset.img; //获取img
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src]
    })
  },

  // 显示手机号
  _setShowPhone() {
    this.setData({
      showPhone: true
    });
  },
  // 立即兑换
  _discountCodeConversion() {
    util._loading("加载中...");
    if (/^[0-9a-zA-Z]{13}$/.test(this.data.discountCode)) {
      api._post('/shopCashRoll/receiveCashRoll', {
        shopId: this.data.shopId,
        messageCode: this.data.discountCode
      }).then(res => {
        this.setData({
          discountCode: ''
        });
        util._toast(res.error.msg);
      })
    } else {
      util._toast("格式不正确");
    }

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
      let goods = e.detail.goods;
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
          console.log(res)
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

  // 限价抢购
  discount(){
    api._post('/goods/queryNotGlobalRobGoods',{
      shopId:this.data.shopId,
      pageNum:this.data.discountNum
    }).then(res=>{
      if(res.data.size == '0'){
        if(res.data.pageNum == '1'){
          util._toast('该店暂无抢购商品，请稍后查看')
        }else{
          util._toast('暂无数据')
        }
      }
      if(res.data.list.length){
        this.setData({
          goodsList:res.data.list,
          discountNum:++this.data.discountNum,
          isDiscount:true,
          groupNum:1
        })
      }
    })
  },

  // 社区团购
  group(){
    api._post('/goods/queryNotGlobalGroupGoods',{
      shopId:this.data.shopId,
      pageNum:this.data.groupNum
    }).then(res=>{

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
          isGroup:true,
          discountNum:1
        })
      }
    })
  },

  // 领取优惠券
  _receiveCoupon(e) {
    if (app.globalData.isLogin) {
      api._post("/coupon/custReceiveCoupon", {
        couponId: e.currentTarget.dataset.id
      }).then(res => {
        // console.log(res)
        util._toast(res.error.msg);
      });
    } else {
      this.setData({
        loginMould: true
      });
    }
  },

  // 店铺功能
  _shopActiveChange(e) {
    // console.log(e)
    if (e.detail.title == '商家信息') {
      this.setData({
        showTextarea: true
      });
      // timer = setTimeout(() => {
        
      // }, 100)
    }else if(e.detail.title === '全球臻选'){
      this.setData({
        isGlobalActive:'01',
        pageNum: 1,
        goodsList: [],
      },() => {
        this._getGoodsList();
      })
    }else if(e.detail.title === '即时送'){
      this.setData({
        isGlobalActive:'02',
        pageNum: 1,
        goodsList: [],
      },() => {
        this._getGoodsList();
      })
    }
    this.setData({
      shopActive: e.detail.index
    }, () => {
      clearTimeout(timer);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    let shopId;
    if (options.scene) {
      api._post("/wxpay/openAppSc").then(res => {
        app.globalData.open = res;
        shopId = options.scene
        this.setData({
          shopId: shopId
        }, () => {
          this._getShop();
          this._getCount();
        });
      });
    } else {
      shopId = options.id;
      this.setData({
        shopId: shopId
      }, () => {
        this._getShop();
        this._getCount();
      });
    }
  },
  // 生成店铺二维码
  _getShopQR() {
    // 加载图片
    let codeImage = util._getCodeUrl(`/smallProgramCode?page=pages/shop/shop&param=${this.data.shopId}`);
    let shopLogo = util._getImageUrl(this.data.shop.shopLogo);
    Promise.all([api._download(codeImage), api._download(shopLogo)]).then(res => {
      codeImage = res[0].tempFilePath;
      shopLogo = res[1].tempFilePath;
      let context = wx.createCanvasContext('QRCanvas');
      context.setFillStyle("#fff");
      context.fillRect(0, 0, 800, 800);

      //绘制二维码
      context.drawImage(codeImage, 0, 0, 800, 800);
      context.save(); // 保存当前context的状态

      //绘制店铺logo
      context.arc(400, 400, 180, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(shopLogo, 200, 200, 400, 400);
      context.save(); // 保存当前context的状态

      context.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'QRCanvas',
          success: res => {
            this.setData({
              QRUrl: res.tempFilePath
            });
          },
          fail: err => {
            util._toast('生成失败，请重试...');
          }
        });
      });
    });
  },
  // 获取店铺初始数据
  _getShop(shopId = this.data.shopId) {
    api._post('/shopstate/getShopByShopId', {
      shopId: shopId
    }).then(res => {
      if (res.success) {
        // console.log(res.data)
        let categoryList = res.data.shopCategory.sort((a, b) => {
          return a.categorySort - b.categorySort
        });
        categoryList.unshift({
          id: "88",
          name: "热销"
        });
        if(res.data.isGlobal==='03'){
          this.setData({
            shopActive:2
          })
        }
        this.setData({
          couponList: res.data.shopCoupons || [],
          shopOff: res.data.shopInfo.shopState === '01' ? false : true,
          pageNum: ++this.data.pageNum,
          shop: res.data.shopInfo,
          shopNoticeImgList: res.data.shopInfo.shopNoticeImgId ? res.data.shopInfo.shopNoticeImgId.split(",") : [],
          shopCategoryList: categoryList,
          categoryActive: categoryList[0].id,
          goodsList: res.data.hotGoods,
          isGlobal: res.data.isGlobal || "02",
          isGlobalActive: res.data.isGlobal == "01" ? "01" : "02"
        }, () => {
          // 生成店铺二维码
          this._getShopQR();
        });
      }
    });
  },
  // 选中分类
  _setCategoryActive(e) {
    let id = e.currentTarget.dataset.id;
    if (id != this.data.categoryActive) {
      this.setData({
        categoryActive: id,
        goodsList: [],
        pageNum: 1
      }, () => {
        this._getGoodsList();
      });
    }
  },
  // 获取商品
  _getGoodsList() {
    api._post('/goods/selectGoodsByShopId', {
      shopId: this.data.shop.id,
      categoryId: this.data.categoryActive,
      isGlobal: this.data.isGlobalActive,
      pageNum: this.data.pageNum
    }).then(res => {
      let goodsList = this.data.goodsList;
      // console.log(res.data)
      if (res.data.list.length) {
        this.setData({
          goodsList: goodsList.concat(res.data.list),
          pageNum: ++this.data.pageNum
        });
      } else {
        util._toast('暂无数据');
      }
    })
  },


  // 选中即时送或全球臻选
  _setIsGlobalActive(e) {
    let global = e.currentTarget.dataset.global;
    // console.log(global)
    if (global != this.data.isGlobalActive) {
      this.setData({
        isGlobalActive: global,
        pageNum: 1,
        goodsList: [],
      }, () => {
        this._getGoodsList();
      });
    }
  },

  //滚动监听
  onPageScroll: function (e) {
    if (e.scrollTop > 180) {
      if (!this.data.is_set) {
        this.setData({
          toFixed: true,
          is_set: true
        });
      }
    }
    if (e.scrollTop > 100 && e.scrollTop < 180) {
      this.setData({
        toFixed: false,
        is_set: false
      })
    }
  },
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
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
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  },
  // 获取兑换码
  _discountCodeChange(e) {
    this.setData({
      discountCode: e.detail.value
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
    this._getCount();
    // console.log(this.data.isGlobal)
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
    this._getGoodsList();
    if(this.data.isDiscount && this.data.discountNum>1){
      this.discount();
    }
    if(this.data.isGroup && this.data.groupNum>1){
      this.group();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
 
    return {
      title: this.data.shop.shopName,
      // imageUrl:this.data.sharePicUrl
      imageUrl:util._getImageUrl(this.data.shop.shopLogo),
      desc:'此店性价比超高，赶快去看看'
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
  }
})