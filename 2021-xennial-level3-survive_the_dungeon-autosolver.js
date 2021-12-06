const RDLU = [
    [  0,  1], // R
    [  1,  0], // D
    [  0, -1], // L
    [ -1,  0]  // U
];

const RE = {
    door  : /^[A-Z]$/,
    key   : /^[a-z]$/g,
    target: /^[a-z\$<>]$/
};

function findTargets(maze){
    let targets = [];
    maze.forEach( ( row, r) => {
        row.forEach( ( col, c) => {
            if( RE.target.test(col) ){
                targets.push( {
                    id: targets.length,
                    r,
                    c,
                    type: col,
                    keys: col.match(RE.key) || []
                });
            }
        })
    })
    return targets;
}

function walkMaze( start, keys, maze, endPos){
    let dist = maze.map( r => r.map( c => Infinity)),
        queue = [[start.r, start.c]];
    dist[start.r][start.c] = 0;
    while( queue.length ){
        [r, c] = queue.shift();
        let d = dist[r][c];
        for( let i = 0; i < RDLU.length; i++ ){
            let rr = r + RDLU[i][0],
                cc = c + RDLU[i][1];
            let pos = maze[rr][cc];
            // return if tile is: already checked, a wall, or a locked door w/o a key
            if( dist[rr][cc] > d + 1 && pos != "#" && (!RE.door.test(pos) || keys.includes(pos.toLowerCase())) ){
                dist[rr][cc] = d + 1;
                if( endPos && rr == endPos.r && cc == endPos.c ){
                    return dist;
                }
                queue.push([rr,cc]);
            }
        }
    }
    return dist;
}

function calcDistances( targets, maze){
    let distance = window.FOO = {},
        allKeys = [].concat(...targets.map(t=>t.keys)).sort().join("");
    for( let i = 0; i < 2**allKeys.length; i++){
        let keys = [];
        // convert number into keys, if bit is set add corresponding key
        // eg. bit 1 -> a, bit 2 -> b, etc...
        i.toString(2).split("").reverse().forEach( ( x, j) => {
            if( x == "1" ){
                keys.push(allKeys.charAt(j));
            }
        });
        let temp = distance[keys.join("")] = new Array(targets.length-1);
        for( let j = 0; j < targets.length - 1; j++ ){
            temp[j] = new Array(targets.length - 1 - j);
            let dist = walkMaze( targets[j], keys, maze);
            for( let k = j + 1; k < targets.length; k++ ){
                temp[j][k-j-1] = dist[targets[k].r][targets[k].c];
            }
        }
    }
    return function( t1, t2, keys){
        if( t2 < t1 ){
            let temp = t1;
            t1 = t2;
            t2 = temp;
        }
        return distance[keys][t1][t2-t1-1];
    }
}

function groupTargets( targets, MAX_DIST = 10){
    let clusters = [];
    targets = targets.slice();
    while( targets.length ){
        let t = targets.shift(),
            c = [ t, ...targets.filter( u => distance( t.id, u.id, "") <= MAX_DIST)],
            avgR = c.map( t => t.r).reduce((X,x)=>X+x) / c.length,
            avgC = c.map( t => t.c).reduce((X,x)=>X+x) / c.length,
            centroid = c.map( t => ({ t, dist: Math.abs(t.r-avgR)+Math.abs(t.c-avgC) })).sort( (a,b)=>a.dist-b.dist||a.id-b.id)[0].t;
        clusters.push({
            id: centroid.id,
            r: centroid.r,
            c: centroid.c,
            type: c.map( t => t.type).sort().join(""),
            keys: [].concat( ...c.map( t => t.keys)),
            cluster: c,
            treasure: c.some( t => t.type == "$")
        });
        targets = targets.filter( t => !c.includes(t));
    }
    return clusters;
}

function findBestPath( start, targets, goal, keys = [], maxDist = Infinity){
    window.COUNT++;
    let bestPath = {
            dist: maxDist,
            path: [] 
        },
        k = keys.sort().join("");

    for( let i = 0; i < targets.length; i++ ){
        let t = targets[i],
            dist = distance( start.id, t.id, k);
        if( dist < bestPath.dist ){
            let path = findBestPath( t, targets.filter( tt => tt != t), goal, keys.concat(t.keys), bestPath.dist - dist);
            if( dist + path.dist < bestPath.dist ){
                bestPath = path;
                bestPath.dist += dist;
            }
        }
    }

    if( !targets.some( t => t.treasure) ){
        let dist = distance( start.id, goal.id, k);
        if( dist < bestPath.dist ){
            bestPath = {
                dist: dist,
                path: [goal]
            }
        }
    }

    bestPath.path.unshift(start);
    return bestPath;
}

function findSteps( t0, t1, keys, maze){
    let dist = walkMaze( t0, keys, maze, t1),
        { r, c } = t1,
        numSteps = dist[r][c],
        steps = new Array(numSteps);
    for( let i = numSteps - 1; i >= 0; i-- ){
        for( let j = 0; j < RDLU.length; j++ ){
            let rr = r - RDLU[j][0],
                cc = c - RDLU[j][1];
            if( dist[rr][cc] == i ){
                r = rr;
                c = cc;
                steps[i] = j;
                j = RDLU.length;
            }
        }
    }
    return steps;
}

let mazeFile = "2021-xennial-level3-survive_the_dungeon-maze.txt";
//let maze = require("fs").readFileSync(mazeFile).toString().split(/\n/).map( row => row.split(""));
let maze = document.body.innerText.split(/\n/).map( row => row.split(""));
//let maze = document.body.innerText.replace(/[defhi]/g,".").replace(/[DEFHI]/g,"#").split(/\n/).map( row => row.split(""));
let targets = findTargets(maze);
let distance = calcDistances( targets, maze);
let start = targets.splice( targets.findIndex( t => t.type == "<"), 1)[0];
let goal = targets.splice( targets.findIndex( t => t.type == "<"), 1)[0];
let clusters = groupTargets(targets.filter( t => !/[defhi]/.test(t.type)));
let path = [],
    bestPath = findBestPath( start, clusters, goal);
bestPath.path.forEach( ( p, i, P) => {
    let keys = [].concat( ...path.map( t => t.keys));
    if( "cluster" in p && p.cluster.length > 1 ){
        p.cluster.forEach( t => t.treasure = true);
        let q = findBestPath( path[path.length-1], p.cluster, P[i+1], keys);
        path.push( ...q.path.slice( 1, -1));
    }
    else{
        path.push(p);
    }
});
maze[goal.r][goal.c] = "#";
let keys = [],
    steps = [];
for( let i = 0; i < path.length - 1; i++ ){
    if( path[i+1] == goal ) maze[goal.r][goal.c] = " ";
    keys.push( ...path[i].keys);
    steps.push( ...findSteps( path[i], path[i+1], keys, maze));
}
document.body.innerText = steps.map( ( s, i) => `${3001+i} POKE 0, ${s} : RETURN`).join("\n");
