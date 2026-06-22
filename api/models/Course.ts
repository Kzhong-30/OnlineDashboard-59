import mongoose, { Schema, type Model, type Document } from 'mongoose'

export interface IChapter {
  title: string
  duration: number
  videoUrl: string
  order: number
}

export interface ICourse extends Document {
  title: string
  cover: string
  description: string
  price: number
  author: mongoose.Types.ObjectId
  chapters: IChapter[]
  createdAt: Date
  updatedAt: Date
}

const ChapterSchema = new Schema<IChapter>(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
)

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    cover: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chapters: [ChapterSchema],
  },
  { timestamps: true },
)

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema)

export default Course
