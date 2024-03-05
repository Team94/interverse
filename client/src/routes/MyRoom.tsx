import { useNavigate } from 'react-router-dom'
import { getCookie, removeCookie } from '../utils/cookie'
import { useAppDispatch } from '../store/store'
import { changeModalContent } from '../store/features/modalContentSlice'
import { closeModal, openModal } from '../store/features/modalDisplaySlice'
import gifAvatarRun from '/gif/avatar_run.gif'

function MyRoom() {
  const navigate = useNavigate()
  const adminCookie = getCookie('interverse_admin')
  const dispatch = useAppDispatch()

  const onEnter = () => {
    navigate(adminCookie.path)
  }

  const onDelete = () => {
    dispatch(
      changeModalContent({
        title: '삭제하기',
        description: '정말 방을 삭제하시겠습니까?',
        action: () => {
          removeCookie('interverse_admin')
          dispatch(closeModal())
          navigate('/')
        },
        actionLabel: '삭제',
      }),
    )
    dispatch(openModal())
  }

  return (
    <div className="flex w-[360px] flex-col items-center gap-4 rounded-3xl bg-gray-300 p-8">
      <div className="relative w-full overflow-hidden rounded-md bg-black">
        <div className='h-[180px] w-[2000px] bg-[url("/images/background.png")] bg-right bg-repeat-x' />
        <div className="absolute bottom-3 flex w-full items-center justify-evenly">
          <img src={gifAvatarRun} alt="GIF" width={70} />
        </div>
      </div>
      <button
        onClick={onEnter}
        className="h-[50px] w-full rounded-md bg-purple-600 text-white duration-200 hover:bg-purple-700"
      >
        입장하기
      </button>
      <button
        onClick={onDelete}
        className="h-[50px] w-full rounded-md bg-white text-red-600"
      >
        제거하기
      </button>
    </div>
  )
}

export default MyRoom
