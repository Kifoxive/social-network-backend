import express from "express"
import config from "config"
import mongoose from "mongoose"
import cors from "cors"

import {
  AuthController,
  PostsController,
  UploadsController,
  ProductsController,
  CommentsController,
  UsersController,
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
app.use("/posts", PostsController)
app.use("/auth", AuthController)
app.use("/products", ProductsController)
app.use("/comments", CommentsController)
app.use("/users", UsersController)

app.listen(PORT, (err) => {
  if (err) console.log(err)
  console.log(`App server OK ${PORT}`)
})
