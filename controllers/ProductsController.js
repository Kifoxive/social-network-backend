import express from "express"

import { productCreateValidation } from "../validators/validations.js"
import { checkAuth, handleValidationErrors } from "../utils/index.js"
import ProductModel from "../models/Product.js"
import CommentModel from "../models/Comment.js"
import PostModel from "../models/Post.js"
import UserModel from "../models/User.js"

function isOwner(req, res, next) {
  const userId = req.userId
  const productId = req.params.id

  ProductModel.findOne(
    {
      _id: productId,
    },
    (err, doc) => {
      if (err) {
        console.log(err)
        return res.status(500).json({
          message: "Failed to get the product",
        })
      }
      if (!doc) {
        return res.status(404).json({
          message: "The product did not found",
        })
      }
      if (doc.user.toString() === userId) {
        next()
      } else {
        return res.status(403).json({
          message: "Bad product owner",
        })
      }
    }
  )
}
class ProductsController {
  async create(req, res) {
    const userId = req.userId
    try {
      const doc = new ProductModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: userId,
        price: req.body.price,
        currency: req.body.currency,
      })
      const product = await doc.save()

      // increment users products count
      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          $inc: {
            productsCount: 1,
          },
        }
      )

      res.json({ product })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to create product",
      })
    }
  }

  async getMine(req, res) {
    const userId = req.userId
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

  async getOne(req, res) {
    try {
      const productId = req.params.id
      ProductModel.findOne(
        {
          _id: productId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to get the product",
            })
          }
          if (!doc) {
            return res.status(404).json({
              message: "The product did not found",
            })
          }
          res.json({ product: doc })
        }
      ).populate("user")
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to get the product",
      })
    }
  }

  async update(req, res) {
    try {
      const productId = req.params.id
      await ProductModel.updateOne(
        {
          _id: productId,
        },
        {
          title: req.body.title,
          text: req.body.text,
          imageUrl: req.body.imageUrl,
          tags: req.body.tags,
          user: req.userId,
        }
      )
      res.json({ _id: productId })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to update the product",
      })
    }
  }

  async remove(req, res) {
    try {
      const productId = req.params.id
      const userId = req.userId

      ProductModel.findOneAndDelete(
        {
          _id: productId,
        },
        (err, doc) => {
          if (err) {
            console.log(err)
            return res.status(500).json({
              message: "Failed to delete the product ",
            })
          }

          if (!doc) {
            return res.status(404).json({
              message: "The product did not found",
            })
          }
        }
      )

      // remove all comments of the product
      CommentModel.deleteMany(
        {
          product: productId,
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

      // remove this product in every post
      await PostModel.updateMany(
        {
          ["selectedProducts.product"]: productId,
        },
        {
          $pull: { selectedProducts: { product: productId } },
        }
      )

      // decrement users products count
      await UserModel.updateOne(
        {
          _id: userId,
        },
        {
          $inc: {
            productsCount: -1,
          },
        }
      )

      res.json({ success: true })
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to remove the product",
      })
    }
  }
}

const routerController = new ProductsController()
const router = express.Router()

router.post(
  "/",
  checkAuth,
  productCreateValidation,
  handleValidationErrors,
  routerController.create
)
// it is important to include getMine before getOne
router.get("/mine", checkAuth, routerController.getMine)
router.get("/:id", routerController.getOne)
router.patch(
  "/:id",
  checkAuth,
  isOwner,
  productCreateValidation,
  handleValidationErrors,
  routerController.update
)
router.delete("/:id", checkAuth, isOwner, routerController.remove)

export default router
