"use client";

import { cn } from '@/lib/utils';
import { Category } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface MainNavProps {
  data: Category[];
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
  const pathname = usePathname();
  const routes = data.map((route) => ({
    href: `/category/${route.id}`,
    label: route.name,
    active: pathname === `/category/${route.id}`,
  }));


  return (
    <nav className="hidden md:flex items-center justify-center flex-1">
      <div className="flex items-center gap-x-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              'relative px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-all duration-300',
              'hover:text-foreground',
              'group',
              route.active 
                ? 'text-foreground' 
                : 'text-muted-foreground/80'
            )}
          >
            {route.label}
            {/* Animated underline */}
            <span 
              className={cn(
                'absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-foreground transition-all duration-300 ease-out',
                route.active ? 'w-4' : 'w-0 group-hover:w-4'
              )} 
            />
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MainNav;
