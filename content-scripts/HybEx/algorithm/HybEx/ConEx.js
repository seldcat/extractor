HybEx.ConEx.ConEx = function()
{
	this.website = null;
	this.body = null;

	/**********************************************/
	/************ Extract Web Menu ************/
	/**********************************************/
	this.document = null;
	this.processCallback = null;

	this.process = function(initialURL, document, callback)
	{
		this.document = document;
		this.processCallback = callback;
		var initialLink = new ConEx.site.Link(initialURL);
		this.website = new ConEx.site.Website(initialLink);
		this.loadNextPage();
	}

	this.graphLoaded = function()
	{
		var initialWebpage = this.website.getInitialWebpage();
		var initialWebpageBody = initialWebpage.getBody();
		var initialWebpageBodyCloned = initialWebpageBody.cloneNode(true);
		var body = initialWebpageBody.cloneNode(true);
		this.body = new ConEx.conex.Content(body, this.website);
		this.processCallback(body, this.body);
	}
	
	/**********************************************/
	/**************** Page Loader *****************/
	/**********************************************/

	this.pageLoader = new ConEx.loader.PageLoader();
	this.loadNextPage = function()
	{
		var processingWebpage = this.website.getUnloadedWebpage();
		var URL = processingWebpage.getLink().getURL();
		this.pageLoader.loadPage(URL, this.pageLoaded.bind(this));
	}
	
	this.pageLoaded = function(URL, document)
	{
		var link = new ConEx.site.Link(URL);
		var processingWebpage = this.website.getWebpage(link);
		if (processingWebpage.getBody() != null)
			return;

		var body = document.body;
		processingWebpage.setBody(body);
		this.website.removeUnloadedWebpage(processingWebpage);
		this.website.addUnprocessedWebpage(processingWebpage);	

		this.graphLoaded();
	}

}