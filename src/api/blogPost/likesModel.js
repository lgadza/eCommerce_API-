import mongoose from "mongoose";
const { Schema, model } = mongoose;

const likesSchema = new Schema(
  {
    blogPost: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "blogPost",
    },
    likes: [
      {
        authorId: { type: mongoose.Types.ObjectId, ref: " author" },
        quantity: { type: Number },
      },
    ],
    status: { type: String, required: true, enum: ["Like", "Unlike"] },
  },
  { timestamps: true }
);
export default model("like", likesSchema);
