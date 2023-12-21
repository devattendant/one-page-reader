// Entry point for the manifest V3 version
import "./main";
import "./utils.js";
import { domains, METHOD_REDIRECT } from "./domains.js";

domains.forEach(async (domain, index) => {
    const id = index+1;
    
    // As manifest V3 forbids blocking webRequest handlers, we need to create dynamic rules to forward pages to
    // their one page version. For each domain we are creating two rules:
    // 1. Rule 1 (ID: 1xxx) is the actual redirect rule.
    // 2. Rule 2 (ID: 2xxx) is a safety rule to prevent endless redirects of Rule 1. This solution is required,
    //    as most of the previous rules were/are based on negative lookarounds in the RegEx, to check if a redirect
    //    is possible and required. However declarativeNetRequest uses the RE2 syntax that does not support 
    //    negative lookarounds (see https://github.com/google/re2/wiki/Syntax).
    //    These rules also have a higher priority than Rule 1 entries to catch loop redirects.
    if (domain.method === METHOD_REDIRECT && domain.redirect) {
        // IDs 1000-1999 are used for redirect-type rules (with lower priority)
        // IDs 2000-2999 are used for allow-type rules (to stop loops)
        if (domain.urlPatternRedirect) {
            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: 1000 + id,
                    priority: 1,
                    condition: {
                        requestDomains: [
                            domain.domain
                        ],
                        regexFilter: domain.urlPatternRedirect.source.replace('\\/', '/'),
                        resourceTypes: [
                            "main_frame"
                        ]
                    },
                    action: {
                        type: "redirect",
                        redirect: domain.redirect
                    }
                }],
                removeRuleIds: [1000 + id]
            });
        }

        if (domain.urlPatternAllowed) {
            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [{
                    id: 2000 + id,
                    priority: 2,
                    condition: {
                        requestDomains: [
                            domain.domain
                        ],
                        regexFilter: domain.urlPatternAllowed.source.replace('\\/', '/'),
                        resourceTypes: [
                            "main_frame"
                        ]
                    },
                    action: {
                        type: "allow"
                    }
                }],
                removeRuleIds: [2000 + id]
            });
        }
    }
});