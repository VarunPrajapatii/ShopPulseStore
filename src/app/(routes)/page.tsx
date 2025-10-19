import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";
import Container from "@/components/ui/container";
import StoreBillboardsClient from "@/components/store-billboards-client";
import Marquee from "@/components/marquee";
import OurPurpose from "@/components/our-purpose";
import UpcomingProducts from "@/components/upcoming-products";
import getUpcomingProducts from "@/actions/get-upcoming-products";

export const revalidate = 0;

const HomePage = async () => {
  const products = await getProducts({ isFeatured: true });
  const upcomingProducts = await getUpcomingProducts({});

  return (
    <Container>
      <div className="space-y-10 pb-10">
        <StoreBillboardsClient />
        <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </div>
        <OurPurpose />
        <Marquee />
        <UpcomingProducts items={upcomingProducts} />
      </div>
    </Container>
  );
};

export default HomePage;