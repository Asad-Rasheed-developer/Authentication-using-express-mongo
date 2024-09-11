import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-middleware.js";

// middleware
router.use("/change-password", checkUserAuth);
router.use("/logged-user", checkUserAuth);

//public route
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post("/send-pass-to-email", UserController.sendPassToEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

//private
router.post("/change-password", UserController.changeUserPassword);
router.post("/logged-user", UserController.loggedUser);

export default router;
