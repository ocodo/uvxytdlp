import { useYtdlpContext } from "@/contexts/ytdlp-context"
import { CircleX } from "lucide-react"

export const DowloadQueueModal = () => {
  const { showQueueInput, setShowQueueInput } = useYtdlpContext()

  if (!showQueueInput) {
    return
  }
  return (
    showQueueInput &&
    <>
      <div className="backdrop-blur-lg w-screen h-screen fixed top-0 left-0">
      </div>
      <div className={`bg-card p-5 top-0 left-1/6 w-2/3 h-2/3 fixed drop-shadow-lg rounded-b-lg`}>
        <div className={`flex flex-row items-center justify-between`}>
          <div className={`text-3xl font-black tracking-tighter`}>Download Queue</div>
          <CircleX
            className={`stroke-1 cursor-pointer`}
            onClick={() => setShowQueueInput(false)} />
        </div>
      </div>
    </>
  )

}
