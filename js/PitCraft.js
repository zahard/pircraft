var cxt,map;

//GLOBALS
var RIGHT_PRESSED = false,
	LEFT_PRESSED  = false,
	HERO_MOVED = false,
	JUMP_PRESSED  = false;

(function(){

window.addEventListener('load', function() {
	window.PitCraftGame = new PitCraft();
	PitCraftGame.init();
}, false);

function PitCraft() {	
	var _this = this,
		canvas = $("canvas"),
		mCanvas = $("mapCanvas");

	this.width  = 960;
	this.height = 480;

	this.cellSize = 40;
	this.cellsX = this.width  / this.cellSize;
	this.cellsY = this.height / this.cellSize;

	canvas.width  = this.width;
	canvas.height = this.height;
	cxt = canvas.getContext("2d");

	mCanvas.width  = this.width;
	mCanvas.height = this.height;
	map = mCanvas.getContext("2d");

	//Holder for mouse events
	this.mouse = { x: 0, y: 0, clicked: false };


	this.prevDayLight = 0.7 // up to 0.8
	this.dayLight = 0.8 // up to 0.8

	this.hero = new Hero();

	this.keyPressed = false;

	this.blockInHand = 'stairs';

	this.init = function() {	
		//Listen for mouse events
		this.addListeners();

		//
		this.drawLevel();

		//Start game
		this.animate();
		
		this.dayLight = 0.8

		//this.addLight();

		/*
		setInterval(function() {
			if( _this.dayLight > _this.prevDayLight ) {
				if( _this.dayLight < 0.8 ) {
					_this.setDayLight( _this.dayLight + 0.1 );
				} else {
					_this.setDayLight( _this.dayLight - 0.1 );
				}
			} else {
				if( _this.dayLight > 0.1 ) {
					_this.setDayLight( _this.dayLight - 0.1 );
				} else {
					_this.setDayLight( _this.dayLight + 0.1 );
				}
			}

		},5000);*/
	}

	this.drawLevel = function() {
		this.world = [];
		this.chunkSize = 6; // 36 blocks per chunh
		this.worldHeight = 6 * this.chunkSize;
		this.worldWidth = 12 * this.chunkSize;

		//View port is 24 x 12 block ( maximum 5 x 3 chunks showed )
		this.view = [];

		var cell;
		for(var x = 0; x < 24; x += 1) {
			this.view[x] = [];
			for(var y = 0; y < 12; y += 1) {
				cell = new Block('dirt');
				if( y < 6 ) {
					cell = new Block('air');	
				} else if( y == 6) {
					cell = new Block('grass');
				}
				this.view[x][y] = cell;
			}			
		}

			
		for( var x = 2; x < 14; x++) {
			for( var y = 8; y < 11; y++) {
				this.view[x][y] = new Block('pit');
			}
		}

		for( var x = 2; x < 6; x++) {
			for( var y = 6; y <= 7; y++) {
				this.view[x][y] = new Block('pit');
			}
		}

		for( var x = 11; x < 14; x++) {
			for( var y = 6; y <= 7; y++) {
				this.view[x][y] = new Block('pit');
			}
		}


		for( var x = 17; x < 24; x++) {
			for( var y = 0; y <= 7; y++) {
				this.view[x][y] = new Block('dirt');
			}
		}

		this.view[17][5] = new Block('grass');
		this.view[18][4] = new Block('grass');
		this.view[19][3] = new Block('grass');
		this.view[19][2] = new Block('grass');
		this.view[20][1] = new Block('grass');
		this.view[21][0] = new Block('grass');
		this.view[22][0] = new Block('grass');

		for( var y = 0; y <= 4; y++) { this.view[17][y] = new Block('air');}

		for( var y = 0; y <= 3; y++) { this.view[18][y] = new Block('air');}

		for( var y = 0; y <= 1; y++) { this.view[19][y] = new Block('air');}
		
		this.view[20][0] = new Block('air');


		/*
		this.view[7][3] = new Block('stone');
		this.view[8][3] = new Block('stone');
		this.view[9][3] = new Block('stone');
		this.view[10][3] = new Block('stone');
		this.view[11][3] = new Block('stone');
		*/	
		
		/*
		this.view[18][5] = new Block('wood');
		this.view[18][4] = new Block('wood');
		this.view[18][3] = new Block('wood');
		this.view[18][2] = new Block('leaf');
		this.view[18][1] = new Block('leaf');
		this.view[17][2] = new Block('leaf');
		this.view[19][2] = new Block('leaf');
		this.view[17][3] = new Block('leaf');
		this.view[19][3] = new Block('leaf');
	*/

		this.lights = [];

		this.view[7][5] = new Block('torch');
		this.lights.push({
			x:7,y:5
		});

	

		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				this.drawBlock(x,y);
			}			
		}

	}

	this.redrawAir = function() {
		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				var block = this.view[x][y];
				if( block.type == 'air' ) {
					map.fillStyle = this.getBlockColor(block.type,y);
					map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				}
			}			
		}
	}

	this.drawBlock = function(x,y) {
		var block = this.view[x][y];

		if( block.type == 'stairs') {
			map.fillStyle = '#a82';


			map.fillRect(this.cellSize*x,this.cellSize*y + 3, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 13, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 23, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 33, this.cellSize, 4);

			map.fillRect(this.cellSize*x+2,this.cellSize*y, 4 , this.cellSize);
			map.fillRect(this.cellSize*(x+1)-6,this.cellSize*y, 4 , this.cellSize);
			

		} else {

			if( block.walkable == false ) {
				map.fillStyle = '#444';
				map.lineWidth = 1;
				//map.strokeRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			} else if( block.type == 'pit') {
				map.fillStyle = '#76593C';
				map.lineWidth = 1;
				//map.strokeRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			} else {
				map.fillStyle = this.getBlockColor(block.type,y);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			}
			map.fillStyle = this.getBlockColor(block.type,y);
			map.fillRect(this.cellSize*x + 1,this.cellSize*y + 1,this.cellSize - 2,this.cellSize - 2);
		}
	}

	var c = {};
	c['air']   = HSVtoRGB( 0.5, 0.5, this.dayLight);
	c['pit']   = HSVtoRGB( 0.5, 0.1, this.dayLight);
	c['grass'] = '#22B31B';
	c['dirt']  = '#BA9F6E';
	c['stone'] = '#918D81';
	c['wood']  = '#703E06';
	c['leaf']  = '#3FDB37';		
	c['torch']  = 'orange';		
	
	this.colors = c;

	this.setDayLight = function(brightness){
		this.prevDayLight = this.dayLight;
		this.dayLight = brightness;
		this.colors['air'] = HSVtoRGB( 0.5, 0.5, this.dayLight);

		this.redrawAir();
		this.addLight();
	}

	this.addLight = function() {
		// x7  y5
		var l, c, min_y, y, cells = [];
		
		for(var n in this.lights ) {
			l = this.lights[n];
			
			for( var level = 1; level <= 8; level++) {
				min_y = l.y - level;
				y = l.y;
				go_down = false;
				iteration = 0;
				for( var x = l.x - level; x <= l.x + level; x++ ) {

					if( this.view[x] && this.view[x][y] && this.view[x][y].walkable == true)  {
						var s = { x: x, y: y };						
						var r = this.findPath(s,l)
						if( r ) {
							cells.push( { x:s.x, y: s.y, level: level, type: this.view[x][y].type} );
						}
					}

					if( y != l.y ) {
						if( this.view[x] && this.view[x][y+iteration*2] && this.view[x][y+iteration*2].walkable == true) {
							//Check if we have straight way to light source
							var s = { x: x, y: (y + iteration * 2) };						

							var r = this.findPath(s,l)
							if( r ) {
								cells.push( { x:s.x, y: s.y, level: level, type: this.view[x][y+iteration*2].type } );
							}

						}
					}

					if( y == min_y ) {
						go_down = true;
					}

					if( go_down ) {
						y++;
						iteration--;
					} else {
						y--;
						iteration++;
					}

				}

			}

			var cl;
			var brightness;
			for( var i in cells ) {
				c = cells[i];
				brightness = (9 - c.level) * 0.1;
				if( brightness < this.dayLight) {
					brightness = this.dayLight;
				}
				color = HSVtoRGB( 0.5, c.type == 'air' ?  0.5: 0.1, brightness);
			
				map.fillStyle = color;
				map.fillRect( this.cellSize * c.x, this.cellSize * c.y, this.cellSize, this.cellSize );
			}
		}

	}


	function HSVtoRGB(h, s, v) {
	    var r, g, b, i, f, p, q, t;
	    if (h && s === undefined && v === undefined) {
	        s = h.s, v = h.v, h = h.h;
	    }
	    i = Math.floor(h * 6);
	    f = h * 6 - i;
	    p = v * (1 - s);
	    q = v * (1 - f * s);
	    t = v * (1 - (1 - f) * s);
	    switch (i % 6) {
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }

	    var c = {
	        r: Math.floor(r * 255),
	        g: Math.floor(g * 255),
	        b: Math.floor(b * 255)
	    };

	    return 'rgb('+c.r+','+c.g+','+c.b+')';
	}

	this.findPath = function(p1,p2) {

		if( p1.x == p2.x) {
			x = p1.x;
			//cehck vertical line
			if( p1.y > p2.y) {
				for(var y = p1.y-1; y > p2.y; y--) {
					if( this.view[p1.x][y].type != 'air') {
						return false;
					}
				}
			} else {
				for(var y = p1.y+1; y < p2.y; y++) {
					if( this.view[p1.x][y].type != 'air') {
						return false;
					}
				}
			}

		} else if( p1.y == p2.y) {
			//Cehck horizontal line
			y = p1.y;
			if( p1.x < p2.x) {
				for(var x = p1.x+1; x < p2.x ; x++) {
					if( this.view[x][y].type != 'air') {
						return false;
					}
				}
			} else {
				for(var x = p1.x-1; x > p2.x; x--) {
					if( x >= 0 && this.view[x][y].type != 'air') {
						return false;
					}
				}
			}
		} else {

			if( p1.y > p2.y ) {
				x = p1.x;
				if( p1.x < p2.x) {
					for(var y = p1.y-1; y > p2.y; y--) {
						if(x != p2.x) x++;
						if( this.view[x][y].type != 'air') {
							return false;
						}
					}
				} else {
					for(var y = p1.y-1; y > p2.y; y--) {
						if(x != p2.x) x--;
						if( this.view[x][y].type != 'air') {
							return false;
						}
					}
				}
			} else {
				x = p1.x;

				if( p1.x < p2.x) {
					for(var y = p1.y+1; y < p2.y; y++) {
						if(x != p2.x) x++;
						if( this.view[x][y].type != 'air') {
							return false;
						}
					}
				} else {

					
					for(var y = p1.y+1; y < p2.y; y++) {
						if(x != p2.x) x--;


						if( this.view[x][y].type != 'air') {
							return false;
						}
					}
				} 
			}

		}

		return true;
	}

	this.getBlockColor = function(cell,y) {
		if( cell == 'air') {
			return HSVtoRGB( 0.5, 0.5, this.dayLight);
		} else if( cell == 'pit') {
			return HSVtoRGB( 0.05, 0.5, 0.6);
			//return HSVtoRGB( 0.5, 0.1, 0.7);
		}
		 else {
			return this.colors[cell];
		}
	}

	this.insertBlock = function() {
		if( ! this.hero.activeCell || ! this.hero.activeCell.reachable ) return;

		var ac = this.hero.activeCell;
		var old = this.view[ac.x][ac.y];
		if( old.type == 'air' || old.type == 'pit') {
			var block = new Block( this.blockInHand );
			this.view[ac.x][ac.y] = block;
			this.drawBlock(ac.x,ac.y);
		}
		//this.addLight();
	}

	this.hitBlock = function() {
		if( ! this.hero.activeCell || ! this.hero.activeCell.reachable ) return;
		
		var ac = this.hero.activeCell;
		this.view[ac.x][ac.y] = new Block( ac.y < 6 ? 'air' : 'pit');
		this.drawBlock(ac.x,ac.y);
		//this.addLight();		
	}

	this.addListeners = function() {
		/*
		window.addEventListener('mousemove',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
		});

		window.addEventListener('click',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
			_this.mouse.clicked = true;
		});

		window.addEventListener('mousedown',function(e) {
			_this.mouse.x = e.clientX;
			_this.mouse.y = e.clientY;
			_this.mouse.down = true;
		});	

		window.addEventListener('mouseup',function(e) {
			_this.mouse.up = true;
		});*/

		window.addEventListener('keyup',function(e) {			
			var ESC = 27;

			switch( e.keyCode ) {
				case ESC:
					_this.pauseGame(e);
					break;

				case 69: // E
					_this.hitBlock();
					break;	

				case 70: // F
					_this.insertBlock();
					break;

				case 87: // W
					_this.moveUp();
					break;
				case 83: // S
					_this.moveDown();
					break;

				case 16: //SHIFT
					SHIFT_PRESSED = false;
					_this.hero.speed = _this.hero.walkSpeed;
					break;

				case 68: // D
					RIGHT_PRESSED = false;
					_this.moveRight();
					break;
				case 65: // A
					LEFT_PRESSED = false;
					_this.moveLeft();
					break;

				case 38: //UP
					_this.hero.lookUp();
					UP_PRESSED = false;
					break;
				case 40: //DOWN
					_this.hero.lookDown();
					DOWN_PRESSED = false;
					break;
			}

			_this.keyPressed = true;

		});	

		window.addEventListener('keydown',function(e) {
			switch( e.keyCode ) {
				case 16: //SHIFT
					SHIFT_PRESSED = true;
					_this.hero.speed = _this.hero.runSpeed;
					break;

				case 68: // D 
					RIGHT_PRESSED = true;
					break;
				case 65: // A
					LEFT_PRESSED = true;
					break;

				case 39: // Look RIGHT
					_this.hero.direction = 'right';
					break;
				case 37: // Look LEFT
					_this.hero.direction = 'left';
					break;

				case 38: //Look UP
					UP_PRESSED = true;
					break;
				case 40: //Look DOWN
					DOWN_PRESSED = true;
					break;
			}
		});	
	}

	this.moveRight = function() {
		this.hero.moveRight();
		HERO_MOVED = true;
	}

	this.moveLeft = function() {
		this.hero.moveLeft();
		HERO_MOVED = true;
	}

	this.moveDown = function() {
		var b1 = this.hero.fitInCells[0],
			u1 = this.view[b1.x][b1.y+1].walkable,
			b2 = null,
			u2 = true;

		if( typeof this.hero.fitInCells[2] !== 'undefined'	 ) {
			var b2 = this.hero.fitInCells[2];
			var u2 = this.view[b2.x][b2.y+1].walkable;
		}

		if( u1 && u2 ) {
			this.hero.moveDown();
			HERO_MOVED = true;
		}

	}

	this.moveUp = function() {
		this.hero.moveUp();
		HERO_MOVED = true;
	}

	this.pauseGame = function(e) {
		if( _this.isPaused ) {
			_this.isPaused = false;
			_this.animate();
		} else {
			_this.isPaused = true;
			cxt.save();
			cxt.globalAlpha = 0.7;
			cxt.fillStyle = '#333';
			cxt.fillRect(0,0,this.width,this.height);
			cxt.globalAlpha = 1;
			cxt.fillStyle = '#fff'
			cxt.font = '40px Impact';
			var text = 'P A U S E D'
			cxt.fillText(text, this.width/2 - cxt.measureText(text).width/2, this.height/2 + 20);
			cxt.restore();
		}
	}

	this.animate = function() {
		if( _this.isPaused )
			return;

		_this.update();
		_this.draw();
		requestAnimationFrame(_this.animate)
	}

	this.update = function() {
		
		NEED_UPDATE = false;
		if( this.keyPressed ) {
			this.keyPressed = false;
			NEED_UPDATE = true;
		}

		if( NEED_UPDATE || HERO_MOVED ) {
			HERO_MOVED = false;
		
			if( this.keyPressed ) this.keyPressed = false;

			//Move our hero
			if( LEFT_PRESSED ) {
				//this.hero.x -= this.hero.speed;
			} else if( RIGHT_PRESSED ) {
				//this.hero.x += this.hero.speed;
			}

			// Клетки занятые нашим игроком 
			//обычно 4, или 2 если точно в пределах блока стоит
			var diff = this.hero.x % 40;
			var cells = [];
			if( diff == 0 ) {
				var c1 = {
					x : this.hero.x / 40,
					y : this.hero.y / 40 -1	
				};
				var c2 = { x: c1.x, y: c1.y-1};
				cells.push(c1);
				cells.push(c2);
			} else {
				var c1 = {
					x : parseInt( this.hero.x / 40 ),
					y : this.hero.y / 40 -1 	
				};
				
				if( diff >= 20 ) {
					c1.x++;
				}

				var c2 = { x: c1.x, y: c1.y-1};
				
				if( diff >= 20 ) {
					var c3 = { x: c1.x-1, y: c1.y};					
					var c4 = { x: c2.x-1, y: c2.y};					
				}else {
					var c3 = { x: c1.x+1, y: c1.y};	
					var c4 = { x: c2.x+1, y: c2.y};		
				}

				cells.push(c1);
				cells.push(c2);
				cells.push(c3);
				cells.push(c4);
			}

			this.hero.fitInCells = cells;
			//Detecting active cell

			var dir = this.hero.direction;
			var freespace = null;
			var ac = null; // Active cell
			if( c3 ) {
				if( c3.x < c1.x ) {
					freespace = 'left';
				} else {
					freespace = 'right'
				}
			}

			if( dir == 'right' ) {
				if( freespace == 'right') {
					ac = { x: c4.x+1, y: c4.y };
				} else {
					ac = { x: c2.x+1, y: c2.y };
				}

			} else {
				if( freespace == 'left') {
					ac = { x: c4.x-1, y: c4.y };
				} else {
					ac = { x: c2.x-1, y: c2.y };
				}
			}

			ac.reachable = true;
			
			switch( this.hero.look ) {
				case  1:
					ac.y -= 1;

					var bottom_block = this.view[ac.x][ac.y+1];
					var side_block = ( dir == 'right' ) ? this.view[ac.x-1][ac.y] : this.view[ac.x+1][ac.y];
					if( ! bottom_block.walkable  && ! side_block.walkable  ) {
						ac.reachable = false;
					}
					break;

				case -1:
					ac.y += 1;
					break;

				case  2:
					ac.y -= 1;
					ac.x +=  ( dir == 'right' ) ? -1 : 1;
					break;

				case -2:
					ac.y += 2;
					ac.x +=  ( dir == 'right' ) ? -1 : 1;
					break;
			}

			this.hero.activeCell = ac;
		}
	}

	this.draw = function() {
		this.clearCanvas();
		
		var c ;
		
		/*
		for(var i in this.hero.fitInCells ) {
			c = this.hero.fitInCells[i];
			cxt.save();
			cxt.strokeStyle = 'red';
			cxt.lineWidth = 1;
			cxt.strokeRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);
			cxt.fillStyle = 'red';
			cxt.globalAlpha = 0.2;
			cxt.fillRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);
			cxt.restore();
			
		} */

		if( this.hero.activeCell ) {
			c = this.hero.activeCell
			var color = c.reachable ? 'green' : 'orange';
			cxt.save();
			cxt.strokeStyle = color
			cxt.lineWidth = 1;
			cxt.strokeRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);
			cxt.fillStyle = color;
			cxt.globalAlpha = 0.2;
			cxt.fillRect(this.cellSize*c.x,this.cellSize*c.y,this.cellSize,this.cellSize);
			cxt.restore();	
		}

		this.hero.draw();
	}

	
	this.trigger = function(event) {
		if( typeof this.subscribers != 'undefined' && typeof this.subscribers[event] != 'undefined' ) {
			for(var i in this.subscribers[event]) {
				this.subscribers[event][i].call()
			}
		}
	}

	this.on = function(event, handler) {
		if( typeof this.subscribers == 'undefined' )
			this.subscribers = {};

		if( typeof this.subscribers[event] == 'undefined' )
			this.subscribers[event] = [];

		this.subscribers[event].push(handler);
	}

	this.clearCanvas = function() {
		cxt.clearRect(0, 0, this.width, this.height);
	}
	
}
})()

Hero = function() {
	this.x = 380;
	this.y = 240;

	this.walkSpeed = 20;
	this.runSpeed = 40;

	this.speed = this.walkSpeed;
	
	this.cellSize = 40;
	
	this.tall   = 1.2 * this.cellSize;
	this.headW   = 0.7 * this.cellSize;
	this.headH   = 0.8 * this.cellSize;
	this.half   = this.cellSize/2;
	
	this.look = 0;


	var RIGHT = 'right',
		LEFT = 'left';


	this.direction = RIGHT;

	this.sprites = [];

	this.sprites['miner_0'] = $('miner_0');
	this.sprites['miner_1'] = $('miner_1');
	this.sprites['miner_2'] = $('miner_2');
	this.sprites['miner_m1'] = $('miner_m1');
	this.sprites['miner_m2'] = $('miner_m2');

	this.draw = function() {

		cxt.save();
		
		var sprite = 'miner_' + this.look + '';
		sprite = sprite.replace('-','m');

		var img = this.sprites[sprite];

		if(this.direction == 'left') {
			cxt.translate(960, 0);
			cxt.scale(-1, 1); 
			cxt.drawImage(img, 920 - this.x, this.y - this.cellSize * 2);
		} else {
			cxt.drawImage(img, this.x, this.y - this.cellSize * 2);
		}

		cxt.restore();

		return;
		
		cxt.fillStyle = '#333';
		cxt.fillRect(
			this.x,
			this.y - this.tall,
			this.cellSize,
			this.tall
		);

		cxt.save();

		cxt.translate(this.x + this.half, this.y - 1.45 * this.cellSize );

		var angles = {
			'-2': - Math.PI / 2.2,
			'-1' : - Math.PI / 6,
			'0': 0,
			'1' : Math.PI / 6,
			'2' : Math.PI / 2.2
		}

		var angle = angles[this.look]

		if( this.direction == 'right') {
			angle = - angle
		}

		cxt.rotate( angle );

		cxt.fillStyle = '#fc0';
		cxt.fillRect(
			this.headH/ -2,
			this.headW/-2,
			this.headH,
			this.headW
		);

		cxt.fillStyle = '#333';
		if(this.direction == 'left') {
			cxt.fillRect( this.headW/-2 + 4, this.headH/-2 + 4,8,8);
		}
		else {
			cxt.fillRect(4,this.headH/-2 + 4,8,8);	
		}
		cxt.restore();

		
		
	}

	this.lookUp = function() {
		if( this.look <  2) this.look++;
	}

	this.lookDown = function() {
		if( this.look > -2) this.look--;
	}

	this.moveUp = function() {
		this.y -= 40;
	}

	this.moveDown = function() {
		this.y += 40;
	}

	this.moveLeft = function() {
		this.x -= this.speed;
	}

	this.moveRight = function() {
		this.x += this.speed;
	}
}


Block = function(type) {
	this.type = type;
	var
	AIR   = 1,
	GRASS = 2
	DIRT  = 3,
	STONE = 4,
	WOOD  = 5,
	LEAF  = 6,
	TORCH = 7;
	this.walkable = false;
	if( this.type == 'air' || this.type == 'pit') {
		this.walkable = true;
	}

}  


