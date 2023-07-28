const logger = require('../utils/logger')
import { createConversation, retrieveConversation, retrieveUser } from "../db/queries"


export const getConversation = async (req, res, next) => {
  const phoneId = req.query.phoneId
  const recipient = req.query.recipient

  const conversation = await retrieveConversation(phoneId, recipient)
  res.json(conversation)
}

export const initiateChat = async (req, res, next) => {
  const phoneId = req.body.phoneId
  const recipient = req.body.recipient
  logger.info({phoneId, recipient})
  try {
    const conversation = await createConversation(phoneId, recipient)
    res.json(conversation)
  } catch (err) {
    logger.error(err.message)
    res.status(500).send()
  }
}

