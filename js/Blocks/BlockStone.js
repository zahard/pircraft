/**
 * Stone block
 * One of basic blocks in world
 */
BlockStone = function() {
	this.sprite = { x: 1, y: 0 };
	this.hits = 1;
}
extend(BlockStone,Block);
