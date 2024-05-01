//const API_URL = "http://localhost:8080";
const API_URL = ""; // this is for if we co-host on railway.app

function addNetValidator(netName,netDate,netFrequency) {
    var errors = [];
    if (netName == "") {
        errors.push("Net must have a name.");
    }
    if (netDate == "") {
        errors.push("Net must have a date.");
    }
    if (netFrequency=="") {
        errors.push("Net must have a frequency.");
    }
    else if (parseFloat(netFrequency) == NaN) {
        errors.push("Net frequency must be a number.");
    }
    else if (netFrequency <= 0) {
        errors.push("Frequency must be a positive number.");
    }

    return errors;

}

function addMessageValidator(messageText) {
    var errors = [];
    if (messageText == "") {
        errors.push("Message text may not be empty.");
    }
    return errors;
}

function dateFormatter(date) {
    if (date.slice(-1) == "Z") {
        return date.substring(0, (date.length-1));
    }
    else {
        return date;
    }
    
}

function dateSplitter(date) {
    date = date.split("T");
    return date[0];
}

Vue.createApp({

data: function() {

    return {
        PAGE_ID: 0, // represent what we show or hide

        nets: [],
        netName: "",
        netDate: "",
        netFrequency: "",
        netController: "",
        netDescription: "",
        netCreateErrors: [],
        netUpdateErrors: [],
        viewedNet: "",
        editingNet: false,

        messages: [],
        messageText: "",
        tempMessageText: "",
        messageCreateErrors: [],
        updateMessageErrors: [],

    };
},

methods: {
    getNetsFromServer: function() {
        fetch(API_URL + "/nets/").then(response => {
            response.json().then( data => {
                console.log("Loaded nets from server:", data);
                this.nets = data;
            });
        });
    },

    getNetById: function(id) {
        fetch(API_URL+"/nets/"+id).then(response => {
            response.json().then( data => {
                this.viewedNet = data;
            })
        })
    },

    getMessagesFromServer: function() {
        fetch(API_URL+"/nets/"+this.viewedNet._id+"/messages").then(response => {
            response.json().then(data => {
                console.log("Messages from server:", data);
                this.messages = data;
            })
        })
    },
  
    addNet: function() {
        var data = "name="+encodeURIComponent(this.netName);
        data += "&frequency="+encodeURIComponent(this.netFrequency);
        data += "&date="+encodeURIComponent(this.netDate);
        data += "&controller="+encodeURIComponent(this.netController);
        data += "&description="+encodeURIComponent(this.netDescription);

        this.netCreateErrors = addNetValidator(this.netName, this.netDate, this.netFrequency)
        if (this.netCreateErrors.length == 0) {
            fetch(API_URL+"/nets", {
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then( response => {
                if (response.status == 201) {
                    this.netName = "";
                    this.netFrequency = "";
                    this.netDate = "";
                    this.netController = "";
                    this.netDescription = "";
                    this.getNetsFromServer();
                }
            });
        }
        else {
            console.log(this.netCreateErrors);
        }
                
    },

    deleteNet: function(net) {
        if (!net.flaggedForDelete) {
            net.flaggedForDelete = true;
        }
        else {
            fetch(API_URL+"/nets/"+net._id, {
                method: "DELETE"
            }).then(response => {
                if (response.status == 204) {
                    console.log("Net deleted successfully");
                    this.getNetsFromServer();
                }
            })
        }
    },

    updateNet: function() {
        var data = "name="+encodeURIComponent(this.netName);
        data += "&frequency="+encodeURIComponent(this.netFrequency);
        data += "&date="+encodeURIComponent(this.netDate);
        data += "&controller="+encodeURIComponent(this.netController);
        data += "&description="+encodeURIComponent(this.netDescription);

        console.log(this.netDate);
        console.log(encodeURIComponent(this.netDate))
        console.log(this.viewedNet._id);

        this.netUpdateErrors = addNetValidator(this.netName, this.netDate, this.netFrequency)
        if (this.netUpdateErrors.length == 0) {
            fetch(API_URL+"/nets/"+this.viewedNet._id, {
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then( response => {
                if (response.status == 200) {
                    this.netName = "";
                    this.netFrequency = "";
                    this.netDate = "";
                    this.netController = "";
                    this.netDescription = "";
                    this.netUpdateErrors = [];
                    this.toggleEditModeNet();
                    this.getNetById(this.viewedNet._id);
                }
            });
        }
        else {
            console.log(this.netCreateErrors);
        }
    },

    addMessage: function() {
        this.messageCreateErrors = addMessageValidator(this.messageText);
        if (this.messageCreateErrors.length == 0) {
            data = "text="+encodeURIComponent(this.messageText);
            fetch(API_URL+"/nets/"+this.viewedNet._id+"/messages", {
                method: "POST",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(response => {
                if (response.status == 201) {
                    this.messageText = "";
                    this.getMessagesFromServer();
                    console.log(this.messages);
                }
            })
        }
        else {
            console.log(this.messageCreateErrors);
        }
    },

    deleteMessage: function(message) {
        if (!message.flaggedForDelete) {
            message.flaggedForDelete = true;
            console.log("flagged for delete");
        }
        else {
            fetch(API_URL+"/nets/"+this.viewedNet._id+"/messages/"+message._id, {
                method: "DELETE"
            }).then(response => {
                if (response.status==204) {
                    console.log("Message deleted successfully");
                    this.getMessagesFromServer();
                    this.getNetsFromServer();
                }
            })
        }
    },

    resetMessageDeleteFlag: function(message) {
        message.flaggedForDelete = false;
    },

    resetNetDeleteFlag: function(net) {
        net.flaggedForDelete = false;
    },

    changeViewedNet: function(net) {
        this.viewedNet = net;
        console.log(this.viewedNet);
        console.log(net.date)

        this.netName = net.name;
        //this.netDate = dateFormatter(net.date);
        this.netDate = dateSplitter(net.date);
        this.netFrequency = net.frequency;
        this.netController = net.controller;
        this.netDescription = net.description;

        this.PAGE_ID = 1;
        this.netCreateErrors = [];
        this.netUpdateErrors = [];
        this.editingNet = false;

        this.getMessagesFromServer();
    },

    backToNets: function() {
        this.PAGE_ID = 0;
        this.netName = "";
        this.netDate = "";
        this.netFrequency = "";
        this.netController = "";
        this.netDescription = "";
    },

    toggleEditModeNet: function() {
        this.editingNet = !this.editingNet
        if (this.editingNet == false) {
            this.changeViewedNet(this.viewedNet);
            this.netName = this.viewedNet.name;
            this.netDate = dateSplitter(this.viewedNet.date);
            this.netFrequency = this.viewedNet.frequency;
            this.netController = this.viewedNet.controller;
            this.netDescription = this.viewedNet.description;
            this.netUpdateErrors = [];
        }
    },

    toggleEditMessage: function(message) {
        if (message.editing) {
            message.editing = false;
            console.log("not editing");
        }
        else {
            message.editing = true;
            this.tempMessageText = message.text;
            console.log("editing");
        }
        this.updateMessageErrors = [];
    },

    updateMessage: function(message) {
        this.updateMessageErrors = addMessageValidator(this.tempMessageText);
        if (this.updateMessageErrors.length == 0) {
            data = "text="+encodeURIComponent(this.tempMessageText);
            fetch(API_URL+"/nets/"+this.viewedNet._id+"/messages/"+message._id, {
                method: "PUT",
                body: data,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then(response => {
                if (response.status == 200) {
                    this.tempMessageText = "";
                    this.getMessagesFromServer();
                    console.log(this.messages);
                    this.toggleEditMessage(message);
                }
            })
        }
        else {
            console.log(this.updateMessageErrors);
        }
    }
},

computed: {
    net_heading: function() {
        if (this.nets.length == 1) {
            return `${this.nets.length} net found`;
        }
        else {
            return `${this.nets.length} nets found`;
        }
    },
    is_net_viewed: function() {
        console.log("testview");
        if (this.viewedNet) {
            console.log(true);
            return true;
        }
        else {
            console.log(false);
            return false;
        }
    },
    message_count: function() {
        return this.messages.length;
    },

    messages_header: function() {
        if (this.message_count > 0) {
            return "Net Messages"
        }
        else {
            return "There are no messages for this net."
        }
    },

    nice_date: function() {
        return dateSplitter(this.viewedNet.date);
    }

},

created: function() {
    this.getNetsFromServer();
}

}).mount("#app");