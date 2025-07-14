import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const blogSummaries = pgTable("blog_summaries", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  englishSummary: text("english_summary").notNull(),
  urduSummary: text("urdu_summary").notNull(),
  fullText: text("full_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBlogSummarySchema = createInsertSchema(blogSummaries).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BlogSummary = typeof blogSummaries.$inferSelect;
export type InsertBlogSummary = z.infer<typeof insertBlogSummarySchema>;
