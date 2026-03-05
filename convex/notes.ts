import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const rateLimiter = new RateLimiter(components.rateLimiter, {
  createNotes: { kind: "fixed window", rate: 100, period: MINUTE },
});

export const createNotes = mutation({
  args: { note: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await rateLimiter.limit(ctx, "createNotes", { key: userId, throws: true });

    await ctx.db.insert("notes", {
      userId,
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
    return await ctx.db.query("notes").collect();
  },
});

export const deleteAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    await Promise.all(notes.map((note) => ctx.db.delete(note._id)));
  },
});
