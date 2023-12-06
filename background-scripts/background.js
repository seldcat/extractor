let pressed = false;
var notification = "my-notification";

var error = false;

var TabId;

if (typeof browser == "undefined")
  var browser = chrome;

var _supportsPromises = false;
try {
  _supportsPromises = browser.runtime.getPlatformInfo() instanceof Promise;
}
catch (e)
{
}

//This listener starts to work when the user press the extension's button
browser.browserAction.onClicked.addListener((tab) => {
  
  var description;
  TabId = tab.id;
  
  description = browser.i18n.getMessage("extractingMessage");
  browser.browserAction.setBadgeText({text: "Ex", tabId: TabId});
  browser.browserAction.setTitle({title: description, tabId: TabId});
  var bgp =  browser.extension.getBackgroundPage();
  bgp.messagePassing();
  browser.browserAction.disable(tab.id);
});

function treatMessage(message) {

  if(message.content == "message") {
    var header = browser.i18n.getMessage("messageTitle");
    var content1 = browser.i18n.getMessage("bodyMessage");
  
    browser.notifications.create(notification, {
      "type": "basic",
      "iconUrl": browser.runtime.getURL("icons/t2.png"),
      "title": header,
      "message": content1
    });  
  }
  else if(message.content == "endExtraction") {
	browser.notifications.clear(notification);
    endExtraction();
  }
  else if(message.content == "error") {
    error = true;
    endExtraction();
  }
}

browser.runtime.onMessage.addListener(treatMessage);

function messagePassing() {
 //browser.tabs.query({currentWindow: true, active: true}).then(sendMessageToTabs).catch(onError);
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
  // for (let tab of tabs) {
    browser.tabs.sendMessage(
      tabs[0].id,
      {greeting: ""}
    )
  //}
  })
}

function sendMessageToTabs(tabs) {
    browser.tabs.sendMessage(
      tabs[0].id,
      {greeting: ""}
    ).catch(onError);
}

function endExtraction() {
  
  browser.browserAction.enable(TabId);

  if(!pressed){
    browser.browserAction.setIcon({path: "icons/tem-right.png", tabId: TabId});
    description = browser.i18n.getMessage("backToWeb");
    pressed = true;
  }
  else {
    browser.browserAction.setIcon({path: "icons/tem-left.png", tabId: TabId});
    description = browser.i18n.getMessage("backToTemplate");
    pressed = false;
  }

  if(error) {
    browser.browserAction.setIcon({path: "icons/t3.png", tabId: TabId});
    browser.browserAction.setBadgeText({text: "Error", tabId: TabId});
    browser.tabs.reload();
  }
  else {   
    browser.browserAction.setBadgeText({text: "End", tabId: TabId});
    browser.browserAction.setTitle({title: description, tabId: TabId});
  }
}

function updated(tab) {
	if(tab == TabId) {
		pressed = false;
		processing = false;
		browser.browserAction.setIcon({path: "icons/t3.png", tabId: TabId});
		description = browser.i18n.getMessage("extensionDescription");
		browser.browserAction.setTitle({title: description, tabId: TabId});
		browser.browserAction.setBadgeText({text: "", tabId: TabId});
	}
}

browser.tabs.onUpdated.addListener(updated);

