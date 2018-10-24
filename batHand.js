//The imports required for the script to run
const cv = require('opencv4nodejs');
var mask = require('./node_modules/handMask');
const drone = require('ar-drone');

//color constants for display elements added to final display
const blue = new cv.Vec(255, 0, 0); 
const green = new cv.Vec(0, 255, 0);
const red = new cv.Vec(0, 0, 255);

//The control variable for the drone
var batDrone = drone.createClient();

//flight status for drone
var flight = 'Idle';

//counter to control triggering of garbage collection
var gcCounter = 0;

// MAIN

//The base display resolution, 
//multipled to create width and height in 16:9 aspect ratio
var res = 80;
var h = res * 9;
var w = res * 16;

//size of fonts used for display
const fontScale = 2;

//feed from drone
const batFeed = 'tcp://192.168.1.1:5555';

//initialize video capture
var batCap = new cv.VideoCapture(batFeed);

//Display element to view the video feed from drone
var display = new cv.Mat(h, w, cv.CV_8UC3);

//Timers used instead of loops to grab frames
setInterval(getBatFrame, 5);
setInterval(output, 40);

function getBatFrame(){
	//reads the current frame from the batDrone and resizes to fit display Mat
	var batFrame = batCap.read().resize(h, w);

	//creates the thresholded image
	handMask = mask.makeHandMask(batFrame);
  	const handContour = mask.getHandContour(handMask);
  	if (!handContour) {
    		return;
  	}

	//Maximum distance between points read from convex hull of hand
	//for the points to be mereged into one 
	const maxPointDist = 25;
  	const hullIndices = mask.getRoughHull(handContour, maxPointDist);

  	// get defect points of hull to contour and return vertices
  	// of each hull point to its defect points
 	 const vertices = mask.getHullDefectVertices(handContour, hullIndices);

  	// fingertip points are those which have a sharp angle to its defect points
  	const maxAngleDeg = 60;
  	const verticesWithValidAngle = mask.filterVerticesByAngle(vertices, maxAngleDeg);

  	// draw bounding box and center line
  	batFrame.drawContours(
    		[handContour],
    		blue,
    		{ thickness: 2 }
  	);

  	// draw points and vertices
  	verticesWithValidAngle.forEach((v) => {
    		batFrame.drawLine(
      			v.pt,
      			v.d1,
      			{ color: green, thickness: 2 }
    		);
    		batFrame.drawLine(
      			v.pt,
      			v.d2,
      			{ color: green, thickness: 2 }
    		);
    		batFrame.drawEllipse(
      			new cv.RotatedRect(v.pt, new cv.Size(20, 20), 0),
      			{ color: red, thickness: 2 }
    		);
    		batFrame.drawEllipse(
      			new cv.RotatedRect(v.pt, new cv.Size(20, 20), 0),
      			{ color: red, thickness: 2 }
    		);
  	});

  	// display detection result
  	numFingersUp = verticesWithValidAngle.length;
  	batFrame.drawRectangle(
    		new cv.Point(10, 10),
    		new cv.Point(70, 70),
    		{ color: green, thickness: 2 }
  	);

  	batFrame.putText(
    		String(numFingersUp),
    		new cv.Point(20, 60),
    		cv.FONT_ITALIC,
    		fontScale,
    		{ color: green, thickness: 2 }
  	);

	//grabs flight and movement status and puts text onto the display Mat
	batFrame.putText(
		String(flight),
		new cv.Point(600,660),
		cv.FONT_ITALIC,
		fontScale,
		{ color: green, thickness: 3}
	);

	//copies batFrame onto top half of display Mat
	batFrame.copyTo(display.getRegion(new cv.Rect(0, 0, w, h)));

	//The navigation control function for the drone
	controller(numFingersUp);
}//End getBatFrame

function output(){
	//renders the display Mat
	cv.imshow('Cormac', display);
	//Waitkey needed to update the Mat, 
	//else only the first read image is displayed
	cv.waitKey(1);

	//when gcCounter reaches 250(approx 10 seconds) 
	//garbage collection is called
	gcCounter++;

	if(gcCounter === 250){
		global.gc();
		gcCounter = 0;
	}
}//End output

function controller(numFingersUp) {

	//control structure sets Flight status
	//depending on fingers raised
	if(numFingersUp === 5 && flight !== 'Flying'){
		flight = 'Flying';

		if(flight === 'Flying'){
			flyPath();
		}
	}
	else if(numFingersUp === 0 && flight !== 'Idle'){
		flight = 'Idle';
	}
}

function flyPath(){

	//navigation commands for the drone
	batDrone.takeoff();	

	batDrone.after(2000, function(){
		this.up(0.3);
	})
	.after(1000, function(){
		this.stop();
	})
	batDrone.after(1000, function(){
		this.clockwise(0.5);
	})
	.after(2000, function(){
		this.stop();
	})
	.after(2000, function(){
		this.counterClockwise(0.5);
	})
	.after(2000, function(){
		this.stop();
	})
	.after(2000, function(){
		this.up(0.5);
	})
	.after(2000, function(){
		this.front(0.3);
	})
	.after(1500, function(){
		this.stop();
	})
	.after(1500, function(){
		this.back(0.3);
	})
	.after(1500, function(){
		this.stop();
	})
	.after(1500, function(){
		this.land(); 
	});
}//End flyPath
