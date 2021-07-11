var mongoose = require("./db.js");
let habitSchema = mongoose.Schema({
    id: String, // 唯一标识
    name: String,
    state: Number, // 1 进行中 2 已完成 3已暂停
    remark: String, // 备注
    userId: String,
    logo: String,
    backColor: String, //背景色
    logoColor: String, //logo颜色
    logoType: Number, // 0 == 文字 1 == 图标
    date: Number,
})

let HabitModel = mongoose.model("habit", habitSchema, "habit");
module.exports = HabitModel;