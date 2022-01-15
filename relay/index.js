"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const puppeteer_1 = __importDefault(require("puppeteer"));
const cookies_1 = require("./cookies");
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
function openMicrosoftWindow(base, url) {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.NO_WINDOW)
            throw new Error("No window mode enabled");
        const browser = yield puppeteer_1.default.launch({
            executablePath: process.env.BROWSER_BINARY_PATH != ""
                ? process.env.BROWSER_BINARY_PATH : undefined,
            product: process.env.BROWSER_TYPE,
            headless: false,
            args: ["--app=https://my.epitech.eu", "--window-size=800,600"]
        });
        const pages = yield browser.pages();
        const page = pages[0];
        yield (0, cookies_1.saveCookies)(base, "./cookies.json");
        yield (0, cookies_1.restoreCookies)(page, "./cookies.json");
        yield page.goto(url);
        yield page.waitForRequest((res) => res.url().startsWith("https://my.epitech.eu/"), { timeout: 0 });
        yield (0, cookies_1.saveCookies)(page, "./cookies.json");
        yield (0, cookies_1.restoreCookies)(base, "./cookies.json");
        yield browser.close();
    });
}
function refreshMyEpitechToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const loginBtnSelector = '[href^="https://login.microsoftonline.com/common/oauth2/authorize"]';
        const browser = yield puppeteer_1.default.launch({
            executablePath: process.env.BROWSER_BINARY_PATH != ""
                ? process.env.BROWSER_BINARY_PATH : undefined,
            product: process.env.BROWSER_TYPE,
            headless: true
        });
        const page = yield browser.newPage();
        try {
            yield (0, cookies_1.restoreCookies)(page, "./cookies.json");
            yield page.goto('https://my.epitech.eu');
            const loginButton = yield page.$(loginBtnSelector);
            if (loginButton != null) {
                yield page.click(loginBtnSelector);
                yield new Promise((resolve) => setTimeout(resolve, 200));
                yield page.waitForNetworkIdle();
                const url = page.mainFrame().url();
                if (url.startsWith("https://login.microsoftonline.com/")) {
                    console.log("Asking for oauth...");
                    yield openMicrosoftWindow(page, url);
                    yield page.reload();
                    yield page.waitForNetworkIdle();
                }
                else {
                    console.log("Auto-auth was successful");
                }
            }
            else {
                console.log("Already logged in");
            }
        }
        catch (ex) {
            yield page.goto('https://my.epitech.eu');
            const loginButton = yield page.$(loginBtnSelector);
            if (loginButton != null) {
                yield browser.close();
                throw ex;
            }
        }
        const token = yield page.evaluate(() => localStorage.getItem("argos-api.oidc-token"));
        yield browser.close();
        if (typeof token !== "string")
            throw new Error("token not found");
        return token.substring(1, token.length - 1);
    });
}
function executeEpitestRequest(req, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield (0, axios_1.default)({
            baseURL: "https://api.epitest.eu/",
            url: req.path,
            params: req.params,
            headers: {
                "Authorization": "Bearer " + token,
                "Origin": "my.epitech.eu"
            }
        }).catch(e => e.response);
        return res;
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let myEpitechToken = yield refreshMyEpitechToken();
    app.get("/", (req, res) => {
        res.send("the relay is working :D");
    });
    app.use("/epitest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let content = yield executeEpitestRequest(req, myEpitechToken);
            if (content.status == 401) {
                myEpitechToken = yield refreshMyEpitechToken();
                content = yield executeEpitestRequest(req, myEpitechToken);
            }
            res.status(content.status).send(content.data);
        }
        catch (ex) {
            console.error(ex);
            res.status(500).send("Relay error.");
        }
    }));
    const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "8080");
    const host = (_b = process.env.HOST) !== null && _b !== void 0 ? _b : "127.0.0.1";
    app.listen(port, host, () => {
        console.log("Relay server started at http://" + host + ":" + port);
    });
}))();
