var data = [84, 49,61, 40, 83, 67, 45, 66, 70, 69, 80, 58, 68, 60, 67, 72, 73, 70, 57, 63, 70, 78, 52, 67, 53, 67, 75, 61, 70, 81, 76, 79, 75, 76, 58, 31]


var min = 30
var max = 60
var n = 6
var step = (max-min)/n

var hist = [];

for(var x=min; x<max; x+=step){
	
	var obj = {interval: x+"--"+(x+step), count: 0}
	hist.push(obj);
	data.forEach(function(e){
		if(x<=e && e<x+step){
			obj.count +=1;
		}
	})
}


console.log(hist)