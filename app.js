import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "dotenv";
import errorMiddleware from "./middlewares/error-middleware.js";

import {
  AuthController,
  PostsController,
  UploadsController,
  ProductsController,
  CommentsController,
  UsersController,
} from "./controllers/index.js";
import cookieParser from "cookie-parser";

config();
const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.get("/", (req, res) => {
  res.send(`Server on port ${PORT}`);
});
app.use("/auth", AuthController);
app.use("/posts", PostsController);
app.use("/upload", UploadsController);
app.use("/products", ProductsController);
app.use("/comments", CommentsController);
app.use("/users", UsersController);

app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose
      .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Connected to database"));
    app.listen(PORT, function () {
      console.log("Started application on port %d", 3001);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(`Some error occured: ${e}`);
  }
};

start();
