function round(x){
	return Math.round(x * 100) / 100;
}

var data = [14.92 , 13.01 , 12.22 , 16.72 , 12.06 , 10.11 , 10.58 , 18.58 , 
20.07 , 13.15 , 20.10 , 12.43 , 17.51 , 11.59 , 11.79 , 16.94  ,
16.45 , 10.94 , 16.56 , 14.87 , 17.59 , 13.74 , 19.71 , 18.63  ,
19.87 , 11.12 , 12.09 , 14.20 , 18.30 , 17.64]
console.log("Data length  ", data.length)

var min = 10
var max = 21
var n = 11
var step = (max-min)/n

var hist = [];

var line1 = "$x$ ";
var line2 = "$y$ ";
var latex = "\\begin{tabular}{|c|c|}\\hline\n"
latex += "\\rowcolor{lightgray} $x$ & $y$ \\\\\\hline\n"
for(var x=min; x<max; x+=step){
	var intv1="["+x+", "+(x+step)+" )";
	var intv2="$["+x+",\\;"+(x+step)+" )$";
	line1 += " & "+intv2;
	var obj = {interval: intv1, x: x+0.5*step, count: 0, fx: 0, fx2: 0}
	hist.push(obj);
	data.forEach(function(e){

		if(x+step>=max){

			if(x<=e && e<=x+step){
				obj.count +=1;
			}



		} else {

			if(x<=e && e<x+step){
				obj.count +=1;
			}

		}
	})

	line2 += " & "+obj.count;
	obj.fx = obj.x*obj.count;
	obj.fx2 = obj.fx*obj.x;
	latex += "\t"+intv2 +" & "+ obj.count + "\\\\ \\hline \n";
}
latex += "\\end{tabular}"

var sumf =0 ;
var sumfx = 0;
var sumfx2 = 0;

hist.forEach(function(h){
	sumf += h.count;
	sumfx += h.fx;
	sumfx2 += h.fx2;
})


console.log(hist)

console.log("")
console.log(" CODI LATEX:::")
console.log("")

console.log(latex)
console.log("\\par")

var latexH = "\\begin{tabular}{*{"+(n+1)+"}{|c|}}\n";
latexH += line1 + "\\\\  \\hline \n" 
latexH += line2+ " \\\\ \n"
latexH += "\\end{tabular}"

console.log("$N=",sumf, "$; $\\sum f\\cdot x=", sumfx, "$; $\\sum f\\cdot x^2=", sumfx2,"$");

var average = sumfx/sumf;
var vari =sumfx2/sumf-average*average;
var sigma = Math.sqrt(vari);
console.log("\\par")
console.log("$\\bar x=", round(average), "$;  Var$=", round(vari), "$; $\\sigma=", round(sigma),"$; C.V.=", round(sigma/average))


