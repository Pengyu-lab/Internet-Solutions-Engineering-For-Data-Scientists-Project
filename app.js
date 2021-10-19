const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const getModel = require("./model");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const crypto = require("crypto");
var fs=require('fs');

app.use(cookieParser());

app.use("/resources",express.static(__dirname+"/resources"));
app.use("/images",express.static(__dirname+"/images"));
app.use(express.static('./images'));


app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", __dirname+'/views');
app.set("view engine", "html");
app.engine("html", require("ejs").__express); 

const Book = getModel("Book");
const User = getModel("User"); 
const Share = getModel("Share");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({storage: storage});






function isLogin(req, res, next) {
  const { username } = req.cookies; 
  if (username) {
      next();
  } else {
      res.redirect("/login");
  }
}

app.get("/login", function (req, res) { 
  res.render("login");
})


app.get("/logout", function (req, res) { 
  res.clearCookie("username");
  res.render("login");
})

app.post("/login", function (req, res) {
  let { username, password } = req.body;
  password = crypto.createHmac("md5", "cyl").update(password).digest("hex"); 
  User.findOne({ username}, function (err, doc) {
      if (err) { 
      }
      if (doc) { 
          if (doc.password === password) { 
              res.cookie("username", username);
              res.redirect("/");
              res.end();
          } else {
              
              res.render("error");
          }
      } else {
          res.render("error"); 
      }
  })
  
})

app.get("/register", function (req, res) {
  res.render("register");
})

app.post("/register", function (req, res) {
  let { username, password } = req.body;
  password = crypto.createHmac("md5", "cyl").update(password).digest("hex");

  User.findOne({ username}, function (err, doc) {
      if (err) { 
      }
      if (doc) { 

          res.render("register_error");

      } else {
          User.create({ username, password }, function (err, doc) {
              
              if (err) {
              }
              if (doc) {
                  res.cookie("username", username);
                  res.redirect("/");
                  res.end();
              }
          })
      }
  })
})


app.post('/book_add', upload.single('pic'), function(req, res, next) {
  console.log(req.body);
  const { username } = req.cookies; 
  let { title, author,isbn,abstract } = req.body;
  console.log(title);
  console.log(req.file);
  // have image
  if(req.file) {
    console.log("image");
    var image = 'images/' + path.basename(req.file.path);
    var book={
      username: username,
      title:title,
      author:author,
      isbn:isbn,
      abstract:abstract,
      pic:image,
    }; 
    Book.create(book,function (error, doc) {
      console.log(error);
      if(error){
        res.send({
          err: null,
          msg: 'add book fail'
        });
      } else {
        res.send({
          err: null,
          msg: 'add book success'
        });
      }

    });

  
  // no image
  } else {
    console.log("no image")
    var book={
      username: "admin",
      title:title,
      author:author,
      isbn:isbn,
      abstract:abstract,
      pic:"noimage",
    }; 
    Book.create(book,function (error, doc) {
      console.log(error);
      if(error){
        res.send({
          err: null,
          msg: 'add book fail'
        });
      } else {
        res.send({
          err: null,
          msg: 'add book success'
        });
      }

    });


  }

  /*
  res.send({
    err: null,
    filePath: 'images/' + path.basename(req.file.path)
  });*/
});

// books 
app.get("/books", isLogin, function (req, res) {
  const { username } = req.cookies;
 
  Book.find({ username}, function (err, doc) {
    console.log(doc);
    res.render("books", { username, bookList:doc })
  });
})


// books 
app.get("/shares", isLogin, function (req, res) {
  const { username } = req.cookies;
 
  Share.find({}, function (err, doc) {
    console.log(doc);
    res.render("shares", { username, bookList:doc })
  });

})


app.get("/", isLogin, function (req, res) {
  res.redirect("books")
})

//book_add
app.get("/book_add", isLogin, function (req,res) {
    res.render("book_add");
});


app.post("/book_delete",function (req,res) {

  var _id=req.body._id;

  Book.findOne({_id},function (error, dbBook) {
      if(error) {
        res.send({
          err: null,
          msg: 'delete book fail'
        });

      } else {

      Book.remove({_id},function (error, doc) {
          if(error) {
            res.send({
              err: null,
              msg: 'delete book fail'
            });
          } else {
            if(dbBook.pic != "noimage"){
                fs.unlinkSync(dbBook.pic);
            }
            res.send({
              err: null,
              msg: 'delete book success'
            });
        }          
      });
    }
  });

});

app.get("/book_update/:_id",function (req,res) {

  var _id=req.params._id;

  Book.findOne({_id},function (error, book) {
      res.render("book_update",{
          book:book
      });
  });
});




app.post('/book_update', upload.single('pic'), function(req, res, next) {
  console.log(req.body);
  const { username } = req.cookies; 
  let { _id, title, author,isbn,abstract } = req.body;
  console.log(title);
  console.log(req.file);
  // have image
  if(req.file) {
    console.log("image");
    var image = 'images/' + path.basename(req.file.path);
    var book={
      username: username,
      title:title,
      author:author,
      isbn:isbn,
      abstract:abstract,
      pic:image,
    }; 
    Book.update({_id}, {$set: book}, function (error, doc) {
      console.log(error);
      if(error){
        res.send({
          err: null,
          msg: 'update book fail'
        });
      } else {
        res.send({
          err: null,
          msg: 'update book success'
        });
      }

    });

  
  // no image
  } else {
    console.log("no image")
    var book={
      username: username,
      title:title,
      author:author,
      isbn:isbn,
      abstract:abstract,
    }; 
    Book.update({_id}, {$set: book}, function (error, doc) {
      console.log(error);
      if(error){
        res.send({
          err: null,
          msg: 'update book fail'
        });
      } else {
        res.send({
          err: null,
          msg: 'update book success'
        });
      }

    });


  }

});



app.post("/book_share",function (req,res) {

  var _id=req.body._id;
  const { username } = req.cookies; 

  console.log(_id);


  Share.find({username},function (error, allsharebook) {
    if(error) {
      res.send({
        err: 'error',
        msg: 'share book fail'
      });

    } else {

      if(allsharebook.length >= 3) {

        res.send({
          err: 'error',
          msg: 'share book > 3'
        });
        return;

      }
    
      Book.findOne({_id},function (error, dbBook) {
          if(error) {
            res.send({
              err: null,
              msg: 'share book fail'
            });

          } else {     

          
          console.log("-----");
          console.log(dbBook);
          console.log("-----");

          var book={
            username: dbBook.username,
            title:dbBook.title,
            author:dbBook.author,
            isbn:dbBook.isbn,
            abstract:dbBook.abstract,
            pic:dbBook.pic,
          };       
          Share.create(book,function (error, doc) {

              console.log(error);
              if(error) {
                res.send({
                  err: null,
                  msg: 'share book fail'
                });
              } else {
                res.send({
                  err: null,
                  msg: 'share book success'
                });
            }          
          });
        }
      });
    }

  });

});

app.listen(3000, function () {
  console.log("app is listening");
});
