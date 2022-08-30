import jwt from "jsonwebtoken"

export default (req, res, next) => {
  const token = (req.headers.authorization || "").replace(/Bearer\s?/, "")

  if (token) {
    try {
      const decoded = jwt.verify(token, "secret123")
      req.userId = decoded._id

      next()
    } catch (err) {
      return res.send(403).json({ message: "Forbidden" })
    }
  } else {
    return res.send(403).json({
      message: "Forbidden",
    })
  }
}
