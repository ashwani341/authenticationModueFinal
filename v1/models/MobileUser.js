const mongoose = require("mongoose");
const mobileUserSchema = mongoose.Schema(
  {
    mobile: {
      type: String,
      unique: true,
      required: [true, "Mobile number is required."],
    },
    // username: {
    //   type: String,
    //   required: [true, "Username is required."],
    //   unique: true,
    //   immutable: [true, "Username can't be modified."],
    // },
    firstName: {
      type: String,
      // required: [true, "FirstName is required."],
    },
    lastName: {
      type: String,
      // required: [true, "LastName is required."],
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
      default: true,
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
      default: "mobile",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileUser", mobileUserSchema);
