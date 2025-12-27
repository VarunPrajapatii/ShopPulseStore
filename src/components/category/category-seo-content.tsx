'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CategorySEOContentProps {
  /** Category name for the heading */
  categoryName: string;
  /** Category description text */
  description?: string;
  /** Optional extended content for SEO */
  extendedContent?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * Category SEO Content Component
 * 
 * Displays expandable SEO content at the bottom of category pages.
 * Shows a preview with "Read More" option to reveal full content.
 * Helps with SEO by providing category-specific content.
 * 
 * @example
 * <CategorySEOContent
 *   categoryName="Electronics"
 *   description="Browse our wide selection of electronics..."
 *   extendedContent="We offer premium quality electronics..."
 * />
 */
const CategorySEOContent = ({
  categoryName,
  description,
  extendedContent,
  className = '',
}: CategorySEOContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate default content if none provided
  const defaultDescription = `Discover our curated collection of ${categoryName.toLowerCase()}. We offer a wide selection of high-quality products carefully selected to meet your needs. Each item is sourced from trusted manufacturers and goes through our quality assurance process.`;
  
  const defaultExtended = `
    At our store, we believe in providing exceptional value through premium products and outstanding customer service. Our ${categoryName.toLowerCase()} collection features items that combine quality, style, and functionality.

    Why shop ${categoryName.toLowerCase()} with us?
    • Carefully curated selection from trusted brands
    • Competitive prices with regular deals and offers  
    • Fast and reliable shipping across India
    • Easy returns within 30 days
    • Dedicated customer support team

    Whether you're looking for everyday essentials or something special, our ${categoryName.toLowerCase()} collection has something for everyone. Browse through our range and find the perfect products that match your style and requirements.
  `;

  const displayDescription = description || defaultDescription;
  const displayExtended = extendedContent || defaultExtended;

  // Check if there's extended content to show
  const hasExtendedContent = displayExtended.trim().length > 0;

  return (
    <section 
      className={`border-t border-border pt-10 mt-10 ${className}`}
      aria-labelledby="category-seo-heading"
    >
      {/* Section heading */}
      <h2 
        id="category-seo-heading"
        className="text-lg font-semibold mb-4"
      >
        About {categoryName}
      </h2>

      {/* Description preview */}
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p className="leading-relaxed">
          {displayDescription}
        </p>

        {/* Extended content (collapsible) */}
        {hasExtendedContent && (
          <>
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="pt-4 whitespace-pre-line">
                {displayExtended}
              </div>
            </div>

            {/* Read More / Read Less toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="
                inline-flex items-center gap-1
                mt-4
                text-sm font-medium
                text-primary hover:text-primary/80
                transition-colors duration-200
              "
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <>
                  <span>Read Less</span>
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default CategorySEOContent;
