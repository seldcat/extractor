HybEx.HybEx.HybEx = function()
{
	this.nodeCounter = 0;
	this.website = null;
	this.map = 0;		
	this.nlinks = 0;
	this.detectedLinks = 0;
	this.totalLinks = 0;
	this.menuNodes = 0;
	this.variable = 0;
	
	/**********************************************/
	/**************** Page Loader *****************/
	/**********************************************/

	this.pageLoader = new HybEx.loader.PageLoader();
	this.loadNextPage = function()
	{
		var processingWebpage = this.website.getUnloadedWebpage();
		var URL = processingWebpage.getLink().getURL();
		this.pageLoader.loadPage(URL, this.pageLoaded.bind(this));
	}
	this.pageLoaded = function(URL, document)
	{
		var link = new HybEx.site.Link(URL);
		var processingWebpage = this.website.getWebpage(link);
		if (processingWebpage.getBody() != null)
			return;
		var processed = this.processWebpage(processingWebpage, document);
		var moreUnloadedWebpages = this.website.hasMoreUnloadedWebpages();
		var nodesCG = processed || !moreUnloadedWebpages ? this.obtainCG() : new Array();
		if (nodesCG.length != HybEx.HybEx.Config.objectiveCGSize && moreUnloadedWebpages){
			this.loadNextPage();

		}else{
		
			this.graphLoaded(nodesCG);}
	}
	this.finishPageLoader = function()
	{
		this.pageLoader.finish();
	}

	/**********************************************/
	/************ Extract Web Template ************/
	/**********************************************/
	this.document = null;
	this.processCallback = null;

	this.process = function(initialURL, document, callback)
	{
		this.document = document;
		this.processCallback = callback;

		var initialLink = new HybEx.site.Link(initialURL);

		this.website = new HybEx.site.Website(initialLink);
		this.loadNextPage();
	}
	this.graphLoaded = function(nodesCG)
	{
		let newThreshold = HybEx.HybEx.Config.thresholdVotes;		
		
		var initialWebpage = this.website.getInitialWebpage();
		var initialWebpageIndex = HybEx.misc.Misc.arrayIndex(nodesCG, initialWebpage);
		if (initialWebpageIndex != -1)
			HybEx.misc.Misc.arrayRemoveElement(nodesCG, initialWebpageIndex);

		var initialWebpageBody = initialWebpage.getBody();
		this.preprocess(initialWebpageBody);
		var initialWebpageBodyCloned2 = this.document.importNode(initialWebpageBody, true);
		
		initialWebpageBody = new HybEx.ConEx.Content(initialWebpageBody, this.website);
		this.hideFinal(initialWebpageBody);
		
		var initialWebpageBodyCloned = this.document.importNode(initialWebpageBody, true);
		//this.preprocess(initialWebpageBodyCloned);
		this.checkChildren(initialWebpageBodyCloned);
		this.setPositions(initialWebpageBodyCloned);
		//Guarda el número de nodos de la keypage
		let nodes = this.calculateTotalVisiblesNodes(initialWebpageBodyCloned);		

		var ocurrences = new HybEx.util.Hashtable();
		var start = Date.now();

		if (nodesCG.length < HybEx.HybEx.Config.objectiveCGSize)
			alert("Complete subdigraph size is less than required. Maybe the webpage has not enough links to webpages from the same website. Extraction results could be unexpected.")

		for (var nodeCGIndex in nodesCG)
		{
			var start2 = Date.now();			
			var nodeCG = nodesCG[nodeCGIndex];
			var nodeCGBody = nodeCG.getBody();
			this.preprocess(nodeCGBody);
			this.checkChildren(nodeCGBody);

			this.variable = 1;
			this.map++;

			this.countOcurrences(ocurrences, initialWebpageBodyCloned, nodeCGBody);

			if (this.variable == nodes)
				newThreshold++;			
		}

		var threshold = Math.min(nodesCG.length, newThreshold);
		
		var templateNodes = threshold > 0 ? this.getTemplateNodes(ocurrences, threshold) : new Array();
		var numLoadedWebpages = this.website.getNumUnprocessedWebpages() + this.website.getNumProcessedWebpages();

		this.finishPageLoader();

		this.processCallback(initialWebpageBodyCloned, templateNodes, numLoadedWebpages);
	}

	/***************************/
	/********* Phase 1 *********/
	/***************************/
	this.processWebpage = function(processingWebpage, document)
	{
		// Check whether the document is a html document
		var contentType = document.contentType;
		if (contentType != "text/html")
			return false;

		var body = document.body;
		var anchorLinks = document.links;
		var links = this.getLinks(anchorLinks);
		this.processLinks(processingWebpage, links, body);
		processingWebpage.setBody(body);
		this.website.removeUnloadedWebpage(processingWebpage);
		this.website.addUnprocessedWebpage(processingWebpage);

		return true;
	}
	this.getLinks = function(anchorLinks)
	{
		var links = new Array();

		for (var anchorLinkIndex = 0; anchorLinkIndex < anchorLinks.length; anchorLinkIndex++)
		{
			var anchorLink = anchorLinks[anchorLinkIndex];
			var linkStr = anchorLink.href;
			var linkDOMPath = this.getDOMElementPath(anchorLink);
			var link = new HybEx.site.Link(linkStr, linkDOMPath);

			// Not duplicate
			if (HybEx.misc.Misc.arrayContainsSimilar(links, link))
				continue;
			links.push(link);
		}

		return links;
	}
	this.getDOMElementPath = function(element)
	{
		var DOMPath = new Array();

		while (element.parentNode != null)
		{
			var parent = element.parentNode;
			var childIndex = HybEx.misc.Misc.arrayIndex(parent.childNodes, element);

			HybEx.misc.Misc.arrayAddElement(DOMPath, 0, childIndex);
			element = parent;
		}

		return DOMPath;
	}
	this.processLinks = function(processingWebpage, links, body)
	{
		var a="";
		var domainLinks = this.getDomainLinks(links);
		var sortedLinks = new Array();
	
		var ignoreDomain = "";
		var webpagesLinked = new Array();

		if (HybEx.HybEx.Config.menuDetection == false) sortedLinks = this.isInitialWebpage(processingWebpage) ? this.sortLinks(domainLinks) : domainLinks;
	
		if (HybEx.HybEx.Config.menuDetection == true){
			var result =  new HybEx.menu.Menu(body, this.website);		
			if (this.isInitialWebpage(processingWebpage)){ 
				sortedLinks = result[0];
				this.menuNodes = result[1];
				this.detectedLinks = result[2];
				this.totalLinks = result[3];
				//alert(this.menuNodes);
			}
			else{
				sortedLinks = domainLinks;
			}
		}

		for (var sortedLinkIndex in sortedLinks)
		{
			var sortedLink = sortedLinks[sortedLinkIndex];
			var sortedLinkDomain = sortedLink.getDomain();
			if (sortedLinkDomain == ignoreDomain)
// DDD: Cambiar "/Users/" por como suelen empezar las rutas en local
//if (!HybEx.misc.Misc.stringStartsWith(sortedLink.getPath(), "/Users/"))
			if (!HybEx.misc.Misc.stringStartsWith(sortedLink.getPath(), "www.alarte.com/"))
				continue;

			var webpage = this.website.createWebpage(sortedLink);
			webpagesLinked.push(webpage);
		}

		for (var webpageLinkedIndex = 0; webpageLinkedIndex < webpagesLinked.length; webpageLinkedIndex++)
		{
			var webpage = webpagesLinked[webpageLinkedIndex];

			// Only links directly reachables from the initial page
			if (this.isInitialWebpage(processingWebpage) || this.website.hasWebpage(webpage))
				processingWebpage.addWebpageLinked(webpage);

			// Only pages directly reachables from the initial page
			if (this.isInitialWebpage(processingWebpage) && !this.website.hasWebpage(webpage))
				this.website.addUnloadedWebpage(webpage);
		}
	}
	this.isInitialWebpage = function(processingWebpage)
	{
		var initialWebpage = this.website.getInitialWebpage();

		return processingWebpage == initialWebpage;
	}
	this.getDomainLinks = function(links)
	{
		var domainLink = this.website.getDomainLink();
		var domainLinks = new Array();

		for (var linkIndex in links)
		{
			var link = links[linkIndex];
			if (this.isSameDomain(domainLink, link) && this.acceptExtension(link) && !this.rejectFile(link))
				domainLinks.push(link);
		}

		return domainLinks;
	}
	this.isSameDomain = function(domainLink, webLink)
	{
		return webLink.getDomain() == domainLink.getDomain();
	}
	this.acceptExtension = function(webLink)
	{
		var extension = webLink.getExtension();
		var acceptedExtensions = new Array("html", "php", "asp", "htm", "php3");

		return (extension == "" || HybEx.misc.Misc.arrayContains(acceptedExtensions, extension));
	}

	this.rejectFile = function(webLink)
	{
		var encontrado = false;
		var excludedFiles = "/file";
		var excludedFiles1 = "feeds";
		var excludedFiles2 = ".pdf";
		var excludedFiles3 = "/rss";			
		
		if (webLink.getPath().includes(excludedFiles))
			encontrado = true;
		if (webLink.getPath().includes(excludedFiles1))
			encontrado = true;
		if (webLink.getPath().includes(excludedFiles2))
			encontrado = true;
		if (webLink.getPath().includes(excludedFiles3))
			encontrado = true;
			
		return encontrado;
	}
	
	this.sortLinks = function(domainLinks)
	{
		var domainLink = this.website.getDomainLink();
		var initialLink = this.website.getInitialLink();
		var initialPath = this.getPath(initialLink.getPath());

		var hierarchyLinks = new HybEx.HybEx.HierarchyLinks(domainLink.getPath(), domainLinks);
		var sortedLinks = new Array();
		var exclusions = new Array();
		var path = initialPath;

		// Process path subtree
		var pathDepth = hierarchyLinks.getPathDepth(path, exclusions);
		for (var level = 0; level < pathDepth; level++)
		{
			var pathLeveledLinks = hierarchyLinks.getPathLevelLinks(path, level, exclusions);
			var sortedLevelLinks = this.sortLinksByDistance(pathLeveledLinks);

			HybEx.misc.Misc.arrayAppend(sortedLinks, sortedLevelLinks);
		}
		exclusions = new Array(path);
		path = this.getPreviousPath(path);

		// Process the rest of the tree
		while (path != null)
		{
			var pathLeveledlinks = hierarchyLinks.getPathLeveledAllLinks(path, exclusions);
			var sortedLevelLinks = this.sortLinksByDistance(pathLeveledlinks);

			HybEx.misc.Misc.arrayAppend(sortedLinks, sortedLevelLinks);
			exclusions = new Array(path);
			path = this.getPreviousPath(path);
		}

		return sortedLinks;
	}
	this.sortLinksByDistance = function(links)
	{
		var sortedLinks = new Array();
		if (links){
			while (links.length > 0)
			{
				var maxDistance = Number.NEGATIVE_INFINITY;
				var bestLinkIndex = 0;

				for (var linksIndex in links)
				{
					var link = links[linksIndex];
					var minDistance = this.distance(link, sortedLinks);

					if (minDistance > maxDistance)
					{
						maxDistance = minDistance;
						bestLinkIndex = linksIndex;
					}
				}

				var bestLink = links[bestLinkIndex];
				sortedLinks.push(bestLink);
				HybEx.misc.Misc.arrayRemoveElement(links, bestLinkIndex);
			}
		}
		return sortedLinks;
	}
	this.distance = function(link, targetLinks)
	{
		var minDistance = Number.POSITIVE_INFINITY;
		var linkDOMPath = link.getDOMPath();

		for (var targetLinksIndex in targetLinks)
		{
			var position = 0;
			var targetLink = targetLinks[targetLinksIndex];
			var targetLinkDOMPath = targetLink.getDOMPath();
			var pathsLength = Math.min(linkDOMPath.length, targetLinkDOMPath.length);

			for (; position < pathsLength; position++)
			{
				var linkPosition = linkDOMPath[position];
				var targetLinkPosition = targetLinkDOMPath[position];

				if (linkPosition != targetLinkPosition)
					break;
			}

			var distance = (linkDOMPath.length - position) + (targetLinkDOMPath.length - position);
			if (distance < minDistance)
				minDistance = distance;
		}

		return minDistance;
	}
	this.getPreviousPath = function(fileURL)
	{
		var indexLastPath = fileURL.lastIndexOf("/");
		if (indexLastPath <= 0)
			return null;

		var previousPathURL = fileURL.substr(0, indexLastPath);
		return this.getPath(previousPathURL);
	}
	this.getPath = function(fileURL)
	{
		var indexLastPath = fileURL.lastIndexOf("/") + "/".length;

		return fileURL.substr(0, indexLastPath);
	}

	/***************************/
	/******** Phase 2 **********/
	/***************************/
	this.obtainCG = function()
	{
		var webpages = this.obtainPossibleCGNodes();
		var indexWebpage = -1;
		var nodesCG = new Array();
		var indexWebpages = new Array();
		var maximal = new Array();
		var acceptableLess = HybEx.HybEx.Config.acceptableCGSize;

		while (true)
		{
			indexWebpage++;
			if (indexWebpage + acceptableLess > webpages.length)
			{
				// Backtracking
				var previousindexWebpage;
				var indexWebpageToRemove = indexWebpages.length;

				// Cannot backtracking, finish
				if (indexWebpageToRemove == 0)
					break;

				// Can backtracking
				indexWebpage--;
				do
				{
					indexWebpage--;
					indexWebpageToRemove--;
					previousindexWebpage = indexWebpages[indexWebpageToRemove];
					HybEx.misc.Misc.arrayRemoveElement(nodesCG, indexWebpageToRemove);
					HybEx.misc.Misc.arrayRemoveElement(indexWebpages, indexWebpageToRemove);
					acceptableLess++;
				}
				while (indexWebpage == previousindexWebpage && nodesCG.length > 0);
				indexWebpage = previousindexWebpage;

				continue;
			}

			// Check whether the new node meets the current CG
			var webpage = webpages[indexWebpage];
			if (this.doesNodeMeetsCG(nodesCG, webpage))
			{
				nodesCG.push(webpage);
				indexWebpages.push(indexWebpage);
				acceptableLess--;

				// Save current nodesCG
				if (nodesCG.length >= HybEx.HybEx.Config.acceptableCGSize && nodesCG.length > maximal.length)
				{
					maximal = HybEx.misc.Misc.arrayClone(nodesCG);

					// Objective Complete Graph found
					if (maximal.length == HybEx.HybEx.Config.objectiveCGSize)
						break;
				}
			}
		}
		return maximal;
	}
	/*this.removeDuplicateFiles = function()
	{
		var unprocessedWebpages = this.website.getUnprocessedWebpages();
		var webpages = HybEx.misc.Misc.arrayClone(unprocessedWebpages);

		var initialWebpage = this.website.getInitialWebpage();
		var initialFile = initialWebpage.getLink().getFile();

		for (var webpageIndex = webpages.length - 1; webpageIndex >= 0; webpageIndex--)
		{
			var webpage = webpages[webpageIndex];
			var webpageFile = webpage.getLink().getFile();

			if (initialFile == webpageFile){
				//alert(initialFile + "-" + webpageFile);
				HybEx.misc.Misc.arrayRemoveElement(webpages, webpageIndex);
			}
		}
		return webpages;
	}	*/
	this.obtainPossibleCGNodes = function()
	{
		var unprocessedWebpages = this.website.getUnprocessedWebpages();
		var webpages = HybEx.misc.Misc.arrayClone(unprocessedWebpages);
		var initialWebpage = this.website.getInitialWebpage();

		if (HybEx.HybEx.Config.notDuplicatedWebpages){	
			//Eliminación de páginas duplicadas sin tener en cuenta parámetros
			var initialFile = initialWebpage.getLink().getFile();

			for (var webpageIndex = webpages.length - 1; webpageIndex >= 0; webpageIndex--)
			{
				var webpage = webpages[webpageIndex];
				var webpageFile = webpage.getLink().getFile();

				if (initialFile == webpageFile){
					//alert(initialFile + "-" + webpageFile);
					HybEx.misc.Misc.arrayRemoveElement(webpages, webpageIndex);
				}
			}		
			//Fin de elminicación páginas duplicadas
		}
		
		if (HybEx.HybEx.Config.allowKeypage)
			return webpages;

		var initialURL = initialWebpage.getLink().getURL();

		for (var webpageIndex = webpages.length - 1; webpageIndex >= 0; webpageIndex--)
		{
			var webpage = webpages[webpageIndex];
			var webpageURL = webpage.getLink().getURL();

			if (initialURL == webpageURL)
				HybEx.misc.Misc.arrayRemoveElement(webpages, webpageIndex);
		}

		return webpages;
	}
	this.doesNodeMeetsCG = function(nodesCG, node)
	{
		for (var nodeCGIndex in nodesCG)
		{
			var nodeCG = nodesCG[nodeCGIndex];
			if (!(nodeCG.hasWebpageLinked(node) && node.hasWebpageLinked(nodeCG)))
				return false;
		}
		return true;
	}

	/***************************/
	/******** Phase 3 **********/
	/***************************/
	this.countOcurrences = function(ocurrences, initialDOMNode, DOMNode)
	{
 		var ocurrence = ocurrences.remove(initialDOMNode.posNode);
		if (ocurrence == null)
			var num_ocurr = 1;
		else
			var num_ocurr = ocurrence[1] + 1;
		var ocur = new Array();
		ocur.push(initialDOMNode, num_ocurr);
		ocurrences.put(initialDOMNode.posNode, ocur);

		var nodesMap = new HybEx.HybEx.Map(initialDOMNode.childNodes, DOMNode.childNodes);
		this.map++;
		for (var childIndex = 0; childIndex < initialDOMNode.childNodes.length; childIndex++)
		{
			var initialDOMNodeChild = initialDOMNode.childNodes[childIndex];
			var DOMNodeChild = nodesMap.obtainEquivalentNode(initialDOMNodeChild);

			if (DOMNodeChild == null)
				continue;
			else
				this.variable++;
			
			this.countOcurrences(ocurrences, initialDOMNodeChild, DOMNodeChild);
		}
	}
	this.getTemplateNodes = function(ocurrences, threshold)
	{
		var templateNodes = new Array();
		var ocurrenceEntries = ocurrences.entries();

		for (var ocurrenceEntryIndex = 0; ocurrenceEntryIndex < ocurrenceEntries.length; ocurrenceEntryIndex++)
		{
			var ocurrenceEntry = ocurrenceEntries[ocurrenceEntryIndex];
			var node = ocurrenceEntry[1][0];
			var ocurrences = ocurrenceEntry[1][1];
				if (ocurrences >= threshold)
					templateNodes.push(node);
		}

		return templateNodes;
	}
	this.setPositions = function(node)
	{
		node.posNode = this.nodeCounter;
		this.nodeCounter++;
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				this.setPositions(children[i]);
			}
		}
	}
	this.checkChildren = function(node)
	{
		let respuesta = this.checkChildrenAndTags(node)
		if (respuesta == true)
			this.createTempDOMNodes(node);
		
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				this.checkChildren(children[i]);
			}
		}
	}	
	this.checkChildrenAndTags = function(node)
	{
		let tablaEtiquetas = new Array();
		if (node && node.childNodes.length < HybEx.HybEx.Config.largeChildren)
			return false;
		else{
			let contador, nodos = 0;
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				if (children[i].nodeType == 1){
					nodos++;
					tablaEtiquetas.push(children[i].tagName);
				}
			}
			let counts = {};
			let max = 0;
			tablaEtiquetas.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
			for (var element in counts) {
				if(counts[element] > max)
					max = counts[element];
			} 
			if (max >= (nodos-1)/2)
				return true;
			else
				return false;
		}
	}
	this.createTempDOMNodes = function(node)
	{
		let separation = 20;
		let contador = 0;
		let iteration = 0;
		var newNode = null;
		for (var childIndex = 0; childIndex < node.childNodes.length; childIndex++)
		{
			var initialDOMNodeChild = node.childNodes[childIndex];
			if (initialDOMNodeChild.nodeType == 1){
				if (contador % separation == 0){
					if (contador > 0)
						node.insertBefore(newNode, node.childNodes[iteration]);						
					iteration++;
					newNode = document.createElement("DIV");
					newNode.className = "TECO_newDIVNode";
				}

				newNode.appendChild(initialDOMNodeChild);
				contador++;
			}
		}
	}
	this.preprocess = function(node)
	{
		if (node.tagName == "SCRIPT" || node.tagName == "STYLE" || node.tagName == "IFRAME"){
			node.parentNode.removeChild(node);
			return;
		}
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				this.preprocess(children[i]);
			}
		}
	}
	this.calculateTotalVisiblesNodes = function(root)
	{
		var nextNode = null;
		var numVisiblesNodes = 0;
		var treeSearch = new HybEx.util.TreeSearch(root, new Array());

		while ((nextNode = treeSearch.nextPreOrder()) != null)
			if (!this.isHidden(nextNode))
				numVisiblesNodes++;
			else
				treeSearch.avoidNode(nextNode);

		return numVisiblesNodes;
	}
	this.isHidden = function(node)
	{
		if (node.style)
			return (node.style.visibility == "hidden");
	}	
	this.hideFinal = function(contentBody)
	{
		var contentNode;
		var treeSearch = new HybEx.util.TreeSearch(contentBody, new Array());

		while ((contentNode = treeSearch.nextPreOrder()) != null)
			if (contentNode.final)
				this.hideNode(contentNode);
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
