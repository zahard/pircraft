Hero = function(x,y,game) {

	this.x = x;
	this.y = y;
	this.game = game;

	this.walkSpeed = 4;
	this.runSpeed = 8;

	this.framesFreq = 9;
	this.currentFrame = 0;

	this.speed = this.walkSpeed;
	
	this.cellSize = 40;
	
	this.tall   = 1.2 * this.cellSize;
	this.headW   = 0.7 * this.cellSize;
	this.headH   = 0.8 * this.cellSize;
	this.half   = this.cellSize/2;
	
	this.look = 1;


	var RIGHT = 'right',
		LEFT = 'left';

	this.direction = RIGHT;

	this.sprites = [];

	this.sprites['miner_legs'] = $('miner_legs');
	this.sprites['miner_hand'] = $('miner_hand');
	this.sprites['miner_head'] = $('miner_head');

	this.runFrame = 0;

	this.draw = function() {
		var place_x = this.x;
		var place_y = this.y - this.cellSize * 2;
		
		//cxt.save();
		//cxt.fillStyle = 'green';
		//cxt.fillRect(place_x,place_y,this.cellSize,this.cellSize*2);

		if( this.activeCell ) {
		//	this.drawPointer();
		}

		//cxt.restore();
		//return;

		var img_hand = this.sprites['miner_hand'];
		var img_legs = this.sprites['miner_legs'];
		var img_head = this.sprites['miner_head'];

		var sprite_x = this.runFrame * 40;
		var sprite_y = 0;

		var oss = ( this.look < 0 ) ? 40 : 0;

		var spriteHead_x =  - ( this.look  - 3 ) * 40  - oss;

		
		cxt.save();
		
		
		//Boby with legs, used us backgound for another part of body
		this.drawSprite(img_legs, sprite_x, sprite_y)

		//Hand
		this.drawSprite(img_hand, sprite_x, sprite_y);

		//Head
		this.drawSprite(img_head, spriteHead_x, sprite_y);



		if( this.activeCell ) {
			this.drawPointer();
		}

		cxt.restore();

	}

	this.drawSprite = function( sprite , sx, sy, px, py) {
		var place_x = this.x;
		var place_y = this.y - this.cellSize * 2;
		if( typeof px != 'undefined' ) {
			place_x = px;
		}
		if( typeof py != 'undefined' ) {
			place_y = py;
		}

		cxt.save();

		if (this.direction == 'left' ) {
			cxt.translate(this.game.width, 0);
			cxt.scale(-1, 1);
			place_x = this.game.width - 40 - place_x;
		}

		cxt.drawImage( 
			sprite,  // Sprie image with body and legs
			sx, sy, // Sprite position
			this.cellSize, this.cellSize * 2,  // Sprite image size
			place_x, place_y, // Place image in this point
			this.cellSize, this.cellSize * 2 // IMage size on canvas
		);

		cxt.restore();
	}

	this.drawPointer = function() {
		var c = this.activeCell;
			var color = c.reachable ? 'green' : 'orange';
			cxt.save();
			cxt.strokeStyle = color;
			cxt.lineWidth = 1;
			//cxt.strokeRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);

			var x = this.cellSize*c.x;
			var y = this.cellSize*c.y;
			var x2 = this.cellSize * (c.x+1);
			var y2 = this.cellSize * (c.y+1);

			cxt.beginPath();
			cxt.lineWidth = 2;
			
			cxt.moveTo( x, y );
			cxt.lineTo( x+10, y );
			cxt.moveTo( x, y );
			cxt.lineTo( x, y+10);

			cxt.moveTo( x, y2 );
			cxt.lineTo( x+10, y2 );
			cxt.moveTo( x, y2 );
			cxt.lineTo( x, y2-10);

			cxt.moveTo( x2, y );
			cxt.lineTo( x2-10, y );
			cxt.moveTo( x2, y );
			cxt.lineTo( x2, y+10);

			cxt.moveTo( x2, y2 );
			cxt.lineTo( x2-10, y2 );
			cxt.moveTo( x2, y2 );
			cxt.lineTo( x2, y2-10);

			cxt.closePath();
			cxt.stroke();

			cxt.strokeStyle = '#fff';
			cxt.beginPath();

			cxt.moveTo( x + 20, y + 14);
			cxt.lineTo( x + 20, y + 26);

			cxt.moveTo( x + 14, y + 20);
			cxt.lineTo( x + 26, y + 20);

			cxt.closePath();
			cxt.stroke();


			cxt.fillStyle = color;
			cxt.globalAlpha = 0.2;
			
			cxt.fillRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);

			cxt.restore();

	}

	this.lookUp = function() {
		if( this.look == -1)
			this.look = 1;
		else if(this.look < 3)
			this.look++;
	}

	this.lookDown = function() {
		if( this.look == 1)
			this.look = -1;
		else if(this.look > -3)
			this.look--;
	}

	this.moveUp = function() {
		this.y -= 40;
		this.lastMoveV = 'up';
	}

	this.moveDown = function() {
		this.y += 20;
		this.lastMoveV = 'down';
	}

	this.fallDown = function() {
		this.y += 10;
		this.lastMoveV = 'down';
	}

	this.jumpStep = function() {
		this.y -= 5;
	}


	
	this.moveLeft = function() {
		this.x -= this.speed;
	}

	this.moveRight = function() {
		this.x += this.speed;
	}

	this.climbUp = function() {
		return;
		if( this.direction == 'right') {
			this.x += this.speed*3;
		} else {
			this.x -= this.speed*3;
		}
		this.y -= 40;
	}
}
