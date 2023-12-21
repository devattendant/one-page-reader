# One Page Reader

This add-on attempts to automatically loaded news article in one site. The add-on has been developed because various (especially German) websites are publishing article divided in multiple pages.

## Tested browsers
* Firefox v120.0, Windows 11 (*Manifest V2*)
* Chrome v120.0, Windows 11 (*Manifest V3*)

## Supported websites
* FAZ.net
* golem.de
* heise.de
* sueddeutsche.de
* wiwo.de (Wirtschaftswoche)
* zeit.de
* 11freunde.de

Additional websites can be added in `src/entries/background/domains.js`.

## Known issues/todos
* Golem.de: Fetching other pages' content is not working due to JS being blocked (see [#1](https://github.com/devattendant/one-page-reader/issues/1))
* Golem.de: Video scripts for videos on pages > 1 are not included and therefore missing
* Test code is missing

## Project setup

This project uses [@samrum/vite-plugin-web-extension](https://github.com/samrum/vite-plugin-web-extension) to support Manifest V2 as well as Manifest V3 environment, that is required as Firefox (as of v120) does not fully support Manifest V3, especially service worker - while Google is deprecating V2 in 2024.

### Usage

| Command | Description |
| ------- | ----------- |
| `npm install` | Install all dependencies to run the project. |
| `npm run build` | Creates the project. Make sure to set the *MANIFEST_VERSION* in `.env` file.
| `npm run serve:chrome` | Opens dev environment in Chrome. |
| `npm run serve:firefox` | Opens dev environment in Firefox. |

To switch between Manifest V2 and Manifest V3 builds, use the *MANIFEST_VERSION* environment variable defined in `.env`.

## Authors

See the list of [contributors](https://github.com/devattendant/one-page-reader/contributors) who participated in this project.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details