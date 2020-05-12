//小程序请求封装
const config = require('../config.js');
const util = require('./util.js');
const RSA = require('./rsa.js');
let custID = '';

const http = ({
  url = '',
  param = {},
  type = true,
  ...other
} = {}) => {
  let header = {
    'Content-Type': 'application/json' // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
  }
  if (custID) {
    header = {
      'Content-Type': 'application/json', // 默认值 ,另一种是 "content-type": "application/x-www-form-urlencoded"
      'CUST-ID': custID
    }
  }
  if (other.method == 'post') {
    if (type) {
      header = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'CUST-ID': custID
      }
    } else {
      header = {
        'Content-Type': 'application/json',
        'CUST-ID': custID
      }
    }
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: getUrl(url),
      data: param,
      header,
      ...other,
      complete: (res) => {
        if (res.data === "ERR_LOGIN_402") {
          wx.switchTab({
            url: '/pages/my/my',
          });
          util._toast('请登录')
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      }
    })
  })
}
// 获取URL
const getUrl = (url) => {
  if (url.indexOf('://') == -1) {
    url = config.Host + url;
  }
  return url;
}

// get 方法
const _get = (url, param = {}) => {
  return http({
    url,
    param,
    method: 'get'
  })
}
// post 方法
const _post = (url, param = {}, type = true) => {
  return http({
    url,
    param,
    method: 'post',
    type: type
  });
}
// download 方法
const _download = (url) => {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url: url,
      complete: (res) => {
        if (res.statusCode === 200) {
          resolve(res);
        } else {
          reject();
        }
      }
    });
  })
}
// 设置custID
const setCustID = (temp) => {
  custID = temp;
}
// 获取custID
const getCustID = () => {
  return custID;
}
// 支付
const _prepay = (orderId, flag = false) => {
  return new Promise((resolve, reject) => {
    _post("/wxpay/prepay", {
      id: orderId
    }).then(res => {
      wx.hideLoading();
      wx.requestPayment({
        timeStamp: res.timeStamp,
        nonceStr: res.nonceStr,
        package: res.package,
        signType: 'MD5',
        paySign: res.paySign,
        success: (res) => {
          util._toast("支付成功");
          resolve();
          if (!flag) {
            wx.navigateTo({
              // url: `../orderDetail/orderDetail?id=${orderId}`
              url: "../orderList/orderList?type=1"
            });
          }
        },
        fail: (res) => {
          // console.log(res)
          util._toast("支付失败");
          reject();
          if (!flag) {
            wx.navigateTo({
              // url: `../orderDetail/orderDetail?id=${orderId}`
              url: "../orderList/orderList"
            });
          }
        }
      })
    });
  });
}
// 加密
const _getEncrypt = (word) => {
  let publicKey = `-----BEGIN PUBLIC KEY-----${config.PUBLICKEY}-----END PUBLIC KEY-----`;
  let encrypt_rsa = new RSA.RSAKey();
  encrypt_rsa = RSA.KEYUTIL.getKey(publicKey);
  let encStr = encrypt_rsa.encrypt(word)
  encStr = RSA.hex2b64(encStr);
  return encStr;
}
// 抛出
module.exports = {
  _get,
  _post,
  _download,
  setCustID,
  getCustID,
  _prepay,
  _getEncrypt
}