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
exports.restoreCookies = exports.saveCookies = void 0;
const fs_1 = __importDefault(require("fs"));
function saveCookies(page, cookiesPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield page.target().createCDPSession();
        const cookies = (yield client.send("Network.getAllCookies"))["cookies"];
        console.log("Writing cookies");
        fs_1.default.writeFileSync(cookiesPath, JSON.stringify(cookies));
    });
}
exports.saveCookies = saveCookies;
function restoreCookies(page, cookiesPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.default.existsSync(cookiesPath)) {
            console.log("No cookies to restore.");
            return;
        }
        try {
            let buf = fs_1.default.readFileSync(cookiesPath);
            let cookies = JSON.parse(buf.toString());
            console.log("Restoring cookies");
            yield page.setCookie(...cookies);
        }
        catch (err) {
            console.error("Can't restore cookies", err);
        }
    });
}
exports.restoreCookies = restoreCookies;
