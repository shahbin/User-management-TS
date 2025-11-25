import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

router.get("/admin/login", (req: Request, res: Response) => {
  res.render("admin/admin-login", { error: null });
});

router.post("/admin/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      return res.render("admin/admin-login", {
        error: "Invalid admin credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render("admin/admin-login", {
        error: "Invalid admin credentials",
      });
    }

    (req.session as any).admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    return res.redirect("/admin/dashboard");

  } catch (err) {
    console.error("Admin login error:", err);
    return res.render("admin/admin-login", {
      error: "Server error, try again!",
    });
  }
});

router.get("/admin/dashboard", adminAuth, async (req: Request, res: Response) => {
  try {
    const admin = (req.session as any).admin;

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", isBlocked: false });
    const blockedUsers = await User.countDocuments({ role: "user", isBlocked: true });

    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalUsers / limit);

    return res.render("admin/dashboard", {
      admin,
      users,
      page,
      totalPages,
      totalUsers,
      activeUsers,
      blockedUsers
    });

  } catch (err) {
    console.error("Dashboard load error:", err);
    res.status(500).send("Error loading dashboard");
  }
});


router.get("/admin/block/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: true });

    const page = req.query.page ? `?page=${req.query.page}` : "";
    res.redirect(`/admin/dashboard${page}`);

  } catch (err) {
    console.log("Block user error:", err);
    res.redirect("/admin/dashboard");
  }
});

router.get("/admin/unblock/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isBlocked: false });

    const page = req.query.page ? `?page=${req.query.page}` : "";
    res.redirect(`/admin/dashboard${page}`);

  } catch (err) {
    console.log("Unblock user error:", err);
    res.redirect("/admin/dashboard");
  }
});

router.get("/admin/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
