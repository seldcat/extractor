HybEx.ConEx.Content = function(body, website)
{
	this.arraytmp0 = new Array();
	this.arraytmp1 = new Array();
	this.arraytmp2 = new Array();
	this.arraytmp3 = new Array();
	this.arraytmp4 = new Array();
	this.arraytmp5 = new Array();
	this.arraytmp6 = new Array();
	
	this.arrayNames = [this.arraytmp0, this.arraytmp1, this.arraytmp2, this.arraytmp3, this.arraytmp4, this.arraytmp5, this.arraytmp6];
	
	this.finalCluster = null;
	this.finalClusterValue = Number.NEGATIVE_INFINITY;
	
	this.ponderations = new Array();
	this.depth = 0;
	this.forbiddenNodes = new Array("NAV", "undefined", "HR", "SPAN", "EM", "BODY", "SCRIPT", "HEADER", "H1", "H2", "H3", "H4", "H5","iframe","form","style","STYLE","IMG","FORM","IFRAME");
	this.centroidValue = Infinity;
	this.centroidNode = null;
	this.distanceMax = 0;
	this.distanceNode = null;
	this.distanceMin = new Array(HybEx.HybEx.Config.clusterSize);
	this.distanceNodeMin = new Array(HybEx.HybEx.Config.clusterSize);
	
	this.standardizedAvg = new Array(4);
	this.standardizedDeviation = new Array(4);
	this.clusterValue = 1;
	this.threshold = 0;	

	this.cleanNodes = function()
	{
		for (var i = 0; i < this.distanceMin.length; i++)
			this.distanceMin[i] = Infinity;
		for (var i = 0; i < this.distanceNodeMin.length; i++)
			this.distanceNodeMin[i] = null;
	}
	
	this.euclidean = function(node1, node2){
		var total = 0;
		for (var i = 0; i < node1.ratio.length; i++)
			total = total + Math.pow(node1.ratio[i] - node2.ratio[i], 2);
		total = Math.sqrt(total);
		return total;
	}

	this.centroid = function(node)
	{
		if ((!node.cluster) && (node.ratio))
			var valor = this.computeCentroid(node, body);
		else
			var valor = Infinity;
		if (valor < this.centroidValue && valor >= 0){
			this.centroidValue = valor; 
			this.centroidNode = node;
		}
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++){  
			if(children[i].ratio)
				this.centroid(children[i]);
		}
	}
	
	this.computeCentroid = function(node1, node2)
	{
		var counter = 0;
		if (node1.ratio && node2.ratio && !node1.cluster && !node2.cluster)
			counter += this.euclidean(node1, node2);

		var children = node2.childNodes;
		for (var i = 0; i < children.length; i++){
			if(children[i].ratio)
				counter += this.computeCentroid(node1, children[i]);
		}
		return counter;
	}
	
	this.distance = function(node1, node2)
	{
		if (node1.ratio && node2.ratio && !node1.cluster){
			var valor = this.euclidean(node1, node2);
			if (valor >= this.distanceMax){
				this.distanceMax = valor; 
				this.distanceNode = node1.cloneNode(true);
				this.distanceNode.ratio = node1.ratio;
			}
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++){  
			if(children[i].ratio)
				this.distance(children[i], node2);
		}
	}
	
	this.minDistance = function(node1, node2)
	{
		if (node1.ratio && node2.ratio && !node1.cluster && (this.countVisibleText(node1, true) < this.countVisibleText(node1.parentNode, true) || node1.depth > 2)){
			var valor = this.euclidean(node1, node2);
			var maxActual = 0;
			var posActual = 0;
			for (var i = 0; i < this.distanceMin.length; i++){
				if (this.distanceMin[i] >= maxActual){
					maxActual = this.distanceMin[i];
					posActual = i;
				}
			}
			if (valor < maxActual){ 
				this.distanceMin[posActual] = valor; 
				this.distanceNodeMin[posActual] = node1;
				this.distanceNodeMin[posActual].ratio = node1.ratio;
			}
			
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++){  
			if(children[i].ratio)
				this.minDistance(children[i], node2);
		}
	}
		
	this.assignCluster = function(node1)	
	{
		var total = 0;
		if (HybEx.misc.Misc.arrayContains(this.distanceNodeMin,node1) && node1.depth > 2){
			node1.cluster = this.clusterValue;
			var a = Math.abs(node1.ratio[0])+Math.abs(node1.ratio[1])+Math.abs(node1.ratio[2])+Math.abs(node1.ratio[3]);
			total += a;
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++){
			if(children[i].ratio)
				total += this.assignCluster(children[i]);
		}
		return total;
	}
		
	this.getCluster = function(node1, cluster)	
	{
		if (node1.cluster == cluster){
			node1.final = 1;
			node1.realWords = this.countWords2(node1, true);
		}
			
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++)
			this.getCluster(children[i], cluster);
	}
	
	this.getClusterFinal = function(node)	
	{
		if ((node.final) && (node.final == 1)){
			this.getSameWordsLessLevel(node, node.realWords, node.depth);
			if ((node.final) && (node.final == 1)){
				let value = node.realWords/this.countTags(node,true);
				if  (value > this.finalClusterValue)
					this.finalClusterValue = value;
			}
		}
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++)
			this.getClusterFinal(children[i]);
	}
	
	this.getSameWordsLessLevel = function(node, words, level)	
	{
		if ((node.final) && (node.final == 1)){
			if ((node.realWords == words) && (node.depth < level))
				node.final = 0;
		}
			
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++)
			this.getSameWordsLessLevel(children[i], words, level);
	}	

	this.getClusterMax = function(node1)	
	{
		if ((node1.final) && (node1.final == 1)){
			var a = node1.realWords/this.countTags(node1,true);
			if ((a < this.finalClusterValue) && ((!node1.newfinal) || (node1.newfinal != 1)))
				node1.final = 0;
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++)
			this.getClusterMax(children[i]);
	}	

	this.countCluster = function(node1)	
	{
		var count = 0;
		if ((node1.final) && (node1.final == 1))
			count++;
			
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++)
			count += this.countCluster(children[i]);
		
		return count;
	}
	this.joinBrothers = function(node1)	
	{
		if ((node1.final) && (node1.final == 1)){
			var node2 = node1.parentNode;
			if (node2){
				var children2 = node2.childNodes;
				for (var i = 0; i < children2.length; i++){
					if ((children2[i].final) && (children2[i].final == 1) && (children2[i] != node1)){
						node1.newfinal = 1;
						children2[i].newfinal = 1;
					}
				}
			}
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++)
			this.joinBrothers(children[i]);		
	}
	this.countBody = function(node)
	{
		var count = 0;
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++)
			if (children[i].tagName != undefined)
				count++;
		return count;
	}
	this.processContent = function(body)
	{	
		this.preprocess(body);
		this.posNode(body, 0);
		var numNodes = this.countBody(body);
		if (numNodes >= (this.depth-1))
			this.threshold  = body.textContent.replace(/\s/g,'').length / 2;
		else
			this.threshold = -1;
		
		var menuCandidates = new Array();
		var newMainNode = new Array();
		var newNode = new Array();	
		var links = new Array();
		var compareBest = 0;

		this.rateNode(body);

		for (var k=0; k < 4; k++){
			this.mean(body, k);
			this.standardizedAvg[k] = this.mean2(k);
			let n = this.arrayNames[k];
			this.standardizedDeviation[k] = standardDeviation(n);
		}
		
		this.standardizeNode(body);
		var iter = 0;
		while (iter < 1){
			iter++;
			this.centroidValue = Infinity;
			var distanceMax = 0;
			//Calcular centroide
			this.centroidNode = null;
			this.centroid(body);
			if (this.centroidNode == null)
				break;
			
			//Calcular r
			this.distanceMax = 0;
			this.distance(body, this.centroidNode);
			if (this.distanceNode == null)
				break;
			var r = this.distanceNode.cloneNode(true);
			r.ratio = this.distanceNode.ratio;

			this.distanceNode = null;
			
			//Cluster de r
			this.cleanNodes();
			this.minDistance(body, r);
			var pond = this.assignCluster(body);
			this.ponderations.push(pond);
			this.clusterValue++;

		}
		var maxPond = 0;
		var maxI = 0;
		for (var i=0; i<this.clusterValue-1; i++){
			if (this.ponderations[i] > maxPond){
				maxPond = this.ponderations[i];
				maxI = i+1;
			}
		}
		this.getCluster(body, maxI);
		this.getClusterFinal(body);
		let restants = 0;
		restants = this.countCluster(body);
		//alert(restants);
		if (restants > 1)
			this.joinBrothers(body);
		this.getClusterMax(body);
		//Desactivado el postprocesado hasta hablar con Josep
		//this.postProcessLink5(body);
		return body;
	}
	this.postProcessLink5 = function(node)
	{
		if ((node.nodeType == 1) && (node.tagName != undefined)){
			//Al cambiar el parámetro checkNumberOfLinks cambia el resultado
			if ((this.countTextIncludingLink2(node,true)/this.countTextNotLink2(node,true) > 2) && (this.checkNumberOfLinks(node) >= 7) && (node.depth > 2)){
				node.escondido = 1;
				return;
			}
		}
		if ((node.nodeType == 1) && (node.tagName == "A") && (this.linkWithImage2(node) == 0)){
			if (node.nextSibling == null && node.previousSibling == null){
				if (this.checkAll(node.parentNode.parentNode, node.parentNode) == true)
					while (node.hasChildNodes())
						node.removeChild(node.lastChild);
			}
		}		
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				this.postProcessLink5(children[i]);
			}
		}
	}
	this.checkAll = function (node1, node2)
	{
		let found = true;
		let children = node1.childNodes;
		for (var i = 0; i < children.length; i++){
			if(children[i].tagName != undefined && node2.tagName != undefined && children[i].firstChild != null){
				if (children[i].tagName != node2.tagName || children[i].firstChild.tagName != "A" || children[i].firstChild.nextSibling != null)
					if (children[i].firstChild.tagName != "A" && children[i].firstChild.textContent.trim().length == 0 && (this.linkWithImage2(children[i].firstChild) == 0))
						console.log("Del node");
					else
						found = false;
			}
		}
		return found;
	}
	this.linkWithImage2 = function(node)
	{
		var count = 0;
		if (node.tagName == "IMG"){
			count++;
		}
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				count += this.linkWithImage2(children[i]);
			}
		}
		return count;
	}	
	this.checkNumberOfLinks = function(node)
	{
		var number = 0;
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			for (var i = 0; i < children.length; i++){
				if (children[i].tagName == "A"){
					number++;
				}
			}
		}
		return number;
	}

	this.posNode = function(node, depth)
	{
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			depth++;
			for (var i = 0; i < children.length; i++){  
				if(children[i].nodeType != 3){
					children[i].depth = depth;
					if (this.depth < depth)
						this.depth = depth;
					this.posNode(children[i], depth);
				}
			}
		}
	}

	this.standardizeNode = function(node1)
	{
		if (node1.ratio){
			if (this.standardizedDeviation[0] != 0)
				node1.ratio[0] = (node1.ratio[0] - this.standardizedAvg[0]) / this.standardizedDeviation[0];
			if (this.standardizedDeviation[1] != 0)
				node1.ratio[1] = (node1.ratio[1] - this.standardizedAvg[1]) / this.standardizedDeviation[1];
			if (this.standardizedDeviation[2] != 0)
				node1.ratio[2] = (node1.ratio[2] - this.standardizedAvg[2]) / this.standardizedDeviation[2];
			if (this.standardizedDeviation[3] != 0)
				node1.ratio[3] = (node1.ratio[3] - this.standardizedAvg[3]) / this.standardizedDeviation[3];
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++){  
			if(children[i].ratio)
				this.standardizeNode(children[i]);
		}
	}	
	
	this.mean = function(node1, j)
	{
		if (node1.ratio){
			let n = this.arrayNames[j];
			n.push(node1.ratio[j]);
		}
		var children = node1.childNodes;
		for (var i = 0; i < children.length; i++){  
			if(children[i].ratio)
				this.mean(children[i], j);
		}
	}
	
	this.mean2 = function(j)
	{
		var tmpsuma = 0;
		let n = this.arrayNames[j];
		for (var i = 0; i < n.length;i++){
			tmpsuma += n[i];
		}
		return(tmpsuma/n.length);
	}

	this.wordCount = function(str) { 
	  return str.split(" ").length;
	}	
	
	this.countWords = function(node, getChildrensChildren, origNode)
	{
		var counter = 0;
		var cadena = "";
		
		if ((node.nodeType == 3) && (node.parentNode.tagName != "A")){
			cadena = node.textContent.trim();
			var dist = this.distanceBetweenTwoNodes(node, origNode);
			counter = counter + (this.wordCount(cadena)/dist);
			cadena = "";
		}

		if (node && node.childNodes.length > 0){
			var children = node.childNodes.length;
			for(var i=0; i < children; i++){
				//if(node.tagName != "A"){
					if(getChildrensChildren)
						counter += this.countWords(node.childNodes[i],true, origNode);
				//}
			}
		}

		return counter;
	}
	
	this.countWords2 = function(node, getChildrensChildren)
	{
		var counter = 0;
		var cadena = "";
		
		if (node.nodeType == 3){
			cadena = node.textContent.trim();
			if (/\S/.test(cadena)){
				counter = counter + this.wordCount(cadena);
				cadena = "";
			}
		}

		if (node && node.childNodes.length > 0){
			var children = node.childNodes.length;
			for(var i=0; i < children; i++){
				if(node.tagName != "SCRIPT"){
					if(getChildrensChildren)
						counter += this.countWords2(node.childNodes[i],true);
				}
			}
		}

		return counter;
	}
	
	this.distanceBetweenTwoNodes = function(node1,node2){
		var distance = 0;
		while (node1 != node2){
			node1 = node1.parentNode;
			distance++;
		}
		return distance;
	}
	
	this.rateNode = function(node)
	{
		if (node && node.childNodes.length > 0){
			var children = node.childNodes;
			if ((children.length >= 1) && (node.textContent.replace(/\s/g,'').length > this.threshold))
					if ((!HybEx.misc.Misc.arrayContains(this.forbiddenNodes, node.tagName )) && (node.nodeType != 3) && (node.display !== 'none') && (node.style.visibility !== 'hidden'))
						node.ratio = this.computeNodeRatio(node);
				for (var i = 0; i < children.length; i++)
						this.rateNode(children[i]);
		}
	}
	
	this.countTerminals = function(node, getChildrensChildren, origNode)
	{
		var counter = 0;
		
		if (node.tagName == "A"){
			counter++;
		}

		else if (node && node.childNodes.length > 0){
			var children = node.childNodes.length;
			for(var i=0; i < children; i++){
				if(getChildrensChildren)
					counter += this.countTerminals(node.childNodes[i],true, origNode);
			}
		}
		return counter;
	}
	
	this.countTags = function(node, getChildrensChildren)
	{
		var counter = 0;
		
		if (node.tagName == "A"){
			counter++;
		}

		else if (node && node.childNodes.length > 0){
			var children = node.childNodes.length;
			for(var i=0; i < children; i++){
				if(getChildrensChildren)
					counter += this.countTags(node.childNodes[i],true);
			}
		}
		return counter;
	}
	
	this.computeNodeRatio = function(node){
		var ratio = new Array();
		var contentProbability = 0;
		var nodos = node.getElementsByTagName("*").length;
		
		var terms = this.countTerminals(node, true, node);
		if (terms > 0)
			var countTerminals = 1/terms;
		else
			var countTerminals = 1;

		var countWords = this.countWords(node, true, node);
		
		var brothersProbability = 0;
		if (node && node.childNodes.length > 2)
			brothersProbability = 1;
		
		var realdepth = 0;
		if (node.depth > (this.depth / 2))
			realdepth = this.depth - node.depth;
		if (node.depth <= (this.depth / 2))
			realdepth = node.depth;
		var depthProbability = realdepth / node.depth;
		
		ratio[0] = countTerminals;
		ratio[1] = countWords;
		ratio[2] = brothersProbability;
		ratio[3] = depthProbability;
		
		return ratio;
	}

function standardDeviation(values){
  var avg = average(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

function average(data){
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

this.preprocess = function(node)
{
	if (node.tagName == "SCRIPT" || node.tagName == "STYLE"/* || node.tagName == "IFRAME"*/){
		node.parentNode.removeChild(node);
		return;
	}
	if (node.nodeType == 1){
		if ((node.id.search(/cookie/i) != -1) || (node.classList.contains("cookie"))){
			node.parentNode.removeChild(node);
			return;		
		}
	}
	if (node && node.childNodes.length > 0){
		var children = node.childNodes;
		for (var i = 0; i < children.length; i++){
			this.preprocess(children[i]);
		}
	}
}

this.countTextNotLink2 = function(node, getChildrensChildren)
{
	var counter = 0;
	var cadena = "";
	
	if (node.nodeType == 3){
		cadena = node.nodeValue.trim();
		counter = counter + cadena.length;
		cadena = "";
	}

	if (node && node.childNodes.length > 0){
		var children = node.childNodes.length;
		for(var i=0; i < children; i++){
			if(node.tagName != "A"){
				if(getChildrensChildren)
					counter += this.countTextNotLink2(node.childNodes[i],true);
			}
		}
	}

	return counter;
}	

this.countTextIncludingLink2 = function(node, getChildrensChildren)
{
	var counter = 0;
	var cadena = "";
	
	if (node.nodeType == 3){
		cadena = node.nodeValue.trim();
		counter = counter + cadena.length;
		cadena = "";			
	}

	if (node && node.childNodes.length > 0){
		var children = node.childNodes.length;
		for(var i=0; i < children; i++){
			if(getChildrensChildren)
				counter += this.countTextIncludingLink2(node.childNodes[i],true);
		}
	}
	return counter;
}

this.countVisibleText = function(node, getChildrensChildren)
{
	var counter = 0;
	var cadena = "";
	
	if (node.nodeType == 3){
		cadena = node.nodeValue.trim();
		counter = counter + cadena.length;
		cadena = "";			
	}

	if (node && node.childNodes.length > 0){
		var children = node.childNodes.length;
		for(var i=0; i < children; i++){
			if(getChildrensChildren)
				if ((node.nodeType == 1) && (node.childNodes[i].display != 'none')/* && (node.childNodes[i].style.visibility != 'hidden')*/)
					counter += this.countVisibleText(node.childNodes[i],true);
		}
	}
	return counter;
}

	return this.processContent(body);
}