import express from "express";
import createHttpError from "http-errors";
import BlogPostModel from "./model.js";
import CommentsModel from "../comments/model.js";
import q2m from "query-to-mongo";
import AuthorsModel from "../reviews/model.js";
import LikesModel from "./likesModel.js";

const blogPostRouter = express.Router();

blogPostRouter.post("/", async (req, res, next) => {
  try {
    const newBlogPost = new BlogPostModel(req.body);

    const { _id } = await newBlogPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/", async (req, res, next) => {
  // try {
  //   const blogPost = await BlogPostModel.find();
  //   res.send(blogPost);
  // } catch (error) {
  //   next(error);
  // }
  try {
    const mongoQuery = q2m(req.query);

    const { total, blogPosts } = await BlogPostModel.findBlogPostsWithAuthors(
      mongoQuery
    );

    res.send({
      links: mongoQuery.links("http://localhost:3001/blogPosts", total),
      totalPages: Math.ceil(total / mongoQuery.options.limit),
      blogPosts,
    });
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(
      req.params.blogPostId
    ).populate({
      path: "authors",
      select: "firstName lastName",
    }); //to select the fields you need
    if (blogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      req.params.blogPostId,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedBlogPost) {
      res.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(
      req.params.blogPostId
    );

    if (deletedBlogPost) {
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});
// ********************************** EMBEDDING**************************
blogPostRouter.post("/:blogPostId", async (req, res, next) => {
  try {
    // const currentComment = new CommentsModel(req.body);

    const currentComment = req.body;

    if (currentComment) {
      const blogPostToInsert = {
        ...req.body,
        commentDate: new Date(),
      };

      const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $push: { comments: blogPostToInsert } },
        { new: true, runValidators: true }
      );

      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.body.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost.comments);
    } else {
      next(
        createHttpError(
          404,
          `BlogPost with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);
      if (blogPost) {
        console.log(blogPost);
        const currentComment = blogPost.comments.find(
          (blogPost) => blogPost._id.toString() === req.params.commentId
        );
        console.log(currentComment);
        if (currentComment) {
          res.send(currentComment);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await BlogPostModel.findById(req.params.blogPostId);

      if (blogPost) {
        const index = blogPost.comments.findIndex(
          (blogPost) => blogPost._id.toString() === req.params.commentId
        );
        if (index !== -1) {
          blogPost.comments[index] = {
            ...blogPost.comments[index].toObject(),
            ...req.body,
          };

          await blogPost.save();
          res.send(blogPost);
        } else {
          next(
            createHttpError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true }
      );
      if (updatedBlogPost) {
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
blogPostRouter.post("/:blogPostId/likes", async (req, res, next) => {
  try {
    const { authorId, quantity } = req.body;
    const blogPost = await BlogPostModel.findById(req.params.blogPostId);
    if (!blogPost)
      return next(
        createHttpError(
          404,
          `Blog post with id ${req.params.blogPostId} not found`
        )
      );
    const like = await AuthorsModel.findById(authorId);
    if (!like)
      return next(
        createHttpError(404, `Author with id ${authorId} not found!`)
      );
    const isLiked = await LikesModel.findOne({
      blogPost: req.params.blogPostId,
      status: "Like",
      "likes.authorId": authorId,
    });
    if (isLiked) {
      // const quantity = -1;
      // await LikesModel.findOneAndUpdate(
      //   {
      //     blogPost: req.params.blogPostId,
      //     "likes.authorId": authorId,
      //   },
      //   { $inc: { "likes.$.quantity": quantity } }
      // );
      const updatedLike = await LikesModel.findOneAndUpdate(
        {
          blogPost: req.params.blogPostId,
          "likes.authorId": authorId,
        },
        { $pull: { likes: { _id: req.params.commentId } } },
        { new: true }
      );
      if (updatedLike) {
        res.send(updatedLike);
      } else {
        next(
          createHttpError(
            404,
            `BlogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } else {
      const modifiedLike = await LikesModel.findOneAndUpdate(
        {
          blogPost: req.params.blogPostId,
          status: "Like",
        },
        {
          $push: { likes: { authorId: authorId }, quantity },
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

export default blogPostRouter;
