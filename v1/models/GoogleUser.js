const mongoose = require("mongoose");
const googleUserSchema = mongoose.Schema(
  {
    sub: {
      type: String,
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      immutable: [true, "Username can't be modified."],
    },
    firstName: {
      type: String,
      required: [true, "FirstName is required."],
    },
    lastName: {
      type: String,
      required: [true, "LastName is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email should be unique."],
    },
    picture: {
      type: String,
    },
    roles: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Role",
    },
    accessTokens: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      required: true,
    },
    provider: {
      type: String,
      default: "google",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleUser", googleUserSchema);
