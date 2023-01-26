import mongoose from "mongoose";
import { model, Schema } from "mongoose";
import addressModel from "./addressModel.js";

const usersModel = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  addresses: [addressModel],
});
export default model("user", usersModel);
