import path from "path"
import { promisify } from "util"
import fs from "fs"

import { bucket } from "../firebase/config"
import { publishMessage } from "../pubsub"
import { encryptString } from "../middlewares/crypto"
import type { UploadVideoArgs } from "../types"

const { VIDEO_DELETION_TOPIC } = process.env

export async function uploadVideo({
  profileName,
  file,
  publishId,
}: UploadVideoArgs) {
  try {
    if (!file) throw { status: 400, message: "Bad request" }

    // Only process video file
    if (
      !file.mimetype.startsWith("video/") &&
      !file.mimetype.startsWith("application/octet-stream")
    ) {
      throw { status: 400, message: "Wrong file type" }
    }

    const filename = file.filename // with extension
    const inputFilePath = file.path

    // Upload the video to Cloud storage
    // Construct destination path for the image to be saved on cloud storage
    // Path will be in the form of `publishes/{profile_name}/publishId/{filename}.mp4` and this is unique.
    const destinationParentPath = path.join(
      "publishes",
      profileName.toLowerCase(),
      publishId
    )
    const videoContentDestination = path.join(destinationParentPath, filename)
    await bucket.upload(inputFilePath, {
      destination: videoContentDestination,
      resumable: true,
    })

    // Unlink temp files
    const unlink = promisify(fs.unlink)
    await unlink(inputFilePath)

    return { status: "Ok" }
  } catch (error) {
    throw error
  }
}

/**
 * @param ref - a directory that contains the files, it is in the format `publishes/<name>/<publish_id>/`
 * @param publishId - a publish id
 * @param playbackId - a playback id of the video
 * @returns
 */
export async function deleteVideo(ref: string, publishId: string) {
  try {
    if (!ref || !publishId) throw { status: 400, message: "Bad request" }

    // Add try/catch so if there is an error here the code will still continue
    try {
      await bucket.deleteFiles({
        prefix: ref,
      })
    } catch (error) {
      console.error(error)
    }

    // Publish a notification to inform relevant services (using pub/sub)
    // Encrypt publishId for security
    const message = encryptString(publishId)
    await publishMessage(VIDEO_DELETION_TOPIC!, message)

    return { status: "Ok" }
  } catch (error) {
    throw error
  }
}

/**
 * @param ref - a path to the image to be deleted
 * @returns
 */
export async function deleteImage(ref: string) {
  try {
    if (!ref) throw { status: 400, message: "Bad request" }

    // Add try/catch so if there is an error here the code will still continue
    try {
      await bucket.file(ref).delete()
    } catch (error) {
      console.error(error)
    }

    return { status: "Ok" }
  } catch (error) {
    throw error
  }
}
