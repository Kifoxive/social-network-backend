import express from "express"

import ItemModel from "../models/Item.js"
import { itemCreateValidation } from "../validators/validations.js"
import { checkAuth, handleValidationErrors } from "../utils/index.js"

class ItemsController {
  async create(req, res) {
    try {
      const doc = new ItemModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
        price: req.body.price,
        currency: req.body.currency,
      })
      const item = await doc.save()
      res.json(item)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to create item",
      })
    }
  }

  // async getAll(req, res) {
  //   try {
  //     const items = await ItemModel.find().populate("user").exec()
  //     res.json(items)
  //   } catch (err) {
  //     console.log(err)
  //     res.status(500).json({
  //       message: "Failed to get items",
  //     })
  //   }
  // }

  async getMine(req, res) {
    const userId = req.userId
    try {
      const items = await ItemModel.find({ user: userId })
        .populate("user")
        .exec()
      res.json(items)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get items",
      })
    }
  }

  async getOne(req, res) {
    try {
      const itemId = req.params.id
      ItemModel.findOne(
        {
          _id: itemId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to get the item",
            })
          }
          if (!doc) {
            return res.status(404).json({
              message: "The item did not found",
            })
          }
          res.json(doc)
        }
      ).populate("user")
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get the item",
      })
    }
  }

  async update(req, res) {
    try {
      const itemId = req.params.id
      await ItemModel.updateOne(
        {
          _id: itemId,
        },
        {
          title: req.body.title,
          text: req.body.text,
          imageUrl: req.body.imageUrl,
          tags: req.body.tags,
          user: req.userId,
        }
      )
      res.json({ _id: itemId })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to update the item",
      })
    }
  }

  async remove(req, res) {
    try {
      const itemId = req.params.id
      ItemModel.findOneAndDelete(
        {
          _id: itemId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to delete the item ",
            })
          }

          if (!doc) {
            return res.status(404).json({
              message: "The item did not found",
            })
          }

          res.json({ success: true })
        }
      )
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to remove the item",
      })
    }
  }
}

const routerController = new ItemsController()
const router = express.Router()

router.post(
  "/",
  checkAuth,
  itemCreateValidation,
  handleValidationErrors,
  routerController.create
)
// router.get("/", routerController.getAll)
// it is important to include getMine before getOne
router.get("/mine", checkAuth, routerController.getMine)
router.get("/:id", routerController.getOne)
router.patch(
  "/:id",
  checkAuth,
  itemCreateValidation,
  handleValidationErrors,
  routerController.update
)
router.delete("/:id", checkAuth, routerController.remove)

export default router
