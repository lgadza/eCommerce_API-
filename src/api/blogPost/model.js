import mongoose from "mongoose";
import commentsSchema from "../comments/model.js";
import likesSchema from "./likesModel.js";

const { Schema, model } = mongoose;

const blogPostSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["history", "horror", "romance", "fantasy", "Politics"],
    },
    title: { type: String, required: true },
    cover: { type: String },
    readTime: {
      value: { type: Number },
      unit: { type: String },
    },
    author: {
      name: { type: String, required: true },
      avatar: { type: String },
    },
    // comments: { type: Array, required: true },
    comments: [commentsSchema],
    likes: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
  },
  {
    timestamps: true,
  }
);
blogPostSchema.static("findBlogPostsWithAuthors", async function (query) {
  const total = await this.countDocuments(query.criteria);

  const blogPosts = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({
      path: "authors",
      select: "firstName lastName",
    });
  return { total, blogPosts };
});
export default model("blogPost", blogPostSchema);
