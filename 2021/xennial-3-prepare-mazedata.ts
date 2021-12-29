type Maze = string[][];
type MazeNode = { id: number; type: string; r: number; c: number };

const fs = require('fs');
const RDLU = [ [ 0,  1], [ 1,  0], [ 0, -1], [-1,  0] ];
const reDoor = /[A-Z]/;

function walkMaze( start : MazeNode, keys : string = "") : number[][] {
    let dist : number[][] = maze.map( row => new Array(row.length).fill(Infinity)),
        queue : { r: number; c: number }[] = [start];
    dist[start.r][start.c] = 0;
    while( queue.length ){
        let { r, c } = queue.shift(),
            d = dist[r][c];
        RDLU.forEach( ([ rr, cc ]) => {
            rr += r;
            cc += c;
            let type = maze[rr][cc];
            if( dist[rr][cc] > d + 1 && type != "#" && (!reDoor.test(type) || keys.includes(type.toLowerCase())) ){
                dist[rr][cc] = d + 1;
                queue.push({ r: rr, c: cc });
            }
        });
    }
    return dist;
}

// read maze and convert to 2d-array
const maze : Maze = fs.readFileSync("xennial-3-maze.txt").toString().split(/\n/).map((row) => row.split(""));

// find start, goal, key and treasure nodes in maze
const nodes : MazeNode[] = [];
maze.forEach( (row, r) =>
    row.forEach( (type, c) =>
        /[<>a-z$]/.test(type) && nodes.push({ id: nodes.length, type, r, c })
    )
);

// calculate distances between nodes for every possible key combination
const allKeys : string[] = nodes.filter( n => /[a-z]/.test(n.type)).map( n => n.type).sort();
const distance = {};
for( let i = 0; i < 2 ** allKeys.length; i++ ){
    let keys = i.toString(2).split("").reverse().map( ( digit, i) => digit == "1" ? allKeys[i] : "").join("");
    distance[keys] = new Array(nodes.length - 1);
    for( let j = 0; j < nodes.length - 1; j++ ){
        distance[keys][j] = new Array(nodes.length - j - 1);
        let dist = walkMaze( nodes[j], keys);
        for( let k = j + 1; k < nodes.length; k++ ){
            distance[keys][j][k - j - 1] = dist[nodes[k].r][nodes[k].c];
        }
    }
}

fs.writeFileSync( "xennial-3-mazedata.json", JSON.stringify({ maze, nodes, distance }));
