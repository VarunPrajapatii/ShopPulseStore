'use client';

import { cn } from '@/lib/utils';
import { Category } from '@/types';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const ITEM_GAP = 4; // must match gap-x-1 (0.25rem)
const HOVER_OPEN_DELAY = 80;
const HOVER_CLOSE_DELAY = 180;

// Shared by real items and the hidden measurer so widths always match.
const itemBase =
  'relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase whitespace-nowrap';
const moreBase = cn(itemBase, 'inline-flex items-center gap-x-1');

interface Route {
  href: string;
  label: string;
  active: boolean;
}

interface MainNavProps {
  data: Category[];
}

/* ----------------------------- More dropdown ----------------------------- */

const MoreMenu: React.FC<{ items: Route[] }> = ({ items }) => {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<string>('mouse');

  const hasActive = items.some((i) => i.active);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const schedule = (next: boolean, delay: number) => {
    clearTimer();
    timer.current = setTimeout(() => setOpen(next), delay);
  };

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Cleanup timer on unmount
  useEffect(() => clearTimer, []);

  // Outside click / tap + Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handleClick = (e: React.MouseEvent) => {
    // Mouse: hover already opened it, so a click should not close it.
    // Touch / keyboard (detail === 0): behave as a normal toggle.
    if (lastPointer.current === 'mouse' && e.detail > 0) {
      clearTimer();
      setOpen(true);
    } else {
      setOpen((o) => !o);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={(e) => {
        lastPointer.current = e.pointerType;
        if (e.pointerType === 'mouse') schedule(true, HOVER_OPEN_DELAY);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') schedule(false, HOVER_CLOSE_DELAY);
      }}
      onBlur={(e) => {
        if (!wrapperRef.current?.contains(e.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={handleClick}
        className={cn(
          moreBase,
          'group transition-colors duration-300 hover:text-foreground',
          hasActive || open ? 'text-foreground' : 'text-muted-foreground/80'
        )}
      >
        More
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-300',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            'absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-foreground transition-all duration-300 ease-out',
            hasActive || open ? 'w-4' : 'w-0 group-hover:w-4'
          )}
        />
      </button>

      {/* pt-2 acts as a hover bridge so the pointer never "falls off" between button and panel */}
      <div
        id={menuId}
        className={cn(
          'absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2',
          'transition-[opacity,transform,visibility] duration-200 ease-out',
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-1 opacity-0'
        )}
      >
        <ul className="min-w-[200px] max-w-[280px] max-h-[min(70vh,420px)] overflow-y-auto rounded-lg border border-border/60 bg-background/95 py-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] backdrop-blur-xl">
          {items.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                title={route.label}
                aria-current={route.active ? 'page' : undefined}
                className={cn(
                  'block truncate px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200',
                  route.active
                    ? 'bg-muted/60 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/* -------------------------------- Main nav ------------------------------- */

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  const pathname = usePathname();

  const routes: Route[] = useMemo(
    () =>
      data.map((route) => ({
        href: `/category/${route.id}`,
        label: route.name,
        active: pathname === `/category/${route.id}`,
      })),
    [data, pathname]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // null = not measured yet (first paint) -> we hide the row to avoid a flash
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const available = container.clientWidth;
    const widths = Array.from(
      measure.querySelectorAll<HTMLElement>('[data-measure-item]')
    ).map((el) => el.offsetWidth);
    const moreWidth =
      measure.querySelector<HTMLElement>('[data-measure-more]')?.offsetWidth ??
      0;

    const total =
      widths.reduce((sum, w) => sum + w, 0) +
      ITEM_GAP * Math.max(widths.length - 1, 0);

    // Everything fits -> no "More" at all
    if (total <= available) {
      setVisibleCount(widths.length);
      return;
    }

    // Otherwise fit as many as possible while reserving room for "More"
    let used = moreWidth;
    let count = 0;
    for (const w of widths) {
      const next = used + ITEM_GAP + w;
      if (next > available) break;
      used = next;
      count++;
    }
    setVisibleCount(count);
  }, []);

  // Re-measure whenever categories change
  useIsomorphicLayoutEffect(() => {
    recalc();
  }, [routes.length, data, recalc]);

  // Re-measure on container resize, measurer resize (font load etc.)
  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const ro = new ResizeObserver(() => recalc());
    ro.observe(container);
    ro.observe(measure);

    document.fonts?.ready.then(recalc).catch(() => {});

    return () => ro.disconnect();
  }, [recalc]);

  const count = visibleCount ?? routes.length;
  const visible = routes.slice(0, count);
  const overflow = routes.slice(count);

  return (
    <nav
      aria-label="Categories"
      className="hidden min-w-0 flex-1 items-center justify-center md:flex"
    >
      <div ref={containerRef} className="relative flex w-full justify-center">
        {/* Hidden measurer: same markup/classes as real items, never focusable */}
        <div
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 flex h-0 w-max gap-x-1 overflow-hidden"
        >
          {routes.map((route) => (
            <span
              key={route.href}
              data-measure-item
              className={cn(itemBase, 'shrink-0')}
            >
              {route.label}
            </span>
          ))}
          <span data-measure-more className={cn(moreBase, 'shrink-0')}>
            More
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Real row */}
        <div
          className={cn(
            'flex items-center gap-x-1',
            visibleCount === null && 'invisible'
          )}
        >
          {visible.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              aria-current={route.active ? 'page' : undefined}
              className={cn(
                itemBase,
                'group shrink-0 transition-all duration-300 hover:text-foreground',
                route.active ? 'text-foreground' : 'text-muted-foreground/80'
              )}
            >
              {route.label}
              <span
                className={cn(
                  'absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-foreground transition-all duration-300 ease-out',
                  route.active ? 'w-4' : 'w-0 group-hover:w-4'
                )}
              />
            </Link>
          ))}

          {overflow.length > 0 && <MoreMenu items={overflow} />}
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
