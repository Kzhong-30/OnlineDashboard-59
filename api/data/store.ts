import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import mongoose from 'mongoose'

type Category = 'bread' | 'cake' | 'cookie' | 'dessert'

export interface IIngredient {
  name: string
  amount: number
  unit: string
}

export interface IStep {
  order: number
  description: string
  image?: string
  temperature?: number
  duration?: number
}

export interface IComment {
  _id: string
  content: string
  author: string
  createdAt: Date
}

export interface IChapter {
  title: string
  duration: number
  videoUrl: string
  order: number
}

export interface IUser {
  _id: string
  username: string
  email: string
  password: string
  avatar: string
  bio: string
  following: string[]
  followers: string[]
  likedRecipes: string[]
  favoritedRecipes: string[]
  likedPosts: string[]
  courseProgress: Record<string, string[]>
  createdAt: Date
  updatedAt: Date
}

export interface IRecipe {
  _id: string
  title: string
  description: string
  cover: string
  category: Category
  difficulty: number
  duration: number
  servings: number
  temperature: number
  bakingTime: number
  ingredients: IIngredient[]
  steps: IStep[]
  author: string
  likes: string[]
  favorites: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IPost {
  _id: string
  images: string[]
  content: string
  recipe?: string
  author: string
  likes: string[]
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
}

export interface ICourse {
  _id: string
  title: string
  cover: string
  description: string
  price: number
  author: string
  chapters: IChapter[]
  createdAt: Date
  updatedAt: Date
}

const USERS_SEED = [
  {
    username: '烘焙达人小美',
    email: 'xiaomei@bake.com',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
    bio: '资深烘焙师，10年烘焙经验，擅长蛋糕和面包制作。热爱分享烘焙知识与技巧。',
  },
  {
    username: '甜品控阿杰',
    email: 'ajie@bake.com',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    bio: '甜品爱好者，喜欢尝试各种新鲜的烘焙食谱，尤其是饼干和甜点！',
  },
  {
    username: '新手小白',
    email: 'xiaobai@bake.com',
    password: '123456',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    bio: '刚开始学习烘焙，希望能和大家一起进步！',
  },
]

const RECIPES_SEED = [
  {
    title: '北海道吐司',
    description: '超级柔软的北海道吐司，奶香浓郁，入口即化。使用中种法制作，面包组织细腻拉丝。',
    cover: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
    category: 'bread' as const,
    difficulty: 3,
    duration: 300,
    servings: 1,
    temperature: 180,
    bakingTime: 35,
    ingredients: [
      { name: '高筋面粉（中种）', amount: 250, unit: 'g' },
      { name: '细砂糖（中种）', amount: 7.5, unit: 'g' },
      { name: '干酵母（中种）', amount: 1.5, unit: 'g' },
      { name: '牛奶（中种）', amount: 80, unit: 'g' },
      { name: '淡奶油（中种）', amount: 70, unit: 'g' },
      { name: '蛋白（中种）', amount: 17.5, unit: 'g' },
      { name: '奶粉（主面团）', amount: 15, unit: 'g' },
      { name: '细砂糖（主面团）', amount: 45, unit: 'g' },
      { name: '盐（主面团）', amount: 3, unit: 'g' },
      { name: '干酵母（主面团）', amount: 1, unit: 'g' },
      { name: '黄油（主面团）', amount: 15, unit: 'g' },
    ],
    steps: [
      { order: 1, description: '将中种材料混合成团，室温发酵至两倍大。', duration: 120 },
      { order: 2, description: '中种撕成小块与主面团材料（除黄油）混合，揉至扩展阶段。', duration: 20 },
      { order: 3, description: '加入软化黄油，继续揉至完全阶段。', duration: 15 },
      { order: 4, description: '面团收圆，松弛30分钟。', duration: 30 },
      { order: 5, description: '分割成3等份，滚圆松弛15分钟。', duration: 15 },
      { order: 6, description: '两次擀卷后放入吐司模，发酵至8-9分满。', duration: 60, temperature: 38 },
      { order: 7, description: '烤箱预热180度，下层烘烤35分钟，上色后盖锡纸。', duration: 35, temperature: 180 },
    ],
  },
  {
    title: '经典戚风蛋糕',
    description: '轻盈柔软的经典戚风蛋糕，蛋香浓郁，是烘焙入门的必学配方。',
    cover: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop',
    category: 'cake' as const,
    difficulty: 2,
    duration: 90,
    servings: 8,
    temperature: 150,
    bakingTime: 55,
    ingredients: [
      { name: '鸡蛋（带壳约60g）', amount: 5, unit: '个' },
      { name: '细砂糖（蛋白）', amount: 60, unit: 'g' },
      { name: '细砂糖（蛋黄）', amount: 30, unit: 'g' },
      { name: '牛奶', amount: 50, unit: 'g' },
      { name: '玉米油', amount: 50, unit: 'g' },
      { name: '低筋面粉', amount: 85, unit: 'g' },
      { name: '柠檬汁', amount: 5, unit: 'ml' },
    ],
    steps: [
      { order: 1, description: '蛋黄蛋白分开，蛋白冷藏备用。', duration: 5 },
      { order: 2, description: '蛋黄加糖搅拌至融化，加入牛奶和玉米油搅拌均匀。', duration: 10 },
      { order: 3, description: '筛入低筋面粉，翻拌至无颗粒。', duration: 10 },
      { order: 4, description: '蛋白加柠檬汁打至鱼眼泡，分三次加糖打至湿性发泡。', duration: 15 },
      { order: 5, description: '取1/3蛋白霜与蛋黄糊翻拌均匀，再倒回剩余蛋白霜中翻拌均匀。', duration: 10 },
      { order: 6, description: '倒入6寸蛋糕模，轻震两下震出大气泡。', duration: 5 },
      { order: 7, description: '放入预热好的烤箱，150度烤55分钟。', duration: 55, temperature: 150 },
      { order: 8, description: '出炉立即倒扣，完全冷却后脱模。', duration: 60 },
    ],
  },
  {
    title: '经典黄油曲奇',
    description: '酥到掉渣的黄油曲奇，奶香浓郁，花纹清晰不塌。下午茶的完美伴侣！',
    cover: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
    category: 'cookie' as const,
    difficulty: 2,
    duration: 60,
    servings: 30,
    temperature: 170,
    bakingTime: 20,
    ingredients: [
      { name: '黄油（软化）', amount: 200, unit: 'g' },
      { name: '糖粉', amount: 100, unit: 'g' },
      { name: '细砂糖', amount: 30, unit: 'g' },
      { name: '鸡蛋', amount: 50, unit: 'g' },
      { name: '低筋面粉', amount: 270, unit: 'g' },
      { name: '高筋面粉', amount: 30, unit: 'g' },
      { name: '奶粉', amount: 20, unit: 'g' },
      { name: '盐', amount: 1, unit: 'g' },
      { name: '香草精', amount: 2, unit: 'ml' },
    ],
    steps: [
      { order: 1, description: '软化黄油加糖粉、细砂糖和盐，打发至颜色变浅体积膨大。', duration: 10 },
      { order: 2, description: '分多次加入蛋液，每次都打至完全吸收。', duration: 10 },
      { order: 3, description: '加入香草精搅拌均匀。', duration: 2 },
      { order: 4, description: '筛入低粉、高粉和奶粉，翻拌至无干粉。', duration: 5 },
      { order: 5, description: '装入裱花袋，在烤盘上挤出喜欢的花型。', duration: 15 },
      { order: 6, description: '烤箱预热170度，中层烤约20分钟至边缘金黄。', duration: 20, temperature: 170 },
      { order: 7, description: '出炉移至冷却架冷却后密封保存。', duration: 15 },
    ],
  },
  {
    title: '法式焦糖布丁',
    description: '经典法式甜品，嫩滑的布丁搭配焦糖酱，入口即化，超级治愈！',
    cover: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop',
    category: 'dessert' as const,
    difficulty: 2,
    duration: 90,
    servings: 6,
    temperature: 160,
    bakingTime: 40,
    ingredients: [
      { name: '白砂糖（焦糖）', amount: 80, unit: 'g' },
      { name: '水（焦糖）', amount: 20, unit: 'g' },
      { name: '牛奶', amount: 400, unit: 'g' },
      { name: '淡奶油', amount: 100, unit: 'g' },
      { name: '细砂糖', amount: 50, unit: 'g' },
      { name: '鸡蛋', amount: 100, unit: 'g' },
      { name: '蛋黄', amount: 40, unit: 'g' },
      { name: '香草荚', amount: 0.5, unit: '根' },
    ],
    steps: [
      { order: 1, description: '焦糖部分：糖和水放入小锅，小火煮至琥珀色。', duration: 15 },
      { order: 2, description: '焦糖趁热倒入布丁杯底铺满。', duration: 5 },
      { order: 3, description: '牛奶、淡奶油、糖和香草荚加热至微沸，焖10分钟。', duration: 20 },
      { order: 4, description: '鸡蛋和蛋黄打散，慢慢倒入温热的奶液边倒边搅拌。', duration: 10 },
      { order: 5, description: '布丁液过筛两次倒入布丁杯。', duration: 5 },
      { order: 6, description: '烤盘中加水，布丁杯放入，水浴法160度烤40分钟。', duration: 40, temperature: 160 },
      { order: 7, description: '冷藏4小时以上口感更佳。', duration: 240 },
    ],
  },
  {
    title: '全麦核桃欧包',
    description: '健康的全麦欧包，外壳酥脆内里柔软，满满的核桃香，早餐首选！',
    cover: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&h=600&fit=crop',
    category: 'bread' as const,
    difficulty: 4,
    duration: 480,
    servings: 1,
    temperature: 230,
    bakingTime: 30,
    ingredients: [
      { name: '高筋面粉', amount: 350, unit: 'g' },
      { name: '全麦面粉', amount: 100, unit: 'g' },
      { name: '盐', amount: 10, unit: 'g' },
      { name: '干酵母', amount: 4, unit: 'g' },
      { name: '温水', amount: 350, unit: 'g' },
      { name: '核桃仁', amount: 100, unit: 'g' },
    ],
    steps: [
      { order: 1, description: '所有粉类混合，加水用刮刀拌成团，静置30分钟。', duration: 30 },
      { order: 2, description: '每隔30分钟拉伸折叠一次，共4次。', duration: 120 },
      { order: 3, description: '加入核桃仁揉匀，室温发酵至两倍大。', duration: 120 },
      { order: 4, description: '轻压排气，整形后放入发酵篮二发。', duration: 90 },
      { order: 5, description: '烤箱230度预热，石板和铸铁锅同时预热。', duration: 60, temperature: 230 },
      { order: 6, description: '面团转移到烤盘，割包后放入烤箱喷蒸汽。', duration: 2 },
      { order: 7, description: '230度烤30分钟，取出冷却。', duration: 30, temperature: 230 },
    ],
  },
  {
    title: '提拉米苏',
    description: '意式经典甜品，咖啡与马斯卡彭的完美结合，层层惊喜。',
    cover: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop',
    category: 'dessert' as const,
    difficulty: 3,
    duration: 120,
    servings: 8,
    temperature: 0,
    bakingTime: 0,
    ingredients: [
      { name: '马斯卡彭奶酪', amount: 500, unit: 'g' },
      { name: '细砂糖', amount: 100, unit: 'g' },
      { name: '鸡蛋', amount: 4, unit: '个' },
      { name: '淡奶油', amount: 300, unit: 'g' },
      { name: '手指饼干', amount: 200, unit: 'g' },
      { name: '浓缩咖啡', amount: 300, unit: 'ml' },
      { name: '朗姆酒', amount: 30, unit: 'ml' },
      { name: '可可粉', amount: 20, unit: 'g' },
    ],
    steps: [
      { order: 1, description: '蛋黄加糖隔水加热打发至颜色变浅。', duration: 15 },
      { order: 2, description: '加入马斯卡彭奶酪搅拌均匀。', duration: 10 },
      { order: 3, description: '淡奶油打至6分发，与奶酪糊混合。', duration: 15 },
      { order: 4, description: '蛋白打至硬性发泡，分两次拌入奶酪糊。', duration: 10 },
      { order: 5, description: '咖啡加朗姆酒混合，手指饼干快速蘸取。', duration: 10 },
      { order: 6, description: '一层饼干一层奶酪糊，铺好后冷藏4小时以上。', duration: 240 },
      { order: 7, description: '食用前筛上可可粉即可。', duration: 5 },
    ],
  },
]

const POSTS_SEED = [
  {
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=800&fit=crop'],
    content: '第一次尝试北海道吐司，太成功了！拉丝效果超级棒，组织细腻柔软，奶香味十足～感谢小美的配方！',
  },
  {
    images: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=800&fit=crop'],
    content: '周末下午茶时间～黄油曲奇配手冲咖啡，幸福感爆棚！酥到掉渣，家里人都超爱吃。',
  },
  {
    images: ['https://images.unsplash.com/photo-1586985289688-ca3cf47d3e4e?w=800&h=800&fit=crop'],
    content: '焦糖布丁🍮 滑嫩嫩的，焦糖香气浓郁，冷藏以后更好吃！',
  },
  {
    images: ['https://images.unsplash.com/photo-1612203985729-70726954388c?w=800&h=800&fit=crop'],
    content: '给朋友做的生日蛋糕🎂 戚风蛋糕胚超级成功，虽然裱花还有进步空间，但心意满满！',
  },
]

const COURSES_SEED = [
  {
    title: '烘焙入门：从零开始学蛋糕',
    cover: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=800&h=500&fit=crop',
    description: '适合烘焙新手的完整课程，从工具介绍、材料认识到基础蛋糕制作，一步步带你走进烘焙的世界。包含戚风蛋糕、海绵蛋糕等经典配方。',
    price: 99,
    chapters: [
      { title: '烘焙工具介绍', duration: 15, videoUrl: 'https://example.com/course/1/1', order: 1 },
      { title: '烘焙材料认识', duration: 20, videoUrl: 'https://example.com/course/1/2', order: 2 },
      { title: '基础操作手法', duration: 25, videoUrl: 'https://example.com/course/1/3', order: 3 },
      { title: '经典戚风蛋糕', duration: 40, videoUrl: 'https://example.com/course/1/4', order: 4 },
      { title: '海绵蛋糕制作', duration: 35, videoUrl: 'https://example.com/course/1/5', order: 5 },
      { title: '常见问题解答', duration: 20, videoUrl: 'https://example.com/course/1/6', order: 6 },
    ],
  },
  {
    title: '面包进阶：欧包与吐司的艺术',
    cover: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&h=500&fit=crop',
    description: '深入学习面包制作技术，掌握天然酵母培养、面团发酵控制、欧包割包技巧等专业技能，制作出媲美面包店的美味面包。',
    price: 199,
    chapters: [
      { title: '面粉与蛋白质', duration: 18, videoUrl: 'https://example.com/course/2/1', order: 1 },
      { title: '天然酵母培养', duration: 30, videoUrl: 'https://example.com/course/2/2', order: 2 },
      { title: '面团搅拌理论', duration: 25, videoUrl: 'https://example.com/course/2/3', order: 3 },
      { title: '发酵与温度控制', duration: 35, videoUrl: 'https://example.com/course/2/4', order: 4 },
      { title: '北海道吐司详解', duration: 45, videoUrl: 'https://example.com/course/2/5', order: 5 },
      { title: '硬欧包制作技巧', duration: 50, videoUrl: 'https://example.com/course/2/6', order: 6 },
      { title: '割包艺术与造型', duration: 30, videoUrl: 'https://example.com/course/2/7', order: 7 },
    ],
  },
]

export interface DataStore {
  users: IUser[]
  recipes: IRecipe[]
  posts: IPost[]
  courses: ICourse[]
  initialized: boolean
}

export const store: DataStore = {
  users: [],
  recipes: [],
  posts: [],
  courses: [],
  initialized: false,
}

const generateId = (): string => {
  return crypto.randomUUID()
}

export const initializeStore = async (): Promise<void> => {
  if (store.initialized) {
    return
  }

  const now = new Date()

  const hashedUsers = await Promise.all(
    USERS_SEED.map(async (user) => ({
      ...user,
      _id: generateId(),
      password: await bcrypt.hash(user.password, 10),
      avatar: user.avatar,
      bio: user.bio,
      following: [] as string[],
      followers: [] as string[],
      likedRecipes: [] as string[],
      favoritedRecipes: [] as string[],
      likedPosts: [] as string[],
      courseProgress: {} as Record<string, string[]>,
      createdAt: now,
      updatedAt: now,
    })),
  )

  store.users = hashedUsers
  const authorId = store.users[0]._id
  const user1Id = store.users[1]._id
  const user2Id = store.users[2]._id

  store.recipes = RECIPES_SEED.map((recipe) => ({
    ...recipe,
    _id: generateId(),
    author: authorId,
    likes: [user1Id, user2Id].slice(0, Math.floor(Math.random() * 3)),
    favorites: [user1Id].slice(0, Math.floor(Math.random() * 2)),
    createdAt: now,
    updatedAt: now,
  }))

  store.users[1].likedRecipes = [store.recipes[0]._id, store.recipes[1]._id]
  store.users[1].favoritedRecipes = [store.recipes[1]._id]
  store.users[1].following = [authorId]
  store.users[2].likedRecipes = [store.recipes[0]._id]
  store.users[2].following = [authorId]
  store.users[0].followers = [user1Id, user2Id]

  store.posts = POSTS_SEED.map((post, index) => {
    const authorIndex = index % store.users.length
    return {
      ...post,
      _id: generateId(),
      author: store.users[authorIndex]._id,
      recipe: index < 2 ? store.recipes[index % store.recipes.length]._id : undefined,
      likes: store.users.filter((_, i) => i !== authorIndex).map((u) => u._id),
      comments: [
        {
          _id: generateId(),
          content: index === 0 ? '太棒了，看起来好好吃！' : '下次我也试试！',
          author: store.users[(index + 1) % store.users.length]._id,
          createdAt: new Date(),
        },
      ],
      createdAt: now,
      updatedAt: now,
    }
  })

  store.courses = COURSES_SEED.map((course) => ({
    ...course,
    _id: generateId(),
    author: authorId,
    createdAt: now,
    updatedAt: now,
  }))

  store.initialized = true
}

export default store
