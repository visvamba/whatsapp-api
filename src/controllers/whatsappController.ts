import {
  AxiosRequestConfig,
  AxiosRequestTransformer,
  AxiosResponse,
} from "axios"
import { Mongoose } from "mongoose"
import { Logger } from "winston"
import { User } from "../db/models/User"

const axios: AxiosRequestTransformer = require("axios")

const config = require("../config")
const logger: Logger = require("../utils/logger")

import { saveAgentMessage, saveUserMessage, retrieveUser } from "../db/queries"

module.exports.sendMessage = async (req, res, next) => {
  const recipientNumber: string = req.body.recipient
  const senderPhoneId: string = req.body.senderPhoneId
  const messageBody: string = req.body.text
  const authToken =
    "EAAKVLpWmZCuIBAGSYtZALXrGrLLxLSdQETMsjViNYlkKn0zwvGYxbInyeVpDYq0geTIxLnQ9Q5MuZClgW1pFHO62AWeC2LIj9BOSmmoxZAJHUqsIE9ifgcnQmZB22KtVwX691oZBIknCafXjFZB7NgRZBOYj31GZA3pV3JQHfK5VthlgdRuhsJqZCwMZAv2IQHnmUvk9xDB84X1qgZDZD"

  let data = {
    messaging_product: "whatsapp",
    to: recipientNumber,
    type: "text",
    text: { body: messageBody },
  }
  let axiosConfig: AxiosRequestConfig = {
    method: "post",
    url: `${config.facebook.facebookUrl}/${senderPhoneId}/messages`,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    data: data,
  }

  try {
    let whatsappResp: AxiosResponse = await axios(axiosConfig)
    if (whatsappResp.status === 200) {
      const storeQueries = []
      for (const msg of whatsappResp.data.messages) {
        logger.info(`Sent message - ID: ${msg.id}`)
        storeQueries.push(
          saveAgentMessage(
            {
              recipient: recipientNumber,
              text: messageBody,
              timestamp: Math.floor(Date.now()/1000),
            },
            senderPhoneId
          )
        )
      }
      Promise.all(storeQueries)
        .then((result) => {
          res.status(200).send("Success")
        })
        .catch((err) => {
          logger.error(err)
          res.status(500).send("Unable to store messages")
        })
    } else {
      logger.error(whatsappResp.data)
      res.status(500).send("Failed")
    }
  } catch (err) {
    logger.error(err)
    res.status(500).send("Failed")
  }
}

module.exports.getChatList = async (req, res) => {
  logger.info("Fetching chat list.")

  const messages = []
  const user = await retrieveUser(req.query['phoneId'])
  const conversations = user.toObject({flattenMaps: true}).conversations
  const data = []
  Object.keys(conversations).forEach((key) => {
    
    const lastMsg = conversations[key].length > 0 ? conversations[key].messages[conversations[key].messages.length - 1].text : ""
    data.push({recipient: key, lastMessage: lastMsg})
  })
  // res.json(user.conversations)
  res.json(data)
}

module.exports.verifyWebhook = async (req, res, next) => {
  logger.info("Webhook verification")
  /** UPDATE YOUR VERIFY TOKEN
  This will be the Verify Token value when you set up webhook**/
  const VERIFY_TOKEN = "mbb-whatsapp"

  // Parse params from the webhook verification request
  let mode: string = req.query["hub.mode"]
  let token: string = req.query["hub.verify_token"]
  let challenge: string = req.query["hub.challenge"]

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED")
      res.status(200).send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  } else {
    res.status(500).send()
  }
}

module.exports.receiveNotification = async (req, res, next) => {
  logger.info("Received notification via webhook.")
  // logger.info(JSON.stringify(req.body))

  const storeQueries = []
  for (const entry of req.body.entry) {
    // logger.info(JSON.stringify(entry))
    const changes = entry.changes

    for (const change of changes) {
      // logger.info(JSON.stringify(change))
      const agentPhoneId = change.value.metadata.phone_number_id.toString()
      if (change.value.messages) {
        
        for (const msg of change.value.messages) {
          storeQueries.push(
            saveUserMessage(
              {
                text: msg.text.body,
                from: msg.from,
                timestamp: parseInt(msg.timestamp),
              },
              agentPhoneId
            )
          )
        }
      }
    }
  }

  Promise.all(storeQueries)
    .then((results) => {
      for (const result of results) {
        logger.info(`Stored messages for ${result.agentPhoneId}`)
      }
      res.sendStatus(200)
    })
    .catch((err) => {
      logger.error(err.message)
      res.sendStatus(500)
    })
}


