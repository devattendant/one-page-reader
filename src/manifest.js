import pkg from "../package.json";

const sharedManifest = {
    description: "__MSG_appDesc__",
	default_locale: "en",
    icons: {
        //16: "icons/16.png",
        //19: "icons/19.png",
        //32: "icons/32.png",
        //38: "icons/38.png",
        48: "icons/48.png",
        //64: "icons/64.png",
        96: "icons/96.png",
        //128: "icons/128.png",
        //256: "icons/256.png",
        //512: "icons/512.png",
    },
    permissions: [
        'webRequest'
    ]
};

const ManifestV2 = {
    ...sharedManifest,
    background: {
        scripts: [
            "src/entries/background/script.js"
        ]
    },
    permissions: [
        ...sharedManifest.permissions,
        'webRequestBlocking',
        'http://*/*',
        'https://*/*'
    ],
    applications: {
		gecko: {
			id: "one-page-reader@devattendant.de"
		}
	}
};

const ManifestV3 = {
    ...sharedManifest,
    background: {
        service_worker: "src/entries/background/serviceWorker.js",
    },
    permissions: [
        ...sharedManifest.permissions,
        "declarativeNetRequest",
        "declarativeNetRequestFeedback",
        'scripting'
    ],
    host_permissions: [
        'http://*/*',
        'https://*/*'
    ],
};

export function getManifest(manifestVersion) {
    const manifest = {
        author: pkg.author,
        description: pkg.description,
        name: pkg.displayName ?? pkg.name,
        version: pkg.version,
    };

    if (manifestVersion === 2) {
        return {
            ...manifest,
            ...ManifestV2,
            manifest_version: manifestVersion,
        };
    }

    if (manifestVersion === 3) {
        return {
            ...manifest,
            ...ManifestV3,
            manifest_version: manifestVersion,
        };
    }

    throw new Error(
        `Missing manifest definition for manifestVersion ${manifestVersion}`
    );
}