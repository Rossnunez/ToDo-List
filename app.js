//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true,  useUnifiedTopology: true });

app.set('view engine', 'ejs');

const taskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, "Task Name is required"]
  }
});

const Task = mongoose.model("Task", taskSchema);

const task1 = new Task({
  task :  "Do the dishes"
});

const task2 = new Task ({
  task : "Wash the car"
});

const task3 = new Task ({
  task : "Buy some milk"
});

const defaultTasks = [task1, task2, task3];

// Task.insertMany(defaultTasks, function(err){
//   if(err){
//     console.log(err);
//   } else {
//     console.log("Default task were added successfully");
//   }
// });


app.get("/", function(req, res){

  Task.find({}, function(err, foundItems){

    if(foundItems.length == 0){
      Task.insertMany(defaultTasks, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Default task were added successfully");
        }
        res.direct("/");
      });
    } else {
      res.render("list", {kindOfDay: "Today", newListItems: foundItems});
    }
  });

});


app.post("/", function(req, res){
  const itemName = req.body.newItem;

  const newTask = new Task({
    task: itemName
  });

  newTask.save();

  res.redirect("/");

});


app.listen(3000, function(){
  console.log("Server started on port 3000");
});
