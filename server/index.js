require('dotenv').config()
const express = require('express')
const app = express()
const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env
const spotifyAuthCtrl = require('../controllers/spotifyAuthController')

app.use(express.json())

//*SPOTIFY LOGIN ENDPOINTS
app.get('/login', spotifyAuthCtrl.login)
app.post('/callback', spotifyAuthCtrl.callback)
app.post('/refresh', spotifyAuthCtrl.refresh)

app.listen(SERVER_PORT, () => console.log(`listening on port ${SERVER_PORT}`))
