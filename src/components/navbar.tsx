import Container from '@/components/ui/container';
import Link from 'next/link';
import MainNav from '@/components/main-nav';
import getCategories from '@/actions/get-categories';
import NavbarAction from '@/components/navbar-actions';

// what this does is that it never caches this page
// meaning it will always fetch the latest data from the server
// instead of using the cached version
// this is useful for dynamic data that changes frequently
// like categories, products, etc.
export const revalidate = 0;

const Navbar = async () => {
  const categories = await getCategories();

  return (
    <div className="border-b">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Link href="/" className="ml-4 flex lg:ml-0 gap-x-2">
            <p className="font-bold text-xl">STORE</p>
          </Link>
          <MainNav data={categories} />
          <NavbarAction /> 
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
