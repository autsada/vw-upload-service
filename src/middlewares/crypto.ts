import CryptoJs from "crypto-js"

const { PUBSUB_ENCRYPT_KEY } = process.env

export function encryptString(text: string): string {
  console.time("string-encrypt")
  const encrypted = CryptoJs.AES.encrypt(text, PUBSUB_ENCRYPT_KEY!).toString()

  console.timeEnd("string-encrypt")
  return encrypted
}
