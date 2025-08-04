import User from "../models/user.js";
import asyncHandler from 'express-async-handler'

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
   return res.status(400).json({ message: "Please provide all fields" });
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
   return res.status(400).json({ message: "User already exist" });
  }
    const user = new User({
      name,
      email,
      password,
    });
     const token = await user.getJwt()
    await user.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });

});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }
 
    const user = await User.findOne({ email }).select("+password");
    if(!user || !(await user.comparePassword(password))){
        return res.status(401).json({message: "Invalid email or password"})
    }
    const token = await user.getJwt()
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token
    })
 
});
