require('dotenv').config()
const querystring = require('querystring')
const axios = require('axios')
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI } = process.env

module.exports = {
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

      try {
        const userOptions = {
          url: 'https://api.spotify.com/v1/me',
          method: 'GET',
          headers: { Authorization: `Bearer ${spotifyAuth.access_token}` },
        }
        const { data: userData } = await axios(userOptions)
        res.status(200).send({
          userData,
          access_token: spotifyAuth.access_token,
          refresh_token: spotifyAuth.refresh_token,
        })
      } catch (error) {
        res.status(500).send('Error fetching user data')
      }
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
      res.status(200).send(refreshSpotifyAuth)
    } catch (error) {
      console.log(error)
      res.status(500).send('Error refreshing auth')
    }
  },
}
