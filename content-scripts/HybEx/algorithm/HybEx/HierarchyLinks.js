HybEx.HybEx.HierarchyLinks = function(path, nodeLinks)
{
	this.path = path;
	this.listOfLinks = new Array();
	this.parent = null;
	this.children = new HybEx.util.Hashtable();
	this.numOfLinks = 0;

	this.getPath = function()
	{
		return this.path;
	}
	this.getLinks = function()
	{
		return HybEx.misc.Misc.arrayClone(this.listOfLinks);
	}
	this.setParent = function(parent)
	{
		this.parent = parent;
	}

	this.addLink = function(newLink)
	{
		var newPath = newLink.getPath();
		var child = this.createDirectChild(newPath);

		if (child == null)
			this.listOfLinks.push(newLink);
		else
			child.addLink(newLink);
		this.numOfLinks++;
	}
	this.createDirectChild = function(newPath)
	{
		var nextDir = this.getNextDir(newPath);
		if (nextDir == null)
			return null;

		var nextPath = this.path + nextDir + "/";
		return this.createChild(nextPath, nextDir);
	}
	this.createChild = function(path, dir)
	{
		var child = this.getChild(dir);

		if (child == null)
		{
			child = new HybEx.HybEx.HierarchyLinks(path);
			child.setParent(this);
			this.children.put(dir, child);
		}

		return child;
	}
	this.getDirectChild = function(newPath)
	{
		var nextDir = this.getNextDir(newPath);
		if (nextDir == null)
			return null;

		var nextPath = this.path + nextDir + "/";
		return this.getChild(nextDir);
	}
	this.getChild = function(dir)
	{
		if (!this.children.containsKey(dir))
			return null;
		return this.children.get(dir);
	}
	this.getNextDir = function(newPath)
	{
		var restOfPath = newPath.substr(this.path.length);
		var indexNextPath = restOfPath.indexOf("/");

		if (indexNextPath == -1)
			return null;
		return restOfPath.substr(0, indexNextPath);
	}

	// Get all paths
	this.getPaths = function()
	{
		var paths = new Array();
		var children = this.children.values();

		paths.push(this.path);
		for (var childIndex in children)
		{
			var child = children[childIndex];
			var childPaths = child.getPaths();

			HybEx.misc.Misc.arrayAppend(paths, childPaths);
		}

		return paths;
	}

	// Get all links of a path
	this.getPathAllLinks = function(path, excludes)
	{
		if (path == this.path)
			return this.getAllLinks(excludes);

		var child = this.getDirectChild(path);
		if (child == null)
			return null;
		return child.getPathAllLinks(path, excludes);
	}
	this.getAllLinks = function(excludes)
	{
		var allLinks = this.getLinks();
		var children = this.children.values();

		for (var childIndex in children)
		{
			var child = children[childIndex];
			var childPath = child.getPath();
			if (excludes && HybEx.misc.Misc.arrayContains(excludes, childPath))
				continue;

			var childLinks = child.getAllLinks(excludes);
			HybEx.misc.Misc.arrayAppend(allLinks, childLinks);
		}

		return allLinks;
	}

	// Get leveled
	this.getPathLeveledAllLinks = function(path, excludes)
	{
		if (path == this.path)
			return this.getLeveledAllLinks(excludes);

		var child = this.getDirectChild(path);
		if (child == null)
			return null;
		return child.getPathLeveledAllLinks(path, excludes);
	}
	this.getLeveledAllLinks = function(excludes)
	{
		var depth = this.getDepth(excludes);
		var allLinks = new Array();

		for (var level = 0; level < depth; level++)
		{
			var levelLinks = this.getLevelLinks(level, excludes);
			HybEx.misc.Misc.arrayAppend(allLinks, levelLinks);
		}

		return allLinks;
	}

	// Get all links at the level of a path
	this.getPathLevelLinks = function(path, level, excludes)
	{
		if (path == this.path)
			return this.getLevelLinks(level, excludes);

		var child = this.getDirectChild(path);
		if (child == null)
			return null;
		return child.getPathLevelLinks(path, level, excludes);
	}
	this.getLevelLinks = function(level, excludes)
	{
		if (level <= 0)
		{
			if (level == 0)
				return this.getLinks();
			if (this.parent != null)
				return this.parent.getLevelLinks(level + 1, excludes);
			return null;
		}

		var levelLinks = new Array();
		var children = this.children.values();

		for (var childIndex in children)
		{
			var child = children[childIndex];
			var childPath = child.getPath();
			if (excludes && HybEx.misc.Misc.arrayContains(excludes, childPath))
				continue;

			var childLevelLinks = child.getLevelLinks(level - 1, excludes);
			HybEx.misc.Misc.arrayAppend(levelLinks, childLevelLinks);
		}

		return levelLinks;
	}

	// Get the depth of a path
	this.getPathDepth = function(path, excludes)
	{
		if (path == this.path)
			return this.getDepth(excludes);

		var child = this.getDirectChild(path);
		if (child == null)
			return null;
		return child.getPathDepth(path, excludes);
	}
	this.getDepth = function(excludes)
	{
		var depth = 0;
		var children = this.children.values();

		for (var childIndex in children)
		{
			var child = children[childIndex];
			var childPath = child.getPath();
			if (excludes && HybEx.misc.Misc.arrayContains(excludes, childPath))
				continue;

			var childDepth = child.getDepth();
			if (childDepth > depth)
				depth = childDepth;
		}

		return depth + 1;
	}

	for (var linksIndex in nodeLinks)
	{
		var nodeLink = nodeLinks[linksIndex];
		this.addLink(nodeLink);
	}
}