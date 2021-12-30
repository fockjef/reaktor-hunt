type Maze = string[][];
type MazeNode = { id: number; type: string; r: number; c: number };
type Path = { path: MazeNode[]; dist: number };

const data = require("./xennial-3-mazedata.json");

const maze  : Maze       = data.maze;
const start : MazeNode   = data.nodes.splice( data.nodes.findIndex( n => n.type == "<"), 1)[0];
const goal  : MazeNode   = data.nodes.splice( data.nodes.findIndex( n => n.type == ">"), 1)[0];
const nodes : MazeNode[] = data.nodes;
const nodeGroups: MazeNode[] = nodes.filter( ( node, i) => node.type != "$" || !nodes.slice(i+1).some( n => Math.abs(node.r-n.r) + Math.abs(node.c-n.c) < 10));

const reKey  = /^[a-z]$/;

function distance( node1 : MazeNode, node2 : MazeNode, keys : string) : number {
    return node1.id < node2.id
        ? (data.distance[keys][node1.id][node2.id-node1.id-1] || Infinity)
        : (data.distance[keys][node2.id][node1.id-node2.id-1] || Infinity);
}

function findBestPath( start : MazeNode, goal : MazeNode, nodes : MazeNode[], visited : number[], keys : string[], remaining$ : number, MAX_DISTANCE : number = Infinity) : Path {
    let keyStr = keys.sort().join(""),
        bestPath : Path;
    if( remaining$ == 0 && distance( start, goal, keyStr) < MAX_DISTANCE ){
        bestPath = {
            path: [goal],
            dist: distance( start, goal, keyStr)
        };
        MAX_DISTANCE = bestPath.dist;
        console.log( "MAX_DISTANCE", MAX_DISTANCE);
    }
    for( let i = 0; i < nodes.length; i++ ){
        if( !visited[i] ){
            let dist = distance( start, nodes[i], keyStr);
            if( dist < MAX_DISTANCE ){
                visited[i] = 1;
                let path = findBestPath(
                    nodes[i],
                    goal, 
                    nodes, 
                    visited, 
                    reKey.test(nodes[i].type) ? keys.concat(nodes[i].type) : keys, 
                    nodes[i].type == "$" ? remaining$ - 1 : remaining$,
                    MAX_DISTANCE - dist,
                );
                visited[i] = 0;
                if( path.dist < MAX_DISTANCE ){
                    bestPath = path;
                    MAX_DISTANCE = bestPath.dist;
                    console.log( "MAX_DISTANCE", MAX_DISTANCE);
                }
            }
        }
    }
    bestPath.path.unshift(start);
    return bestPath;
}

let bestPath = findBestPath(
    start, 
    goal, 
    nodeGroups, 
    nodeGroups.map( () => 0), 
    [], 
    nodeGroups.filter( n => n.type == "$"),
);
console.log(bestPath);

// dirty hack to boost score
// 1081 GOTO 1120 : REM +312 points
// 1501 GOTO 1780 : REM +numSteps * ??? points