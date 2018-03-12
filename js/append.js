// append.js is responsible for adding article content inline (METHOD_HTMLAPPEND). This content script
// registers a listener to receive messages from the background script including the found domain. This
// then starts the recursive loading of the complete article based on identified pagination.
browserHelper().runtime.onMessage.addListener(backgroundListener);

function backgroundListener(message) {
	if (!message.domain || !message.url) return;

	let domain = message.domain;
	let defaultUrl = message.url;
	let pages = getPages(domain.paginationPattern);

	if (pages && pages.length > 0) {
		appendText(domain, defaultUrl, pages, 0);
	}
}

// This method is called recursively and appends filtered content of each page to the
// currently loaded HTML code.
function appendText(domain, defaultUrl, pages, pageIndex) {
	if (pageIndex >= pages.length) {
		// Finish recursive calling if all pages added.
		removePagination(domain, document);
		return;
	}

	// Create new URL with pagination.
	let url = createUrl(domain, defaultUrl, pages[pageIndex]);
	
	var request = new XMLHttpRequest();
	request.open("GET", url);
	
	request.onload = function () {
		if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
			// Extract HTML content.
			let innerHtml = (new RegExp(domain.articlePattern)).exec(request.responseText)[1];
			if (!innerHtml) return;

			// Remove pagination.
			removePagination(domain, document);
			
			// Add to existing page.
			var existingHtml = document.getElementsByTagName(domain.articleAppendToTagName)[0];
			existingHtml.insertAdjacentHTML("beforeend", innerHtml);

			// Recursive.
			appendText(domain, defaultUrl, pages, pageIndex+1);
		}
	}

	request.send();
}

// This method finds all pages that need to be loaded. This happens via the paginationPattern
// defined for the domain passed as a param. 
function getPages(paginationPattern) {
	let html = document.getElementsByTagName('body')[0].innerHTML;

	var pages = [];

	let regEx = new RegExp(paginationPattern);
	var match;
	while (match = regEx.exec(html)) {
		pages.push(match[1]);
	}

	return pages;
}

// This method removes all elements responsible for pagination which is not required anymore if
// the full article is available. Define IDs and classes to be removed in domain.removePagination.
function removePagination(domain, html) {
	domain.removePagination.forEach(element => {
		let paginationElements = element.type === "id" ? [ html.getElementById(element.name) ] : 
								 element.type === "class" ? html.getElementsByClassName(element.name) : undefined;
		if (paginationElements) {
			Array.prototype.forEach.call(paginationElements, paginationElement => {
				paginationElement.remove();
			});
		}
	});
}

var hasBrowser = undefined;
function browserHelper() {
	if (hasBrowser === undefined) {
		hasBrowser = typeof (browser) !== "undefined";
	}
	return hasBrowser ? browser : chrome;
}