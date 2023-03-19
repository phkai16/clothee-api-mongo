const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
// REGISTER
router.post("/register", async (req, res) => {
  const data = req.body;

  const newUser = new User({
    ...data,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const saveUser = await newUser.save();
    return res.status(201).json(saveUser);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    console.log(user);

    !user && res.status(401).json("Wrong credentials!");

    const hashPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );

    const OriginalPassword = hashPassword.toString(CryptoJS.enc.Utf8);
    !OriginalPassword && res.status(401).json("Wrong credentials!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...other } = user._doc;

    return res.status(200).json({ ...other, accessToken });
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
