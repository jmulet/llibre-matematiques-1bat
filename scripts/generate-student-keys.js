let fs = require("fs");

let text = fs.readFileSync("./output-student/studentkeys.ans", "utf-8");
let end = text.lastIndexOf(",");
text = "["+text.substring(0, end)+"]";
text = text.replace(/\\/g, "\\\\");

let forceColumns = {13:{21:2, 24:2}, 21:{21:2}, 23:{31:2}, 48:{3:2}, 117:{1:1}};
function getForceColumns(p, i){
	let ex = null;
	let page = forceColumns[p];
	if(page){
		ex = page[i]
	}
	return ex;
}


let json = JSON.parse(text);

let tex = [];

//Sort answers by chapter and by page

//chapters = { 1: {pagina1: {exercici1: {opts: {}, answers: ] } }}}

let chapters = {};
let chaporder = [];
json.forEach(function(e){
	if(e.part){
		e.chap = e.part;
	}
});
console.log(json);

json.forEach(function(e){
	//Filtra nomes algun tipus de resposta students are type 1 and 2
	if(e.type===0){
		return;	
	}
	let chap = chapters[e.chap];
	if(!chap){
		chaporder.push(e.chap);
		chapters[e.chap] = {pages: {} };
		chap = chapters[e.chap];
	}
	let page = chap.pages[e.page]; 
	if(!page){
		chap.pages[e.page] = {exer: {} };
		page = chap.pages[e.page];
	} 
	let exer = page.exer[e.exer];
	if(!exer){
		//Must expand answers in case of array defined by [xxx, yyy, zzz]. Note that [] are mandatory
		page.exer[e.exer] = {opts: {}, answers:[], id: e.id};

		//Check if e contains opts
		if(e.opts){
			e.opts.toLowerCase().split(",").forEach(function(opt){
							let pair = opt.split("=");
							page.exer[e.exer].opts[pair[0].trim()] = pair[1].trim();					 
						})
		}

		let tmp = e.ans.trim();
		if(tmp.indexOf("[")===0){
			 tmp.substring(1, tmp.length-1).split(", ").forEach(function(t){
				page.exer[e.exer].answers.push(t);
			 });

		} else {
			page.exer[e.exer].answers.push(e.ans);
		}
		
	} 
});
 

chaporder.forEach(function(c){
	 
	if(!isNaN(c)){
		tex.push("\n \\vspace{1cm} \n \n \\needspace{5\\baselineskip} \n \\heading{Solucions del Tema "+c+"}\n");
	} else{
		tex.push("\n \\vspace{1cm} \n\n \\needspace{5\\baselineskip} \n \\heading{Solucions del Bloc "+c+"}\n");
	}
	let chap = chapters[c];
	for(let p in chap.pages){
		//tex.push("\n\\begin{minipage}{0.5\\textwidth}");
	tex.push("\\vspace{0.3cm}\n\n \\needspace{3\\baselineskip} \n");
		tex.push("\\hyperlink{page."+p+"}{\\textbf{\\em Pàgina "+p+"}}");
		tex.push("\\begin{enumerate}");
		page = chap.pages[p];
		let index = 0;
		for(let i in page.exer){
			let opts = page.exer[i].opts;
			if(opts.only && opts.only.toLowerCase().trim()==="tb"){
				//This content only goes to teacher book
				continue;
			}

			index += 1;
			if(index===2){	
				tex.push("\\begin{enumerate}"); //
			}
		
			exer = page.exer[i].answers;
			let id = page.exer[i].id;

			
			
			if(exer.length===1){
				tex.push("\\phantomsection");
				tex.push("\\item[\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{\\ref{exer:"+id+"}. }] \\label{ans:"+id+"} ");
				let anstext = exer[0];
				//check for errors in anstext
				anstext = anstext.replace(/end \{tasks\}/gi,"end{tasks}").replace(/begin \{tasks\}/gi,"begin{tasks}")  
				tex.push(anstext);
			} else {
				
				let maxtlen = 0;
				let cols = 3;
				if(opts.cols){
					cols = opts.cols;	
				} else {

				//Automatic length control
				exer.forEach(function(t){
					let ttemp = t.replace(/\\frac/gi, "").replace(/\\sqrt/gi, "").replace(/^/gi, "");
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
				let nnn = getForceColumns(p, i);
				let cf = false;
				if(nnn){
					console.log("getForceColumns ",p, ", ", i," = ",nnn)
					cols = nnn;
					cf = true;
				}

				tex.push("\n\n \\needspace{2\\baselineskip} \n");
				tex.push("\\phantomsection");
				tex.push(" \\item[\\fontfamily{phv}\\selectfont\\color{blue}\\textbf{\\ref{exer:"+id+"}. }] \\label{ans:"+id+"}");
			        tex.push(" \\begin{tasks}[column-sep=1em, item-indent=1.3333em]("+cols+")");
				
				exer.forEach(function(t){
					let decora = "";
					if(t.length>30 && !cf){
						decora = "*";
					}

					//special stuff
					if( (p==91  && i===21) || (p==92 && i==26) ){
						t = t.replace(/dfrac/g, "frac");
					}

					tex.push("\t \\task"+decora+" "+t);
				});

				tex.push("\\end{tasks}");
				 
			}
			if(index===1){
				tex.push(" \\end{enumerate}");				
				//tex.push(" \\end{minipage}");			
			}
		}
		
		if(Object.keys(page.exer).length>1){
			tex.push(" \\end{enumerate}");
		}
	}
});

console.log("Dumping generated tex file...")
fs.writeFileSync("./src/studentkeys.tex", tex.join("\n"));
