/**
 * Enemies Collection 
 */
function EnemiesCollection() {
	var items = [];
	var index;

	this.items = items;
	this.add = function(item) {
		items.push(item);
		item.collectionIndex = index++;
	}

	this.remove = function(item) {
		var i = item.indexOf(item);
		if( i != -1 ) {
			item.splice(i,1);
		}
	}

	this.update = function() {
		var updated = false;
		for( var i in items ) {
			if( items[i].update() ) {
				updated = true;
			}
		}
		return updated;
	}

	this.map = function(mapFunc) {
		for( var i in items ) {
			items[i][mapFunc]();
		}
	}

	this.each = function(callback) {
		for( var i in items ) {
			callback.apply(items[i])
		}
	}
}


