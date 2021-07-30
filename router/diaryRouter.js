let uuid = require('node-uuid');
let Router = require('koa-router')
let DiaryModel = require("../db/diary");
const moment = require('moment');
const router = new Router()

router.prefix('/diary')

router.post("/queryDiaryList", async (ctx)=>{
    let userId = ctx.session.id;
    let query = ctx.request.body;
    let match = {
        userId: userId,
    }
    let resData = await DiaryModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $match:match
        },
        {
            $skip: (query.pageNo -1) * query.pageSize,
        },
        {
            $limit: query.pageSize || 20
        },
    ])
    let total = await DiaryModel.find().count()
    ctx.body = {
        code: 200,
        data: resData,
        total: total,
    }
})

router.post("/refreshRecordList", async (ctx)=>{
    let userId = ctx.session.id;
    let a = await DiaryModel.aggregate([
        {
            $sort: {date: -1}
        },
        {
            $limit:5,
        },
        {
            $match:{
                userId :userId
            }
        }
    ])
    ctx.body = {
        code:200,
        data: a,
    }
});

router.post('/editDiaryById', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await DiaryModel.updateOne({id : data.id}, {
            title : data.title,
            content : data.content,
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

router.post("/delDiaryById", async (ctx)=>{
    let data = ctx.request.body;
    await DiaryModel.deleteOne({id : data.id});
    ctx.body = {
        code : 200,
        msg : "日记删除成功！"
    }
})

router.post('/addDiary', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let date = new Date();
    let obj = {
        title: data.title,
        id: uuid.v1(),
        content: data.content,
        type: data.type,
        userId: userId,
        date: date.getTime(),
        dateTime: moment(date).format("YYYY-MM-DD"),
    }
    let resBody = {};
    let Record = await new DiaryModel(obj);

    try {
        await Record.save();    
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