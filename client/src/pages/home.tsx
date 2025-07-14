import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Brain, Link, Search, Calendar, Copy, ExternalLink, FileText, Loader2, Globe, Languages, Sparkles, BookOpen, BarChart3, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogSummary } from "@shared/schema";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type UrlForm = z.infer<typeof urlSchema>;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const { toast } = useToast();

  const form = useForm<UrlForm>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  });

  // Fetch summaries
  const { data: summaries = [], isLoading: isLoadingSummaries } = useQuery<BlogSummary[]>({
    queryKey: ["/api/summaries"],
  });

  // Search summaries when query changes
  const { data: searchResults = [], isLoading: isSearching } = useQuery<BlogSummary[]>({
    queryKey: ["/api/summaries/search", searchQuery],
    enabled: searchQuery.trim().length > 0,
  });

  // Analyze blog mutation
  const analyzeMutation = useMutation({
    mutationFn: async (data: UrlForm) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Blog analyzed and summary generated successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/summaries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to analyze blog",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UrlForm) => {
    analyzeMutation.mutate(data);
  };

  const handleClear = () => {
    form.reset();
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Summary copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  // Filter summaries based on search and language
  const displaySummaries = searchQuery.trim().length > 0 ? searchResults : summaries;
  const filteredSummaries = displaySummaries.filter((summary) => {
    if (languageFilter === "english") {
      return summary.englishSummary.length > 0;
    }
    if (languageFilter === "urdu") {
      return summary.urduSummary.length > 0;
    }
    return true; // all
  });

  const isLoading = isLoadingSummaries || isSearching;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Blog Summariser</h1>
                <p className="text-xs text-gray-500">AI-Powered Analysis & Translation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <Sparkles className="text-yellow-500" size={16} />
                <span>Smart Translation</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Globe className="text-white" size={16} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Transform Any Blog Into
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Smart Summaries</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get instant AI-powered summaries in English and Urdu. Perfect for research, content curation, and multilingual understanding.
          </p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">Smart content extraction and summarization using advanced algorithms</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Languages className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dual Language</h3>
              <p className="text-gray-600 text-sm">Automatic translation to Urdu for broader accessibility</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Storage</h3>
              <p className="text-gray-600 text-sm">Save and search through your analyzed content library</p>
            </div>
          </div>
        </div>

        {/* Blog URL Input */}
        <div className="mb-12">
          <Card className="border-blue-200 shadow-xl bg-gradient-to-r from-white to-blue-50">
            <CardContent className="p-8">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Analysis</h3>
                  <p className="text-gray-600">Paste any blog URL below and watch the magic happen</p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Link className="text-gray-400" size={20} />
                              </div>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://medium.com/article-link or any blog URL..."
                                className="pl-12 py-4 text-lg border-2 border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white/70 backdrop-blur-sm"
                                disabled={analyzeMutation.isPending}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={analyzeMutation.isPending}
                      >
                        {analyzeMutation.isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-3" />
                            Analyzing Blog...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-3" size={20} />
                            Analyze & Summarize
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        disabled={analyzeMutation.isPending}
                        className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 rounded-xl text-gray-600 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Content Library</h3>
              <p className="text-gray-600">Search and manage your analyzed blog summaries</p>
            </div>
            
            {!isLoading && filteredSummaries.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <BarChart3 size={16} />
                <span>{filteredSummaries.length} {filteredSummaries.length === 1 ? 'summary' : 'summaries'}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={18} />
              </div>
              <Input
                type="text"
                placeholder="Search by title, content, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white"
              />
            </div>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-48 py-3 border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English Only</SelectItem>
                <SelectItem value="urdu">Urdu Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-gray-200 shadow-lg">
                <CardContent className="p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSummaries.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {searchQuery ? (
                <Search className="text-blue-500" size={32} />
              ) : (
                <FileText className="text-purple-500" size={32} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery ? "No summaries found" : "Ready to start?"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms or language filter to find what you're looking for"
                : "Paste any blog URL above and get your first AI-powered summary in seconds"
              }
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>~30 seconds</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Languages size={16} />
                  <span>Dual language</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain size={16} />
                  <span>AI-powered</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summaries Grid */}
        {!isLoading && filteredSummaries.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSummaries.map((summary) => (
              <Card key={summary.id} className="border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 line-clamp-2 mb-3 text-lg">
                        {summary.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(summary.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>Just now</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                        EN
                      </Badge>
                      <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                        UR
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <label className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center space-x-1 mb-2">
                        <Globe size={12} />
                        <span>English Summary</span>
                      </label>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {summary.englishSummary}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <label className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center space-x-1 mb-2">
                        <Languages size={12} />
                        <span>Urdu Summary</span>
                      </label>
                      <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed font-urdu" dir="rtl">
                        {summary.urduSummary}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <a
                      href={summary.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-[200px] font-medium flex items-center space-x-1"
                    >
                      <ExternalLink size={12} />
                      <span>{new URL(summary.url).hostname}</span>
                    </a>
                    
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(`English: ${summary.englishSummary}\n\nUrdu: ${summary.urduSummary}`)}
                        className="p-2 h-auto border-gray-300 hover:border-blue-500 hover:text-blue-600"
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="p-2 h-auto border-gray-300 hover:border-purple-500 hover:text-purple-600"
                      >
                        <a href={summary.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-16 text-center py-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="text-white" size={16} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Blog Summariser</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Transform any blog into smart, bilingual summaries with AI-powered analysis
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Brain size={14} />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-1">
                <Languages size={14} />
                <span>Multilingual</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
