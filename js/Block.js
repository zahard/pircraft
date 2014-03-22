/**
 * Blocks factory
 */
Block = function(type) {

	var blockClass = 'Block' + type.charAt(0).toUpperCase() + type.slice(1);
	
	var block = new window[blockClass]();
	
	block.type = type;
	
	block.open = Block.defaultOpen;
	
	block.hits = block.hits || 1;

	block.lightSource = block.lightSource || false;
	
	block.defaultBrightness = block.defaultBrightness || 1;

	return block;
}

Block.prototype.walkable = false;

Block.prototype.empty = false;

Block.prototype.brightness = 1;

Block.prototype.cellSize = 40;


Block.prototype.setBrightness = function(b){

	if( b > this.brightness ) {
		this.brightness = b;
		return true;
	}
	return false;
}

Block.prototype.toString = function(){
	var o = this.open ? 1 : 0;
	return {
		o:1,
		b:'air',
		t: 2
	};

	var s = '{';
	s += 't:' +this.type+',';
	s += 'b:'+ this.brightness+',';
	s += 'o:'+ o+'}';
	return s;
}


Block.prototype.toJSON = function() {
	return [1,5,2]

	var o = this.open ? 1 : 0;
	var s = '{';
	s += '"t":"' +this.type+'",';
	s += '"b":'+ this.brightness+',';
	s += '"o":'+ o+'}';
	return s;
}


Block.prototype.draw = function(x,y,alwaysBright) {
	alwaysBright = alwaysBright || false;
	map.drawImage(
		Block.game.sprites['tiles'],  // Sprie image with body and legs
		this.sprite.x * this.cellSize, 
		this.sprite.y * this.cellSize, // Sprite position
		this.cellSize, this.cellSize,  // Sprite image size
		this.cellSize*x, 
		this.cellSize*y, // Place image in this point
		this.cellSize, this.cellSize // IMage size on canvas
	);

	if( ! this.empty ) {
		//return;
	}
	if( ! alwaysBright ) {
		this.drawShadow(x,y);
	}
}


Block.prototype.drawShadow = function(x,y) {

	var sx = 10;
	var sy = 9;
	if( this.brightness == 1 ) {
		sy = 13;
	} else if( this.brightness < 4 ) {
		sy = 12;
	} else if( this.brightness < 6 ) {
		sy = 11;
	} else if( this.brightness < 8  ) {
		sy = 10;
	}
	
	if( sy != 9 ) {	

		map.drawImage(
			Block.game.sprites['tiles'],  // Sprie image with body and legs
			sx * this.cellSize, 
			sy * this.cellSize, // Sprite position
			this.cellSize, this.cellSize,  // Sprite image size
			this.cellSize*x, 
			this.cellSize*y, // Place image in this point
			this.cellSize, this.cellSize // IMage size on canvas
		);
	}
}

Block.defaultOpen = false;
