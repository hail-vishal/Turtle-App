const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  tokenExpiry: Date,
  pic: {
    type: String,
    default:
      "https://res.cloudinary.com/hailvishal/image/upload/v1644432593/avatar-man-icon-profile-placeholder-260nw-1229862502_xraq5a.jpg",
  },
  followers: [{ type: ObjectId, ref: "User" }],
  following: [{ type: ObjectId, ref: "User" }],
});

mongoose.model("User", userSchema);
