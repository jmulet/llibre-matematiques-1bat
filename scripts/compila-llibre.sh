#!/bin/bash

pdflatex -draftmode -interaction=batchmode main.tex
node ./generate-student-keys.js
pdflatex -draftmode -interaction=batchmode main.tex
pdflatex main.tex
