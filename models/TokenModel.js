// import { Schema, model } from "mongoose";
import pkg from "mongoose";

const { Schema, model } = pkg;

const TokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    unique: true,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

const TokenModel = model("Token", TokenSchema);
export default TokenModel;
