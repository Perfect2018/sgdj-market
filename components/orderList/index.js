// pages/components/orderList/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderList: {
      type: Array
    },
    orderType: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showOrder: -1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _toView(e) {
      let navigatePath = e.currentTarget.dataset.navigate;
      let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  }
})