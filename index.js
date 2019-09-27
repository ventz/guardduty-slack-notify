/*
  Copyright (Apache License 2.0): Ventz Petkov 
  Repository: https://github.com/ventz/guardduty-slack-notify
  Initial Release: 9-15-2019
*/

/*
// PLEASE EDIT THESE VARIABLES //
*/
// REQUIRED CHANGE: You must change the Slack incoming webhook
const slackUrl = "https://hooks.slack.com/services/$changemeA/$changemeB/$changemeC";
//OPTIONAL CHANGE: Slack Alerts Channel
const slackChannel = "#guardduty-alerts";


const request = require('request');

exports.handler = async (event) => {
	//console.log(JSON.stringify(event, null, 4));

	// //////////////////////////////////////////////////////////////////////////////////////////
	// EXTRACT JSON																			   //
	// //////////////////////////////////////////////////////////////////////////////////////////
    // let id = event.id;
	// Using this for the sake of "dynamic-ness"
    let detailType = event["detail-type"];
    // These are for the account that's running GuardDuty
    // let account = event.account;
    // let region = event.region
    // let time = event.time;

    // Expand JSON - seems empty?
    let resources = event.resources;

    // Expand JSON - this we very much care about
    let detail = event.detail;

    // Sub-JSON for "detail"
    let id = detail.id;
    let accountId = detail.accountId;
    let region = detail.region;
    let severity = detail.severity;
    let type = detail.type
    let title = detail.title;
    let description = detail.description;
    let time = detail.time;

    // Note: this is unique schema for each "type" of details
    // Probably should "pretty" JSON it and attach it as is
    let resource = detail.resource;
    let resourceType = resource.resourceType;

    let service = detail.service;
    let serviceCount = detail.service.count;
    let eventFirstSeen = detail.service.eventFirstSeen;
    let eventLastSeen = detail.service.eventLastSeen;

    // Note: this is unique schema for each "type" of details
    // Probably should "pretty" JSON it and attach it as is
    // However - provide actionType since that's informative/unique
    let action = service.action;
    let actionType = action.actionType;
	// //////////////////////////////////////////////////////////////////////////////////////////


	// Implement color codes per Amazon's classification of high/medium/low
	// NOTE: 9.0 to 10.0 are reserved for future use
    // https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings.html#guardduty_findings-severity
	if(severity >= 7 && severity <= 8.9) { color = 'danger'; }
    else if(severity >= 5 && severity <= 6.9) { color = 'warning'; }
    else if(severity >= 0.1 && severity <= 3.9) { color = 'good'; }

	let payload = [
		{title: "Type:", value: type, short: true},
		{title: "Resource Type:", value: resourceType, short: true},
		{title: "Action Type:", value: actionType, short: true},
		{title: "Severity:", value: severity, short: true},
		{title: "Title:", value: title, short: false},
		{title: "Description:", value: description, short: false},
		{title: "First Seen:", value: eventFirstSeen, short: true},
		{title: "Last Seen:", value: eventLastSeen, short: true},
		{title: "Resource:", value: JSON.stringify(resource, null, 4), short: false},
		{title: "Action:", value: JSON.stringify(action, null, 4), short: false},
		{title: "Count:", value: serviceCount, short: false}
	];

    const guardDutyUrl = "https://console.aws.amazon.com/guardduty/home?region=";

	let attachment = [
		{
			"fallback": "",
			"pretext": "",
			"title": detailType + ": "+type+" | " + resourceType +" | Severity: "+severity,
			"title_link": guardDutyUrl+region+"#/findings?search="+id,
			"text": accountId + " ("+region+")",
			"color": color,
			"fields": payload,
			"ts": getEpoch(),
		  }
	];

	await slackNotify(attachment);

    const response = {
        statusCode: 200,
        body: JSON.stringify('GuardDuty Slack Notifications'),
    };
    return response;
};

function slackNotify(attachment) {
    return new Promise((resolve, reject) => {
        let body = { channel: slackChannel, attachments: attachment };
        let options = {
            url: slackUrl,
            body:  JSON.stringify(body),
            method: 'POST',
            timeout: 3600,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request(options, function (err, response, body) { resolve();});
    });
}

function getEpoch(epoch) {
    let d = new Date();
    if (epoch !== undefined) { d = new Date(epoch*1000); }
    return Math.floor((d.getTime())/1000);
}


function epochToString(epoch) {
    // Since we are using '0' as not set.
    if(epoch === 0) { return 'N/A'; }
    let options = { timeZone: 'America/New_York', weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' , hour: 'numeric', minute: 'numeric' };
    return (new Date(epoch * 1000)).toLocaleDateString('en-US', options).replace('Invalid Date', 'N/A');
}
