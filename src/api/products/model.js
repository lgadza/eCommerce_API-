import mongoose from "mongoose";
import ReviewsModel from "./reviewModal.js";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    reviews: [ReviewsModel],
  },
  {
    timestamps: true,
  }
);
productSchema.static("findProductsWithReviews", async function (query) {
  const total = await this.countDocuments(query.criteria);

  const products = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({
      path: "reviews",
      //   select: "firstName lastName",
    });
  return { total, products };
});
export default model("product", productSchema);
