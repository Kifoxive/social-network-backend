import express from "express"

import ProductModel from "../models/Product.js"
import { productCreateValidation } from "../validators/validations.js"
import { checkAuth, handleValidationErrors } from "../utils/index.js"

class ProductsController {
  async create(req, res) {
    try {
      const doc = new ProductModel({
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags,
        user: req.userId,
        price: req.body.price,
        currency: req.body.currency,
      })
      const product = await doc.save()
      res.json(product)
    } catch (err) {
      console.log(err)
      res.status(500).json({
        message: "Failed to create product",
      })
    }
  }

  // async getAll(req, res) {
  //   try {
  //     const products = await ProductModel.find().populate("user").exec()
  //     res.json(products)
  //   } catch (err) {
  //     console.log(err)
  //     res.status(500).json({
  //       message: "Failed to get products",
  //     })
  //   }
  // }

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
          res.json(doc)
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

          res.json({ success: true })
        }
      )
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
// router.get("/", routerController.getAll)
// it is important to include getMine before getOne
router.get("/mine", checkAuth, routerController.getMine)
router.get("/:id", routerController.getOne)
router.patch(
  "/:id",
  checkAuth,
  productCreateValidation,
  handleValidationErrors,
  routerController.update
)
router.delete("/:id", checkAuth, routerController.remove)

export default router
