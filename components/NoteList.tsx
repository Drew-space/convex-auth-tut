import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

const NoteList = () => {
  const notes = useQuery(api.notes.getNotes);

  return (
    <div className="mt-2">
      {notes?.map((note) => (
        <div
          key={note._id}
          className="p-4 mb-4 bg-slate-100 dark:bg-slate-700 rounded"
        >
          {note.note}
        </div>
      ))}
    </div>
  );
};

export default NoteList;
