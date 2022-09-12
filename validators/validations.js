import { body } from "express-validator"

export const registerValidation = [
  body("email", "bad email format").isEmail(),
  body("password", "the password must contain at least 5 symbols").isLength({
    min: 5,
  }),
  body("fullName", "the username must contain at least 3 symbols").isLength({
    min: 3,
  }),
  body("avatarUrl", "bad avatar link ").optional().isURL(),
]

export const loginValidation = [
  body("email", "bad email format").isEmail(),
  body("password", "the password must contain at least 5 symbols").isLength({
    min: 5,
  }),
]

export const postCreateValidation = [
  body("title", "the title is missing")
    .isLength({
      min: 3,
    })
    .isString(),
  body("text", "the text length must be 3 symbols long")
    .isLength({
      min: 3,
    })
    .isString(),
  body("tags", "bad tags format").optional().isArray(),
  body("imageUrl ", "bad image link").optional().isString(),
  body("selectedProducts", "bad products format").isArray(),
]

export const productCreateValidation = [
  body("title", "the title is missing")
    .isLength({
      min: 3,
    })
    .isString(),
  body("text", "the text length must be 3 symbols long")
    .isLength({
      min: 3,
    })
    .isString(),
  body("tags", "bad tags format").optional().isArray(),
  body("imageUrl", "bad image link").optional().isString(),
  body("price", "bad price number").isNumeric(),
  body("currency", "bad currency format").isString(),
  body("comments", "bad comments format").optional().isNumeric(),
]

export const commentCreateValidation = [
  body("text", "the text length must be 3 symbols long")
    .isLength({
      min: 3,
    })
    .isString(),
  body("likes", "bad likes format").optional().isNumeric(),
]
