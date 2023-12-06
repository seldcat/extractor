HybEx.loader.PageLoader = function()
{
	var isPage = false;

	this.loadPage = function(URL, callback)
	{
		this.createNewIframe(URL);
		this.setIframeEvent("load", this.pageLoaded.bind(this, URL, callback), true);
		this.setIframeURL(URL);
	}

	this.pageLoaded = function(URL, callback)
	{
		callback(URL, this.getIframeDocument());
	}

	this.finish = function()
	{
		this.removeIframes();
	}

	/******************************************************/
	/******************** Current page ********************/
	/******************************************************/
	this.getDocument = function()
	{
		return document;
	}
	
	this.getContentDocument = function()
	{
		return content.document;
	}

	/******************************************************/
	/*********************** IFrame ***********************/
	/******************************************************/
	this.iframes = new Array();
	this.myIframe = null;

	this.createNewIframe = function(URL) {
		var indexIframes = this.iframes.length;

		this.myIframe = this.getDocument().createElement("iframe");
		
		this.myIframe.setAttribute("id", "myIframe" + indexIframes);
		this.myIframe.setAttribute("name", "myIframe" + indexIframes);
		this.myIframe.setAttribute("type", "content");
		this.myIframe.setAttribute("collapsed", "true");
		this.myIframe.setAttribute("width", 0);
		this.myIframe.setAttribute("height", 0);
		this.myIframe.setAttribute("tabindex", -1);
		this.myIframe.setAttribute("style","visibility: hidden");
		this.myIframe.setAttribute("display", "none");		
//		this.myIframe.setAttribute("sandbox", "allow-top-navigation allow-same-origin allow-scripts");
		var myFrame = document.getElementById('myFrame');
	
		this.myIframe.setAttribute("src", "?url=" + encodeURIComponent(URL));

		this.getDocument().documentElement.appendChild(this.myIframe);

		this.iframes.push(this.myIframe);

		if (!this.myIframe.webNavigation)
			return;
		
		this.myIframe.webNavigation.allowAuth = false;
		this.myIframe.webNavigation.allowImages = false;
		this.myIframe.webNavigation.allowJavascript = false;
		this.myIframe.webNavigation.allowMetaRedirects = true;
		this.myIframe.webNavigation.allowPlugins = false;
		this.myIframe.webNavigation.allowSubframes = false;
	}

	this.removeIframes = function()
	{
		for (var indexIframe in this.iframes)
		{
			var currentIframe = this.getDocument().getElementById("myIframe" + indexIframe);
			this.getDocument().documentElement.removeChild(currentIframe);
		}

		this.iframes = new Array();
		this.myIframe = null;
	}

	this.getIframeDocument = function()
	{
		return this.myIframe.contentDocument.defaultView.document;
	}

	this.setIframeURL = function(newURL)
	{
		this.myIframe.setAttribute("src", newURL);
	}

	this.setIframeEvent = function(event, listener, useCapture)
	{
		this.myIframe.addEventListener(event, listener, useCapture);
	}

	this.removeIframeEvent = function(event, listener, useCapture)
	{
		this.myIframe.removeEventListener(event, listener, useCapture);
	}
}