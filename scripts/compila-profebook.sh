echo "Genera anotacions del pdf original amb pax"
/usr/local/texlive/2016/texmf-dist/scripts/pax/pdfannotextractor.pl llibre-1BAT-color.pdf

echo "Compila el document per generar fitxer de respostes .ans"
pdflatex --pdflatex -draftmode  main.tex

echo "Genera document teacher-book.tex"
node generate-teacher-book.js

echo "Finalment, compila el document que s'acaba de generar"
pdflatex teacher-book.tex
