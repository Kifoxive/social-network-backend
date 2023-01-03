import ApiError from "../exceptions/api-error.js";
import tokenService from "../service/token-service.js";

export default (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.replace(/Bearer\s?/, "");
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.userId = userData.id;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};
