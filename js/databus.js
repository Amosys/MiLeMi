import Pool from './base/pool'
//import Box from './npc/box'

let instance

/**
 * 全局状态管理器
 */
export default class DataBus {
  constructor() {
    if (instance) return instance

    instance = this

    this.pool = new Pool()
    this.boxs = []
    this.layers = []

    this.reset()
  }

  reset() {
    this.layers.forEach((item) => {
      item.boxs.forEach((box) => {
        this.pool.recover('box', box)
      })
    })      
    if (this.slot){
      this.slot.boxs.forEach((box) => {
        this.pool.recover('box', box)
      })
    }

    this.frame = 0
    this.score = 0
    this.boxs = []
    this.slot = null
    this.gameOver = false
    this.animations = []
    this.layers = []
    this.boxTypeNum = 7
    this.layerTotalNum = 1
    this.layerXNum = 15
    this.layerYNum = 15
    this.boxTotalNum = 0
    this.screenWidth = wx.getSystemInfoSync().windowWidth
    this.screenHeight = wx.getSystemInfoSync().windowHeight
    this.xGap = 20
    this.yGap = 130
    this.boxWidth = (this.screenWidth - (this.xGap * 2)) / (this.layerXNum + 1) * 2
    this.boxHeight =  this.boxWidth * 1.25
    this.same_num = 3
  }

  /**
   * 回收Box，进入对象池
   * 此后不进入帧循环
   */
  removeBox(box) {
    var flag = true
    this.boxs.splice(this.boxs.indexOf(box), 1)
    box.visible = false
    this.pool.recover('box', box)

    this.layers.forEach((item) => {
      if(item.boxs.length != 0){
        flag = false
      }
    })
    if (flag){
      this.gameOver = true
    }
  }

  addToSlot(box){
    var flag = this.slot.add(box)
    if (flag){
      box.masked.forEach((item) => {
        item.mask.splice(item.mask.indexOf(box), 1)
        if (item.mask.length == 0){
          item.valid = true
        }
      })
      box.masked = []
      this.layers[box.layer].boxs.splice(this.layers[box.layer].boxs.indexOf(box), 1)
    }
    return flag
  }
  boxMoveEnd(box){
    if (box.inSlot){
      this.gameOver = !this.slot.moveInSlot(box)
    }
  }

  setSlot(slot){
    this.slot = slot
  }
  mergerBox(boxs){
    boxs.forEach((box) => {
      this.boxs.push(box)
    })
  }
}
