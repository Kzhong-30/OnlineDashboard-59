import mongoose, { Schema, type Model, type Document } from 'mongoose'

export interface IComment {
  content: string
  author: mongoose.Types.ObjectId
  createdAt: Date
}

export interface IPost extends Document {
  images: string[]
  content: string
  recipe?: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  likes: mongoose.Types.ObjectId[]
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  },
)

const PostSchema = new Schema<IPost>(
  {
    images: [{ type: String, required: true }],
    content: { type: String, required: true },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
  },
  { timestamps: true },
)

const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema)

export default Post
