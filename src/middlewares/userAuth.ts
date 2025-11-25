import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const sessionUser = req.session.user;

  if (!sessionUser) {
    return res.redirect("/");
  }

  if (sessionUser.role === "admin") {
    return res.redirect("/admin/dashboard");
  }

  try {
    const fresh = await User.findById(sessionUser._id).lean();
    if (!fresh) {
      req.session.user = undefined;
      return res.redirect("/");
    }

    if (fresh.isBlocked) {
      req.session.user = undefined;
      return req.session.save(() => {
        return res.render("user/login", {
          error: "Your account has been blocked by admin"
        });
      });
    }
  
    return next();

  } catch (err) {
    console.error("userAuth error:", err);
    return res.status(500).send("Server error");
  }
};

