import express from "express"

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import UserModel from "../models/User.js"
import {
  registerValidation,
  loginValidation,
} from "../validators/validations.js"
import { checkAuth, handleValidationErrors } from "../utils/index.js"

class AuthController {
  async register(req, res) {
    try {
      const password = req.body.password
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password, salt)

      const doc = new UserModel({
        email: req.body.email,
        fullName: req.body.fullName,
        avatarUrl: req.body.avatarUrl,
        passwordHash: hash,
      })

      const user = await doc.save()

      const token = jwt.sign(
        {
          _id: user._id,
        },
        "secret123",
        {
          expiresIn: "30d",
        }
      )

      const { passwordHash, ...userData } = user._doc

      res.json({
        ...userData,
        token,
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed to register" })
    }
  }

  async login(req, res) {
    try {
      const user = await UserModel.findOne({ email: req.body.email })

      if (!user) {
        return res.status(404).json({ message: "User not found " })
      }

      const isValidPass = await bcrypt.compare(
        req.body.password,
        user._doc.passwordHash
      )

      if (!isValidPass) {
        return res.status(400).json({ message: "Bad login or password" })
      }

      const token = jwt.sign(
        {
          _id: user._id,
        },
        "secret123",
        {
          expiresIn: "30d",
        }
      )

      const { passwordHash, ...userData } = user._doc

      res.json({
        ...userData,
        token,
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed registration" })
    }
  }

  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.userId)

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        })
      }

      const { passwordHash, ...userData } = user._doc

      res.json({
        ...userData,
      })
    } catch (err) {
      res.status(500).json({ message: "Failed to get my credentials" })
    }
  }

  async updateProfile(req, res) {
    const userId = req.userId
    try {
      const { fullName, email, aboutMe, avatarUrl } = req.body

      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          fullName,
          email,
          aboutMe,
          avatarUrl,
        },
        {
          returnOriginal: false,
        }
      )

      await user.save()
      const { passwordHash, ...userData } = user._doc

      res.json({ ...userData })
    } catch (err) {
      res.status(500).json({ message: "failed to update user" })
    }
  }

  async changePassword(req, res) {
    const user = await UserModel.findById(req.userId)

    const { password, newPassword1, newPassword2 } = req.body
    if (newPassword1 !== newPassword2) {
      return res.status(400).json({ message: "Passwords are not equal" })
    }

    const isValidPass = await bcrypt.compare(password, user._doc.passwordHash)
    if (!isValidPass) {
      return res.status(400).json({ message: "Bad login or password" })
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword2, salt)

    user.passwordHash = hash
    await user.save()
    const { passwordHash, ...userData } = user._doc

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    )

    res.json({
      ...userData,
      token,
    })
    try {
    } catch (err) {
      res.status(500).json({ message: "Failed to update password" })
    }
  }
}

const routerController = new AuthController()
const router = express.Router()

router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  routerController.register
)
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  routerController.login
)
router.get("/me", checkAuth, routerController.getMe)
router.patch(
  "/update",
  checkAuth,
  registerValidation,
  handleValidationErrors,
  routerController.updateProfile
)
router.patch(
  "/change-password",
  checkAuth,
  registerValidation,
  handleValidationErrors,
  routerController.changePassword
)

export default router
