import mongoose, { Document, Schema } from "mongoose";

export interface IIssue extends Document {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  userId: mongoose.Types.ObjectId;
  userName: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title:       { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: {
      type: String,
      required: true,
      enum: ["pothole", "garbage", "streetlight", "water", "dumping", "road", "sewage", "other"],
    },
    imageUrl:  { type: String, required: true },
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IIssue>("Issue", IssueSchema);