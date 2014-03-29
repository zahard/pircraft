/**
 * Stairs block
 * Allow hero to move up and down 
 */
function BlockStairs() {
	this.pitSprite = { x: 2, y: 1 };
	this.stairsSprite = { x: 3, y: 5 };
	this.walkable = true;
}
extend(BlockStairs,Block);

BlockStairs.prototype.draw = function(x,y) {
	
	if( Block.game.view.y * 12 + y < 12 ) {
		BlockAir.prototype.draw.call(this,x,y,true)
	} else {
		this.sprite = this.pitSprite
		Block.prototype.draw.call(this,x,y,true)
	}

	this.sprite = this.stairsSprite;
	Block.prototype.draw.call(this,x,y)
}
