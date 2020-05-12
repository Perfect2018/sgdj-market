// pages/components/shopList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopList: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconLocation: "/images/sgdj_location.png"
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _toView(e) {
      let navigatePath = e.currentTarget.dataset.navigate;
      let id = e.currentTarget.dataset.id;
      // console.log(e)
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}`
      });
    }
  }
})