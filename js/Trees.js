var Trees = {};

Trees.getTreeBlocks = function(root, treeType) {
	treeType = treeType || 'apple';

	var treeMethod = 'get' + treeType.charAt(0).toUpperCase() + treeType.slice(1) + 'Blocks';
	
	if( typeof Trees[treeMethod] != 'undefined' ) {
		return Trees[treeMethod](root);
	} else {
		return {};
	}
}

Trees.getAppleBlocks = function(root) {
	var blocks = {};
	blocks.wood = [
		{ x: root.x, y: root.y,  },
		{ x: root.x, y: root.y-1 },
		{ x: root.x, y: root.y-2 }
	];
		
	blocks.leaf = [
		{ x: root.x+1, y: root.y-2 },
		{ x: root.x+1, y: root.y-3 },
		{ x: root.x+1, y: root.y-4 },

		{ x: root.x-1, y: root.y-2 },
		{ x: root.x-1, y: root.y-3 },
		{ x: root.x-1, y: root.y-4 },

		{ x: root.x-2, y: root.y-2 },
		{ x: root.x-2, y: root.y-3 },
		{ x: root.x+2, y: root.y-2 },
		{ x: root.x+2, y: root.y-3 },

		{ x: root.x, y: root.y-3 },
		{ x: root.x, y: root.y-4 },
		{ x: root.x, y: root.y-5 }
	];

	return blocks;
}


Trees.getAppleSmallBlocks = function(root) {
	var blocks = {};
	blocks.wood = [
		{ x: root.x, y: root.y }
	];
		
	blocks.leaf = [
		{ x: root.x+1, y: root.y-2 },
		{ x: root.x+1, y: root.y-1 },

		{ x: root.x-1, y: root.y-2 },
		{ x: root.x-1, y: root.y-1 },

		{ x: root.x, y: root.y-3 },
		{ x: root.x, y: root.y-2 },
		{ x: root.x, y: root.y-1 }
	];

	return blocks;
}

Trees.getBerezaBlocks = function(root) {
	var blocks = {};
	blocks.bereza = [
		{ x: root.x, y: root.y,  },
		{ x: root.x, y: root.y-1 },
		{ x: root.x, y: root.y-2 },
		{ x: root.x, y: root.y-3 }
	];
		
	blocks.leaf = [
		{ x: root.x+1, y: root.y-2 },
		{ x: root.x+1, y: root.y-3 },
		{ x: root.x+1, y: root.y-4 },
		{ x: root.x+1, y: root.y-5 },


		{ x: root.x+2, y: root.y-3 },
		{ x: root.x+2, y: root.y-4 },

		{ x: root.x-2, y: root.y-3 },
		{ x: root.x-2, y: root.y-4 },

		{ x: root.x-1, y: root.y-2 },
		{ x: root.x-1, y: root.y-3 },
		{ x: root.x-1, y: root.y-4 },
		{ x: root.x-1, y: root.y-5 },

		{ x: root.x, y: root.y-4 },
		{ x: root.x, y: root.y-5 },
		{ x: root.x, y: root.y-6 }
	];

	return blocks;
}

Trees.getBerezaSmallBlocks = function(root) {
	var blocks = {};
	blocks.bereza = [
		{ x: root.x, y: root.y },
		{ x: root.x, y: root.y-1 },
	];
		
	blocks.leaf = [
		
		{ x: root.x+1, y: root.y-2 },
		{ x: root.x+1, y: root.y-1 },

		{ x: root.x-1, y: root.y-2 },
		{ x: root.x-1, y: root.y-1 },


		{ x: root.x, y: root.y-3 },
		{ x: root.x, y: root.y-2 }

	];

	return blocks;
}


Trees.getOakBlocks = function(root) {
	var blocks = {};
	blocks.oakwood = [
		{ x: root.x, y: root.y },
		{ x: root.x, y: root.y-1 },
		{ x: root.x, y: root.y-2 },
		{ x: root.x, y: root.y-3 },

		{ x: root.x-1, y: root.y-3 },
		{ x: root.x-2, y: root.y-4 },

		{ x: root.x, y: root.y-4 },
		{ x: root.x+1, y: root.y-4 },
		{ x: root.x+2, y: root.y-4 },
		{ x: root.x+2, y: root.y-5 },
	];
		
	blocks.leaf = [
		
		{ x: root.x-1, y: root.y-2 },
		{ x: root.x-2, y: root.y-2 },
		{ x: root.x-2, y: root.y-3 },
		{ x: root.x-3, y: root.y-3 },
		{ x: root.x-3, y: root.y-4 },
		{ x: root.x-3, y: root.y-5 },
		{ x: root.x-3, y: root.y-5 },
		{ x: root.x-2, y: root.y-5 },
		{ x: root.x-2, y: root.y-4 },
		{ x: root.x-1, y: root.y-5 },
		{ x: root.x-1, y: root.y-4 },

		{ x: root.x, y: root.y-7 },	
		{ x: root.x+1, y: root.y-7 },	
		{ x: root.x+1, y: root.y-5 },	

		{ x: root.x, y: root.y-5 },	
		{ x: root.x, y: root.y-6 },	
		{ x: root.x-1, y: root.y-6 },	
		{ x: root.x-2, y: root.y-6 },
		{ x: root.x+1, y: root.y-6 },
		{ x: root.x+2, y: root.y-6 },
		{ x: root.x+3, y: root.y-6 },
		{ x: root.x+3, y: root.y-5 },
		{ x: root.x+3, y: root.y-4 },
		{ x: root.x+2, y: root.y-3 },
		{ x: root.x+1, y: root.y-3 },

	];

	return blocks;
}




