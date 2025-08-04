import React from 'react';
import { Link } from '@mui/material';

// Enhanced regular expression to detect various URL patterns
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

// Function to normalize URLs (add https if missing)
const normalizeUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  // For domain-only URLs, check if they look like websites
  if (url.includes('.') && !url.includes('@')) {
    return `https://${url}`;
  }
  return url;
};

// Function to detect if a string contains URLs and convert them to clickable links
export const linkifyText = (text: string): React.ReactNode[] => {
  if (!text) return [text];

  const parts = text.split(URL_REGEX);
  
  return parts.map((part, index) => {
    if (URL_REGEX.test(part) && part.includes('.') && !part.includes('@')) {
      // This looks like a URL, make it clickable
      const normalizedUrl = normalizeUrl(part);
      return (
        <Link
          key={index}
          href={normalizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'primary.main',
            textDecoration: 'underline',
            wordBreak: 'break-all',
            '&:hover': {
              textDecoration: 'none',
            },
          }}
        >
          {part}
        </Link>
      );
    }
    // This is regular text
    return part;
  });
};

// Alternative function that returns JSX directly for Typography components
export const LinkifiedText: React.FC<{ children: string }> = ({ children }) => {
  const linkedContent = linkifyText(children);
  
  return (
    <>
      {linkedContent}
    </>
  );
};