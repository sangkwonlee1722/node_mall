const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require('dotenv').config();
// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (!authToken || authType !== "Bearer") {
    return res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
  }

  try {
    const { email, name } = jwt.verify(authToken,  process.env.JWT);
    const user = await Users.findOne({where : {email}});
    res.locals.user = user.dataValues;
    console.log("authMiddleware",res.locals.user);
    next();
  } catch (err) {
    console.error(err);
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
  }
};