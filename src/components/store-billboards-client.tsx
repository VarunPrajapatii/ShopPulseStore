import { BillboardCarousel } from '@/components/ui/carousel';
import { StoreBillboard } from '@/types';

interface StoreBillboardsClientProps {
  initialData: StoreBillboard[];
}

const StoreBillboardsClient = ({ initialData }: StoreBillboardsClientProps) => {
  if (!initialData || initialData.length === 0) return null;

  const billboards = initialData.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
    imageAltText: item.billboard.imageAltText,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4">
      <BillboardCarousel items={billboards} />
    </div>
  );
};

export default StoreBillboardsClient;
