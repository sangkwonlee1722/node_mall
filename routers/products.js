const express = require("express");
const { Products,Users ,Sequelize} = require("../models");
const router = express.Router();
// console.log("api/products");

const authMiddleware = require("../middlewares/auth-middleware");
// 상품 생성
router.post("/products", authMiddleware, async (req, res) => {
  // console.log("상품 생성",res.locals.user);
  try {
    const { title, content } = req.body;
    if (!title ||!content ) {
      return res.status(401).json({
        "success": false,
        "message": "데이터 양식을 다시 확인해주세요."
      });
    }
    const product = new Products({
      userId: res.locals.user.id,
      title,
      status: "FOR_SALE",
      content: content,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    await product.save()
    .then(()=>{
      return res.status(200).json({ 
        success: true,
        message: "상품을 성공적으로 등록하였습니다."
      });
    });
    
  }
  catch (err){
    return res.status(400).json({ 
      success: false,
      message: "상품 등록에 실패하였습니다."
     });
  }
})

//상품 목록 조회 API
router.get("/products", async (req, res) => {
  try {
  const sort = req.query.sort === "ASC" ? "ASC":"DESC";
  // console.log(req.query);
  // console.log(sort);

    const products = await Products.findAll({
      attributes: ["id", "title", "content", "status", "createdAt","userId"],
      include: [
        {
          model: Users,
          attributes: ["name"],
          where: {
            id: Sequelize.col("Products.userId"),
          },
        },
      ],
      order: [["createdAt", sort]], // 이 위치에 order 옵션을 추가
    });

    return res.status(200).json({
      success: true,
      "data": products
    });
  }
  catch (err){
    return res.status(400).json({
      success: false,
      message: "상품을 찾을 수 없습니다."
    });
  }
})


//상품 상세 조회 API
router.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const products = await Products.findOne({
      where:{id},
      attributes: ["id", "title", "content", "status", "createdAt","userId"],
      include: [
        {
          model: Users,
          attributes: ["name"],
          where: {
            id: Sequelize.col("Products.userId"),
          },
        },
      ]
    });
  
    if (!products.dataValues) {
      return res.status(401).json({ 
        success:false,
        message: "해당하는 상품을 찾을 수 없습니다."
       });
    }

    return res.status(200).json({
      success:true,
      data: products
     });

  }
  catch (err) {
    return res.status(400).json({ 
      success:false,
      message: "해당하는 상품을 찾을 수 없습니다."
     });
  }
})

//상품 수정
router.put("/products/:id",authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content, status } = req.body;

    if (!title || !content ) {
      return res.status(401).json({ 
        success: false,
        message: "데이터 양식을 다시 확인해주세요."
       });
    }

    const products = await Products.findOne({ where: { id }});
    let changeStatus;
    if(!status){
      changeStatus = products.status;
    }
    else {
      changeStatus = status;
    }
  
    if (!products) {
      return res.status(402).json({ 
        success: false,
        message: "해당하는 상품을 찾을 수 없습니다."
       });
    }

    if (products.userId !== res.locals.user.id) {
      return res.status(403).json({ 
        success: false,
        message: "상품을 수정할 권한이 없습니다."
       });
    }

    const updatedAt =  new Date();

    Products.update(
        { title, content, updatedAt, status:changeStatus},
        {where : { id }}
      ).then(()=>{
        return res.status(200).json({ 
          success: true,
          message: "상품 정보를 성공적으로 수정하였습니다."
         });
      });

  }
  catch (err) {
    return res.status(400).json({ 
      success: false,
      message: "상품 정보 수정에 실패하였습니다."
     });
  }
})


// 상품 삭제
router.delete("/products/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const products = await Products.findOne({ id });
  
    if (!products) {
      return res.status(401).json({ 
        success:false,
        message: "해당하는 상품을 찾을 수 없습니다."
       });
    }

    if (products.userId !== res.locals.user.id) {
      return res.status(402).json({ 
        success:false,
        message: "상품을 삭제할 권한이 없습니다."
       });
    }

    await Products.destroy({where : { id }});
    return res.status(200).json({ 
      success:false,
      message: "상품 정보를 삭제하였습니다."
    });

  }
  catch(err) {
    console.error(err);
    return res.status(400).json({ 
      success:false,
      message: "상품 삭제에 실패 하였습니다."
     });
  }
});


module.exports = router;