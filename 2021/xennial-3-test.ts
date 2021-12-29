type Maze = string[][];
type MazeNode = { id: number; type: string; r: number; c: number };

const data = require("./xennial-3-mazedata.json");

const maze  : Maze       = data.maze;
const start : MazeNode   = data.nodes.splice( data.nodes.findIndex( n => n.type == "<"), 1)[0];
const goal  : MazeNode   = data.nodes.splice( data.nodes.findIndex( n => n.type == ">"), 1)[0];
let nodes : MazeNode[] = data.nodes;

function distance( node1 : MazeNode, node2 : MazeNode, keys : string) : number {
    return node1.id < node2.id
        ? (data.distance[keys][node1.id][node2.id-node1.id-1] || Infinity)
        : (data.distance[keys][node2.id][node1.id-node2.id-1] || Infinity);
}

const reDoor = /^[A-Z]$/;
const reKey  = /^[a-z]$/;

nodes = nodes.filter( ( node, i) => node.type != "$" || !nodes.slice(i+1).some( n => Math.abs(node.r-n.r) + Math.abs(node.c-n.c) <= 10));
console.log( nodes );

// greedy path solution, used to give initial bound on distance
let BEST_PATH = [start],
    BEST_DISTANCE = 0;
while( BEST_PATH[BEST_PATH.length-1] != goal ){
    let keys = BEST_PATH.filter( n => reKey.test(n.type)).map( n => n.type).sort().join(""),
        currNode = BEST_PATH[BEST_PATH.length-1],
        nextNode = nodes.filter( n => !BEST_PATH.includes(n)).sort( ( n1, n2) => distance( currNode, n1, keys) - distance( currNode, n2, keys))[0] || goal;
    BEST_DISTANCE += distance( currNode, nextNode, keys);
    BEST_PATH.push(nextNode);
}

let MAX_$ = nodes.filter(n => n.type == "$").length,
    queue = [{
        path: [start],
        dist: 0,
        keys: "",
        num$: 0
    }];
console.log( `BEST_DISTANCE: ${BEST_DISTANCE} --- queue length = ${queue.length}`);
while( queue.length ){
    let { path, dist, keys, num$ } = queue.pop();
    nodes.filter( n => !path.includes(n)).forEach( n => {
        let d = dist + distance( path[path.length-1], n, keys);
        if( d < BEST_DISTANCE ){
            let k = !reKey.test(n.type) ? keys : [ n.type, ...keys.split("")].sort().join(""),
                n$ = n.type != "$" ? num$ : num$ + 1;
            if( n$ == MAX_$ && d + distance( n, goal, k) < BEST_DISTANCE ){
                BEST_PATH = path.concat( n, goal);
                BEST_DISTANCE = d + distance( n, goal, k);
                queue = queue.slice( queue.findIndex( ({dist}) => dist < BEST_DISTANCE));
                console.log( `BEST_DISTANCE: ${BEST_DISTANCE} --- queue length = ${queue.length}`);
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
