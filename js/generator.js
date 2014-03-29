/**/

var cave_g = 0;
function generator(app) {

	this.app = app;


	this.createChunk = function(cx,cy) {

		var chunk = [], cell;
		
		var type = 'stone';
		if( cy <= 0 ) {
			type = 'air';
		}
		var zero_type = ( cy == 1 ) ? 'grass' : type;
		
		var simple = true;
		
		//Osidian
		/*addObs = false;
		if( cy > 5 ) {
			if( rand(10) == 1 ) {
				addObs =  true;
				perChunk = 4;
				simple = false;
			}
		}*/
		
		//Caves 
		addCaves = false;
		if( 
			cx > 0 && cx < 6 &&
			cy > 1 && cy < 4

		) {
			addCaves = true;
			simple = false;
			var cave = this.generateCave(cx,cy);
			chunk.cave = cave;
		}



/*		//Caves 
		addCliff = false;
		if( cy > 0 ) {
			if( rand(5) == 1 ) {
				addCliff = true;
				simple = false;
				var cliff = this.generateCliff();
			}
		}*/

/*		addLava = false;
		if( cy == 1 ) {
			if( rand(2) == 1 ) {
				addLava = true;
				simple = false;
			}
		}
*/

		for(var x = 0; x < this.app.chunkSize; x += 1) {
			
			chunk[x] = [];

			for(var y = 0; y < this.app.chunkSize; y += 1) {
				
				//Fill with default block type (
				//can be water in ocean, stone in cave, or lava
				if( y == 0 ) {
					chunk[x][y] = new Block(zero_type);	
				} else {
					if( cy == 1 && y < 4) {
						chunk[x][y] = new Block('dirt');
					} else {
						chunk[x][y] = new Block(type);	
					}
				}

				
				if( addCaves ) {
					if( cave[x] && cave[x][y]) {
						chunk[x][y] = cave[x][y];		
					}
				}



				/*if( addCliff ) {
					if( cliff[x] && cliff[x][y]) {
						chunk[x][y] = cliff[x][y];		
					}
				}*/

			}			
		}

		return chunk;
	}

	this.generateCave = function(cx,cy) {
		var cave = [];
		
		for( var x = 2;x<10;x++ ) {	
			cave[x] = [];
			for(var y = 2;y<10;y++)
				cave[x][y] = new Block('pit');
		}

		var number_of_exits = rand(2,4);

		var required_exits = [[],[],[],[]];
		
		var no_exit = [false,false,false,false];

		c_l = this.app.getChunk(cx-1,cy,true);
		if( c_l ) {
			if( c_l.cave ) {
				required_exits[3] = c_l.cave.sidesExits[1];
			} else {
				no_exit[3] = true;
			}
		}

		c_t = this.app.getChunk(cx,cy-1,true);
		if( c_t ) {
			if( c_t.cave ) {
				required_exits[0] = c_t.cave.sidesExits[2];
			} else {
				no_exit[0] = true;
			}
		}

		c_r = this.app.getChunk(cx+1,cy,true);
		if( c_r ) {
			required_exits[1] = (c_r.cave) ? c_r.cave.sidesExits[3] : [];
		}

		c_d = this.app.getChunk(cx,cy+1,true);
		if( c_d ) {
			required_exits[2] = (c_d.cave) ? c_d.cave.sidesExits[0] : [];
		}
		
		var number_of_exits_required = 0;
		var required_number_of_exits = [];
		for(var m=0;m<4;m++) {

			if( no_exit[m] === true ) {
				required_number_of_exits[m] = -1;
			} else {
				required_number_of_exits[m] = required_exits[m].length;
				number_of_exits_required += required_exits[m].length;
			}
		}

		if( number_of_exits < number_of_exits_required )
			number_of_exits = number_of_exits_required;


		var exit_combinations = this.getExitCombinations(number_of_exits,required_number_of_exits);
		var exits = exit_combinations[rand(exit_combinations.length-1)];

		var avalable_exits,exit_positions;

		cave.sidesExits = [];
		for( var i = 0; i < 4; i++ ) {
			avalable_exits = exits[i];
			exit_positions = [];

			if( avalable_exits == 3 ) {
				exit_positions = [0,1,2];
			} else if( avalable_exits == 2 ) {
				variation = [[0,1],[0,2],[1,2]];
				if( required_exits[i].length == 1) {
					if( required_exits[i][0] == 0) {
						exit_positions.push(0);
						exit_positions.push(rand(1,2));
					}
					if( required_exits[i][0] == 1) {
						exit_positions.push(1);
						exit_positions.push(rand(1) * 2);
					}
					if( required_exits[i][0] == 2) {
						exit_positions.push(rand(0,1));
						exit_positions.push(2);
					}
				} 
				else if( required_exits[i].length == 2) {
					exit_positions = required_exits[i];
				}
				else {
					exit_positions = variation[rand(2)];
				}

			} else if( avalable_exits == 1 ) {
				if( required_exits[i].length ) {
					exit_positions = required_exits[i];
				} else {
					exit_positions = [rand(2)];
				}
			}

			this.addCaveExit(cave,i,exit_positions)
		}

		
		return cave;

	}


	this.addCaveExit = function(cave,side, exit_positions) {
		cave.sidesExits[side] = exit_positions;

		var sx,sy,dx,dy;
		switch( side ) {
			case 0:
				dy=0; dx=1; sy=0; sx= 0; break;

			case 1:
				dy=1; dx=0; sy=0; sx=11; break;

			case 2:
				dy=0; dx=1; sy=11; sx=0; break;

			case 3:
				dy=1; dx=0; sy=0; sx= 0; break
		}

		var p;
		for( var pos in exit_positions ) {
			p = exit_positions[pos];

			x = sx;
			if( dx == 1 )
				x += p*4 + 1

			y = sy;
			if( dy == 1 )
				y += p*4 + 1		

			for( var n = 1; n <= 2; n++) {
				if( ! cave[x]) cave[x] = [];
				
				cave[x][y] = new Block('pit');
				
				/*
				if( dy==0 &&  dx==1) {
					if(  sy == 0) {
						cave[x][y+1] = new Block('pit');	
					} else {
						cave[x][y-1] = new Block('pit');	
					}	
				} else {
					if(  sx == 0) {
						if( ! cave[x+1]) cave[x+1] = [];
						cave[x+1][y] = new Block('pit');	
					} else {
						if( ! cave[x-1]) cave[x-1] = [];
						cave[x-1][y] = new Block('pit');	
					}
				}*/

				x += dx;
				y += dy;
			}

		}

	}

	this.generateCliff = function() {
		var cliff = [];
		for(var x = 0; x < this.app.chunkSize; x += 1) {
			cliff[x] = [];
			for(var y = 0; y < this.app.chunkSize; y += 1) {
				if( rand(9) < 5 ) {
					cliff[x][y] = new Block('pit');
				} else {
					if( rand(1) == 1 ) {
						cliff[x][y] = new Block('stone');
					} else {
						cliff[x][y] = new Block('dirt');
					}
				}

			}			
		}
		return cliff;
	}

	this.getExitCombinations = function(num,required_exits) {

		check_required = false;
		if( required_exits && required_exits.length == 4) {
			check_required = true;
		}

		var side_max = 2;
		var exit;

		var exit_combinations = [];
		for( var s1 = 0; s1 <= side_max; s1 ++ )
			for( var s2 = 0; s2 <= side_max; s2 ++ )
				for( var s3 = 0; s3 <= side_max; s3 ++ )
					for( var s4 = 0; s4 <= side_max; s4 ++ ) {
						if( (s1 + s2 + s3 + s4) == num) {
							exit = [s1,s2,s3,s4];
							if( check_required ) {
								if( 
									( 
										  required_exits[0] == 0 ||
										( required_exits[0] != -1 && required_exits[0] <= s1 ) ||
										( required_exits[0] == -1 && s1 == 0 )
									)
									&&
									( 
										  required_exits[1] == 0 ||
										( required_exits[1] != -1 && required_exits[1] <= s2 ) ||
										( required_exits[1] == -1 && s2 == 0 )
									)
									&&
									( 
										  required_exits[2] == 0 ||
										( required_exits[2] != -1 && required_exits[2] <= s3 ) ||
										( required_exits[2] == -1 && s3 == 0 )
									)
									&&
									(
										  required_exits[3] == 0 ||
										( required_exits[3] != -1 && required_exits[3] <= s4 ) ||
										( required_exits[3] == -1 && s4 == 0 )
									)
									
								) {
									exit_combinations.push( exit );
								} 
							} else {
								exit_combinations.push( exit );
							}

						}
					}


		return exit_combinations;
	}

}
