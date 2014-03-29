/**
 * Stone srairs
 * Allow hero to move up and down 
 */
function BlockLadder() {
	this.pitSprite = { x: 2, y: 1 };
	this.ladderSprite = { x: 9, y: 10 };
	this.walkable = true;
}
extend(BlockLadder,Block);

BlockLadder.prototype.draw = function(x,y) {
	
	if( Block.game.view.y * 12 + y < 12 ) {
		BlockAir.prototype.draw.call(this,x,y,true)
	} else {
		this.sprite = this.pitSprite
		Block.prototype.draw.call(this,x,y,true)
	}

	this.sprite = this.ladderSprite;
	Block.prototype.draw.call(this,x,y)
}
