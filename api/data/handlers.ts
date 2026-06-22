import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { store, type IUser, type IRecipe, type IPost, type ICourse, type IComment } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'bake_community_secret_key_2024'

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

const generateId = (): string => {
  return crypto.randomUUID()
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const userToDTO = (user: IUser): Record<string, unknown> => {
  const { password, ...rest } = user
  return {
    ...rest,
    id: user._id,
    followingCount: user.following.length,
    followerCount: user.followers.length,
    likedRecipeCount: user.likedRecipes.length,
    favoritedRecipeCount: user.favoritedRecipes.length,
  }
}

const userToDTOWithoutProgress = (user: IUser): Record<string, unknown> => {
  const { password, courseProgress, likedPosts, ...rest } = user
  return {
    ...rest,
    id: user._id,
    followingCount: user.following.length,
    followerCount: user.followers.length,
    likedRecipeCount: user.likedRecipes.length,
    favoritedRecipeCount: user.favoritedRecipes.length,
  }
}

const authorToDTO = (user: IUser): Record<string, unknown> => {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
  }
}

const recipeAuthorToDTO = (user: IUser): Record<string, unknown> => {
  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    avatar: user.avatar,
  }
}

const populateAuthor = (authorId: string, detailed = false): Record<string, unknown> | null => {
  const user = store.users.find((u) => u._id === authorId)
  if (!user) return null
  return detailed ? authorToDTO(user) : recipeAuthorToDTO(user)
}

const recipeToDTO = (recipe: IRecipe, detailed = false): Record<string, unknown> => {
  return {
    ...recipe,
    id: recipe._id,
    author: populateAuthor(recipe.author, detailed),
  }
}

const postToDTO = (post: IPost): Record<string, unknown> => {
  const author = populateAuthor(post.author)
  const recipe = post.recipe ? store.recipes.find((r) => r._id === post.recipe) : null
  const comments = post.comments.map((c) => ({
    ...c,
    author: populateAuthor(c.author),
  }))
  return {
    ...post,
    id: post._id,
    author,
    recipe: recipe ? { _id: recipe._id, id: recipe._id, title: recipe.title, cover: recipe.cover } : undefined,
    comments,
  }
}

const courseToDTO = (course: ICourse, userId?: string): Record<string, unknown> => {
  const author = populateAuthor(course.author, true)
  const dto: Record<string, unknown> = {
    ...course,
    id: course._id,
    author,
  }
  if (userId) {
    const user = store.users.find((u) => u._id === userId)
    dto.progress = user?.courseProgress?.[course._id] || []
  }
  return dto
}

// ===== AUTH =====

export const register = async (body: { username: string; email: string; password: string }): Promise<{ success: boolean; token?: string; user?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const { username, email, password } = body

  if (!username || !email || !password) {
    return { success: false, message: '请填写所有必填字段', status: 400 }
  }

  const existingUser = store.users.find((u) => u.email === email.toLowerCase())
  if (existingUser) {
    return { success: false, message: '该邮箱已被注册', status: 400 }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const now = new Date()

  const newUser: IUser = {
    _id: generateId(),
    username,
    email: email.toLowerCase(),
    password: hashedPassword,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`,
    bio: '',
    following: [],
    followers: [],
    likedRecipes: [],
    favoritedRecipes: [],
    likedPosts: [],
    courseProgress: {},
    createdAt: now,
    updatedAt: now,
  }

  store.users.push(newUser)
  const token = generateToken(newUser._id)

  return { success: true, token, user: userToDTO(newUser), status: 201 }
}

export const login = async (body: { email: string; password: string }): Promise<{ success: boolean; token?: string; user?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const { email, password } = body

  if (!email || !password) {
    return { success: false, message: '请填写邮箱和密码', status: 400 }
  }

  const user = store.users.find((u) => u.email === email.toLowerCase())
  if (!user) {
    return { success: false, message: '邮箱或密码错误', status: 401 }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { success: false, message: '邮箱或密码错误', status: 401 }
  }

  const token = generateToken(user._id)
  return { success: true, token, user: userToDTO(user), status: 200 }
}

// ===== USERS =====

export const getUser = async (id: string): Promise<{ success: boolean; user?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const user = store.users.find((u) => u._id === id)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }
  return { success: true, user: userToDTOWithoutProgress(user), status: 200 }
}

export const getCurrentUser = async (userId: string): Promise<{ success: boolean; user?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }
  return { success: true, user: userToDTO(user), status: 200 }
}

export const followUser = async (currentUserId: string, targetId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)

  if (targetId === currentUserId) {
    return { success: false, message: '不能关注自己', status: 400 }
  }

  const targetUser = store.users.find((u) => u._id === targetId)
  if (!targetUser) {
    return { success: false, message: '目标用户不存在', status: 404 }
  }

  const currentUser = store.users.find((u) => u._id === currentUserId)
  if (!currentUser) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  const alreadyFollowing = currentUser.following.includes(targetId)
  if (alreadyFollowing) {
    return { success: false, message: '已关注该用户', status: 400 }
  }

  currentUser.following.push(targetId)
  targetUser.followers.push(currentUserId)
  currentUser.updatedAt = new Date()
  targetUser.updatedAt = new Date()

  return { success: true, message: '关注成功', status: 200 }
}

export const unfollowUser = async (currentUserId: string, targetId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)

  const targetUser = store.users.find((u) => u._id === targetId)
  if (!targetUser) {
    return { success: false, message: '目标用户不存在', status: 404 }
  }

  const currentUser = store.users.find((u) => u._id === currentUserId)
  if (!currentUser) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  const isFollowing = currentUser.following.includes(targetId)
  if (!isFollowing) {
    return { success: false, message: '未关注该用户', status: 400 }
  }

  currentUser.following = currentUser.following.filter((id) => id !== targetId)
  targetUser.followers = targetUser.followers.filter((id) => id !== currentUserId)
  currentUser.updatedAt = new Date()
  targetUser.updatedAt = new Date()

  return { success: true, message: '取消关注成功', status: 200 }
}

export const getFollowers = async (userId: string): Promise<{ success: boolean; users?: Record<string, unknown>[]; message?: string; status?: number }> => {
  await delay(10)
  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }
  const followers = store.users.filter((u) => user.followers.includes(u._id)).map(userToDTOWithoutProgress)
  return { success: true, users: followers, status: 200 }
}

export const getFollowing = async (userId: string): Promise<{ success: boolean; users?: Record<string, unknown>[]; message?: string; status?: number }> => {
  await delay(10)
  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }
  const following = store.users.filter((u) => user.following.includes(u._id)).map(userToDTOWithoutProgress)
  return { success: true, users: following, status: 200 }
}

// ===== RECIPES =====

interface GetRecipesQuery {
  category?: string
  difficulty?: string
  time?: string
  search?: string
  page?: string
  limit?: string
}

export const getRecipes = async (query: GetRecipesQuery): Promise<{ success: boolean; recipes?: Record<string, unknown>[]; pagination?: { page: number; limit: number; total: number; totalPages: number }; message?: string; status?: number }> => {
  await delay(10)
  const { category, difficulty, time, search, page = '1', limit = '10' } = query

  let filtered = [...store.recipes]

  if (category) {
    filtered = filtered.filter((r) => r.category === category)
  }

  if (difficulty) {
    const diffNum = Number(difficulty)
    filtered = filtered.filter((r) => r.difficulty === diffNum)
  }

  if (time) {
    const timeNum = Number(time)
    if (timeNum === 30) {
      filtered = filtered.filter((r) => r.duration <= 30)
    } else if (timeNum === 60) {
      filtered = filtered.filter((r) => r.duration > 30 && r.duration <= 60)
    } else if (timeNum === 120) {
      filtered = filtered.filter((r) => r.duration > 60 && r.duration <= 120)
    } else {
      filtered = filtered.filter((r) => r.duration > 120)
    }
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (r) => r.title.toLowerCase().includes(searchLower) || r.description.toLowerCase().includes(searchLower),
    )
  }

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const pageNum = Math.max(Number(page) || 1, 1)
  const limitNum = Math.max(Number(limit) || 10, 1)
  const skip = (pageNum - 1) * limitNum
  const total = filtered.length
  const paginated = filtered.slice(skip, skip + limitNum)

  return {
    success: true,
    recipes: paginated.map((r) => recipeToDTO(r)),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    status: 200,
  }
}

export const getRecipe = async (id: string, userId?: string): Promise<{ success: boolean; recipe?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const recipe = store.recipes.find((r) => r._id === id)
  if (!recipe) {
    return { success: false, message: '食谱不存在', status: 404 }
  }

  const dto = recipeToDTO(recipe, true) as Record<string, unknown>
  if (userId) {
    dto.isLiked = recipe.likes.includes(userId)
    dto.isFavorited = recipe.favorites.includes(userId)
  } else {
    dto.isLiked = false
    dto.isFavorited = false
  }

  return { success: true, recipe: dto, status: 200 }
}

interface CreateRecipeBody {
  title: string
  description: string
  cover: string
  category: 'bread' | 'cake' | 'cookie' | 'dessert'
  difficulty: number
  duration: number
  servings: number
  temperature: number
  bakingTime: number
  ingredients: Array<{ name: string; amount: number; unit: string }>
  steps: Array<{ order: number; description: string; image?: string; temperature?: number; duration?: number }>
}

export const createRecipe = async (userId: string, body: CreateRecipeBody): Promise<{ success: boolean; recipe?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const { title, description, cover, category, difficulty, duration, servings, temperature, bakingTime, ingredients, steps } = body

  if (!title || !description || !cover || !category || !difficulty || !duration || !servings || !temperature || !bakingTime || !ingredients || !steps) {
    return { success: false, message: '请填写所有必填字段', status: 400 }
  }

  const now = new Date()
  const newRecipe: IRecipe = {
    _id: generateId(),
    title,
    description,
    cover,
    category,
    difficulty,
    duration,
    servings,
    temperature,
    bakingTime,
    ingredients,
    steps,
    author: userId,
    likes: [],
    favorites: [],
    createdAt: now,
    updatedAt: now,
  }

  store.recipes.unshift(newRecipe)
  return { success: true, recipe: recipeToDTO(newRecipe), status: 201 }
}

export const likeRecipe = async (userId: string, recipeId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const recipe = store.recipes.find((r) => r._id === recipeId)
  if (!recipe) {
    return { success: false, message: '食谱不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (recipe.likes.includes(userId)) {
    return { success: false, message: '已点赞该食谱', status: 400 }
  }

  recipe.likes.push(userId)
  user.likedRecipes.push(recipeId)
  recipe.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '点赞成功', status: 200 }
}

export const unlikeRecipe = async (userId: string, recipeId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const recipe = store.recipes.find((r) => r._id === recipeId)
  if (!recipe) {
    return { success: false, message: '食谱不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (!recipe.likes.includes(userId)) {
    return { success: false, message: '未点赞该食谱', status: 400 }
  }

  recipe.likes = recipe.likes.filter((id) => id !== userId)
  user.likedRecipes = user.likedRecipes.filter((id) => id !== recipeId)
  recipe.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '取消点赞成功', status: 200 }
}

export const favoriteRecipe = async (userId: string, recipeId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const recipe = store.recipes.find((r) => r._id === recipeId)
  if (!recipe) {
    return { success: false, message: '食谱不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (recipe.favorites.includes(userId)) {
    return { success: false, message: '已收藏该食谱', status: 400 }
  }

  recipe.favorites.push(userId)
  user.favoritedRecipes.push(recipeId)
  recipe.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '收藏成功', status: 200 }
}

export const unfavoriteRecipe = async (userId: string, recipeId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const recipe = store.recipes.find((r) => r._id === recipeId)
  if (!recipe) {
    return { success: false, message: '食谱不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (!recipe.favorites.includes(userId)) {
    return { success: false, message: '未收藏该食谱', status: 400 }
  }

  recipe.favorites = recipe.favorites.filter((id) => id !== userId)
  user.favoritedRecipes = user.favoritedRecipes.filter((id) => id !== recipeId)
  recipe.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '取消收藏成功', status: 200 }
}

// ===== POSTS =====

interface GetPostsQuery {
  recipeId?: string
  userId?: string
  page?: string
  limit?: string
}

export const getPosts = async (query: GetPostsQuery): Promise<{ success: boolean; posts?: Record<string, unknown>[]; pagination?: { page: number; limit: number; total: number; totalPages: number }; message?: string; status?: number }> => {
  await delay(10)
  const { recipeId, userId, page = '1', limit = '10' } = query

  let filtered = [...store.posts]

  if (recipeId) {
    filtered = filtered.filter((p) => p.recipe === recipeId)
  }

  if (userId) {
    filtered = filtered.filter((p) => p.author === userId)
  }

  filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const pageNum = Math.max(Number(page) || 1, 1)
  const limitNum = Math.max(Number(limit) || 10, 1)
  const skip = (pageNum - 1) * limitNum
  const total = filtered.length
  const paginated = filtered.slice(skip, skip + limitNum)

  return {
    success: true,
    posts: paginated.map(postToDTO),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
    status: 200,
  }
}

export const getPost = async (id: string): Promise<{ success: boolean; post?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const post = store.posts.find((p) => p._id === id)
  if (!post) {
    return { success: false, message: '打卡不存在', status: 404 }
  }
  return { success: true, post: postToDTO(post), status: 200 }
}

interface CreatePostBody {
  images: string[]
  content: string
  recipeId?: string
}

export const createPost = async (userId: string, body: CreatePostBody): Promise<{ success: boolean; post?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const { images, content, recipeId } = body

  if (!images || images.length === 0 || !content) {
    return { success: false, message: '请填写图片和内容', status: 400 }
  }

  const now = new Date()
  const newPost: IPost = {
    _id: generateId(),
    images,
    content,
    recipe: recipeId,
    author: userId,
    likes: [],
    comments: [],
    createdAt: now,
    updatedAt: now,
  }

  store.posts.unshift(newPost)
  return { success: true, post: postToDTO(newPost), status: 201 }
}

export const likePost = async (userId: string, postId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const post = store.posts.find((p) => p._id === postId)
  if (!post) {
    return { success: false, message: '打卡不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (post.likes.includes(userId)) {
    return { success: false, message: '已点赞该打卡', status: 400 }
  }

  post.likes.push(userId)
  user.likedPosts.push(postId)
  post.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '点赞成功', status: 200 }
}

export const unlikePost = async (userId: string, postId: string): Promise<{ success: boolean; message?: string; status?: number }> => {
  await delay(10)
  const post = store.posts.find((p) => p._id === postId)
  if (!post) {
    return { success: false, message: '打卡不存在', status: 404 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (!post.likes.includes(userId)) {
    return { success: false, message: '未点赞该打卡', status: 400 }
  }

  post.likes = post.likes.filter((id) => id !== userId)
  user.likedPosts = user.likedPosts.filter((id) => id !== postId)
  post.updatedAt = new Date()
  user.updatedAt = new Date()

  return { success: true, message: '取消点赞成功', status: 200 }
}

export const addComment = async (userId: string, postId: string, body: { content: string }): Promise<{ success: boolean; comment?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const { content } = body

  if (!content) {
    return { success: false, message: '评论内容不能为空', status: 400 }
  }

  const post = store.posts.find((p) => p._id === postId)
  if (!post) {
    return { success: false, message: '打卡不存在', status: 404 }
  }

  const comment: IComment = {
    content,
    author: userId,
    createdAt: new Date(),
  }

  post.comments.push(comment)
  post.updatedAt = new Date()

  const commentDTO = {
    ...comment,
    author: populateAuthor(userId),
  }

  return { success: true, comment: commentDTO, status: 201 }
}

// ===== COURSES =====

export const getCourses = async (): Promise<{ success: boolean; courses?: Record<string, unknown>[]; message?: string; status?: number }> => {
  await delay(10)
  const sorted = [...store.courses].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return { success: true, courses: sorted.map((c) => courseToDTO(c)), status: 200 }
}

export const getCourse = async (id: string, userId?: string): Promise<{ success: boolean; course?: Record<string, unknown>; message?: string; status?: number }> => {
  await delay(10)
  const course = store.courses.find((c) => c._id === id)
  if (!course) {
    return { success: false, message: '课程不存在', status: 404 }
  }
  return { success: true, course: courseToDTO(course, userId), status: 200 }
}

export const updateProgress = async (userId: string, courseId: string, body: { chapterId: string }): Promise<{ success: boolean; progress?: string[]; message?: string; status?: number }> => {
  await delay(10)
  const { chapterId } = body

  const course = store.courses.find((c) => c._id === courseId)
  if (!course) {
    return { success: false, message: '课程不存在', status: 404 }
  }

  if (!chapterId) {
    return { success: false, message: '请提供章节 ID', status: 400 }
  }

  const user = store.users.find((u) => u._id === userId)
  if (!user) {
    return { success: false, message: '用户不存在', status: 404 }
  }

  if (!user.courseProgress) {
    user.courseProgress = {}
  }

  if (!user.courseProgress[courseId]) {
    user.courseProgress[courseId] = []
  }

  const alreadyCompleted = user.courseProgress[courseId].includes(chapterId)
  if (!alreadyCompleted) {
    user.courseProgress[courseId].push(chapterId)
  }
  user.updatedAt = new Date()

  return {
    success: true,
    progress: user.courseProgress[courseId],
    message: alreadyCompleted ? '进度已存在' : '进度更新成功',
    status: 200,
  }
}
