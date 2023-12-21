// This method modifies the page url to view the complete article based on per-domain defined
// regex in domains.js. Additionally it allows to insert a page number if required into the url.
export function createUrl(domain, url, page = undefined) {
	// If it has urlPattern property, it is already a RegExp object
	let regex = domain.urlPattern.source ? domain.urlPattern : createRegExpFromString(domain.urlPattern);

	let results = regex.exec(url);
	if (results) {
		// Create URL replacement with optional pagination.
		let urlInsert = page ? domain.urlInsert.replace("{page}", page) : domain.urlInsert;

		// Add urlInsert as parameter to url query
		urlInsert = urlInsert.replace("{?}", url.includes("?") ? "&" : "?");

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

// See main.js, stringifying a RegExp is set as RegExp.prototype.toJSON = RegExp.prototype.toString; (e.g. '/hello/gm')
// This is the function to turn this around and create a RegExp from a string where the flags are included.
export function createRegExpFromString(string) {
    const pattern = string.slice(1, string.lastIndexOf('/'));
    const flags = string.slice(string.lastIndexOf('/') + 1);
    return new RegExp(pattern, flags);
}