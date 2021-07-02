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

router.post("/refreshTaskList", async (ctx)=>{
    let userId = ctx.session.id;
    let a = await TaskModel.aggregate([{
        $limit:6,
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