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

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    content: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    content: "Welcome to your todolist!"
});

const item2 = new Item({
    content: "Hit + to add a new item"
});

const item3 = new Item({
    content: "<-- Hit this to check-out an item"
});

const item4 = new Item({
    content: "Hit this to delete an item -->"
})

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    Item.find({}, function (err, results) {
        if (!results) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Succesfully added default items!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: results
            });
        }
    });
});

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;
    List.findOne({
        name: customListName
    }, function (err, foundList) {
        console.log(foundList);
        if (err) {
            console.log(err);
        } else {
            if (foundList) {
                if (foundList.name === customListName) {
                    res.render("list", {
                        listTitle: foundList.name,
                        newListItems: foundList.items
                    });
                }
            } else {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                console.log('saved');
                res.redirect("/" + customListName);
            }
        }
    });
});

app.post("/", function (req, res) {
    let itemContent = req.body.newTask;
    let listName = req.body.list;

    let item = new Item({
        content: itemContent
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const itemToDeleteID = req.body.deleteItem;
    const listName = req.body.listName;

    if (listName === "Today") {
        console.log(Item);
        Item.findByIdAndRemove(itemToDeleteID, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Removed item ${itemToDeleteID}`);
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: itemToDeleteID
                }
            }
        }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else {
                console.log('Removed');
                res.redirect("/" + listName);
            }
        });
    }
});

// app.get("/work", function (req, res) {
//     res.render("list", {
//         listTitle: "Work",
//         newListItems: workItems
//     })
// });

// app.post("/work", function (req, res) {
//     let item = req.body.newTask;
//     res.redirect("/work");
// });

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server running on port 3000");
});