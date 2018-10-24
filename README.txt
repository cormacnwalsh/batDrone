		       ---------------
			  batDrone v1.0
		       ---------------
		      	      
			      by
		
			Allison Spillane
		     	       &
		  	  Cormac Walsh

A simple app to control the navigation of a Parrot ar-drone
via hand gestures.

To run open a terminal window and navigate to the batDrone folder.
Then type ./batDrone.sh

The program has three modes:

	1. autoPath - an automatic flight path used for testing purposes

	2. webHand - drone navigation via hand gesture detection through a webcam
		     10 fingers: take off
		     0 fingers: land
		     5 fingers: move forwards
		     3 fingers: move backwards

	3. batHand - an automatic flight path triggered by showing 5 fingers to
		     the drone camera
