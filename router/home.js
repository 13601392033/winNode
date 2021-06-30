const Router = require('koa-router')
let UserModel = require("../db/user.js");
const router = new Router()
const {createToken} = require('../token/jwt');
let TaskModel = require("../db/task");
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
        ctx.session.id = resData[0]._id;
    }
    ctx.body = {
        code : 200,
        data : resData,
        token : token,
    }
})

router.post("/loginOut", async(ctx)=>{
    ctx.session.id = null;
    ctx.body = {
        code:"200",
    }
});

router.post("/init", async (ctx)=>{
    let userId = ctx.session.id;
    let resData = undefined;
    await TaskModel.aggregate([{
        $limit:6,
    },
    {
        $match:{
            userId :userId
        }
    }],(err, doc)=>{
        if(err){
            console.log(err)
            return false;
        }
        resData = doc
    })
    ctx.body = {
        code:200,
        data: resData,
    }
});

router.get("/go", async (ctx)=>{
    ctx.body = "dasdasd"
})

module.exports = router