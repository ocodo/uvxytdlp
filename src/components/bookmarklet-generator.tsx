import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import BookmarkletHttpWarning from '@/components/bookmarklet-http-warning.mdx';

export const BookmarkletGenerator: React.FC = () => {
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string>('');
  const [isHttp, setIsHttp] = useState(false);

  useEffect(() => {
    setIsHttp(window.location.protocol === 'http:');
    // This effect runs once on the client-side to generate the bookmarklet URL
    const appUrl = window.location.origin + window.location.pathname;
    const script = `
      (function() {
        const currentUrl = encodeURIComponent(window.location.href);
        const newUrl = '${appUrl}#' + currentUrl;
        window.open(newUrl, '_blank');
      })();
    `;
    // A simple minification to remove whitespace for the href
    const minifiedScript = script.replace(/\s+/g, ' ').trim();
    setBookmarkletUrl(`javascript:${minifiedScript}`);
  }, []);

  const handleCopy = () => {
    if (!bookmarkletUrl) return;
    navigator.clipboard.writeText(bookmarkletUrl)
      .then(() => toast.success('Bookmarklet code copied to clipboard!'))
      .catch(err => {
        toast.error('Failed to copy code.');
        console.error('Failed to copy bookmarklet URL: ', err);
      });
  };

  if (!bookmarkletUrl) return null; // Don't render until the URL is ready

  return (
    <div> {/* Removed outer styling, DialogContent will provide it */}
      {isHttp && (
        <div className="mb-4"><BookmarkletHttpWarning /></div>
      )}
      <h3 className="text-lg font-semibold mb-2">uvxytdlp bookmarklet</h3>
      <p className="text-sm text-muted-foreground">
        To install, drag the button below to your browser's bookmarks bar.
      </p>
      <div className="flex flex-col items-start sm:items-center gap-4">
        <a
          href={bookmarkletUrl}
          onClick={(e) => {
            e.preventDefault();
            toast.info("Drag this button to your bookmarks bar, don't click it!");
          }}
          style={{ textDecoration: 'none' }}

          className="inline-flex items-center justify-center
          whitespace-nowrap rounded-md text-sm font-medium
          transition-colors focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2
          border-1 h-10 px-4 py-2 mt-2 cursor-move"

          title="Drag me to your bookmarks bar!"
        >
          Download video with uvxytdlp
        </a>
        <div className="text-sm text-muted-foreground">
          Or, copy the code and create a bookmark manually:
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy} className="cursor-copy">
          Copy
        </Button>
      </div>
    </div>
  );
};
