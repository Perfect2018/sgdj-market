// pages/fightGoodsPay/fightGoodsPay.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商品ID
    goodsId: "",
    // 是否为拼单商品
    goodsType: false,
    // 拼单ID
    fightId: "",
    // 拼单商品
    goods: null,
    // 拼单店铺
    shop: null,
    // 地址
    address: null,

    cashRollMoney: 0, //现金券金额
    pocketMoney: 0, //余额
    totalAmt: 0, //商品金额
    shippingFee: 0, //运费
    useMoney: {
      cashRollMoney: 0, //现金券金额
      shippingFee: 0, //运费
      pocketMoney: 0, //余额
    },
    finalAmt: 0, //最终支付
    remark: "" //备注
  },
  // 获取商品详情
  _getGoodsDetail(goodsId = this.data.goodsId) {
    api._post('/goods/get_goods_detail', {
      id: goodsId
    }).then(res => {
      if (res.success) {
        let goods = res.dataDto;
        goods.goodsCount = 1;
        let temp = {
          goods: goods,
          totalAmt: this.data.goodsType ? goods.groupPrice : goods.couponRate,
          shippingFee: goods.freight
        };

        this.setData(temp, () => {
          this._getUserInfo(goods.shopId);
        });
      }
    });
  },
  // 获取用户信息
  _getUserInfo(shopId = this.data.goods.shopId) {
    api._post('/groupGoods/getCustInformation', {
      shopId: shopId
    }).then(res => {
      this.setData({
        address: res.data.address,
        pocketMoney: res.data.pocketMoney && res.data.pocketMoney != "null" ? res.data.pocketMoney : 0,
        cashRollMoney: res.data.cashRollMoney && res.data.cashRollMoney != "null" ? res.data.cashRollMoney : 0
      }, () => {
        // 计算最终价格
        this._finalAmt();
      });
    });
  },
  // 备注
  _remark(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  // 跳转页面
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}`
    });
  },
  // 设置商品数量
  _setGoodsCount(e) {
    let count = e.detail;
    if (count < 999) {
      this.setData({
        'goods.goodsCount': count
      }, () => {
        // 重新计算支付价格
        this._finalAmt();
      });
    } else {
      util._toast("最多可添加999个");
    }
  },
  // 现金券金额&&余额（抵扣）判断获取最终支付价格
  _finalAmt() {
    let totalAmt = Number(this.data.totalAmt);
    let shippingFee = Number(this.data.shippingFee);
    totalAmt += shippingFee;
    let pocketMoney = Number(this.data.pocketMoney);
    let cashRollMoney = Number(this.data.cashRollMoney);
    // 现金券
    if (cashRollMoney && totalAmt > 0 && cashRollMoney > 0) {
      if ((totalAmt - cashRollMoney) > 0) {
        totalAmt = Number(totalAmt - cashRollMoney).toFixed(2);
      } else {
        cashRollMoney = Number(totalAmt).toFixed(2);
        totalAmt = 0;
      }
    }
    // 余额
    if (pocketMoney && totalAmt > 0 && pocketMoney > 0) {
      if ((totalAmt - pocketMoney) > 0) {
        totalAmt = Number(totalAmt - pocketMoney).toFixed(2);
      } else {
        pocketMoney = Number(totalAmt).toFixed(2);
        totalAmt = 0;
      }
    } else {
      pocketMoney = 0;
    }
    this.setData({
      'finalAmt': totalAmt,
      'useMoney.shippingFee': shippingFee,
      'useMoney.cashRollMoney': cashRollMoney,
      'useMoney.pocketMoney': pocketMoney
    });
  },
  // 提交订单
  _submitOrder() {
    let goods = this.data.goods;
    let goodsList = [{
      goodId: goods.id,
      goodCount: goods.goodsCount
    }];
    let params = {
      goodsList: goodsList,
      receiverId: this.data.address.id,
      freight: this.data.useMoney.shippingFee,
      pocketMoney: this.data.useMoney.pocketMoney,
      cashRollMoney: this.data.useMoney.cashRollMoney,
      distributionType: "03",
      remark: this.data.remark
    };

    //  拼单购买   单独购买
    let url = this.data.goodsType ? "/groupGoods/buyGroupGoods" : "/shoppingCart/buyGoods";
    let fightId = this.data.fightId;
    if (fightId) {
      params.groupGoodsId = fightId;
    }
    util._loading("加载中...");
    api._post(url, params, false).then(res => {
      wx.hideLoading();
      let orderId = res.data;
      if (this.data.finalAmt > 0) {
        api._prepay(orderId);
      } else {
        wx.navigateTo({
          // url: `../orderDetail/orderDetail?id=${orderId}`
          url: "../orderList/orderList?type=1"
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsId: options.id,
      goodsType: options.type === "fight" ? true : false,
      fightId: options.fightId ? options.fightId : "",
    }, () => {
      this._getGoodsDetail(options.id);
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
    this._getUserInfo();
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