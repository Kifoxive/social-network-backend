import express from "express";

import { postCreateValidation } from "../validators/validations.js";
import { checkAuth, handleValidationErrors } from "../middlewares/index.js";
import PostModel from "../models/Post.js";
import UserModel from "../models/User.js";
import PostDto from "../dtos/post-dto.js";

function isOwner(req, res, next) {
  const userId = req.userId;
  const postId = req.params.id;

  PostModel.findOne(
    {
      _id: postId,
    },
    (err, doc) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Failed to get the post",
        });
      }
      if (!doc) {
        return res.status(404).json({
          message: "The post did not found",
        });
      }
      if (doc.user.toString() === userId) {
        next();
      } else {
        return res.status(403).json({
          message: "Bad post owner",
        });
      }
    }
  );
}

class PostController {
  async create(req, res) {
    const userId = req.userId;

    try {
      const doc = new PostModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
        selectedProducts: req.body.selectedProducts.map((product) => {
          return { product };
        }),
      });
      const post = await doc.save();

      // increment users products count
      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          $inc: {
            postsCount: 1,
          },
        }
      );

      res.json({ postId: post._id });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to create post",
      });
    }
  }

  async getAll(req, res) {
    try {
      const page = req.query.page || 0;
      const postsPerPage = 10;
      await PostModel.find()
        .sort({ createdAt: -1 })
        .skip(page * postsPerPage)
        .limit(postsPerPage)
        .populate("user")
        .populate("selectedProducts")
        .exec((err, doc) => {
          const posts = doc.map((elem) => {
            return new PostDto(elem);
          });
          res.json({ posts });
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to get posts",
      });
    }
  }

  async getMine(req, res) {
    try {
      const userId = req.userId;
      await PostModel.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("selectedProducts")
        .exec((err, doc) => {
          const posts = doc.map((elem) => {
            return new PostDto(elem);
          });
          res.json({ posts });
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "failed to get posts" });
    }
  }

  async getOne(req, res) {
    try {
      const postId = req.params.id;
      PostModel.findOneAndUpdate(
        {
          _id: postId,
        },
        {
          $inc: {
            viewsCount: 1,
          },
        },
        {
          returnDocument: "after",
        }
      )
        .populate("user")
        .populate("selectedProducts")
        .exec((err, doc) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Failed to get the post",
            });
          }

          if (!doc) {
            return res.status(404).json({
              message: "The post did not found",
            });
          }
          const postDto = new PostDto(doc);
          res.json(postDto);
        });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to get the post",
      });
    }
  }

  async update(req, res) {
    try {
      const postId = req.params.id;
      await PostModel.updateOne(
        {
          _id: postId,
        },
        {
          title: req.body.title,
          text: req.body.text,
          imageUrl: req.body.imageUrl,
          tags: req.body.tags,
          user: req.userId,
          selectedProducts: req.body.selectedProducts,
        }
      );
      res.json({ postId });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to update the post",
      });
    }
  }

  async remove(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.userId;

      PostModel.findOneAndDelete(
        {
          _id: postId,
        },
        (err, doc) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Failed to delete the post ",
            });
          }
          if (!doc) {
            return res.status(404).json({
              message: "The post did not found",
            });
          }
          res.json({ success: true });
        }
      );

      // decrement users products count
      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          $inc: {
            postsCount: -1,
          },
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to remove the post",
      });
    }
  }
}

const routerController = new PostController();
const router = express.Router();

router.post(
  "/",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  routerController.create
);
router.get("/", routerController.getAll);
// it is important to include getMine before getOne
router.get("/mine", checkAuth, routerController.getMine);
router.get("/:id", routerController.getOne);
router.patch(
  "/:id",
  checkAuth,
  isOwner,
  postCreateValidation,
  handleValidationErrors,
  routerController.update
);
router.delete("/:id", checkAuth, isOwner, routerController.remove);

export default router;
