
import mongoose from "mongoose"
import { Logger } from "winston"
import {User, UserModel} from "./models/User"

const logger: Logger = require("../utils/logger")

const retrieveUser = async (phoneId: string): Promise<User> => {
  // logger.info("Attempting to retrieve user")
  return new Promise(async (resolve, reject) => {
    const userQuery = { phoneId: `${phoneId}`}
    let user
    try {
      user = await UserModel.findOne(userQuery)
      // logger.info(JSON.stringify(user))
    } catch (err) {
      logger.error(err)
      return reject(new Error(err))
    }

    if (user === null) {
      logger.error(`User with id ${phoneId} does not exist.`)
      return reject(new Error("User does not exist."))
    }

    return resolve(user)
  })
}

const saveAgentMessage = async (message, userId: string) => {
  return new Promise(async (resolve, reject) => {
    // const userQuery = { phoneId: `${userId}`}
    // let user
    // try {
    //   user = await UserModel.findOne(userQuery)
    // } catch (err) {
    //   logger.error(err)
    //   return reject(new Error(err))
    // }

    // if (user === null) {
    //   logger.error(`User with id ${userId} does not exist.`)
    //   return reject(new Error("User does not exist."))
    // }
    let user
    try {
      user = await retrieveUser(userId)
    } catch (err) {
      return reject(err)
    }

    const newMsg = {
      text: message.text,
      timestamp: message.timestamp,
      type: "agent",
      sent: false,
      delivered: false
    }
    
    try {
      let conversation = user.conversations.get(message.recipient)
      if (!conversation) {
        logger.info(`Creating new conversation between ${userId} and ${message.recipient}`)
        user.conversations.set(message.recipient, {
          recipient: message.recipient,
          messages: [newMsg]
        })
        await user.save()
        const userQuery = { phoneId: `${userId}`}
        user = await UserModel.findOne(userQuery)
      }
    } catch (err) {
      logger.error(err.message)
      return reject(new Error("Could not retrieve agent messages."))
    }
    
    try {
      user.conversations.get(message.recipient).messages.push(newMsg)
    } catch (err) {
      logger.error(err.message)
      return reject(new Error("Could not push new agent message."))
    }
    
    try {
      console.log(await user.save())
    } catch (err) {
      logger.error(err)
      return reject(new Error("Failed to store message."))
    }
    
    return resolve(true)
  })
}

const saveUserMessage = async (message, agentPhoneId) => {
  // logger.info(JSON.stringify(message))
  logger.info(`Saving message sent to agent: ${agentPhoneId}`)
  return new Promise(async (resolve, reject) => {
    let user
    try {
      user = await retrieveUser(agentPhoneId)
      // logger.info("Retrieved user.")
      // logger.info(JSON.stringify(user))
    } catch (err) {
      return reject(err)
    }

    const newMsg = {
      text: message.text,
      timestamp: message.timestamp,
      type: "customer",
    }

    try {
      let conversation = user.conversations.get(message.from)
      // logger.info("Retrieved conversation.")
      // logger.info(JSON.stringify(conversation))
      if (!conversation) {
        return reject(new Error("Conversation doesn't exist or has not been initiated by agent yet."))
      }
    } catch (err) {
      logger.error(err.message)
      return reject(new Error("Unable to check for existing conversation."))
    }

    try {
      user.conversations.get(message.from).messages.push(newMsg)
      await user.save()
    } catch (err) {
      logger.error(err.message)
      return reject(new Error("Could not push user message."))
    }

    return resolve({success: true, agentPhoneId: agentPhoneId})
  })
}

const retrieveConversation = async (phoneId: string, recipient: string) => {
  return new Promise(async (resolve, reject) => {
    let user 
    try {
      user = await retrieveUser(phoneId)
    } catch (err) {
      logger.error(err)
      return reject(err)
    }
    
    const conversation = user.conversations.get(recipient)

    return resolve(conversation)
  })
}

const createConversation = async (phoneId: string, recipient: string) => {
  return new Promise(async (resolve, reject) => {
    let user
    try {
      user = await retrieveUser(phoneId)
    } catch (err) {
      logger.error(err)
      return reject(err)
    }

    const conversation = user.conversations.set(recipient, {recipient: recipient, messages: []})
    await user.save()

    return resolve(conversation)
  })
}

export {saveAgentMessage, saveUserMessage, retrieveUser, retrieveConversation, createConversation}