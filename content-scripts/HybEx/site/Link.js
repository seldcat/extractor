HybEx.site.Link = function(URL, DOMPath)
{
	this.URL = URL;
	this.DOMPath = DOMPath;

	// Replace "%20" by " "
	this.URL = this.URL.replace(/%20/g, " ");
	// Without #...
	var sharpIndex = this.URL.indexOf("#");
	if (sharpIndex != -1)
		this.URL = this.URL.substr(0, sharpIndex);

	this.getURL = function()
	{
		return this.URL;
	}
	this.getProtocol = function()
	{
		var dotsIndex = this.URL.indexOf(":");
		var protocolLength = dotsIndex + "://".length;

		return this.URL.substr(0, protocolLength);
	}
	this.getDomain = function()
	{
		var protocol = this.getProtocol();
		var domainIndex = protocol.length;
		var slashIndex = this.URL.indexOf("/", domainIndex);

		if (slashIndex == -1)
			return this.URL.substr(domainIndex);
		return this.URL.substr(domainIndex, slashIndex - domainIndex);
	}
	this.getPath = function()
	{
		var protocol = this.getProtocol();
		var domain = this.getDomain();
		var pathIndex = protocol.length + domain.length;

		return this.URL.substr(pathIndex);
	}
	this.getDirectory = function()
	{
		var slash = "/";
		var slashIndex = this.URL.lastIndexOf(slash);

		return this.URL.substr(0, slashIndex + 1);
	}
	this.getFile = function()
	{
		var slash = "/";
		var path = this.getPath();
		var slashIndex = path.lastIndexOf(slash);
		if (slashIndex == -1)
			return "";
		var questionMark = "?";
		var file = path.substr(slashIndex + slash.length);
		var questionMarkIndex = file.indexOf(questionMark);

		if (questionMarkIndex == -1)
			return file;
		return file.substr(0, questionMarkIndex);
	}
	this.getExtension = function()
	{
		var dot = ".";
		var file = this.getFile();
		var dotIndex = file.lastIndexOf(dot);

		if (dotIndex == -1)
			return "";
		return file.substr(dotIndex + dot.length);
	}

	this.getDOMPath = function()
	{
		return this.DOMPath;
	}

	this.similar = function(otherLink)
	{
		return this.URL === otherLink.URL;
	}
}
