import { createAvatarAnims } from '../anims/AvatarAnims'
import OtherPlayer from '../avatars/OtherPlayer'
import Player from '../avatars/Player'
import Chair from '../items/Chair'
import Printer from '../items/Printer'
import Secretary from '../items/Secretary'
import WaterPurifier from '../items/WaterPurifier'
import ScreenBoard from '../items/ScreenBoard'
import { joinRoom, receiveChairId, seatedChair } from '../lib/ws'
import { ClientJoinRoom, ServerAvatarPosition } from '../../../types/socket'
import { AddOtherPlayerType, DisplayOtherPlayerChatType } from '../types/client'

export default class Game extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayersMap = new Map<string, OtherPlayer>()
  cursur?: Phaser.Types.Input.Keyboard.CursorKeys
  keySpace?: Phaser.Input.Keyboard.Key
  keyEscape?: Phaser.Input.Keyboard.Key
  overlap?: Phaser.Physics.Arcade.StaticGroup
  player!: Player
  roomNum!: string
  isCreate = false
  isColliding = false

  constructor() {
    // Scene Key
    super('game')
  }

  setUpKeys() {
    this.cursur = this.input.keyboard?.createCursorKeys()
    this.keySpace = this.input.keyboard?.addKey('space')
    this.keyEscape = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    )
    if (this.input.keyboard) {
      this.input.keyboard.disableGlobalCapture()
      this.input.keyboard.on('keydown-ENTER', () => {
        this.cursur?.left.reset()
        this.cursur?.right.reset()
        this.cursur?.up.reset()
        this.cursur?.down.reset()
        this.events.emit('onFocusChat')
      })
    }
  }

  enalbeKeys() {
    if (!this.input.keyboard) return
    this.input.keyboard.enabled = true
  }

  disableKeys() {
    if (!this.input.keyboard) return
    this.input.keyboard.enabled = false
  }

  // Scene이 로드될 때 한번 호출, 게임 오브젝트 배치
  create() {
    // 타일맵 로드
    this.map = this.make.tilemap({ key: 'tilemap' })
    // 타일셋 이미지를 로드하여 타일맵에 추가
    const FloorAndWall = this.map.addTilesetImage(
      'floorAndWall',
      'floorAndWall',
    )
    const Office = this.map.addTilesetImage('office', 'office')

    // Ground Layer
    const groundLayer = this.map.createLayer('Ground', FloorAndWall!)

    // ChairToDown Layer
    const chairToDown = this.physics.add.staticGroup({ classType: Chair })
    const chairToDownLayer = this.map.getObjectLayer('ChairToDown')
    this.createObjectLayer(chairToDown, chairToDownLayer, 900)

    // Secretary Layer
    const secretary = this.physics.add.staticGroup({ classType: Secretary })
    const secretaryLayer = this.map.getObjectLayer('Secretary')
    this.createObjectLayer(secretary, secretaryLayer, 900)

    // WaterPurifier Layer
    const waterPurifier = this.physics.add.staticGroup({
      classType: WaterPurifier,
    })
    const waterPurifierLayer = this.map.getObjectLayer('WaterPurifier')
    this.createObjectLayer(waterPurifier, waterPurifierLayer, 900)

    // Printer Layer
    const printer = this.physics.add.staticGroup({ classType: Printer })
    const printerLayer = this.map.getObjectLayer('Printer')
    this.createObjectLayer(printer, printerLayer, 900)

    // OtherPlayers Layer
    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    // Player Layer + 플레이어 생성
    createAvatarAnims(this.anims)
    this.player = new Player(this, -1000, -1000, 'conference')
    this.add.existing(this.player)

    // Camera Setting
    this.cameras.main.zoom = 1.4
    this.cameras.main.startFollow(this.player, true)

    // ChairToUp Layer
    const chairToUp = this.physics.add.staticGroup({ classType: Chair })
    const chairToUpLayer = this.map.getObjectLayer('ChairToUp')
    this.createObjectLayer(chairToUp, chairToUpLayer, 2000)

    // Overlap Layer
    const overlap = this.physics.add.staticGroup()
    const overlapLayer = this.map.getObjectLayer('Overlap')
    this.createObjectLayer(overlap, overlapLayer, 900)
    this.overlap = overlap

    // ScreenBoard Layer
    const screenBoard = this.physics.add.staticGroup({ classType: ScreenBoard })
    const screenBoardLayer = this.map.getObjectLayer('ScreenBoard')
    this.createObjectLayer(screenBoard, screenBoardLayer, 900)

    // InteriorCollide Layer
    const interiorCollide = this.physics.add.staticGroup()
    const interiorCollideLayer = this.map.getObjectLayer('InteriorCollide')
    this.createObjectLayer(interiorCollide, interiorCollideLayer, 900)

    // Etc Layer
    const interiorLayer = this.map.createLayer('Etc', [Office!])
    interiorLayer?.setDepth(1000)

    // 플레이어와 물체 간의 충돌처리
    if (this.player) {
      // this.physics.add.collider(this.player.avatar, secretary)
      this.physics.add.collider(this.player, [interiorCollide])
    }

    // 타일맵 레이어에서 특정 속성을 가진 타일들에 대해 충돌처리 활성화 (collide 속성을 가진 모들 타일에 충돌 활성화)
    this.physics.add.collider(groundLayer!, this.player)
    groundLayer?.setCollisionByProperty({ collide: true })

    this.physics.add.collider(
      this.player,
      [secretary, chairToDown, chairToUp, waterPurifier, printer, screenBoard],
      this.handlePlayerCollider,
      undefined,
      this,
    )

    this.physics.add.overlap(
      this.player,
      [overlap],
      (player: any, overlapItem: any) => {
        this.player.setDepth(500)
      },
      undefined,
      this,
    )

    this.events.once('update', () => {
      this.isCreate = true
      this.events.emit('createGame', this.isCreate)
    })
  }

  /** 플레이어와 오브젝트가 충돌했을 때 발생하는 콜백 함수. Player와 Object를 인수로 받음 */
  private handlePlayerCollider(player: any, interactionItem: any) {
    console.log('충돌!!')

    if (this.player.selectedInteractionItem) return

    if (
      this.player.behavior === 'sit' &&
      interactionItem.interaction === 'menual'
    ) {
      player.isFrontOfCeoDesk = true
    } else if (
      this.player.behavior === 'sit' &&
      interactionItem.interaction === 'interview'
    ) {
      player.isFrontOfInterviewDesk = true
    }

    if (
      interactionItem.id &&
      seatedChair.includes(interactionItem.id.toString())
    )
      return
    player.isCollide = true
    player.selectedInteractionItem = interactionItem
    interactionItem.onInteractionBox()

    console.log(player.isCollide)
    console.log('끝')
  }

  /** 레이어 생성하기 위한 함수로 Group, Layer, Depth를 인수로 받음 */
  private createObjectLayer(
    group: Phaser.Physics.Arcade.StaticGroup,
    layer: Phaser.Tilemaps.ObjectLayer | null,
    depth: number,
  ) {
    layer?.objects.forEach((object) => {
      // Tiled Map에서 Object properties에 꼭 type = '사용에셋' 추가하세요..
      const properties =
        (object.properties[2] && object.properties[2].value) ||
        object.properties[0].value
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5

      const firstgid = this.map.getTileset(properties)?.firstgid
      const obj = group.get(
        actualX,
        actualY,
        properties,
        object.gid! - firstgid!,
      )

      obj.setDepth(depth)
      return obj
    })
  }

  /** 방에 입장 */
  joinRoom({ roomNum, authCookie }: ClientJoinRoom) {
    if (!this.player) return

    joinRoom({ roomNum, authCookie })
    this.player.setNickname(authCookie.nickName)
    this.player.setAvatarTexture(authCookie.texture)
    this.player.sendPlayerInfo(roomNum)
    this.roomNum = roomNum

    this.player.setPosition(
      authCookie.role === 'host' ? 260 : 720,
      authCookie.role === 'host' ? 520 : 170,
    )

    this.setUpKeys()

    receiveChairId()
  }

  /** 다른 플레이어 입장 */
  addOtherPlayer({
    x,
    y,
    nickName,
    texture,
    animation,
    socketId,
  }: AddOtherPlayerType) {
    if (!socketId) return

    const newPlayer = new OtherPlayer(this, x, y, texture, nickName)
    newPlayer.anims.play(animation || `${texture}_stand_down`, true)
    newPlayer.setDepth(900)
    this.add.existing(newPlayer)

    this.otherPlayers.add(newPlayer)
    this.otherPlayersMap.set(socketId, newPlayer)
  }

  /** 다른 플레이어 퇴장 */
  removeOtherPlayer(socketId: string) {
    if (!socketId) return
    const otherPlayer = this.otherPlayersMap.get(socketId)

    if (!this.otherPlayersMap.has(socketId)) return
    if (!otherPlayer) return

    this.otherPlayers.remove(otherPlayer, true, true)
    this.otherPlayersMap.delete(socketId)
  }

  /** 다른 유저들 위치 정보 업데이트 */
  updateOtherPlayer({ x, y, socketId, animation }: ServerAvatarPosition) {
    const otherPlayer = this.otherPlayersMap.get(socketId)
    if (!otherPlayer) return
    otherPlayer?.updatePosition({ x, y, animation })
  }

  /** 다른 유저 채팅을 화면에 표시  */
  displayOtherPlayerChat({ message, socketId }: DisplayOtherPlayerChatType) {
    const otherPlayer = this.otherPlayersMap.get(socketId)
    otherPlayer?.updateChat(message)
  }

  // 주로 게임 상태를 업데이트하고 게임 객체들의 상태를 조작하는 데 사용. 게임이 실행되는 동안 지속적으로 호출됨
  update() {
    if (
      this.player &&
      this.cursur &&
      this.keySpace &&
      this.keyEscape &&
      this.roomNum
    ) {
      this.player.update(
        this.cursur,
        this.keySpace,
        this.keyEscape,
        this.roomNum,
      )
    }
    if (!this.physics.overlap(this.player, this.overlap)) {
      this.player.setDepth(1000)
    }
  }
}
