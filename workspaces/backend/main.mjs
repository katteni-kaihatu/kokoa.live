import { importSPKI, jwtVerify } from "jose"
import express from "express"
import cors from "cors"
import session from 'express-session';

import { RedisStore } from "connect-redis"
import { createClient } from "redis"

import dotenv from "dotenv"
dotenv.config()


let publicKey

const getPublicKey = async () => {
    const result = await fetch("https://auth.resonite.love/api/publickey")
    const json = await result.json()
    return json.key
}

const verify = async (token) => {
    const APP_AUDIENCE = process.env.APP_AUDIENCE
    console.log("APP_AUDIENCE", APP_AUDIENCE)
    return jwtVerify(token, publicKey, {
        algorithms: ["EdDSA"],
        audience: APP_AUDIENCE
    })
}

getPublicKey().then(async (key) => {
    publicKey = await importSPKI(key, "EdDSA")
    console.log("public key loaded.")
})

let redisClient = createClient({
    url: process.env.REDIS_URL,
})
redisClient.connect().catch(console.error)

let redisStore = new RedisStore({
    client: redisClient,
    prefix: "kokolive:",
})

const app = express()
app.use(cors())
app.use(express.json())

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not found.")
}

app.use(
    session({
        name: "kokoa-live-session",
        store: redisStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    }),
);

app.post("/api/auth", async (req, res) => {
    console.log("/auth post")
    try {
        const authorizationHeader = req.header("Authorization")
        console.log("Authorization header: " + authorizationHeader)
        const jwt = authorizationHeader?.split("Bearer ")[1]

        const result = await verify(jwt)
        console.log("JWT verified")
        console.log(result.payload)
        if (result.payload.resoniteUserId) {
            const resultUserId = result.payload.resoniteUserId
            console.log("resoniteUserId", resultUserId)
            req.session.user = resultUserId
            res.json({ success: true, resultUserId })
        } else {
            new Error("Unauthorized")
        }
    } catch (e) {
        console.error("Failed to verify JWT", e)
        throw new Error("Unauthorized")
    }
})

app.delete("/api/auth", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Failed to destroy session", err)
            throw new Error("Failed to destroy session")
        }
    })

    res.status(204).json({ success: true })
})


app.get("/api/user", async (req, res) => {
    if (!req.session.user) {
        // throw new Error("Unauthorized")
        return res.status(401).json({success: false, message:"Unauthorized"})
    }

    res.json({ resoniteUserId: req.session.user })
})

let liveStatus = {
    name: "",
    description: "",
    iconUrl: ""
}

app.get("/api/live/status", (req, res) => {
    res.json(liveStatus)
})

app.post("/api/live/status", (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const iconUrl = req.body.iconUrl

    if(!name || !description) {
        return res.status(400).json({success: false, message: "bad request"})
    }

    liveStatus = {name, description, iconUrl: iconUrl ?? ""}
    return res.json({success: true})
})

app.delete("/api/live/status", (req, res) => {
    liveStatus = {
        name: "",
        description: "",
        iconUrl: ""
    }
    return res.json({success: true})
})

app.listen(3001, () => {
    console.log("server listen on port 3001")
})
