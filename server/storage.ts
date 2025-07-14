import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, or, ilike } from "drizzle-orm";
import { blogSummaries, type BlogSummary, type InsertBlogSummary, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBlogSummary(summary: InsertBlogSummary): Promise<BlogSummary>;
  getBlogSummaries(): Promise<BlogSummary[]>;
  searchBlogSummaries(query: string): Promise<BlogSummary[]>;
  getBlogSummaryByUrl(url: string): Promise<BlogSummary | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createBlogSummary(insertSummary: InsertBlogSummary): Promise<BlogSummary> {
    const result = await this.db.insert(blogSummaries).values(insertSummary).returning();
    return result[0];
  }

  async getBlogSummaries(): Promise<BlogSummary[]> {
    return await this.db.select().from(blogSummaries).orderBy(desc(blogSummaries.createdAt));
  }

  async searchBlogSummaries(query: string): Promise<BlogSummary[]> {
    return await this.db.select()
      .from(blogSummaries)
      .where(or(
        ilike(blogSummaries.title, `%${query}%`),
        ilike(blogSummaries.englishSummary, `%${query}%`),
        ilike(blogSummaries.urduSummary, `%${query}%`)
      ))
      .orderBy(desc(blogSummaries.createdAt));
  }

  async getBlogSummaryByUrl(url: string): Promise<BlogSummary | undefined> {
    const result = await this.db.select().from(blogSummaries).where(eq(blogSummaries.url, url)).limit(1);
    return result[0];
  }
}

// In-memory storage implementation for development/testing
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private summaries: Map<number, BlogSummary>;
  private currentUserId: number;
  private currentSummaryId: number;

  constructor() {
    this.users = new Map();
    this.summaries = new Map();
    this.currentUserId = 1;
    this.currentSummaryId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBlogSummary(insertSummary: InsertBlogSummary): Promise<BlogSummary> {
    const id = this.currentSummaryId++;
    const summary: BlogSummary = {
      ...insertSummary,
      id,
      createdAt: new Date(),
    };
    this.summaries.set(id, summary);
    return summary;
  }

  async getBlogSummaries(): Promise<BlogSummary[]> {
    return Array.from(this.summaries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async searchBlogSummaries(query: string): Promise<BlogSummary[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.summaries.values())
      .filter(
        (summary) =>
          summary.title.toLowerCase().includes(lowerQuery) ||
          summary.englishSummary.toLowerCase().includes(lowerQuery) ||
          summary.urduSummary.includes(query)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBlogSummaryByUrl(url: string): Promise<BlogSummary | undefined> {
    return Array.from(this.summaries.values()).find(
      (summary) => summary.url === url
    );
  }
}

// Use memory storage for now (database connection issues)
// TODO: Switch back to DatabaseStorage once database is properly configured
export const storage = new MemStorage();
