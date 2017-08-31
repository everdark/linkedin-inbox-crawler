// ==UserScript==
// @name         LinkedIn Inbox Crawler
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  test the run-button function
// @author       ykle
// @match        https://www.linkedin.com/messaging/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var full_conversation = false;
var local_web_service = 'http://127.0.0.1:5555/data';

GM_registerMenuCommand('Run Inbox Crawler', function() {
    alert("Start crawling inbox!");
    var thread_href = [];
    var first_mesg = [];
    var time = [];
    var mesglist = $('ul.msg-conversations-container__conversations-list.list-style-none.ember-view');
    mesglist.find('a').each(function(index) {
        var h = $(this).attr('href');
        time[index] = $(this).find('time.msg-conversation-listitem__time-stamp').text();
        first_mesg[index] = $(this).find('span.msg-conversation-card__message-snippet-body').text();
        thread_href[index] = h;
    });
    // for full conversation:
    var i;
    var len = time.length;
    if (full_conversation) {
        for (i=0; i<len; i++) {
            document.location.href = 'https://www.linkedin.com' + thread_href[i];
            //wait for page load?
        }
    }
    // post the data to a local web service
    for (i=0; i<len; i++) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: local_web_service,
            data: `time=${time[i]}&first_mesg=${first_mesg[i]}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
}, 'r');
