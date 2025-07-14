export function generateSummary(content: string, title: string): string {
  // Static logic for AI summarization simulation
  const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 20);
  
  if (sentences.length === 0) {
    return "Unable to generate summary from the provided content.";
  }

  // Extract key sentences based on simple heuristics
  const keySentences: string[] = [];
  
  // Add the first sentence if it's substantial
  if (sentences[0] && sentences[0].trim().length > 30) {
    keySentences.push(sentences[0].trim());
  }

  // Look for sentences with key indicator words
  const keyWords = [
    'important', 'significant', 'crucial', 'essential', 'fundamental',
    'key', 'main', 'primary', 'central', 'critical', 'major',
    'however', 'therefore', 'consequently', 'as a result', 'in conclusion',
    'furthermore', 'moreover', 'additionally', 'specifically', 'particularly'
  ];

  for (const sentence of sentences.slice(1)) {
    const lowerSentence = sentence.toLowerCase();
    const hasKeyWords = keyWords.some(word => lowerSentence.includes(word));
    const isSubstantial = sentence.trim().length > 50;
    
    if ((hasKeyWords || isSubstantial) && keySentences.length < 4) {
      keySentences.push(sentence.trim());
    }
  }

  // If we don't have enough key sentences, add some from the middle and end
  if (keySentences.length < 3) {
    const midIndex = Math.floor(sentences.length / 2);
    const endIndex = sentences.length - 1;
    
    if (sentences[midIndex] && keySentences.length < 3) {
      keySentences.push(sentences[midIndex].trim());
    }
    
    if (sentences[endIndex] && keySentences.length < 3) {
      keySentences.push(sentences[endIndex].trim());
    }
  }

  // Create a coherent summary
  let summary = keySentences.join('. ');
  
  // Ensure proper sentence ending
  if (!summary.match(/[.!?]$/)) {
    summary += '.';
  }

  // Limit summary length
  if (summary.length > 500) {
    summary = summary.substring(0, 497) + '...';
  }

  return summary || "This article discusses various aspects of the topic presented in the title.";
}
