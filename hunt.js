(function(){
	let puzzle = window.location.pathname.slice( 1 ),
	    data = document.getElementById( "puzzle-data" ).innerText,
	    answer = document.getElementById( "answer-input" ),
	    btn = document.getElementById( "answer-button" );
	answer.value = window[puzzle]( data );
	btn.disabled = false;
	btn.click();
})();

function tattoo( data ){
	let channels = data
	    	.split( /\n/ )
	    	.map( channel => channel.match( /[01]{8}/g )
	    	.map( bits => parseInt( bits, 2 ) ) );

	return String.fromCharCode(
		...channels.map( channel => {
			let valid = channel[channel.find( byte => byte < channel.length )];
			while( valid < channel.length ) valid = channel[valid];
			return valid;
		} )
	);
}

function nanobots( data ){

	function mostFreq( chars ){
		let freq = chars.reduce( ( freq, char ) => {
		    	freq[char] = char in freq ? freq[char] + 1 : 1;
		    	return freq;
		    }, {} );
		return Object.keys( freq ).sort( ( a, b ) => freq[b] - freq[a] )[0];
	}

	let base = "",
	    nextChar = "";
	while( nextChar !== ";"){
		base += nextChar;
		nextChar = mostFreq( data.match( new RegExp( "(?<=" + base.charAt( base.length - 1 ) + ").", "g" ) ) );
	}
	return base;
}

function android( data ){

	const incX = { U:  0, R: 1, D: 0, L: -1 },
	      incY = { U: -1, R: 0, D: 1, L:  0 },
	      neigh = [ [ 0, -1 ], [ 0, 1 ], [ -1, 0 ], [ 1, 0 ] ];

	let neurons = {};

	// follow routes to map neurons
	data.split( /\n/ ).forEach( route => {
		let [ x, y, ...steps ] = route.split( /,| / );
		x = +x;
		y = +y;
		neurons[x+":"+y] = {};
		steps.forEach( dir => {
			if( dir in incX ){
				x += incX[dir];
				y += incY[dir];
				neurons[x+":"+y]= {};
			}
			else{
				neurons[x+":"+y].type = dir;
			}
		} );
	} );

	// traverse graph to determine each neurons distance from the start
	let nodes = Object.keys( neurons ).filter( pos => neurons[pos].type === "S" ),
	    dist = 0;
	while( nodes.length ){
		let nextNodes = new Set();
		nodes.forEach( pos => {
			neurons[pos].dist = dist;
			let [ x, y ] = pos.split( ":" ).map( Number );
			neigh.forEach( ( [ incX, incY ] ) => {
				let pos = ( x + incX ) + ":" + ( y + incY );
				if( pos in neurons && neurons[pos].type !== "X" && !( "dist" in neurons[pos] ) ) nextNodes.add( pos );
			} );
		} );
		nodes = [ ...nextNodes ];
		dist++;
	}

	// work backwards from the closest finishing node
	let pos = Object.keys( neurons )
	    	.filter( pos => "dist" in neurons[pos] && neurons[pos].type === "F" )
	    	.sort( ( a, b ) => neurons[a].dist - neurons[b].dist )[0],
	    route = new Array( neurons[pos].dist );
	while( neurons[pos].type !== "S" ){
		let [ x, y ] = pos.split( ":" ).map( Number ),
		    dist = neurons[pos].dist - 1,
		    dir = neigh.findIndex( ( [ incX, incY ] ) => {
		    	let pos = ( x - incX ) + ":" + ( y - incY );
		    	return pos in neurons && neurons[pos].dist === dist;
		    } );
		route[dist] = "UDLR".charAt( dir );
		pos = ( x - neigh[dir][0] ) + ":" + ( y - neigh[dir][1] );
	}
	return route.join( "" );
}
