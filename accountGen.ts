const { chromium, firefox, webkit } = require('playwright');
import { randomUUID } from 'crypto'
const MongoClient = require("mongodb").MongoClient;

const apiBaseURL = "https://gql.twitch.tv";
const url = "mongodb://127.0.0.1:27017/";
const client = new MongoClient(url);

const chromium_args = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--no-first-run',
  '--disable-blink-features=AutomationControlled',
];

const reqHeaders = {
  'Accept-Language': 'en-GB',
  'Connection': 'keep-alive',
  'Content-Type': 'text/plain;charset=UTF-8',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'x-device-id': randomUUID()
}

async function get_password(length: number) {
  let pass = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charLen = chars.length;
  let counter = 0;
  while (counter < length) {
      pass += chars.charAt(Math.floor(Math.random() * charLen));
      counter ++;
  }
  return pass;
}

async function get_username() {
  const userRes = (await fetch("https://names.drycodes.com/1"))
  const userJson = await userRes.json()
  const userValidBody = {
  "operationName": "UsernameValidator_User",
  "variables": {"username" : userJson[0]},
  "extensions": {
  "persistedQuery": {
      "version": 1,
      "sha256Hash": "fd1085cf8350e309b725cf8ca91cd90cac03909a3edeeedbd0872ac912f3d660"
  }}}

  const userValidatorRes = await fetch(`${apiBaseURL}/gql`, {
      "method": "POST",
      "body": JSON.stringify(userValidBody),
      "headers": Object.assign({
          'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      }, reqHeaders),
  })
  const userValidJson = await userValidatorRes.json()
  return userValidJson.data.isUsernameAvailable ? userJson[0] : (userJson[0] + Math.floor(Math.random() * 888))
}

async function accountGen() { //exitCode: (0) - ошибок нет, (-1) - ошибка подключения mongoDB, (1) - ошибка создания twitch
    const browser = await chromium.launchPersistentContext("C:/Users/hyrag/AppData/Local/Google/Chrome/User Data/", {
      headless: false,
      channel: 'chrome',
      slowMo : 200,
      args: chromium_args,
      ignoreDefaultArgs: ['--enable-automation'],
    })
    const username = await get_username();
    const password = await get_password(Math.floor(Math.random() * 15) + 8);
    const email = await get_password(Math.floor(Math.random() * 10) + 10);
    const cookies = await browser.cookies();
    const page = await browser.newPage();
    let   exitCode = 0;

    await page.goto('https://www.twitch.tv/');
    await page.getByRole('navigation').filter({ hasText: 'Skip to...AltPBrowseBrowseBrowseSearchLog InSign Up' }).getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('Username').fill(username);
    await page.getByRole('textbox', { name: 'Create a secure password' }).click();
    await page.getByRole('textbox', { name: 'Create a secure password' }).fill(password);
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('button', { name: 'Use email instead' }).click();
    await page.getByLabel('Email').fill(email + '@mail.ru');
    await page.getByRole('button', { name: 'Next Step' }).click();
    await page.getByRole('combobox', { name: 'Select your birthday month' }).selectOption((Math.floor(Math.random() * 11 + 1)).toString());
    await page.getByPlaceholder('Day').click();
    await page.getByPlaceholder('Day').fill((Math.floor((Math.random() * 28) + 1)).toString());
    await page.getByPlaceholder('Year').click();
    await page.getByPlaceholder('Year').fill((Math.floor((Math.random() * 30) + 1980)).toString());
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByRole('button', { name: 'Remind me later' }).click().then(async()=>{
      await browser.clearCookies();
      await browser.addCookies(cookies);
      await page.close();
      await browser.close();
      try {
        await client.connect().then(async(mongoClient:any)=>{
          await client.db("accountsDB").collection("accounts").insertOne({login: username, pass: password});
          console.log(`login = ${username}\npass = ${password}`);
        });
      } catch(err) {
        exitCode = -1;
      } finally {
        await client.close();
      }
    }, async()=>{
      await page.close();
      await browser.close();
      exitCode = 1;
    });
    return exitCode;
}

export{accountGen};