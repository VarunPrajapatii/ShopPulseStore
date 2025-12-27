import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** URL to navigate to (undefined for current page) */
  href?: string;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Optional className for styling */
  className?: string;
}

/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation with SEO benefits.
 * The last item is treated as the current page (no link).
 * Includes proper ARIA labels for accessibility.
 * 
 * Note: Schema.org BreadcrumbList markup should be added
 * at the page level as JSON-LD for better SEO.
 * 
 * @example
 * <Breadcrumb items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Electronics', href: '/category/electronics' },
 *   { label: 'Smartphones' }
 * ]} />
 */
const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav 
      aria-label="Breadcrumb navigation" 
      className={`py-3 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li 
              key={`${item.label}-${index}`} 
              className="flex items-center gap-1.5"
            >
              {/* Separator (except for first item) */}
              {index > 0 && (
                <ChevronRight 
                  className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" 
                  aria-hidden="true"
                />
              )}

              {/* Breadcrumb link or current page */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {/* Home icon for first item */}
                  {isFirst && (
                    <Home className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span className="hover:underline underline-offset-4">
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span 
                  className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {/* Home icon for first item even if it's current */}
                  {isFirst && (
                    <Home className="h-3.5 w-3.5 inline mr-1.5" aria-hidden="true" />
                  )}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
