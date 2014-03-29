/**
 * Wood block
 * Component of trees that used for craft
 */
function BlockWood() {
	this.sprite = { x: 4, y: 7 };
	this.walkable = true;
}
extend(BlockWood,Block);
