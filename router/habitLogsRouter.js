let uuid = require('node-uuid');
let Router = require('koa-router')
let HabitLogsModel = require("../db/habitLogs");
const router = new Router()

router.prefix('/habitLogs')

router.post("/addHabitLogs", async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        id: uuid.v1(),
        userId: userId,
        type: data.type,
        date: new Date().getTime(),
        habitId: data.habitId,
    }
    let logs = await new HabitLogsModel(obj);
    
    try {
        await logs.save();
        ctx.body = {
            code: 200,
            msg: "添加成功！"
        }
    } catch (error) {
        ctx.body = {
            code: 400,
            msg: "添加失败！"
        }
    }
})

module.exports = router