// menu added on open
function onOpen() {
FormApp.getUi() // Or DocumentApp or FormApp.
	.createMenu('Settings')
	.addItem('Authorize', 'authorize')
	.addItem('Set Email', 'setEmailInfo')
	.addItem('Notification Interval', 'notInv')
	.addToUi();
}

//easily authorize the script to run from the menu
function authorize(){
var respEmail = Session.getActiveUser().getEmail();
    MailApp.sendEmail(respEmail,"Form Authorizer", "Your form has now been authorized to send you emails");
}

//Set email, subject, and message body for form submission
function setEmailInfo(){

	var ui = FormApp.getUi();
	var app = UiApp.createApplication().setWidth("500").setHeight("500");
	var panel = app.createVerticalPanel();
	var recLB = app.createLabel(" Please enter emails seperated by a comma (email1,email2,email3).");
	var recTB = app.createTextBox().setId('recTB').setName('recTB').setWidth("500");
	var subLB = app.createLabel("Please enter subject.");
	var subTB = app.createTextBox().setId('subTB').setName('subTB').setWidth("500");
	var msgLB = app.createLabel("Please enter message.");
	var msgTA = app.createTextBox().setId('msgTA').setName('msgTA').setWidth("500").setHeight("150");
	var submit = app.createButton('Submit');

	panel.add(recLB).add(recTB).add(subLB).add(subTB).add(msgLB).add(msgTA).add(submit);
	app.add(panel);

	var handler = app.createServerHandler('updateEmail');
	handler.addCallbackElement(panel);
	submit.addClickHandler(handler);
	ui.showModalDialog(app, 'Email Settings');
}

//click handler for setEmailInfo that saves values into script properties
function updateEmail(e){

	var app = UiApp.getActiveApplication();
	var rec = e.parameter.recTB;
	var sub = e.parameter.subTB;
	var msg = e.parameter.msgTA;

	setProperty('EMAIL_ADDRESS',rec);
	setProperty('EMAIL_SUBJECT',sub);
	setProperty('EMAIL_MESSAGE',msg);
	app.close();
	return app;
}

//funtion to set notification interval
function notInv(){
	var ui = FormApp.getUi(); // Same variations.
	var result = ui.prompt(
	'Notification interval',
	'Please enter when a notification should be sent. Example: 5 = every 5 submissions.',
	ui.ButtonSet.OK_CANCEL);
	// Process the user's response.
	var button = result.getSelectedButton();
	var notInv= result.getResponseText();
	if (button == ui.Button.OK) {
		setProperty('NOTIFICATION_INTERVAL',notInv);
	}
}

//setting script properties
function setProperty(key,property){

	var scriptProperties = PropertiesService.getScriptProperties();
	scriptProperties.setProperty(key,property);

}

//getting script properties
function getProperty(property){
	var scriptProperties = PropertiesService.getScriptProperties();
	var savedProp = scriptProperties.getProperty(property);
	return  savedProp;
}

//controller. Get all the information and execute
function onFormSubmit(e){
	var lastRow = getLR("Form Responses 1");
	var emailAddress =  getProperty('EMAIL_ADDRESS');
	var emailSubject =  getProperty('EMAIL_SUBJECT');
	var emailMessage =  getProperty('EMAIL_MESSAGE');
	var notInv = parseInt(getProperty('NOTIFICATION_INTERVAL'));
	var modded = (lastRow-1) % notInv;
	Logger.log(lastRow-1 + " " + notInv);
	Logger.log(modded);
	Logger.log(emailAddress);
	if ((lastRow-1) % notInv == 0){
		MailApp.sendEmail(emailAddress, emailSubject , emailMessage);
	}
}

//grabbing general settings from spreadsheet sheet Settings.
function getLR(sheet) {
	var form = FormApp.getActiveForm();
	var ssID = form.getDestinationId();
	var ss = SpreadsheetApp.openById(ssID);
	var sheet = ss.getSheetByName(sheet);
	var lastRow = sheet.getLastRow();

	return lastRow;
}