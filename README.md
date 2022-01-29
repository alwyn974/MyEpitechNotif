# MyEpitechNotif

A useful nodejs program to send notification on discord when new result is available on https://my.epitech.eu

## Install

You need to clone/download this project, and then you need to run `npm install`

You can use the `install-service.sh` script to install the project (clone + setup of a service)

## Usage

You need to specify the discord webhook link in the `config.json`.

Then you can use `npm start` to run the program it will run the relay. <br>
You will need to connect to your Epitech account. (Graphically, then the refresh will be headless)

#### ⚠️ A file named `cookies.json` will be created. Don't share this file with anyone

When you are connected the notifier with check every **15 minutes** (configurable in the `config.json`) if new results are available on my.epitech.eu

A message will be sended via the discord webhook when new project is available

## Tips

- You can change the host, and port of the relay in `.env` file

- You can login into the app (graphically on linux/windows), and then copy the `cookies.json` file to your headless machine

- **Docker**, **Systemd** is on the wiki page ⬇️

### Check the [wiki](https://github.com/alwyn974/MyEpitechNotif/wiki) for more tips

## Troubleshooting

- Error of puppeteer saying that chrome binary is not valid (or a message like this)

=> You need to install chromium-browser and specify the path in the `.env` file

- Any error with puppeteer

=> Check the troubleshooting page of puppeteer
https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

## Thanks

Thanks to Alexis Cheron for creating the [my-epitech-relay](https://github.com/norech/my-epitech-relay)

> :bulb: Don't forget to put a star on the project to support the project
