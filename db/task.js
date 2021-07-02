var mongoose = require("./db.js");
let taskSchema = mongoose.Schema({
    id: String, // 唯一标识
    title: String,
    state: Number, // 1 为未完成 2 为已完成
    content: String,
    userId: String,
    type: Number, //1==一天 2==三天 3==7天 4==无限期
    date: Number,
})

let TaskModel = mongoose.model(null, taskSchema, "task");
module.exports = TaskModel;