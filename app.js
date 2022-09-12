import express from "express"
import config from "config"
import mongoose from "mongoose"
import cors from "cors"

import {
  UserController,
  PostController,
  UploadsController,
  ProductsController,
  CommentsController,
} from "./controllers/index.js"

mongoose
  .connect(
    "mongodb+srv://admin:12345@clusterzero.qjqiloq.mongodb.net/network?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB ok"))
  .catch((err) => console.log("DB error", err))

const app = express()
const PORT = config.get("port") || 3001

app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
  res.send(`Server on port ${PORT}`)
})

app.use("/upload", UploadsController)
app.use("/posts", PostController)
app.use("/auth", UserController)
app.use("/products", ProductsController)
app.use("/comments", CommentsController)

app.listen(PORT, (err) => {
  if (err) console.log(err)
  console.log(`App server OK ${PORT}`)
})
