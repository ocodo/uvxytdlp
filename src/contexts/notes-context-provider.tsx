import { useApiBase } from '@/contexts/api-base-context';
import type { DownloadedFileType } from '@/contexts/downloaded-context';
import { NotesContext } from '@/contexts/notes-context';
import { useState } from 'react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

export interface NotesContextType {
  currentFile: DownloadedFileType | undefined;
  setCurrentFile: Dispatch<SetStateAction<DownloadedFileType | undefined>>;
  showNotesModal: boolean;
  setShowNotesModal: Dispatch<SetStateAction<boolean>>;
  saveNote: () => Promise<void>;
  tempNote: string | undefined;
  setTempNote: Dispatch<SetStateAction<string | undefined>>;
}

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: FC<NotesProviderProps> = ({ children }) => {
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<DownloadedFileType | undefined>(undefined)
  const [tempNote, setTempNote] = useState<string | undefined>(undefined);

  const { apiBase } = useApiBase()

  const saveNote = async () => {
    if (currentFile) {
      await fetch(
        `${apiBase}/note`,
        {
          method: 'POST',
          body: JSON.stringify({ name: currentFile.name, note: tempNote }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  }

  return (
    <NotesContext.Provider value={{
      currentFile,
      setCurrentFile,
      showNotesModal,
      setShowNotesModal,
      saveNote,
      setTempNote,
      tempNote,
    }}>
      {children}
    </NotesContext.Provider>
  )
};


