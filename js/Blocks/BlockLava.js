
BlockLava = function() {
	this.sprite = {	x: 15, y: 15 };
	this.hits = 1000;
	this.lavaLevel = 0;
	this.walkable = true;
	this.isLava = true;

	this.defaultBrightness = 6;
}
extend(BlockLava,Block);


BlockLavaFlow = function() {
	this.sprite = {	x: 15, y: 15 };
	this.hits = 1000;
	this.lavaLevel = 0;
	this.walkable = true;
	this.isLava = true;
	this.pitSprite = {
		x: 2,
		y: 1
	}
	this.lavaSprite = {
		x: 15,
		y: 15
	}

	this.flowSprite_1 = { x: 13, y: 10 }
	this.flowSprite_2 = { x: 12, y: 10 }
	this.flowSprite_3 = { x: 11, y: 10 }

	this.defaultBrightness = 6;
}
extend(BlockLavaFlow,Block);


BlockLavaFlow.prototype.draw = function(x,y) {

	if( Block.game.view.y * 12 + y < 12 ) {
		BlockAir.prototype.draw.call(this,x,y)
	} else {
		this.sprite = this.pitSprite
		Block.prototype.draw.call(this,x,y)
	}

	this.sprite	= this.lavaSprite;
	map.save();

	if( this.lavaFlow != 'v') {

		var fx = x;
		if( this.lavaFlow == 'right') {
			map.translate(Block.game.width, 0);
			map.scale(-1, 1);
			fx = Block.game.width/this.cellSize - 1- x;
		}
		
		this.sprite	= this['flowSprite_' + this.lavaLevel];
		Block.prototype.draw.call(this,fx,y)
		
	} else {
		Block.prototype.draw.call(this,x,y)
	}

	map.restore();
}

