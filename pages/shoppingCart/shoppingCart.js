// pages/shoppingCart/shoppingCart.js
const app = getApp();
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
Page({
  staticData: {
    selectGoodsList: []
  },
  /**
   * 页面的初始数据
   */
  data: {
    // 审核使用
    openNum: "",
    openGid: "",
    // 支付重复调用onShow
    onShowFlag: false,
    // 店铺是否关闭
    shopOff: false,
    distributionType: true,
    hasGlobalGoodsAll: false,
    hopeTime: '',
    hopeTimeIndex: [0],
    hopeTimeArray: ['07:00-08:30', '08:30-10:00', '10:00-11:30', '16:00-17:30'],
    address: {},
    goodsList: [],
    isAllChecked: true,
    custCoupons: [], //优惠券列表
    useCustCoupons: {}, //使用的优惠券
    onDestributionPrice: 0, //起送价
    cashRollMoney: 0, //现金券金额
    totalAmt: 0, //商品金额
    shippingFee: 0, //运费
    pocketMoney: 0, //余额
    cashMoney: 0, //零钱
    globalFreight:'0',//全球臻选商品运费
    useMoney: {
      cashRollMoney: 0, //现金券金额
      shippingFee: 0, //运费
      pocketMoney: 0, //余额
      cashMoney: 0, //零钱
      globalFreight:'0',//全球臻选商品运费
    },
    finalAmt: 0, //最终支付
    remark: "" //备注
  },
  // 提交订单
  _submitOrder() {
    // 判断店铺开关状态
    if (this.data.shopOff) {
      util._toast("该店已打烊，暂不能下单");
      return;
    }
    let selectGoodsList = this.staticData.selectGoodsList;
    let flag = selectGoodsList.reduce((prev, elem) => {
      return prev || elem ? true : false;
    }, false);
    if (flag) {
      // 判断是否同时含有即时送和全球臻选商品 有 false
      let hasGlobalGoods = true;
      if (selectGoodsList.length > 1) {
        selectGoodsList.forEach(elem => {
          if (selectGoodsList[0].isGlobalGoods == elem.isGlobalGoods) {
            hasGlobalGoods = hasGlobalGoods ? true : false;
          } else {
            hasGlobalGoods = false;
          }
        });
      }
      if (hasGlobalGoods) {
        let goodsList = selectGoodsList.reduce((prev, elem) => {
          if (elem) {
            prev.push({
              goodId: elem.goodsId,
              goodCount: elem.goodsCount
            });
          }
          return prev;
        }, []);
        let distributionType = this.data.hasGlobalGoodsAll ? "03" : this.data.distributionType ? "04" : "02";
        if (!this.data.address) {
          wx.navigateTo({
            url: `../shoppingAddress/shoppingAddress?type=add`
          });
          util._toast("请添加地址");
          return;
        }
        let params = {
          goodsList: goodsList,
          receiverId: this.data.address.id,
          freight: this.data.useMoney.shippingFee,
          pocketMoney: this.data.useMoney.pocketMoney,
          cashRollMoney: this.data.useMoney.cashRollMoney,
          cashMoney: this.data.useMoney.cashMoney,
          distributionType: distributionType,
          remark: this.data.remark
        };
        let useCustCoupons = this.data.useCustCoupons;
        if (useCustCoupons.id) {
          params.couponId = useCustCoupons.id;
        }
        if (this.data.goodsList[0].isWholesale == "01") {
          let hopeTime = this.data.hopeTime;
          if (hopeTime) {
            params.takeGoodsTime = hopeTime;
          } else {
            util._toast("请选择期望送达时间");
          }
        }
        util._loading("加载中...");
        api._post('/shoppingCart/buyGoods', params, false).then(res => {
          wx.hideLoading();
          let orderId = res.data;
          // console.log(res)
          // console.log(orderId)
          if (this.data.finalAmt > 0) {
            this.setData({
              onShowFlag: true
            });
            api._prepay(orderId);
          } else {
            wx.navigateTo({
              // url: `../orderDetail/orderDetail?id=${orderId}`
              url: "../orderList/orderList?type=1"
            });
          }
        });
        
      } else {
        util._toast("全球臻选和即时送不可同时购买");
       
      }
    } else {
      util._toast("请选择商品");
     
    }
  },
  // 切换配送方式
  _distributionType(e) {
    let temp = e.detail.value == 1 ? true : false;
    if (this.data.distributionType != temp) {
      this.setData({
        distributionType: temp
      }, () => {
        this._totalAmt();
      });
    }
  },
  // 现金券金额&&余额（抵扣）判断获取最终支付价格
  _finalAmt(totalAmt) {
    let pocketMoney = Number(this.data.pocketMoney);
    let cashRollMoney = Number(this.data.cashRollMoney);
    let cashMoney = Number(this.data.cashMoney)
    // console.log(cashMoney)
    
    // 零钱
    if(cashMoney && totalAmt > 0){
      if((totalAmt - cashMoney) > 0){
        totalAmt = Number(totalAmt - cashMoney).toFixed(2);
      }else{
        cashMoney = Number(totalAmt).toFixed(2);
        totalAmt = 0
      }
    }

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
      'useMoney.cashMoney':cashMoney,
      'useMoney.cashRollMoney': cashRollMoney,
      'useMoney.pocketMoney': pocketMoney
    });
  },
  // 配送费（折扣）判断
  _shippingFee(selectGoodsList) {
    // console.log(selectGoodsList)
    let shippingFee = this.data.shippingFee;
    // let globalFee = this.data.globalFreight
    //商户配送
    if (this.data.distributionType) {
      let flag = selectGoodsList.reduce((prev, elem) => {
        return prev || elem ? true : false;
      }, false);
      if (!flag) {
        shippingFee = 0;
      } else {
        if ((this.data.goodsList[0].shopId === '2b0757c8be8e43a59ad6ce1b23eced82' || this.data.goodsList[0].isWholesale === "01") && (Number(this.data.totalAmt) >= Number(this.data.onDestributionPrice))) {
          shippingFee = 0;
        }
      }
    } else {
      //上门自取
      shippingFee = 0
      // globalFee =this.data.globalFreight;
    }
    //  console.log(shippingFee)
    // 全球甄选
    if (this.data.hasGlobalGoodsAll) {
      shippingFee =0
      // globalFee = this.data.globalFreight;
    }
    // console.log(shippingFee)
    this.setData({
      'useMoney.shippingFee': shippingFee
    });
    // return shippingFee
    return shippingFee+this.data.globalFreight;
    // console.log(shippingFee)
  },
  // 计算商品金额
  _totalAmt(selectGoodsList = this.staticData.selectGoodsList) {
    // console.log(this.data.globalFreight)
    let totalAmt = selectGoodsList.reduce((prev, elem) => {
      return elem ? prev + (elem.goodsCount * elem.couponRate) : prev;
    }, 0);
    // console.log(totalAmt)
    this.setData({
      totalAmt: Number(totalAmt).toFixed(2),
    }, () => {
      let tempAmt = Number(totalAmt + this._shippingFee(selectGoodsList)).toFixed(2);
      // 优惠券
      let custCoupons = this.data.custCoupons;
      // console.log(custCoupons)
      if (custCoupons) {
        let custCoupon = 0;
        // 优惠券金额排序
        custCoupons = custCoupons.sort((a, b) => a.fullAmtToUse - b.fullAmtToUse);
        custCoupons.forEach(elem => {
          if (Number(elem.fullAmtToUse) < tempAmt) {
            custCoupon = elem;
          }
        });
        tempAmt -= custCoupon.couponAmt || 0;
        this.setData({
          useCustCoupons: custCoupon || {}
        });
      }
      this._finalAmt(tempAmt);
    });
  },
  // 设置商品数量
  _setGoodsCount(e) {
    // console.log(e)
    // let maxbuy = e.currentTarget.dataset.maxbuy
    let count = e.detail;
    // if(maxbuy){
      if(count>1){
      //   util._toast('该商品只能限购一份')
      //   return
      // }else{
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let goodsList = this.data.goodsList.concat([]);
        let goodsId = e.currentTarget.dataset.maxbuy
        api._post('/shoppingCart/upShoppingCartGoodsCount', {
          id: id,
          goodsCount: 1,
          goodsId
        }).then(res => {
          if (res.success) {
            goodsList[index].goodsCount = count;
            this._setGoodsList(goodsList);
          }else{
            util._toast(res.error.msg)
            goodsList[index].goodsCount = 1;
            this._setGoodsList(goodsList);
          }
        })
      // }
    }else if (count < 999) {
      let id = e.currentTarget.dataset.id;
      let index = e.currentTarget.dataset.index;
      let goodsList = this.data.goodsList.concat([]);
      api._post('/shoppingCart/upShoppingCartGoodsCount', {
        id: id,
        goodsCount: count
      }).then(res => {
        if (res.success) {
          goodsList[index].goodsCount = count;
          this._setGoodsList(goodsList);
        }
      })
    } else {
      util._toast("最多可添加999个");
    }
  },
  // 设置商品  设置选中商品
  _setGoodsList(goodsList) {
    if (!goodsList.length) {
      wx.navigateBack();
      return;
    }
    this.setData({
      goodsList: goodsList
    }, () => {
      let selectGoodsList = [];
      goodsList.forEach(elem => {
        if (elem.checked) {
          selectGoodsList.push(elem);
        }
      });
      this.staticData.selectGoodsList = selectGoodsList;
      this._hasGlobalGoodsAll();
      this._totalAmt(selectGoodsList);
    });

  },
  // 判断是否全部为全球臻选商品
  _hasGlobalGoodsAll() {
    let selectGoodsList = this.staticData.selectGoodsList;
    let hasGlobalGoodsAll;
    if (selectGoodsList.length) {
      hasGlobalGoodsAll = selectGoodsList.reduce((prev, elem) => {
        return elem ? prev && elem.isGlobalGoods == "01" ? true : false : prev;
      }, true);
    } else {
      hasGlobalGoodsAll = false
    }
    this.setData({
      hasGlobalGoodsAll: hasGlobalGoodsAll
    });
  },
  // 跳转页面
  _toView(e) {
    let navigatePath = e.currentTarget.dataset.navigate;
    let params = e.currentTarget.dataset.params;
    wx.navigateTo({
      url: `../${navigatePath}/${navigatePath}?${params}`
    });
  },
  // 选中切换
  _checkedChange(e) {
    let checked = e.currentTarget.dataset.checked
    let freight = Number(e.currentTarget.dataset.freight)
    console.log(e)
    if(checked){
      this.data.globalFreight -= freight
    }else{
      this.data.globalFreight += freight
    }
    
    if (e.detail.x > 130) {
      return;
    }
    let index = e.currentTarget.dataset.index;
    let goodsList = this.data.goodsList;
    let isAllChecked = this.data.isAllChecked;
    if (index == "all") {
      isAllChecked = !this.data.isAllChecked;
      goodsList = goodsList.map(elem => {
        elem.checked = isAllChecked;
        return elem;
      });
    } else {
      goodsList[index].checked = !goodsList[index].checked;
      isAllChecked = goodsList.reduce((prev, elem) => {
        return elem.checked && prev ? true : false;
      }, true);
    }
    this._setGoodsList(goodsList);
    this.setData({
      isAllChecked: isAllChecked
    });
    // this._getGoodsList()
  },
  // 选中删除
  _delMoreGoods(e) {
    // console.log()
    let goodsList = this.data.goodsList;
    if (goodsList.length) {
      let ids = this.data.goodsList.map(elem => {
        return elem.checked ? elem.id : '';
      });
      ids = ids.join(",");
      api._post('/shoppingCart/batchDelGoods', {
        goodsCartIds: ids
      }).then(res => {
        if (res.success) {
          goodsList = goodsList.filter(elem => {
            return elem.checked ? '' : elem;
          });
          console.log(goodsList)
          this._setGoodsList(goodsList);
          util._toast("删除成功");
        } else {
          util._toast("删除失败");
        }

      });
    }
  },
  //  删除单个商品
  _delGoods(e) {
    let id = e.currentTarget.dataset.id;
    let freight = Number(e.currentTarget.dataset.freight);
    // let globalFreight = this.data.globalFreight
    console.log(e)
    api._post('/shoppingCart/deleteShoppingCartGoods', {
      goodsCartId: id
    }).then(res => {
      if (res.success) {
        let goodsList = this.data.goodsList.filter(elem => {
          return elem.id == id ? '' : elem;
        })
        this.data.globalFreight -= freight
        // this._shippingFee(selectGoodsList)
        this.onShow()
        console.log(this.data.globalFreight)
        this._setGoodsList(goodsList);
        util._toast("删除成功");
      } else {
        util._toast("删除失败");
      }
    });
  },
  // 设置期望送达时间
  _hopeTimeChange(e) {
    let temp = e.detail.value;
    this.setData({
      hopeTime: this.data.hopeTimeArray[temp[0]],
      hopeTimeIndex: temp
    });
  },
  // 获取商品数据
  _getGoodsList(shopId = this.data.shop.shopId) {
    // console.log(shopId)
    api._post('/shoppingCart/getShoppingCartList', {
      shopId: shopId
    }).then(res => {
      // console.log(res)
      if (res.success) {
        if (!res.data.shoppingCart.length && app.globalData.open) {
          wx.navigateBack();
          return;
        }
        // if (app.globalData.open) {
          api._post('/goods/get_goods_detail', {
            id: this.data.openGid
          }).then(result => {
            if (result.success) {
              // console.log(result)
              let goodsList = [result.dataDto];
              goodsList = goodsList.map(elem => {
                elem.checked = true;
                return elem;
              });
              goodsList[0].goodsCount = this.data.openNum;
              this._setGoodsList(goodsList);
              console.log(res.data.custCoupons)
              this.setData({
                custCoupons: res.data.custCoupons || [],
                shopOff: goodsList[0] && goodsList[0].shop.shopState === "01" ? false : true,
                address: res.data.address,
                onDestributionPrice: goodsList[0] && goodsList[0].shop.onDestributionPrice ? goodsList[0].shop.onDestributionPrice.toFixed(2) : '20.00',
                shippingFee: res.data.psf / 2,
                'useMoney.shippingFee': res.data.psf / 2,
                'useMoney.pocketMoney': res.data.pocketMoney,
                pocketMoney: res.data.pocketMoney,
                cashRollMoney: res.data.cashRollMoney,
                cashMoney:res.data.cashMoney
              });
            }
          });
        // } else {
          // console.log('我是else')
          let goodsList = res.data.shoppingCart.map(elem => {
            elem.checked = true;
            return elem;
          });
          // console.log(goodsList)
          this._setGoodsList(goodsList);
          // console.log(res.data.shoppingCart)
          let item = res.data.shoppingCart.map(elem=>{
            return elem.freight ? Number(elem.freight):0
          }) 
          let sum = item.reduce((pre,next)=>{
            return pre+next
          },0)
          // console.log(item)
          // console.log(sum)
          this.setData({
            custCoupons: res.data.custCoupons || [],
            shopOff: goodsList[0] && goodsList[0].shop.shopState === "01" ? false : true,
            address: res.data.address,
            onDestributionPrice: goodsList[0] && goodsList[0].shop.onDestributionPrice ? goodsList[0].shop.onDestributionPrice.toFixed(2) : '20.00',
            shippingFee: res.data.psf / 2,
            'useMoney.shippingFee': res.data.psf / 2,
            'useMoney.pocketMoney': res.data.pocketMoney,
            pocketMoney: res.data.pocketMoney,
            cashRollMoney: res.data.cashRollMoney,
            cashMoney:res.data.cashMoney,
            globalFreight:sum
          });
          console.log(this.data.globalFreight)
        // }
      } else {
        util._toast("未知错误");
      }
    })
  },
  // 备注
  _remark(e) {
    this.setData({
      remark: e.detail.value
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // console.log(options)
    this.setData({
      'shop.shopId': options.id,
      // openNum: options.openNum,
      // openGid: options.openGid
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

    if (!this.data.onShowFlag) {
      this._getGoodsList();
    } else {
      this.setData({
        onShowFlag: false
      });
    }
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