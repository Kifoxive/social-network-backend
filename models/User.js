import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    friends: [
      {
        friend: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    aboutMe: {
      type: String,
      default: "Hello",
    },
    postsCount: {
      type: Number,
      default: 0,
    },
    productsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const UserModel = mongoose.model("User", UserSchema)
export default UserModel
