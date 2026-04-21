import type { NotesContextType } from "@/contexts/notes-context-provider";
import { createContext, useContext } from "react";

export const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within an NotesProvider');
  }
  return context;
};
