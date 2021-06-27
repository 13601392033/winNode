const mongoose = require('mongoose');

mongoose.connect("mongodb://1.117.21.31:27127/mf", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
module.exports = mongoose;