#!/bin/bash
# Compile CV and copy PDF to attachments/
cd "$(dirname "$0")"
pdflatex -interaction=nonstopmode Minje_Park_CV.tex
pdflatex -interaction=nonstopmode Minje_Park_CV.tex
cp Minje_Park_CV.pdf ../attachments/CV_Minje_Park.pdf
echo "Done. PDF → attachments/CV_Minje_Park.pdf"
