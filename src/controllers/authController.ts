import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.render("user/register", { error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("user/register", { error: "Invalid email format" });
    }

    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) {
      return res.render("user/register", { error: "Email already in use" });
    }

    if (password.length < 8) {
      return res.render("user/register", { error: "Password must be at least 8 characters" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.render("user/register", { error: "Password must contain an uppercase letter" });
    }

    if (!/[0-9]/.test(password)) {
      return res.render("user/register", { error: "Password must contain a number" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "user",
    });

    req.session.user = {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    req.session.toast = "Registration successful! Welcome 👋";

    return res.redirect("/home");

  } catch (error) {
    console.log(error);
    return res.render("user/register", { error: "Server error occurred" });
  }
};



export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", { error: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.render("user/login", { error: "Incorrect email or password" });
    }

    if (user.isBlocked) {
      return res.render("user/login", { error: "Your account has been blocked by admin" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("user/login", { error: "Incorrect email or password" });
    }

    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/home");

  } catch (error) {
    console.log(error);
    return res.render("user/login", { error: "Server error occurred" });
  }
};