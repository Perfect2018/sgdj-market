// pages/conversion/conversion.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:'',
    list:[
      {date:'2020-07-10',percent:'+6.35%',price:2.95,total:10},
      {date:'2020-07-11',percent:'+16.35%',price:6.95,total:10},
      {date:'2020-07-12',percent:'+8.35%',price:4.95,total:10},
      {date:'2020-07-13',percent:'-2.35%',price:3.95,total:10},
      {date:'2020-07-14',percent:'-6.35%',price:3.95,total:10},
      {date:'2020-07-15',percent:'+6.35%',price:8.95,total:10},
      {date:'2020-07-16',percent:'+2.35%',price:7.95,total:10}
    ]
  },

  getNum(e){
    this.setData({
      num:e.detail.value
    })
 
  },


  commit(){
    console.log(this.data.num)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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