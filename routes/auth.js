const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto"); // for generating token for reset password (module from nodejs itself)
const User = mongoose.model("User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, SENDGRID_KEY } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_KEY,
    },
  })
);

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello user");
});

router.post("/signup", (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res // we wont be proceeding further so return
      .status(422)
      .json({ error: "please add all the required fields" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res // we wont be proceeding further so return
          .status(422)
          .json({ error: "User already exists with that email" });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({ email, password: hashedPassword, name, pic });

        user
          .save()
          .then((user) => {
            transporter
              .sendMail({
                to: user.email,
                from: "support@instagram.com",
                subject: "signup success",
                html: "<h1>Welcome to instagram</h1>",
              })
              .catch((err) => {
                console.log(err);
              });

            res.json({ message: "saved successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(422).json({ error: "please add email or password" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email or password" });
    }

    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({ message: "successfully signed in" });
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const { _id, name, email, followers, following, pic } = savedUser;
          res.json({
            token,
            user: { _id, name, email, followers, following, pic },
          });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/reset-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex"); // to convert the hex to string
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User does not exist with that email" });
      }
      user.resetToken = token;
      user.tokenExpiry = Date.now() + 3600000; // cur time + 1hr

      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "support@instagram.com",
          subject: "password-reset",
          html: `
            <p>You requested for password reset</p>
            <h5>click on this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>
          `,
          // backticks for multiline
        });
        res.json({ message: "check your email for password reset" });
      });
    });
  });
});

router.post("/new-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;

  User.findOne({ resetToken: sentToken, tokenExpiry: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "Session expired! please try again 😟" });
      }
      bcrypt.hash(newPassword, 12).then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.tokenExpiry = undefined;
        user.save().then((savedUser) => {
          res.json({ message: "Password reset Success" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
module.exports = router;
