import { useApiBase } from '@/contexts/api-base-context';
import type { DownloadedFileType } from '@/contexts/downloaded-context';
import { NotesContext } from '@/contexts/notes-context';
import { useEffect, useState } from 'react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { toast } from 'sonner';

export interface NotesContextType {
  currentFile: DownloadedFileType | undefined;
  setCurrentFile: Dispatch<SetStateAction<DownloadedFileType | undefined>>;
  showNotesModal: boolean;
  setShowNotesModal: Dispatch<SetStateAction<boolean>>;
  saveNote: () => Promise<void>;
  tempNote: string | undefined;
  setTempNote: Dispatch<SetStateAction<string | undefined>>;
  getNote: () => Promise<void>;
  noteLoading: boolean;
  setNoteLoading: Dispatch<SetStateAction<boolean>>;
  noteSaving: boolean;
  setNoteSaving: Dispatch<SetStateAction<boolean>>;
}

interface NotesProviderProps {
  children: ReactNode;
}

interface SavedNote {
  note: string;
  name: string;
}

export const NotesProvider: FC<NotesProviderProps> = ({ children }) => {
  const { apiBase } = useApiBase()

  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [noteLoading, setNoteLoading] = useState<boolean>(false);
  const [noteSaving, setNoteSaving] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<DownloadedFileType | undefined>(undefined)
  const [tempNote, setTempNote] = useState<string | undefined>(undefined);

  const saveNote = async () => {
    if (currentFile) {
      setNoteSaving(true);
      const response = await fetch(
        `${apiBase}/note`,
        {
          method: 'POST',
          body: JSON.stringify({ name: currentFile.name, note: tempNote }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (response.ok) {
        toast(`Saved note for ${currentFile.name}`)
      }
      setNoteSaving(false);
    }
  }

  const getNote = async () => {
    if (currentFile) {
      setNoteLoading(true);
      const response = await fetch(
        `${apiBase}/note/${currentFile.name}`
      )
      if (response.ok) {
        const json: SavedNote = await response.json()
        setTempNote(json.note)
        setNoteLoading(false);
        return
      }
      setNoteLoading(false);
      toast(`Error fetching note for ${currentFile.name}`)
    }
  }

  useEffect(() => {
    if (showNotesModal) {
      setTempNote(undefined);
    }
    return
  }, [showNotesModal]);

  useEffect(() => {
    if (!showNotesModal || !currentFile) return;
    getNote();
    return
  }, [showNotesModal, currentFile?.name]);

  return (
    <NotesContext.Provider value={{
      currentFile,
      setCurrentFile,
      showNotesModal,
      setShowNotesModal,
      saveNote,
      getNote,
      noteLoading,
      setNoteLoading,
      noteSaving,
      setNoteSaving,
      tempNote,
      setTempNote,
    }}>
      {children}
    </NotesContext.Provider>
  )
};


