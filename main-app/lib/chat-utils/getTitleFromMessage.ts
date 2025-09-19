export const getTitleFromMessage = (message: string): string => {
  // Extract title using the **TITLE:** format
  const titleMatch = message.match(/\*\*TITLE:\*\*\s*(.+?)(?:\n|\*\*|$)/i);
  
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  
  // Fallback: try to extract from markdown headers (## Title)
  const markdownTitleMatch = message.match(/^##\s*(.+?)$/m);
  if (markdownTitleMatch && markdownTitleMatch[1]) {
    return markdownTitleMatch[1].trim();
  }
  
  // Default fallback
  return "Manim Animation";
};
