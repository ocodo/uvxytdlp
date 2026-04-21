import { Modal } from "@/components/downloaded/modal";
import { useNotes } from "@/contexts/notes-context";
import { useEffect, type FC } from "react";

export const NotesModal: FC = () => {

  const {
    currentFile,
    showNotesModal,
    setShowNotesModal
  } = useNotes();

  useEffect(() => {

    console.log('notes modal')
    console.log(showNotesModal)

  }, [showNotesModal])

  return <Modal
    showModal={showNotesModal}
    setShowModal={setShowNotesModal}
    title={
      <div className="text-2xl font-black tracking-tighter">Notes</div>
    }
  >
    <>
      <div className="flex flex-col gap-2">
        <div>id: {currentFile.id}</div>
        <div>name: {currentFile.name}</div>
        <div>title: {currentFile.title}</div>
      </div>
    </>
  </Modal>
}
