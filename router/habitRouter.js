let uuid = require('node-uuid');
let Router = require('koa-router')
let HabitModel = require("../db/habit");
const router = new Router()

router.prefix('/habit')

router.get('/queryList',(ctx)=>{
    HabitModel.remove({},(err,ret)=>{
        console.log(ret)
    })
    ctx.body = "hello C module router"
})

router.post("/queryHabitList", async (ctx)=>{
    let userId = ctx.session.id;
    let query = ctx.request.body;
    let resData = await HabitModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:{
                userId: userId,
            }
        },
    ])
    ctx.body = {
        code: 200,
        data: resData,
    }
})

//首页查询习惯
router.post("/queryHabitListInHome", async (ctx)=>{
    let userId = ctx.session.id;
    let resData = await HabitModel.aggregate([
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
        code: 200,
        data: resData,
    }
})

router.post('/editHabitById', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await HabitModel.updateOne({id : data.id}, {
            name: data.name,
            remark: data.remark,
            type: data.type,
            logo: data.logo,
            backColor: data.backColor,
            logoColor: data.logoColor,
            logoType: data.logoType,
        });
        ctx.body = {
            code : 200,
            msg : "更新成功！"
        };
    } catch (error) {
        ctx.body = {
            code : 400,
            msg : "更新失败!"
        }
    }
})

router.post("/delHabitById", async (ctx)=>{
    let data = ctx.request.body;
    await HabitModel.deleteOne({id : data.id});
    ctx.body = {
        code : 200,
        msg : "习惯删除成功！"
    }
})

router.post('/addHabit', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        name: data.name,
        id: uuid.v1(),
        remark: data.remark,
        type: data.type,
        userId: userId,
        date: new Date().getTime(),
        logo: data.logo,
        backColor: data.backColor,
        logoColor: data.logoColor,
        logoType: data.logoType,
    }
    let resBody = {};
    let Habit = await new HabitModel(obj);

    try {
        let a = await Habit.save();    
        resBody = {
            code: 200,
            msg: "添加成功！"
        }
    } catch (error) {
        resBody = {
            code: 400,
            msg: "添加失败！"
        }
    }
    ctx.body = resBody
})

module.exports = router