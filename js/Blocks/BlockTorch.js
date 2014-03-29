/**
 * Torch / Lamp block
 * Source of light in world
 */
BlockTorch = function() {
	this.brightness = Block.game.maxLight;
	this.pitSprite = { x: 2, y: 1 };
	this.torchSprite = { x: 0, y: 5 };
	this.lightSource = true;
	this.walkable = true;
}
extend(BlockTorch, Block);


BlockTorch.prototype.draw = function(x,y) {

	if( Block.game.view.y * 12 + y < 12 ) {
		BlockAir.prototype.draw.call(this,x,y)
	} else {
		this.sprite = this.pitSprite
		Block.prototype.draw.call(this,x,y)
	}


	this.sprite = this.torchSprite;
	Block.prototype.draw.call(this,x,y)
	/*
	map.drawImage( 
		Block.game.sprites['lamp'],
		this.cellSize*x,
		this.cellSize*y
	);*/
}
