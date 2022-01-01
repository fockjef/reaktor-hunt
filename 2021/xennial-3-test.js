console.log([
"1 DIM cnt(300)",
...Array.from( new Array(300), ( _, i) => `${i*10+3} cnt(${i}) = cnt(${i}) + 1`),
`
3000 IF steps < 10 THEN POKE 0, (steps-1)-4*((steps-1)/4) : RETURN;
3001 CLS
3002 FOR i = 0 TO 299
3003     IF cnt(i) > 0 THEN PRINT i*10; " = "; cnt(i)
3004 NEXT i
3005 STOP
`
].map( x => x.trim()).join("\n"));
