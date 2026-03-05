import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";

const NoteList = () => {
  const notes = useQuery(api.notes.getNotes);
  const deleteNote = useMutation(api.notes.deleteNote);
  if (!notes || notes.length === 0)
    return (
      <p className="mx-auto container text-center capitalize font-semibold">
        please add some notes
      </p>
    );
  return (
    <div className="mt-2">
      {notes?.map((note) => (
        <div
          key={note._id}
          className="p-4 mb-4 bg-slate-100 dark:bg-slate-700 rounded flex justify-between items-center"
        >
          <span> {note.note}</span>
          <Button
            variant="destructive"
            onClick={() => deleteNote({ noteId: note._id })}
          >
            Delete{" "}
            <span>
              {" "}
              <Trash2Icon />{" "}
            </span>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
