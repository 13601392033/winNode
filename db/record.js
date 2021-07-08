var mongoose = require("./db.js");
let recordSchema = mongoose.Schema({
    id: String, // 唯一标识
    title: String,
    content: String,
    userId: String,
    type: Number, //0==全部 1==学习 2==工作 3==生活 4==感悟
    date: Number,
})

let RecordModel = mongoose.model("record", recordSchema, "record");
module.exports = RecordModel;