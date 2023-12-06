if (typeof browser == "undefined")
  var browser = chrome;

var _supportsPromises = false;
try {
  _supportsPromises = browser.runtime.getPlatformInfo() instanceof Promise;
}
catch (e)
{
}

browser.runtime.onMessage.addListener(function(request, sender, sendResponse){
	HybEx.BrowserOverlay.execute();
});

HybEx.BrowserOverlay =
{
	pageLoad : function()
	{
		//Returns a reference to the object on which the event originally occurred.
		var documentDOMNode = window.document;
		
		HybEx.BrowserOverlay.createPage(documentDOMNode); //Dom tree

		var view = documentDOMNode.defaultView;
		view.addEventListener("unload", HybEx.BrowserOverlay.pageUnload, true);
	},

	/*
	 * This function is called when a page is being unloaded.
	*/
	pageUnload : function(event)
	{
		var documentDOMNode = event.originalTarget;

		HybEx.BrowserOverlay.removePage(documentDOMNode);
	},

	pages : new HybEx.util.Hashtable(),
	getPage : function(pageId)
	{
		if (HybEx.BrowserOverlay.pages.containsKey(pageId)) {
			return HybEx.BrowserOverlay.pages.get(pageId);
		}
		
		return null;
	},
	
	/*
	 * Returns the page
	*/
	createPage : function(pageId)
	{
		
		var page = null;
		if (HybEx.BrowserOverlay.pages.containsKey(pageId)) {
			page = HybEx.BrowserOverlay.pages.get(pageId);
		}
		else
		{
			page = new HybEx.TemplateExtractor(pageId);
			HybEx.BrowserOverlay.pages.put(pageId, page);
		}

		return page;
	},

	/*
	 * Removes the page
	*/
	removePage : function(pageId)
	{
		if (HybEx.BrowserOverlay.pages.containsKey(pageId))
			HybEx.BrowserOverlay.pages.remove(pageId);
	},

	/**
	 * This function starts working when the user press the toolbar icon.
	 */
	execute : function()
	{
		HybEx.BrowserOverlay.pageLoad();
		var documentDOMNode = window.document;
		var templateExtractor = HybEx.BrowserOverlay.getPage(documentDOMNode);
		if (templateExtractor == null) {
			return;
		}
			
		var templateExtracted = templateExtractor.templateExtracted;
		
		if (!templateExtracted) 
			HybEx.BrowserOverlay.extractTemplate(templateExtractor);
		else 
			HybEx.BrowserOverlay.toggleView(templateExtractor);
	},
	
	extraction : function(templateExtractor)
	{
		var templateExtracted = templateExtractor.templateExtracted;
		if (!templateExtracted)
			HybEx.BrowserOverlay.extractTemplate(templateExtractor);
		else
			HybEx.BrowserOverlay.toggleView(templateExtractor);
	},
	
	extractTemplate : function(templateExtractor)
	{
		HybEx.BrowserOverlay.showProcessingMessage();
		
		var initialURL = window.location.href;
		if (initialURL.search("about:") == -1){
			templateExtractor.extractTemplate(initialURL, HybEx.BrowserOverlay.templateExtracted.bind(null, templateExtractor));
		}
		else {
			alert("Not a webpage");
			return;
		}
	},

	templateExtracted : function(templateExtractor)
	{
		HybEx.BrowserOverlay.toggleView(templateExtractor);
	},
	
	/* 
		This function shows a processing message to the user. Then it starts the extraction.
	*/
	showProcessingMessage : function(templateExtractor)
	{
		browser.runtime.sendMessage({content: "message"});
	},

	toggleView : function(templateExtractor)
	{
		templateExtractor.toggleView(HybEx.BrowserOverlay.toggledView);
	},

	toggledView : function()
	{
		browser.runtime.sendMessage({content: "endExtraction"});
	},
};
