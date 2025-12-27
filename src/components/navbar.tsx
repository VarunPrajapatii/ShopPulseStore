'use client'

import Container from '@/components/ui/container';
import Link from 'next/link';
import MainNav from '@/components/main-nav';
import NavbarAction from '@/components/navbar-actions';
import { useCategoriesStore } from '@/hooks/use-categories';
import Image from 'next/image';

// what this does is that it never caches this page
// meaning it will always fetch the latest data from the server
// instead of using the cached version
// this is useful for dynamic data that changes frequently
// like categories, products, etc.
export const revalidate = 0;

const Navbar = () => {
  const categories = useCategoriesStore((state) => state.categories);

  return (
    <header className="sticky top-0 bg-background w-full z-20 border-b border-border">
      <Container>
        <nav className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center" aria-label="Main navigation">
          <Link href="/" className="ml-4 flex lg:ml-0 gap-x-2">
          <Image 
            src="/shoppulselogo.png"
            alt="ShopPulse Logo"
            width={40}
            height={40}
          />
            <p className="font-bold text-xl text-foreground">STORE</p>
          </Link>
          <MainNav data={categories} />
          <NavbarAction /> 
        </nav>
      </Container>
    </header>
  );
};

export default Navbar;
