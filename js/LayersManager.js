/**
* Layers Manager
*/

LayersManager = function() {
	this.layers = {};
}

LayersManager.prototype.add = function( layer ) {
	this.layers[layer.layerName] = layer;
}