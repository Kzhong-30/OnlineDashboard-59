import mongoose, { Schema, type Model, type Document } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
  following: mongoose.Types.ObjectId[]
  followers: mongoose.Types.ObjectId[]
  likedRecipes: mongoose.Types.ObjectId[]
  favoritedRecipes: mongoose.Types.ObjectId[]
  likedPosts: mongoose.Types.ObjectId[]
  courseProgress: Record<string, mongoose.Types.ObjectId[]>
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likedRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    favoritedRecipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    courseProgress: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema)

export default User
