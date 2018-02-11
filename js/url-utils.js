// This method modifies the page url to view the complete article based on per-domain defined
// regex in domains.js. Additionally it allows to insert a page number if required into the url.
function createUrl(domain, url, page = undefined) {
	let regex = new RegExp(domain.urlPattern);

	let results = regex.exec(url);
	if (results) {
		// Create URL replacement with optional pagination.
		let urlInsert = page ? domain.urlInsert.replace("{page}", page) : domain.urlInsert;

		if (results.length === 1) {
			// Append at the end.
			return url + urlInsert;
		} else if (results.length === 3) {
			// Insert between, after checking that it's not included already.
			if (!url.endsWith(urlInsert + results[2])) {
				return results[1] + urlInsert + results[2];
			}
		} else {
			// Not supported.
		}
	}
	
	return undefined;
}