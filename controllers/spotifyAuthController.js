require('dotenv').config()
const querystring = require('querystring')
const axios = require('axios')
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } = process.env

module.exports = {
  sessionCheck: (req, res) => {
    const { tokens } = req.session
    console.log(tokens)
    if (tokens) {
      res.status(200).send(tokens)
    } else {
      res.status(404).send('No session found')
    }
  },

  login: (req, res) => {
    const scopes =
      'user-read-private user-read-email user-library-read user-library-modify user-read-recently-played user-top-read streaming app-remote-control playlist-read-collaborative playlist-modify-private playlist-modify-public playlist-read-private'

    res.status(200).send(
      'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: SPOTIFY_CLIENT_ID,
          scope: scopes,
          redirect_uri: REDIRECT_URI,
        }),
    )
  },
  callback: async (req, res) => {
    const { code } = req.query
    const body = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }
    try {
      const options = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: querystring.stringify(body),
      }
      const { data: spotifyAuth } = await axios(options)

      req.session.tokens = {
        access_token: spotifyAuth.access_token,
        refresh_token: spotifyAuth.refresh_token,
      }

      res.status(200).send({
        access_token: spotifyAuth.access_token,
        refresh_token: spotifyAuth.refresh_token,
      })
    } catch (error) {
      res.status(500).send('Error authenticating')
    }
  },
  refresh: async (req, res) => {
    const { refresh_token } = req.body
    try {
      const body = {
        grant_type: 'refresh_token',
        refresh_token,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }
      const options = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: querystring.stringify(body),
      }
      const { data: refreshSpotifyAuth } = await axios(options)

      req.session.tokens = {
        access_token: refreshSpotifyAuth.access_token,
        refresh_token:
          refreshSpotifyAuth.refresh_token || req.session.tokens.refresh_token,
      }

      res.status(200).send(refreshSpotifyAuth)
    } catch (error) {
      console.log(error)
      res.status(500).send('Error refreshing auth')
    }
  },
}
