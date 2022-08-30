import express from "express"

import multer from "multer"
import fs from "fs"
import { checkAuth } from "../utils/index.js"

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads")
    }
    cb(null, "uploads")
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({
  storage,
})

class UploadsControoler {
  async uploadImage(req, res) {
    res.json({
      url: `/upload/${req.file.originalname}`,
    })
  }
}

const routerController = new UploadsControoler()
const router = express.Router()

router.use("/", express.static("uploads"))
router.post(
  "/",
  checkAuth,
  upload.single("image"),
  routerController.uploadImage
)

export default router
