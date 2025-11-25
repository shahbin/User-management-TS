import { Request, Response, NextFunction } from "express";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const admin = req.session.admin;

  if (!admin) {
    return res.redirect("/admin/login");
  }

  if (admin.role !== "admin") {
    req.session.admin = null;
    return res.redirect("/");
  }

  next();
};
