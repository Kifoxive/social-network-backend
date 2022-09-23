import express from "express"

import UserModel from "../models/User.js"

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
    const userId = req.params.id
    try {
      const users = await UserModel.findOne({ _id: userId })
        .select(["-passwordHash", "-__v"])
        .exec()
      res.json(users)
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed to get users" })
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
router.get("/:id", routerController.getOne)

export default router
