// Type 1: Website has a page with full entry, so a redirect is enough.
function redirectListener(requestDetails) {
	if (!requestDetails.documentUrl) {
		let domain = findValidDomain(requestDetails);

		if (domain && domain.method === METHOD_REDIRECT) {
			let redirectUrl = createUrl(domain, requestDetails.url);

			// Check if redirectUrl is valid and not 404
			if (redirectUrl) {
				// TODO?: Make request async
				var request = new XMLHttpRequest();
				request.open("GET", redirectUrl, false);
				request.send();

				if (redirectUrl && request.status === 200 && requestDetails.url !== request.responseURL) {
					return {
						redirectUrl: redirectUrl
					};
				}
			}
		}
	}
}

// Type 2: Website requires "reloading" further content and pasting below existing.
function completedListener(requestDetails) {
	if (!requestDetails.documentUrl && requestDetails.tabId !== -1) {
		let domain = findValidDomain(requestDetails);

		if (domain && domain.method === METHOD_HTMLAPPEND) {
			// Timeout as a workaround for "Error: No matching message handler".
			setTimeout(() => {
				let executing = browserHelper().tabs.executeScript(requestDetails.tabId, { file: "/js/url-utils.js" });
				executing.then(function () {
					let executing = browserHelper().tabs.executeScript(requestDetails.tabId, { file: "/js/append.js" });
					executing.then(function () {
						browserHelper().tabs.sendMessage(requestDetails.tabId, { "domain": domain, "url": requestDetails.url });
					}, function (error) {
						console.log(error);
					});
				}, function (error) {
					console.log(error);
				});
			}, 150);
		}
	}
}

console.log(typeof (browser));
browserHelper().webRequest.onBeforeRequest.addListener(
	redirectListener,
	{ urls: ["<all_urls>"] },
	["blocking"]
);

browserHelper().webRequest.onCompleted.addListener(
	completedListener,
	{ urls: ["<all_urls>"] }
);

var hasBrowser = undefined;
function browserHelper() {
	if (hasBrowser === undefined) {
		hasBrowser = typeof(browser) !== "undefined";
	}
	return hasBrowser ? browser : chrome;
}