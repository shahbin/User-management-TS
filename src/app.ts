import express, { NextFunction, Request, Response } from "express";
import session from "express-session";
import path from "path";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import { connectDB } from "./utils/db";
import { AppError } from "./utils/errors";
import { ResponseHandler } from "./utils/response";

connectDB();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.render("user/login", { error: null });
});

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);

app.use((req: Request, res: Response) => {
  const error = new AppError(404, "Route not found");
  ResponseHandler.error(res, error);
});

app.use((error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    ResponseHandler.error(res, error);
  } else {
    const appError = new AppError(500, error.message || "Internal server error", true);
    ResponseHandler.error(res, appError);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✔ Server running on port ${PORT}`);
});

export default app;
