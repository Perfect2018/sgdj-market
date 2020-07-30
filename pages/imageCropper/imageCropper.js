// imageCropper.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    width: 300, //宽度
    height: 225, //高度
    export_scale: 3,
    disable_rotate: true, //是否禁用旋转
    disable_ratio: false, //锁定比例
    limit_move: false, //是否限制移动
    disable_width: false, //锁定裁剪框宽度
    disable_height: false, //锁定裁剪框高度
    baseUrl: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      baseUrl: options.baseUrl
    }, () => {
      this.cropper = this.selectComponent("#image-cropper");
      this.cropper.setCutCenter();
      this.cropper.upload(); //上传图片
    });
  },
  loadimage(e) {
    wx.hideLoading();
    this.cropper.imgReset();
  },
  clickcut(e) {
    // console.log(e.detail);
    //图片预览
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  // 取消
  noSubmit() {
    wx.setStorageSync('tempImage', false);
    wx.navigateBack({
      delta: -1
    });
  },
  // 保存
  submit() {
    this.cropper.getImg(res => {
      util._loading('保存中...');
      let img = wx.getFileSystemManager().readFileSync(res.url, 'base64');
      api._post('/shopstate/uploadImg', {
        img: img
      }).then(res => {
        if (res.success) {
          // console.log(res)
          wx.setStorageSync("tempImage", {
            baseUrl: this.data.baseUrl,
            id: res.data
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 200);
        } else {
          util._toast("上传失败");
        }

      })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})