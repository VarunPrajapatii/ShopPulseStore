'use client'

import Container from '@/components/ui/container';
import Link from 'next/link';
import MainNav from '@/components/main-nav';
import NavbarAction from '@/components/navbar-actions';
import { useCategoriesStore } from '@/hooks/use-categories';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// what this does is that it never caches this page
// meaning it will always fetch the latest data from the server
// instead of using the cached version
// this is useful for dynamic data that changes frequently
// like categories, products, etc.
export const revalidate = 0;

const Navbar = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed left-0 right-0 w-full z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl shadow-[0_2px_20px_-2px_rgba(0,0,0,0.1)] border-b border-border/40' 
          : 'bg-background/95 backdrop-blur-sm border-b border-transparent'
      }`}
      style={{ top: 'var(--announcement-bar-height, 0px)' }}
    >
      <Container>
        <nav className="relative flex h-16 items-center justify-between" aria-label="Main navigation">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-x-2.5 group"
          >
            <div className="relative overflow-hidden">
              <Image 
                src="/shoppulselogo.png"
                alt="ShopPulse Logo"
                width={32}
                height={32}
                className="transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-semibold text-base tracking-[0.2em] text-foreground uppercase">
              Store
            </span>
          </Link>

          {/* Navigation Links - Center */}
          <MainNav data={categories} />

          {/* Actions - Right */}
          <NavbarAction /> 
        </nav>
      </Container>
    </header>
  );
};

export default Navbar;
