import mongoose, { Document, Model, MongooseDocumentMiddleware } from "mongoose"

const { Schema } = mongoose

import { Message, MessageSchema } from "./Message"
import { Conversation, ConversationSchema } from "./Conversation"


const userSchema = new Schema({
  phoneId: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  // conversations: [ConversationSchema]
  conversations: {
    type: Map,
    of: ConversationSchema
  }
},
{collection: "User"})

const UserModel =  mongoose.model('User', userSchema)

interface User extends Document {
  phoneNumber: string,
  conversations: {
    [key: string]: Conversation
  }
}

export { UserModel, User }