let koa = require("koa");
let router = require("koa-router")();
let UserModel = require("./db/user.js");
let app = new koa();
const bodyParser = require('koa-bodyparser')
const JwtUtil = require('./token/jwt');

//配置 bodyParsey中间件
app.use(bodyParser())

router.post("/login", async (ctx)=>{
    console.log(ctx.request.body)
    let bodyData = ctx.request.body;
    let resData = "";
    await UserModel.find({username: bodyData.userName, password: bodyData.password},(err, doc)=>{
        if(err){
            console.log(err)
            return false;
        }
        resData = doc;
    })
    console.log("resData:"+resData.length)
    let token = "";
    if(resData.length >= 1){
        let jwt = new JwtUtil("5458489sad5a4sd8a");
        token = jwt.generateToken();
    }
    ctx.body = {
        code : 200,
        data : resData,
        token : token,
    }
})

app.use(router.routes()).use(router.allowedMethods());
app.listen(9011);