chrome.contextMenus.create({
	id: 'SavetoPlaylist',
	title: 'Save to Playlist',
	contexts: [ 'all' ]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	console.log('Clicked');
	const facebookLink = decodeURIComponent(info.linkUrl);
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = facebookLink.match(regExp);
	const id = match && match[7].length === 11 ? match[7] : false;
	if (!id) {
		alert('Link is not a Youtube Link');
		return;
	}
	console.log(id);

	chrome.tabs.query(
		{
			active: true,
			currentWindow: true
		},
		function(tabs) {
			var activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, {
				id: id
			});
		}
	);
});
