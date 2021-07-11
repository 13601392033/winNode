let Router = require('koa-router')
let UserModel = require("../db/user.js");
let router = new Router()
let {createToken} = require('../token/jwt');
let TaskModel = require("../db/task");
let RecordkModel = require("../db/record");
let HabitModel = require("../db/habit");

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
    let taskList = await TaskModel.aggregate([{
        $limit:6,
    },
    {
        $match:{
            userId :userId
        }
    }])
    let recordList = await RecordkModel.aggregate([{
        $limit:5,
    },
    {
        $match:{
            userId :userId
        }
    }])
    let habitList = await HabitModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:{
                userId: userId,
            }
        },
        {
            $limit: 6
        },
    ])
    ctx.body = {
        code:200,
        data: {
            taskList,
            recordList,
            habitList,
        },
    }
});

router.get("/go", async (ctx)=>{
    ctx.body = "dasdasd"
})

module.exports = router