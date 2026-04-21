import { CircleX } from "lucide-react"
import { type Dispatch, type FC, type ReactNode, type SetStateAction } from "react"

export interface ModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>
  title?: ReactNode;
  children?: ReactNode;
}

export const Modal: FC<ModalProps> = ({ showModal, setShowModal, title, children }) => {

  if (!showModal) return

  return (
    <>
      <div className="backdrop-blur-lg w-screen h-screen fixed top-0 left-0">
      </div>
      <div className={`bg-card p-5 top-0 left-1/6 w-2/3 h-2/3 fixed drop-shadow-lg rounded-b-lg`}>
        <div className={`fixed top-5 right-5`}>
          <CircleX
            className={`stroke-1 cursor-pointer`}
            onClick={() => setShowModal(false)} />
        </div>
        <div className="flex flex-row gap-2 items-center justify-center">
          {title}
        </div>
        <div>
          {children}
        </div>
      </div>
    </>
  )
}
