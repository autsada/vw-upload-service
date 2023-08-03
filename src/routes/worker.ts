import workerpool from "workerpool"

import { uploadVideo, deleteVideo, deleteImage } from "../controllers/upload"

// create a worker and register public functions
workerpool.worker({
  uploadVideo,
  deleteVideo,
  deleteImage,
})
