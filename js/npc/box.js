import Animation from '../base/animation'
import DataBus from '../databus'
import Music from '../runtime/music'

const BOX_IMG_SRC = 'static/images/base_box.png'
const BOX_SPEED = 12
const BOX_ZOOM = 1.3
const BOX_ZOOM_SPEED = 1.1

const __ = {
  speed: Symbol('speed')
}

const databus = new DataBus()
const music =  new Music()

function rnd(start, end) {
  return Math.floor(Math.random() * (end - start) + start)
}

export default class Box extends Animation {
  constructor() {
    super(BOX_IMG_SRC, 50, 60)

    this.initExplosionAnimation()
    // 初始化事件监听
    this.initEvent()
  }

  init(type, xpos, ypos) {
    this.x = xpos
    this.y = ypos
    this.width = databus.boxWidth
    this.height = databus.boxHeight
    this.setImg('static/images/box_' + type + '.png')

    this[__.speed] = BOX_SPEED

    this.visible = true
    this.move = false
    this.tar_x = xpos
    this.tar_y = ypos
    this.speed_x = 0
    this.speed_y = 0
    this.inSlot = false
    this.type = type
    this.isRemove = false
    this.valid = false
    this.layer = 0
    this.mask = []
    this.masked = []
    this.zoomWidth = this.width * BOX_ZOOM
    this.zoomHeight = this.height * BOX_ZOOM
    this.touch = false
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const frames = []

    const EXPLO_IMG_PREFIX = 'static/images/explosion'
    const EXPLO_FRAME_COUNT = 19

    for (let i = 0; i < EXPLO_FRAME_COUNT; i++) {
      frames.push(`${EXPLO_IMG_PREFIX + (i + 1)}.png`)
    }

    this.initFrames(frames)
  }

  checkFigureInBox(x, y) {
    return x > this.x && x < (this.x + this.width) && y > this.y && y < (this.y + this.height)
  }

    /**
   * 响应手指的触摸事件
   */
  initEvent() {
    canvas.addEventListener('touchstart', ((e) => {
      e.preventDefault()
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY
      if (this.checkFigureInBox(x, y) && this.visible && this.valid){
        if (this.inSlot){
          return 
        }
        this.touch = true
      }
    }))

    canvas.addEventListener('touchmove', ((e) => {
      e.preventDefault()
      if (this.touch && this.visible && this.valid){

        if (this.inSlot){
          return 
        }
      }
    }))

    canvas.addEventListener('touchend', ((e) => {
      e.preventDefault()
      if (this.touch && this.visible && this.valid){
        if (this.inSlot){
          return 
        }
        const x = e.changedTouches[0].clientX
        const y = e.changedTouches[0].clientY
  
        if (this.checkFigureInBox(x, y)){
          music.playShoot()
          if (databus.addToSlot(this)){
            this.inSlot = true
          }
        }
        this.touch = false
        this.width =  databus.boxWidth
        this.height =  databus.boxHeight
      }
    }))
  }

  // 每一帧更新box位置
  update() {
    if (this.move){
      if (Math.abs(this.x - this.tar_x) <= Math.abs(this.speed_x) || Math.abs(this.x - this.tar_x) <= 3){
        this.x = this.tar_x
      }
      else{
        this.x += this.speed_x
      }
      if (Math.abs(this.y - this.tar_y) <= Math.abs(this.speed_y) || Math.abs(this.y - this.tar_y) <= 3){
        this.y = this.tar_y
      }
      else{
        this.y += this.speed_y
      }

      if (this.x == this.tar_x && this.y == this.tar_y){
        this.move = false
        databus.boxMoveEnd(this)
      }
    }

    if (this.touch){
      this.width *=  BOX_ZOOM_SPEED
      this.height *=  BOX_ZOOM_SPEED

      if (this.width >= this.zoomWidth){
        this.width = this.zoomWidth
      }
      if (this.height >= this.zoomHeight){
        this.height = this.zoomHeight
      }
    }

    if (this.isRemove){
      if (!this.isPlaying){
        databus.removeBox(this)
        this.isRemove = false
      }
    }
  }

  remove() {
    this.playAnimation()
    this.isRemove = true
  }

  setTargetPos(xpos, ypos){
    this.move = true
    this.tar_x = xpos
    this.tar_y = ypos

    var ra = Math.sqrt(Math.pow(this.x - this.tar_x, 2) + Math.pow(this.y - this.tar_y, 2))
    this.speed_x = (this.tar_x - this.x) / ra * this[__.speed]
    this.speed_y = (this.tar_y - this.y) / ra * this[__.speed]
  }
  render(ctx) {
    if (this.isPlaying){
      this.aniRender(ctx)
    }
    else{
      this.drawToCanvas(ctx)
      if (!this.valid){
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }

  checkMask(box){
    return Math.abs(this.x - box.x) < this.width && Math.abs(this.y - box.y) < this.height && this.layer >= box.layer && this.index > box.index
  }
}
