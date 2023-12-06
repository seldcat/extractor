HybEx.site.Webpage = function(link)
{
	this.link = link;
	this.webpageLinked = new Array();
	this.body = null;

	this.getLink = function()
	{
		return this.link;
	}

	this.addWebpageLinked = function(webpage)
	{
		this.webpageLinked.push(webpage);
	}
	this.hasWebpageLinked = function(webpage)
	{
		return HybEx.misc.Misc.arrayContains(this.webpageLinked, webpage);
	}

	this.getBody = function()
	{
		return this.body;
	}
	this.setBody = function(body)
	{
		this.body = body;
	}
}
