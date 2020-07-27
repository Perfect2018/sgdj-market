// pages/conversion/conversion.js
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:'',
    No:"",
    total:"",
    contrbution:"",
    list:[]
  },

  getNum(e){
    this.setData({
      num:e.detail.value
    })
 
  },


  commit(){
    if(this.data.num>this.data.total){
      util._toast('兑换数量不能大于现有金币数')
      return;
    }else if(this.data.total<1){
      util._toast('金币数量不足，无法兑换')
      return;
    }
    if(this.data.num%10!=0){
      util._toast("兑换数量必须为10的倍数")
      return;
    }
    // if(parseInt(this.data.num)!=this.data.num){
    //   util._toast("兑换个数必须是整数");
    //   return;
    // };
    api._post("/cashCow/cashCowRecive",{
      number:this.data.num
    }).then(res=>{
      if(res.success){
        util._toast('兑换成功,请查看余额')
        this.setData({
          total:res.data
        })
      }
      // console.log(res)
    })
  },

  getData(){
    api._get('/cashCow/cashCowChange').then(res=>{
      if(res.success){
        this.setData({
          No:res.data.custCow.numbers,
          total:res.data.custCow.totalAmt,
          contrbution:res.data.custCow.contributionAmt,
          list:res.data.changeCow
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
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