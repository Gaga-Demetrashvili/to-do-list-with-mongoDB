//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.json());

mongoose.connect("mongodb+srv://Gdemetrashvili192939:Gdemetrashvili192939@cluster0.zc6jo.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const firstItem = new Item ({
    name: "Make a bed."
});

const secondItem = new Item ({
    name: "Movement meditation."
});

const thirdItem = new Item ({
    name: "Have a breakfast."
});

const defaultItems = [firstItem, secondItem, thirdItem];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("list", listSchema);


app.use(express.static("public"));

app.get("/", function(req, res){



    Item.find({}, function(err, foundItems){

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log("There was err while inserting docs");
                } else {
                    console.log("Successfuly inserted docs into data base!");
                }
            });

            res.redirect("/");

        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }  

    });

    res.set("Content-Type", "text/html");

});


app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                //Create a new list

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();

                res.redirect("/" + customListName);

            } else {
                //Show an existing list

                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

});


app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    

});

app.post("/delete", function(req, res){
    
    console.log(req.body.checkbox);

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });  
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }

    
});


app.get("/about", function(req, res){
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function(){
    console.log("Server has started successfully.");
});

