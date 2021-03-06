require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session')
const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env
const spotifyAuthCtrl = require('../controllers/spotifyAuthController')

app.use(express.json())
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
)

//*SPOTIFY LOGIN ENDPOINTS
app.get('/login', spotifyAuthCtrl.login)
app.post('/callback', spotifyAuthCtrl.callback)
app.post('/refresh', spotifyAuthCtrl.refresh)
app.get('/session', spotifyAuthCtrl.sessionCheck)
app.post('/token', spotifyAuthCtrl.checkLocalToken)

//*SPOTIFY CONTROL ENDPOINTS

app.listen(SERVER_PORT, () => console.log(`listening on port ${SERVER_PORT}`))
