import express from "express"

import CommentModel from "../models/Comment.js"
import ItemModel from "../models/Item.js"
import checkAuth from "../utils/checkAuth.js"
import handleValidationErrors from "../utils/handleValidationErrors.js"
import { commentCreateValidation } from "../validators/validations.js"

class CommentsController {
  async createComment(req, res) {
    try {
      const doc = new CommentModel({
        text: req.body.text,
        user: req.userId,
        item: req.body.item,
      })

      await ItemModel.updateOne(
        {
          _id: req.body.item,
        },
        {
          $inc: {
            commentsCount: 1,
          },
        }
      )

      const comment = await doc.save()
      res.json(comment)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to create comment",
      })
    }
  }

  async getComments(req, res) {
    try {
      const itemId = req.params.id
      const items = await CommentModel.find({ item: itemId })
        .populate({
          path: "user",
          model: "User",
          select: ["fullName", "avatarUrl"],
        })
        .exec()
      res.json(items)
    } catch (err) {
      console.log(err)
      res.status(404).json({
        message: "The comment did not found",
      })
    }
  }

  async updateComment(req, res) {
    try {
      const commentId = req.params.id
      await CommentModel.updateOne(
        {
          _id: commentId,
        },
        {
          text: req.body.text,
        }
      )
      res.json({ _id: commentId })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to update the item",
      })
    }
  }

  async removeComment(req, res) {
    try {
      const commentId = req.params.id
      CommentModel.findOneAndDelete(
        {
          _id: commentId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to remove the comment ",
            })
          }
          if (!doc) {
            return res.status(404).json({
              message: "The comment did not found",
            })
          }
        }
      )
      await ItemModel.updateOne(
        {
          _id: req.body.item,
        },
        {
          $inc: {
            commentsCount: -1,
          },
        }
      )
      res.json({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to remove the comment",
      })
    }
  }
}

const routerController = new CommentsController()
const router = express.Router()

router.post(
  "/",
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  routerController.createComment
)
router.patch(
  "/:id",
  checkAuth,
  commentCreateValidation,
  handleValidationErrors,
  routerController.updateComment
)
router.get("/:id", routerController.getComments)
router.delete("/:id", checkAuth, routerController.removeComment)

export default router
