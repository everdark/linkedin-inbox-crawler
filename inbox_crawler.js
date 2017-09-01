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

function cleanse_str(s) {
    return s.replace(/(^[\n ]+)|([\n ]+$)/g, '');
}

GM_registerMenuCommand('Run Inbox Crawler', function() {
    alert("Start crawling inbox!");
    var data = {};
    data.thread_href = [];
    data.sender = [];
    data.last_mesg = [];
    data.time = [];
    var mesglist = $('ul.msg-conversations-container__conversations-list.list-style-none.ember-view');
    mesglist.find('a').each(function(index) {
        data.thread_href[index] = $(this).attr('href');
        data.sender[index] = cleanse_str($(this).find('h3.msg-conversation-listitem__participant-names').text());
        data.time[index] = cleanse_str($(this).find('time.msg-conversation-listitem__time-stamp').text());
        data.last_mesg[index] = cleanse_str($(this).find('span.msg-conversation-card__message-snippet-body').text());
    });
    var i;
    var len = data.time.length;
    // for full conversation:
    if (full_conversation) {
        for (i=0; i<len; i++) {
            document.location.href = 'https://www.linkedin.com' + thread_href[i];
            //wait for page load?
        }
    }
    // post the data to a local web service for storage
    for (i=0; i<len; i++) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: local_web_service,
            data: `time=${data.time[i]}&sender=${data.sender[i]}&last_mesg=${data.last_mesg[i]}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
}, 'r');

