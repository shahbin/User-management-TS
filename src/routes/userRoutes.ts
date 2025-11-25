import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { userAuth } from "../middlewares/userAuth";

const router = express.Router();

router.get("/home", userAuth, (req: Request, res: Response) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) return res.redirect("/");

  const toast = req.session.toast || null;
  const toastError = req.session.toastError || null;
  const pwdError = req.session.pwdError || null;
  const openPwdModal = req.session.openPwdModal || false;

  req.session.toast = null;
  req.session.toastError = null;
  req.session.pwdError = null;
  req.session.openPwdModal = null;

  res.render("user/home", { 
    user: sessionUser,
    toast,
    toastError,
    pwdError,
    openPwdModal
  });
});

router.post("/update-name", userAuth, async (req: Request, res: Response) => {
  try {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) return res.redirect("/");

    const { name } = req.body;

    if (!name || name.trim().length < 3) {
      return res.render("user/home", {
        user: sessionUser,
        modalError: "Name must be at least 3 characters",
        toast: null,
        toastError: null,
        pwdError: null
      });
    }

    await User.findByIdAndUpdate(sessionUser._id, { name: name.trim() });

    sessionUser.name = name.trim();

    req.session.toast = "Name updated successfully!";

    return res.redirect("/home");

  } catch (err) {
    console.error("Name update error:", err);
    return res.status(500).send("Server error");
  }
});

router.post("/update-password", async (req: Request, res: Response) => {
  try {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) return res.redirect("/");

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(sessionUser._id);
    if (!user) {
      req.session.toastError = "User not found";
      return res.redirect("/home");
    }

    const showPwdModal = (msg: string) => {
      req.session.pwdError = msg;
      req.session.openPwdModal = true;  
      return res.redirect("/home");
    };

    if (!currentPassword || currentPassword.trim() === "") {
      return res.render("user/home", {
        user: sessionUser,
        pwdError: "Please enter your current password",
        toast: null,
        toastError: null
      });
    }

    if (!newPassword || newPassword.length < 8) {
      req.session.toastError = "Password must be at least 8 characters";
      return res.redirect("/home");
    }

    if (!/[A-Z]/.test(newPassword)) {
      req.session.toastError = "Password must contain an uppercase letter";
      return res.redirect("/home");
    }

    if (!/[0-9]/.test(newPassword)) {
      req.session.toastError = "Password must contain a number";
      return res.redirect("/home");
    }

    if (newPassword !== confirmPassword) {
      req.session.toastError = "New password and confirm password do not match";
      return res.redirect("/home");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return showPwdModal("Current password is incorrect");
    }


    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    req.session.toast = "Password updated successfully!";

    return res.redirect("/home");

  } catch (err) {
    console.error("Password update error:", err);
    return res.status(500).send("Server error");
  }
});


router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
