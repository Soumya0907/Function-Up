//Blog Model

const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId

 const blogSchema = new mongoose.Schema({
     "title" : {
         type : String,
         required : [true,'Title is required'],
         unique:true,
         trim : true
     },
     "body" : {
        type : String,
        required : [true,'Body is required'],
        trim : true
    },
    "authorId" : {
        type : objectId,
        refs : 'Author',
        required : [true,'Author Id is required'],
    },
    "tags" : ["String"],
    "category" : {
        type : ["String"],    // [technology, entertainment, life style, food, fashion]
        required : [true,'Category is required'],
        trim : true
    },
    "subcategory" : ["String"],
    "deletedAt" : {
        type:Date,
       
    },
    "isDeleted" : {
        type : Boolean,
        default : false
    },
    "publishedAt" : {
        type:Date,
        
    },
    "isPublished" : {
        type : Boolean,
        default : false
    }

}
, {timestamps : true})

module.exports = mongoose.model('Blog', blogSchema);