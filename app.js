//app.js
const api = require('./utils/api.js');
const util = require('./utils/util.js');
App({
  onLaunch: function(options) {
    // 获取跳转指定页
    // this.jumpLogic(options.query);
    // 获取本地地理位置
    let location = wx.getStorageSync("location") || "";
    if (location) {
      this.globalData.location = location;
    }
    // 登录
    wx.login({
      success: res => {
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        api._post('/wxpay/getAppOpenId', {
          code: res.code
        }).then(res => {
          this.globalData.openId = res.data.json.openid;
          this.globalData.session_key = res.data.json.session_key;
          let session_key = res.data.json.session_key;
          // 获取用户信息
          wx.getSetting({
            success: res => {
              if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    this.globalData.userInfo = res.userInfo;
                    this.globalData.encryptedData = res.encryptedData;
                    this.globalData.iv = res.iv;
                    let encryptedData = res.encryptedData;
                    let iv = res.iv;
                    let scene = !this.globalData.scene;
                    if (scene && session_key && encryptedData && iv) {
                      api._post('/wxcust/appuserinfo', {
                        session_key,
                        encryptedData,
                        iv
                      }).then(res => {
                        // console.log(res)
                        if (res.success && res.data) {
                          this.globalData.isLogin = true;
                          api.setCustID(res.data['CUST-ID']);
                        }
                        // console.log(this.globalData.open)
                      });
                    }
                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (this.userInfoReadyCallback) {
                      this.userInfoReadyCallback(res);
                    }
                  }
                })
              }
            }
          })
        }).catch(err => {
          console.log(err);
        });
      }
    });
  },
  globalData: {
    ak: 'GRkL9XqQYLgkGGbtiO1ylLvTx6pDhl8p',
    userInfo: null,
    openId: '',
    session_key: '',
    scene: '',
    parentCustId: '',
    isLogin: false,
    open: false
  },
  // 登录
  _login(e) {
    return new Promise((resolve, reject) => {
      let session_key = this.globalData.session_key;
      let encryptedData = e.detail.encryptedData;
      let iv = e.detail.iv;
      this.globalData.userInfo = e.detail.userInfo;
      if (session_key && encryptedData && iv) {
        util._loading('正在登陆...');
        api._post('/wxcust/appuserinfo', {
          session_key,
          encryptedData,
          iv
        }).then(res => {
          wx.hideLoading();
          if (res.success && res.data) {
            this.globalData.isLogin = true;

            let custId = res.data['CUST-ID'];
            api.setCustID(custId);

            let parentCustId = this.globalData.parentCustId;
            if (parentCustId && custId) {
              api._post('/distribution/insertDistribution', {
                parentCustId: parentCustId,
                custId: custId
              });
            }
            resolve();
            wx.hideLoading();
            util._toast("登录成功");

          } else {
            reject();
            util._toast("登录失败");
          }
        });
      }
    })
  },
  //获取经纬度
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        success: (res) => {
          let location = {
            lng: res.longitude,
            lat: res.latitude
          }
          // console.log(res)
          wx.setStorageSync("location", location);
          this.globalData.location = location;
          resolve();
        },
        fail: (res) => {
          wx.showModal({
            title: '提示',
            content: '您已拒绝位置授权,部分功能将无法使用',
            showCancel: true,
            cancelText: "取消",
            cancelColor: '#666',
            confirmText: "立即开启",
            confirmColor: '#f80',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    resolve();
                  }
                })
              } else {
                console.log('不同意授权')
              }
            }
          });

        },
      });
    })
  },
  // // 跳转至指定页面
  // jumpLogic(options) {
  //   if (Object.keys(options).length && options.scene) {
  //         wx.navigateTo({
  //           url: `pages/shop/shop?id=${options.scene}`
  //         })
  //   }
  // }
});