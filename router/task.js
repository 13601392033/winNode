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

router.post('/addTask', async (ctx)=>{
    let data = ctx.request.body;
    let userId = ctx.session.id;
    let obj = {
        title: data.title,
        content: data.content,
        type: data.type,
        state: 1,
        userId: userId
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