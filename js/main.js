// JavaScript Document
/// <reference path="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js" />
/// <reference path="numeric-1.2.6.min.js" />



$(document).ready(function () {

	initEvents($("#myCanvas"));

});

function leastSquare(points) {
	var A=numeric.rep([2, 2], 0);
	var b=numeric.rep([2], 0);
	for(var i=0; i<points.length; ++i) {
		A[0][0]+=points[i][0]*points[i][0];
		A[0][1]+=points[i][0];
		A[1][0]+=points[i][0];
		A[1][1]+=1;
		b[0]+=points[i][1]*points[i][0];
		b[1]+=points[i][1];
	}
	return numeric.solve(A, b);
}

function lineFittingInputErrorModel(points) {

	// 点の数
	var N=points.length;	

	// xの重心
	var mx=0;	
	for(var i=0; i<N; ++i) {
		mx+=points[i][0];
	}
	mx/=N;

	// yの重心
	var my=0;	
	for(var i=0; i<N; ++i) {
		my+=points[i][1];
	}
	my/=N;

	var M=numeric.rep([2, 2], 0);
	for(var i=0; i<N; ++i) {
		M[0][0]+=(points[i][0]-mx)*(points[i][0]-mx);
		M[0][1]+=(points[i][0]-mx)*(points[i][1]-my);
		M[1][1]+=(points[i][1]-my)*(points[i][1]-my);
	}
	M[1][0]=M[0][1];

	// get minimum eigen value
	var lambda=0.5*(M[0][0]+M[1][1]-Math.sqrt((M[0][0]+M[1][1])*(M[0][0]+M[1][1])-4*(M[0][0]*M[1][1]-M[0][1]*M[1][0])));
	var vec=[lambda-M[1][1], M[1][0]];
	vec=numeric.div(vec, numeric.norm2(vec));

	// 直線 Ax + By + C = 0 の係数
	var A=vec[0];
	var B=vec[1];
	var C=-A*mx-B*my;

	// y = ax + b の a, b を返す
	// （注意）B=0の場合を考慮していない
	return [-A/B,-C/B];
}

function drawPoints(canvas, points) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	context.setTransform(1, 0, 0, 1, 0, 0);
	for(var i=0; i<points.length; ++i) {
		context.beginPath();
		context.arc(points[i][0], points[i][1], 5, 0, 2*Math.PI, true);
		context.fill();
	}
}

function drawPolynomial(canvas, c) {
	var context=canvas.get(0).getContext("2d");
	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	var dx=5;
	var numSegments=Math.floor(canvasWidth/dx)+1;
	context.beginPath();
	var x;
	function f(val) {
		var tmp=0;
		for(var i=0; i<c.length; ++i) {
			tmp+=c[i]*Math.pow(val,c.length-1-i);
		}
		return tmp;
	}
	x=0;
	context.moveTo(x, f(x));
	for(var i=1; i<numSegments; ++i) {
		x+=dx;
		context.lineTo(x, f(x));
	}
	context.stroke();
}

function initEvents(canvas) {

	var canvasWidth=canvas.width();
	var canvasHeight=canvas.height();
	var points=[[300,400],[550,200],[700,300]];
	var selectPoint=null;
	draw();

	// mouseクリック時のイベントコールバック設定
	$('canvas').mousedown(function (event) {
		// 左クリック
		if(event.button==0) {
			var canvasOffset=canvas.offset();
			var canvasX=Math.floor(event.pageX-canvasOffset.left);
			var canvasY=Math.floor(event.pageY-canvasOffset.top);
			if(canvasX<0||canvasX>canvasWidth) {
				return;
			}
			if(canvasY<0||canvasY>canvasHeight) {
				return;
			}
			points.push([canvasX, canvasY]);

			draw();

		}
		// 右クリック
		else if(event.button==2){
			var canvasOffset=canvas.offset();
			var canvasX=Math.floor(event.pageX-canvasOffset.left);
			var canvasY=Math.floor(event.pageY-canvasOffset.top);
			if(canvasX<0||canvasX>canvasWidth) {
				return;
			}
			if(canvasY<0||canvasY>canvasHeight) {
				return;
			}
			var clickPos=[canvasX, canvasY];
			var dist;
			for(var i=0; i<points.length; ++i) {
				dist=numeric.norm2(numeric.sub(points[i],clickPos));
				if(dist<20) {
					selectPoint=i;
					break;
				}
			}
		}
	});

	// mouse移動時のイベントコールバック設定
	$('canvas').mousemove(function (event) {
		var canvasOffset=canvas.offset();
		var canvasX=Math.floor(event.pageX-canvasOffset.left);
		var canvasY=Math.floor(event.pageY-canvasOffset.top);
		if(canvasX<0||canvasX>canvasWidth) {
			return;
		}
		if(canvasY<0||canvasY>canvasHeight) {
			return;
		}
		if(selectPoint!=null) {
			points[selectPoint]=[canvasX, canvasY];
			draw();
		}
	});

	// mouseクリック解除時のイベントコールバック設定
	$('canvas').mouseup(function (event) {
		selectPoint=null;
		draw();
	});

	// リセットボタン
	$("#reset").click(function () {
		points=[];
		draw();
	})

	function draw() {
		var context=canvas.get(0).getContext("2d");
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		drawPoints(canvas, points);
		colors=['red', 'green', 'blue', 'orange', 'cyan'];
		var c;
		context.strokeStyle=colors[0];
		c=leastSquare(points);
		drawPolynomial(canvas, c);

		context.strokeStyle=colors[1];
		c=lineFittingInputErrorModel(points);
		drawPolynomial(canvas, c);
	}


}