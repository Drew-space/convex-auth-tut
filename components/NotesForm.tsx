import React, { use } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

const NotesForm = () => {
  const createNote = useMutation(api.notes.createNotes);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const note = formData.get("note") as string;
        void createNote({ note });
        form.reset();
      }}
    >
      <Input
        type="text"
        name="note"
        placeholder="Enter your note here"
        className="mb-4"
      />

      <Button variant="default" type="submit">
        Add Note
      </Button>
    </form>
  );
};

export default NotesForm;
