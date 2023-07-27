import express from "express"
import workerpool from "workerpool"
import path from "path"

import { uploadDisk } from "../middlewares/multer"
import { auth } from "../middlewares/auth"
import type { Environment, UploadVideoArgs } from "../types"

const { NODE_ENV } = process.env

const env = NODE_ENV as Environment

// Create a worker pool to run a worker.
const pool = workerpool.pool(
  path.resolve(
    __dirname,
    env === "development" ? "worker-dev.js" : "worker.js"
  ),
  {
    minWorkers: 1,
    workerType: "thread",
  }
)

export const router = express.Router()

/**
 * Upload video file
 */
router.post("/video", auth, uploadDisk, (req, res) => {
  const file = req.file
  const { profileName, publishId } = req.body as Omit<UploadVideoArgs, "file">

  if (!file || !profileName || !publishId) {
    res.status(400).json({ error: "Bad request" })
  } else {
    pool
      .proxy()
      .then(function (worker) {
        return worker.uploadVideo({ profileName, file, publishId })
      })
      .then(function (result) {
        res.status(200).json(result)
      })
      .catch(function (err) {
        res
          .status(err.status || 500)
          .send(err.message || "Something went wrong")
      })
      .then(function () {
        pool.terminate() // terminate all workers when done
      })
  }
})

/**
 * Delete publish's files in cloud storage
 */
router.post("/delete/files", auth, (req, res) => {
  const { ref, publishId } = req.body as { ref: string; publishId: string }

  if (!ref) {
    res.status(400).json({ error: "Bad request" })
  } else {
    pool
      .proxy()
      .then(function (worker) {
        return worker.deleteFiles(ref, publishId)
      })
      .then(function (result) {
        res.status(200).json(result)
      })
      .catch(function (err) {
        res
          .status(err.status || 500)
          .send(err.message || "Something went wrong")
      })
      .then(function () {
        pool.terminate() // terminate all workers when done
      })
  }
})

/**
 * Delete a file
 */
router.post("/delete/file", auth, (req, res) => {
  const { ref } = req.body as { ref: string }

  if (!ref) {
    res.status(400).json({ error: "Bad request" })
  } else {
    pool
      .proxy()
      .then(function (worker) {
        return worker.deleteFile(ref)
      })
      .then(function (result) {
        res.status(200).json(result)
      })
      .catch(function (err) {
        res
          .status(err.status || 500)
          .send(err.message || "Something went wrong")
      })
      .then(function () {
        pool.terminate() // terminate all workers when done
      })
  }
})
