/******************************************************/
/*********************** Mapping **********************/
/******************************************************/
HybEx.HybEx.Map = function(DOMNodesA, DOMNodesB)
{
	switch (HybEx.HybEx.Config.option)
	{
		case 1:
			HybEx.HybEx.Config.activatePosition = true;
			HybEx.HybEx.Config.positionRestrictive = true;
			break;
		case 2:
			HybEx.HybEx.Config.activatePosition = true;
			HybEx.HybEx.Config.positionRestrictive = false;
			break;
		case 3:
			HybEx.HybEx.Config.activatePosition = false;
			HybEx.HybEx.Config.recalculatePosition = true;
			break;
		case 4:
			HybEx.HybEx.Config.activatePosition = false;
			HybEx.HybEx.Config.recalculatePosition = false;
			break;
		default:
			HybEx.HybEx.Config.activatePosition = true;
			HybEx.HybEx.Config.positionRestrictive = true;
			break;
	}

	this.DOMNodesA = cloneDOMNodes(DOMNodesA);
	this.DOMNodesB = cloneDOMNodes(DOMNodesB);
	this.nodesProbabilities = calculateProbabilities(this.DOMNodesA, this.DOMNodesB);
	this.nodesAssignation = assignNodes(this.DOMNodesA, this.DOMNodesB, this.nodesProbabilities);

	this.obtainEquivalentNode = function(DOMNodeA)
	{
		var indexDOMNodeA = indexOfDOMNode(this.DOMNodesA, DOMNodeA);
		var indexDOMNodeB = this.nodesAssignation.get(indexDOMNodeA);
		return this.DOMNodesB[indexDOMNodeB];
	}

	// Probabilities
	function calculateProbabilities(DOMNodesA, DOMNodesB)
	{
		var nodesProbabilities = new HybEx.util.Hashtable();

		for (var DOMNodeAIndex = 0; DOMNodeAIndex < DOMNodesA.length; DOMNodeAIndex++)
		{
			var DOMNodeA = DOMNodesA[DOMNodeAIndex];
			var nodeProbabilities = new HybEx.util.Hashtable();

			for (var DOMNodeBIndex = 0; DOMNodeBIndex < DOMNodesB.length; DOMNodeBIndex++)
			{
				var DOMNodeB = DOMNodesB[DOMNodeBIndex];
				var probabilities = new HybEx.util.Hashtable();

				probabilities.put("TextNode", calculateTextNodeProbability(DOMNodeA, DOMNodeB));
				probabilities.put("TagName", calculateTagNameProbability(DOMNodeA, DOMNodeB));
				probabilities.put("ID", calculateIDProbability(DOMNodeA, DOMNodeB));
				probabilities.put("ClassName", calculateClassNameProbability(DOMNodeA, DOMNodeB));
				probabilities.put("Attributes", calculateAttributesProbability(DOMNodeA, DOMNodeB));
				probabilities.put("Descendants", calculateDescendantsProbability(DOMNodeA, DOMNodeB));

				DOMNodeB.childIndex = DOMNodeBIndex;
				nodeProbabilities.put(DOMNodeBIndex, probabilities);
			}
			DOMNodeA.childIndex = DOMNodeAIndex;
			nodesProbabilities.put(DOMNodeAIndex, nodeProbabilities);
		}

		return nodesProbabilities;
	}
	function calculateTextNodeProbability(DOMNodeA, DOMNodeB)
	{
		if (DOMNodeA.nodeName != DOMNodeB.nodeName)
			return 0;
		if (DOMNodeA.nodeName != "#text" && DOMNodeA.nodeName != "#comment")
			return 0;
		if (DOMNodeA.nodeValue == DOMNodeB.nodeValue)
			return 0.1;
		return -0.1;
	}
	function calculateTagNameProbability(DOMNodeA, DOMNodeB)
	{
		if (DOMNodeA.tagName || DOMNodeB.tagName)
		{
			if (DOMNodeA.tagName == DOMNodeB.tagName)
				return 1;
			return 0;
		}

		if (DOMNodeA.nodeName == DOMNodeB.nodeName)
			return 1;
		return 0;
	}
	function calculateIDProbability(DOMNodeA, DOMNodeB)
	{
		if (DOMNodeA.id && DOMNodeB.id && DOMNodeA.id == DOMNodeB.id)
			return 1;
		return 0;
	}
	function calculateClassNameProbability(DOMNodeA, DOMNodeB)
	{
		var classNameA = DOMNodeA.className;
		var classNameB = DOMNodeB.className;
		
		if (classNameA){
			classNameA = classNameA.toString().replace('TECO_notTemplate','');
			classNameA = classNameA.toString().replace('TECO_notTemplate2','');
			classNameA = classNameA.toString().replace('TECO_notTemplate3','');
			classNameA = classNameA.toString().replace('TECO_mainContent','');
			classNameA = classNameA.toString().replace('TECO_mainMenu','');
		}

		if (classNameB){
			classNameB = classNameB.toString().replace('TECO_notTemplate','');
			classNameB = classNameB.toString().replace('TECO_notTemplate2','');
			classNameB = classNameB.toString().replace('TECO_notTemplate3','');
			classNameB = classNameB.toString().replace('TECO_mainContent','');
			classNameB = classNameB.toString().replace('TECO_mainMenu','');
		}
			
		if (!classNameA && !classNameB)
			return HybEx.HybEx.Config.notClassesProbability;
		if (!classNameA || !classNameB)
			return 0;
		if (classNameA == "" && classNameB == "")
			return HybEx.HybEx.Config.notClassesProbability;
		if (classNameA == "" || classNameB == "")
			return 0;

		var classesA = classNameA.split(" ");
		var classesB = classNameB.split(" ");

		var sameClasses = 0;
		for (var classIndex in classesA)
			if (HybEx.misc.Misc.arrayContains(classesB, classesA[classIndex]))
				sameClasses++;

		var numOfClasses = classesA.length + classesB.length - sameClasses;
		return sameClasses / numOfClasses;
	}
	function calculateAttributesProbability(DOMNodeA, DOMNodeB)
	{
		if (!DOMNodeA.attributes && !DOMNodeB.attributes)
			return HybEx.HybEx.Config.notAttributesProbability;
		if (!DOMNodeA.attributes || !DOMNodeB.attributes)
			return 0;

		var numOfAttributesDOMNodeA = 0;
		for (var attributesIndex in DOMNodeA.attributes)
		{
			var attributeNodeA = DOMNodeA.attributes[attributesIndex];
			if (attributeNodeA.name == "id" || attributeNodeA.name == "class")
				continue;
			numOfAttributesDOMNodeA++;
		}

		var numOfAttributesDOMNodeB = 0;
		for (var attributesIndex in DOMNodeB.attributes)
		{
			var attributeNodeB = DOMNodeB.attributes[attributesIndex];
			if (attributeNodeB.name == "id" || attributeNodeB.name == "class")
				continue;
			numOfAttributesDOMNodeB++;
		}

		if (numOfAttributesDOMNodeA == 0 && numOfAttributesDOMNodeB == 0)
			return HybEx.HybEx.Config.notAttributesProbability;
		if (numOfAttributesDOMNodeA == 0 || numOfAttributesDOMNodeB == 0)
			return 0;

		var sameAttributes = 0;
		for (var attributesIndex in DOMNodeA.attributes)
		{
			var attributeNodeA = DOMNodeA.attributes[attributesIndex];
			if (attributeNodeA.name == "id" || attributeNodeA.name == "class")
				continue;
			var attributeNodeB = DOMNodeB.attributes[attributeNodeA.name];
			if (!attributeNodeB)
				continue;

			if (attributeNodeA.value == attributeNodeB.value)
				sameAttributes++;
		}

		var numOfAttributes = numOfAttributesDOMNodeA + numOfAttributesDOMNodeB - sameAttributes;
		return sameAttributes / numOfAttributes;
	}
	function calculateDescendantsProbability(DOMNodeA, DOMNodeB)
	{
		var numChildrenA = DOMNodeA.childNodes.length;
		var numChildrenB = DOMNodeB.childNodes.length;

		if (numChildrenA == 0 && numChildrenB == 0)
			return HybEx.HybEx.Config.notChildrenProbability;
		if (numChildrenA == 0 || numChildrenB == 0)
			return 0;
		if (numChildrenA > numChildrenB)
			return numChildrenB / numChildrenA;
		return numChildrenA / numChildrenB;
	}

	// Compute assignations //JUL
	function assignNodes(DOMNodesA, DOMNodesB, nodesProbabilities)
	{
		var assignation = new HybEx.util.Hashtable();
		var DOMNodesALess = cloneDOMNodes(DOMNodesA);
		var DOMNodesBLess = cloneDOMNodes(DOMNodesB);

		if (!HybEx.HybEx.Config.activatePosition && !HybEx.HybEx.Config.recalculatePosition)
			calculatePositionProbabilities(DOMNodesA, DOMNodesB, assignation, nodesProbabilities);

		while (true)
		{
			if (HybEx.HybEx.Config.activatePosition || HybEx.HybEx.Config.recalculatePosition)
				calculatePositionProbabilities(DOMNodesA, DOMNodesB, assignation, nodesProbabilities);

			var bestPairIndex = calculateBestPairOfNodes(DOMNodesALess, DOMNodesBLess, nodesProbabilities);
			if (bestPairIndex == null)
				break;
			var pairIndex = obtainPairOfNodes(bestPairIndex, DOMNodesA, DOMNodesB, DOMNodesALess, DOMNodesBLess);
			if (pairIndex == null)
				alert("Error");

			assignation.put(pairIndex[0], pairIndex[1]);
			HybEx.misc.Misc.arrayRemoveElement(DOMNodesALess, bestPairIndex[0]);
			HybEx.misc.Misc.arrayRemoveElement(DOMNodesBLess, bestPairIndex[1]);
		}
		return assignation;
	}
	function obtainPairOfNodes(bestPairIndex, DOMNodesA, DOMNodesB, DOMNodesALess, DOMNodesBLess)
	{
		var bestDOMNodeAIndex = bestPairIndex[0];
		var bestDOMNodeBIndex = bestPairIndex[1];
		var bestDOMNodeA = DOMNodesALess[bestDOMNodeAIndex];
		var bestDOMNodeB = DOMNodesBLess[bestDOMNodeBIndex];
		var DOMNodeAindex = indexOfDOMNode(DOMNodesA, bestDOMNodeA);
		var DOMNodeBindex = indexOfDOMNode(DOMNodesB, bestDOMNodeB);

		if (DOMNodeAindex == -1 || DOMNodeBindex == -1)
			return null;

		var pairIndex = new Array();
		pairIndex.push(DOMNodeAindex);
		pairIndex.push(DOMNodeBindex);

		return pairIndex;
	}
		// Position probability
	function calculatePositionProbabilities(DOMNodesA, DOMNodesB, assignation, nodesProbabilities)
	{
		resetPositionProbabilities(DOMNodesA, DOMNodesB, nodesProbabilities);

		var blocks;
		if (HybEx.HybEx.Config.activatePosition)
			blocks = calculateBlocks(DOMNodesA, DOMNodesB, assignation);
		else
			blocks = joiningNodes(DOMNodesA, DOMNodesB, assignation);

		for (var blockIndex = 0; blockIndex < blocks.length; blockIndex++)
		{
			var block = blocks[blockIndex];
			var DOMNodesABlock = block[0];
			var DOMNodesBBlock = block[1];

			calculatePositionProbability(DOMNodesABlock, DOMNodesBBlock, nodesProbabilities);
		}
	}
	function resetPositionProbabilities(DOMNodesA, DOMNodesB, nodesProbabilities)
	{
		for (var DOMNodesAIndex = 0; DOMNodesAIndex < DOMNodesA.length; DOMNodesAIndex++)
		{
			var DOMNodeA = DOMNodesA[DOMNodesAIndex];
			var nodeProbabilities = nodesProbabilities.get(DOMNodeA.childIndex);

			for (var DOMNodesBIndex = 0; DOMNodesBIndex < DOMNodesB.length; DOMNodesBIndex++)
			{
				var DOMNodeB = DOMNodesB[DOMNodesBIndex];
				var probabilities = nodeProbabilities.get(DOMNodeB.childIndex);

				probabilities.put("Position", 0);
				probabilities.put("NoPair", true);
			}
		}
	}
	function calculateBlocks(DOMNodesA, DOMNodesB, assignation)
	{
		// Create the main block
		var blocks = new Array();
		var mainBlock = new Array();
		mainBlock.push(DOMNodesA);
		mainBlock.push(DOMNodesB);
		blocks.push(mainBlock);

		// Separate the block according to the assignations
		var assignationKeys = assignation.keys();
		for (var assignationIndex = 0; assignationIndex < assignationKeys.length; assignationIndex++)
		{
			var DOMNodeAIndex = assignationKeys[assignationIndex];
			var DOMNodeA = DOMNodesA[DOMNodeAIndex];
			var DOMNodeBIndex = assignation.get(DOMNodeAIndex);
			var DOMNodeB = DOMNodesB[DOMNodeBIndex];

			for (var blockIndex = 0; blockIndex < blocks.length; blockIndex++)
			{
				var block = blocks[blockIndex];
				var DOMNodesABlock = block[0];
				var DOMNodesBBlock = block[1];
				var indexDOMNodeA = indexOfDOMNode(DOMNodesABlock, DOMNodeA);
				var indexDOMNodeB = indexOfDOMNode(DOMNodesBBlock, DOMNodeB);

				if (indexDOMNodeA == -1 || indexDOMNodeB == -1)
					continue;

				// Cut block
				HybEx.misc.Misc.arrayRemoveElement(blocks, blockIndex);

				// Add left block
				if (0 < indexDOMNodeA && 0 < indexDOMNodeB)
				{
					var DOMNodesASubBlock = cloneDOMNodesRange(DOMNodesABlock, 0, indexDOMNodeA - 1);
					var DOMNodesBSubBlock = cloneDOMNodesRange(DOMNodesBBlock, 0, indexDOMNodeB - 1);
					var newBlock = new Array();
					newBlock.push(DOMNodesASubBlock);
					newBlock.push(DOMNodesBSubBlock);
					blocks.push(newBlock);
				}
				// Add right block
				if (indexDOMNodeA + 1 < DOMNodesABlock.length && indexDOMNodeB + 1 < DOMNodesBBlock.length)
				{
					var DOMNodesASubBlock = cloneDOMNodesRange(DOMNodesABlock, indexDOMNodeA + 1, DOMNodesABlock.length - 1);
					var DOMNodesBSubBlock = cloneDOMNodesRange(DOMNodesBBlock, indexDOMNodeB + 1, DOMNodesBBlock.length - 1);
					var newBlock = new Array();
					newBlock.push(DOMNodesASubBlock);
					newBlock.push(DOMNodesBSubBlock);
					blocks.push(newBlock);
				}

				break;
			}
		}
		return blocks;
	}
	function joiningNodes(DOMNodesA, DOMNodesB, assignation)
	{
		var assignationKeys = assignation.keys();
		var DOMNodesAAssigned = new Array();
		var DOMNodesBAssigned = new Array();

		for (var assignationIndex = 0; assignationIndex < assignationKeys.length; assignationIndex++)
		{
			var DOMNodeAIndex = assignationKeys[assignationIndex];
			var DOMNodeBIndex = assignation.get(DOMNodeAIndex);

			DOMNodesAAssigned.push(DOMNodeAIndex);
			DOMNodesBAssigned.push(DOMNodeBIndex);
		}

		var blocks = new Array();
		var block = new Array();
		var DOMNodesASubBlock = avoidAssignedNodes(DOMNodesA, DOMNodesAAssigned);
		var DOMNodesBSubBlock = avoidAssignedNodes(DOMNodesB, DOMNodesBAssigned);
		block.push(DOMNodesASubBlock);
		block.push(DOMNodesBSubBlock);
		blocks.push(block);

		return blocks;
	}
	function avoidAssignedNodes(DOMNodes, DOMNodesAssigned)
	{
		var clon = new Array();

		for (var DOMNodesIndex = 0; DOMNodesIndex < DOMNodes.length; DOMNodesIndex++)
			if (!HybEx.misc.Misc.arrayContains(DOMNodesAssigned, DOMNodesIndex))
				clon.push(DOMNodes[DOMNodesIndex]);

		return clon;
	}
	function calculatePositionProbability(DOMNodesA, DOMNodesB, nodesProbabilities)
	{
		var numDOMNodesA = DOMNodesA.length;
		var numDOMNodesB = DOMNodesB.length;
		var less = numDOMNodesA > numDOMNodesB ? numDOMNodesB : numDOMNodesA;
		var difference = numDOMNodesA - numDOMNodesB;
		var start = difference < 0 ? 0 : -difference;
		var diff = difference > 0 ? difference : -difference;
		var block = diff + 1;

		for (var nodeIndex = 0; nodeIndex < numDOMNodesA; nodeIndex++)
		{
			var DOMNodeA = DOMNodesA[nodeIndex];
			var nodeProbabilities = nodesProbabilities.get(DOMNodeA.childIndex);
			var nodeStart = start + nodeIndex;
			var nodeEnd = nodeStart + block;
			nodeStart = Math.max(0, nodeStart);
			nodeEnd = Math.min(numDOMNodesB, nodeEnd);

			for (var nodeIndex2 = nodeStart - 1, iter = 1; nodeIndex2 >= 0; nodeIndex2--, iter++)
			{
				var DOMNodeB = DOMNodesB[nodeIndex2];
				var probabilities = nodeProbabilities.get(DOMNodeB.childIndex);
				var probability = 1 - iter / less;
				probabilities.put("Position", probability);
				probabilities.put("NoPair", false);
			}
			for (var nodeIndex2 = nodeStart; nodeIndex2 < nodeEnd; nodeIndex2++)
			{
				var DOMNodeB = DOMNodesB[nodeIndex2];
				var probabilities = nodeProbabilities.get(DOMNodeB.childIndex);
				var probability = 1;
				probabilities.put("Position", probability);
				probabilities.put("NoPair", false);
			}
			for (var nodeIndex2 = nodeEnd, iter = 1; nodeIndex2 < numDOMNodesB; nodeIndex2++, iter++)
			{
				var DOMNodeB = DOMNodesB[nodeIndex2];
				var probabilities = nodeProbabilities.get(DOMNodeB.childIndex);
				var probability = 1 - iter / less;
				probabilities.put("Position", probability);
				probabilities.put("NoPair", false);
			}
		}
	}
		// Best pair assignation
	function calculateBestPairOfNodes(DOMNodesA, DOMNodesB, nodesProbabilities)
	{
		var pairIndex = null;
		var maxProbability = HybEx.HybEx.Config.similarityThreshold;

		for (var DOMNodeAIndex = 0; DOMNodeAIndex < DOMNodesA.length; DOMNodeAIndex++)
		{
			var DOMNodeA = DOMNodesA[DOMNodeAIndex];
			var nodeProbabilities = nodesProbabilities.get(DOMNodeA.childIndex);

			for (var DOMNodeBIndex = 0; DOMNodeBIndex < DOMNodesB.length; DOMNodeBIndex++)
			{
				var DOMNodeB = DOMNodesB[DOMNodeBIndex];
				var probabilities = nodeProbabilities.get(DOMNodeB.childIndex);
				var probability = calculateGlobalProbability(probabilities);

				if (probability >= maxProbability)
//				if (probability > maxProbability && probability >= HybEx.HybEx.Config.similarityThreshold)
				{
					maxProbability = probability;
					pairIndex = new Array();
					pairIndex.push(DOMNodeAIndex);
					pairIndex.push(DOMNodeBIndex);
				}
			}
		}

		return pairIndex;
	}
		// Global probability
	function calculateGlobalProbability(probabilities)
	{
		var textNodeProbability = probabilities.get("TextNode");
		var tagNameProbability = probabilities.get("TagName");
		var idProbability = probabilities.get("ID");
		var classNameProbability = probabilities.get("ClassName");
		var positionProbability = probabilities.get("Position");
		var attributesProbability = probabilities.get("Attributes");
		var descendantsProbability = probabilities.get("Descendants");
		var noPair = probabilities.get("NoPair");

		if (tagNameProbability == 0)
			return -Number.MAX_VALUE;
		if (idProbability == 1)
			return Number.MAX_VALUE;
		if (positionProbability == 1 && classNameProbability == 1 && attributesProbability == 1)
			return Number.MAX_VALUE;
		if (classNameProbability == 1 && attributesProbability == 1)
			return Number.MAX_VALUE / 2;
		if (HybEx.HybEx.Config.activatePosition && HybEx.HybEx.Config.positionRestrictive && noPair)
			return -Number.MAX_VALUE;

		var textNodeProbabilityPonderate = textNodeProbability;
		var classNameProbabilityPonderate = classNameProbability * HybEx.HybEx.Config.classNamePonderation;
		var positionProbabilityPonderate = positionProbability * HybEx.HybEx.Config.positionPonderation;
		var attributesProbabilityPonderate = attributesProbability * HybEx.HybEx.Config.attributesPonderation;
		var descendantsProbabilityPonderate = descendantsProbability * HybEx.HybEx.Config.descendantsPonderation;

		var probabilityPonderate = 0;
//		probabilityPonderate += textNodeProbabilityPonderate;
		probabilityPonderate += classNameProbabilityPonderate;
		probabilityPonderate += positionProbabilityPonderate;
		probabilityPonderate += attributesProbabilityPonderate;
		probabilityPonderate += descendantsProbabilityPonderate;

		return probabilityPonderate;
	}

	// Auxiliar
	function cloneDOMNodes(DOMNodes)
	{
		return cloneDOMNodesRange(DOMNodes, 0, DOMNodes.length - 1);
	}
	function cloneDOMNodesRange(DOMNodes, startIndex, endIndex)
	{
		var clon = new Array();

		for (var DOMNodesIndex = startIndex; DOMNodesIndex <= endIndex; DOMNodesIndex++)
			clon.push(DOMNodes[DOMNodesIndex]);

		return clon;
	}
	function indexOfDOMNode(DOMNodes, DOMNode)
	{
		for (var DOMNodesIndex = 0; DOMNodesIndex < DOMNodes.length; DOMNodesIndex++)
			if (DOMNodes[DOMNodesIndex] == DOMNode)
				return DOMNodesIndex;
		return -1;
	}
}