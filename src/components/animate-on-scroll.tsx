"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { type ReactNode, type HTMLAttributes, JSX } from "react";

type AnimationType =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-scale"
  | "scale";

interface AnimateOnScrollProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Animation type
   * @default "fade-up"
   */
  animation?: AnimationType;
  /**
   * Delay in milliseconds (for staggered effects)
   * @default 0
   */
  delay?: number;
  /**
   * Duration in milliseconds
   * @default 400
   */
  duration?: number;
  /**
   * Threshold for triggering animation (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Only animate once
   * @default true
   */
  once?: boolean;
  /**
   * Additional class names
   */
  className?: string;
  /**
   * HTML tag to render
   * @default "div"
   */
  as?: keyof JSX.IntrinsicElements;
}

const animationClasses: Record<AnimationType, string> = {
  "fade-up": "scroll-animate",
  "fade-down": "scroll-animate-down",
  "fade-left": "scroll-animate-left",
  "fade-right": "scroll-animate-right",
  "fade-scale": "scroll-animate-scale",
  scale: "scroll-animate-scale",
};

/**
 * Animate children when they scroll into view
 * Uses CSS classes + Intersection Observer for maximum performance
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AnimateOnScroll>
 *   <ProductCard />
 * </AnimateOnScroll>
 *
 * // With options
 * <AnimateOnScroll animation="fade-left" delay={100}>
 *   <ProductCard />
 * </AnimateOnScroll>
 *
 * // Staggered grid
 * {products.map((product, index) => (
 *   <AnimateOnScroll key={product.id} delay={index * 50}>
 *     <ProductCard product={product} />
 *   </AnimateOnScroll>
 * ))}
 * ```
 */
export function AnimateOnScroll({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 400,
  threshold = 0.1,
  once = true,
  className,
  as: Component = "div",
  ...props
}: AnimateOnScrollProps) {
  const { ref, isInView } = useInView({
    threshold,
    triggerOnce: once,
  });

  const Tag = Component as "div";

  return (
    <Tag
      ref={ref}
      className={cn(animationClasses[animation], isInView && "in-view", className)}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Wrapper for staggered animations on children
 * Automatically adds delay to each child
 *
 * @example
 * ```tsx
 * <StaggerChildren staggerDelay={50}>
 *   <ProductCard />
 *   <ProductCard />
 *   <ProductCard />
 * </StaggerChildren>
 * ```
 */
interface StaggerChildrenProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Delay between each child in ms
   * @default 50
   */
  staggerDelay?: number;
  /**
   * Animation type for all children
   * @default "fade-up"
   */
  animation?: AnimationType;
  /**
   * Additional class names
   */
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 50,
  animation = "fade-up",
  className,
  ...props
}: StaggerChildrenProps) {
  const { ref, isInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={cn("stagger-children", className)} {...props}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(animationClasses[animation], isInView && "in-view")}
              style={{ transitionDelay: `${index * staggerDelay}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

export default AnimateOnScroll;
