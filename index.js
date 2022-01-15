require("dotenv").config();
const {logger, error} = require("./logger");
const fs = require("fs");
const {spawn} = require("child_process");
const config = require("./config.json")
const axios = require("axios");
const {Webhook, MessageBuilder} = require('discord-webhook-node');
const pkg = require("./package.json");

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT) || 8080;
const relayPath = "./relay/index.js"
const interval = config.interval_of_check || 15 * 60 * 1000;
const relayCheck = config.relay_check || 5000;
const url = `http://${host}:${port}/`
const hook = new Webhook(config.webhook);
hook.setAvatar("https://my.epitech.eu/favicon.png");
hook.setUsername("MyEpitech");

/**
 * Start my.epitech.eu relay in child process (Thanks to https://github.com/norech/my-epitech-relay)
 */
const startRelay = () => {
    logger.info(`Trying to start the relay on ${url}`);
    let child = spawn("node", [relayPath], {
        env: process.env
    })
    if (!child.pid)
        throw Error("Can't start the relay on child");

    child.stdout.on('data', (data) => {
        logger.info("[MyEpitechRelay]: %s", data.toString().endsWith("\n") ? data.slice(0, -1) : data);
    });

    child.stderr.on('data', (data) => {
        logger.error("[MyEpitechRelay]: Error %s", data.toString().endsWith("\n") ? data.slice(0, -1) : data);
        throw data;
    })

    logger.info(`Relay started on child process id: ${child.pid}`)
}

/**
 * A simple sleep function
 * @param ms time to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Checking if the relay works
 * @returns {Promise<void>}
 */
const checkRelay = async () => {
    try {
        await axios.get(`${url}`);
        logger.info("Request to relay working well");
    } catch (err) {
        logger.error(`Can't request to the relay trying in ${relayCheck}ms`);
        await sleep(relayCheck);
        await checkRelay();
    }
}

/**
 * Fetch data from the relay
 * @returns {Promise<any>}
 */
const fetchData = async () => {
    try {
        let response = await axios.get(`${url}epitest/me/2021`);
        return response.data;
    } catch (err) {
        logger.error("Error when requesting data to my.epitech.eu relay");
        throw err;
    }
}

/**
 * Checking if new tests results is available on my.epitech.eu
 * @returns {Promise<void>}
 */
const notifier = async () => {
    logger.info("Checking data...");
    let data = await fetchData();

    if (!fs.existsSync("./tests.json")) {
        logger.info("tests.json doesn't exist creating a new one");
        let testsId = [];
        data.forEach(project => {
            testsId.push(project.results.testRunId);
        });
        logger.info("Saving run id of projects...");
        fs.writeFileSync("./tests.json", JSON.stringify(testsId, null, 2));
    } else {
        let testsId = require("./tests.json");
        for (const project of data) {
            if (testsId.includes(project.results.testRunId))
                logger.info(`Test already exist in database: ${project.project.name}`);
            else {
                testsId.push(project.results.testRunId);
                let name = project.project.name;
                let module = project.project.module.code
                let date = new Date(project.date)
                logger.info("New results on my.epitech.eu. Project: [%s] Module: [%s] Date [%s]", name, module, date.toString());
                let message = new MessageBuilder()
                    .setTitle("New result on my.epitech.eu")
                    .addField("Project:", name)
                    .addField("Module:", module)
                    .addField("Date: ", `<t:${date.getTime() / 1000}:F>`)
                    .setColor(0x00FF00)
                    .setTimestamp()
                    .setFooter(`${pkg.name} - ${pkg.version}`)
                await hook.send(message);
            }
        }
        fs.writeFileSync("./tests.json", JSON.stringify(testsId, null, 2));
    }
}

/**
 * Simply a main
 * @returns {Promise<void>}
 */
const main = async () => {
    logger.info("Starting my.epitech.eu relay")
    startRelay();
    logger.info("Checking relay");
    await checkRelay();
    logger.info(`Interval of fetching data is set to ${interval}ms`)
    await notifier();
    setInterval(async () => {
        await notifier();
    }, config.interval_of_check);
}

main().catch(async (err) => {
    error(err);
    await hook.send(new MessageBuilder()
        .setTitle("Error")
        .setDescription(`${err}`)
        .setColor(0xFF0000)
        .setTimestamp()
        .setFooter(`${pkg.name} - ${pkg.version}`)
    );
});