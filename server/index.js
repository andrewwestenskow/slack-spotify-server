require('dotenv').config()
const express = require('express')
const app = express()
const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env
const spotifyCtrl = require('../controllers/spotifyController')

app.use(express.json())

app.get('/login', spotifyCtrl.login)
app.post('/callback', spotifyCtrl.callback)

app.listen(SERVER_PORT, () => console.log(`listening on port ${SERVER_PORT}`))
