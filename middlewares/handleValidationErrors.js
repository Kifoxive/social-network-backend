import { validationResult } from "express-validator"

export default (req, res, next) => {
  const errors = validationResult(req.body)
  if (!errors.isEmpty()) {
    console.log(errors)
    return res.status(400).json(errors.array())
  }

  next()
}
