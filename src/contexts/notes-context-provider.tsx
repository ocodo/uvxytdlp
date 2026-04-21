import type { DownloadedFileType } from '@/contexts/downloaded-context';
import { NotesContext } from '@/contexts/notes-context';
import { useEffect, useState } from 'react';
import type { Dispatch, FC, ReactNode, SetStateAction } from 'react';

export interface NotesContextType {
  currentFile: DownloadedFileType;
  setCurrentFile: Dispatch<SetStateAction<DownloadedFileType>>;
  showNotesModal: boolean;
  setShowNotesModal: Dispatch<SetStateAction<boolean>>
}

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: FC<NotesProviderProps> = ({ children }) => {
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<DownloadedFileType>({} as DownloadedFileType)

  return (
    <NotesContext.Provider value={{
      currentFile,
      setCurrentFile,
      showNotesModal,
      setShowNotesModal
    }}>
      {children}
    </NotesContext.Provider>
  )
};


