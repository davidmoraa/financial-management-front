import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types/finance";

type CategoriesResponse = {
  categories: Category[];
};

export async function fetchCategories() {
  const response = await apiClient.get<CategoriesResponse>("/v1/categories");
  return response.categories;
}
