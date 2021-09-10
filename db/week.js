var mongoose = require("./db.js");
let weekSchema = mongoose.Schema({
    id: String, // 唯一标识
    startDate: Number, // 开始时间
    endDate: Number, // 结束时间
    summary: String, // 总结
    userId: String,
    createDate: Number,
})

let WeekModel = mongoose.model("week", weekSchema, "week");
module.exports = WeekModel;