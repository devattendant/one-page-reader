// Methods available to show a full article to the user:
// REDIRECT - redirect the user to another URL with a full view provided by the website based on a pattern.
// HTMLAPPEND - recursively load page 2, 3, etc. and append article text to the first already loaded page. 
let METHOD_REDIRECT = "redirect";
let METHOD_HTMLAPPEND = "htmlappend";

// Identifiers for all supported websites. Allows e.g. to manually filter code for special modifications.
let KEY_FAZ = "faz";
let KEY_GOLEM = "golem";
let KEY_HEISE = "heise";
let KEY_SUEDDEUTSCHE = "sueddeutsche";
let KEY_WIWO = "wiwo";
let KEY_ZEIT = "zeit";
let KEY_ELFFREUNDE = "11freunde";

// URLs for tests:
// https://www.heise.de/mac-and-i/artikel/HomePod-Apples-Siri-Lautsprecher-im-ersten-Test-3963670.html
// http://www.zeit.de/sport/2018-02/laura-dahlmeier-biathlon-gold-sprint
// http://www.faz.net/aktuell/beruf-chance/beruf/ratgeber-fuer-fuehrungskraefte-wie-serioes-sind-business-coaches-13290487.html
// https://www.golem.de/news/freier-media-player-vlc-3-0-eint-alle-plattformen-1802-132646.html
// http://www.sueddeutsche.de/karriere/befristung-der-spd-vorstoss-gegen-befristete-vertraege-ist-scheinheilig-1.3837184
// https://www.wiwo.de/technologie/digitale-welt/bargeldloses-schweden-ohne-krone-lebt-es-sich-gefaehrlich/20989954.html
// https://www.11freunde.de/artikel/jakub-blaszczykowski-ueber-die-schlimmste-zeit-seines-lebens

// Supported websites with following params:
// key                    - An identifier for the website as defined above.
// domain                 - The domain with TLD, but without subdomains, used for identifying a website based on the URL.
// method                 - Which method is used to show a full article to the user (see definitions above).
// urlPattern             - RegEx to define the position in the URL string where the URL can be modified.
//                          Pattern should return zero capture groups to add at the end of the string or 2 capture groups to add between.
// urlInsert              - The string content inserted into the URL to redirect or add pagination for HTMLAPPEND.
//                          For HTMLAPPEND use {page} to replace with a capture group found with paginationPattern.
// paginationPattern      - (HTMLAPPEND only) RegEx to identify how many pages have to be loaded. Must return capture groups for
//                          each page, which are inserted into {page} in urlInsert template.
// articlePattern         - (HTMLAPPEND only) RegEx to find the article content inside of the loaded page.
// articleAppendToTagName - (HTMLAPPEND only) Loaded article content of pages 2, 3, etc. will be append to this tag's innerHTML
// removePagination       - (HTMLAPPEND only) DOM Elements to identify and remove pagination from the complete article.
let domains = [
	{
		key: KEY_FAZ, domain: "faz.net",
		method: METHOD_REDIRECT, urlPattern: /^(?:.(?!printPagedArticle=true#pageIndex_0$))+$/g, urlInsert: "?printPagedArticle=true#pageIndex_0"
	}, { 
		key: KEY_HEISE, domain: "heise.de", 
		method: METHOD_REDIRECT, urlPattern: /^(?:.(?!seite=all$))+$/g, urlInsert: "?seite=all"
	}, {
		key: KEY_SUEDDEUTSCHE, domain: "sueddeutsche.de",
		method: METHOD_REDIRECT, urlPattern: /^(?:.(?!article.singlePage=true$))+$/g, urlInsert: "?article.singlePage=true"
	}, {
		key: KEY_WIWO, domain: "wiwo.de",
		method: METHOD_REDIRECT, urlPattern: /^(.*[0-9])(\.html)$/g, urlInsert: "-all"
	}, { 
		key: KEY_ZEIT, domain: "zeit.de", 
		method: METHOD_REDIRECT, urlPattern: /^(?:.(?!komplettansicht$))+$/g, urlInsert: "/komplettansicht"
	}, { 
		key: KEY_GOLEM, domain: "golem.de",
		method: METHOD_HTMLAPPEND, urlPattern: /(.*)(\.html)/g, urlInsert: "-{page}",
		paginationPattern: /(?:<li><a.*id="jtoc_[0-9]".*>)([0-9])(?:<\/a><\/li>)/gm,
		articlePattern: /<article>([.\s\S]*)<\/article>/gm,
		articleAppendToTagName: "article",
		removePagination: [{ type: "id", name: "list-jtoc" }, { type: "id", name: "table-jtoc" }]
	}, {
		key: KEY_ELFFREUNDE, domain: "11freunde.de",
		method: METHOD_HTMLAPPEND, urlPattern: /^(?:.(?!\/page\/[0-9]$))+$/g, urlInsert: "/page/{page}",
		paginationPattern: /(?:<li><a href=".*?\/page\/)([0-9])(?:" title=".*?">Seite)/gm,
		articlePattern: /<article[.\s\S]*?<h3 class="faqfield-question">.*?<\/h3>([.\s\S]*?)(?:<ul class="(?:links|article-pager-toc)">[.\s\S]*?)?<\/article>/m,
		articleAppendToTagName: "article",
		removePagination: [{ type: "class", name: "links" }, { type: "class", name: "article-pager-toc" }]
	}
];

// This method returns the domain object based on the requestDetails, basically the URL.
// TODO?: Require only URL as param.
function findValidDomain(requestDetails) {
	return domains.find(element => {
		var t = (new RegExp("https?://([^\\.]*\\.)?" + element.domain + "(.)", "i"));
		if ((new RegExp("https?://([^\\.]*\\.)?" + element.domain + "(.)", "i")).test(requestDetails.url)) {
			return element;
		} 
	});
}