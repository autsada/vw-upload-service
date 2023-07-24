export type Environment = "development" | "test" | "production"

export type UploadVideoArgs = {
  profileName: string
  file: Express.Multer.File
  publishId: string
}
