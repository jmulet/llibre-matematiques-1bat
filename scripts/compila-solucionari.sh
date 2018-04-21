#!/bin/bash

pdflatex -draftmode main.tex
node ./generate-solucionari.js
pdflatex solucionari.tex
open -a Preview solucionari.pdf
