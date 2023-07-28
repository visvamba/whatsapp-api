import mongoose, { Schema } from "mongoose"
// import { User, UserModel } from "../db/models/User"

const config = require("../config")
console.log(":hello")

const User = mongoose.model(
  "User",
  new Schema({
    phoneId: String,
  }, {collection: "User"})
)

mongoose.connection.once("open", () => {
  console.log(mongoose.connection.collections)

  User.find({}, function (err, resp) {
    if (err) {
      console.log(err)
    }
    console.log("Finished search")
    console.log(resp)
  })
  User.create({phoneId: "xxx"}, function (err, resp) {
    if (err) { console.log(err)}
    console.log(resp)
  })
})

mongoose.connect(config.db.connectionString, config.db.options)


// User.find({}, function (err, resp) {
//   if (err) {
//     console.log(err)
//   }
//   console.log(resp)
// })