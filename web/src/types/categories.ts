/**
 * Category interface representing a category that can be associated with events.
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
}

/**
 * Request payload for linking a category to an event.
 */
export interface LinkCategoryRequest {
  category_id: string;
}
