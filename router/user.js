let Router = require('koa-router')
let UserModel = require("../db/user.js");
let router = new Router()
let multer = require('koa-multer');

router.prefix('/user')
let name = undefined;
var storage = multer.diskStorage({
    //文件保存路径
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    //修改文件名称
    filename: function (req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        name = Date.now() + "." + fileFormat[fileFormat.length - 1];
        cb(null, name);
    }   
})
//加载配置
var upload = multer({ storage: storage });

router.post("/upload", upload.single('file'), async (ctx)=>{
    await UserModel.updateOne({
        username: ctx.req.body.username,
    },{
        avatar: name
    })
    ctx.body = {
        code : 200,
        msg : "上传成功！"
    }
})

router.post("/queryUser", async (ctx)=>{
    let data = await UserModel.find({
        username: ctx.request.body.username,
    })

    ctx.body = {
        code : 200,
        data : data,
    }
})

router.post("/updateUserById", async (ctx)=>{
    let query = ctx.request.body;
    await UserModel.updateOne({
        username: query.username,
    },{
        name: query.name,
        age: query.age,
        email: query.email, 
        phone: query.phone,
    })

    ctx.body = {
        code : 200,
        msg : "修改成功！"    
    }
})

module.exports = router