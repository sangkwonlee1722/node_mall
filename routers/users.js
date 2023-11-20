const jwt = require("jsonwebtoken");
const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const encrypt = require("../encrypt/encrypt.js");
require('dotenv').config();
const authMiddleware = require("../middlewares/auth-middleware");

// 내 정보 조회 API
router.get("/users/me", authMiddleware, async (req, res) => {
  const { email, name } = res.locals.user;

  res.status(200).json({
    user: { email, name }
  });
});

// 회원가입 API
router.post("/users/signup", async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;
    if (!email || !name || !password || !confirmPassword) {
      return res.status(401).json({
        "success": false,
        "message": "데이터 양식을 다시 확인해주세요."
      });
    }

    const emailExp = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i);
    const emailCheck = emailExp.test(email);
    if(!emailCheck) {
      return res.status(401).send({ 
        "success": false,
        "message":"이메일을 다시 확인해주세요."
       });
    }
  
    if(password.length < 6) {
      return res.status(401).send({ 
        "success": false,
        "message":"비밀번호의 길이를 확인해주세요."
       });
    }

    if (password !== confirmPassword) {
      return res.status(401).json({
        "success": false,
        "message":"비밀번호와 비밀번호 확인란이 일치하는지 확인해주세요."
      });
    }

    const existsUsernName = await Users.findOne({ where: { name } });
    const existsUserEmail = await Users.findOne({ where: { email} });
    if (existsUsernName || existsUserEmail) {
      return res.status(401).json({
        "success": false,
        "message": "이미 사용중인 이메일이나 닉네임입니다.",
      });
    }
    
    // 암호화
    const user = new Users({ email, name, password: encrypt(password) });
    await user.save()
    .then(()=>{
      return res.status(200).json({
        "success": true,
        "message":"정상적으로 회원 가입되었습니다."
       });
    });

  }
  catch (err){
    return res.status(400).json({
      "success": false,
      "message": "회원가입에 실패하였습니다."
    });
  }
});

// 로그인
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log( req.body);
    if (!email ||!password ) {
      return res.status(401).json({
        "success": false,
        "message": "올바른 정보를 입력해주세요."
      });
    }

    const userinfo = await Users.findOne({ where: { email } });
    // console.log(userinfo);

    if (!!userinfo) {
      // console.log(userinfo.password,encryptPw)
      if (userinfo.password === encrypt(password)) {
      
        // ************** 토큰 발급 ****************
        let expires = new Date();
        expires.setMinutes(expires.getMinutes() + 60*12); // 만료 시간을 12시간으로 설정합니다.

        const token = jwt.sign(
          { email, name:userinfo.name },
          process.env.JWT,
        );
        res.cookie("Authorization", `Bearer ${token}`, {
          expires: expires
        }); // JWT를 Cookie로 할당합니다!
        // return res.status(200).json({ token }); // JWT를 Body로 할당합니다!
        return res.status(200).json({
          "success": true,
          "massage": "정상적으로 로그인되었습니다.",
          token
        });
      }
      else {
        return res.status(401).json({
          "success": false,
          "masseage": "아이디나 비밀번호를 확인해주세요."
        });
      }
    }
    else {
      // user id 없으면
      return res.status(401).json({
        "success": false,
        "masseage": "아이디나 비밀번호를 확인해주세요."
      });
    }
  }
  catch (err){
    res.status(400).json({
      "success": false,
      "masseage": "로그인에 실패하였습니다."
    });
  }
})

// 수정
router.put("/users/modify", authMiddleware, async (req, res) => {
  try {
    const { email, password, newpassword } = req.body;
    if (!email ||!password ||!newpassword) {
      return res.status(401).json({
        "success": false,
        "message": "데이터 양식을 다시 확인해주세요."
      });
    }

    const userinfo = await Users.findOne({ where: { email } });
    if (userinfo.password === encrypt(password)) {
      userinfo.update({ password:  encrypt(newpassword)  } // 새로운 비밀번호로 변경
      ).then(()=>{
        return res.status(200).json({
          "success": true,
          "massage": "회원정보를 수정하였습니다."
        });
      })
      
    }
    else {
      res.status(401).json({
        "success": false,
        "massage": "비밀번호가 일치하지 않습니다."
      });
    }
  }
  catch (err){
    console.error(err)
    res.status(400).json({
      "success": false,
      "massage": "회원정보를 수정 할 수 없습니다."
    });
  }
})

// 삭제
router.delete("/users/signout", authMiddleware, async (req, res) => {
  //const { email, name } = res.locals.user;
  try {
    const { email, password } = req.body;
    if (!email ||!password ) {
      return res.status(404).json({
        "success": false,
        "message": "데이터 양식을 다시 확인해주세요."
      });
    }

    const userinfo = await Users.findOne({where:{ email }});
    if (userinfo.password === encrypt(password)) {
      await Users.destroy({ where: { email } });
      // 토큰 삭제
      res.clearCookie("Authorization");
      return res.status(200).json({
        "success": true,
        "massage": "회원 정보를 삭제하였습니다."
      });
    }
    else {
      // pw 틀림
      res.status(401).json({
        "success": false,
        "massage": "회원 정보를 확인해 주세요."
      });
    }
  }
  catch (err){
    console.error(err);
    return res.status(400).json({
      "success": false,
      "massage": "회원 정보 삭제에 실패하였습니다."
    });
  }
})

// 로그아웃
router.post("/users/logout", authMiddleware, async (req, res) => {
  try {
    res.clearCookie("Authorization");
    res.status(200).json({
      "success": true,
      "massage": "로그아웃되었습니다."
    });
  }
  catch (err){
    return res.status(400).json({
      "success": false,
      "massage": "로그아웃에 실패하였습니다."
    });
  }
});

module.exports = router;