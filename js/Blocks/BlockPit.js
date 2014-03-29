/*
* Pit block
* This block is same as air but under on ground level. Just a free space
*/
BlockPit = function() {
	this.sprite = { x: 2, y: 1 };
	this.walkable = true;
	this.empty = true;
}
extend(BlockPit, Block);
