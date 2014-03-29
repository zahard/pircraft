function Enemy(x,y,game) {
	this.helth = 300;
	this.x = x;
	this.y = y;
	this.game = game;

    this.helth--;

	this.walkSpeed = 2;
	
	this.framesFreq = 9;
	this.currentFrame = 0;

	this.speed = this.walkSpeed;
	
	this.cellSize = 40;
	
	this.look = 1;

	this.direction = 'right';

	this.sprites = [];

	this.sprites['miner_legs'] = $('miner_legs');
	this.sprites['miner_hand'] = $('miner_hand');
	this.sprites['miner_head'] = $('miner_head');


	this.sprites['skeleton'] = $('skeleton');

	this.runFrame = 0;

	this.draw = function() {
		var place_x = this.x;
		var place_y = this.y - this.cellSize * 2;
		
		//cxt.save();
		//cxt.fillStyle = 'green';
		//cxt.fillRect(place_x,place_y,this.cellSize,this.cellSize*2);


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

	this.drawSprite = function( sprite , sx, sy, px, py, sprite_w, sprite_h) {
		var place_x = this.x;
		var place_y = this.y - this.cellSize * 2;
		if( typeof px != 'undefined' ) {
			place_x = px;
		}
		if( typeof py != 'undefined' ) {
			place_y = py;
		}

		sprite_h = sprite_h || this.cellSize * 2;
		sprite_w = sprite_w || this.cellSize;

		cxt.save();

		if (this.direction == 'left' ) {
			cxt.translate(this.game.width, 0);
			cxt.scale(-1, 1);
			place_x = this.game.width - 40 - place_x;
		}

		cxt.drawImage( 
			sprite,  // Sprie image with body and legs
			sx, sy, // Sprite position
			sprite_w, sprite_h,  // Sprite image size
			place_x, place_y, // Place image in this point
			this.cellSize, this.cellSize * 2 // IMage size on canvas
		);

		cxt.restore();
	}

	this.moveLeft = function() {
		this.x -= this.speed;
	}

	this.moveRight = function() {
		this.x += this.speed;
	}

}

Enemy.prototype.update = function() {
	var moving = false;
	var update = true;
	if( this.x < this.game.hero.x ) {
		if( this.direction != 'right') {
			this.direction = 'right';
			update = false;
		}

		if( this.game.hero.direction == 'right' && this.game.hero.x - this.x > 40 ) {
			this.moveRight();
			moving = true;
			update = true;
		}
	} else {
		if( this.direction != 'left') {
			this.direction = 'left';
			update = false;
		}

		if( this.game.hero.direction == 'left' && this.x - this.game.hero.x > 40) {
			this.moveLeft();
			moving = true;
			update = true;
		}
	}

	if( moving ) {
		if( this.currentFrame == this.framesFreq ) {
			this.currentFrame = 1;
			this.runFrame++;

			if( this.runFrame > 4) {
				this.runFrame = 1;
			}
		}
		this.currentFrame++;
	} else {
		this.runFrame = 0;
	}

	return update;
}


function VigenèreCipher(key, abc) {
  this.key = key;
  this.abc = abc;
  this.key_str = '';
  this.reg = new RegExp('['+abc+']');
  
  this.char2num = function(char) {
    return this.abc.indexOf(char);
  }
  
  this.passchar2num = function(char) {
    return this.key_str.indexOf(char);
  }
  
  var c = Math.floor(abc.length / key.length);
  if( c > 1 ) {
    for(var i=0;i<c;i++) {
      this.key_str += key;
    }
    this.key_str += key.substr(0,abc.length - c*key.length);
  } else {
    this.key_str += key.substr(0,abc.length);
  }
  
  this.encode = function (str) {
     var chars = str.split('');
     var encoded = '';
     for(var i in chars) {
       if( this.reg.test(chars[i]) ) {
        var char_code = this.char2num(chars[i]);
		var shift = this.char2num(this.key_str[i]);
        
		var new_char_code = char_code + shift;
        if( new_char_code > this.abc.length - 1 ) {
          new_char_code = new_char_code - this.abc.length;
        }
         
        encoded += this.abc[new_char_code];
         
       } else {
        encoded += chars[i];
       }
     }
     return encoded
     
  };
  this.decode = function (str) {
    var chars = str.split('');
     var decoded = '';
     for(var i in chars) {
       if( this.reg.test(chars[i]) ) {
        var char_code = this.char2num(chars[i]);
		var shift = this.char2num(this.key_str[i]);
        
		var new_char_code = char_code - shift;
        if( new_char_code < 0 ) {
          new_char_code = new_char_code + this.abc.length;
        }
         
        decoded += this.abc[new_char_code];
         
       } else {
        decoded += chars[i];
       }
     }
     return decoded
  };
}

var abc, key;
abc = "abcdefghijklmnopqrstuvwxyz";
key = "password"
c = new VigenèreCipher(key, abc);



