export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface LinkCategoryRequest {
  category_id: number;
}
