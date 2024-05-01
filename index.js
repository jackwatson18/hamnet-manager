const express = require('express');
const cors = require('cors');
const model = require('./model');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));


async function getNet(netId) { // get net by ID
    const foundNet = await model.Net.findOne({ "_id": netId});
    return foundNet;
}

// Validators

function validateNet(netName, netDate, netFrequency) {
    var isValid = true;
    if (netName == "") {
        isValid = false;
        console.log("Net has no name");
    }
    if(isNaN(new Date(netDate).getDate())) {
        isValid = false;
        console.log("Net date invalid");
    }
    if(isNaN(parseFloat(netFrequency))) {
        isValid = false;
        console.log("Frequency invalid");
    }

    return isValid;

}


// GET functions


app.get("/nets", function(req, res) {
    model.Net.find().then(nets => {
        console.log(nets);
        res.json(nets);
    });
});

app.get("/nets/:netId", function(req, res) {
    getNet(req.params.netId).then(net => {
        if (net) {
            res.json(net);
        }
        else {
            res.status(404).send("Net not found (get)");
        }
    }).catch(() => {
        res.status(400).send("Net not found");
    })
});

app.get("/nets/:netId/messages", function(req,res) {
    getNet(req.params.netId).then(net => {
        if (net) {
            res.json(net.messages);
        }
        else {
            res.status(404).send("Net not found");
        }
    }).catch(() => {
        res.status(400).send("Net not found");
    });
});

app.get("/nets/:netId/messages/:messageId", function(req,res) {
    getNet(req.params.netId).then(net => {
        if (net) {
            message = net.messages.find(obj => obj._id == req.params.messageId)
            if (message) {
                res.json(message);
            }
            else {
                res.status(404).send("Message not found");
            }
        }
        else {
            res.status(404).send("Net not found");
        }
    }).catch(() => {
        res.status(400).send("Net not found");
    });
})


// POST functions


app.post("/nets", function(req, res) {
    console.log(req.body);
    var isValid = validateNet(req.body.name, req.body.date, req.body.frequency);

    if (isValid) {
        const newNet = new model.Net({
            name: req.body.name,
            frequency: req.body.frequency,
            date: req.body.date,
            controller: req.body.controller,
            description: req.body.description,
            // nets have messages, but it doesn't make sense to add messages on create
        });
    
        newNet.save().then(() => {
            console.log("New net added to DB");
            console.log(newNet.controller);
            res.status(201).send("Added net");
        }).catch(() => {
            res.status(400).send("Failed to create net");
        });
    }
    else {
        res.status(422).send("Bad request, input failed validation");
    }

});

app.post("/nets/:netId/messages", function (req,res) {
    const netId = req.params.netId;
    getNet(netId).then(net => {
        if (net) {
            if (req.body.text) {
                const newMessage = new model.Message({
                    text: req.body.text
                });
    
                model.Net.updateOne(
                    {"_id": netId},
                    { $push: { messages: newMessage }}
                ).then(() => {
                    console.log("Message added to net");
                    res.status(201).send("Added message to net");
                }).catch(() => {
                    res.status(400).send("Failed to add message");
                });
            }

            else {
                res.status(422).send("Failed to add message (No text provided)")
            }
            
        }
        else {
            res.status(404).send("Parent net not found.");
        }
    });
})


// UPDATE functions
/*
Update Net
Update Post
*/

app.put("/nets/:netId", function (req, res) {
    const name = req.body.name;
    const frequency = req.body.frequency;
    const date = req.body.date;
    const controller = req.body.controller;
    const description = req.body.description;

    getNet(req.params.netId).then(net =>{
        if (net) {
            if(validateNet(name, date, frequency)) {
                model.Net.updateOne(
                    {"_id":req.params.netId},
                    {
                        "name": name,
                        "frequency": frequency,
                        "date": date,
                        "controller": controller,
                        "description": description
                    }
                    ).then(result => {
                        console.log(result);
                        res.status(200).send("Net updated successfully");
                    });
            }
            else {
                res.status(422).send("Unable to modify, bad input");
            }
        }
        else {
            res.status(404).send("Net not found");
        }
    })
    
});


app.put("/nets/:netId/messages/:messageId", function (req, res) {
    const newText = req.body.text;
    getNet(req.params.netId).then(net => {
        if (net) {
            if (newText != "") {
                model.Net.updateOne(
                    {"_id": req.params.netId, "messages._id":req.params.messageId},
                    { $set: { "messages.$.text": newText }}
                ).then(() => {
                    res.status(200).send("Message updated");
                });
            }
            else {
                res.status(422).send("Failed to update message (empty text)")
            }
            
            
        }
        else {
            res.status(404).send("Message not found (parent net does not exist)")
        }
    })
})

// DELETE functions

/* 

Delete net
Delete post 
*/




app.delete("/nets/:netId", function(req, res) {
    model.Net.deleteOne({"_id": req.params.netId}).then((result) => {
        if (result.deletedCount > 0) {
            res.status(204).send("Net deleted");
        }
        else {
            res.status(404).send("Net not found");
        }
    });
});

app.delete("/nets/:netId/messages/:messageId", function(req, res) {
    getNet(req.params.netId).then(net => {
        if (net) {
            model.Net.updateOne(
                {"_id":req.params.netId},
                { $pull: { messages: {"_id": req.params.messageId}}}
            ).then((result) => {
                console.log(result);
                if (result.modifiedCount > 0) {
                    res.status(204).send("Message deleted");
                }
                else {
                    res.status(404).send("Message not found");
                }
            })
        }
        else {
            res.status(404).send("Message not found (parent does not exist)");
        }
    })
})


app.listen(port, function() {
    console.log(`Running server on port ${port}...`);
});

