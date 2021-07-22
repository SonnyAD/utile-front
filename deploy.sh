#!/bin/bash

ln -sf config.prod.dart web/config.dart

webdev.bat build
for i in {1..5}; do rsync -va --delete -e "ssh"  ./build/ root@server:/utile/front/ && break; done

ln -sf config.dev.dart web/config.dart