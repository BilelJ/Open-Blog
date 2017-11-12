var mongoose    = require("mongoose");

var postSchema  = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   date: { type: Date, default: Date },
   author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
   comments: [{
       type: mongoose.Schema.Types.ObjectId,
       ref: "comment"
   }]
});

module.exports = mongoose.model("post", postSchema);