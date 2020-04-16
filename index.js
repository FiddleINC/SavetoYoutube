console.log('This is Listen to this KGP');

var YOUR_CLIENT_ID = '57241473038-t9oj20o81ubp5vtanok7smv8i5tvdn1h.apps.googleusercontent.com';
var YOUR_REDIRECT_URI;
var fragmentString = location.hash.substring(1);

chrome.tabs.query({ active: true, currentWindow: true }, (tabArray) => {
	YOUR_REDIRECT_URI = tabArray[0].url;
});

// Parse query string to see if page request is coming from OAuth 2.0 server.
var params = {};
var regex = /([^&=]+)=([^&]*)/g,
	m;
while ((m = regex.exec(fragmentString))) {
	params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}
if (Object.keys(params).length > 0) {
	localStorage.setItem('oauth2-test-params', JSON.stringify(params));
	if (params['state'] && params['state'] == 'try_sample_request') {
		trySampleRequest();
	}
}

// If there's an access token, try an API request.
// Otherwise, start OAuth 2.0 flow.
function trySampleRequest() {
	var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
	if (params && params['access_token']) {
		var xhr = new XMLHttpRequest();
		xhr.open(
			'GET',
			'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&' +
				'access_token=' +
				params['access_token']
		);
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState === 4 && xhr.status === 200) {
				console.log(xhr.response);
			} else if (xhr.readyState === 4 && xhr.status === 401) {
				// Token invalid, so prompt for user permission.
				oauth2SignIn();
			}
		};
		xhr.send(null);
	} else {
		oauth2SignIn();
	}
}

/*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
function oauth2SignIn() {
	// Google's OAuth 2.0 endpoint for requesting an access token
	var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
	var params = {
		client_id: YOUR_CLIENT_ID,
		redirect_uri: YOUR_REDIRECT_URI,
		scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
		state: 'try_sample_request',
		include_granted_scopes: 'true',
		response_type: 'token'
	};

	var xhr = new XMLHttpRequest();
	xhr.open('GET', oauth2Endpoint);
	xhr.onreadystatechange = function(e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			console.log(xhr.response);
		} else if (xhr.readyState === 4 && xhr.status === 401) {
			// Token invalid, so prompt for user permission.
			console.log('Error');
		}
	};
	xhr.send(null);

	// Create element to open OAuth 2.0 endpoint in new window.
	// var form = document.createElement('form');
	// form.setAttribute('method', 'GET'); // Send as a GET request.
	// form.setAttribute('action', oauth2Endpoint);

	// // Parameters to pass to OAuth 2.0 endpoint.
	// var params = {
	// 	client_id: YOUR_CLIENT_ID,
	// 	redirect_uri: YOUR_REDIRECT_URI,
	// 	scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
	// 	state: 'try_sample_request',
	// 	include_granted_scopes: 'true',
	// 	response_type: 'token'
	// };

	// // Add form parameters as hidden input values.
	// for (var p in params) {
	// 	var input = document.createElement('input');
	// 	input.setAttribute('type', 'hidden');
	// 	input.setAttribute('name', p);
	// 	input.setAttribute('value', params[p]);
	// 	form.appendChild(input);
	// }

	// // Add form to page and submit it to open the OAuth 2.0 endpoint.
	// document.body.appendChild(form);
	// form.submit();
}

trySampleRequest();
