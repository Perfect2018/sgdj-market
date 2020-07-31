// pages/snapUpDetail/snapUpDetail.js
const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const validate = require('../../utils/validate.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 店铺是否关闭
    shopOff: false,
    // 是否抖动
    shakeOff: false,
    open: false,
    isIPhoneX: false,
    loginMould: false,
    snapUpOrder: {
      count: '1',
      name: '',
      phone: '',
      address: '',
    },
    isShow: true,
    gwcIcon: "/images/sgdj_tj.png",
    goodsDetail: {},
    goodsMoreList: [],
    pageNum: 1,
    // 分销海报变量
    showPoster: false, //是否显示海报
    distribution: {
      canvas_hb: '/images/canvas-hb.png',
      goodsImage: '',
      codeImage: '',
      avatarImage: '',
      posterImage: ''
    }
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
      // let codeUrl = app.globalData.userInfo.avatarUrl;
      Promise.all([api._download(goodsImage), api._download(avatarUrl), api._download(codeUrl)]).then(res => {
        console.log(res)
        this.setData({
          ['distribution.goodsImage']: res[0].tempFilePath,
          ['distribution.avatarImage']: res[1].tempFilePath,
          ['distribution.codeImage']: res[2].tempFilePath,
          // ['distribution.codeImage']: '/images/sh-code.jpg'
        }, () => {
          this._generatePoster().then(res => {
            console.log(res)
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

      //绘制文字
      // context.setFontSize(20);
      // context.setFillStyle('#000');
      // context.setTextAlign('left');
      // context.fillText("蔬果到家平台", 120, 1060);
      // context.stroke();

      context.draw();
      //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      setTimeout(() => {
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
      }, 200);
    });

  },
  // 支付前验证
  _toPayValidate(snapUpOrder) {
    if (!snapUpOrder.count) {
      return '请输入购买数量'
    } else {
      if (snapUpOrder.count < 1) {
        return "购买数量最小为1";
      }
      if (snapUpOrder.count > 1000) {
        return "购买上限1000";
      }
    }
    if (!snapUpOrder.name) {
      return '请输入收货人'
    } else {
      if (!validate.validChinese(snapUpOrder.name)) {
        return "请输入中文名称"
      } else {
        if (snapUpOrder.name.length > 6 || snapUpOrder.name.length < 2) {
          return '收货人格式有误'
        }
      }
    }
    if (!snapUpOrder.phone) {
      return '请输入手机号'
    } else {
      if (!validate.validPhone(snapUpOrder.phone)) {
        return '手机号格式有误'
      }
    }
    if (!snapUpOrder.address) {
      return '请输入收货地址'
    } else {
      if (snapUpOrder.address.length < 12) {
        return '收货地址不少于12个字'
      }
    }
    return false;
  },
  // 去支付
  _toPay() {
    if (app.globalData.isLogin) {
      let snapUpOrder = this.data.snapUpOrder;
      let msg = this._toPayValidate(snapUpOrder);
      if (msg) {
        util._toast(msg);
      } else {
        util._loading("加载中...");
        api._post('/order/toPayTheOrder', {
          goodId: this.data.goodsDetail.id,
          goodsCount: snapUpOrder.count,
          userName: snapUpOrder.name,
          userPhone: snapUpOrder.phone,
          userAddress: snapUpOrder.address
        }).then(res => {
          let orderId = res.data;
          api._prepay(orderId);
        })
      }
    } else {
      this.setData({
        loginMould: true
      })
      // util._toast('请登录')
    }
  },

  // 设置参数
  _setParam(e) {
    let path = 'snapUpOrder.' + e.currentTarget.dataset.param;
    this.setData({
      [path]: e.detail
    });
  },
  // 切换显示
  _setIsShow() {
    if (this.data.shopOff) {
      util._toast("该店已打烊，暂不能下单");
      return;
    }
    if (app.globalData.isLogin) {
      let isShow = this.data.isShow
      this.setData({
        isShow: !isShow
      });
    } else {
      this.setData({
        loginMould: true
      })
      // util._toast("请登录");
    }
  },
  // 更多商品
  _getGoodsMoreList() {
    let open = app.globalData.open;
    this.setData({
      open: open
    }, () => {
      if (!open) {
        if (!this.data.goodsMoreList.length) {
          let {
            snapUpData
          } = require("../../utils/simulationData.js");
          this.setData({
            goodsMoreList: snapUpData
          });
        }
      } else {
        let location = app.globalData.location || "";
        if (location != "") {
          api._post('/goods/rushToBuyGoods', {
            pageNum: this.data.pageNum,
            lat: location.lat,
            lng: location.lng
          }).then(res => {
            if (res.success && res.data.list.length > 0) {
              let goodsMoreList = this.data.goodsMoreList;
              this.setData({
                goodsMoreList: goodsMoreList.concat(res.data.list),
                pageNum: ++this.data.pageNum
              });
            } else {
              util._toast('暂无商品');
            }
          });
        }
      }
    });
  },
  // 获取商品详情
  _getGoodsDetail(goodsId) {
    api._post('/goods/searchGoodsById', {
      goodId: goodsId
    }).then(res => {
      if (res.success) {
        let temp = res.data[0];
        if (temp.note) {
          temp.note = temp.note.split('\n');
        } else {
          temp.note = []
        }
        this.setData({
          goodsDetail: temp,
          shopOff: temp.shopState === "01" ? false : true
        }, () => {
          this._getGoodsMoreList();
        });
      }
    });
  },
  // 跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `../${navigatePath}/${navigatePath}?id=${id}`
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let goodsId;
    // console.log(options.scene)
    if (options.scene) {
      app.globalData.scene = options.scene;
      api._post('/distribution/selectDistributionGoods', {
        id: options.scene
      }).then(res => {
        app.globalData.parentCustId = res.data.custId;
        this._getGoodsDetail(res.data.goodId);
        this.setData({
          loginMould: true
        });
      })
    } else {
      goodsId = options.id;
      this._getGoodsDetail(goodsId);
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
    app._login(e);
  }
})