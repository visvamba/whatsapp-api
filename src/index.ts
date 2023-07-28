const express = require("express")
const cors = require('cors')
import { Express, Request, Response, Router } from "express"
import { Logger } from "winston"

const config = require("./config")
const logger: Logger = require("./utils/logger")

const message: Router = require("./routes/message")

const app: Express = express()

const mongoose = require("mongoose")

const path = require('path')

const corsOptions = {
  origin: "*"
}
// app.use(cors(corsOptions))
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json())
// app.use("/", (req: Request, res: Response) => {
//   res.send("Hi!")
// })

app.use("/message", message)

app.use("/static", express.static(path.join(__dirname, "static")))

app.use((err, req: Request, res: Response, next) => {
  logger.error(err)

  res.status(err.status || 500)

  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  })
})

function connect() {
  mongoose.connection
    .on("error", (err) => logger.error(err))
    .on("disconnected", connect)
    .once("open", () => {
      app.listen(config.expressPort, "0.0.0.0", () => {
        // logger.info(`$PORT=${process.env.PORT}`)
        logger.info(
          `WhatsApp POC API service started on port ${config.expressPort}`
        )
      })
    })
  
  mongoose.connect(config.db.connectionString, config.db.options)
}

connect()
