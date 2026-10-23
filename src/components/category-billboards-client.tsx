import Billboard from '@/components/billboard';
import { Billboard as BillboardType } from '@/types';

interface CategoryBillboardsClientProps {
  billboards: BillboardType[];
}

const CategoryBillboardsClient = ({
  billboards,
}: CategoryBillboardsClientProps) => {
  if (!billboards || billboards.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Billboard data={billboards} />
    </div>
  );
};

export default CategoryBillboardsClient;
