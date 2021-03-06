let koa = require("koa");
let app = new koa();
const bodyParser = require('koa-bodyparser')
const {verifyToken} = require('./token/jwt');
const cors = require('koa2-cors');
let session = require("koa-session")
const registerRouter  = require('./router/index.js')
let static = require("koa-static");

//配置 bodyParsey中间件
app.use(static("./"));
app.use(bodyParser())
app.use(cors());
app.keys = ['dasdasdsdasd'];
const CONFIG = {
    key: 'koa:sess',   //cookie key (default is koa:sess)
    maxAge: 1000 * 60 * 60 * 24 * 7,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false,  //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));
app.use(async(ctx, next)=>{
    let name = ctx.request.url;
    console.log(name)
    if(name == "/login"){
        await next()
    }else{
        let token = ctx.request.header.token;
        await verifyToken(token).then(async res=>{
            let userId = ctx.session.id;
            if(!userId){
                ctx.body = {
                    code:"304",//session失效
                    msg:"session失效，请重新登录",
                };
            }else{
                await next()
            }
        }).catch(e=>{
            console.log(e)
            ctx.body = {
                code:"303",//token失效
                msg:"报错，token不正确",
            };
        });
    }
});
app.use(registerRouter())
//app.use(router.routes()).use(router.allowedMethods());
app.listen(9011);