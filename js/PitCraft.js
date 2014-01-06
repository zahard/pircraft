var cxt,map;

//GLOBALS
var RIGHT_PRESSED = false,
	LEFT_PRESSED  = false,
	HERO_MOVED = false,
	SHIFT_PRESSED = false,
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
	this.dayLight = 0.1 // up to 0.8

	this.hero = new Hero();

	this.keyPressed = false;

	this.blockInHand = 'dirt';

	this.lastFallFrame = 0;
	this.fallTimeout = 50;

	this.init = function() {	
		//Listen for mouse events
		this.addListeners();

		//
		this.drawLevel();

		//Start game
		this.animate();
		

		this.addLight();

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

		for( var x = 2; x < 7; x++) {
			for( var y = 6; y <= 7; y++) {
				this.view[x][y] = new Block('pit');
			}
		}

		for( var x = 11; x < 14; x++) {
			for( var y = 7; y <= 7; y++) {
				this.view[x][y] = new Block('pit');
			}
		}

		
		for( var y = 8; y <= 12; y++) {
			this.view[10][y] = new Block('dirt');
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

		
		//Update visible
		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				var block = this.viewBlock(x,y);
				if( block.type == 'air' ) {
					this.updateVisibility({x:x,y:y})
				}
			}			
		}

		this.lights = [];

		this.view[7][5] = new Block('torch');
		this.view[7][5].open = true;
		this.lights.push({
			x:7,y:5
		});


		for( var x = 18; x < 22; x++) {
			for( var y = 8; y < 11; y++) {
				this.view[x][y] = new Block('pit');
			}
		}
		this.view[19][7] = new Block('pit');
		this.view[20][7] = new Block('pit');


		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				this.drawBlock(x,y);
			}
		}

		Block.defaultOpen = true;

	}

	this.worldLeft = [];
	this.worldRight = [];

	this.shiftWorldRight = function(){
		var f = this.view.shift();
		this.worldLeft.push(f);

		var line = [];
		var wr = this.worldRight.shift();
		if( wr ) {
			line = wr;
		} else {
			for(var i =0; i < 12; i++){
				line.push( new Block('dirt') );
			}
		}

		this.view.push(line);

		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				this.drawBlock(x,y);
			}			
		}
	}


	this.shiftWorldLeft = function(){
		var f = this.view.pop();
		this.worldRight.unshift(f);

		var line = [];
		var wl = this.worldLeft.pop();
		if( wl ) {
			line = wl;
		} else {
			for(var i =0; i < 12; i++){
				line.push( new Block('dirt') );
			}
		}

		this.view.unshift(line);

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

		if( ! block.open ) {
			map.fillStyle = '#26333A';
			map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			return;
		}

		if( block.type == 'stairs') {
			map.fillStyle = '#a82';


			map.fillRect(this.cellSize*x,this.cellSize*y + 3, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 13, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 23, this.cellSize, 4);
			map.fillRect(this.cellSize*x,this.cellSize*y + 33, this.cellSize, 4);

			map.fillRect(this.cellSize*x+2,this.cellSize*y, 4 , this.cellSize);
			map.fillRect(this.cellSize*(x+1)-6,this.cellSize*y, 4 , this.cellSize);
			

		} else {

			if( block.empty == false ) {
				map.fillStyle = '#444';
				map.lineWidth = 1;
				//map.strokeRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			} else if( block.type == 'pit') {
				//map.fillStyle = '#76593C';
				map.fillStyle = this.getBlockColor(block.type,x,y);
				map.lineWidth = 1;
				//map.strokeRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			} else {
				map.fillStyle = this.getBlockColor(block.type,x,y);
				map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
			}

			map.fillStyle = this.getBlockColor(block.type,x,y);
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

	this.recalculateLight = function(){
		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				var block = this.view[x][y];
				if( block.empty ) {
					block.brightness = 0.1;
					this.drawBlock(x,y);
				}
			}			
		}
		this.addLight();
	}

	this.addLight = function() {
		
		// x7  y5
		var l, c,x, min_y, y, d,  sx,sy,cells = [];
		var iteration;

		var directions = [
			{x: 0,y:-1},
			{x: 0,y: 1},
			{x:-1,y: 0},
			{x: 1,y: 0}
		]
		for(var n in this.lights ) {

			l = this.lights[n];
			
			for( var dir in directions ) {

				d = directions[dir];

				for( var level =1 ; level <= 8; level += 1 ) {
					var brightness = (9 - level) * 0.1;
					var orto_length = 8 - level;

					x = l.x + d.x * level;
					y = l.y + d.y * level;

					var beamCell = this.viewBlock(x,y);
					if( ! beamCell.walkable ) {
						break;
					}

					if( beamCell.setBrightness( brightness ) ) {
						
						cells.push({ 
							x: x, 
							y: y, 
							brightness : brightness,
							type: beamCell.type
						});
					}

					orto_x = Math.abs(d.y);
					orto_y = Math.abs(d.x);

					for(var sub_dir = 0; sub_dir <=1 ; sub_dir++) {
						//Switch direction from tight to left
						if( sub_dir == 1 ) {
							orto_x = -orto_x;
							orto_y = -orto_y;
						}

						for( orto = 1; orto <= orto_length; orto++ ) {
						
							sx = l.x + d.x * level + orto_x * orto;
							sy = l.y + d.y * level + orto_y * orto; 

							var subBeamCell = this.viewBlock(sx, sy);
							
							if( ! subBeamCell.walkable ) {
								break;
							}

							sub_brightness = brightness - orto * 0.1;
							if( sub_brightness < 0.1 )
								sub_brightness = 0.1;

							if( subBeamCell.setBrightness( sub_brightness ) ) {
								cells.push({ 
									x: sx, 
									y: sy, 
									brightness : sub_brightness,
									type: subBeamCell.type
								});
							}
						}
					}


				}

			}

			/*
			for( var level = 1; level <= 8; level++) {
				
				min_y = l.y - level;
				y = l.y;
				go_down = false;
				iteration = 0;
				for( var x = l.x - level; x <= l.x + level; x++ ) {
					
					brightness = (9 - level) * 0.1;

					if( this.viewBlock(x,y).empty == true &&
						brightness > this.viewBlock(x,y).brightness )  {
						var s = { x: x, y: y };						
						var r = this.findPath(s,l)
						if( r ) {
							cells.push({ 
								x:s.x, 
								y: s.y, 
								brightness : brightness,
								type: this.view[x][y].type
							});
						}
					}

					if( y != l.y ) {

						if( this.viewBlock(x, y + iteration * 2).empty == true &&
							brightness > this.viewBlock(x,y + iteration * 2).brightness ) {

							//Check if we have straight way to light source
							var s = { x: x, y: (y + iteration * 2) };						

							var r = this.findPath(s,l)
							if( r ) {
								cells.push({ 
									x:s.x,
									y: s.y,
									brightness : brightness,
									type: this.view[x][y+iteration*2].type 
								});
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

			}*/

			
			var cl;
			var brightness;
			for( var i in cells ) {
				c = cells[i];
				
				brightness = c.brightness;

				if( c.type == 'air' ) {
					if( brightness < this.dayLight) {
						brightness = this.dayLight;
					}
				}

				if( c.type == 'air' ) {
					color = HSVtoRGB( 0.5, 0.5, brightness);
				} else {
					color = HSVtoRGB( 0.05, 0.5, brightness);
				}

				map.fillStyle = color;
				map.fillRect( this.cellSize * c.x, this.cellSize * c.y, this.cellSize, this.cellSize );

				this.viewBlock(c.x,c.y).brightness = brightness;
				
			}
		}

	}

	this.addLight__old = function() {
		// x7  y5
		var l, c, min_y, y, cells = [];
		var iteration;
		for(var n in this.lights ) {
			l = this.lights[n];
			
			for( var level = 1; level <= 8; level++) {
				
				min_y = l.y - level;
				y = l.y;
				go_down = false;
				iteration = 0;
				for( var x = l.x - level; x <= l.x + level; x++ ) {
					
					brightness = (9 - level) * 0.1;

					if( this.viewBlock(x,y).empty == true &&
						brightness > this.viewBlock(x,y).brightness )  {
						var s = { x: x, y: y };						
						var r = this.findPath(s,l)
						if( r ) {
							cells.push({ 
								x:s.x, 
								y: s.y, 
								brightness : brightness,
								type: this.view[x][y].type
							});
						}
					}

					if( y != l.y ) {

						if( this.viewBlock(x, y + iteration * 2).empty == true &&
							brightness > this.viewBlock(x,y + iteration * 2).brightness ) {

							//Check if we have straight way to light source
							var s = { x: x, y: (y + iteration * 2) };						

							var r = this.findPath(s,l)
							if( r ) {
								cells.push({ 
									x:s.x,
									y: s.y,
									brightness : brightness,
									type: this.view[x][y+iteration*2].type 
								});
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
				
				brightness = c.brightness;

				if( c.type == 'air' ) {
					if( brightness < this.dayLight) {
						brightness = this.dayLight;
					}
				}

				if( c.type == 'air' ) {
					color = HSVtoRGB( 0.5, 0.5, brightness);
				} else {
					color = HSVtoRGB( 0.05, 0.5, brightness);
				}

				map.fillStyle = color;
				map.fillRect( this.cellSize * c.x, this.cellSize * c.y, this.cellSize, this.cellSize );

				this.viewBlock(c.x,c.y).brightness = brightness;
				
			}
		}

	}


	this.findPath = function(p1,p2) {

		if( p1.x == p2.x) {
			x = p1.x;
			//cehck vertical line
			if( p1.y > p2.y) {
				for(var y = p1.y-1; y > p2.y; y--) {
					if( ! this.view[x][y].empty ) {
						return false;
					}
				}
			} else {
				for(var y = p1.y+1; y < p2.y; y++) {
					if( ! this.view[x][y].empty) {
						return false;
					}
				}
			}

		} else if( p1.y == p2.y) {
			//Cehck horizontal line
			y = p1.y;
			if( p1.x < p2.x) {
				for(var x = p1.x+1; x < p2.x ; x++) {
					if( ! this.view[x][y].empty ) {
						return false;
					}
				}
			} else {
				for(var x = p1.x-1; x > p2.x; x--) {
					if( x >= 0 && ! this.view[x][y].empty ) {
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
						if( ! this.view[x][y].empty ) {
							return false;
						}
					}
				} else {
					for(var y = p1.y-1; y > p2.y; y--) {
						if(x != p2.x) x--;
						if( ! this.view[x][y].empty ) {
							return false;
						}
					}
				}
			} else {
				x = p1.x;

				if( p1.x < p2.x) {
					for(var y = p1.y+1; y < p2.y; y++) {
						if(x != p2.x) x++;
						if( ! this.view[x][y].empty ) {
							return false;
						}
					}
				} else {

					
					for(var y = p1.y+1; y < p2.y; y++) {
						if(x != p2.x) x--;


						if( ! this.view[x][y].empty ) {
							return false;
						}
					}
				} 
			}

		}

		return true;
	}

	this.getBlockColor = function(cell,x,y) {
		if( cell == 'air') {

			var br = this.viewBlock(x,y).brightness;
			if( br < this.dayLight ) {
				br = this.dayLight;
			}

			return HSVtoRGB( 0.5, 0.5, br);


		} else if( cell == 'pit') {
			var br = this.viewBlock(x,y).brightness;
			return HSVtoRGB( 0.05, 0.5, br);
			//return HSVtoRGB( 0.05, 0.5, 0.6);
			
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

			if( block.brightness < old.brightness ) {
				block.brightness = old.brightness
			}

			this.view[ac.x][ac.y] = block;
			this.drawBlock(ac.x,ac.y);

			if( block.type == 'torch') {
				this.lights.push(ac);
				this.addLight();
			}
		}

		this.recalculateLight();
	}

	this.hitBlock = function() {
		if( ! this.hero.activeCell || ! this.hero.activeCell.reachable ) return;
		
		var ac = this.hero.activeCell;
		var block = new Block( ac.y < 6 ? 'air' : 'pit');
		var old = this.view[ac.x][ac.y];
		var old_bright = old.brightness;
		if( block.brightness < old_bright ) {
			block.brightness = old_bright
		}

		this.view[ac.x][ac.y] = block;

		this.updateVisibility(ac);

		this.drawBlock(ac.x,ac.y);

		if( old.type == 'torch') {
			var newLights = [];
			for(var i in this.lights ) {
				if( this.lights[i].x != ac.x && this.lights[i].y != ac.y ) {
					newLights.push(this.lights[i]);
				}
			}
			this.lights = newLights;
			this.recalculateLight();
		}
	}

	this.updateVisibility = function(b) {
		var centerBlock = this.viewBlock(b.x ,b.y);
		
		centerBlock.open = true;

		var check = [
			{x: b.x, y: b.y-1},
			{x: b.x, y: b.y+1},
			{x: b.x-1, y: b.y},
			{x: b.x+1, y: b.y}
		];

		var block;
		var max_brightness = 0.1


		for(var i in check ) {
			block = this.viewBlock( check[i].x, check[i].y );
			if( block.brightness > max_brightness + 0.1) {
				max_brightness = block.brightness - 0.1;
			}

			if( block.type && ! block.open ) {
				block.open = true;
				this.drawBlock( check[i].x, check[i].y )

				if( block.walkable ) {
					this.updateVisibility({
						x: check[i].x,
						y: check[i].y
					});
				}
			}
		}

		centerBlock.brightness = max_brightness;
		
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

				case 32: //SPACE
					//Jump or Climb
					_this.climbUp();
					break;

				case 49: // 1
					_this.blockInHand = 'dirt';
					break;
				case 50: // 2
					_this.blockInHand = 'stone';
					break;
				case 51: // 3
					_this.blockInHand = 'stairs';
					break;
				case 52: // 4
					_this.blockInHand = 'torch';
					break;


				case 69: // E
					_this.hitBlock();
					break;	

				case 70: // F
					_this.insertBlock();
					break;

				case 87: // W
					//_this.moveUp();
					break;

				case 83: // S
					//_this.moveDown();
					break;

				case 16: //SHIFT
					SHIFT_PRESSED = false;
					//_this.hero.speed = _this.hero.walkSpeed;
					break;

				case 68: // D
					//RIGHT_PRESSED = false;
					//_this.moveRight();
					break;
				case 65: // A
					//LEFT_PRESSED = false;
					//_this.moveLeft();
					break;

				case 39: // Look RIGHT
					if( _this.hero.direction == 'right' || SHIFT_PRESSED ) {
						_this.moveRight();
					} else {
						_this.hero.direction  = 'right';
					}

					break;

				case 37: // Look LEFT
					
					if( _this.hero.direction == 'left' || SHIFT_PRESSED ) {
						_this.moveLeft();
					} else {
						_this.hero.direction  = 'left';
					}

					break;

				case 38: //UP
					if( SHIFT_PRESSED ) {
						_this.moveUp();	
					} else {
						_this.hero.lookUp();
					}
					UP_PRESSED = false;
					break;
				case 40: //DOWN
					if( SHIFT_PRESSED ) {
						_this.moveDown();	
					} else {
						_this.hero.lookDown();
					}
					DOWN_PRESSED = false;
					break;
			}

			_this.keyPressed = true;

		});	

		window.addEventListener('keydown',function(e) {
			switch( e.keyCode ) {
				case 16: //SHIFT
					SHIFT_PRESSED = true;
					//_this.hero.speed = _this.hero.runSpeed;
					break;

				case 68: // D 
					RIGHT_PRESSED = true;
					break;
				case 65: // A
					LEFT_PRESSED = true;
					break;

				case 39: // Look RIGHT
					//_this.hero.direction = 'right';
					break;
				case 37: // Look LEFT
					//_this.hero.direction = 'left';
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
		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x + 1, b1.y).walkable,
			b2 = this.hero.fitInCells[1],
			u2 = this.viewBlock(b2.x + 1, b2.y).walkable;

		if( u1 && u2  ||  this.hero.fitInCells.length > 2) {

			this.hero.moveRight();
			/*
			if( b1.x < 18) {
				this.hero.moveRight();
			} else {
				this.shiftWorldRight();
			}*/

			HERO_MOVED = true;
		}
	}

	this.moveLeft = function() {
		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x - 1, b1.y).walkable,
			b2 = this.hero.fitInCells[1],
			u2 = this.viewBlock(b2.x - 1, b2.y).walkable;

		if( u1 && u2  ||  this.hero.fitInCells.length > 2) {
			this.hero.moveLeft();
			/*
			if( b1.x > 3 ) {
				this.hero.moveLeft();
			} else {
				this.shiftWorldLeft();
			}*/
			HERO_MOVED = true;
		}
	}

	this.moveDown = function() {
		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x, b1.y + 1).walkable,
			b2 = null,
			u2 = true;

		//If miner stand on 2 blocks
		if( typeof this.hero.fitInCells[2] !== 'undefined' ) {
			var b2 = this.hero.fitInCells[2];
			var u2 = this.viewBlock(b2.x, b2.y + 1).walkable;
		}

		if( u1 && u2 ) {
			this.hero.moveDown();
			HERO_MOVED = true;
			return true;
		}

		return false;
	}

	this.fallDown = function(){
		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x, b1.y + 1).empty,
			b2 = null,
			u2 = true;

		//If miner stand on 2 blocks
		if( typeof this.hero.fitInCells[2] !== 'undefined' ) {
			var b2 = this.hero.fitInCells[2];
			var u2 = this.viewBlock(b2.x, b2.y + 1).empty;
		}

		if( u1 && u2 ) {
			this.hero.moveDown();
			HERO_MOVED = true;
			return true;
		}

		return false;
	}

	this.moveUp = function() {
		var b1 = this.hero.fitInCells[1],
			t1 = this.hero.fitInCells[2],
		u1 = this.viewBlock(b1.x, b1.y - 1).walkable,
		b2 = null,
		u2 = true;

		//If miner stand on 2 blocks
		if( typeof this.hero.fitInCells[3] !== 'undefined' ) {
			var b2 = this.hero.fitInCells[3];
			var u2 = this.viewBlock(b2.x, b2.y - 1).walkable;
		}

		if( u1 && u2 ) {
			this.hero.moveUp();
			HERO_MOVED = true;
		}
	}

	this.climbUp = function() {
		if( this.hero.fitInCells.length == 2 ) {
			var head = this.hero.fitInCells[1];
			var offset = (this.hero.direction == 'right') ? 1 : -1;
			var climb = this.viewBlock(head.x + offset, head.y + 1 );
			if( ! climb.walkable ) {
				//check if we have free space to climp 
				var
				s1 = this.viewBlock(head.x + offset, head.y),
				s2 = this.viewBlock(head.x + offset, head.y-1),
				s3 = this.viewBlock(head.x, head.y-1);

				if( s1.walkable && s2.walkable && s3.walkable ) {
					this.hero.climbUp();
				}

			}

		}	
	}

	this.viewBlock = function(x, y) {
		if( this.view[x] && this.view[x][y]) {
			return this.view[x][y];
		} else {
			return {};
		}
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
				case 1:
					//By deafult it set to zero
					break;

				case  2:
					ac.y -= 1;

					var bottom_block = this.view[ac.x][ac.y+1];
					var side_block = ( dir == 'right' ) ? this.view[ac.x-1][ac.y] : this.view[ac.x+1][ac.y];
					if( ! bottom_block.walkable  && ! side_block.walkable  ) {
						ac.reachable = false;
					}
					break;

				case  3:
					ac.y -= 1;
					ac.x +=  ( dir == 'right' ) ? -1 : 1;
					break;

				case -1:
					ac.y += 1;
					break;

				case -2:
					ac.y += 2;
					break;				

				case -3:
					ac.y += 2;
					ac.x +=  ( dir == 'right' ) ? -1 : 1;
					break;
			}

			this.hero.activeCell = ac;

			//Check falling
			var b1 = this.hero.fitInCells[0];
			var f1 = this.viewBlock(b1.x, b1.y + 1).empty;
			var f2 = true;
			if( this.hero.fitInCells.length > 2 ) {
				b2 = this.hero.fitInCells[3];
				f2 = this.viewBlock(b2.x, b2.y + 1).empty;
			}

			if( f1 && f2 ) {
				//Check maybe we on stairs
				if( this.viewBlock(b1.x, b1.y).type != 'stairs' )
					this.isFalling = true;
			}
		}

		if( this.isFalling ) {
			var t = new Date().getTime();
			if( t > this.lastFallFrame + this.fallTimeout ) {
				if( ! this.fallDown() ) {
					this.isFalling = false;
				} else {
					this.lastFallFrame = t;
				}
			}
		}
	}

	this.draw = function() {
		this.clearCanvas();
		
		if( this.hero.activeCell ) {
			var c = this.hero.activeCell
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
	this.x = 400;
	this.y = 240;

	this.walkSpeed = 40;
	this.runSpeed = 40;

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

	this.sprites['miner_1'] = $('miner_0');
	this.sprites['miner_2'] = $('miner_1');
	this.sprites['miner_3'] = $('miner_2');
	this.sprites['miner_m1'] = $('miner_m1');
	this.sprites['miner_m2'] = $('miner_m2');
	this.sprites['miner_m3'] = $('miner_m2');

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

	this.climbUp = function() {
		if( this.direction == 'right') {
			this.x += this.speed;
		} else {
			this.x -= this.speed;
		}
		this.y -= 40;
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
	this.open = Block.defaultOpen;
	this.walkable = false;
	this.empty = false;
	this.brightness = 0.1;

	
	if( this.type == 'air' || 
		this.type == 'pit' ||
		this.type == 'stairs' ||
		this.type == 'torch'
		) {
		this.walkable = true;
	}

	if( this.type == 'torch') {
		this.brightness = 0.8;
	}

	if( this.type == 'air' || 
		this.type == 'pit'
		) {
		this.empty = true;
	}

}  
Block.prototype.setBrightness = function(b){
	if( b > this.brightness ) {
		this.brightness = b;
		return true;
	}
	return false;
}

Block.defaultOpen = false;


