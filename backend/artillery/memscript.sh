#!/bin/bash

rm -f memlog.txt

while true
do
	date >> log.txt && cat /proc/meminfo >> memlog.txt
	sleep 10
done