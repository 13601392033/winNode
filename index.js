let koa = require("koa");
let router = require("koa-router")();
let UserModel = require("./db/user.js");
let app = new koa();
const bodyParser = require('koa-bodyparser')
const {createToken, verifyToken} = require('./token/jwt');
const cors = require('koa2-cors');
//配置 bodyParsey中间件
app.use(bodyParser())
app.use(cors());

app.use(async(ctx, next)=>{
    let name = ctx.request.url;
    if(name == "/login"){
        await next()
    }else{
        let token = ctx.request.header.token;
        verifyToken(token).then(async res=>{
            await next()
        }).catch(e=>{
            ctx.body = "报错，token不正确";
        });
    }
});

router.post("/login", async (ctx)=>{
    let bodyData = ctx.request.body;
    let resData = "";
    await UserModel.find({username: bodyData.userName, password: bodyData.password},(err, doc)=>{
        if(err){
            console.log(err)
            return false;
        }
        resData = doc;
    })  
    let token = "";
    if(resData.length >= 1){
        token = createToken({id:resData[0]._id});
    }
    ctx.body = {
        code : 200,
        data : resData,
        token : token,
    }
})

router.get("/go", async (ctx)=>{
    ctx.body = "dasdasd"
})

app.use(router.routes()).use(router.allowedMethods());
app.listen(9011);