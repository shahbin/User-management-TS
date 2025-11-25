import express from "express";
import session from "express-session";
import path from "path";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import { connectDB } from "./utils/db";
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
    }
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
  res.render("user/login",{ error: null });
});

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
