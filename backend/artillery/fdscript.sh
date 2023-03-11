#!/bin/bash

if [ $# != 1 ]
then
    echo usage: ./fdscript.sh SERVER_PID
    exit
fi

rm -f fdslog.txt

while true
do
    ls -l /proc/$1/fd | wc -l >> fdslog.txt
    # cat /proc/sys/fs/file-nr | awk ' { print $1 } ' >> log.txt
	sleep 10
done


# total fds supported on system: cat /proc/sys/fs/file-max