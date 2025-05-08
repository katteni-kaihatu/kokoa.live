import { importSPKI, jwtVerify, KeyLike } from "jose"
import express from "express"
import cors from "cors"
import * as session from 'express-session';


let publicKey

const getPublicKey = async () => {
    const result = await fetch("https://auth.resonite.love/api/publickey")
    const json = await result.json()
    return json.key
}

const verify = async (token) => {
    const APP_AUDIENCE = process.env.APP_AUDIENCE
    console.log("APP_AUDIENCE", APP_AUDIENCE)
    return jwtVerify(token, this.publicKey, {
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

app.post("/auth", async (req, res) => {
    console.log("/auth post")
    try {
        const authorizationHeader = req.header("Authorization")
        console.log("Authorization header: " + authorizationHeader)
        const jwt = authorizationHeader?.split("Bearer ")[1]

        const result = await verify(jwt)
        console.log("JWT verified")
        if (result.payload.resoniteUserId) {
            const resultUserId = result.payload.resoniteUserId
            console.log("resoniteUserId", resoniteUserId)
            req.session.user = user
            return user
        } else {
            new HttpException("Unauthorized", 401)
        }
    } catch (e) {
        console.error("Failed to verify JWT", e)
        throw new HttpException("Unauthorized", 401)
    }
})




app.listen(3001, () => {
    console.log("server listen on port 3001")
})