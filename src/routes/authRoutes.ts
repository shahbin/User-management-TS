import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = Router();

router.get("/", (req, res) => {
  res.render("user/login", { error: null });
});

router.get("/register", (req, res) => {
  res.render("user/register", { error: null });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
