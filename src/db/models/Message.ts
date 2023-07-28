import mongoose, { Document } from "mongoose"

const { Schema } = mongoose

const MessageSchema = new Schema({
  text: {
    type: String,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["agent", "customer"]
  },
  sent: Boolean,
  delivered: Boolean
})

interface Message extends Document {
  text: string,
  timestamp: number,
  type: string,
  sent?: boolean,
  delivered?: boolean
}



export {MessageSchema, Message}