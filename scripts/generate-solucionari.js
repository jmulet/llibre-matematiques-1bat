var fs=require("fs");

var text = fs.readFileSync("studentkeys.ans", "utf-8");
var end = text.lastIndexOf(",");
text = "["+text.substring(0, end)+"]";
text = text.replace(/\\/g, "\\\\");

var chapterSingleColumn = [7]
var forceColumns = {13:{21:2,24:2}, 21:{21:2}, 23:{31:2}, 59:{8:1}, 61:{8:1}, 85:{4:1, 5:1}, 89:{19:2, 21:2}, 
90:{25:2, 26:2}, 91:{19:2}, 92:{25:2, 26:2,33:2, 34:2}, 
93:{30:2, 43:2, 44:2}, 94:{33:2, 34:2, 48:2}, 95:{49:2, 43:2,44:2}, 96:{48:2}, 97:{49:2}, 125:{27:1}, 
111:{3:2}, 114:{14:1}, 127:{27:1}, 146:{7:1} , 151:{17:1, 18:1}};
function getForceColumns(p, i){
	var ex = null;
	var page = forceColumns[p];
	if(page){
		ex = page[i]
	}
	return ex;
}
//console.log("Before json");
//console.log(text);

var json = JSON.parse(text);

//console.log("AFTER JSON");
//console.log(json)

var tex = [];
//Create preamble
tex.push("\\documentclass[a4paper, pdf, twoside]{book}");
tex.push("\\usepackage{iesbbook}");
tex.push("\\geometry{a4paper,total={170mm,257mm},left=30mm,right=23mm,top=35mm,bottom=30mm,headsep=35pt}");
tex.push("\\begin{document}");

tex.push("\\thispagestyle{empty}");
tex.push("\\pagestyle{plain}");
tex.push("\\renewcommand{\\headrulewidth}{0pt}");
//Crea una portada
tex.push("\\begin{center}");
tex.push("\\vspace*{0.5cm}\\hrule\\vspace{0.5cm}");
tex.push("\\Huge \\textbf{Matemàtiques I} \\par");
tex.push("\\Large 1r de Batxillerat de ciències\\par");
tex.push("\\large \\textit{Sèrie Pràctica}\\par");
tex.push("\\vspace{0.5cm}\\hrule\\vspace{0.5cm}");
tex.push("\\Huge \\textbf{\\textsc{Solucionari}} \\par \\vspace{1.5cm}");

tex.push("	\\includegraphics[width=0.9\\textwidth]{img-00/portada}   ");
tex.push("");
tex.push("	\\vspace{1.5cm}  ");
tex.push("	\\begin{minipage}{0.4\\textwidth}  ");
tex.push("		\\begin{center}  ");
tex.push("			\\includegraphics*[width=1.2in]{img-00/ies-binissalem-logo}  ");
tex.push("			\\small  ");
tex.push("			\\noindent \\href{www.iesbinissalem.net}{\\textbf{www.iesbinissalem.net}}  ");
tex.push("		\\end{center}  ");
tex.push("	\\end{minipage}  ");
tex.push("	\\begin{minipage}{0.4\\textwidth}  ");
tex.push("		\\begin{flushright}  ");
tex.push("			\\normalsize \\textbf{Josep Mulet}\\par ");
tex.push("			\\textit{Departament de Matemàtiques}\\par   ");
tex.push("			IES Binissalem  ");
tex.push("		\\end{flushright}  ");
tex.push("	\\end{minipage}   ");
tex.push("	\\end{center}   ");
 
tex.push("\\cleartorightpage")
tex.push("\\renewcommand{\\baselinestretch}{1.5}")

tex.push("\\tableofcontents \\cleartorightpage")

tex.push("\\renewcommand{\\baselinestretch}{1}")

tex.push("\\def\\currentname{}");
tex.push("\\pagestyle{fancy}");
tex.push("\\renewcommand{\\headrulewidth}{0.5pt}");
tex.push("\\fancyhead[LE,RO]{\\large\\textcolor{darkBlueColor}{\\shadowbox{\\fontfamily{phv}\\selectfont\\textbf{\\, \\thepage \\,}}}}")
tex.push("\\fancyhead[LO,RE]{{ \\fontfamily{phv}\\selectfont \\textit{\\currentname} }}"); 
tex.push("\\fancyfoot{}");
tex.push("\\fontsize{10.5}{12}\\selectfont")
tex.push("\\begin{multicols}{2}");


//Sort answers by chapter and by page

//chapters = { 1: {pagina1: {exercici1: {opts: {}, answers: ] } }}}

var chapters = {};
var chaporder = [];
json.forEach(function(e){
	if(e.part && parseInt(e.part)>0){
		e.chap = e.part;
	}
});
console.log(json);

json.forEach(function(e){
	 
	var identificador = (e.part && e.part!=="0")? e.part : e.chap;
	console.log(identificador);
	var chap = chapters[identificador];
	if(!chap){
		chaporder.push(identificador);
		chapters[identificador] = {pages: {} };
		chap = chapters[identificador];
	}
	var page = chap.pages[e.page]; 
	if(!page){
		chap.pages[e.page] = {exer: {}, order:[] };
		page = chap.pages[e.page];
	} 
	var exer = page.exer[e.exer];
	if(!exer){
		//Must expand answers in case of array defined by [xxx, yyy, zzz]. Note that [] are mandatory
		page.exer[e.exer] = {opts: {}, answers:[], id: e.id, type: e.type};
		page.order.push(e.exer);
		//Check if e contains opts
		if(e.opts){
			e.opts.toLowerCase().split(",").forEach(function(opt){
							var pair = opt.split("=");
							page.exer[e.exer].opts[pair[0].trim()] = pair[1].trim();					 
						})
		}

		var tmp = e.ans.trim();
		if(tmp.indexOf("[")===0){
			 tmp.substring(1, tmp.length-1).split(", ").forEach(function(t){
				page.exer[e.exer].answers.push(t);
			 });

		} else {
			page.exer[e.exer].answers.push(e.ans);
		}
		
	} 
});

function fixErrors(anstext){
	return anstext.replace(/end \{tasks\}/gi,"end{tasks}").replace(/begin \{tasks\}/gi,"begin{tasks}").replace(/infy/gi,"infty");
}
 
var singleColumnMode = false;

chaporder.forEach(function(c, idex){



	if(idex>0){
		if(!singleColumnMode){
			tex.push("\\vfill\\null");
			tex.push("\\columnbreak");		//Start a new chapter in a new column
		} 

		if(chapterSingleColumn.indexOf(c)>=0 && !singleColumnMode){
			tex.push("\\end{multicols}");
			 
			singleColumnMode = true;
		} 
		if(chapterSingleColumn.indexOf(c)<0 && singleColumnMode){
			tex.push("\\begin{multicols}{2}");
			 
			singleColumnMode = false;
		}
	}
		 

	var head = "";	 
	if(!isNaN(c)){
		head = "Solucions del Tema "+c;
	} else{
		head = "Solucions del Bloc "+c;
	}
	tex.push("\\def\\currentname{"+head+"}");

	tex.push("\\vspace*{0.75cm}");
	tex.push("\n \n \\needspace{5\\baselineskip} \n \\scalebox{1.25}{\\heading{"+head+"}}\n");
	tex.push("\\vspace*{0.4cm}");

	tex.push("\\phantomsection \\addcontentsline{toc}{section}{"+head+"}")
	var chap = chapters[c];
 
	if(!chap){
		return;
	}

	for(var p in chap.pages){
		//tex.push("\n\\begin{minipage}{0.5\\textwidth}");
		tex.push("\\vspace{0.3cm}\n\n \\needspace{4\\baselineskip} \n");
		tex.push("{\\textbf{\\em Pàgina "+p+"}} \\hrulefill");
		tex.push("\\begin{enumerate}");
		page = chap.pages[p];
		var index = 0;


		 
		for(var kiz = 0; kiz < page.order.length; kiz++){
			var i = page.order[kiz];
			var opts = page.exer[i].opts;
			if(opts.only && opts.only.toLowerCase().trim()==="tb"){
				//This content only goes to teacher book
				continue;
			}

			index += 1;
			if(index===2){	
				tex.push("\\begin{enumerate}"); //
			}
			var tipus = page.exer[i].type;
			var decorator = "";
			if(tipus===1 || tipus===2){
				decorator = "\\simbolclau ";
			} else if(tipus===-1){
				decorator = "\\simbolcompass ";
			}

			if(decorator){
					decorator = " \\scalebox{0.6}{"+decorator+"} ";
			}

			exer = page.exer[i].answers;
			var id = page.exer[i].id;

			tex.push("\\vspace{0.25cm}")
			if(exer.length===1){
				//tex.push("\\phantomsection");
				if(isNaN(i)){
					tex.push(" \\item[$\\bullet$ ] {\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{"+i+"}. }"+decorator+"");
			    } else{
					tex.push("\\item[\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{"+i+". }] "+decorator+"");
				}
				var anstext = exer[0];
				//check for errors in anstext
				anstext = fixErrors(anstext);

				//Special stuff
				if(i==51 && p==18){
					anstext = "\n\\mbox{}\n \\scalebox{0.5}{"+anstext+"} ";
				}
				if(i==94 && p==13){
					anstext = "\n\\mbox{}\n \\scalebox{0.6}{"+anstext+"} ";
				}

				tex.push(anstext);
			} else {
				
				var maxtlen = 0;
				var cols = 2;
				if(opts.cols){
					cols = opts.cols;	
				} else {

				//Automatic length control
				exer.forEach(function(t){
					var ttemp = t.replace(/\\frac/gi, "").replace(/\\sqrt/gi, "").replace(/^/gi, "");
					if(ttemp.length>maxtlen){
						maxtlen = ttemp.length;
					}
				});

				if(maxtlen>50){
					cols = 2
				}
				if(cols>exer.length){
					cols = exer.length;
				}
				}


				if(exer.length==4 && cols==3){
					cols=2;
				}
				var nnn = getForceColumns(p, i);
				if(nnn){
					console.log("getForceColumns ",p, ", ", i," = ",nnn)
					cols = nnn;
				}

				tex.push("\n\n \\needspace{2\\baselineskip} \n");
				//tex.push("\\phantomsection");


				if(!isNaN(i)){
					tex.push(" \\item[\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{"+i+"}. ] "+ decorator);
			    }
			    else {
			    	tex.push(" \\item[$\\bullet$ ] {\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{"+i+"}. } "+decorator+"");
			    }

			        tex.push(" \\begin{tasks}[column-sep=1em, item-indent=1.3333em]("+cols+")");
				
				exer.forEach(function(t){
					var decora = "";
					if(!nnn && t.length>30){
						decora = "*";
					}
					var t2 = fixErrors(t);
					tex.push("\t \\task"+decora+" "+t2);
				});

				tex.push("\\end{tasks}");
				 
			}
			if(index===1){
				tex.push(" \\end{enumerate}");				
				//tex.push(" \\end{minipage}");			
			}
		} //end kiz loop
		
		if(Object.keys(page.exer).length>1){
			tex.push(" \\end{enumerate}");
		}

		
	}
});

if(!singleColumnMode){
	tex.push("\\end{multicols}");
}
tex.push("\\end{document}");

console.log("Dumping generated tex file... solucionari.tex")
fs.writeFileSync("solucionari.tex", tex.join("\n"));
