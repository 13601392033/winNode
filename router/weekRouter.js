let Router = require('koa-router')
let HabitLogsModel = require("../db/habitLogs");
let moment = require("moment");
let TaskModel = require("../db/task");
let RecordModel = require("../db/record");
let DiaryModel = require("../db/diary");
let weekModel = require("../db/week");
let uuid = require('node-uuid');
const router = new Router()

router.prefix('/week')

let obj = {
    id: uuid.v1(),
    userId: "60d7500a89c8d86a5cd3453f",
    createDate: 1628438340000,
    startDate: 1627833600000,
    endDate: 1628438340000,
}
let Week = new weekModel(obj);
Week.save();

setInterval(async() => {
    let date = new Date();
    if(date.getDay() == 0 && date.getHours() >= 20){ // 周日晚上 八点以后
        let day = new Date();
        while(day.getDay() != 1){
            day = new Date(day.getTime() - (1000*60*60*24))
        }
        
        let startDate = new Date(moment(day).format("YYYY-MM-DD")).getTime() - (1000 * 60 * 60 * 8); //减去8个小时，变成零点
        let endDate = new Date(moment(new Date().getTime()).format("YYYY-MM-DD")+" 23:59:00").getTime();
        let userId = "60d7500a89c8d86a5cd3453f"
        let week = await weekModel.find({userId}).sort({createDate:-1}).limit(1)
        
        if(week.length == 0){
            //该账号没有week记录
            let obj = {
                id: uuid.v1(),
                userId: userId,
                createDate: new Date().getTime(),
                startDate: startDate,
                endDate: endDate,
            }
            let Week = await new weekModel(obj);
            await Week.save();
        }else{
            //该账号已有week记录
            if(week[0].startEnd || week[0].endDate){
                //有值，判断该数据是上周还是本周
                let c = new Date().getTime() - week[0].endDate;
                if(c > (1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 60 * 19)){
                    //上周
                    let obj = {
                        id: uuid.v1(),
                        userId: userId,
                        createDate: new Date().getTime(),
                        startDate: startDate,
                        endDate: endDate,
                    }
                    let Week = await new weekModel(obj);
                    await Week.save();
                }else{
                    //本周
                    return false;
                }
            }else{
                //无值，直接更新
                await weekModel.updateOne({id : week[0].id}, {
                    startDate: startDate,
                    endDate: endDate,   
                });
            }
        }
    }
}, 1000 * 60 * 30);

router.post('/addWeek', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        id: uuid.v1(),
        summary: data.remark,
        userId: userId,
        createDate: new Date().getTime(),
    }
    let resBody = {};
    let Week = await new weekModel(obj);

    try {
        await Week.save();
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

router.post('/allWeek', async (ctx)=>{
    let userId = ctx.session.id;
    try {
        let resData = await weekModel.aggregate([
            {
                $sort: {date: -1}
            },
            {
                $match:{
                    userId: userId
                }
            },
        ])
        
        ctx.body = {
            code : 200,
            data: resData.filter(item=>{
                return item.endDate
            }),
            msg : "查询成功！"
        };
    } catch (error) {
        ctx.body = {
            code : 400,
            msg : "查询失败!"
        }
    }
})

router.post('/updateWeek', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await weekModel.updateOne({id : data.id}, {
            summary: data.remark
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

router.post("/initWeek", async(ctx)=>{
    let userId = ctx.session.id;
    let data = ctx.request.body;
    let endDate = undefined;
    let startDate = undefined;
    let weekRemark = undefined;
    if(data.weekId){
        let query = await weekModel.find({id: data.weekId});
        
        weekRemark = query;
        console.log(weekRemark)
        endDate = query[0].endDate;
        startDate = query[0].startDate;
    }else{
        weekRemark = await weekModel.find({userId}).sort({createDate:-1}).limit(1)
        endDate = new Date().getTime();
        let day = new Date();
        while(day.getDay() != 1){
            day = new Date(day.getTime() - (1000*60*60*24))
        }
        startDate = new Date(moment(day).format("YYYY-MM-DD")).getTime() - (1000 * 60 * 60 * 8); //减去8个小时，变成零点
        if(weekRemark[0] &&  weekRemark[0].startDate && weekRemark[0].endDate){
            if(new Date().getTime() - weekRemark[0].endDate > 0){
                weekRemark = [];
            }
        }
    }
    
    
    
    console.log(moment(startDate).format("YYYY-MM-DD HH:mm:ss"))
        console.log(moment(endDate).format("YYYY-MM-DD HH:mm:ss"))
    let habitList = await HabitLogsModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $lookup:{ // 左连接
                from: "habit", // 关联到order表
                localField: "habitId", // user 表关联的字段
                foreignField: "id", // order 表关联的字段
                as: "logs"
            },
        },
        {
            $project:{
                habit: "$logs",
                id: "$id",
                date: "$date",
                dateTime:"$dateTime",
                type:"$type",
                userId:"$userId",
            }
        },
        {
            $match:{
                userId:userId,
                date:{
                    $lt: endDate,
                    $gt: startDate,
                },
                type:{
                    $eq:1,
                }
            }
        }
    ])
    let taskList = await TaskModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:{
                userId:userId,
                date:{
                    $lt: endDate,
                    $gt: startDate
                },
                type:{
                    $eq:1,
                }
            }
        }
    ])
    let recordList = await RecordModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:{
                userId:userId,
                date:{
                    $lt: endDate,
                    $gt: startDate
                },
            }
        }
    ])
    let diaryList = await DiaryModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:{
                userId:userId,
                date:{
                    $lt: endDate,
                    $gt: startDate
                },
            }
        }
    ])
    // type == 1为任务 type == 2为记录 type == 3为习惯 type == 4为日记
    taskList = taskList.map(item=>{
        item.dateTime = moment(item.date).format("YYYY-MM-DD");
        item.type = 1
        return item
    })
    recordList = recordList.map(item=>{
        item.dateTime = moment(item.date).format("YYYY-MM-DD");
        item.type = 2
        return item
    })
    habitList = habitList.map(item=>{
        item.type = 3
        return item
    })
    diaryList = diaryList.map(item=>{
        item.type = 4
        return item
    })
    
    let newMap = new Map();

    let arr = [...taskList, ...habitList, ...recordList, ...diaryList];
    arr.forEach(item=>{
        if(!newMap.has(item.dateTime)){
            newMap.set(item.dateTime, [item]);
            
        }else{
            newMap.get(item.dateTime).push(item)
        }
    })
    ctx.body = {
        code: 200,
        data: [...newMap].sort((a,b)=>{
            //按照 每条数据的时间进行正序排序 即周一 周二 ……
            return new Date(a[0]).getTime() - new Date(b[0]).getTime()
        }),
        weekRemark
    }
});

module.exports = router