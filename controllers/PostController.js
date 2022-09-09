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
        tags: req.body.tags,
        user: req.userId,
        selectedItems: req.body.selectedItems.map(([id, title]) => {
          return { item: id, title }
        }),
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

  async getMine(req, res) {
    try {
      const userId = req.userId
      const items = await PostModel.find({ user: userId })
        .populate("user")
        .exec()
      res.json(items)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "failed to get posts" })
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
      )
        .populate("user")
        .populate("selectedItems.item")
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
          tags: req.body.tags,
          user: req.userId,
          selectedItems: req.body.selectedItems.map(([id, title]) => {
            return { item: id, title }
          }),
        }
      )
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
        message: "Failed to remove the post",
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
// it is important to include getMine before getOne
router.get("/mine", checkAuth, routerController.getMine)
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
