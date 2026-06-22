import mongoose, { Schema, type Model, type Document } from 'mongoose'

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

export interface IRecipe extends Document {
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
  author: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  favorites: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false },
)

const StepSchema = new Schema<IStep>(
  {
    order: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    temperature: { type: Number },
    duration: { type: Number },
  },
  { _id: false },
)

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    cover: { type: String, required: true },
    category: { type: String, required: true, enum: ['bread', 'cake', 'cookie', 'dessert'] },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    duration: { type: Number, required: true },
    servings: { type: Number, required: true },
    temperature: { type: Number, required: true },
    bakingTime: { type: Number, required: true },
    ingredients: [IngredientSchema],
    steps: [StepSchema],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favorites: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

const Recipe: Model<IRecipe> = mongoose.model<IRecipe>('Recipe', RecipeSchema)

export default Recipe
