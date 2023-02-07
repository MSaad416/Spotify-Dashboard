require('dotenv').config();
// express module
const express = require('express');
const querystring = require('querystring');
const res = require('express/lib/response');
// express app instance
const app = express();
const axios = require('axios');
const { response } = require('express');
const path = require('path');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;
const PORT = process.env.PORT || 8888;

app.use(express.static(path.resolve(__dirname, './client/build')));

// route definition:   app.METHOD(PATH, HANDLER);
// route handler
app.get('/', (req, res) => {
    res.send('HOMEPAGE');
});

const generateRandomString = (length) => {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

// route handler
app.get('/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
		// permission scopes
    const scope = 'user-read-private user-read-email user-top-read';
		// redirect
    res.redirect(
        'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state
        })
    );
});

// route handler
app.get('/callback', (req, res) => {
    const code = req.query.code || null;

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }),
        headers: {
            // might have to capitalize below c
            'Content-type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
    })
			.then(response => {

				if(response.status == 200) {
					const {access_token, refresh_token, expires_in} = response.data;
					const queryParams = querystring.stringify({
						access_token,
						refresh_token,
						expires_in
					})

					// redirect to react app
					// pass along tokens in query params
					res.redirect(`${FRONTEND_URI}?${queryParams}`);
				} else {
					res.redirect(`/?${querystring.stringify({
						error: 'invalid_token'}
					)}`);
				}
			})

			.catch(error => {
				res.send(error);
			});
});

app.get('/refresh_token', (req, res) => {
	const {refresh_token} = req.query;

	axios({
		method: 'post',
		url: 'https://accounts.spotify.com/api/token',
		data: querystring.stringify({
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		}),
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			Authorization: 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
		},
	})
		.then(response => {
			res.send(response.data);
		})
		.catch(error => {
			res.send(error);
		});


});

// All remaining requests return the React app, so it can handle routing.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Express app listening at http://localhost:${PORT}`);
});
