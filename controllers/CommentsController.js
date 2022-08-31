import express from "express"

import CommentModel from "../models/Comment.js"
import checkAuth from "../utils/checkAuth.js"
import { commentCreateValidation } from "../validators/validations.js"

class CommentsController {
  async createComment(req, res) {
    try {
      const doc = new CommentModel({
        text: req.body.text,
        user: req.userId,
        item: req.body.item,
      })

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
    const itemId = req.body.item

    const items = await CommentModel.find({ post: itemId })
      .populate({
        path: "user",
        model: "User",
        select: ["fullName", "avatarUrl"],
      })
      .select()
      .exec()
    res.json(items)
    try {
    } catch (err) {
      console.log(err)
      res.status(404).json({
        message: "The comment did not found",
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
  routerController.createComment
)
router.get("/:id", routerController.getComments)

export default router
