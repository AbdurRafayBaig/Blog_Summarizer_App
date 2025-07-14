import { load } from "cheerio";

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
}

export async function scrapeBlogContent(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove();

    // Try to find the main content area
    let title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                'Untitled Article';

    // Extract main content from common article selectors
    let content = '';
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content', 
      '.article-content',
      '.content',
      'main',
      '.main-content',
      '[role="main"]'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback to body content if no specific content area found
    if (!content) {
      content = $('body').text().trim();
    }

    // Clean up whitespace and normalize
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    if (!content || content.length < 100) {
      throw new Error('Unable to extract meaningful content from the webpage');
    }

    return {
      title: title.substring(0, 200), // Limit title length
      content: content.substring(0, 10000), // Limit content length
      url
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to scrape content: ${error.message}`);
    }
    throw new Error('Failed to scrape content: Unknown error');
  }
}
