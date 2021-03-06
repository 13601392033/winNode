var mongoose = require("./db.js");
let taskSchema = mongoose.Schema({
    id: String, // 唯一标识
    title: String,
    state: Number, // 1 为未完成 2 为已完成
    content: String,
    userId: String,
    type: Number, //1==一天 2==两天 3==三天
    date: Number,
})

let TaskModel = mongoose.model(null, taskSchema, "task");
module.exports = TaskModel;