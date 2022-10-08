import Sprite from '../base/sprite'
import Music from '../runtime/music'
import DataBus from '../databus'

const SLOT_X_GAP = 10
const SLOT_Y_GAP = 20
const databus = new DataBus()
const music =  new Music()

export default class Slot extends Sprite {
  constructor(y, size, box_width, box_height, same_num) {
    const width = size * box_width + SLOT_X_GAP * 2
    const height = box_height + SLOT_Y_GAP * 2
    super('static/images/slot.png', width, height)

    /*wx.getSystemInfo({
      success: (result) => {
        this.x = (result.screenWidth - width) / 2
      },
    })*/
    this.x = (databus.screenWidth - width) / 2
    this.y = y
    this.box_width = box_width
    this.box_height = box_height
    this.size = size
    this.same_num = same_num
    this.reset()
  }

  reset() {
    this.boxs = []

  }

  /**
   * 回收Box，进入对象池
   * 此后不进入帧循环
   */
  remove(box) {
    const temp = this.boxs.shift()
  }

  add(box){
    let pos = 0
    let exits_flag = false

    if (this.boxs.length >= this.size){
      return false
    }
    this.boxs.forEach((item) => {
      if (!exits_flag){
        if (item.type == box.type){
          exits_flag = true
        }
        pos++
      }
      else{
        if (item.type != box.type){
          item.setTargetPos(item.tar_x + this.box_width, item.tar_y)
        }
        else{
          pos++
        }
      }
    }) 
    box.setTargetPos(this.x + SLOT_X_GAP + this.box_width * pos, this.y + SLOT_Y_GAP)
    this.boxs.splice(pos, 0, box)
    return true
  }
  moveInSlot(box){
    var same_boxs = this.checkSame(this.same_num)
    var get_flag = false
    var remove_list = []
    var move_flag = false
    
    if (same_boxs.length != 0){
      this.boxs.forEach((item) => {
        if (same_boxs.indexOf(item) >= 0){
          remove_list.push(this.boxs.indexOf(item))
          get_flag = true
          return 
        }
        if (get_flag){
          item.setTargetPos(item.tar_x - this.same_num * this.box_width, item.tar_y)
        }
      })

      remove_list.forEach((item) => {
        this.boxs[item].remove()
      })
      databus.mergerBox(this.boxs.splice(remove_list[0], this.same_num))
      music.playExplosion()
    }

    this.boxs.forEach((item) => {
      if (item.move){
        move_flag = true
      }
    })
    if (!move_flag && this.boxs.length >= this.size){
      return false
    }
    return true
  }

  update() {
    this.boxs.forEach((box) => {
      box.update()
    })
  }  
  render(ctx) {
    this.boxs.forEach((box) => {
      box.render(ctx)
    })
  }

  checkSame(num) {
    var same_boxs = []
    var same = 0
    var type = null
    this.boxs.forEach((item) => {
      if (item.move){
        return
      }
      if (same != num){
        if (type != item.type){
          type = item.type
          same = 1
          same_boxs = [item]
        }
        else{
          same++
          same_boxs.push(item)
        }
      }
    })
    
    if (same != num){
      same_boxs = []
    }
    return same_boxs
  }
}