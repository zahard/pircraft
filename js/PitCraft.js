var cxt,map, miniMap,gCxt;

//GLOBALS
var RIGHT_PRESSED = false,
	LEFT_PRESSED  = false,
	HERO_MOVED = true,
	SHIFT_PRESSED = false,
	NEED_UPDATE = true,
	JUMP_PRESSED  = false;



/*
window.onbeforeunload = function() {
  var m =  "**************************\n\n";
  m += "You Have Unsaved Game\n";
  m += "ALL PROGRESS WILL BE LOST\nIF YOU LEAVE OR RELOAD PAGE\n";
  m += "\n**************************";
  return m;
}*/

window.addEventListener('load', function() {
	window.PitCraftGame = new PitCraft();
	PitCraftGame.init();
}, false);

function PitCraft() {	
	var _this = this,
		canvas = $("canvas"),
		mCanvas = $("mapCanvas"),
		gCanvas = $("gridCanvas");
	//	mpCanvas = $("miniMapCanvas");

	this.mainCanvas = $("canvas");
	this.mapCanvas = $("mapCanvas");
	this.gridCanvas = $("gridCanvas");

	this.sprites = [];

	this.sprites['lamp'] = $('lamp');
	this.sprites['tiles'] = $('tiles');

	this.dayLight = 2; // up to 8
	this.hero = new Hero(1040, 480, this);

	//View port is 84 x 60 block ( maximum 7 x 5 chunks showed )
		
	this.view = {x:0,y:0};

	this.widthChunks = 7;
	this.heightChunks = 5;

	this.chunkSize = 12;
	this.cellSize = 40;

	this.chunkPixels = this.chunkSize * this.cellSize; //480

	this.maxLight = 12;

	//Viewport width
	this.width  = this.widthChunks  * this.chunkPixels;
	this.height = this.heightChunks * this.chunkPixels;

	this.widthCells  = this.widthChunks  * this.chunkSize;
	this.heightCells = this.heightChunks * this.chunkSize;

	canvas.width  = this.width;
	canvas.height = this.height;
	cxt = canvas.getContext("2d");

	mCanvas.width  = this.width;
	mCanvas.height = this.height;
	map = mCanvas.getContext("2d");

	gCanvas.width  = this.width;
	gCanvas.height = this.height;
	gCxt = gCanvas.getContext("2d");
/*
	mpCanvas.width  = 144;
	mpCanvas.height = 60;
	miniMap = mpCanvas.getContext("2d");
*/

	//Holder for mouse events
	this.mouse = { x: 0, y: 0, clicked: false };


	this.prevDayLight = 7 // up to 0.8
	
	this.keyPressed = false; // keyUp
	this.keyPushed = false;  // keyDown


	this.movePressed = 0;

	this.blockInHand = 'torch';

	this.lastFallFrame = 0;
	this.fallTimeout = 25;
	

	this.isFalling = false;
	

	this.lights = [];

	Block.game = this;

	this.MapGenerator = new generator(this);

	this.init = function() {	
		//Listen for mouse events
		this.addListeners();

		this.drawLevel();
		
		//Start game
		this.animate();
		

		this.updateViewport();

		this.addLight();


		this.addEnemies();
/*
		setTimeout(function(){
			_this.testTrees();
		},500);*/

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

	this.generated = 0;
	
	this.generateChunk = function(cx,cy) {
		this.generated++;
		return this.MapGenerator.createChunk(cx,cy);
	}
		
		

	this.saveWorld = function() {
		var map = JSON.stringify(this.world)		
		$('textarea_save').style.display = 'block';
		$('textarea_save').value = map;
		function Zahard(){

		}
		var z = new Zahard();
		z.map = map;
		window.z = z;
	}



	this.drawLevel = function() {

		this.world = {};
		
		
		for( var cx = 0; cx < this.widthChunks; cx++ ) {
			this.world[cx] = {};
			for( var cy = 0; cy < this.heightChunks; cy++ ) {
				this.world[cx][cy] = this.generateChunk(cx,cy);
			}
		}

		this.addLightSource( new Block('torch'), 27, 7 );
		this.addLightSource( new Block('torch'), 34, 11 );
		
		this.updateVisibility({x:25,y:9})
		
		this.drawViewport();

		Block.defaultOpen = true;		

		gCxt.lineWidth = 3;
		gCxt.strokeStyle = '#fff';
		gCxt.beginPath();
		var cc = this.chunkPixels;
		for( var x = cc; x < this.width; x += cc) {
			gCxt.moveTo(x,0);
			gCxt.lineTo(x,this.height);
		}
		for( var y = cc; y < this.height; y += cc) {
			gCxt.moveTo(0,y);
			gCxt.lineTo(this.width,y);
		}
		gCxt.closePath();
		gCxt.stroke();
	}

	this.drawViewport = function() {
		var mx = this.widthCells;
		var my = this.heightCells;
				
		for(var x = 0; x < mx; x += 1) {
			for(var y = 0; y < my; y += 1) {
				this.drawBlock(x,y);
			}
		}
	}

	this.addLightSource = function( block, x, y) {
		block.open = true;
		var posInWorld = this.setViewBlock( block, x, y );

		this.lights.push( posInWorld );
	}

	this.worldLeft = [];
	this.worldRight = [];


	this.shiftftWorld = function(){
		for(var ln = 0; ln < 12; ln++) {

			var f = this.view.pop();
			this.worldRight.unshift(f);

			var line = [];
			var wl = this.worldLeft.pop();
			if( wl ) {
				line = wl;
			} else {
				for(var i =0; i < 36; i++){
					line.push( new Block('dirt') );
				}
			}

			this.view.unshift(line);

		}

		this.hero.x += 12*40;
		NEED_UPDATE = true;

		for(var x = 0; x < 60; x += 1) {
			for(var y = 0; y < 36; y += 1) {
				this.drawBlock(x,y);
			}			
		}
	}


	this.shiftWorldRight = function(){
		var f = this.view.shift();
		this.worldLeft.push(f);

		var line = [];
		var wr = this.worldRight.shift();
		if( wr ) {
			line = wr;
		} else {
			for(var i =0; i < 36; i++){
				line.push( new Block('dirt') );
			}
		}

		this.view.push(line);

		for(var x = 0; x < 60; x += 1) {
			for(var y = 0; y < 36; y += 1) {
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
			for(var i =0; i < 36; i++){
				line.push( new Block('dirt') );
			}
		}

		this.view.unshift(line);

		for(var x = 0; x < 60; x += 1) {
			for(var y = 0; y < 36; y += 1) {
				this.drawBlock(x,y);
			}			
		}
	}

	this.redrawAir = function() {
		for(var x = 0; x < 24; x += 1) {
			for(var y = 0; y < 12; y += 1) {
				var block = this.viewBlock(x,y);
				if( block.type == 'air' ) {
					map.fillStyle = this.getBlockColor(block.type,y);
					map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
				}
			}			
		}
	}

	this.drawBlock = function(x,y) {
		var block = this.viewBlock(x,y);
		
		if( ! block.open ) {
			map.fillStyle = '#000';
			map.fillRect(this.cellSize*x,this.cellSize*y,this.cellSize,this.cellSize);
		} else {
			block.draw(x,y);
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
		for(var x = 0; x < this.widthCells; x += 1) {
			for(var y = 0; y < this.heightCells; y += 1) {
				var block = this.viewBlock(x,y);
				if( block.open && ! block.lightSource ) {
					block.brightness = block.defaultBrightness;
					this.drawBlock(x,y);
				}
			}
		}
		this.addLight();
	}

	this.addLight = function() {
			
		var l, c,x, min_y, y, d,  sx,sy,cells = [];
		var iteration;

		//LIght direction  - bottom,top,left,right
		var directions = [
			{x: 0,y:-1},
			{x: 0,y: 1},
			{x:-1,y: 0},
			{x: 1,y: 0}
		];

		for(var n in this.lights ) {

			//Detect coorrd of light source in current viewport
			l = this.lights[n];
			l.x = ( l.cx - this.view.x )  * this.chunkSize + l.bx;
			l.y = ( l.cy - this.view.y )  * this.chunkSize + l.by;
			
			//Make a light beam in each direction
			for( var dir in directions ) {

				d = directions[dir];

				// Brightness will decrease with distance from light source
				for( var level =1 ; level <= this.maxLight ; level += 1 ) {
					//Main beam brightness
					var brightness = this.maxLight - level + 1;

					//Length of perpendicular beam
					var orto_length =  brightness - 1;

					//Beam point that we need to check
					x = l.x + d.x * level;
					y = l.y + d.y * level;

					var beamCell = this.viewBlock(x,y);
					if( ! beamCell.walkable ) {
						//If block is solid make it bright wihtout losing
						//brighness level and break iteration
						cells.push({
							x: x, 
							y: y, 
							brightness : ( brightness < this.maxLight ) ? brightness : this.maxLight
						});
						break;
					}
					
					//IF brightness of block is less update this block
					if( beamCell.type && beamCell.setBrightness( brightness ) ) {
						cells.push({
							x: x, 
							y: y, 
							brightness : brightness
						});
					}

					orto_x = Math.abs(d.y);
					orto_y = Math.abs(d.x);

					//Send perpendicular beam in 2 directions
					for(var sub_dir = 0; sub_dir <=1 ; sub_dir++) {
						//Switch direction from tight to left
						if( sub_dir == 1 ) {
							orto_x = -orto_x;
							orto_y = -orto_y;
						}

						for( orto = 1; orto <= orto_length; orto++ ) {
						
							sub_brightness = brightness - orto;
							if( sub_brightness < 1 ) {
								sub_brightness = 1;
							}

							sx = l.x + d.x * level + orto_x * orto;
							sy = l.y + d.y * level + orto_y * orto; 

							var subBeamCell = this.viewBlock(sx, sy);
							
							if( ! subBeamCell.walkable ) {
								cells.push({
									x: sx, 
									y: sy, 
									brightness : sub_brightness
								});
								break;
							}


							if( subBeamCell.type && subBeamCell.setBrightness( sub_brightness ) ) {
								cells.push({ 
									x: sx, 
									y: sy, 
									brightness : sub_brightness
								});
							}

							// Try Diff light from bith sides of side beam
							// Beam is birght enough for reflecting
							if( sub_brightness > 2) {

								//If subbeam is vertical
								if( d.y == 0 ) {
									dx = 1;
									dy = 0;	
								//If subbeam is horizontal
								} else {
									dx = 0;
									dy = 1;	
								}

								var cnx, cny;
								for( var cn = 0; cn <=1; cn++) {

									shadowBrightness =  sub_brightness - 1;

									for( var refl_size = 1; refl_size <= 3; refl_size++ ) {

										if( cn == 1) {
											cnx = sx - dx * refl_size;
											cny = sy - dy * refl_size;
										} else {
											cnx = sx + dx * refl_size;
											cny = sy + dy * refl_size;
										}

										var sideSubBeamCell = this.viewBlock(cnx, cny);

										var sideSBrightness = sub_brightness - refl_size*2;
										var max_bright = 3 + 2 * ( 3 - refl_size );
										if( sideSBrightness > max_bright ) {
											sideSBrightness = max_bright;
										}

										if( sideSubBeamCell.walkable  ) {
											if( sideSubBeamCell.setBrightness( sideSBrightness ) ) {
												cells.push({ 
													x: cnx, 
													y: cny, 
													brightness : sideSBrightness,
												});
											}
										} else {
											sideSBrightness++;
											if( sideSubBeamCell.setBrightness( sideSBrightness ) ) {
												cells.push({ 
													x: cnx, 
													y: cny, 
													brightness : sideSBrightness ,
												});
											}
											break;
										}
									}
								}	
							}
						}
					}
				}
			}


			
			var cl;
			var brightness;
			for( var i in cells ) {
				c = cells[i];
				
				brightness = c.brightness;

				/*
				if( c.type == 'air' ) {
					if( brightness < this.dayLight) {
						brightness = this.dayLight;
					}
				}*/

				var bl = this.viewBlock(c.x,c.y);

				bl.setBrightness(brightness)
				bl.draw(c.x,c.y);
				

				
				//this.drawBlock( this.viewBlock(c.x,c.y), c.x, c.y);
				//this.viewBlock(c.x,c.y).draw();

				//map.fillStyle = color;
				//map.fillRect( this.cellSize * c.x, this.cellSize * c.y, this.cellSize, this.cellSize );

				
			}
		}

	}



	this.getBlockColor = function(cell,x,y) {
		if( cell == 'air') {

			var br = this.viewBlock(x,y).brightness;
			if( br < this.dayLight ) {
				br = this.dayLight;
			}

			return HSVtoRGB( 0.5, 0.5, br/10);


		} else if( cell == 'pit') {
			var br = this.viewBlock(x,y).brightness;
			return HSVtoRGB( 0.05, 0.5, br/10);
			//return HSVtoRGB( 0.05, 0.5, 0.6);
			
		}
		 else {
			return this.colors[cell];
		}
	}

	this.makeTree = function(root,treeType) {
		var blocks = Trees.getTreeBlocks(root,treeType);
		for( var type in blocks ) {
			for( var i in blocks[type] ) {
				this.insertBlock(blocks[type][i], type, true);
			}
		}
		
	}

	this.testTrees = function() {
		this.makeTree({x:28,y:11},'oak');
		
		//this.makeTree({x:29,y:11},'appleSmall');
		this.makeTree({x:35,y:11},'bereza');
		this.makeTree({x:19,y:11},'apple');
	}

	this.insertBlock = function(cell, type, ignoreLight) {
		var ac;
		if( typeof cell == 'undefined' ) {
			if( ! this.hero.activeCell || ! this.hero.activeCell.reachable ) return;	
			ac = this.hero.activeCell;
		} else {
			ac = cell;
		}

		var old = this.viewBlock(ac.x, ac.y);
		if( old.type == 'air' || old.type == 'pit') {
			
			var block_type = type || this.blockInHand;
			var block = new Block( block_type );
			block.open = true;

			if( block.brightness < old.brightness ) {
				block.brightness = old.brightness
			}

			this.setViewBlock( block, ac.x, ac.y )
			this.drawBlock(ac.x,ac.y);

			if( block.type == 'lava' ) {
				this.checkLavaFlow(block,ac.x, ac.y,1);
			}

			if( block.type == 'torch') {
				this.addLightSource( block, ac.x, ac.y )
			}

			if( ! ignoreLight)
				this.recalculateLight();
		}

	}

	this.hitBlock = function() {
		if( ! this.hero.activeCell || ! this.hero.activeCell.reachable ) return;
		
		var ac = this.hero.activeCell;
		var old = this.viewBlock(ac.x, ac.y);

		if( old.hits > 1) {
			old.hits--;;
			return;	
		}

		var block = new Block( this.view.y * 12 + ac.y < 12 ? 'air' : 'pit'); 
		block.open = true;

		if( block.brightness < old.brightness ) {
			block.brightness = old.brightness
		}

		this.setViewBlock( block, ac.x, ac.y );

		this.updateVisibility(ac);

		this.drawBlock(ac.x,ac.y);

		if( old.type == 'torch') {
			var newLights = [];
			var cx = Math.floor(ac.x / 12 ) + this.view.x;
			var cy = Math.floor(ac.y / 12 ) + this.view.y;
			var bx = ac.x % 12;
			var by = ac.y % 12;
			
			for(var i in this.lights ) {
				if( this.lights[i].cx != cx || 
					this.lights[i].cy != cy ||
					this.lights[i].bx != bx ||
					this.lights[i].by != by  ) {
					newLights.push(this.lights[i]);
				}
			}
			this.lights = newLights;
		}

		this.recalculateLight();
	}


	this.checkLavaFlow = function(main,x,y,i) {
		
		this.checkLavaFall( main, x, y);
		this.checkLavaRightFlow( main,x,y);
		this.checkLavaLeftFlow( main,x,y);
	
		return;

	}

	this.checkLavaFall = function(main, x, y) {
		//If lava is falling down
		if( this.viewBlock( x , y + 1 ).empty ) {
			var v_lava = new Block('lavaFlow');
			v_lava.open = true;
			v_lava.lavaLevel = 0;
			v_lava.lavaFlow = 'v';
			this.setViewBlock( v_lava, x, y + 1);
			this.drawBlock( x, y + 1);
			this.checkLavaFlow(v_lava, x, y + 1);
		} else if ( this.viewBlock( x , y + 1 ).isLava ) {
			
			if( this.viewBlock( x , y + 1 ).lavaLevel > 0 ) {
				this.viewBlock( x , y + 1 ).lavaLevel = 0;
				this.viewBlock( x , y + 1 ).lavaFlow = 'v';
				this.drawBlock( x, y + 1);
				this.checkLavaFlow( this.viewBlock(x,y+1), x, y + 1);
			}
		}
	}

	this.checkLavaLeftFlow = function(main,x,y) {
		
		var isSolidBottom = ! this.viewBlock( x , y + 1 ).empty 
						&& ! this.viewBlock( x , y + 1 ).isLava;
		
		if( isSolidBottom || main.type == 'lava') { 
			
			for( var l = main.lavaLevel + 1; l <=3; l++) {
				
				var left_block = this.viewBlock( x - l, y );
				if( left_block.empty ) {

					var h_lava = new Block('lavaFlow');
					h_lava.open = true;
					h_lava.lavaLevel = l;
					h_lava.lavaFlow = 'left';
					this.setViewBlock( h_lava, x - l, y )
					this.drawBlock( x - l, y );

					this.checkLavaFall(h_lava, x - l, y );

					if( this.viewBlock( x - l, y+1 ).empty || 
						this.viewBlock( x - l, y+1 ).isLava ) {
						break;
					} 

				} else if( left_block.isLava ) {
					var pre_left_block = this.viewBlock( x - l - 1, y );
					
					if( l == 1 && left_block.lavaLevel == 1) {
						left_block.lavaLevel = 0;
						left_block.lavaFlow = 'v';
						this.drawBlock(  x - l, y );
						this.checkLavaFall( left_block,  x - l, y );
					}
					else if( left_block.lavaLevel < l ) {

					} else if( left_block.lavaLevel > l ) {
						left_block.lavaLevel = l;
						left_block.lavaFlow = 'left';
						this.drawBlock(  x - l, y );
						this.checkLavaFall( left_block,  x - l, y );
					} else {
						left_block.lavaLevel = l;
						left_block.lavaFlow = 'right';
						this.drawBlock(  x - l, y );
						this.checkLavaFall( left_block,  x - l, y );
					}


				} else {
					break;
				}
			}

		}

	}

	this.checkLavaRightFlow = function(main,x,y) {
		var isSolidBottom = ! this.viewBlock( x , y + 1 ).empty 
						&& ! this.viewBlock( x , y + 1 ).isLava;
		
		if( isSolidBottom || main.type == 'lava') { 
			
			for( var l = main.lavaLevel + 1; l <=3; l++) {
				
				var right_block = this.viewBlock( x + l, y );
				if( right_block.empty ) {

					var h_lava = new Block('lavaFlow');
					h_lava.open = true;
					h_lava.lavaLevel = l;
					h_lava.lavaFlow = 'right';
					this.setViewBlock( h_lava, x + l, y )
					this.drawBlock( x + l, y );

					this.checkLavaFall(h_lava, x + l, y );

					if( this.viewBlock( x + l, y+1 ).empty || 
						this.viewBlock( x + l, y+1 ).isLava ) {
						break;
					}

				} else if( right_block.isLava ) {
					
					if( l == 1 && right_block.lavaLevel == 1) {
						right_block.lavaLevel = 0;
						right_block.lavaFlow = 'v';
						this.drawBlock(  x + l, y );
						this.checkLavaFall( right_block,  x + l, y );
					} else if( right_block.lavaLevel < l ) {
						
					} else if( right_block.lavaLevel > l ) {
						right_block.lavaLevel = l;
						right_block.lavaFlow = 'right';
						this.drawBlock(  x + l, y );
						this.checkLavaFall( right_block,  x + l, y );
					} else {
						right_block.lavaLevel = l;
						right_block.lavaFlow = 'left';
						this.drawBlock(  x + l, y );
						this.checkLavaFall( right_block,  x + l, y );
					}


				} else {
					break;
				}
			}

		}
	}

	this.addEnemies = function() {

		this.enemies = new EnemiesCollection();
		this.enemies.add( new Enemy('skeleton') );
	}

	this.updateVisibility = function(b, notGenerate ) {
		notGenerate = notGenerate || false;

		var centerBlock = this.viewBlock( b.x, b.y, notGenerate );
		
		if( ! centerBlock ) {
			return;
		}

		centerBlock.open = true;

		var check = [
			{x: b.x, y: b.y-1},
			{x: b.x, y: b.y+1},
			{x: b.x-1, y: b.y},
			{x: b.x+1, y: b.y}
		];

		var block;
		var max_brightness = centerBlock.type == 'torch' ? this.maxLight : 1;

		for(var i in check ) {
			if( check[i].x >= 0 && check[i].x < this.widthCells && check[i].y >= 0 && check[i].y < this.heightCells ) {
					
				block = this.viewBlock( check[i].x, check[i].y, notGenerate );
				if( ! block ) {
					continue;
				}

				if( block.empty && block.brightness > max_brightness + 1) {
					max_brightness = block.brightness - 1;
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
				case 53: // 5
					_this.blockInHand = 'lava';
					break;


				case 69: // E
					this.E_PRESSED = false;
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
					_this.hero.speed = _this.hero.walkSpeed;
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
					RIGHT_PRESSED = false;
					/*
					if( _this.hero.direction == 'right' || SHIFT_PRESSED ) {
						_this.moveRight();
					} else {
						_this.hero.direction  = 'right';
					} */

					break;

				case 37: // Look LEFT
					LEFT_PRESSED = false;
					/*
					if( _this.hero.direction == 'left' || SHIFT_PRESSED ) {
						_this.moveLeft();
					} else {
						_this.hero.direction  = 'left';
					}
					*/
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
					_this.hero.speed = _this.hero.runSpeed;
					break;

				case 32: //SPACE
					//Jump or Climb
					_this.jump();
					break;

				case 69:
					this.E_PRESSED = true;
					break;

				case 76://L
					//_this.hero.y -= 80;
					break;

				case 68: // D 
					//RIGHT_PRESSED = true;
					break;
				case 65: // A
					//LEFT_PRESSED = true;
					break;

				case 39: // Look RIGHT
					if( _this.hero.direction == 'left' ) {
						_this.hero.direction = 'right';
					} else {
						RIGHT_PRESSED = true;
					}

					break;
				case 37: // Look LEFT
					if( _this.hero.direction == 'right' ) {
						_this.hero.direction = 'left';
					} else {
						LEFT_PRESSED = true;
					}
					
					break;

				case 38: //Look UP
					UP_PRESSED = true;
					break;
				case 40: //Look DOWN
					DOWN_PRESSED = true;
					break;
			}
			_this.keyPushed = true;
		});	
	}

	this.moveRight = function() {

		var bound_x = this.hero.x + 40;
		var to_check = [];
		to_check.push([bound_x, this.hero.y]);
		to_check.push([bound_x, this.hero.y - 40 ]);
		if( this.hero.y % 40 != 0 ) {
			to_check.push([bound_x, this.hero.y - 80]);
		}

		var b,x,y;
		for(var i in to_check ) {
			x = to_check[i][0];
			y = to_check[i][1];
			
			var bx = Math.floor( (x + 1) / 40 );
			var by = Math.floor( (y -1) / 40 );
			if( ! this.viewBlock(bx, by).walkable ) {
				return false;
			}
		}

		this.hero.moveRight();


		b1 = this.hero.fitInCells[0];
		b = this.viewBlock(b1.x,b1.y);
		if( b.type == 'ladder') {
			var dy = (this.hero.x -20)% 40;
			this.hero.moveUp(dy);
		}

		return true;

			

		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x + 1, b1.y).walkable,
			b2 = this.hero.fitInCells[1],
			u2 = this.viewBlock(b2.x + 1, b2.y).walkable;

		if( u1 && u2  ||  this.hero.fitInCells[3] != null ) {

			this.hero.moveRight();

			return true;
		}

		return false;
	}

	this.moveLeft = function() {

		var bound_x = this.hero.x;
		var to_check = [];
		to_check.push([bound_x, this.hero.y]);
		to_check.push([bound_x, this.hero.y - 40 ]);
		if( this.hero.y % 40 != 0 ) {
			to_check.push([bound_x, this.hero.y - 80]);
		}

		var b,x,y;
		for(var i in to_check ) {
			x = to_check[i][0];
			y = to_check[i][1];
			
			var bx = Math.floor( (x -1 ) / 40 );
			var by = Math.floor( (y -1) / 40 );
			
			if( ! this.viewBlock(bx, by).walkable ) {
				return false;
			}
		}

		this.hero.moveLeft();
		return true;


		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x - 1, b1.y).walkable,
			b2 = this.hero.fitInCells[1],
			u2 = this.viewBlock(b2.x - 1, b2.y).walkable;

		if( u1 && u2  ||  this.hero.fitInCells[3] != null ) {
			this.hero.moveLeft();
			
			return true;
		}

		return false;
	}

	this.moveDown = function() {
		var b1 = this.hero.fitInCells[0],
			u1 = this.viewBlock(b1.x, b1.y + 1).walkable,
			b2 = null,
			u2 = true;

		//If miner stand on 2 blocks
		if( this.hero.fitInCells[2] != null ) {
			var b2 = this.hero.fitInCells[2];
			var u2 = this.viewBlock(b2.x, b2.y + 1).walkable;
		}

		if( u1 && u2 ) {
			this.hero.moveDown();
			return true;
		}

		return false;
	}

	this.jumpUp = function() {

		var bound_y = this.hero.y - 80;
		var to_check = [];
		
		to_check.push([this.hero.x, bound_y]);

		var b,x,y;
		for(var i in to_check ) {
			x = to_check[i][0];
			y = to_check[i][1];
			
			var bx = Math.floor( x / 40 );
			var by = Math.floor( (y -1) / 40 );
			if( ! this.viewBlock(bx, by).walkable ) {
				return false;
			}
		}

		this.hero.jumpStep();
		return true;
	}

	this.fallDown = function() {

		if( this.hero.y % 40 == 0 || this.lastFallFrame == 0  ) { 
			var b1 = this.hero.fitInCells[0];
			var bx = Math.floor( this.hero.x / 40 );
			var by = Math.floor( (this.hero.y + 4 ) / 40 );

			var u1 = this.viewBlock(bx, by).walkable;
			var u2 = true;
			var cv;

			if( u2 && this.hero.fitInCells[2] != null ) {
				var b2 = this.hero.fitInCells[2];
				if( b1.x > b2.x ) {
					cv = this.viewBlock(bx+1, by);
					u2 = cv.walkable;
				} else { //b1.x < b2.x
					cv = this.viewBlock(bx-1, by);
					u2 = cv.walkable;
				}
			}

			if( u1 && u2) {
		 		this.hero.fallDown();
		 		return true;
		 	} else {
		 		
		 	}
		 	return false;
		} else {
			this.hero.fallDown();
		 	return true;
		}


		if( this.hero.y % 40 == 0 || this.lastFallFrame == 0  ) {

			var b1 = this.hero.fitInCells[0],
				u1 = this.viewBlock(b1.x, b1.y + 1).empty,
				b2 = null,
				u2 = true;

			//If miner stand on 2 blocks
			if( this.hero.fitInCells[2] != null ) {
				var b2 = this.hero.fitInCells[2];
				var u2 = this.viewBlock(b2.x, b2.y + 1).empty;
			}

			if( u1 && u2 ) {
				this.hero.fallDown();
				return true;
			}

			return false;
		} else {
			this.hero.fallDown();
			return true;
		}
	}

	this.moveUp = function() {
		var b1 = this.hero.fitInCells[1],
			t1 = this.hero.fitInCells[2],
		u1 = this.viewBlock(b1.x, b1.y - 1).walkable,
		b2 = null,
		u2 = true;

		//If miner stand on 2 blocks
		if( this.hero.fitInCells[3] != null ) {
			var b2 = this.hero.fitInCells[3];
			var u2 = this.viewBlock(b2.x, b2.y - 1).walkable;
		}

		if( u1 && u2 ) {
			this.hero.moveUp();
			HERO_MOVED = true;
		}
	}

	this.jump = function(){
		if( ! this.isJumping && ! this.isFalling ) {
			this.isJumping = true;
			this.jumpHeightLeft = 80;
		}
	}

	this.climbUp = function() {
		if( this.hero.fitInCells[2] == null ) {
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

	this.viewBlock = function(x, y, notGenerate) {
		notGenerate = notGenerate || false;

		var cx = Math.floor(x / 12) + this.view.x;
		var cy = Math.floor(y / 12) + this.view.y;
		
		var bx = x % 12;
		if( x < 0 ) {
			bx = 11 + bx;
		}

		var by = y % 12;
		if( y < 0 ) {
			by = 11 + by;
		}

		var chunk = this.getChunk(cx, cy, notGenerate);
		if( chunk ) {
			return chunk[bx][by];
		} else {
			return null;
		}
	}


	this.getChunk = function(cx, cy, notGenerate) {
		notGenerate = notGenerate || false;

		if( typeof this.world[cx] !== 'undefined' && 
			typeof this.world[cx][cy] !== 'undefined' ) {
			return this.world[cx][cy];
		} else {
			if( notGenerate ) {
				return null;
			}

			if( typeof this.world[cx] == 'undefined' ) {
				this.world[cx] = {};
			}

			var chunk = this.generateChunk(cx,cy);
			this.world[cx][cy] = chunk;

			//Update visiblity of chunk if it has 
			//air connection to already opened space
			
			this.updateVisibilityOfNewChunk(chunk,cx,cy);

			return this.world[cx][cy];
		}
	}


	this.updateVisibilityOfNewChunk = function(chunk,cx,cy) {
		//Going trough borders
		var b,c,bn,p={};
		
		//right 
		if( c = this.getChunk(cx + 1, cy, true) ) {
			for(var y = 0; y < this.chunkSize; y++) {
				bn = chunk[11][y];
				b = c[0][y];
				if( bn.empty && b.empty && b.open ) {
					p.x = ( cx - this.view.x )  * this.chunkSize + 0;
					p.y = ( cy - this.view.y )  * this.chunkSize + y;

					this.updateVisibility( p, true);
					return;
				}
			}
		}

		//left
		if( c = this.getChunk(cx - 1, cy, true) ) {
			
			for(var y = 0; y < this.chunkSize; y++) {
				bn = chunk[0][y];
				b = c[11][y];
				if( bn.empty && b.empty && b.open ) {
					p.x = ( cx - this.view.x )  * this.chunkSize + 11;
					p.y = ( cy - this.view.y )  * this.chunkSize + y;
					
					this.updateVisibility( p, true);
					return;
				}
			}
		}


		//top 
		if( c = this.getChunk(cx, cy - 1, true) ) {
			for(var x = 0; x < this.chunkSize; x++) {
				bn = chunk[x][0];
				b = c[x][11];
				if( bn.empty && b.empty && b.open ) {
					p.x = ( cx - this.view.x )  * this.chunkSize + x;
					p.y = ( cy - this.view.y )  * this.chunkSize + 11;
					
					this.updateVisibility( p, true);
					return;
				}
			}
		}

		//top 
		if( c = this.getChunk(cx, cy + 1, true) ) {
			for(var x = 0; x < this.chunkSize; x++) {
				bn = chunk[x][11];
				b = c[x][0];
				if( bn.empty && b.empty && b.open ) {
					p.x = ( cx - this.view.x )  * this.chunkSize + x;
					p.y = ( cy - this.view.y )  * this.chunkSize + 0;
					
					this.updateVisibility( p, true);
					return;
				}
			}
		}
	}



	this.setViewBlock = function( block, x, y) {
		var cx = Math.floor(x / 12) + this.view.x;
		var cy = Math.floor(y / 12) + this.view.y;
		var bx = x % 12;
		var by = y % 12;
		
		this.world[cx][cy][bx][by] = block;
		return {
			cx: cx,
			cy: cy,
			bx: bx,
			by: by
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

	this.maxFps = 0;
	this.minFps = 1000;
	this.animate = function() {
		if( _this.isPaused )
			return;

		/*
		var t = new Date().getTime();
		if( _this.lastFrame ) {
			var fps = 1000/ (t - _this.lastFrame);
			fps = t - _this.lastFrame;
				
			var r = false;
			if( fps > _this.maxFps) {
				_this.maxFps = fps;
				r = true;
			}

			if( fps < _this.minFps) {
				_this.minFps = fps;
				r =true;
			}

			if(r){
				$('fps').innerText = ( _this.maxFps + _this.minFps) /2;
			}
		}
		_this.lastFrame = t;
		*/

		if( _this.update() ) {
			_this.updateViewport();
			_this.draw();
		}

		requestAnimationFrame(_this.animate)
	}

	this.updateViewport = function() {
		//return;
		var old_canvas_y = parseInt(this.mainCanvas.style.top) || 0;		
		var canvas_y;
		var y = this.hero.y;
		var canvas_x;
		var x = this.hero.x;
		
		if( y <= 240 ) {
			canvas_y = 0;
		} else if ( y > this.height - 240 ) {
			canvas_y = this.height - 480;
		} else {
			canvas_y = y - 280 ;
		}

		this.mainCanvas.style.top = -canvas_y + 'px';
		this.mapCanvas.style.top = -canvas_y + 'px';
		this.gridCanvas.style.top = -canvas_y + 'px';
	
		canvas_x = x - 480;
		max_x = this.width - 960;
		if( canvas_x < 0 ) {
			canvas_x = 0;x
		} else if( canvas_x >= max_x ) {
			canvas_x = max_x;
		}

		this.mainCanvas.style.left = -canvas_x + 'px';
		this.mapCanvas.style.left = -canvas_x + 'px';
		this.gridCanvas.style.left = -canvas_x + 'px';


		var needRedraw = false;
		
		//Checking we need load new chunks
		if( this.hero.x > this.chunkPixels * 4.5 ) {
			//Load next right chunks
			this.view.x += 2;
			this.hero.x -= this.chunkPixels * 2;
			needRedraw = true;
		} else if( this.hero.x < this.chunkPixels * 1.5 ) {
			//Load next left chunks
			this.view.x -= 2;
			this.hero.x += this.chunkPixels * 2;
			needRedraw = true;
		}

		if( this.hero.y > this.chunkPixels * 4) {
			//Load next bottom chunks
			this.view.y += 1;
			this.hero.y -= this.chunkPixels;
			needRedraw = true;
		} else if( this.hero.y < this.chunkPixels) {
			//LOad next left chunks
			this.view.y -= 1;
			this.hero.y += this.chunkPixels ;
			needRedraw = true;
		}


		if( needRedraw ) {
			//MAGIC !!!
			
			this.updateViewport();
			this.drawViewport();
		}

	}

	this.falled = true;
	this.update = function() {
		
		var needRedraw = false;
		

		if( this.keyPressed ) {
			this.keyPressed = false;
			NEED_UPDATE = true;
		}

		if( this.keyPushed ) {
			this.keyPushed = false;
			NEED_UPDATE = true;
		}

		if( this.isJumping ) {
			NEED_UPDATE = true;
		}

		if( HERO_MOVED ) {
			NEED_UPDATE = true;
			HERO_MOVED = false;
		}

		var t = new Date().getTime();
		
		
		if( NEED_UPDATE || LEFT_PRESSED || RIGHT_PRESSED ) {
			NEED_UPDATE = false;



			//Move our hero
			if( ( LEFT_PRESSED || RIGHT_PRESSED )  && ( ! this.isFalling || this.falled ) ) {
				

				if( LEFT_PRESSED ) {
					this.moveLeft();
				} else if( RIGHT_PRESSED ) {
					this.moveRight();
				}

				if( this.hero.currentFrame == this.hero.framesFreq ) {
					this.hero.currentFrame = 1;
					this.hero.runFrame++;
					if( this.hero.runFrame > 4) {
						this.hero.runFrame = 1;
					}
				}
				this.hero.currentFrame++;;
			
			} else {
				this.hero.runFrame = 0;
			}

			if( this.isFalling ) {
				this.falled = true;
			}

			// Клетки занятые нашим игроком 
			//обычно 4, или 2 если точно в пределах блока стоит
			var diff_x = this.hero.x % 40;
			var diff_y = this.hero.y % 40;
			
			var cells = [];
			var c1 = null;
			var c2 = null;
			var c3 = null;
			var c4 = null;
			var c5 = null;
			var c6 = null;

			c1 = {
				x : Math.floor( this.hero.x / 40 ),
				y : Math.ceil( this.hero.y / 40) -1 	
			};

			if( diff_x >= 20 ) {
				c1.x++;
			}

			c2 = { x: c1.x, y: c1.y-1};

			if( diff_x ) {
				if( diff_x >= 20 ) {
					c3 = { x: c1.x-1, y: c1.y};
					c4 = { x: c2.x-1, y: c2.y};					
				} else {
					c3 = { x: c1.x+1, y: c1.y};	
					c4 = { x: c2.x+1, y: c2.y};		
				}
			}

			if( diff_y ) {
				c5 = { x: c1.x, y: c1.y+1};
				if( c3 != null ) {
					c6 = { x: c3.x, y: c3.y+1};
				}	
			}

			cells.push(c1);
			cells.push(c2);
			cells.push(c3);
			cells.push(c4);
			cells.push(c5);
			cells.push(c6);

			
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

					var bottom_block = this.viewBlock(ac.x, ac.y + 1);
					var side_block = ( dir == 'right' ) ? this.viewBlock(ac.x - 1, ac.y) : this.viewBlock(ac.x+1, ac.y);
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
					if( c5 != null ) {
						//ac.y += 1;
					}
					break;
			}

			this.hero.activeCell = ac;

			if( this.isJumping ) {
				if( this.jumpHeightLeft > 0 && this.jumpUp() ) {
					this.jumpHeightLeft -= 5;
				} else {
					this.isJumping = false;
				}

			}
			//Check falling
			if( ! this.isFalling && ! this.isJumping ) {

	 			var b1 = this.hero.fitInCells[0];
				
				var f1 = this.viewBlock(b1.x, b1.y + 1).empty;
				var f2 = true;
				if( f1 && this.hero.fitInCells[3] != null ) {
					b2 = this.hero.fitInCells[3];
					f2 = this.viewBlock(b2.x, b2.y + 1).empty;
				}

				if( f1 && f2 ) {
					//Check maybe we on stairs
					if( this.viewBlock(b1.x, b1.y).type != 'stairs' ) {
						this.isFalling = true;
						this.falled = false;
					}
				}
			}

			needRedraw = true;
		}

		if( this.isFalling ) {
			if( t > this.lastFallFrame + this.fallTimeout ) {
				if( ! this.fallDown() ) {
					this.isFalling = false;
					this.lastFallFrame = 0;
				} else {
					this.lastFallFrame = t;
				}
				NEED_UPDATE = true;
				needRedraw = true;
			}
		}

		if( this.enemies.update() ) {
			needRedraw = true;
		}

		return needRedraw;
	}

	this.draw = function() {
		this.clearCanvas();

		if( this.needRedraw ) {
			this.drawViewport();
			this.needRedraw = false;
		}

		this.hero.draw();

		this.enemies.draw();
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


	
