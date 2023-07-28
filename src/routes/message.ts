import express from "express"
const router = express.Router()

const logger = require("../utils/logger")
const config = require("../config")
const whatsapp = require('../controllers/whatsappController')
const conversationCtrl = require("../controllers/conversationController")

router.post("/send", whatsapp.sendMessage)
router.get("/list", whatsapp.getChatList)
router.get("/conversation", conversationCtrl.getConversation)
router.post("/create", conversationCtrl.initiateChat)

router.get("/webhook", whatsapp.verifyWebhook)
router.post("/webhook", whatsapp.receiveNotification)
module.exports = router
