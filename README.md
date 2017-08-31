# linkedin-inbox-crawler

Crawl your own LinkedIn inbox message.
And then do whatever you think LinkedIn should have done for you :)

The idea is simply to use a userscript to crawl the message page (https://www.linkedin.com/messaging) and post them to a local web service that has a sqlite backend.

## How to Use

1. Install [Tampermonkey](https://tampermonkey.net/) Chrome extension if you dont have it yet
2. Install the userscript `inbox_crawler.js` onto Tempermonky
3. Run the local web service by `python tiny_server.py`
4. Go to https://www.linkedin.com/messaging, login, and click the trigger command for the userscript
5. Enjoy your own data!

## Dependencies

This is a Python 3 project.
The userscript is Tested only on Chrome using Tampermonkey.
