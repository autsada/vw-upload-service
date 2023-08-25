import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../.env") })
import util from "util"
util.inspect.defaultOptions.depth = null
import express from "express"
import cors from "cors"
import http from "http"

import { router } from "./routes"

const { PORT } = process.env
const port = Number(PORT || 4444)

const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors())

/**
 * This route is for testing only
 */
// =============
app.get("/test", async (req, res, next) => {
  try {
    res.status(200).json({ status: "Ok" })
  } catch (error) {
    console.log("error: ", error)
    next(error)
  }
})
// =============

app.use("/upload", router)

// Create the HTTP server
const httpServer = http.createServer(app)

httpServer.listen({ port }, () => {
  console.log(`Server ready at port: ${port}`)
})
