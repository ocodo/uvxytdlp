import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon";
import { Modal } from "@/components/downloaded/modal";
import { OcodoLoaderIcon } from "@/components/ocodo-ui/ocodo-loader-icon";
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
    saveNote,
    noteLoading,
    noteSaving,
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
        {
          noteLoading &&
          <UvxYtdlpIcon />
        }
        {
          !noteLoading &&
          <textarea
            className="rounded border w-full p-4 max-h-100 h-100"
            rows={15}
            placeholder="Shared Notes..."
            value={tempNote}

            onKeyDown={
              (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  if (currentFile) {
                    saveNote();
                  }
                }
              }
            }

            onChange={
              (e) => setTempNote(e.currentTarget.value)
            }
          />
        }
        <div className="flex flex-row items-center justify-between">
          <div
            className={roundButtonClasses}
            onClick={() => {
              saveNote()
            }}
          >
            <SaveIcon className="h-6 w-6" style={thinIconStyle} />
          </div>
          {noteSaving &&
            <OcodoLoaderIcon
              className="w-8 h-8 animate-spin"
            />
          }
        </div>
      </div>
    </>
  </Modal>
}
