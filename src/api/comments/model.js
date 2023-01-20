import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentsSchema = new Schema(
  {
    comment: { type: String, required: true },

    // category: {
    //   type: String,
    //   required: true,
    //   enum: ["history", "horror", "romance", "fantasy"],
    // },
  },
  { timestamps: true }
);
export default commentsSchema;

// export default model("Comment", commentsSchema);
