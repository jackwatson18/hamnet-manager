// const { models } = require("mongoose");
const mongoose = require("mongoose");
const {Schema} = mongoose;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://cs4200:XTz8UBfv0RAj8fwG@cluster0.jtfgznj.mongodb.net/netlog?retryWrites=true&w=majority');



const MessageSchema = Schema({
    text: {
        type: String,
        required: [true, "Message must have contents."]
    }
}, {
    timestamps: true
});

const NetSchema = Schema({
    name: {type: String, required: [true, "Net must have a name."]},
    frequency: {type: Number, required: [true, "Net must have a frequency."]},
    date: Date,
    controller: String,
    description: String,
    messages: [MessageSchema]

});




const Net = mongoose.model("Net", NetSchema);
const Message = mongoose.model("Message", MessageSchema)


module.exports = {
    Net: Net,
    Message: Message
}