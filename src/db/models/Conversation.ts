import { Schema, Document } from "mongoose";
import { Message, MessageSchema } from "./Message";

const ConversationSchema = new Schema({
  recipient: {
    type: String,
    unique: true,
  },
  messages: [MessageSchema],
})

interface Conversation extends Document {
  recipient: string,
  messages: Array<Message>
}

export {ConversationSchema, Conversation}