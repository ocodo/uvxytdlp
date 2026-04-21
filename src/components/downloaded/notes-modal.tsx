import { Modal } from "@/components/downloaded/modal";
import { useNotes } from "@/contexts/notes-context";
import { roundButtonClasses, thinIconStyle } from "@/lib/style";
import { SaveIcon } from "lucide-react";
import type { FC } from "react";

export const NotesModal: FC = () => {

  const {
    currentFile,
    showNotesModal,
    setShowNotesModal,
    tempNote,
    setTempNote,
    saveNote
  } = useNotes();

  return <Modal
    showModal={showNotesModal}
    setShowModal={setShowNotesModal}
    title={
      <div className="text-2xl font-black tracking-tighter">Notes</div>
    }
  >
    <>
      <div className="flex flex-col gap-2">
        <div className="text-xl">{currentFile?.name}</div>
        <textarea
          className="rounded border w-full p-4 max-h-100 h-100"
          rows={15}
          placeholder="Shared Notes..."
          value={tempNote}
          onChange={(e) => setTempNote(e.currentTarget.value)}
        >
        </textarea>
        <div className="flex flex-row items-center justify-between">
          <div
            className={roundButtonClasses}
            onClick={() => {
              saveNote()
            }}
          >
            <SaveIcon className="h-6 w-6" style={thinIconStyle} />
          </div>
        </div>
      </div>
    </>
  </Modal>
}
