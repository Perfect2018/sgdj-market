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
      util._loading('生成中...');
      let goodsImage = util._getImageUrl(this.data.goodsDetail.img6);
      let avatarUrl = util._getCodeUrl(`/distribution/getCustHeadimg?url=${app.globalData.userInfo.avatarUrl}`);
      let codeUrl = util._getCodeUrl(`/distribution/distributionGoods?goodsId=${this.data.goodsDetail.id}&page=pages/moneyTree/moneytree&custId=${custId}&parentCustId=${app.globalData.parentCustId}`);
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