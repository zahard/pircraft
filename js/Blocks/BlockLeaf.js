/**
 * Leaf block
 * Component of trees
 */
function BlockLeaf() {
	this.sprite = { x: 5, y: 3 };
	this.walkable = true;
}
extend(BlockLeaf, Block);
