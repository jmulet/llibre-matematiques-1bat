var fs = require("fs")
var exec = require("process").exec;

var regexImg = /includegraphics\[(([^\{\}]|(R))*)\]\{(([^\{\}]|(R))*)\}/gmi;
var regexImg2 = /includegraphics\*\[(([^\{\}]|(R))*)\]\{(([^\{\}]|(R))*)\}/gmi;

function hasExt(path){
	return (path.trim()).indexOf(".")>0;
}

function doMatches(bean, tex, regex){
	var matches = regex.exec(tex);
	while(matches!==null){
		var path = matches[4].trim();
		console.log("      Found "+path );
		var n = path.indexOf("/");
		if(n>=0){
			var splits = path.split("/");
			var name = splits[1].trim();
			var isSol = splits[0].trim().toLowerCase()==="img-sol";
			var newpath =  bean.imgdir+"/"+name;

			if(!isSol){
				var reg = new RegExp(path, "gmi")
				tex = tex.replace(reg, newpath)
			}
			
		//Copy image files to newpath
		if(hasExt(name) && !isSol){
				var target = "./"+bean.imgdir+"/"+name;
				var origin = path;
				if(target!==origin){
					try{
						fs.writeFileSync(target, fs.readFileSync(origin));
						console.log("      Copying "+origin +" --->  "+target );
					} catch(ex){
						//
					}
				}
		} else if(!hasExt(name) && !isSol) {
		 
			["pdf", "jpg", "png", "tiff", "ggb", "key", "svg", "cg3", "jpeg"].forEach(function(ext){
				var target = "./"+bean.imgdir+"/"+name+"."+ext;
				var origin = path+"."+ext;
				if(target!==origin){
					try{
						fs.writeFileSync(target, fs.readFileSync(origin));
						console.log("      Copying "+origin+" --->  "+target );
					} catch(ex){
						//
					}
				}
			});

			["pdf", "jpg", "png", "tiff", "ggb", "key", "svg", "cg3", "jpeg"].forEach(function(ext){
				var target = "./"+bean.imgdir+"/"+name+"."+ext;
				var origin = path+"."+ext.toUpperCase();
				if(target!==origin){
					try{
						fs.writeFileSync(target, fs.readFileSync(origin));
						console.log("      Copying "+origin+" --->  "+target );
					} catch(ex){
						//
					}
				}
			});		
		}

		}
		matches = regex.exec(tex);	
	}
	return tex;
}

function process(bean){

	//Read file content
	console.log("Process "+bean.file)

	var tex = fs.readFileSync("./"+bean.file, "utf-8");
 
	//seach all image tags

	tex = doMatches(bean, tex, regexImg);
	tex = doMatches(bean, tex, regexImg2);

	//seach all video tags
	//seach all videonw tags
 

	var outfile = bean.outfile? bean.outfile : bean.file;

	fs.writeFileSync(outfile, tex);

}

var createBck = false;

var jobs = [
	{file: "iesbbook.sty", imgdir: "img-base"},
	{file: "portada.tex", imgdir: "img-00"},
	{file: "chap-reals.tex", outfile:"chap-01-reals.tex", imgdir: "img-01"},
	{file: "chap-algebra.tex", outfile:"chap-02-algrebra.tex", imgdir: "img-02"},
	{file: "chap-trigonometria.tex", outfile:"chap-03-trigonometria.tex", imgdir: "img-03"},
	{file: "chap-complexos.tex", outfile:"chap-04-complexos.tex", imgdir: "img-04"},
	{file: "bloc1.tex", outfile:"chap-04-bloc1.tex", imgdir: "img-04-bloc1"},
	{file: "chap-funcelemental.tex", outfile:"chap-05-funcions.tex", imgdir: "img-05"},
	{file: "chap-limits.tex", outfile:"chap-06-limits.tex", imgdir: "img-06"},
	{file: "chap-derivades.tex", outfile:"chap-07-derivades.tex", imgdir: "img-07"},
	{file: "bloc2.tex", outfile:"chap-07-bloc2.tex", imgdir: "img-07-bloc2"},
	{file: "chap-vectors.tex", outfile:"chap-08-vectors.tex", imgdir: "img-08"},
	{file: "chap-analitica.tex", outfile:"chap-09-analitica.tex", imgdir: "img-09"},
	{file: "chap-coniques.tex", outfile:"chap-10-coniques.tex", imgdir: "img-10"},
	{file: "bloc3.tex", outfile:"chap-10-bloc3.tex", imgdir: "img-10-bloc3"},
	{file: "chap-estadistica.tex", outfile:"chap-11-estadistica.tex", imgdir: "img-11"},
	{file: "chap-probabilitat.tex", outfile:"chap-12-probabilitat.tex", imgdir: "img-12"}
]

//Handle main.tex file
//backup mainfile


var maintex = fs.readFileSync("main.tex", "utf-8");
var target = "./bck-main.tex"
if(!fs.existsSync(target)){
	fs.writeFileSync(target, fs.readFileSync("./main.tex", "utf-8"));
}

jobs.forEach(function(e){
	var dir =  "./"+e.imgdir;
	if(!fs.existsSync(dir)){
		console.log("Creating directory ", dir);
		fs.mkdirSync(dir);
	}

 	target =  "./bck-"+e.file;
	if(createBck && !fs.existsSync(target)){
		console.log("Creating backup ", target);
		fs.writeFileSync(target, fs.readFileSync("./"+e.file, "utf-8"));
	}

	var inf = e.file.replace(".tex","");
	
	if(e.outfile){
		var outf = e.outfile.replace(".tex","");
		if(inf!==outf){
			var reg3 = new RegExp(inf, "gi");
			maintex = maintex.replace(reg3, outf);
		}
	}

	//process(e);
});

fs.writeFileSync("main.tex", maintex);

//

