//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set('view engine', 'ejs');

mongoose.set('useFindAndModify', false);

const taskSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, "Task Name is required"]
  }
});

const Task = mongoose.model("Task", taskSchema);

//creating default tasks and array to hold them
const task1 = new Task({
  task: "Select '+' to create a new task"
});
const task2 = new Task({
  task: "Press the checkbox to remove a task"
});
const task3 = new Task({
  task: "Create custom list through the url or the list below"
});

const defaultTasks = [task1, task2, task3];

const listSchema = {
  name: String,
  tasks: [taskSchema]
};

const List = mongoose.model("List", listSchema);

//add default task if there are no task in the list
app.get("/", function(req, res) {
  List.find({}, function(err, foundLists) {
    Task.find({}, function(err, foundItems) {
      if (foundItems.length === 0) {
        Task.insertMany(defaultTasks, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default task were added successfully");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems,
          noList: foundLists
        });
      }
    });
  });
});

//
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.find({}, function(err, foundLists) {
    List.findOne({
      name: customListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {

          //creating a new list
          const list = new List({
            name: customListName,
            tasks: defaultTasks
          });

          list.save(() => res.redirect("/" + customListName));
          // res.redirect("/" + customListName);
        } else {

          //show the existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.tasks,
            noList: foundLists
          });
        }
      }
    });
  });
});

//insert tasks method
app.post("/", function(req, res) {
  const taskName = req.body.newTask;
  const listName = req.body.list;

  const newTask = new Task({
    task: taskName
  });

  if (listName === "Today") {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.tasks.push(newTask);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/createList", function(req, res) {
  const newListName = _.capitalize(req.body.newList);

  List.find({}, function(err, foundLists) {
    List.findOne({
      name: newListName
    }, function(err, foundList) {
      if (!err) {
        if (!foundList) {

          //creating a new list
          const list = new List({
            name: newListName,
            tasks: defaultTasks
          });

          list.save(() => res.redirect("/" + newListName));
          // res.redirect("/" + customListName);
        } else {

          //show the existing list
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.tasks,
            noList: foundLists
          });
        }
      }
    });
  });

});

//checked and delete task method
app.post("/delete", function(req, res) {
  const checkedTaskId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Task.findByIdAndRemove(checkedTaskId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Task completed and deleted.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        tasks: {
          _id: checkedTaskId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }
});

app.post("/deleteList", function(req, res) {
  const checkedListId = req.body.checkbox;
  List.findByIdAndRemove(checkedListId, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("List has been deleted");
      res.redirect("/");
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
