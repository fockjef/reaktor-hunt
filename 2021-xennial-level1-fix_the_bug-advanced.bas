600 REM print maze
610 IF steps > 0 THEN GOTO 760
620 LET prow = PEEK(1) : REM player row
630 LET pcol = PEEK(2) : REM player col
640 LOCATE 2, 1
650 FOR row = 0 TO height-1
660     maze$ = ""
670     FOR col = 0 TO width-1
680         IF PEEK(16 + row * width + col) = 0 THEN
690             maze$ = maze$ + " "
700         ELSE
710             maze$ = maze$ + "X"
720         END IF
730     NEXT col
740     PRINT maze$
750 NEXT row
760 LOCATE 2 + prow, 1 + pcol
770 PRINT " ";
780 prow = PEEK(1)
790 pcol = PEEK(2)
800 LOCATE 2 + prow, 1 + pcol
810 PRINT "@";
820 REM print some statistics on top
830 LOCATE 1, 10 : PRINT "STEPS: "; steps
840 steps = steps + 1
850 RETURN