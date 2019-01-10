# Keyword Blocker
## Block Youtube Videos based on specified keywords

This web extension can block YouTube videos or channels from view based on keywords you can specify.
It features a very basic password protection and the block message is user-customizable.

Originally this was developed for a person who is easily scared and needed to be protected from certain YouTube searches. Because there was no easy way to do this I developed this extension.

Get it in the [Chrome Webstore](https://chrome.google.com/webstore/detail/keyword-blocker/pbgacppomjfpheddhifkdkklddnolnpg)
or for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/keyword-blocker/)

## Build instructions
- checkout the repository and run npm install
- npm run dev will build a development version of the extension in the dist folder
- npm run dist will build the release version

Note:
- Due to a bug in html-webpack-plugin injected paths to the stylesheets will have a backslash instead to a forward slash. This will lead to problems when running the plugin on firefox.
- If you build on Mac/Linux/Windows Subsystems for Linux it will work as expected

## Changelog
  - **2.0.2**
     * Firefox compatibility
     * Improved webpack config for smaller extension size
  - **2.0.1**
     * Fixed a bug where the option page turns blank
  - **2.0.0**
    * Complete rewrite for better maintainability
    * Added support for blocking videos with an overlay instead of removing them
    * Improved right click to block functionality
    * Fixed keyword & channel blocking
    * Fixed bug that would block videos if a keyword appeared in the comments
   - **1.8.1 and 1.8.2**
        * Bug fixes of new features
   - **1.8**
        * Added support for trending & subscription page
        * Added support for blocking channels by name or keyword
        * Added support for partial match of keywords
        * Changed export/import of keywords to export/import of all the settings
        * Added right click menu action on selected text for adding to keyword, channel, wildcard keyword or channel keyword list
   - **1.7.1**
        * Bug fix for blocking video
   - **1.7**
        * Fix for new layout of YouTube
        * Added regex support for keyword matching
        * Cleaned up code
   - **1.6**
        * Added csv export
        * Fixed some small bugs
   - **1.5** 
        * Added option to also search the description for blocked keywords
   - **1.4**
        * Redesign for a more robust extension (hopefully this will break less often now)
        * Added an option to remove unwanted video's from search results/frontpage instead of always showing the block pop-over
