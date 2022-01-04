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

/*  of course i try to figure out what other code the maze is running by blindly feeling around in the dark
    and i never think to just flip the light switch thats sitting right there the whole time
    here is the source, straight from the source (note the bug at lines 2150/2160)
10 GOSUB 1000
20 GOSUB 1500 : REM print maze
25 GOSUB 3000 : REM get player input
30 GOSUB 2000 : REM check player movement
40 GOTO 20
999 stop

1000 REM initialize maze
1010 height = PEEK(14) : width = PEEK(15)
1020 startrow = PEEK(10) : startcol = PEEK(11)
1030 endrow = PEEK(12) : endcol = PEEK(13)
1040 maze_drawn = -1
1050 POKE 1, startrow : POKE 2, startcol
1060 DIM KEYS(10)
1070 letters$ = "abcdefghij"
1080 treasure = 0 
1090 for i = 0 to height*width-1 
1100     if peek(16+i) = 2 then treasure = treasure + 1 
1110 next
1120 RETURN

1500 REM print maze
1510 sh = PEEK(6)-4 : sw = PEEK(5)-5 : REM screen height and width
1520 pr = peek(1) : pc = peek(2) : REM player row, col
1530 sr = pr/sh : sc = pc/sw : REM screen row, col
1540 todraw = sr*100 + sc*10
1550 IF maze_drawn = todraw THEN GOTO 1680
1560 maze_drawn = todraw : ppr = pr : ppc = pc
1570 br = sr*sh : bc = sc*sw : REM base row, col
1580 CLS : LOCATE 2,1
1590 FOR row = 0 TO sh-1
1600     IF br+row >= height THEN GOTO 1670
1610     LET s$ = ""
1620     FOR col = 0 TO sw-1
1630         IF bc+col >= width THEN GOTO 1660
1640         LET cell = PEEK(16 + (br+row)*width + (bc+col))
1650         LET s$ = s$ + MID$(" #$-------abcdefghijABCDEFGHIJ", cell, 1)
1660     NEXT col: PRINT s$
1670 NEXT row: PRINT ""
1680 REM erase the previous player position and print the new one
1690 LOCATE 2+ppr-br, 1+ppc-bc : PRINT " ";
1700 pr = PEEK(1) : pc = PEEK(2)
1710 LOCATE 2+pr-br, 1+pc-bc : PRINT "@";
1720 ppc = pc : ppr = pr : REM previous player position
1730 LOCATE 1,1 : PRINT "STEPS: "; steps; " SCREEN ("; sc; ","; sr; ") ";
1740 LOCATE sh+2 : PRINT "POSITION "; pr; ","; pc; " GOAL: "; endrow; ","; endcol; "   "
1750 PRINT "KEYS: ";: FOR i = 0 TO 9 : IF KEYS(i) THEN PRINT mid$(letters$, i, 1);: ELSE PRINT " ";
1760 NEXT i
1770 PRINT "", "TREASURE: FOUND "; found; " OUT OF "; treasure;
1780 LET steps = steps + 1
1790 RETURN

2000 REM player movement
2010 dir = PEEK(0)
2020 nr = PEEK(1) : nc = PEEK(2)
2030 IF dir = 0 THEN nc = nc + 1
2040 IF dir = 1 THEN nr = nr + 1
2050 IF dir = 2 THEN nc = nc - 1
2060 IF dir = 3 THEN nr = nr - 1
2070 cell = PEEK(16 + nr * width + nc)
2080 IF cell = 1 THEN
2090     LOCATE 1 : PRINT "You can't go that way. dir="; dir; " row,col="; nr; " "; nc
2100     STOP
2110 ELSE IF cell = 2 THEN
2120     LET found = found + 1
2130 ELSE IF cell >= 10 AND cell <= 19 THEN
2140     LET keys(cell-10) = 1
2150 ELSE IF cell >= 20 AND cell <= 19 THEN
2160     IF keys(cell-20) = 1 THEN GOTO 2090
2170 END IF
2180 POKE 16 + nr * width + nc, 0
2190 POKE 1, nr : POKE 2, nc
2200 REM check win condition
2210 IF PEEK(1) = endrow AND PEEK(2) = endcol THEN
2220     LOCATE 1 : PRINT "Mission accomplished!   "
2230     STOP
2240 END IF
2250 RETURN

REM editable:
3000 REM TODO: solve the maze... here is similar starting code as before
3010 LET player_row = PEEK(1)
3020 LET player_col = PEEK(2)
3030 REM these variables tell whether there's a wall in that direction
3040 DIM dirs(4)
3050 LET dirs(0) = PEEK(16 + player_row * width + player_col + 1)
3060 LET dirs(1) = PEEK(16 + (player_row+1) * width + player_col)
3070 LET dirs(2) = PEEK(16 + player_row * width + player_col - 1)
3080 LET dirs(3) = PEEK(16 + (player_row-1) * width + player_col)
3090 FOR i = 0 TO 3 : REM replace doors by open space or walls
3100     IF dirs(i) >= 20 THEN
3110         IF keys(dirs(i)-20)=0 THEN dirs(i) = 1 ELSE dirs(i) = 0
3120     END IF 
3130 NEXT
3140 REM TODO: write the next direction at memory address 0
3150 REM directions: 0=right, 1=down, 2=left, 3=up
3160 REM here's an interactive version
3170 GET key
3180 IF key = -2 THEN POKE 0, 1 : RETURN : REM no user present
3190 IF key = -1 THEN PAUSE 100: GOTO 3170 : REM wait for input
3200 IF key = 13 THEN STOP : REM user wants out
3210 IF key < 4 AND dirs(key) <> 1 THEN POKE 0, key : RETURN
3220 PAUSE 100 : GOTO 3170 : REM ignore key, wait for next one
3230 POKE 0, key : RETURN
*/