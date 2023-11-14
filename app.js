const express = require("express");
const connect = require("./schemas"); // MongoDB에 접속을 해야 하므로 가지고 옴
const port = 3008;

const app = express();
app.use(express.json());

connect(); //실제로 MongoDB에 접속

// 라우터 설정
const router = require("./routes/products.router");
app.use("/api", [router]);

app.get("/", (req, res) => {
    res.send("Hello World!!!");
  });

app.listen(port, () => {
    console.log(port, " 포트로 서버가 연결되었습니다.");
});
