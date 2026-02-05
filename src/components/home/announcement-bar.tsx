'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { AnnouncementBar as AnnouncementBarType } from '@/types';

interface AnnouncementBarProps {
  data: AnnouncementBarType | null;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Update CSS variable for announcement bar height
  const updateAnnouncementHeight = useCallback((height: number) => {
    document.documentElement.style.setProperty('--announcement-bar-height', `${height}px`);
  }, []);

  useEffect(() => {
    // Set initial height or 0 if not shown
    if (!data || !data.isActive || isDismissed || data.messages.length === 0) {
      updateAnnouncementHeight(0);
    } else {
      // Default height for announcement bar (~40px)
      updateAnnouncementHeight(40);
    }
  }, [data, isDismissed, updateAnnouncementHeight]);

  useEffect(() => {
    if (!data || data.messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [data]);

  if (!data || !data.isActive || isDismissed || data.messages.length === 0) {
    return null;
  }

  const currentMessage = data.messages[currentIndex];
  
  // Build the link URL based on linkType
  const getLinkUrl = () => {
    if (!currentMessage.linkId || !currentMessage.linkType) return null;
    
    switch (currentMessage.linkType) {
      case 'category':
        return `/category/${currentMessage.linkId}`;
      case 'product':
        return `/product/${currentMessage.linkId}`;
      default:
        return null;
    }
  };

  const linkUrl = getLinkUrl();

  const MessageContent = () => (
    <span className="flex items-center justify-center gap-2 text-sm font-medium">
      {currentMessage.emoji && <span>{currentMessage.emoji}</span>}
      <span>{currentMessage.text}</span>
      {currentMessage.emoji && <span>{currentMessage.emoji}</span>}
    </span>
  );

  const barContent = (
    <div className="py-2.5 px-4 text-center w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <MessageContent />
      </div>
    </div>
  );

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] transition-colors"
      style={{ backgroundColor: data.backgroundColor }}
    >
      {linkUrl ? (
        <Link href={linkUrl} className="block group">
          {barContent}
        </Link>
      ) : (
        barContent
      )}
      
      {/* Dismiss button */}
      {data.dismissible && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDismissed(true);
            updateAnnouncementHeight(0);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors z-10"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;
