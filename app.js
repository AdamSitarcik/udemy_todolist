const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/todolistDB');

const itemSchema = new mongoose.Schema({
    content: String
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    content: 'Welcome to your todolist!'
});

const item2 = new Item({
    content: 'Hit + to add a new item'
});

const item3 = new Item({
    content: 'Hit this to check-out an item'
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err) {
//     if(err){
//         console.log(err);
//     }
//     else {
//         console.log('Succesfully added default items!');
//     }
// });



app.get("/", function (req, res) {
    let items = [];
    Item.find({}, function (err, results) {
        res.render("list", {
            listTitle: 'Today',
            newListItems: results
        });
    });

});

app.post("/", function (req, res) {
    let item = req.body.newTask;
    // items.push(item);
    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work",
        newListItems: workItems
    })
});

app.post("/work", function (req, res) {
    let item = req.body.newTask;
    res.redirect("/work");
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server running on port 3000");
});