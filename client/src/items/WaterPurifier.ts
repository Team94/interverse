import Item from './Item'

export default class WaterPurifier extends Item {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame)

    this.itemType = 'waterPurifier'
  }

  onInteractionBox() {
    this.setInteractionBox('긴장될 때는 물을 한 잔 마셔보세요!💧')
  }
}
