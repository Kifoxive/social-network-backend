import mongoose from "mongoose"

const ModelSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      unique: true,
    },
    tags: {
      type: Array,
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: String,
    commentsCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const ItemModel = mongoose.model("Item", ModelSchema)
export default ItemModel
