#!/bin/bash

rm -f cpulog.txt

while true
do
    grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage "%"}' >> cpulog.txt
	sleep 10
done