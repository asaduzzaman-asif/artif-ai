import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  credits: { type: Number, default: 5 },
  lastResetDate: { type: String, default: "" }, // প্রতিদিনের তারিখ ট্র্যাক করার জন্য
});

const User = models.User || model("User", UserSchema);
export default User;