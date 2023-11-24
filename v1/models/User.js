const mongoose = require("mongoose");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "FirstName is required."],
    },
    lastName: {
      type: String,
      required: [true, "LastName is required."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      immutable: [true, "Username can't be modified."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: [true, "Email should be unique."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
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
      default: 'local'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
