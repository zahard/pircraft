
BlockAir = function() {
	this.sprite = { x: 0, y: 0 };
	this.walkable = true;
	this.empty = true;
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


