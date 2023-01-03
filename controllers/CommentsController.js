import express from "express";

import CommentModel from "../models/Comment.js";
import ProductModel from "../models/Product.js";
import checkAuth from "../middlewares/checkAuth.js";
import handleValidationErrors from "../middlewares/handleValidationErrors.js";
import { commentCreateValidation } from "../validators/validations.js";

function isOwner(req, res, next) {
  const userId = req.userId;
  const commentId = req.params.id;

  CommentModel.findOne(
    {
      _id: commentId,
    },
    (err, doc) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Failed to get the comment",
        });
      }
      if (!doc) {
        return res.status(404).json({
          message: "The comment did not found",
        });
      }
      if (doc.user.toString() === userId) {
        next();
      } else {
        return res.status(403).json({
          message: "Bad comment owner",
        });
      }
    }
  );
}

class CommentsController {
  async createComment(req, res) {
    try {
      const doc = new CommentModel({
        text: req.body.text,
        user: req.userId,
        product: req.body.product,
      });

      await ProductModel.updateOne(
        {
          _id: req.body.product,
        },
        {
          $inc: {
            commentsCount: 1,
          },
        }
      );

      const comment = await doc.save();
      res.json(comment);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to create comment",
      });
    }
  }

  async getComments(req, res) {
    try {
      const productId = req.params.id;
      const products = await CommentModel.find({ product: productId })
        .populate({
          path: "user",
          model: "User",
          select: ["fullName", "avatarUrl", "_id"],
        })
        .exec();
      res.json(products);
    } catch (err) {
      console.log(err);
      res.status(404).json({
        message: "The comment did not found",
      });
    }
  }

  async updateComment(req, res) {
    try {
      const commentId = req.params.id;
      await CommentModel.updateOne(
        {
          _id: commentId,
        },
        {
          text: req.body.text,
        }
      );
      res.json({ _id: commentId });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to update the comment",
      });
    }
  }

  async removeComment(req, res) {
    try {
      const commentId = req.params.id;
      CommentModel.findOneAndDelete(
        {
          _id: commentId,
        },
        (err, doc) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Failed to remove the comment ",
            });
          }
          if (!doc) {
            return res.status(404).json({
              message: "The comment did not found",
            });
          }
        }
      );

      await ProductModel.updateOne(
        {
          _id: req.body.product,
        },
        {
          $inc: {
            commentsCount: -1,
          },
        }
      );
      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Failed to remove the comment",
      });
    }
  }
}

const routerController = new CommentsController();
const router = express.Router();

router.post(
  "/",
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  routerController.createComment
);
router.patch(
  "/:id",
  checkAuth,
  isOwner,
  commentCreateValidation,
  handleValidationErrors,
  routerController.updateComment
);
router.get("/:id", routerController.getComments);
router.delete("/:id", checkAuth, isOwner, routerController.removeComment);

export default router;
