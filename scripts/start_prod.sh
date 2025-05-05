#/usr/bin/env bash

# Copy specific line from .env file to client/.env.local file
file=".env"
rm -f ./client/.env
touch ./client/.env
rm -f ./server/.env
touch ./server/.env

echo "Creating .env files..."

if (uname -a | grep -q Darwin); then
    while IFS= read -r varname; do
      if [[ $varname == "HOST_IP"* || $varname == "CLIENT_PORT"* \
            || $varname == "SERVER_PORT"* ]]; then
            echo "REACT_APP_$varname" >> client/.env
            echo "REACT_APP_$varname" >> server/.env
      fi
    done < "$file"
else
    while IFS= read -r varname; do
      case $varname in
        HOST_IP*)
            echo "REACT_APP_$varname" >> client/.env
            echo "REACT_APP_$varname" >> server/.env
            ;;
        CLIENT_PORT*)
            echo "REACT_APP_$varname" >> client/.env
            echo "REACT_APP_$varname" >> server/.env
            ;;
        SERVER_PORT*)
            echo "REACT_APP_$varname" >> client/.env
            echo "REACT_APP_$varname" >> server/.env
            ;;
      esac
    done < "$file"
fi

echo "Done."