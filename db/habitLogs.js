var mongoose = require("./db.js");
let habitLogsSchema = mongoose.Schema({
    id: String, // 唯一标识
    habitId: String, //习惯id
    type: Number, //0 == 未完成 1 == 已完成
    date: Number,
    userId: String,
    dateTime:String
})

let HabitLogsModel = mongoose.model("habitLogs", habitLogsSchema, "habitLogs");
module.exports = HabitLogsModel;