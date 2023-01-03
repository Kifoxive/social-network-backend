import express from "express";

import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import {
  registerValidation,
  loginValidation,
} from "../validators/validations.js";
import { checkAuth, handleValidationErrors } from "../middlewares/index.js";
import ApiError from "../exceptions/api-error.js";
import userService from "../service/user-service.js";
import UserDto from "../dtos/user-dto.js";

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName, avatarUrl } = req.body;
      const userData = await userService.registration(
        email,
        password,
        fullName,
        avatarUrl
      );

      const { refreshToken, ...data } = userData;
      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { refreshToken, ...authUserData } = await userService.login(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(authUserData);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const oldRefreshToken = req.cookies.refreshToken;

      const { refreshToken, ...authUserData } = await userService.refresh(
        oldRefreshToken
      );
      res.cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(authUserData);
    } catch (e) {
      next(e);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        next(ApiError.NotFound("The user not found"));
      }

      const userDto = new UserDto(user);
      res.json({
        ...userDto,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    const userId = req.userId;
    try {
      const { fullName, email, aboutMe, avatarUrl } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        userId,
        {
          fullName,
          email,
          aboutMe,
          avatarUrl,
        },
        {
          returnOriginal: false,
        }
      );

      await user.save();
      const { passwordHash, ...userData } = user._doc;

      res.json({ ...userData });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    const user = await UserModel.findById(req.userId);

    const { password, newPassword1, newPassword2 } = req.body;
    if (newPassword1 !== newPassword2) {
      return next(ApiError.BadRequest("Passwords are not equal"));
    }

    const isValidPass = await bcrypt.compare(password, user._doc.passwordHash);
    if (!isValidPass) {
      return next(ApiError.UnauthorizedError("Bad old password"));
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword2, salt);

    user.passwordHash = hash;
    await user.save();

    res.json({ message: "Success" });
    try {
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      await userService.logout(refreshToken);
      res.clearCookie("refreshToken");

      return res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(302, process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }
}

const routerController = new AuthController();
const router = express.Router();

router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  routerController.register
);
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  routerController.login
);
router.get("/me", checkAuth, routerController.getMe);
router.patch(
  "/update",
  checkAuth,
  registerValidation,
  handleValidationErrors,
  routerController.updateProfile
);
router.patch(
  "/change-password",
  checkAuth,
  registerValidation,
  handleValidationErrors,
  routerController.changePassword
);
router.get("/refresh", routerController.refresh);
router.post("/logout", checkAuth, routerController.logout);
router.get("/activate/:linkId", routerController.activate);

export default router;
