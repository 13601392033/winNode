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
    let total = await DiaryModel.find({
        userId: userId,
    }).count()
    ctx.body = {
        code: 200,
        data: resData,
        total: total,
    }
})

router.post("/queryDiaryById", async(ctx)=>{
    let data = ctx.request.body;
    let a = await DiaryModel.aggregate([
        {
            $match:{
                id: data.id,
            }
        }
    ]);
    ctx.body = {
        code: 200,
        data: a,
    }
})

router.post("/queryNearById", async(ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let match = {};
    let val = 1;
    if(data.type == 0){ // 上一篇
        match = {
            incId: {
                $lt: data.incId
            },
            userId: userId,
        }
        val = -1;
    }else if(data.type == 1){ // 下一篇
        match = {
            incId: { 
                $gt: data.incId
            },
            userId: userId,
        }
        console.log(match)
    }
    let a = await DiaryModel.aggregate([
        {
            $sort:{
                incId: val,
            }
        },
        {
            $match:match
        },
        {
            $limit:1
        }
    ]);
    ctx.body = {
        code: 200,
        data: a,
    }
})

// router.post("/refreshRecordList", async (ctx)=>{
//     let userId = ctx.session.id;
//     let a = await DiaryModel.aggregate([
//         {
//             $sort: {date: -1}
//         },
//         {
//             $limit:5,
//         },
//         {
//             $match:{
//                 userId :userId
//             }
//         }
//     ])
//     ctx.body = {
//         code:200,
//         data: a,
//     }
// });

router.post('/editDiaryById', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await DiaryModel.updateOne({id : data.id}, {
            title : data.title,
            content : data.content,
            text: data.text
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
    let incId = 1;
    await DiaryModel.find().sort({incId: -1}).limit(1).then(res=>{
        console.log(res)
        if(res[0]){
            incId = res[0].incId+1
        }
    });
    let obj = {
        title: data.title,
        id: uuid.v1(),
        incId: incId,
        text: data.text,
        content: data.content,
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