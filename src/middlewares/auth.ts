import { Request, Response, NextFunction } from "express"
import axios from "axios"

import { authClient } from "../authClient"
import type { Environment } from "../types"

const { NODE_ENV, PRIVATE_SERVICE_URL } = process.env

const env = NODE_ENV as Environment

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get Firebase auth id token.
    const idToken = req.headers["id-token"]
    if (!idToken || typeof idToken !== "string") {
      res.status(401).send("Un Authorized")
    } else {
      // Call the Wallet Service to verify id token
      const baseURL =
        env === "development" ? "http://localhost:8000" : PRIVATE_SERVICE_URL!
      // The token for use to authenticate between services in GCP
      const token =
        env === "development" ? "" : await authClient.getIdToken(baseURL)
      const result = await axios<{ uid: string }>({
        method: "GET",
        url: `${baseURL}/auth/verify`,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "id-token": idToken,
        },
      })

      req.uid = result.data?.uid
      next()
    }
  } catch (error) {
    next(error)
  }
}
