#!/bin/bash

echo "Select 1 for autoPath."
echo "Select 2 for control via Webcam."
echo "Select 3 for control via Dronecam."
echo "Press any other key to exit".

read num

if [ $num = 1 ]
	then
		node autoPath.js

elif [ $num = 2 ]
	then
		node --expose-gc webHand.js

elif [ $num = 3 ]
	then
		node --expose-gc batHand.js
fi
