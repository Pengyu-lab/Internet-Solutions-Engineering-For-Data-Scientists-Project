const mongoose = require("mongoose");
const conn = mongoose.createConnection("mongodb://localhost/test");
 
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rTime: {
        type: Number,
        default: Date.now()
    }
})


const BookSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },

    author: {
        type: String,
        required: true
    },  

    isbn: {
        type: String,
        required: true
    },

    abstract: {
        type: String,
        required: true
    }, 
    
    pic: {
        type: String,
        required: true
    },    
    
    cTime: {
        type: Number,
        default: Date.now()
    }
})

 
const User = conn.model("User", UserSchema);

const Book = conn.model("Book", BookSchema);

const Share = conn.model("Share", BookSchema);
 
const model = { User, Book, Share };

module.exports = function (modelName) {
    return model[modelName];
}
