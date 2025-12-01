import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { userAuth } from "../middlewares/userAuth";

const router = express.Router();

router.get("/home", userAuth, (req: Request, res: Response): void => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    res.redirect("/");
    return;
  }

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

router.post("/update-name", userAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      res.redirect("/");
      return;
    }

    const { name }: { name: string } = req.body;

    if (!name || name.trim().length < 3) {
      res.render("user/home", {
        user: sessionUser,
        modalError: "Name must be at least 3 characters",
        toast: null,
        toastError: null,
        pwdError: null
      });
      return;
    }

    await User.findByIdAndUpdate(sessionUser._id, { name: name.trim() });

    sessionUser.name = name.trim();

    req.session.toast = "Name updated successfully!";

    res.redirect("/home");

  } catch (err: unknown) {
    res.status(500).send("Server error");
  }
});

router.post("/update-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionUser = (req.session as any).user;
    if (!sessionUser) {
      res.redirect("/");
      return;
    }

    const { currentPassword, newPassword, confirmPassword }: { 
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    } = req.body;

    const user = await User.findById(sessionUser._id);
    if (!user) {
      req.session.toastError = "User not found";
      res.redirect("/home");
      return;
    }

    const showPwdModal = (msg: string): void => {
      req.session.pwdError = msg;
      req.session.openPwdModal = true;
    };

    if (!currentPassword || currentPassword.trim() === "") {
      res.render("user/home", {
        user: sessionUser,
        pwdError: "Please enter your current password",
        toast: null,
        toastError: null
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      req.session.toastError = "Password must be at least 8 characters";
      res.redirect("/home");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      req.session.toastError = "Password must contain an uppercase letter";
      res.redirect("/home");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      req.session.toastError = "Password must contain a number";
      res.redirect("/home");
      return;
    }

    if (newPassword !== confirmPassword) {
      req.session.toastError = "New password and confirm password do not match";
      res.redirect("/home");
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      showPwdModal("Current password is incorrect");
      res.redirect("/home");
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    req.session.toast = "Password updated successfully!";

    res.redirect("/home");

  } catch (err: unknown) {
    res.status(500).send("Server error");
  }
});


router.get("/logout", (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;
