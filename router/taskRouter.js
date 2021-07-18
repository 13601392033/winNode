let uuid = require('node-uuid');
const Router = require('koa-router')
let TaskModel = require("../db/task");
const router = new Router()

router.prefix('/task')

router.get('/queryList',(ctx)=>{
    TaskModel.remove({},(err,ret)=>{
        console.log(ret)
    })
    ctx.body = "hello C module router"
})

//分页的首次查询
router.post("/queryAllTasks", async(ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let one = await queryTasksByType(1, data.pageNo, data.pageSize, {"date":-1}, userId)
    let two = await queryTasksByType(2, data.pageNo, data.pageSize, {"date":-1}, userId)
    let three = await queryTasksByType(3, data.pageNo, data.pageSize, {"date":-1}, userId)
    let all = one.concat(two, three);
    let total = await TaskModel.aggregate([
        {
            $match:{userId :userId}
        },
        {$group : {_id : "$type", total : {$sum : 1}}},
        {$sort:{type:1}}
    ])
    ctx.body = {
        code : 200,
        data : all,
        total: total,
    }
})

async function queryTasksByType(type, pageNo, pageSize, sort, userId){
    return await TaskModel.aggregate([
        {
            $sort:sort
        },
        {
            $match:{
                userId: userId,
                type: type
            }
        },
        {
            $skip: (pageNo -1) * pageSize,
        },
        {
            $limit: pageSize || 20
        },
    ])
}

//按照类型分页查询
router.post("/queryTasksByType", async(ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let resData = await TaskModel.aggregate([
        {
            $match:{
                userId :userId,
                type : data.type,
            }
        },
        {
            $sort:{"date":-1}
        },
        {
            $skip: (data.pageNo -1) * data.pageSize,
        },
        {
            $limit: data.pageSize || 20
        },
    ])
    let total = (await TaskModel.aggregate([
        {$match:{userId :userId, type : data.type,}},
    ])).length;
    ctx.body = {
        code : 200,
        data : resData,
        total: total,
    }
})

router.post("/refreshTaskList", async (ctx)=>{
    let userId = ctx.session.id;
    let a = await TaskModel.aggregate([{
        $limit:6,
    },
    {
        $sort: {date: -1}
    },
    {
        $match:{
            userId :userId
        }
    }])
    ctx.body = {
        code:200,
        data: a,
    }
});

router.post("/delTaskById", async (ctx)=>{
    let data = ctx.request.body;
    await TaskModel.remove({id : data.id});
    ctx.body = {
        code : 200,
        msg : "任务删除成功！"
    }
})

router.post('/editTaskById', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await TaskModel.updateOne({id : data.id}, {
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

router.post('/updateState', async (ctx)=>{
    let data = ctx.request.body;
    try {
        await TaskModel.updateOne({id : data.id}, {state : data.state});
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

router.post('/addTask', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        title: data.title,
        id: uuid.v1(),
        content: data.content,
        type: data.type,
        state: 1,
        userId: userId,
        date: new Date().getTime(),
    }
    let resBody = {};
    let Task = await new TaskModel(obj);

    try {
        let a = await Task.save();    
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