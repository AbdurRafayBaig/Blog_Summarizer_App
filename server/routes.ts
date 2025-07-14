import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapeBlogContent } from "./services/scraper";
import { generateSummary } from "./services/summarizer";
import { translateToUrdu } from "./services/translator";
import { insertBlogSummarySchema } from "@shared/schema";
import { z } from "zod";

const analyzeUrlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

const searchSchema = z.object({
  query: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Analyze blog URL
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url } = analyzeUrlSchema.parse(req.body);
      
      // Check if already analyzed
      const existing = await storage.getBlogSummaryByUrl(url);
      if (existing) {
        return res.json(existing);
      }
      
      // Scrape content
      const scrapedContent = await scrapeBlogContent(url);
      
      // Generate English summary
      const englishSummary = generateSummary(scrapedContent.content, scrapedContent.title);
      
      // Translate to Urdu
      const urduSummary = translateToUrdu(englishSummary);
      
      // Save to storage
      const summary = await storage.createBlogSummary({
        url: scrapedContent.url,
        title: scrapedContent.title,
        englishSummary,
        urduSummary,
        fullText: scrapedContent.content,
      });
      
      res.json(summary);
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      
      const message = error instanceof Error ? error.message : "Failed to analyze blog";
      res.status(500).json({ message });
    }
  });
  
  // Get all summaries
  app.get("/api/summaries", async (req, res) => {
    try {
      const summaries = await storage.getBlogSummaries();
      res.json(summaries);
    } catch (error) {
      console.error("Get summaries error:", error);
      res.status(500).json({ message: "Failed to fetch summaries" });
    }
  });
  
  // Search summaries
  app.get("/api/summaries/search", async (req, res) => {
    try {
      const { query } = searchSchema.parse(req.query);
      
      if (!query || query.trim() === "") {
        const summaries = await storage.getBlogSummaries();
        return res.json(summaries);
      }
      
      const summaries = await storage.searchBlogSummaries(query.trim());
      res.json(summaries);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search summaries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
