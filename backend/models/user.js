const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    avatar: { type: String },
    provider: { type: String, enum: ["local", "google", "github"], required: true },
    providerId: { type: String }, // OAuth provider ID
    passwordHash: { type: String }, // only for local
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
