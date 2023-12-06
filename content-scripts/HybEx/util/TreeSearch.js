HybEx.util.TreeSearch = function(root, avoid)
{
	this.root = root;
	this.current = root;
	this.avoid = avoid;

	this.numChildToVisit = 0;
	this.bifurcation = new Array();

	this.reset = function reset()
	{
		this.current = this.root;
		this.numChildToVisit = 0;
		this.bifurcation = new Array();
	}

	this.avoided = function avoided(node)
	{
		for (var avoidIndex in this.avoid)
			if (this.avoid[avoidIndex] === node)
				return true;
		return false;
	}

	this.avoidNode = function avoidNode(node)
	{
		if (this.avoided(node))
			return;
		this.avoid.push(node);

		// The avoided node is ancestor of the current node?
		var found = false;
		var parent = this.current;
		while (!found && parent != this.root)
		{
			if (parent == node)
				found = true;
			parent = parent.parentNode;
		}

		// If so, backtracking
		if (found)
			while (this.current != node)
			{
				this.current = this.current.parentNode;
				this.numChildToVisit = this.bifurcation[this.bifurcation.length - 1];
				HybEx.misc.Misc.arrayRemoveElement(this.bifurcation, this.bifurcation.length - 1);
			}
	}

	this.nextPreOrder = function nextPreOrder()
	{
		if (this.current == null)
			return null;

		var returnNode = null;
		do
		{
			var avoided = this.avoided(this.current);
			var numChildren = avoided ? 0 : this.current.childNodes.length;
			if (numChildren == 0 || this.numChildToVisit == numChildren)
			{
				// Is a leaf or all children have been evaluated
				if (numChildren == 0 && !avoided)
					returnNode = this.current;

				// Finish directly when we are at the root
				if (this.current == this.root)
				{
					this.current = null;
					break;
				}
				else
				{
					// Otherwise, go back to the parent
					this.current = this.current.parentNode;
					this.numChildToVisit = this.bifurcation[this.bifurcation.length - 1];
					HybEx.misc.Misc.arrayRemoveElement(this.bifurcation, this.bifurcation.length - 1);
				}
			}
			else
			{
				// A child is not evaluated yet
				if (this.numChildToVisit == 0)
					returnNode = this.current;

				// Go to the child
				this.current = this.current.childNodes[this.numChildToVisit];
				this.bifurcation.push(this.numChildToVisit + 1);
				this.numChildToVisit = 0;
			}
		}
		while (returnNode == null);

		return returnNode;
	}
	this.nextPostOrder = function nextPostOrder()
	{
		if (this.current == null)
			return null;

		var returnNode = null;
		do
		{
			var avoided = this.avoided(this.current);
			var numChildren = avoided ? 0 : this.current.childNodes.length;
			if (numChildren == 0 || this.numChildToVisit == numChildren)
			{
				// Is a leaf or all children have been evaluated
				if (!avoided)
					returnNode = this.current;

				// Finish directly when we are at the root
				if (this.current == this.root)
				{
					this.current = null;
					break;
				}
				else
				{
					// Otherwise, go back to the parent
					this.current = this.current.parentNode;
					this.numChildToVisit = this.bifurcation[this.bifurcation.length - 1];
					HybEx.misc.Misc.arrayRemoveElement(this.bifurcation, this.bifurcation.length - 1);
				}
			}
			else
			{
				// A child is not evaluated yet

				// Go to the child
				this.current = this.current.childNodes[this.numChildToVisit];
				this.bifurcation.push(this.numChildToVisit + 1);
				this.numChildToVisit = 0;
			}
		}
		while (returnNode == null);

		return returnNode;
	}
}
