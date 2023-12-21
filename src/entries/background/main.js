import { findValidDomain, METHOD_HTMLAPPEND, METHOD_REDIRECT } from "./domains";
import { createUrl } from "./utils";

// Messages between background and injected script are parsed.
RegExp.prototype.toJSON = RegExp.prototype.toString;

// Type 1: Website has a page with full entry, so a redirect is enough.
// See `webRequest.onBeforeRequest.addListener` further down, this is legacy code
// only used in Manifest V2 (Firefox).
async function redirectListener(requestDetails) {
	if (!requestDetails.documentUrl) {
		let domain = findValidDomain(requestDetails);

		if (domain && domain.method === METHOD_REDIRECT) {
			let redirectUrl = createUrl(domain, requestDetails.url);

			// Check if redirectUrl is valid and not 404
			if (redirectUrl) {
				const response = await fetch(redirectUrl);
				if (redirectUrl && response.status === 200 && requestDetails.url !== response.redirectUrl) {
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
	if (!requestDetails.documentUrl && requestDetails.tabId !== -1 && requestDetails.type === "main_frame") {
		let domain = findValidDomain(requestDetails);

		if (domain && domain.method === METHOD_HTMLAPPEND) {
			// Timeout as a workaround for "Error: No matching message handler".
			setTimeout(() => {
                // In Chrome 120 sendMessage does not pass the domain object properly (especially RegExp objects)
                // Therefore stringify this into a JSON string
                if (chrome && chrome.scripting) {
                    let executing = chrome.scripting.executeScript({ target: { tabId: requestDetails.tabId }, files: ["/src/entries/background/append.js"]});
                    executing.then(function () {
                        browserHelper().tabs.sendMessage(requestDetails.tabId, { "domain": JSON.stringify(domain), "url": requestDetails.url });
                    }, function (error) {
                        console.log(error);
                    });
                } else {
                    let executing = browserHelper().tabs.executeScript(requestDetails.tabId, { file: "/src/entries/background/append.js" });
                    executing.then(function () {
                        browserHelper().tabs.sendMessage(requestDetails.tabId, { "domain": JSON.stringify(domain), "url": requestDetails.url });
                    }, function (error) {
                        console.log(error);
                    });
                }
			}, 150);
		}
	}
}

// Does not work with Manifest V3, see serviceWorker.js for redirects
(async () => {
    const isChrome = chrome?.runtime?.getURL('')?.startsWith('chrome-extension://');
    if (!isChrome || await chrome.permissions.contains({ permissions: ["webRequestBlocking"] })) {
        console.log(chrome.permissions.contains)
        browserHelper().webRequest.onBeforeRequest.addListener(
            redirectListener,
            { urls: ["<all_urls>"] },
            ["blocking"]
        );
    }
})()

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