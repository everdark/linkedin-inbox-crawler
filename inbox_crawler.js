// ==UserScript==
// @name         LinkedIn Inbox Crawler
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Crawl Linkedin inbox messages
// @author       ykle
// @match        https://www.linkedin.com/messaging/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @require http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var local_web_service = 'http://127.0.0.1:5555/data';

function cleanse_str(s) {
    return s.replace(/(^[\n ]+)|([\n ]+$)/g, '');
}

GM_registerMenuCommand('Run Inbox Crawler', function() {

    alert("Start crawling inbox!");

    // define data to be collected
    var data = {};
    data.thread_href = [];
    data.sender = [];
    data.time = [];
    data.last_mesg = [];
    data.full_mesg = [];

    var mesglist = $('ul.msg-conversations-container__conversations-list.list-style-none.ember-view');

    // traverse over each conversation
    mesglist.find('a').each(function(index) {
        data.thread_href[index] = $(this).attr('href');
        data.sender[index] = cleanse_str($(this).find('h3.msg-conversation-listitem__participant-names').text());
        data.time[index] = cleanse_str($(this).find('time.msg-conversation-listitem__time-stamp').text());
        data.last_mesg[index] = cleanse_str($(this).find('span.msg-conversation-card__message-snippet-body').text());

        // click to show the full message container
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initEvent('click', true, true);
        this.dispatchEvent(clickEvent);

        // get granular time info inside the container
        mesg_container = $('div.msg-s-message-list-container');
        first_time_in_container = mesg_container.find('time.msg-s-message-list__time-heading:first').text();
        data.time[index] += `|${cleanse_str(first_time_in_container)}`;
        data.full_mesg[index] = mesg_container.find('ul.msg-s-message-group').text();
    });

    // post the data to a local web service for storage
    var i;
    var len = data.time.length;
    for (i=0; i<len; i++) {
        GM_xmlhttpRequest({
            method: 'POST',
            url: local_web_service,
            data: `time=${data.time[i]}&sender=${data.sender[i]}&last_mesg=${data.last_mesg[i]}&full_mesg=${data.full_mesg[i]}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
}, 'r');
