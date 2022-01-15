# MyEpitechNotif

A useful nodejs program to send notification on discord when new result is available on https://my.epitech.eu

## Install

You need to clone/download this project, and then you need to run `npm install`

## Usage

You need to specify the discord webhook link in the `config.json`.

Then you can use `npm start` to run the program it will run the relay. <br>
You will need to connect to your Epitech account. (Graphically, then the refresh will be headless)

#### ⚠️ A file named `cookies.json` will be created. Don't share this file with anyone

When you are connected the notifier with check every **15 minutes** (configurable in the `config.json`) if new results are available on my.epitech.eu

A message will be sended via the discord webhook when new project is available

## Tips

You can change the host, and port of the relay in `.env` file

## Thanks

Thanks to Alexis Cheron for creating the [my-epitech-relay](https://github.com/norech/my-epitech-relay)

> :bulb: Don't forget to put a star on the project to support the project
