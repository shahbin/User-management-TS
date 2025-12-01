import { Router, Request, Response, NextFunction } from "express";
import { diContainer } from "../di/DIContainer";

const router = Router();
const authController = diContainer.getAuthController();

router.get("/", (req: Request, res: Response): void => {
  res.render("user/login", { error: null });
});

router.get("/register", (req: Request, res: Response): void => {
  res.render("user/register", { error: null });
});

router.post("/register", (req: Request, res: Response, next: NextFunction): void => {
  authController.registerUser(req, res, next);
});

router.post("/login", (req: Request, res: Response, next: NextFunction): void => {
  authController.loginUser(req, res, next);
});

router.get("/logout", (req: Request, res: Response, next: NextFunction): void => {
  authController.logoutUser(req, res, next);
});

export default router;
