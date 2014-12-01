#!/bin/bash

echo -e '\e[34m\e[1mLarge Dev Toolbelt\e[0m'

echo -e '\e[32m[*] Removing all post\e[0m'
rm post/* .post/*

echo -e '\e[32m[*] Flushing Large instance\e[0m'
./large.js --flush

echo -e '\e[32m[*] Creating new Large instance\e[0m'
./large.js --init

echo -e '\e[32m[*] Setting test large author profile\e[0m'
./large.js --config name "teachers"
./large.js --config email "teachers@whiskey.com"
./large.js --config signature "highland cream"
./large.js --me
