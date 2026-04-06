import { ConvexError, v } from "convex/values";
import {
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components, internal } from "./_generated/api";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  createNotes: { kind: "fixed window", rate: 1, period: MINUTE },
});

export const createNotes = mutation({
  args: { note: v.string() },
  handler: async (ctx, args) => {
    const note = args.note.trim();

    if (!note) {
      throw new Error("Note cannot be empty");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const { ok } = await rateLimiter.limit(ctx, "createNotes", {
      key: userId,
      throws: false,
    });

    if (!ok) {
      throw new ConvexError("Too many attempts. Please wait a minute.");
    }

    await ctx.db.insert("notes", {
      userId,
      note: args.note,
    });

    await ctx.scheduler.runAfter(0, internal.notes.createNotesFile, {
      note: args.note,
    });
  },
});

export const getNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.noteId);
  },
});

export const deleteAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    await Promise.all(notes.map((note) => ctx.db.delete(note._id)));
  },
});

export const createNotesFile = internalAction({
  args: { note: v.string() },

  handler: async (ctx, args) => {
    await ctx.storage.store(new Blob([args.note]));
  },
});
