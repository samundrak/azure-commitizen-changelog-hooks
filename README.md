# Azure Pull request merge hook
This is a small app which works with azure repos web hooks. Whenever a new PR is merged it will get commits and 
passes that commit to Convention commit parser which will format the commits and then our app creates a email template where
it displays changes like features, bugfixes and other details which laters is sent to people who needs to know about them
