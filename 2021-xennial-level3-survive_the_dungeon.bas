3000 REM find all treasure, then exit maze
3010 IF steps > 1 THEN GOTO 3120
3020     LET treasureLeft = 0
3030     LET pathIdx = 0
3040     LET pathLength = 0
3050     LET mazeH = PEEK(14)
3060     LET mazeW = PEEK(15)
3070     DIM maze(mazeH,mazeW)
3080     DIM temp(mazeH,mazeW)
3090     DIM queue(mazeH*mazeW)
3100     GOSUB 3300 : REM {{INITMAZE}}
3110 END IF
3120 IF pathIdx >= pathLength THEN
3130     GOSUB 3500 : REM {{WALKMAZE}}
3140     IF maze(targetRow,targetCol) = 2 THEN treasureLeft = treasureLeft - 1
3150     maze(targetRow,targetCol) = 0
3160     GOSUB 4000 : REM {{FINDPATH}}
3170     pathIdx = 0
3180 END IF
3190 IF pathLength > 0 THEN
3200     POKE 0, path(pathIdx)
3210     pathIdx = pathIdx + 1
3220 END IF
3230 RETURN

3300 REM {{INITMAZE}} read current maze state from memory, intialize temp array
3310 FOR row = 0 TO mazeH - 1
3320     FOR col = 0 TO mazeW - 1
3330         maze(row,col) = PEEK(16 + row * mazeW + col)
3340         temp(row,col) = mazeH * mazeW
3350         IF maze(row,col) = 2 THEN treasureLeft = treasureLeft + 1
3360     NEXT col
3370 NEXT row
3380 maze(PEEK(12),PEEK(13)) = 3 : REM mark goal
3390 RETURN

3500 REM {{WALKMAZE}} walk maze breadth first until reaching a key or $$$
3510 FOR idx = 0 TO queueEnd
3520     row = queue(idx) / mazeW
3530     col = queue(idx) - row * mazeW
3540     temp(row,col) = mazeH * mazeW
3550 NEXT idx
3560 LET idx = 0
3570 LET queueEnd = 0
3580 LET targetRow = -1
3590 LET targetCol = -1
3600 queue(0) = PEEK(1) * mazeW + PEEK(2)
3610 row = queue(0) / mazeW
3620 col = queue(0) - row * mazeW
3630 temp(row,col) = 0
3640 IF idx <= queueEnd THEN
3650     row = queue(idx) / mazeW
3660     col = queue(idx) - row * mazeW
3670     LET dist = temp(row,col) + 1
3680     row = row - 1
3690     GOSUB 3800 : IF targetRow <> -1 THEN RETURN : REM {{CHECKMAZE}}
3700     row = row + 2
3710     GOSUB 3800 : IF targetRow <> -1 THEN RETURN : REM {{CHECKMAZE}}
3720     row = row - 1 : col = col - 1
3730     GOSUB 3800 : IF targetRow <> -1 THEN RETURN : REM {{CHECKMAZE}}
3740     col = col + 2
3750     GOSUB 3800 : IF targetRow <> -1 THEN RETURN : REM {{CHECKMAZE}}
3760     idx = idx + 1 : GOTO 3640
3770 END IF
3780 RETURN

3800 REM {{CHECKMAZE}} check maze for positions to add to queue
3810 LET pos = maze(row,col)
3820 IF pos = 1 OR (pos = 3 AND treasureLeft > 0) THEN RETURN : REM wall or goal before all treasure found
3830 IF pos >= 20 THEN
3840     IF keys(pos-20) = 0 THEN RETURN : REM locked door
3850 END IF
3860 IF temp(row,col) <= dist THEN RETURN : REM already checked
3870 temp(row,col) = dist;
3880 IF pos = 0 OR pos >= 20 OR (treasureLeft = 0 AND pos <> 3) THEN
3890     queueEnd = queueEnd + 1
3900     queue(queueEnd) = row * mazeW + col
3910 ELSE
3920     targetRow = row
3930     targetCol = col
3940 END IF
3950 RETURN

4000 REM {{FINDPATH}} find shortest path to target by working backwards
4010 LET pathLength = temp(targetRow,targetCol)
4020 DIM path(pathLength)
4030 FOR idx = pathLength - 1 to 0 STEP -1
4040     IF temp(targetRow,targetCol) - temp(targetRow-1,targetCol) = 1 THEN
4050         path(idx) = 1 : targetRow = targetRow - 1
4060     ELSE
4070         IF temp(targetRow,targetCol) - temp(targetRow+1,targetCol) = 1 THEN
4080             path(idx) = 3 : targetRow = targetRow + 1
4090         ELSE
4100             IF temp(targetRow,targetCol) - temp(targetRow,targetCol-1) = 1 THEN
4110                 path(idx) = 0 : targetCol = targetCol - 1
4120             ELSE
4130                 path(idx) = 2 : targetCol = targetCol + 1
4140             END IF
4150         END IF
4160     END IF
4170 NEXT idx
4180 RETURN