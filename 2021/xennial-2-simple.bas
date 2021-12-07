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

1000 REM simple maze solver, wall follower
1010 IF steps = 1 THEN LET move = 0
1020 DIM walls(4)
1030 walls(0) = PEEK(16 + (prow + 1) * width + pcol) : REM down
1040 walls(1) = PEEK(16 + prow * width + pcol - 1)   : REM left
1050 walls(2) = PEEK(16 + (prow - 1) * width + pcol) : REM up
1060 walls(3) = PEEK(16 + prow * width + pcol + 1)   : REM right
1070 IF walls(move) = 0 THEN
1080     move = move + 1
1090     IF move = 4 THEN move = 0 : REM why no MOD operator ?
1100     POKE 0, move
1110     RETURN
1120 END IF
1130 move = move - 1
1140 IF move < 0 THEN move = 3
1150 GOTO 1070