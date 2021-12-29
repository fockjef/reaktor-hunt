type Maze = string[][];

type Target = { id: number; type: string; r: number; c: number; keys: string[]; required: boolean; group?: Target[] };

type Path = { dist: number; path: Target[]; requiredKeys: string[] };

const RDLU = [
    [0, 1], // R = 0
    [1, 0], // D = 1
    [0, -1], // L = 2
    [-1, 0], // U = 3
];

const RE = {
    door: /^[A-Z]$/,
    key: /^[a-z]$/g,
    target: /^[a-z\$<>]$/,
};

function loadMaze(): Maze {
    let mazeText: string;
    if (typeof window == "undefined") {
        mazeText = require("fs").readFileSync("xennial-3-maze.txt").toString();
    } else {
        mazeText = document.getElementById("mazedata").innerText;
    }
    return mazeText.split(/\n/).map((row) => row.split(""));
}

function findTargets(): Target[] {
    let targets: Target[] = [];
    maze.forEach((row, r) => {
        row.forEach((type, c) => {
            if (RE.target.test(type)) {
                targets.push({
                    id: targets.length,
                    r,
                    c,
                    type,
                    keys: type.match(RE.key) || [],
                    required: type == "$",
                });
            }
        });
    });
    return targets;
}

function walkMaze(keys: string[], start: Target, end?: Target): number[][] {
    let distance: number[][] = maze.map((r) => r.map(() => Infinity)),
        queue: { r: number; c: number }[] = [start];
    distance[start.r][start.c] = 0;
    while (queue.length) {
        let { r, c } = queue.shift() as { r: number; c: number },
            d = distance[r][c];
        for (let i = 0; i < RDLU.length; i++) {
            let rr = r + RDLU[i][0],
                cc = c + RDLU[i][1],
                pos = maze[rr][cc];
            // return if tile is: already checked, a wall, or a locked door w/o a key
            if (distance[rr][cc] > d + 1 && pos != "#" && (!RE.door.test(pos) || keys.includes(pos.toLowerCase()))) {
                distance[rr][cc] = d + 1;
                if (end && rr == end.r && cc == end.c) {
                    return distance;
                }
                queue.push({ r: rr, c: cc });
            }
        }
    }
    return distance;
}

function calcDistances(targets: Target[]): (t1: number, t2: number, keys: string) => number {
    let distance: { [index: string]: number[][] } = {},
        allKeys: string = Array.prototype.concat
            .apply(
                [],
                targets.map((t) => t.keys)
            )
            .sort()
            .join("");
    for (let i = 0; i < 2 ** allKeys.length; i++) {
        let keys: string[] = [];
        // convert number into keys, if bit is set add corresponding key
        // bit 1 -> a, bit 2 -> b, etc...
        // ex: 75 = 1001011 -> ["a","b","d","g"]
        i.toString(2)
            .split("")
            .reverse()
            .forEach((x, j) => {
                if (x == "1") {
                    keys.push(allKeys.charAt(j));
                }
            });
        let temp = (distance[keys.join("")] = new Array(targets.length - 1));
        for (let j = 0; j < targets.length - 1; j++) {
            temp[j] = new Array(targets.length - 1 - j);
            let dist = walkMaze(keys, targets[j]);
            for (let k = j + 1; k < targets.length; k++) {
                temp[j][k - j - 1] = dist[targets[k].r][targets[k].c];
            }
        }
    }
    return function (t1: number, t2: number, keys: string): number {
        if (t2 < t1) {
            let temp = t1;
            t1 = t2;
            t2 = temp;
        }
        return distance[keys][t1][t2 - t1 - 1];
    };
}

function groupTargets(targets: Target[], MAX_DIST: number = 10): Target[] {
    let groups: Target[] = [];
    targets = targets.slice();
    while (targets.length) {
        let t: Target = targets.shift() as Target;
        if (t.type == "<" || t.type == ">") {
            t.group = [];
            groups.push(t);
        } else {
            let g: Target[] = [t, ...targets.filter((tt) => distance(t.id, tt.id, "") <= MAX_DIST)],
                avgR: number = g.map((t) => t.r).reduce((X, x) => X + x) / g.length,
                avgC: number = g.map((t) => t.c).reduce((X, x) => X + x) / g.length,
                centroid: Target = g
                    .map((t) => ({
                        t,
                        dist: Math.abs(t.r - avgR) + Math.abs(t.c - avgC),
                    }))
                    .sort((a, b) => a.dist - b.dist || a.t.id - b.t.id)[0].t;
            groups.push({
                id: centroid.id,
                type: g
                    .map((t) => t.type)
                    .sort()
                    .join(""),
                r: centroid.r,
                c: centroid.c,
                keys: Array.prototype.concat.apply(
                    [],
                    g.map((t) => t.keys)
                ),
                required: g.some((t) => t.required),
                group: g,
            });
            targets = targets.filter((t) => !g.includes(t));
        }
    }
    return groups;
}

function findBestPath(start: Target, end: Target, targets: Target[], keys: string[] = [], maxDist: number = Infinity): Path {
    let bestPath: Path = {
            dist: maxDist,
            path: [],
            requiredKeys: [],
        },
        k = keys.sort().join("");

    for (let i = 0; i < targets.length; i++) {
        let t = targets[i],
            dist = distance(start.id, t.id, k);
        if (dist < bestPath.dist) {
            let path = findBestPath(
                t,
                end,
                targets.filter((tt) => tt != t),
                keys.concat(t.keys),
                bestPath.dist - dist
            );
            if (dist + path.dist < bestPath.dist) {
                bestPath = path;
                bestPath.dist += dist;
                keys.forEach((kk) => {
                    if (!bestPath.requiredKeys.includes(kk) && distance(start.id, t.id, k.replace(kk, "")) != dist) {
                        bestPath.requiredKeys.push(kk);
                    }
                });
            }
        }
    }

    if (!targets.some((t) => t.required)) {
        let dist = distance(start.id, end.id, k);
        if (dist < bestPath.dist) {
            bestPath = {
                dist: dist,
                path: [end],
                requiredKeys: [],
            };
        }
    }

    bestPath.path.unshift(start);
    return bestPath;
}

function findSteps(keys: string[], start: Target, end: Target): number[] {
    let dist = walkMaze(keys, start, end),
        { r, c } = end,
        numSteps = dist[r][c],
        steps = new Array(numSteps);
    for (let i = numSteps - 1; i >= 0; i--) {
        for (let j = 0; j < RDLU.length; j++) {
            let rr = r - RDLU[j][0],
                cc = c - RDLU[j][1];
            if (dist[rr][cc] == i) {
                r = rr;
                c = cc;
                steps[i] = j;
                j = RDLU.length;
            }
        }
    }
    return steps;
}

let maze: Maze = loadMaze();
let targets: Target[] = findTargets();
let distance = calcDistances(targets);
let start: Target = targets.splice(
    targets.findIndex((t) => t.type == "<"),
    1
)[0];
let goal: Target = targets.splice(
    targets.findIndex((t) => t.type == "<"),
    1
)[0];
let groups: Target[] = groupTargets(targets);
let path: Target[] = [],
    bestPath = findBestPath(start, goal, groups);
bestPath.path.forEach((p, i, P) => {
    let keys = Array.prototype.concat.apply(
        [],
        path.map((t) => t.keys)
    );
    if (p.group && p.group.length > 1) {
        p.group.forEach((t) => (t.required = t.type == "$" || bestPath.requiredKeys.includes(t.type)));
        let q = findBestPath(path[path.length - 1], P[i + 1], p.group, keys);
        path.push(...q.path.slice(1, -1));
    } else {
        path.push(p);
    }
});
maze[goal.r][goal.c] = "#";
let keys = [],
    steps = [];
for (let i = 0; i < path.length - 1; i++) {
    if (path[i + 1] == goal) maze[goal.r][goal.c] = " ";
    keys.push(...path[i].keys);
    steps.push(...findSteps(keys, path[i], path[i + 1]));
}

// bypass drawing:
// 1501 GOTO 1779
// 1779 LOCATE 1, 1 : PRINT (100 * steps) / 2309; "%"
let code = "3000 GOTO 3000 + steps\n" + steps.map((s, i) => `${3001 + i} POKE 0, ${s} : RETURN`).join("\n");
if (typeof window == "undefined") {
    console.log(code);
} else {
    document.getElementById("app").getElementsByTagName("textarea")[0].value = code;
    [...document.getElementById("app").getElementsByTagName("button")].filter((b) => b.innerText == "RUN")[0].click();
}
