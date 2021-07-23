let uuid = require('node-uuid');
let Router = require('koa-router')
let HabitLogsModel = require("../db/habitLogs");
let moment = require("moment");
let HabitModel = require("../db/habit");
const router = new Router()

router.prefix('/habitLogs')


router.post("/refreshHabitLogs", async(ctx)=>{
    let userId = ctx.session.id;
    let habitList = await HabitModel.aggregate([
        {
            $match:{
                userId: userId,
                isDel :{
                    $ne: 1
                }
            }
        },
        {
            $sort: {date: -1}
        },
        
        {
            $limit: 6
        },
        {
            $lookup:{ // 左连接
                from: "habitLogs", // 关联到order表
                localField: "id", // user 表关联的字段
                foreignField: "habitId", // order 表关联的字段
                as: "logs"
            },
        },
        
        {
            $project:{
                name: "$name",
                id: "$id",
                date: "$date",
                logo: "$logo",
                backColor: "$backColor",
                logoColor: "$logoColor",
                logoType: "$logoType",
                logs:{
                    $filter:{
                        input:"$logs",
                        as : "item",
                        cond:{
                            $and:[
                                {$eq:["$$item.dateTime", moment(new Date()).format("YYYY-MM-DD")],},
                            ]
                        }
                    }
                }
            }
        },
    ])
    ctx.body = {
        code: 200,
        data: habitList
    }
});

router.post("/addHabitLogs", async (ctx)=>{
    let data = ctx.request.body;
    let curDate = moment(new Date()).format("YYYY-MM-DD");
    let find = await HabitLogsModel.find({dateTime: curDate, habitId: data.habitId});
    if(find.length > 0){
        find.forEach(async item=>{
            await HabitLogsModel.deleteOne({id: item.id});
        })
    }
    
    let userId = ctx.session.id;
    let obj = {
        id: uuid.v1(),
        userId: userId,
        type: data.type,
        date: new Date().getTime(),
        habitId: data.habitId,
        dateTime: curDate
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