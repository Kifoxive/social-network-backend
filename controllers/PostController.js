import express from "express"

import PostModel from "../models/Post.js"
import { postCreateValidation } from "../validators/validations.js"
import { checkAuth, handleValidationErrors } from "../utils/index.js"

class PostController {
  async create(req, res) {
    try {
      const doc = new PostModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.split(","),
        user: req.userId,
      })

      const post = await doc.save()
      res.json(post)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to create post",
      })
    }
  }

  async getAll(req, res) {
    try {
      const posts = await PostModel.find().populate("user").exec()
      res.json(posts)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get posts",
      })
    }
  }

  async getOne(req, res) {
    try {
      const postId = req.params.id

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
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to get the post",
            })
          }

          if (!doc) {
            return res.status(404).json({
              message: "The post did not found",
            })
          }

          res.json(doc)
        }
      ).populate("user")
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get the post",
      })
    }
  }

  async update(req, res) {
    try {
      const postId = req.params.id
      await PostModel.updateOne(
        {
          _id: postId,
        },
        {
          title: req.body.title,
          text: req.body.text,
          imageUrl: req.body.imageUrl,
          tags: req.body.tags.split(","),
          user: req.userId,
        }
      )
      // res.json({ success: true })
      res.json({ _id: postId })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to update the post",
      })
    }
  }

  async remove(req, res) {
    try {
      const postId = req.params.id
      PostModel.findOneAndDelete(
        {
          _id: postId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to delete the post ",
            })
          }

          if (!doc) {
            return res.status(404).json({
              message: "The post did not found",
            })
          }

          res.json({ success: true })
        }
      )
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get the post",
      })
    }
  }
}

const routerController = new PostController()
const router = express.Router()

router.post(
  "/",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  routerController.create
)
router.get("/", routerController.getAll)
router.get("/:id", routerController.getOne)
router.patch(
  "/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  routerController.update
)
router.delete("/:id", checkAuth, routerController.remove)

export default router
