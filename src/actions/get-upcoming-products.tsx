import { UpcomingProduct } from "@/types";
import qs from "query-string";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/upcoming-products`;

interface Query {
  categoryId?: string;
}

const getUpcomingProducts = async (query: Query): Promise<UpcomingProduct[]> => {
  const url = qs.stringifyUrl({
    url: URL,
    query: {
      categoryId: query.categoryId,
    },
  });

  const res = await fetch(url, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  return res.json();
};

export default getUpcomingProducts;
