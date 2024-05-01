# HamNet Net Logger

## Introduction
In amateur radio, a "net" is a planned date and frequency on which people can communicate. This platform facilitates net planning by allowing the scheduling as nets, as well as recording messages within them. Traditionally, a "net controller" will record messages in some sort of log while listening to the net. HamNet provides a web interface for this activity.

## Technical Details
URL: https://netlogger.jackwatson.dev

Both the static web page and API are deployed on this URL using the static middleware.

## Resources
- Net
    - Name (str, required)
    - Date (date, required)
    - Frequency (number, required)
    - Controller (str) 
    - Description (str)
    - Messages (array): This array stores Message subresources

- Message (Always a subelement of a Net. There are no standalone messages)
    - Text (required)
    - The database also tracks the creation/edit dates, but this is not made accessible to the user.

## Mongoose model
```javascript
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
```

## REST endpoints

| Path | GET | POST | PUT | DELETE |
| ---- | --- | ---- | --- | -------|
| /nets| returns all nets | create a new net | not allowed | not allowed |
|/nets/netId| get specified net | already exists | update net | delete net
|/nets/netId/messages|gets messages of net | create new message | not allowed | not allowed |
| /nets/netId/messages/messageId/ | gets single message | not allowed | update specified message | delete specified message