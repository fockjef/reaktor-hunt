const RDLU = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const reKey = /^[a-z]$/;
const reDoor = /^[A-Z]$/;
// read maze and convert to 2d-array
const maze = require("fs")
    .readFileSync("xennial-3-maze.txt")
    .toString()
    .split(/\n/)
    .map(row => row.split(""));
// find start, goal, key and treasure nodes in maze
const nodes = [];
maze.forEach((row, r) => row.forEach((type, c) => {
    if (/[<>a-z$]/.test(type)) {
        nodes.push({
            id: nodes.length,
            r,
            c,
            type,
            keys: reKey.test(type) ? [type] : [],
            num$: type == "$" ? 1 : 0
        });
    }
}));
// all keys in the maze, duh!
const allKeys = nodes.filter(n => /[a-z]/.test(n.type)).map(n => n.type).sort().join("");
// calculate distances between nodes for every possible key combination
const distance = (function () {
    const dist = {};
    for (let i = 0; i < Math.pow(2, allKeys.length); i++) {
        let keys = i.toString(2).split("").reverse().map((digit, i) => digit == "1" ? allKeys[i] : "").join("");
        dist[keys] = new Array(nodes.length - 1);
        for (let j = 0; j < nodes.length - 1; j++) {
            dist[keys][j] = new Array(nodes.length - j - 1);
            let d = walkMaze(keys, nodes[j]);
            for (let k = j + 1; k < nodes.length; k++) {
                dist[keys][j][k - j - 1] = d[nodes[k].r][nodes[k].c];
            }
        }
    }
    return function (node1, node2, keys) {
        return node1.id < node2.id
            ? dist[keys][node1.id][node2.id - node1.id - 1]
            : dist[keys][node2.id][node1.id - node2.id - 1];
    };
})();
// pull out start and goal nodes
const start = nodes.splice(nodes.findIndex(n => n.type == "<"), 1)[0];
const goal = nodes.splice(nodes.findIndex(n => n.type == ">"), 1)[0];
// group nodes by proximity
const nodeGroups = [];
nodes.forEach((node, i) => {
    if (!nodes.slice(i + 1).some(n => distance(node, n, "") <= 10)) {
        let group = nodes.filter(n => node == n || distance(node, n, "") <= 10);
        nodeGroups.push({
            id: group[0].id,
            r: group[0].r,
            c: group[0].c,
            type: group.map(n => n.type).join(""),
            keys: group.filter(n => reKey.test(n.type)).map(n => n.type),
            num$: group.filter(n => n.type == "$").length,
            group
        });
    }
});
// calculate baseline path by traversing from nearest node to nearest node until all nodes reached
let basePath = { path: [start], dist: 0 };
while (basePath.path[0] != goal) {
    let keys = [].concat(...basePath.path.map(n => n.keys)).sort().join(""), nextNode = nodeGroups
        .filter(n => !basePath.path.includes(n))
        .sort((a, b) => distance(basePath.path[0], a, keys) - distance(basePath.path[0], b, keys))[0] || goal;
    basePath.dist += distance(basePath.path[0], nextNode, keys);
    basePath.path.unshift(nextNode);
}
// find the best path!
let bestPath = findBestPath(start, goal, nodeGroups, [], basePath.dist);
// determine which keys are actually used
let requiredKeys = new Set();
bestPath.path.forEach((node, i, path) => {
    let keys = [].concat(...path.slice(0, i).map(n => n.keys));
    if (keys.length) {
        let keyStr = keys.sort().join(""), dist = distance(path[i - 1], node, keyStr);
        keys.forEach(k => {
            if (!requiredKeys.has(k)) {
                let kS = keyStr.replace(k, "");
                if (distance(path[i - 1], node, kS) != dist) {
                    requiredKeys.add(k);
                }
            }
        });
    }
});
// find best path through all nodes, not just node groups
let fullPath = [];
for (let i = 0, path = bestPath.path; i < path.length; i++) {
    if (!path[i].group || path[i].group.length == 1) {
        fullPath.push(path[i]);
    }
    else {
        let group = path[i].group.filter(n => n.type == "$" || requiredKeys.has(n.type));
        group.forEach(node => node.num$ = 1);
        fullPath.push(...findBestPath(path[i - 1], path[i + 1], group, [].concat(...path.slice(0, i).map(n => n.keys))).path.slice(1, -1));
    }
}
// calculate steps through the maze
let allSteps = [];
maze[goal.r][goal.c] = "#"; // block off the exit until final step
RDLU.splice(0, 0, ...RDLU.splice(2, 2)); // swap R/L & U/D to favor moving right
for (let i = 0, keys = []; i < fullPath.length - 1; i++) {
    if (fullPath[i + 1] == goal)
        maze[goal.r][goal.c] = "."; // unblock the exit
    keys.push(...fullPath[i].keys);
    let dist = walkMaze(keys.sort().join(""), fullPath[i], fullPath[i + 1]), { r, c } = fullPath[i + 1], steps = [];
    while (dist[r][c]) {
        for (let j = 0; j < RDLU.length; j++) {
            let [rr, cc] = RDLU[j];
            rr += r;
            cc += c;
            if (dist[rr][cc] < dist[r][c]) {
                steps.push(j);
                r = rr;
                c = cc;
                j = RDLU.length;
            }
        }
    }
    allSteps.push(...steps.reverse());
}
console.log([
    "3000 GOTO 3000 + steps",
    ...allSteps.map((dir, i) => `${3001 + i} POKE 0, ${dir} : RETURN`)
].join("\n"));
function walkMaze(keys = "", start, goal) {
    let dist = maze.map(row => new Array(row.length).fill(Infinity)), queue = [start];
    dist[start.r][start.c] = 0;
    while (queue.length) {
        let { r, c } = queue.shift(), d = dist[r][c];
        for (let i = 0; i < RDLU.length; i++) {
            let [rr, cc] = RDLU[i];
            rr += r;
            cc += c;
            let type = maze[rr][cc];
            if (dist[rr][cc] > d + 1 && type != "#" && (!reDoor.test(type) || keys.includes(type.toLowerCase()))) {
                dist[rr][cc] = d + 1;
                if (goal && rr == goal.r && cc == goal.c) {
                    return dist;
                }
                queue.push({ r: rr, c: cc });
            }
        }
    }
    return dist;
}
function findBestPath(start, goal, nodes, keys = [], MAX_DISTANCE = Infinity) {
    let bestPath = {
        path: [],
        dist: Infinity
    }, keyStr = keys.sort().join("");
    if (nodes.every(n => n.num$ == 0) && distance(start, goal, keyStr) < MAX_DISTANCE) {
        bestPath = {
            path: [goal],
            dist: distance(start, goal, keyStr)
        };
        MAX_DISTANCE = bestPath.dist;
    }
    for (let i = 0; i < nodes.length; i++) {
        let dist = distance(start, nodes[i], keyStr);
        if (dist + distance(nodes[i], goal, allKeys) < MAX_DISTANCE) {
            let path = findBestPath(nodes[i], goal, nodes.filter((n, j) => i != j), keys.concat(nodes[i].keys), MAX_DISTANCE - dist);
            if (path.dist < MAX_DISTANCE) {
                bestPath = path;
                bestPath.dist += dist;
                MAX_DISTANCE = bestPath.dist;
            }
        }
    }
    bestPath.path.unshift(start);
    return bestPath;
}
