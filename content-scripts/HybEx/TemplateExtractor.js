HybEx.TemplateExtractor = function(document)
{
	/******************************************************/
	/************************ Info ************************/
	/******************************************************/
	this.templateExtracted = false;
	this.showingTemplate = false;
	this.document = document;
	this.originalBody = this.document.body;
	this.templateBody = null;

	this.obtainAlgorithm = function()
	{
		return new HybEx.HybEx.HybEx();
	}

	/******************************************************/
	/****************** Extract template ******************/
	/******************************************************/
	this.extractTemplateCallback = null;

	this.extractTemplate = function(initialURL, callback)
	{
		this.extractTemplateCallback = callback;

		if (this.templateExtracted)
		{
			this.extractTemplateCallback();
			return;
		}

		this.extractWebTemplate(initialURL);
	}
	this.extractWebTemplate = function(initialURL)
	{
		var algorithm = this.obtainAlgorithm();
		algorithm.process(initialURL, this.document, this.extractedWebTemplate.bind(this));
	}
	this.extractedWebTemplate = function(templateBody, templateNodes, numLoadedWebpages)
	{
		this.hideNotTemplateNodes(templateBody, templateNodes);
		this.templateBody = templateBody;
		this.templateExtracted = true;
		this.extractTemplateCallback();
	}

	/******************************************************/
	/******************** Toogle view *********************/
	/******************************************************/
	this.toggleViewCallback = null;

	this.toggleView = function(callback)
	{
		this.toggleViewCallback = callback;

		if (!this.templateExtracted)
		{
			this.toggleViewCallback();
			return;
		}

		this.toggleTheView();
	}

	this.toggleTheView = function()
	{
		if (this.document.body != this.templateBody)
			this.document.body = this.templateBody;
		else
			this.document.body = this.originalBody;
		this.finishToggleView();
	}
	
	this.finishToggleView = function()
	{
		this.showingTemplate = this.document.body == this.templateBody;
		this.toggleViewCallback();
	}

	/******************************************************/
	/*********************** Others ***********************/
	/******************************************************/
	this.hideNotTemplateNodes = function(templateBody, templateNodes)
	{
		var templateNode;
		var treeSearch = new HybEx.util.TreeSearch(templateBody, new Array());

		var countNodes = 0;

		while ((templateNode = treeSearch.nextPreOrder()) != null) {
			if (!HybEx.misc.Misc.arrayContains(templateNodes, templateNode)) {
				this.hideNode(templateNode);
				countNodes++;
			}
		}
	}

	this.hideNode = function(node)
	{
		node.isHidden = true;
		if (node.style)
		{
			node.style.visibility = "hidden";
			return;
		}

		var nodeName = node.nodeName.toLowerCase();
		if (nodeName == "#text")
			node.nodeValue = "";
	}
}