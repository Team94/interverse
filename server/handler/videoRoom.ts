import { Socket } from 'socket.io'
import { videoRoom } from '..'
import { ClientToServerEvents, ServerToClientEvents } from '../../types/socket'

interface JoinVideoRoomType {
  roomNum: string
  peerId: string
  nickName: string
}

export const videoRoomHandler = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  io: any,
) => {
  const createVideoRoom = (roomNum: string) => {
    videoRoom[roomNum] = videoRoom[roomNum] || {}
    socket.emit('serverCreateVideoRoom', roomNum)
  }

  const joinVideoRoom = ({ roomNum, peerId, nickName }: JoinVideoRoomType) => {
    if (!peerId) return
    if (!videoRoom[roomNum]) videoRoom[roomNum] = {}
    if (videoRoom[roomNum][socket.id]) return
    if (Object.keys(videoRoom[roomNum]).length >= 7) return

    videoRoom[roomNum][socket.id] = {
      peerId,
      socketId: socket.id,
      nickName,
    }
    socket.join(`${roomNum}_video`)

    socket.broadcast
      .to(`${roomNum}_video`)
      .emit('serverJoinVideoRoom', { peerId, socketId: socket.id, nickName })
  }

  const leaveVideoRoom = () => {
    const rooms = Array.from(socket.rooms)
    if (rooms.length === 3) {
      io.to(socket.id).emit('serverLeaveVideoRoom')
      socket.broadcast
        .to(rooms[1])
        .emit('serverUpdateVideoRoomMember', socket.id)

      delete videoRoom[rooms[1]][socket.id]
    }
  }

  socket.on('clientCreateVideoRoom', createVideoRoom)
  socket.on('clientJoinVideoRoom', joinVideoRoom)
  socket.on('clientLeaveVideoRoom', leaveVideoRoom)
}
