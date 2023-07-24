import workerpool from "workerpool"

import { uploadVideo, deleteFiles } from "../controllers/upload"

// create a worker and register public functions
workerpool.worker({
  uploadVideo,
  deleteFiles,
})
