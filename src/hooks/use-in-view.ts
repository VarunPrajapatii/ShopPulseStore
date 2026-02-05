"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseInViewOptions {
  /**
   * Percentage of element that must be visible (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Margin around the root element
   * @default "0px"
   */
  rootMargin?: string;
  /**
   * Only trigger once when element comes into view
   * @default true
   */
  triggerOnce?: boolean;
  /**
   * Skip the observer (useful for SSR or conditional usage)
   * @default false
   */
  skip?: boolean;
}

interface UseInViewReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isInView: boolean;
  hasBeenInView: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 * Uses native Intersection Observer API (zero bundle cost)
 *
 * @example
 * ```tsx
 * function ProductCard() {
 *   const { ref, isInView } = useInView();
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={`scroll-animate ${isInView ? 'in-view' : ''}`}
 *     >
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true,
    skip = false,
  } = options;

  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (skip || !element) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: assume element is in view
      setIsInView(true);
      setHasBeenInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;

        if (inView) {
          setIsInView(true);
          setHasBeenInView(true);

          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, skip]);

  return { ref, isInView, hasBeenInView };
}

/**
 * Hook to observe multiple elements at once
 * More efficient for lists/grids with many items
 *
 * @example
 * ```tsx
 * function ProductGrid({ products }) {
 *   const { observeElement, isInView } = useInViewMultiple();
 *
 *   return (
 *     <div className="grid">
 *       {products.map((product, index) => (
 *         <div
 *           key={product.id}
 *           ref={(el) => observeElement(el, product.id)}
 *           className={`scroll-animate ${isInView(product.id) ? 'in-view' : ''}`}
 *         >
 *           {product.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInViewMultiple(options: UseInViewOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-observe-id");
          if (!id) return;

          if (entry.isIntersecting) {
            setVisibleIds((prev) => new Set(prev).add(id));

            if (triggerOnce) {
              observerRef.current?.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setVisibleIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all registered elements
    elementsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  const observeElement = (element: HTMLElement | null, id: string) => {
    if (!element) {
      elementsRef.current.delete(id);
      return;
    }

    element.setAttribute("data-observe-id", id);
    elementsRef.current.set(id, element);

    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  };

  const isInView = (id: string) => visibleIds.has(id);

  return { observeElement, isInView, visibleIds };
}

export default useInView;
