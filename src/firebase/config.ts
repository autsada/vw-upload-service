import admin from "firebase-admin"
import {
  initializeApp,
  getApps,
  getApp,
  applicationDefault,
} from "firebase-admin/app"
import { getStorage } from "firebase-admin/storage"

import type { Environment } from "../types"

const {
  NODE_ENV,
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_STORAGE_BUCKET,
} = process.env

const env = NODE_ENV as Environment

function initializeFirebaseAdmin() {
  return !getApps.length
    ? initializeApp({
        credential:
          env === "production" || env === "test"
            ? applicationDefault()
            : admin.credential.cert({
                projectId: FIREBASE_PROJECT_ID,
                privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                clientEmail: FIREBASE_CLIENT_EMAIL,
              }),
        storageBucket: FIREBASE_STORAGE_BUCKET,
      })
    : getApp()
}

const firebaseApp = initializeFirebaseAdmin()
export const bucket = getStorage(firebaseApp).bucket(FIREBASE_STORAGE_BUCKET)
