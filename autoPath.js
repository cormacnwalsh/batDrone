//The imports required for the script to run
const cv = require('opencv4nodejs');
var drone = require('ar-drone');

//The control variable for the drone
var batDrone = drone.createClient();

//The feed from the drone camera
var batFeed = 'tcp://192.168.1.1:5555';

//The base display resolution, 
//multipled to create width and height in 16:9 aspect ratio
var res = 60;
var h = res * 9;
var w = res * 16;

//intialize the Capture from the drone
var batCap = new cv.VideoCapture(batFeed);

//Display element to view the video feed from drone
var display = new cv.Mat(h, w, cv.CV_8UC3);

//Timers used instead of loops to grab frames
setInterval(getFrame, 5);
setInterval(output, 40);

function getFrame(){
	//reads the current frame from the drone and resizes to fit the output Mat 
	var batFrame = batCap.read().resize(h, w);

	//copies the read frame into the output Mat
	batFrame.copyTo(display.getRegion(new cv.Rect(0, 0, w, h)));
}

function output(){
	//Renders the display Mat
	cv.imshow('batDrone', display);
	//Waitkey needed to update the Mat, 
	//else only the first read image is displayed
	cv.waitKey(1);
}

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
