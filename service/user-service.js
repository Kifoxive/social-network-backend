import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import tokenService from "./token-service.js";
import ApiError from "../exceptions/api-error.js";
import nodemailer from "nodemailer";
import tokenModel from "../models/TokenModel.js";
import UserDto from "../dtos/user-dto.js";
import AuthUserDto from "../dtos/auth_user-dto.js";

class UserService {
  async registration(email, password, fullName, avatarUrl) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`The user with email ${email} already exist`);
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const activationLink = v4();
    const user = await UserModel.create({
      email,
      passwordHash,
      fullName,
      activationLink,
      avatarUrl,
    });

    const userDto = new AuthDto(user); // email, fullName, id;

    await mailService(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`
    );

    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest("Bad activation link");
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest(`Bad login or password`);
    }
    const isPassEquals = await bcrypt.compare(password, user.passwordHash);
    if (!isPassEquals) {
      throw ApiError.BadRequest(`Bad login or password`);
    }

    const userDto = new UserDto(user); // id, email, isActivated
    const userAuthDto = new AuthUserDto(user);

    const tokens = tokenService.generateTokens({ ...userAuthDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    await tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenModel.findOne({ refreshToken });

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    const authUserDto = new AuthUserDto(user); // id, email, isActivated
    const userDto = new UserDto(user);

    const tokens = tokenService.generateTokens({ ...authUserDto });
    await tokenService.saveToken(authUserDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }
}

export default new UserService();

function mailService(to, link) {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      service: process.env.SMTP_SERVICE,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: { rejectUnauthorized: false },
    });
    const mail_configs = {
      from: process.env.SMTP_USER,
      to: to,
      subject: `Activation on the ${process.env.API_URL}`,
      text: "Activation",
      html: `
          <div>
            <h1>Follow the link for activation</h1>
            <a href="${link}">${link}</a>
          </div>
        `,
    };
    return new Promise((resolve, reject) => {
      transporter.sendMail(mail_configs, (error, info) => {
        if (error) {
          console.log(error);
          return reject({ message: "An error has occured" });
        }
        return resolve({ message: "Email sent succesfully" });
      });
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}
