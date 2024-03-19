import Peer from 'peerjs'

export const peer = new Peer({
  host: import.meta.env.VITE_PEER,
  secure: true,
  port: 443,
})

export const getMedia = () => {
  // if (isScreenSharing) {
  //   return navigator.mediaDevices.getDisplayMedia({
  //     video: true,
  //     audio: true,
  //   })
  // } else {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
      echoCancellation: true, // 에코 캔슬링 활성화
      noiseSuppression: true, // 노이즈 캔슬링 활성화
    },
  })
  // }
}
