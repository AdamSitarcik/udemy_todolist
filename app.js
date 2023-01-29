const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const env = require("dotenv").config().parsed;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const mongodbPassword = process.env.MONGODB_PASSWORD || env.MONGODB_PASSWORD;

const db_uri = "mongodb+srv://AdamSitarcik:" + mongodbPassword + "@cluster0.tkw5cwj.mongodb.net/todolistDB";

mongoose.set("strictQuery", false);
mongoose.connect(db_uri);

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
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({
        name: customListName
    }, async function (err, foundList) {
        if (err) {
            console.log(err);
        } else if (foundList) {
            res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
            });
        } else {
            const list = new List({
                name: customListName,
                items: [] //defaultItems
            });

            await list.save();
            res.redirect("/" + customListName);
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

const port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("Server running on port 3000");
});