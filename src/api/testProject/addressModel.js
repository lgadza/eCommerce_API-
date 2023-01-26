import mongoose from "mongoose";
import { Schema } from "mongoose";

const addressModel = new Schema({
  city: { type: String, required: true },
  country: { type: String, required: true },
});
export default addressModel;
