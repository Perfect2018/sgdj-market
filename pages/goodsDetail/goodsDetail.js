// pages/goodsDetail/goodsDetail.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
  // 静态数据
  staticData: {
    pageNum: 1
  },
  /**
   * 页面的初始数据
   */
  data: {
    // 是否抖动
    shakeOff: false,
    open: false,
    // 店铺是否关闭
    shopOff: false,
    // 登录弹窗
    loginMould: false,
    // 是否为iPhoneX
    isIPhoneX: false,
    // 拼单展示
    fightFlag: false,
    gwcIcon: "/images/sgdj_tj.png",
    goodsDetail: {},
    goodsMoreList: [],
    count: 0,
    // 商品二维码
    QRUrl: "",
    // 分销海报变量
    showPoster: false, //是否显示海报
    distribution: {
      canvas_hb: '/images/canvas-hb.png',
      goodsImage: '',
      codeImage: '',
      avatarImage: '',
      posterImage: ''
    },
    fightList: [],
  },
  // 设置拼单
  _setFightFlag() {
    let fightFlag = this.data.fightFlag;
    this.setData({
      fightFlag: !fightFlag
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
  // 生成商品二维码
  _getGoodsQR() {
    // 加载图片
    let codeImage = util._getCodeUrl(`/smallProgramCode?page=pages/goodsDetail/goodsDetail&param=${this.data.goodsDetail.id}`);
    let goodsImg = util._getImageUrl(this.data.goodsDetail.img1);
    Promise.all([api._download(codeImage), api._download(goodsImg)]).then(res => {
      codeImage = res[0].tempFilePath;
      goodsImg = res[1].tempFilePath;
      let context = wx.createCanvasContext('QRCanvasGoods');
      context.setFillStyle("#fff");
      context.fillRect(0, 0, 800, 800);

      //绘制二维码
      context.drawImage(codeImage, 0, 0, 800, 800);
      context.save(); // 保存当前context的状态

      //绘制店铺logo
      context.arc(400, 400, 180, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(goodsImg, 200, 200, 400, 400);
      context.save(); // 保存当前context的状态

      context.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'QRCanvasGoods',
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
  // 长按保存图片
  _savePosterImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.distribution.posterImage,
      success: res => {
        util._toast('保存成功');
      },
      fail: err => {
        util._toast('保存失败');
      }
    })
  },
  // 显示隐藏海报
  _setShowPoster(showPoster = this.data.showPoster) {
    this.setData({
      showPoster: !showPoster
    });
  },
  // 去分销
  _toDistribution() {
    // 判断是否已经生成海报
    if (this.data.distribution.posterImage) {
      this._setShowPoster();
      return;
    }
    let custId = api.getCustID();
    // 判断登录
    if (app.globalData.isLogin && custId) {
      util._loading('生成中...');
      let goodsImage = util._getImageUrl(this.data.goodsDetail.img6);
      let avatarUrl = util._getCodeUrl(`/distribution/getCustHeadimg?url=${app.globalData.userInfo.avatarUrl}`);
      let codeUrl = util._getCodeUrl(`/distribution/distributionGoods?goodsId=${this.data.goodsDetail.id}&page=pages/snapUpDetail/snapUpDetail&custId=${custId}&parentCustId=${app.globalData.parentCustId}`);
      Promise.all([api._download(goodsImage), api._download(avatarUrl), api._download(codeUrl)]).then(res => {
        this.setData({
          ['distribution.goodsImage']: res[0].tempFilePath,
          ['distribution.avatarImage']: res[1].tempFilePath,
          ['distribution.codeImage']: res[2].tempFilePath
        }, () => {
          this._generatePoster().then(res => {
            this.setData({
              ['distribution.posterImage']: res,
              showPoster: true
            });
          });
        });
      }).catch(err => {
        wx.hideLoading();
        util._toast('生成失败，请重试...');
      });

    } else {
      this.setData({
        loginMould: true
      });
    }
  },
  //生成海报
  _generatePoster() {
    return new Promise((resolve, reject) => {
      let {
        canvas_hb,
        goodsImage,
        codeImage,
        avatarImage
      } = this.data.distribution;
      let context = wx.createCanvasContext('QRCanvas');
      context.setFillStyle("#fff");
      context.fillRect(0, 0, 640, 1160);

      //绘制商品图片
      context.drawImage(goodsImage, 0, 0, 640, 1040);
      context.save(); // 保存当前context的状态

      //绘制描述图
      context.drawImage(canvas_hb, 120, 1050, 520, 100);
      context.save(); // 保存当前context的状态

      //绘制二维码
      context.drawImage(codeImage, 0, 1040, 120, 120);
      context.save(); // 保存当前context的状态

      //绘制头像
      context.arc(60, 1100, 30, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(avatarImage, 30, 1070, 60, 60);
      context.save(); // 保存当前context的状态

      context.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'QRCanvas',
          success: res => {
            wx.hideLoading();
            resolve(res.tempFilePath);
          },
          fail: err => {
            reject();
          }
        });
      });
    });
  },

  // 获取购物车数量
  _getCount(shopId = this.data.goodsDetail.shopId) {
    if (app.globalData.isLogin) {
      api._post('/shoppingCart/queryCustGoodsCartCount/', {
        shopId: shopId
      }).then(res => {
        if (res.success) {
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
      let id = e.currentTarget.dataset.id;
      let goods = this.data.goodsDetail;
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
        if (res.success) {
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
          util._toast("添加失败");
        }
      })
    } else {
      this.setData({
        loginMould: true
      });
      // util._toast('请登录')
    }
  },

  // 添加购物车
  // _addCart(e) {
  //   console.log(e)
  //   if (app.globalData.isLogin) {
  //     let goods = e.detail.goods;
  //     api._post('/shoppingCart/insertShoppingCart/', {
  //       id: goods.id,
  //       shopId: goods.shopId,
  //       shopName: goods.shopName,
  //       goodsName: goods.goodsName,
  //       img1: goods.img1,
  //       couponRate: goods.couponRate,
  //       noeUnit: goods.noeUnit,
  //       twoNuit: goods.twoNuit
  //     }).then(res => {
  //       // console.log(res)   
  //       if (res.success) {
  //         console.log(res)
  //         let count = this.data.count;
  //         this.setData({
  //           count: ++count,
  //           shakeOff: true
  //         });
  //         setTimeout(() => {
  //           this.setData({
  //             shakeOff: false
  //           });
  //         }, 1000);
  //         util._toast("添加成功");
  //       } else {
  //         if(res.error.msg){
  //           util._toast(res.error.msg)
  //         }else{
  //           util._toast("添加失败");
  //         }
         
  //       }
  //     }) 
  //   } else {
  //     this.setData({
  //       loginMould: true
  //     });
  //   }
  // },
  // 更多商品
  _getGoodsMoreList() {
    let open = app.globalData.open;
    this.setData({
      open: open
    }, () => {
      if (!open) {
        if (!this.data.goodsMoreList.length) {
          let {
            indexData
          } = require("../../utils/simulationData.js");
          this.setData({
            goodsMoreList: indexData
          });
        }
      } else {
        let location = app.globalData.location || "";
        // console.log(this.data.goodsDetail.shopId)
        if (location != "") {
          api._post('/goods/selectShopGoods', {
            shopId: this.data.goodsDetail.shopId,
            pageNum: this.staticData.pageNum
          }).then(res => {
            // console.log(res)
            if (res.success && res.data.list.length > 0) {
              let goodsMoreList = this.data.goodsMoreList;
              ++this.staticData.pageNum
              this.setData({
                goodsMoreList: goodsMoreList.concat(res.data.list),
              });
            } else {
              util._toast('暂无商品');
            }
          });
        }
      }
    })

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
          shopOff: temp.shop.shopState === "01" ? false : true
        }, () => {
          this._getFightList();
          this._getGoodsMoreList();
          this._getCount();
          this._getGoodsQR();
        });
      }
    });
  },
  // 跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;

    if (navigatePath === "shoppingCart" || navigatePath === "fightGoodsPay") {
      if (app.globalData.isLogin) {
        if (this.data.count || navigatePath === "fightGoodsPay") {
          if (!app.globalData.open) {
            wx.navigateTo({
              url: `../${navigatePath}/${navigatePath}?id=${id}&openGid=${e.currentTarget.dataset.gid}&openNum=${this.data.count}`
            });
          } else {
            wx.navigateTo({
              url: `../${navigatePath}/${navigatePath}?id=${id}`
            });
          }
        } else {
          util._toast("请添加商品");
        }
      } else {
        this.setData({
          loginMould: true
        });
        // util._toast("请登录");
      }
    } else {
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  },
  // 获取拼单列表
  _getFightList() {
    let goodsDetail = this.data.goodsDetail;
    if (goodsDetail.goodsTypes === "02" && goodsDetail.groupPrice) {
      api._post("/groupGoods/selectGroupGoodsCustList", {
        goodsId: goodsDetail.id
      }).then(res => {
        this.setData({
          fightList: res.data
        });
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let goodsId = options.id || options.scene;
    if (options.scene) {
      this.setData({
        loginMould: true
      });
    }
    if (app.globalData.open) {
      this._getGoodsDetail(goodsId);
    } else {
      api._post("/wxpay/openAppSc").then(res => {
        app.globalData.open = res;
        this._getGoodsDetail(goodsId);
      });
    }

    // 检测iPhoneX
    util._isIPhoneX().then(res => {
      this.setData({
        isIPhoneX: res.isIPhoneX
      });
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
  onShow: function(options) {
    this.setData({
      open: app.globalData.open
    });
    this._getCount();
    this.data.goodsDetail && this._getFightList();
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
    this._getGoodsMoreList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.goodsDetail.goodsName
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
    app._login(e).then(() => {
      this._getCount();
    });
  }
})