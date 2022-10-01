import express from "express"

import UserModel from "../models/User.js"
import ProductModel from "../models/Product.js"
import PostModel from "../models/Post.js"

class UsersController {
  async getAll(req, res) {
    try {
      const users = await UserModel.find()
        .select(["fullName", "avatarUrl", "_id"])
        .exec()
      res.json(users)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed to get users" })
    }
  }

  async getOne(req, res) {
    try {
      const users = await UserModel.findById(req.params.id)
        .select(["-passwordHash", "-__v"])
        .exec()
      res.json(users)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed to get users" })
    }
  }

  async getUsersPosts(req, res) {
    const userId = req.params.id
    try {
      const posts = await PostModel.find({ user: userId })
        .populate("user")
        .populate("selectedProducts.product")
        .exec()
      res.json({ posts })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get posts",
      })
    }
  }

  async getUsersProducts(req, res) {
    const userId = req.params.id
    try {
      const products = await ProductModel.find({ user: userId })
        .populate("user")
        .exec()
      res.json({ products })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get products",
      })
    }
  }

  async getUsersFriends(req, res) {
    try {
      const friends = await UserModel.findById(req.params.id)
        .select("friends")
        .exec()
      res.json({ result: friends })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get friends",
      })
    }
  }

  async findByName(req, res) {
    const userName = req.query.name
    try {
      const users = await UserModel.find({
        fullName: { $regex: "^" + userName, $options: "i" },
      })
        .select(["fullName", "avatarUrl", "_id"])
        .exec()
      res.json(users)
    } catch (err) {
      res.status(500).json({ message: "Failed to find users" })
    }
  }
}

const routerController = new UsersController()
const router = express.Router()

router.get("/", routerController.getAll)
router.get("/search", routerController.findByName)
router.get("/:id/posts", routerController.getUsersPosts)
router.get("/:id/products", routerController.getUsersProducts)
router.get("/:id/friends", routerController.getUsersFriends)
router.get("/:id", routerController.getOne)

export default router
