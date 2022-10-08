export default class Layer {
  constructor(index, map, xNum, yNum) {
    this.map = map
    this.boxs = []
    this.xNum = xNum
    this.yNum = yNum
    this.index = index
  }

  push(box){
    var flag = false
    if (this.boxs.length < this.map.length){
      this.boxs.push(box)
      flag = true
    }

    return flag
  }

  pop(box){
    var index = box.index
    if (index >= 0 && index < this.boxs.length){
      return this.boxs.splice(index, 1)
    }
    return null
  }

  getX(box){
    var index = box.index
    if (index >= 0 && index < this.boxs.length){
      return Math.floor(this.map[index] % this.xNum)
    }
    return 0
  }
  getY(box){
    var index = box.index
    if (index >= 0 && index < this.boxs.length){
      return Math.floor(this.map[index] / this.xNum)
    }
    return 0
  }
  mapSize(){
    return this.map.length
  }
}