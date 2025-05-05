#!/usr/bin/env sh

echo "Getting IP address..."
if (uname -a | grep -q Darwin); then
    LOCAL_IP=$(ipconfig getifaddr en0)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

#LOCAL_IP=127.0.0.1

#LOCAL_IP=$(curl -s http://whatismyip.akamai.com/)

echo "IP address: $LOCAL_IP"

awk '{ if (NR == 2) print "'HOST_IP=${LOCAL_IP}'"; else print $0}' .env > .env.tmp
mv .env.tmp .env && rm -f .env.tmp