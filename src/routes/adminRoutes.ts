import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

router.get("/admin/login", (req: Request, res: Response): void => {
  res.render("admin/admin-login", { error: null });
});

router.post("/admin/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const admin = await User.findOne({ email, role: "admin" });

    if (!admin) {
      res.render("admin/admin-login", {
        error: "Invalid admin credentials",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.render("admin/admin-login", {
        error: "Invalid admin credentials",
      });
      return;
    }

    (req.session as any).admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    res.redirect("/admin/dashboard");

  } catch (err: unknown) {
    res.render("admin/admin-login", {
      error: "Server error, try again!",
    });
  }
});

router.get("/admin/dashboard", adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = (req.session as any).admin;

    const pageParam = req.query.page as string | undefined;
    const page = Math.max(1, parseInt(pageParam || "1"));
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

    res.render("admin/dashboard", {
      admin,
      users,
      page,
      totalPages,
      totalUsers,
      activeUsers,
      blockedUsers
    });

  } catch (err: unknown) {
    res.status(500).send("Error loading dashboard");
  }
});


router.get("/admin/block/:id", adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isBlocked: true });

    const pageParam = req.query.page as string | undefined;
    const page = pageParam ? `?page=${pageParam}` : "";
    res.redirect(`/admin/dashboard${page}`);

  } catch (err: unknown) {
    res.redirect("/admin/dashboard");
  }
});

router.get("/admin/unblock/:id", adminAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isBlocked: false });

    const pageParam = req.query.page as string | undefined;
    const page = pageParam ? `?page=${pageParam}` : "";
    res.redirect(`/admin/dashboard${page}`);

  } catch (err: unknown) {
    res.redirect("/admin/dashboard");
  }
});

router.get("/admin/logout", (req: Request, res: Response): void => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
