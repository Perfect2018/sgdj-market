// pages/shopAdd/shopAdd.js
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
    loginMould: false,
    isSuggestion: true, //判断是否为选中地址
    isConsent: false, //入驻合同
    searchResult: [], //搜索列表
    isShow: true,
    isLook: false,
    shopArray: ['小型终端店', '品牌/连锁/中型店', '供应/批发/生产商'],
    isStarShop: '', //小型
    isBrandShop: '', //品牌
    isWholesaleShop: '', //批发
    index: '',
    shopForm: {
      // shopName: '1213456',
      // operateName: '都是发鬼地方个',
      // phone: '18329776240',
      // phoneBack: '18329776240',
      // shopStreet: '陕西省西安市雁塔区双桥头村',
      // shopLong: '108.91956392274',
      // shopLat: '34.194048996425',
      // operateIdcardCode: '610424199909201136',
      // onDestributionPrice: '20',
      // aptitudeValidDate: '',
      // password: '123456',

      shopName: '',
      operateName: '',
      phone: '',
      phoneBack: '',
      shopStreet: '',
      shopLong: '',
      shopLat: '',
      operateIdcardCode: '',
      onDestributionPrice: '20',
      aptitudeValidDate: '',
      password: '',
      shopSourceName: '',
      shopSourcePhone: '',
      shopTownCode: '小程序',
      state: ''
    },
    deleteImg: '/images/delete_img.png',
  },
  // 长按保存
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
  // 申请成功 商户维码显示隐藏
  _setShowSHCode() {
    wx.navigateToMiniProgram({
      appId: 'wxe61e9b3561336485',
      path: "pages/login/login"
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

  // 商铺验证
  _validateShopForm(shopForm) {

    if (!shopForm.shopName) {
      return '请输入商铺名称';
    } else {
      if (shopForm.shopName.length > 20) {
        return '商铺名称最多20位';
      }
    }
    if (!shopForm.operateName) {
      return '请输入法人姓名';
    } else {
      if (!validate.validChinese(shopForm.operateName)) {
        return '法人姓名仅支持中文';
      }
      if (shopForm.operateName.length > 15) {
        return '法人姓名最多15位';
      }
    }
    if (!shopForm.operateIdcardCode) {
      return '请输入法人身份证';
    } else {
      if (!validate.validCardId(shopForm.operateIdcardCode)) {
        return '法人身份证格式有误'
      }
    }
    if (!shopForm.phone) {
      return '请输入联系电话';
    } else {
      if (!validate.validPhone(shopForm.phone)) {
        return '联系电话格式错误';
      }
    }
    if (shopForm.phoneBack) {
      if (!shopForm.phoneBack) {
        return '请输入备用手机号码';
      } else {
        if (!validate.validPhone(shopForm.phoneBack)) {
          return '备用手机号码格式错误';
        }
      }
    }
    if (!shopForm.shopStreet) {
      return '请输入地址';
    }
    if (!shopForm.shopLong) {
      return '请重新选择地址';
    }
    if (!shopForm.shopLat) {
      return '请重新选择地址';
    }

    if (!shopForm.onDestributionPrice) {
      return '请输入起送价格';
    } else {
      if (!validate.validMoney(shopForm.onDestributionPrice)) {
        return '起送价格式有误'
      } else {
        if (shopForm.onDestributionPrice < 20) {
          return '起送价不得低于20'
        }
      }
    }
    if (!shopForm.password) {
      return '请输入登录密码';
    } else {
      if (shopForm.password.length < 6 || shopForm.password.length > 12) {
        return '请输入6-12位密码';
      }
    }
    if (!this.data.isConsent) {
      return '请阅读并同意入驻合同';
    }

    if(!this.data.isStarShop || !this.data.isBrandShop || !this.data.isWholesaleShop){
      return '请选择店铺类型'
    }
    return false
  },
  // 保存商铺
  _saveShop() {
    let shopForm = this.data.shopForm;
    let isStarShop = this.data.isStarShop
    let isBrandShop = this.data.isBrandShop
    let isWholesaleShop = this.data.isWholesaleShop
    let msg = this._validateShopForm(shopForm);
    if (msg) {
      util._toast(msg);
    } else {
      if (shopForm.state != '02') { // 首次支付
        util._loading('加载中...');
        api._post('/shopstate/apply', {
          shopName: shopForm.shopName,
          operateName: shopForm.operateName,
          phone: shopForm.phone,
          phoneBack: shopForm.phoneBack,
          shopStreet: shopForm.shopStreet,
          shopLong: shopForm.shopLong,
          shopLat: shopForm.shopLat,
          shopSourceName: shopForm.shopSourceName,
          shopSourcePhone: shopForm.shopSourcePhone,
          operateIdcardCode: shopForm.operateIdcardCode,
          onDestributionPrice: shopForm.onDestributionPrice,
          shopTownCode: this.data.shopForm.shopTownCode,
          password: api._getEncrypt(shopForm.password),
          isStarShop,
          isBrandShop,
          isWholesaleShop,
        }).then(res => {
          console.log(res)
          if (res.success) {
            console.log(res)
            api._post('/order/toPayTheOpenShop', {
              goodId: 'd8f4646c6c7a4c03a584923ba705eec0',
              userName: shopForm.operateName,
              userPhone: shopForm.phone,
              userAddress: shopForm.shopStreet,
            }).then(res => {
              api._prepay(res.data, true).then(res => {
                this.setData({
                  ['shopForm.state']: "01"
                });
                util._toast('注册成功');
              }).catch(err => {
                this.setData({
                  ['shopForm.state']: "02"
                });
              });;
            });
          } else {
            util._toast('注册失败');
          }
        });
      } else {
        // 重新支付
        util._loading('加载中...');
        api._post('/order/toPayTheOpenShop', {
          goodId: 'd8f4646c6c7a4c03a584923ba705eec0',
          userName: shopForm.operateName,
          userPhone: shopForm.phone,
          userAddress: shopForm.shopStreet,
        }).then(res => {
          api._prepay(res.data, true).then(res => {
            this.setData({
              ['shopForm.state']: "01"
            }, () => {
              util._toast('注册成功');
            });
          }).catch(err => {
            this.setData({
              ['shopForm.state']: "02"
            });
          });
        });
      }
    }
  },
  // 回显数据
  _getShopForm() {
    api._post('/shopstate/viewShop').then(res => {
      // console.log(res.data.shopSource.split(',',2)[0])
      if (res.success && res.data) {
        // console.log(res.data)
        this.setData({
          'shopForm.shopName': res.data.shopName,
          'shopForm.operateName': res.data.operateName,
          'shopForm.phone': res.data.phone,
          'shopForm.phoneBack': res.data.phoneBack,
          'shopForm.shopStreet': res.data.shopStreet,
          'shopForm.shopLong': res.data.shopLong,
          'shopForm.shopLat': res.data.shopLat,
          'shopForm.operateIdcardCode': res.data.operateIdcardCode,
          'shopForm.onDestributionPrice': res.data.onDestributionPrice,
          // 'shopForm.shopSourceName': res.data.shopSource.split(',', 2)[0],
          // 'shopForm.shopSourcePhone': res.data.shopSource.split(',', 2)[1],
          'shopForm.shopSourceName': res.data.shopSourceName,
          'shopForm.shopSourcePhone': res.data.shopSourcePhone,
          'shopForm.password': res.data.password,
          'shopForm.state': res.data.state,
          index:res.data.isStarShop == '01' ? 0 : res.data.isBrandShop == '01' ? 1 : 2,
          // isStarShop:res.data.isStarShop,
          // isBrandShop:res.data.isBrandShop,
          // isWholesaleShop:res.data.isWholesaleShop,
          isConsent: true
        });
        if (res.data.shopSource) {
          this.setData({
            'shopForm.shopSourceName': res.data.shopSource.split(',', 2)[0],
            'shopForm.shopSourcePhone': res.data.shopSource.split(',', 2)[1],
          })
        }
      }
    });
    // console.log(this.data.shopForm)
  },
  // 选中地址
  _pitchOnShop(e) {
    let uid = e.currentTarget.dataset.uid;
    let address = this.data.searchResult.filter(elem => {
      return elem.uid == uid ? elem : '';
    });
    address = address[0];
    this.setData({
      isSuggestion: false,
      ['shopForm.shopStreet']: `${address.province}${address.city}${address.district}${address.name}`,
      ['shopForm.shopLong']: address.location.lng,
      ['shopForm.shopLat']: address.location.lat,
      searchResult: []
    });
  },
  // suggestion检索--模糊查询

  _setSearchList(e) {
    let kw = e.detail;
    if (this.data.isSuggestion) {
      this.setData({
        ['shopForm.shopStreet']: kw,
        searchResult: []
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
        ['shopForm.shopStreet']: this.data.shopForm.shopStreet,
        isSuggestion: true
      });
    }
  },
  // 阅读并同意
  _isConsent(e) {
    this.setData({
      isConsent: e.detail
    })
  },
  // 设置参数
  _setParam(e) {
    let path = 'shopForm.' + e.currentTarget.dataset.param;
    this.setData({
      [path]: e.detail
    });
  },
  // 页面跳转
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}`
    });
  },
  // 查看特别约定
  lookClick() {
    this.setData({
      isLook: !this.data.isLook
    })
  },
  // 选择店铺类型
  bindPickerChange(e) {
    let index = Number(e.detail.value)
    // console.log(index)
    switch (index) {
      case 0:
        this.setData({
          index,
          isStarShop:'01',
          isBrandShop:"",
          isWholesaleShop:""
        })
        break;
      case 1:
        this.setData({
          index,
          isBrandShop:'01',
          isStarShop:"",
          isWholesaleShop:""
        })
        break;
      case 2:
        this.setData({
          index,
          isStarShop:'',
          isBrandShop:"",
          isWholesaleShop:'01'
        })
        break;
      default:
        break;
    }
    // console.log(this.data.isStarShop)
    // console.log(this.data.isBrandShop)
    // console.log(this.data.isWholesaleShop)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    bmap = new BMap.BMapWX({
      ak: app.globalData.ak
    });

    if (!app.globalData.isLogin) {
      this.setData({
        loginMould: true
      });
    } else {
      this._getShopForm();
      // console.log(1111)
    }
    this.setData({
      isShow: app.globalData.open
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
    // 检测入驻合同
    let flag = wx.getStorageSync('settlementContractFlag') || false;
    if (flag) {
      this.setData({
        isConsent: true
      })
    }
    // console.log(this.data.shopForm)
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
      this._getShopForm();
    });
  }
})