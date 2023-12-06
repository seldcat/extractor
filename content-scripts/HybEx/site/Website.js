HybEx.site.Website = function(initialLink)
{
	this.nodes = new HybEx.util.Hashtable();
	this.domainLink = new HybEx.site.Link(initialLink.getProtocol() + initialLink.getDomain());
	this.initialLink = initialLink;
	this.initialWebpage = null;
	this.unloadedWebpages = new Array();
	this.unprocessedWebpages = new Array();
	this.processedWebpages = new Array();

	// Get the domain of the website
	this.getDomainLink = function()
	{
		return this.domainLink;
	}
	// Get the initial link of the website
	this.getInitialLink = function()
	{
		return this.initialLink;
	}

	// Get a webpage
	this.getWebpage = function(link)
	{
		var URL = link.getURL();

		if (this.nodes.containsKey(URL))
			return this.nodes.get(URL);
		return null;
	}
	// Create a webpage
	this.createWebpage = function(link)
	{
		var webpage;
		var URL = link.getURL();

		if (this.nodes.containsKey(URL))
			webpage = this.nodes.get(URL);
		else
		{
			webpage = new HybEx.site.Webpage(link);
			this.nodes.put(URL, webpage);
		}

		return webpage;
	}

	// Get the initial webpage of the website
	this.getInitialWebpage = function()
	{
		return this.initialWebpage;
	}

	// Management of unloaded webpages
	this.addUnloadedWebpage = function(webpage)
	{
		this.unloadedWebpages.push(webpage);
	}
	this.getUnloadedWebpage = function()
	{
		if (this.unloadedWebpages.length == 0)
			return null;
		return this.unloadedWebpages[0];
	}
	this.getRandomUnloadedWebpage = function()
	{
		if (this.unloadedWebpages.length == 0)
			return null;
		var webpageIndex = HybEx.misc.Misc.randomInteger(0, this.unloadedWebpages.length - 1);
		return this.unloadedWebpages[webpageIndex];
	}
	this.getUnloadedWebpages = function()
	{
		return this.unloadedWebpages;
	}
	this.getNumUnloadedWebpages = function()
	{
		return this.unloadedWebpages.length;
	}
	this.removeUnloadedWebpage = function(unloadedWebpage)
	{
		var unloadedWebpageIndex = HybEx.misc.Misc.arrayIndex(this.unloadedWebpages, unloadedWebpage);

		HybEx.misc.Misc.arrayRemoveElement(this.unloadedWebpages, unloadedWebpageIndex);
	}
	this.hasMoreUnloadedWebpages = function()
	{
		return (this.unloadedWebpages.length > 0);
	}

	// Management of unprocessed webpages
	this.addUnprocessedWebpage = function(webpage)
	{
		this.unprocessedWebpages.push(webpage);
	}
	this.getUnprocessedWebpage = function()
	{
		if (this.unprocessedWebpages.length == 0)
			return null;
		return this.unprocessedWebpages[0];
	}
	this.getRandomUnprocessedWebpage = function()
	{
		if (this.unprocessedWebpages.length == 0)
			return null;
		var webpageIndex = HybEx.misc.Misc.randomInteger(0, this.unprocessedWebpages.length - 1);
		return this.unprocessedWebpages[webpageIndex];
	}
	this.getUnprocessedWebpages = function()
	{
		return this.unprocessedWebpages;
	}
	this.getNumUnprocessedWebpages = function()
	{
		return this.unprocessedWebpages.length;
	}
	this.removeUnprocessedWebpage = function(unprocessedWebpage)
	{
		var unprocessedWebpageIndex = HybEx.misc.Misc.arrayIndex(this.unprocessedWebpages, unprocessedWebpage);

		HybEx.misc.Misc.arrayRemoveElement(this.unprocessedWebpages, unprocessedWebpageIndex);
	}
	this.hasMoreUnprocessedWebpages = function()
	{
		return (this.unprocessedWebpages.length > 0);
	}

	// Management of processed webpages
	this.addProcessedWebpage = function(webpage)
	{
		if (this.hasWebpage(webpage))
			return;
		this.processedWebpages.push(webpage);
	}
	this.getRandomProcessedWebpage = function()
	{
		if (this.processedWebpages.length == 0)
			return null;
		var webpageIndex = HybEx.misc.Misc.randomInteger(0, this.processedWebpages.length - 1);
		return this.processedWebpages[webpageIndex];
	}
	this.getProcessedWebpages = function()
	{
		return this.processedWebpages;
	}
	this.getNumProcessedWebpages = function()
	{
		return this.processedWebpages.length;
	}

	// Returns whether the website already contains the webpage
	this.hasWebpage = function(webpageToFind)
	{
		var webpageToFindURL = webpageToFind.getLink().getURL();

		for (var unloadedWebpageIndex in this.unloadedWebpages)
		{
			var unloadedWebpage = this.unloadedWebpages[unloadedWebpageIndex];
			var unloadedWebpageURL = unloadedWebpage.getLink().getURL();

			if (webpageToFindURL == unloadedWebpageURL)
				return true;
		}
		for (var unprocessedWebpageIndex in this.unprocessedWebpages)
		{
			var unprocessedWebpage = this.unprocessedWebpages[unprocessedWebpageIndex];
			var unprocessedWebpageURL = unprocessedWebpage.getLink().getURL();

			if (webpageToFindURL == unprocessedWebpageURL)
				return true;
		}
		for (var processedWebpageIndex in this.processedWebpages)
		{
			var processedWebpage = this.processedWebpages[processedWebpageIndex];
			var processedWebpageURL = processedWebpage.getLink().getURL();

			if (webpageToFindURL == processedWebpageURL)
				return true;
		}

		return false;
	}

	// Add the initial webpage
	this.initialWebpage = this.createWebpage(this.initialLink);
	this.addUnloadedWebpage(this.initialWebpage);
}
