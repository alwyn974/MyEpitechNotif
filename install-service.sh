#!/bin/bash

SERVICE_PATH="/etc/systemd/system/MyEpitechNotif.service"
LOCAL_SERVICE_PATH="MyEpitechNotif/MyEpitechNotif.service"

echo "Installing MyEpitechNotif and creating a service"

if [[ $EUID -ne 0 ]]; then
   if [ -z $(which npm) ]; then
      echo "You need npm to run this project" 1>&2
      exit 1
   fi

   if [ -z $(which node) ]; then
      echo "You need node to run this project" 1>&2
      exit 1
   fi

   if [ -z $(which systemctl) ]; then
      echo "You need systemctl to setup the service" 1>&2
      exit 1
   fi

   if [ -z $(which git) ]; then
      echo "You need git to clone this project" 1>&2
      exit 1
   fi

   if [ -z $(which sed) ]; then
      echo "You need sed to setup the service" 1>&2
      exit 1
   fi

   echo "Cloning project in the current directory..."
   git clone https://github.com/alwyn974/MyEpitechNotif

   echo "Replacing %USER%  to '$USER'"

   GROUP=$(id -Gn | cut -d' ' -f1)
   echo "Replacing %GROUP% to '$GROUP'"

   NPM_PATH=$(which npm)
   echo "Replacing %NPM_PATH% to '$NPM_PATH'"

   PROJECT_PATH="$(pwd)/MyEpitechNotif"
   echo "Replacing %PATH% to '$PROJECT_PATH'"

   SERVICE="[Unit]
Description=MyEpitechNotif service.
After=network-online.target

[Service]
Type=simple
User=$USER
Group=$GROUP
ExecStart=$NPM_PATH --prefix $PROJECT_PATH start 

Restart=on-failure

[Install]
WantedBy=multi-user.target
"
   echo "$SERVICE" > "$LOCAL_SERVICE_PATH"

   echo "Sudo permission is needed now..."
   echo "Please restart the script with sudo"
else

   sudo mv "$LOCAL_SERVICE_PATH" "$SERVICE_PATH"
   sudo chmod 644 "$SERVICE_PATH"
   sudo systemctl enable "$SERVICE_PATH"
   sudo systemctl start MyEpitechNotif

   echo "The service has been setup and started"
   echo "Check the service with systemctl status MyEpitechNotif"
fi
