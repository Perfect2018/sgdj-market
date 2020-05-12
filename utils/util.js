const config = require('../config.js');

const _formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n;
}
// 获取图片链接
const _getImageUrl = id => {
  return `${config.Host}/outByteImgById?id=${id}`;
}
// 获取二维码链接
const _getCodeUrl = path => {
  return `${config.Host}${path}`;
}
//格式化二维码参数
const _getQRParams = data => {
  // let param = encodeURIComponent(JSON.stringify(data)).substr(3).slice(0, -3);
  // let param = JSON.stringify(data).substr(1).slice(0, -1).replace(/\"/g, "");
  return `?page=pages/${data.page}/${data.page}&param=${data.id}`;
}
// 提示框
const _toast = msg => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 1500
  })
}
// 加载框
const _loading = msg => {
  wx.showLoading({
    title: msg,
    mask: true
  });
}

// 商品列表 瀑布流
const _getGoodsList = goodsList => {
  let goodsLeftList = goodsList.filter((elem, i) => {
    return i % 2 == 0 ? elem : '';
  });
  let goodsRightList = goodsList.filter((elem, i) => {
    return i % 2 != 0 ? elem : '';
  });
  return {
    goodsLeftList,
    goodsRightList
  }
}
// 检测iPhoneX
const _isIPhoneX = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: ({
        model,
        screenHeight,
        statusBarHeight
      }) => {
        let iphoneX = /iphone x/i.test(model);
        let iphoneNew = /iPhone11/i.test(model) && screenHeight === 812;
        let cache = {
          isIPhoneX: iphoneX || iphoneNew,
          statusBarHeight
        };
        resolve(cache);
      },
      fail: reject
    });
  });
}
// 数组步长格式化
const _stepArray = (array = [], step = 2) => {
  let temp = [];
  return array.reduce((prev, elem, index) => {
    temp.push(elem);
    if (temp.length === step) {
      prev.push(temp);
      temp = [];
    } else if (temp.length && (array.length - 1) === index) {
      prev.push(temp);
    }
    return prev;
  }, []);
}

module.exports = {
  _getQRParams,
  _formatTime,
  _getGoodsList,
  _getImageUrl,
  _getCodeUrl,
  _toast,
  _loading,
  _isIPhoneX,
  _stepArray
}