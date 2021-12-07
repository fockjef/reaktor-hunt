600 REM print maze
610 IF steps > 0 THEN GOTO 710
620 prow = PEEK(1) : pcol = PEEK(2) : REM player row, column
630 LOCATE 2,1
640 FOR row = 0 TO height-1
650     LET maze$ = ""
660     FOR col = 0 TO width-1
670         maze$ = maze$ + MID$(" X", PEEK(16 + row * width + col), 1)
680     NEXT col
690     PRINT maze$
700 NEXT row
710 REM erase the previous player position and print the new one
720 LOCATE 2 + prow, 1 + pcol : PRINT " ";
730 prow = PEEK(1) : pcol = PEEK(2)
740 LOCATE 2 + prow, 1 + pcol : PRINT "@";
750 REM print the number of steps so far
760 LOCATE 1,10 : PRINT "STEPS: "; steps;
770 LET steps = steps + 1
780 RETURN

1000 REM advanced maze solver, breadth-first shortest path
1000 IF steps > 1 THEN GOTO 1120
1010 LET pathIdx = 0
1020 LET pathLength = 0
1030 LET goalRow = PEEK(12)
1040 LET goalCol = PEEK(13)
1050 LET goalReached = 0
1060 LET mazeH = PEEK(14)
1070 LET mazeW = PEEK(15)
1080 DIM maze(mazeH,mazeW)
1090 DIM queue(mazeH*mazeW)
1100 GOSUB 1200 : REM {{WALKMAZE}}
1110 GOSUB 1700 : REM {{FINDPATH}}
1120 IF pathIdx < pathLength THEN
1130     POKE 0, path(pathIdx)
1140     pathIdx = pathIdx + 1
1150 END IF
1160 RETURN

1200 REM {{WALKMAZE}} walk maze
1210 FOR row = 0 TO mazeH - 1
1220     FOR col = 0 TO mazeW - 1
1230         maze(row,col) = mazeH * mazeW
1240     NEXT col
1250 NEXT row
1260 LET idx = 0
1270 LET queueLength = 1
1280 queue(0) = prow * mazeW + pcol
1290 maze(prow,pcol) = 0
1300 IF idx < queueLength THEN
1310     row = queue(idx) / mazeW
1320     col = queue(idx) - row * mazeW
1330     LET dist = maze(row,col) + 1
1340     row = row - 1
1350     GOSUB 1500 : IF goalReached = 1 THEN RETURN : REM {{CHECKMAZE}}
1360     row = row + 2
1370     GOSUB 1500 : IF goalReached = 1 THEN RETURN : REM {{CHECKMAZE}}
1380     row = row - 1 : col = col - 1
1390     GOSUB 1500 : IF goalReached = 1 THEN RETURN : REM {{CHECKMAZE}}
1400     col = col + 2
1410     GOSUB 1500 : IF goalReached = 1 THEN RETURN : REM {{CHECKMAZE}} 
1420     idx = idx + 1
1430     GOTO 1300
1440 END IF
1450 STOP : REM cannot reach goal

1500 REM {{CHECKMAZE}} check maze for positions to add to queue
1510 IF maze(row,col) <= dist THEN RETURN
1520 LET pos = PEEK(16 + row * mazeW + col)
1530 IF pos <> 1 THEN
1540     maze(row,col) = dist
1550     IF row = goalRow AND col = goalCol THEN
1560         goalReached = 1
1570     ELSE
1580         queue(queueLength) = row * mazeW + col
1590         queueLength = queueLength + 1
1600     END IF
1610 END IF
1620 RETURN

1700 REM {{FINDPATH}} find shortest path by working backwards
1710 pathLength = maze(goalRow,goalCol)
1720 DIM path(pathLength)
1730 FOR idx = pathLength - 1 to 0 STEP -1
1740     IF maze(goalRow,goalCol) - maze(goalRow-1,goalCol) = 1 THEN
1750         path(idx) = 1 : goalRow = goalRow - 1
1760     ELSE
1770         IF maze(goalRow,goalCol) - maze(goalRow+1,goalCol) = 1 THEN
1780             path(idx) = 3 : goalRow = goalRow + 1
1790         ELSE
1800             IF maze(goalRow,goalCol) - maze(goalRow,goalCol-1) = 1 THEN
1810                 path(idx) = 0 : goalCol = goalCol - 1
1820             ELSE
1830                 path(idx) = 2 : goalCol = goalCol + 1
1840             END IF
1850         END IF
1860     END IF
1870 NEXT idx
1880 RETURN