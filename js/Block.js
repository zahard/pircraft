Block = function(type) {
	this.type = type;

	var blockClass = 'Block' + type.charAt(0).toUpperCase() + type.slice(1);

	
	var block = new window[blockClass]();
	
	block.type = type;

	if( ! block.hits) {
	}
	block.hits = 1;


	if( ! block.lightSource ) {
		this.lightSource = false;
	}

	if( ! block.defaultBrightness ) {
		block.defaultBrightness = 1;
	}

	block.cellSize = Block.game.cellSize;

	block.open = Block.defaultOpen;
	//block.open = true;
	
	block.walkable = false;
	block.empty = false;
	block.brightness = 1;

	
	if( this.type == 'air' || 
		this.type == 'pit' ||
		this.type == 'stairs' ||
		this.type == 'lava' ||
		this.type == 'lavaFlow' ||
		this.type == 'torch'
		) {
		block.walkable = true;
	}

	if( this.type == 'torch') {
		block.brightness = Block.game.maxLight;
	}

	if( this.type == 'lava' || this.type == 'lavaFlow') {
		block.brightness = 6;
	}

	if( this.type == 'air' || 
		this.type == 'pit'
		) {
		block.empty = true;
	}
	return block;
}
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



BlockAir = function() {
	this.sprite = {
		x: 0,
		y: 0
	}
}
extend(BlockAir,Block);
BlockAir.prototype.draw = function(x,y,fullLight) {
	fullLight = fullLight || false;

	var min_br = Block.game.dayLight/10;
	var max =  Block.game.maxLight;
	var br = 0.8
	if( ! fullLight ) {
		if( this.brightness == max ) {
			br = 0.8;
		} else if( this.brightness == 1) {
			br = 0.1;
		} else {
			br = this.brightness * 7 / 100;
		}
	}

	if( br < min_br ) {
		br = min_br;
	}

	map.fillStyle = HSVtoRGB( 0.5, 0.5, br);;
	map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
	
}


BlockDirt = function() {
	this.sprite = {
		x: 2,
		y: 0
	}
}
extend(BlockDirt,Block);



BlockGrass = function() {
	this.sprite = {
		x: 3,
		y: 0
	}
}
extend(BlockGrass,Block);



BlockTorch = function() {
	this.pitSprite = {
		x: 2,
		y: 1
	}
	this.torchSprite = {
		x: 0,
		y: 5
	}
	this.lightSource = true;
}
extend(BlockTorch,Block);
BlockTorch.prototype.draw = function(x,y) {

	if( Block.game.view.y * 12 + y < 12 ) {
		BlockAir.prototype.draw.call(this,x,y)
	} else {
		this.sprite = this.pitSprite
		Block.prototype.draw.call(this,x,y)
	}


	//this.sprite = this.torchSprite;
	//Block.prototype.draw.call(this,x,y)
	
	map.drawImage( 
		Block.game.sprites['lamp'],
		this.cellSize*x,
		this.cellSize*y
	);

}



BlockPit = function() {
	this.sprite = {
		x: 2,
		y: 1
	}
}
extend(BlockPit,Block);



BlockStone = function() {
	this.sprite = { x: 1, y: 0 };
	this.hits = 5;
}
extend(BlockStone,Block);



BlockStairs = function() {
	this.pitSprite = {
		x: 2,
		y: 1
	}
	this.stairsSprite = {
		x: 3,
		y: 5
	}
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



BlockObsidian = function() {
	this.sprite = {	x: 5, y: 2 };
	this.hits = 100;
}
extend(BlockObsidian,Block);

