#!/bin/bash

 rsync -va --delete -e "ssh"  ./public/ root@server:/utile/front/ 