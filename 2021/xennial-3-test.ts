type Maze = string[][];
type MazeNode = { id: number; r: number; c: number; type: string, keys: string[]; num$: number; group?: MazeNode[] };
type Path = { path: MazeNode[]; dist: number };

const RDLU = [ [ 0,  1], [ 1,  0], [ 0, -1], [-1,  0] ];
const reKey  = /^[a-z]$/;
const reDoor = /^[A-Z]$/;

// read maze and convert to 2d-array
const maze : Maze = require("fs")
    .readFileSync("xennial-3-maze.txt")
    .toString()
    .split(/\n/)
    .map( row => row.split(""));

// find start, goal, key and treasure nodes in maze
const nodes : MazeNode[] = [];
maze.forEach( (row, r) =>
    row.forEach( (type, c) => {
        if( /[<>a-z$]/.test(type) ){
            nodes.push({
                id: nodes.length,
                r,
                c,
                type,
                keys: reKey.test(type) ? [type] : [],
                num$: type == "$" ? 1 : 0
            })
        }
    })
);

// calculate distances between nodes for every possible key combination
const distance = (function(){
    const allKeys : string[] = nodes.filter( n => /[a-z]/.test(n.type)).map( n => n.type).sort();
    const dist = {};
    for( let i = 0; i < 2 ** allKeys.length; i++ ){
        let keys = i.toString(2).split("").reverse().map( ( digit, i) => digit == "1" ? allKeys[i] : "").join("");
        dist[keys] = new Array(nodes.length - 1);
        for( let j = 0; j < nodes.length - 1; j++ ){
            dist[keys][j] = new Array(nodes.length - j - 1);
            let d = walkMaze( keys, nodes[j]);
            for( let k = j + 1; k < nodes.length; k++ ){
                dist[keys][j][k - j - 1] = d[nodes[k].r][nodes[k].c];
            }
        }
    }
    return function( node1 : MazeNode, node2 : MazeNode, keys : string) : number {
        return node1.id < node2.id
            ? dist[keys][node1.id][node2.id-node1.id-1]
            : dist[keys][node2.id][node1.id-node2.id-1];
    }
})();

// pull out start and goal nodes
const start : MazeNode   = nodes.splice( nodes.findIndex( n => n.type == "<"), 1)[0];
const goal  : MazeNode   = nodes.splice( nodes.findIndex( n => n.type == ">"), 1)[0];

// group nodes by proximity
const nodeGroups: MazeNode[] = [];
nodes.forEach( ( node, i) => {
    if( !nodes.slice(i + 1).some( n => distance( node, n, "") <= 10) ){
        let group = nodes.filter( n => node == n || distance( node, n, "") <= 10);
        nodeGroups.push({
            id: group[0].id,
            r: group[0].r,
            c: group[0].c,
            type: group.map( n => n.type).join(""),
            keys: group.filter( n => reKey.test(n.type)).map( n => n.type),
            num$: group.filter( n => n.type == "$").length,
            group
        });
    }
});

// calculate baseline path by simply traversing from nearest node to nearest node until all nodes reached
let greedyPath : Path = { path: [start], dist: 0 };
while( greedyPath.path[0] != goal ){
    let keys = [].concat(...greedyPath.path.map( n => n.keys)).sort().join(""),
        nextNode = nodeGroups
            .filter( n => !greedyPath.path.includes(n))
            .sort( ( a, b) => distance( greedyPath.path[0], a, keys) - distance( greedyPath.path[0], b, keys))[0] || goal;
    greedyPath.dist += distance( greedyPath.path[0], nextNode, keys);
    greedyPath.path.unshift(nextNode);
}

let bestPath = findBestPath( start, goal, nodeGroups, [], greedyPath.dist);

// dirty hack to boost score
// 1081 GOTO 1120 : REM +312 points
// 1501 GOTO 1780 : REM +numSteps * ??? points

function walkMaze( keys : string = "", start : MazeNode, goal? : MazeNode ) : number[][] {
    let dist : number[][] = maze.map( row => new Array(row.length).fill(Infinity)),
        queue : { r: number; c: number }[] = [start];
    dist[start.r][start.c] = 0;
    while( queue.length ){
        let { r, c } = queue.shift(),
            d = dist[r][c];
        for( let i = 0; i < RDLU.length; i++ ){
            let [ rr, cc ] = RDLU[i];
            rr += r;
            cc += c;
            let type = maze[rr][cc];
            if( dist[rr][cc] > d + 1 && type != "#" && (!reDoor.test(type) || keys.includes(type.toLowerCase())) ){
                dist[rr][cc] = d + 1;
                if( goal && rr == goal.r && cc == goal.c ){
                    return dist;
                }
                queue.push({ r: rr, c: cc });
            }
        }
    }
    return dist;
}

function findBestPath( start : MazeNode, goal : MazeNode, nodes : MazeNode[], keys : string[] = [], MAX_DISTANCE : number = Infinity) : Path {
    let bestPath : Path = {
            path: [],
            dist: Infinity
        },
        keyStr = keys.sort().join("");
    if( nodes.every( n => n.num$ == 0) && distance( start, goal, keyStr) < MAX_DISTANCE ){
        bestPath = {
            path: [goal],
            dist: distance( start, goal, keyStr)
        };
        MAX_DISTANCE = bestPath.dist;
    }
    for( let i = 0; i < nodes.length; i++ ){
        let dist = distance( start, nodes[i], keyStr);
        if( dist < MAX_DISTANCE ){
            let path = findBestPath(
                nodes[i],
                goal,
                nodes.filter( ( n, j) => i != j),
                keys.concat(nodes[i].keys),
                MAX_DISTANCE - dist,
            );
            if( path.dist < MAX_DISTANCE ){
                bestPath = path;
                bestPath.dist += dist;
                MAX_DISTANCE = bestPath.dist;
            }
        }
    }
    bestPath.path.unshift(start);
    return bestPath;
}