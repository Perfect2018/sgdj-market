// pages/moneyTree/moneytree.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    total:'',
    contribution:'',
    list:[],
    show:false,
    isShow:false,
    custID:"",
    loginMould: false,
    // 分销海报变量
    showPoster: false, //是否显示海报
    distribution: {
      canvas_hb: '/images/share.jpg',
      goodsImage: '',
      codeImage: '',
      avatarImage: '',
      posterImage: '',
      nickname:""
    },
  },

  rule(){
    this.setData({
      isShow:!this.data.isShow
    })
  },

  click(e){ 
    let cowId = e.currentTarget.dataset.id;
    // let num = e.currentTarget.dataset.num;
    let index = e.currentTarget.dataset.index;
    api._post('/cashCow/reciveCustCow',{
      cowId
    }).then(res=>{
      // console.log(res)
      if(res.success){
        this.data.list.splice(index,1)
        this.setData({
          list:this.data.list,
          total:res.data
        })
      }else{
        util._toast('请稍后重试')
      }
    })
    
  },

  // 获取页面数据
  getData(){
    api._get('/cashCow/selectCustCashCowTime').then(res=>{
      if(res.success){
        this.setData({
          total:res.data.custCow.totalAmt,
          contribution:res.data.custCow.contributionAmt,
          list:res.data.custCowTime,
          isVip:res.data.custCow.isVip
        })
      }else{
        util._toast("请稍后重试")
      }
    })
  },

  // 提升贡献值
  contribution(){
    this.setData({
      show:true
    })
  },
    
  goIndex(){
    wx.switchTab({
      url: '../index/index',
    })
  },

  onClose(){
    // console.log("000")
    this.setData({
      show:false
    })
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

  // 邀请好友
  invite(){
    // 判断是否已经生成海报
    if (this.data.distribution.posterImage) {
      this._setShowPoster();
      return;
    }
    let custId = api.getCustID();
    // 判断登录
    if (app.globalData.isLogin && custId) {
      let nickname = app.globalData.userInfo.nickName
      // this.setData({
      //   nickname:app.globalData.userInfo.nickName
      // })
      console.log(app.globalData)
      util._loading('生成中...');
      // let goodsImage = util._getImageUrl(this.data.goodsDetail.img6);
      let avatarUrl = util._getCodeUrl(`/cashCow/getCustHeadimg?custId=${custId}`);
      let codeUrl = util._getCodeUrl(`/cashCow/shareCashCowQRcode?page=pages/moneyTree/moneytree&custId=${custId}`);
      // let codeUrl = app.globalData.userInfo.avatarUrl;
      Promise.all([api._download(avatarUrl), api._download(codeUrl)]).then(res => {
        console.log(res)
        this.setData({
          // ['distribution.goodsImage']: res[0].tempFilePath,
          ['distribution.avatarImage']: res[0].tempFilePath,
          ['distribution.codeImage']: res[1].tempFilePath,
          ['distribution.nickname']:nickname
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

  _generatePoster() {
    return new Promise((resolve, reject) => {
      let {
        canvas_hb,
        nickname,
        codeImage,
        avatarImage
      } = this.data.distribution;
      let context = wx.createCanvasContext('QRCanvas');
      // const pattern = context.createPattern(canvas_hb, 'no-repeat')
      // context.fillStyle = pattern
      // context.setFillStyle("#fff");
      context.fillRect(0, 0, 640, 1160);

      //绘制商品图片
      // context.drawImage(goodsImage, 0, 0, 640, 1040);
      // context.save(); // 保存当前context的状态

      //绘制描述图
      context.drawImage(canvas_hb, 0, 0, 640, 1160);
      context.save(); // 保存当前context的状态

      //绘制二维码
      context.drawImage(codeImage, 40, 780, 120, 120);
      context.save(); // 保存当前context的状态

      //绘制头像
      context.arc(100, 840, 30, 0, 2 * Math.PI); //画出圆
      context.fill();
      context.clip(); //裁剪上面的圆形
      context.drawImage(avatarImage, 70, 810, 60, 60);
      context.save(); // 保存当前context的状态

      //绘制文字
      context.setFontSize(20);
      context.setFillStyle('#fff');
      context.setTextAlign('left');
      context.fillText("nickname", 160, 760);
      context.stroke();

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

  // 一键领取
  get(){
    if(this.data.isVip=="NO"){
      wx.showModal({
        content:"支付1元可使用该功能",
        confirmText:"去支付",
        success(res){
          if(res.confirm){
            api._get("/cashCow/applyVip").then(res=>{
              if(res){
                api._prepay(res)
              }
            })
            // api._prepay();
          }else if(res.cancel){
            util._toast('取消')
          }
        }
      })
    }else{
      api._get('/cashCow/receiverAllCashCow').then(res=>{
        if(res.success){
          // this.getData()
          this.setData({
            total:res.data
          })
          util._toast("领取成功")
        }else{
          util._toast('请稍后重试')
        }
      })
    }
    
  },

  // 兑换商店
  conversion(){
    wx.navigateTo({
      url: '../conversion/conversion',
    })
  },

  share(custID = this.data.custID){
    api._post("/cashCow/share",{
      shareCustId:custID
    }).then(res=>{
       console.log(res)
      //  util._toast(this.data.custID)
    })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.getData()
    console.log(app.globalData.isLogin)
    if(app.globalData.isLogin){
      this.setData({
        custID:options.custID
      })
      // util._toast(this.data.custID)
      // this.share(this.data.custID)
      this.getData()
    }else{
      this.setData({
        loginMould:true
      })
    }
  },

   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return{
      title:"蔬果到家",
      path:"/pages/moneyTree/moneytree"
    }
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
    // this.getData()
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

  }
})