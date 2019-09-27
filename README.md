# Amazon Lambda for GuardDuty Slack Notifications

/*
  Copyright (Apache License 2.0): Ventz Petkov
  Repository: https://github.com/ventz/guardduty-slack-notify
  Initial Release: 9-15-2019                                                       
*/

Configure in 4 easy steps, and make sure to edit Lambda function with
your own Slack Incoming Webhook URL.

## Guard Duty
1.) Enable GuardDuty and configure 5-minute subsequent findings:

Notifications for subsequent finding occurrences – By default, for
every finding with a unique finding ID, GuardDuty aggregates all
subsequent occurrences of a particular finding that take place in
6-hour intervals into a single event. GuardDuty then sends a
notification about these subsequent occurrences based on this event.
In other words, by default, for the subsequent occurrences of the
existing findings, GuardDuty sends notifications based on CloudWatch
events every 6 hours. You can configure this for: 15 minutes, 1 hour,
or the default 6 hours. It is recommended to use 15 minutes (via GuardDuty
Console -> Settings)!


## CloudWatch -> SNS -> Lambda Handler (Slack Notifications)
You can enable the next three steps in the Console via point-and-click, or via the CLI:

2.) Enable CloudWatch rule to send events for all GuardDuty findings:
```
aws events put-rule --name GuardDuty --event-pattern "{\"source\":[\"aws.guardduty\"]}"
```

3.) Attach the Lambda function as a target foro the rule:
```
aws events put-targets --rule GuardDuty --targets Id=1,Arn=arn:aws:lambda:us-east-1:111122223333:function:<your_function_name>
```

4.) Add permissions to invoke the target:
```
aws lambda add-permission --function-name <your_function> --statement-id 1 --action 'lambda:InvokeFunction' --principal events.amazonaws.com
```


# Useful Documents:

### Examples:
https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_sns.html

### See about format:
https://docs.aws.amazon.com/guardduty/latest/ug/guardduty_findings_cloudwatch.html#guardduty_findings_cloudwatch_format

### One example (for EC2):
https://aws.amazon.com/premiumsupport/knowledge-center/guardduty-cloudwatch-sns-rule/

### This is the Full Documentation/JSON explanation:
https://docs.aws.amazon.com/guardduty/latest/ug/guardduty-ug.pdf
(For CLI Automation of Cloud Watch, SNS, and Lambda)
