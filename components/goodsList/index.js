// pages/goodsList/index.js
const util = require('../../utils/util.js');
const app = getApp();
const api = require('../../utils/api')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsList: {
      type: Array
    },
    // couponList:{
    //   type:Array
    // },
    navigate: {
      type: String,
      value: 'goodsDetail'
    },
    showAdd: {
      type: Boolean,
      value: true
    }
  },
  observers: {
    'goodsList' (goodsList) {
      goodsList = util._getGoodsList(goodsList);
      this.setData({
        goodsLeftList: goodsList.goodsLeftList,
        goodsRightList: goodsList.goodsRightList
      });
      // console.log(this.data.goodsLeftList)
    },

  },


  /**
   * 组件的初始数据
   */
  data: {
    gwcIcon:'/images/sgdj_tj.png',
    goodsLeftList: [],
    goodsRightList: [],
    loginMould: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 添加购物车
    _addCart(e) {
      let id = e.currentTarget.dataset.id;
      let goods = this.properties.goodsList.filter(elem => {
        return elem.id == id ? elem : '';
      });
      console.log(goods)
      this.triggerEvent('_addCart', {
        goods: goods[0]
      });
    },

   

    // 页面跳转
    _toView(e) {
      let navigatePath = e.currentTarget.dataset.navigate;
      let id = e.currentTarget.dataset.id;
      // let navigateType = e.currentTarget.dataset.navigatetype;
      // if(navigateType=="01"){
      //   navigatePath = "fightGoodsDetail";
      // }
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  }
})