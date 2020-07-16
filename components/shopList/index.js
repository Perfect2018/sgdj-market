// pages/components/shopList.js
const app = getApp();
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
      let lat = app.globalData.location.lat;
      let lng = app.globalData.location.lng
      // console.log(e)
      wx.navigateTo({
        url: `../${navigatePath}/${navigatePath}?id=${id}&lat=${lat}&lng=${lng}`
      });
    }
  }
})