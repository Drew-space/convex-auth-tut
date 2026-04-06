import React, { use } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const NotesForm = () => {
  const createNote = useMutation(api.notes.createNotes);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const note = (formData.get("note") as string).trim();

        if (!note) {
          toast.warning("Note cannot be empty", {
            position: "top-right",
            style: {
              border: "px solid red",
              color: "#fb2c36",
            },
          });
          return;
        }

        try {
          await createNote({ note });
          form.reset();
        } catch (error) {
          const message =
            error instanceof ConvexError
              ? (error.data as string)
              : "Something went wrong. Please try again.";

          toast.error(message, {
            style: {
              border: "px solid red",
              color: "#fb2c36",
            },
          });
        }
      }}
    >
      <Input
        type="text"
        name="note"
        placeholder="Enter your note here"
        className="mb-4"
      />

      <Button
        className="bg-blue-500 hover:bg-blue-600 max-sm:mt-2 "
        type="submit"
      >
        Add Note
      </Button>
    </form>
  );
};

export default NotesForm;
