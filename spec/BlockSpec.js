

describe('Game Started', function() {
	window.PitCraftGame = new PitCraft();
	PitCraftGame.init();
	

	it('Hero created', function() {
		expect( PitCraftGame.hero instanceof Hero).toBe(true);	
	});

	it('Cell size calculated', function() {
		expect( PitCraftGame.cellSize).toBe(40);	
	});

	describe('Hero', function() {

		beforeEach(function() {
			PitCraftGame.hero.look = 1;
		})
 
		it('can look up', function() {
			PitCraftGame.hero.lookUp();
			expect(PitCraftGame.hero.look).toEqual(2);
		});

		it('can look down', function() {
			PitCraftGame.hero.lookDown();
			PitCraftGame.hero.lookDown();
			expect(PitCraftGame.hero.look).toEqual(-2);
		});
	});

	describe('Trees', function() {
		it('Ignore not existing trees',function() {
			expect( Trees.getTreeBlocks({x:0,y:0},'unknow') ).toEqual({});
		});

		it('Build default tree',function() {
			var blocks = Trees.getTreeBlocks({x:0,y:0});
			var types = 0;
			for(var type in blocks) {
				types++;
			}
			expect( types ).toEqual(2);
		});
	});

	
});