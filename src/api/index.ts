import type {
  User,
  RecipeSummary,
  RecipeDetail,
  Post,
  Comment,
  Course,
  RecipeCategory,
} from '@/types';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;
  const url = `${BASE_URL}${endpoint}${params ? buildQueryString(params) : ''}`;

  const token = getToken();
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error((errorData as { message?: string }).message || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const auth = {
  login: (data: { email: string; password: string }): Promise<{ user: User; token: string }> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { username: string; email: string; password: string }): Promise<{ user: User; token: string }> =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

export const users = {
  getUser: (id: string): Promise<User> => request(`/users/${id}`),
  followUser: (id: string): Promise<void> => request(`/users/${id}/follow`, { method: 'POST' }),
  unfollowUser: (id: string): Promise<void> => request(`/users/${id}/unfollow`, { method: 'POST' }),
  getFollowers: (id: string): Promise<User[]> => request(`/users/${id}/followers`),
  getFollowing: (id: string): Promise<User[]> => request(`/users/${id}/following`),
  getCurrentUser: (): Promise<User> => request('/users/me'),
};

export interface GetRecipesParams {
  category?: RecipeCategory;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  time?: number;
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const recipes = {
  getRecipes: (params: GetRecipesParams = {}): Promise<{ recipes: RecipeSummary[]; total: number; pagination: { page: number; limit: number; total: number; totalPages: number } }> =>
    request("/recipes", { params }),
  getRecipe: (id: string): Promise<RecipeDetail> => request(`/recipes/${id}`),
  createRecipe: (data: Partial<RecipeDetail>): Promise<RecipeDetail> =>
    request("/recipes", { method: "POST", body: JSON.stringify(data) }),
  likeRecipe: (id: string): Promise<void> => request(`/recipes/${id}/like`, { method: "POST" }),
  unlikeRecipe: (id: string): Promise<void> => request(`/recipes/${id}/unlike`, { method: "POST" }),
  favoriteRecipe: (id: string): Promise<void> => request(`/recipes/${id}/favorite`, { method: "POST" }),
  unfavoriteRecipe: (id: string): Promise<void> => request(`/recipes/${id}/unfavorite`, { method: "POST" }),
};

export interface GetPostsParams {
  recipeId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export const posts = {
  getPosts: (params: GetPostsParams = {}): Promise<{ posts: Post[]; total: number }> =>
    request("/posts", { params }),
  createPost: (data: { images: string[]; content: string; recipeId?: string }): Promise<Post> =>
    request("/posts", { method: "POST", body: JSON.stringify(data) }),
  likePost: (id: string): Promise<void> => request(`/posts/${id}/like`, { method: "POST" }),
  unlikePost: (id: string): Promise<void> => request(`/posts/${id}/unlike`, { method: "POST" }),
  addComment: (id: string, content: string): Promise<Comment> =>
    request(`/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
};

export const courses = {
  getCourses: (): Promise<Course[]> => request("/courses"),
  getCourse: (id: string): Promise<Course> => request(`/courses/${id}`),
  updateProgress: (id: string, progress: number): Promise<void> =>
    request(`/courses/${id}/progress`, { method: "POST", body: JSON.stringify({ progress }) }),
};

export const api = { auth, users, recipes, posts, courses };
export default api;
