/**
 * HighlightText Component
 *
 * Highlights search terms within text
 */

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
}

export function HighlightText({ text, searchTerm, className = '' }: HighlightTextProps) {
  if (!searchTerm.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');

  // Split text by search term
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        if (part.toLowerCase() === searchTerm.toLowerCase()) {
          return (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
