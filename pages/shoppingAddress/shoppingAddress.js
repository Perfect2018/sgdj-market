// pages/shippingAddress/shippingAddress.js
const app = getApp();
const BMap = require('../../libs/bmap-wx.min.js');
const validate = require('../../utils/validate.js');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
let bmap, timer;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSuggestion: true,
    searchResult: [], //搜索列表
    isShow: true,
    editId: '',
    isReceiverAddressInput: false,
    addReceiver: {
      receiverName: '',
      receiverSex: '男',
      receiverAddress: '',
      receiverTel1: '',
      receiverProvince: '',
      receiverCity: '',
      receiverCounty: '',
      receiverTown: '',
      address: '',
      receiverLong: '',
      receiverLat: ''
    },
    addressList: []
  },
  // 删除地址
  _delAddress(e) {
    let id = e.currentTarget.dataset.id;
    api._post('/receiver/deleteReceiver', {
      receiverId: id
    }).then(res => {
      this._getAddress();
    });

  },
  // 编辑地址
  _editAddress(e) {
    this._setIsShow();
    let id = e.currentTarget.dataset.id;
    let addReceiver = this.data.addressList.filter(elem => {
      return elem.id == id ? elem : '';
    });
    addReceiver = addReceiver[0];
    addReceiver.address = `${addReceiver.receiverProvince}${addReceiver.receiverCity}${addReceiver.receiverCounty}${addReceiver.receiverTown}`;
    this.setData({
      editId: id,
      addReceiver: addReceiver
    });
  },
  // 设为默认地址
  _defaultAddress(e) {
    let id = e.currentTarget.dataset.id;
    api._post('/receiver/updateDefaultAddress', {
      receiverId: id
    }).then(res => {
      this._getAddress();
    });

  },
  // 添加地址验证
  _addAddressValidate(addReceiver) {
    if (!addReceiver.receiverName) {
      return '请输入收货人'
    } else {
      if (!validate.validChinese(addReceiver.receiverName)) {
        return "请输入中文名称"
      }
    }
    if (!addReceiver.receiverSex) {
      return '请输入性别'
    }
    if (!addReceiver.receiverTel1) {
      return '请输入手机号'
    } else {
      if (!validate.validPhone(addReceiver.receiverTel1)) {
        return '手机号格式有误'
      }
    }
    if (!addReceiver.address) {
      return '请输入收货地址'
    }
    if (!addReceiver.receiverAddress) {
      return '请输入详细地址'
    } else {
      if (addReceiver.receiverAddress.length < 6) {
        return '详细地址不少于6个字'
      }
    }
    return false;
  },
  // 添加地址
  _saveAddress() {
    let addReceiver = this.data.addReceiver;
    let msg = this._addAddressValidate(addReceiver);
    if (msg) {
      util._toast(msg);
    } else {
      let params = {
        receiverName: addReceiver.receiverName,
        receiverSex: addReceiver.receiverSex,
        receiverAddress: addReceiver.receiverAddress,
        receiverTel1: addReceiver.receiverTel1,
        receiverProvince: addReceiver.receiverProvince,
        receiverCity: addReceiver.receiverCity,
        receiverCounty: addReceiver.receiverCounty,
        receiverTown: addReceiver.receiverTown,
        receiverLong: addReceiver.receiverLong,
        receiverLat: addReceiver.receiverLat
      };
      let editId = this.data.editId;
      let url = "/receiver/insertReceiver";
      if (editId) {
        params.id = editId;
        url = "/receiver/updateReceiver"
      }
      api._post(url, params).then(res => {
        if (res.success) {
          util._toast('保存成功');
          if (this.data.type === "add") {
            wx.navigateBack();
            return;
          }
          this._setIsShow();
          this._getAddress();
          this.setData({
            editId: '',
            'addReceiver.receiverName': '',
            'addReceiver.receiverSex': '男',
            'addReceiver.receiverAddress': '',
            'addReceiver.receiverTel1': '',
            'addReceiver.receiverProvince': '',
            'addReceiver.receiverCity': '',
            'addReceiver.receiverCounty': '',
            'addReceiver.receiverTown': '',
            'addReceiver.address': '',
            'addReceiver.receiverLong': '',
            'addReceiver.receiverLat': ''
          });
        } else {
          util._toast('保存失败');
        }
      })
    }
  },
  // 查询收货地址
  _getAddress() {
    api._post('/receiver/receiverList').then(res => {
      let addressList = res.data.sort((a, b) => {
        return Number(b.isDefaultAddress) - Number(a.isDefaultAddress);
      });
      this.setData({
        addressList: addressList
      });
    });
  },

  // 选中地址
  _pitchOnAddress(e) {
    let uid = e.currentTarget.dataset.uid;
    let address = this.data.searchResult.filter(elem => {
      return elem.uid == uid ? elem : '';
    });
    address = address[0];
    this._setIsReceiverAddressInput();
    this.setData({
      isSuggestion: false,
      ['addReceiver.receiverProvince']: address.province,
      ['addReceiver.receiverCity']: address.city,
      ['addReceiver.receiverCounty']: address.district,
      ['addReceiver.receiverTown']: address.name,
      ['addReceiver.address']: `${address.province}${address.city}${address.district}${address.name}`,
      ['addReceiver.receiverLong']: address.location.lng,
      ['addReceiver.receiverLat']: address.location.lat,
      searchResult: []
    });
  },
  _setIsReceiverAddressInput() {
    let temp = this.data.isReceiverAddressInput;
    this.setData({
      isReceiverAddressInput: !temp
    });
  },
  // suggestion检索--模糊查询
  _setSearchList(e) {
    let kw = e.detail;
    if (this.data.isSuggestion) {
      this.setData({
        ['addReceiver.address']: kw,
        searchResult: [],
      });
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        bmap.suggestion({
          query: kw,
          city_limit: false,
          success: (res) => {
            this.setData({
              searchResult: res.result
            });
          }
        });
      }, 300);
    } else {
      this.setData({
        ['addReceiver.address']: this.data.addReceiver.address,
        isSuggestion: true
      });
    }
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}?id=${id}`
    });
  },

  // 设置参数
  _setParam(e) {
    let path = 'addReceiver.' + e.currentTarget.dataset.param;
    this.setData({
      [path]: e.detail
    });
  },
  // 设置性别
  _setReceiverSex(e) {
    this.setData({
      ['addReceiver.receiverSex']: e.detail
    });
  },
  // 切换显示
  _setIsShow() {
    let isShow = this.data.isShow
    this.setData({
      isShow: !isShow
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });
    if (options.type === "add") {
      this.setData({
        type: options.type
      });
      this._setIsShow();
    }
    this._getAddress();
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
    if (execute) {
      clearTimeout(execute);
    }

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