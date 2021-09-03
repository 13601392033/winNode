let Router = require('koa-router')
let HabitLogsModel = require("../db/habitLogs");
let moment = require("moment");
let TaskModel = require("../db/task");
let RecordModel = require("../db/record");
let DiaryModel = require("../db/diary");
const router = new Router()

router.prefix('/week')

router.post("/initWeek", async(ctx)=>{
    let userId = ctx.session.id;
    let endDate = new Date().getTime();
    let day = new Date();
    while(day.getDay() != 1){
        day = new Date(day.getTime() - (1000*60*60*24))
    }
    let startDate = new Date(moment(day).format("YYYY-MM-DD")).getTime();
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
            return new Date(a[0]).getTime() - new Date(b[0]).getTime()
        })
    }
});

module.exports = router