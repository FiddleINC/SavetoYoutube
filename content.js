var authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
var YOUR_CLIENT_ID = '56094811628-u0jndeqp7uc5pmcr4pic170lr70laje0.apps.googleusercontent.com';
var YOUR_REDIRECT_URI = window.location.href;
var fragmentString = location.hash.substring(1);
var playlistData;
var playlistBool = false;

var params = {};
var regex = /([^&=]+)=([^&]*)/g,
	m;
while ((m = regex.exec(fragmentString))) {
	params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
	localStorage.setItem('oauth2-test-params', JSON.stringify(params));
}

function getPlaylists() {
	axios
		.get(
			'https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&maxResults=25&mine=true&' +
				'access_token=' +
				params['access_token'],
			{
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'application/json'
				}
			}
		)
		.then((response) => {
			playlistData = response.data.items[0];
			playlistBool = true;
			alert('Playlist selected: ' + playlistData.snippet.title);
		})
		.catch((err) => console.error(err));
}

function savetoPlaylist(playlistId, videoId) {
	axios({
		method: 'post',
		url: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
		headers: {
			Authorization: 'Bearer ' + params['access_token'],
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		data: {
			snippet: {
				playlistId: playlistId,
				position: 0,
				resourceId: {
					kind: 'youtube#video',
					videoId: videoId
				}
			}
		}
	})
		.then((response) => {
			if (response.status === 200) {
				alert('Added to ' + playlistData.snippet.title);
			}
		})
		.catch((err) => {
			console.error(err);
		});
}

function oauth2SignIn() {
	// Google's OAuth 2.0 endpoint for requesting an access token
	var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

	// Create element to open OAuth 2.0 endpoint in new window.
	var form = document.createElement('form');
	form.setAttribute('method', 'GET'); // Send as a GET request.
	form.setAttribute('action', oauth2Endpoint);

	// Parameters to pass to OAuth 2.0 endpoint.
	var params = {
		client_id: YOUR_CLIENT_ID,
		redirect_uri: YOUR_REDIRECT_URI,
		scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
		state: 'listentothiskgp',
		include_granted_scopes: 'true',
		response_type: 'token',
		playlistID: ''
	};

	// Add form parameters as hidden input values.
	for (var p in params) {
		var input = document.createElement('input');
		input.setAttribute('type', 'hidden');
		input.setAttribute('name', p);
		input.setAttribute('value', params[p]);
		form.appendChild(input);
	}

	// Add form to page and submit it to open the OAuth 2.0 endpoint.
	document.body.appendChild(form);
	form.submit();
}

var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
if (params && params['access_token']) {
	console.log('Logged In already');
	getPlaylists();
} else {
	oauth2SignIn();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request.id);
	if (playlistBool) {
		savetoPlaylist(playlistData.id, request.id);
	}
});
