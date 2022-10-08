import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import Box from './npc/box'
import Slot from './npc/slot'
import Layer from './npc/layer'

const ctx = canvas.getContext('2d')
const databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg = new BackGround(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    databus.setSlot(new Slot(700, 7, databus.boxWidth, databus.boxHeight, databus.same_num))
    this.boxGenerate()
    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  boxGenerate() {
    var shape = [
      [0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,
       0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
       0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
       0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0,
       0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
       0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
       1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
       0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
       0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0,
       0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0,
       0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0,],
    ]
    var list = []
    shape.forEach((item) => {
      var lay = []
      item.forEach((val, index) => {
        if (1 == val){
          lay.push(index)
        }
      })
      list.push(lay)
    })
    var layerTotalPos = databus.layerXNum * databus.layerYNum
    for (var i = 0; i < databus.layerTotalNum; i++){
      var map = []
      var j = i % shape.length
      list[j].forEach((item) => {
        var val = item + i * databus.layerXNum
        //var max = item % databus.layerXNum + layerTotalPos - databus.layerXNum
        val = val > layerTotalPos ? layerTotalPos - (Math.floor((val - layerTotalPos) / databus.layerXNum) + 1) * databus.layerXNum : val
        map.push(val)
      })
      var layer = new Layer(i, map, databus.layerXNum, databus.layerYNum)
      databus.layers.push(layer)
      databus.boxTotalNum += layer.mapSize()
    }
    if (databus.boxTotalNum % (databus.boxTypeNum * databus.same_num) != 0){
      console.log('ERROR:boxTotalNum = ' + databus.boxTotalNum)
      return 
    }

    var boxNumPerType = databus.boxTotalNum / databus.boxTypeNum
    for(var j = 0; j < databus.boxTypeNum; j++) {
      for(var i = 0; i < boxNumPerType; i++) {
        const box = databus.pool.getItemByClass('box', Box)
        box.init(j, 0, 0)
        databus.boxs.push(box)
      }
    }
    databus.boxs.sort(function() {
      return (Math.random() - 0.5);
    })

    //databus.layers = [databus.layers[0]]
    var index = 0
    databus.layers.forEach((item) => {
      var idx = 0
      item.map.splice(item.map.length, )
      while (index < databus.boxs.length){
        var box = databus.boxs[index++]
        if (item.push(box)){
          //databus.boxs.splice(0, 1)
          //console.log(item.getX(box), item.getY(box))
          box.index = idx++
          box.init(box.type, databus.xGap + item.getX(box) % item.xNum / 2 * databus.boxWidth, databus.yGap + Math.floor(item.getY(box) % item.yNum) / 2 * databus.boxHeight)
          box.valid = true
          box.layer = item.index
        }
        else{
          break
        }
      }
    })
    
    databus.boxs.forEach((box1) => {
      databus.boxs.forEach((box2) => {
        if (box1 != box2 && box2.checkMask(box1)){
          box1.mask.push(box2)
          box2.masked.push(box1)
          box1.valid = false
        }
      })
    })
    databus.boxs = []
  } 

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    const x = e.touches[0].clientX
    const y = e.touches[0].clientY

    const area = this.gameinfo.btnArea

    if (x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY) this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)
    databus.slot.drawToCanvas(ctx)

    databus.boxs.forEach((box) => {
      box.render(ctx)
    })
    databus.layers
      .forEach((item) => {
        item.boxs.forEach((box) => {
          box.render(ctx)
        })
      })
    databus.slot.render(ctx)
    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver) return

    //this.bg.update()
    databus.boxs.forEach((box) => {
      box.update()
    })
    databus.layers
      .forEach((item) => {
        item.boxs.forEach((box) => {
          box.update()
        })
      })
    databus.slot.update()

    //this.enemyGenerate()

    //this.collisionDetection()
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
