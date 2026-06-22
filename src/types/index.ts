export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  recipesCount: number;
  postsCount: number;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
  image?: string;
  temperature?: number;
  duration?: number;
}

export type RecipeCategory = 'bread' | 'cake' | 'cookie' | 'dessert';

export interface RecipeSummary {
  id: string;
  title: string;
  cover: string;
  category: RecipeCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number;
  author: User;
  likesCount: number;
  description?: string;
  servings?: number;
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: Ingredient[];
  steps: Step[];
  temperature: number;
  bakingTime: number;
  createdAt: string;
  isLiked: boolean;
  isFavorited: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Post {
  id: string;
  images: string[];
  content: string;
  recipe?: RecipeSummary;
  author: User;
  user?: User;
  keyword?: string;
  likes?: string[] | number;
  likesCount: number;
  commentsCount: number;
  comments?: Comment[];
  isLiked?: boolean;
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  duration: number;
  videoUrl: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  cover: string;
  description: string;
  price: number;
  author: User;
  chapters: Chapter[];
  progress?: number;
}
