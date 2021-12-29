type Maze = string[][];
type Node = { id: number; type: string; r: number; c: number };

const data = require("xennial-3-mazedata.json");
const maze  : Maze   = data.maze;
const start : Node   = data.nodes.shift();
const goal  : Node   = data.nodes.pop();
const nodes : Node[] = data.nodes;

function distance( node1 : Node, node2 : Node, keys : string) : number {
    return node1.id < node2.id
        ? data.distance[keys][node1.id][node2.id] || Infinity
        : data.distance[keys][node2.id][node1.id] || Infinity;
}

const reDoor = /^[A-Z]$/;
const reKey  = /^[a-z]$/;

// greedy path solution, used to give initial bound on distance
let BEST_PATH = [start],
    MAX_DISTANCE = 0;
while( path[0] != goal ){
    let keys = BEST_PATH.filter( n => reKey.test(n.type)).map( n => n.type).sort().join(""),
        currNode = BEST_PATH[BEST_PATH.length-1],
        nextNode = nodes.filter( n => !path.includes(n)).sort( ( n1, n2) => distance( currNode, n1, keys) - distance( currNode, t2, keys))[0] || goal;
    MAX_DISTANCE += distance( currNode, nextNode, keys);
    BEST_PATH.push(nextNode);
}

let MAX_$ = nodes.filter(n => n.type == "$").length,
    queue = [{
        path: [start],
        dist: 0,
        keys: "",
        num$: 0
    }];

while( queue.length ){
    let { path, dist, num$ } = queue.pop();
    nodes.filter( n => !path.includes(n)).forEach( n => {
        let d = dist + distance( path[path.length-1], n, keys);
        if( d < MAX_DISTANCE ){
            let k = !reKey.test(n.type) ? keys : [ n.type, ...k.split("")].sort().join(""),
                n$ = n.type != "$" ? num$ : num$ + 1;
            if( n$ == MAX_$ && d + distance( n, goal, k) < MAX_DISTANCE ){
                BEST_PATH = path.concat( n, goal);
                MAX_DISTANCE = d + distance( n, goal, k);
                queue = queue.slice( queue.findIndex( ({dist}) => dist < MAX_DISTANCE));
            }
            else{
                queue.push({
                    path: path.concat(n),
                    dist: d,
                    keys: k,
                    num$: n$
                })
            }
        }
    });
    queue.sort( ( a, b) => b.dist - a.dist);
}


const RDLU = [
    [ 0,  1], // R = 0
    [ 1,  0], // D = 1
    [ 0, -1], // L = 2
    [-1,  0], // U = 3
];

function walkMaze( start, keys = ""){
    let dist = maze.map( row => new Array(row.length).fill(Infinity)),
        queue = [start];
    dist[start.r][start.c] = 0;
    while( queue.length ){
        let { r, c } = queue.shift(),
            d = dist[r][c];
        RDLU.forEach( ([ rr, cc ]) => {
            rr += r;
            cc += c;
            type = maze[rr][cc];
            if( dist[rr][cc] > d + 1 && type != "#" && (!reDoor.test(type) || keys.includes(type.toLowerCase())) ){
                dist[rr][cc] = d + 1;
                queue.push({ r: rr, c: cc });
            }
        });
    }
    return dist;
}


//const maze = require("fs").readFileSync("xennial-3-maze.txt").toString().trim().split(/\n/).map( x => x.trim().split(""));
const maze = document.getElementById("mazedata").innerText.toString().trim().split(/\n/).map( x => x.trim().split(""));

const nodes = [];
maze.forEach( (row, r) => row.forEach( (type, c) => !"#.".includes(type) && !reDoor.test(type) && nodes.push({ type, r, c })));

const allKeys = nodes.filter( n => reKey.test(n.type)).map( n => n.type).sort();

const distance = {};
for( let i = 0; i < 2 ** allKeys.length; i++ ){
    let keys = i.toString(2).split("").reverse().map( ( digit, i) => digit == "1" ? allKeys[i] : "").join("");
    distance[keys] = Array.from( new Array(nodes.length), () => new Array(nodes.length).fill(0));
    for( let j = 0; j < nodes.length - 1; j++ ){
        let dist = walkMaze( nodes[j], keys);
        for( let k = j + 1; k < nodes.length; k++ ){
            distance[keys][j][k] = distance[keys][k][j] = dist[nodes[k].r][nodes[k].c];
        }
    }
}

function buildPath(path){

}

// greedy path solution, used to give initial bound on distance
let path = [start],
    MAX_DISTANCE = 0;
while( path[0] != goal ){
    let keys = path.filter( t => /[a-z]/.test(t.type)).map( t => t.type).sort().join(""),
        nextTarget = targets.filter( t => !path.includes(t)).sort( ( t1, t2) => distance( path[0].id, t1.id, keys) - distance( path[0].id, t2.id, keys))[0];
    if( !nextTarget ){
        nextTarget = goal;
    }
    MAX_DISTANCE += distance( path[0].id, nextTarget.id, keys);
    path.unshift(nextTarget);
}