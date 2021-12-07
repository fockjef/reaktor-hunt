600 REM print maze
610 LET prow = PEEK(1) : REM player row
620 LET pcol = PEEK(2) : REM player col
630 LOCATE 2, 1
640 FOR row = 0 TO height-1
650     maze$ = ""
660     FOR col = 0 TO width-1
670         IF row = prow AND col = pcol THEN
680             maze$ = maze$ + "@"
690         ELSE
700             IF PEEK(16 + row * width + col) = 0 THEN
710                 maze$ = maze$ + " "
720             ELSE
730                 maze$ = maze$ + "X"
740             END IF
750         END IF
760     NEXT col
770     PRINT maze$
780 NEXT row
790 REM print some statistics on top
800 LOCATE 1, 10 : PRINT "STEPS: "; steps
810 steps = steps + 1
820 RETURN