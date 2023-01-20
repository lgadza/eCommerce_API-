import express from "express";
import createHttpError from "http-errors";
import ProductModel from "./model.js";
import q2m from "query-to-mongo";

const productRouter = express.Router();

productRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body);

    const { _id } = await newProduct.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productRouter.get("/", async (req, res, next) => {
  try {
    // let mongoQuery;
    // if (req.query.limit && req.query.skip) {
    //   mongoQuery = q2m(req.query);
    // } else {
    //   mongoQuery = q2m({ skip: 1, limit: 1 });
    // }
    const mongoQuery = q2m(req.query);
    const { total, products } = await ProductModel.findProductsWithReviews(
      mongoQuery
    );

    res.send({
      links: mongoQuery.links("http://localhost:3001/products", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId", async (req, res, next) => {
  try {
    const products = await ProductModel.findById(req.params.productId).populate(
      {
        path: "reviews",
      }
    );
    if (products) {
      res.send({
        links: mongoQuery.links("http://localhost:3001/products", total),
        totalPages: Math.ceil(total / mongoQuery.options.limit),
        products,
      });
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.put("/:productId", async (req, res, next) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
      res.send(updatedProduct);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.delete("/:productId", async (req, res, next) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(
      req.params.productId
    );

    if (deletedProduct) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
// ********************************** EMBEDDING**************************
productRouter.post("/:productId", async (req, res, next) => {
  try {
    const currentReview = req.body;

    if (currentReview) {
      const productToInsert = {
        ...req.body,
        reviewDate: new Date(),
      };

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { $push: { reviews: productToInsert } },
        { new: true, runValidators: true }
      );
      console.log("this is me", updatedProduct);

      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(404, `Product with id ${req.body.productId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (product) {
      res.send(product.reviews);
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (product) {
      console.log(product);
      const currentReview = product.reviews.find(
        (product) => product._id.toString() === req.params.reviewId
      );
      console.log(currentReview);
      if (currentReview) {
        res.send(currentReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.productId);

    if (product) {
      const index = product.reviews.findIndex(
        (product) => product._id.toString() === req.params.reviewId
      );
      if (index !== -1) {
        product.reviews[index] = {
          ...product.reviews[index].toObject(),
          ...req.body,
        };

        await product.save();
        res.send(product);
      } else {
        next(
          createHttpError(
            404,
            `Review with id ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

productRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        req.params.productId,
        { $pull: { reviews: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedProduct) {
        res.send(updatedProduct);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
productRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const review = req.body;
    const product = await ProductModel.findById(req.params.productId);
    if (!product)
      return next(
        createHttpError(
          404,
          `Product with id ${req.params.productId} not found`
        )
      );
    // const like = await ReviewsModel.findById(reviewId);
    // if (!like)
    //   return next(
    //     createHttpError(404, `Review with id ${reviewId} not found!`)
    //   );
    const isLiked = await LikesModel.findOne({
      product: req.params.productId,
      status: "Like",
      "likes.reviewId": reviewId,
    });
    if (isLiked) {
      // const quantity = -1;
      // await LikesModel.findOneAndUpdate(
      //   {
      //     product: req.params.productId,
      //     "likes.reviewId": reviewId,
      //   },
      //   { $inc: { "likes.$.quantity": quantity } }
      // );
      const updatedLike = await LikesModel.findOneAndUpdate(
        {
          product: req.params.productId,
          "likes.reviewId": reviewId,
        },
        { $pull: { likes: { _id: req.params.reviewId } } },
        { new: true }
      );
      if (updatedLike) {
        res.send(updatedLike);
      } else {
        next(
          createHttpError(
            404,
            `Product with id ${req.params.productId} not found!`
          )
        );
      }
    } else {
      const modifiedLike = await LikesModel.findOneAndUpdate(
        {
          product: req.params.productId,
          status: "Like",
        },
        {
          $push: { likes: { reviewId: reviewId }, quantity },
        },
        {
          new: true,
          runValidators: true,
          upsert: true,
        }
      );
      res.send(modifiedLike);
    }
  } catch (error) {
    next(error);
  }
});

export default productRouter;
