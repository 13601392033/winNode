let uuid = require('node-uuid');
let Router = require('koa-router')
let RecordModel = require("../db/record");
const router = new Router()

router.prefix('/record')

router.get('/queryList',(ctx)=>{
    RecordModel.remove({},(err,ret)=>{
        console.log(ret)
    })
    ctx.body = "hello C module router"
})

router.post("/queryRecordList", async (ctx)=>{
    let userId = ctx.session.id;
    let query = ctx.request.body;
    let match = {
        userId: userId,
    }
    if(query.type != 0){//不为全部的情况
        match.type = query.type;
    }
    let resData = await RecordModel.aggregate([
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
    let total = await RecordModel.find(match).count()
    ctx.body = {
        code: 200,
        data: resData,
        total: total,
    }
})

router.post('/editRecordById', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await RecordModel.updateOne({id : data.id}, {
            title : data.title,
            content : data.content,
            type : data.type,
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

router.post("/delRecordById", async (ctx)=>{
    let data = ctx.request.body;
    await RecordModel.deleteOne({id : data.id});
    ctx.body = {
        code : 200,
        msg : "记录删除成功！"
    }
})

router.post('/addRecord', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        title: data.title,
        id: uuid.v1(),
        content: data.content,
        type: data.type,
        userId: userId,
        date: new Date().getTime(),
    }
    let resBody = {};
    let Record = await new RecordModel(obj);

    try {
        let a = await Record.save();    
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