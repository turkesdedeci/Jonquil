export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  coverImage: string;
  category: string;
  tags: string[];
  relatedProducts: string[];
  author: string;
  content: string;
  readingTime: string;
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

export interface BlogTag {
  slug: string;
  name: string;
  postCount: number;
}
