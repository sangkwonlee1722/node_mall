const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();

const productRouter = require("./routers/products.js");
const userRouter = require("./routers/users.js");
require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT, () => {
  console.log( '서버가 실행되었습니다.');
})

app.get('/', (req, res) => {
  res.send(`Hello World`);
})

app.use("/api",[userRouter,productRouter]);