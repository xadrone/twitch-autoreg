import fetch, { RequestInit, Response } from "node-fetch";
import { randomUUID } from 'crypto'

const apiBaseURL = "https://gql.twitch.tv"
const reqHeaders = {
    'Accept-Language': 'en-GB',
    'Connection': 'keep-alive',
    'Content-Type': 'text/plain;charset=UTF-8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'x-device-id': randomUUID()
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

async function get_auth_data() {
    const username = await get_username();
    const pass = await get_password(Math.floor(Math.random() * 15) + 8);
    const mail = "yxflkjwt61@post-shift.ru";
    return {username: username, password: pass, mail: mail}
}

async function main(){
    const data = get_auth_data()

    const regBody = {
        "birthday": {
            "day": Math.floor((Math.random() * 28) + 1),
            "month": Math.floor(Math.random() * 12 + 1),
            "year": Math.floor((Math.random() * 30) + 1980),
        },
        "client_id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "email": (await data).mail,
        "integrity_token": "v4.local.MXC-Zd1SrWt6rs2G-ZqpJjf2FKA_H2JE4wYhrJ7bRccMwZzC3NgbhMrZHm0xqy5QYeHedW8GKHdM06KS6QltU_sVGcOG_RzD-VGHmMWm-oJO8Tl0DTZL-iTesyKWhAoG5-WLhtomjfXqluIWRhnRZEtz1c-quUJTYKxI6pSXs0yUQeaFZHFNpjVHWKQqwVdSh1V18wKtBfUUBZpxozZ2N7Y3EXqoIAmQc_Os7dZ5tDHQJZ7dXBZQrJanZlfLuiqN-XxUJy9-MPSEOyYMvjZIqPzZtW8Sga9n7t8L1WzAuPDzvhcVKmnpsUvtbmQEZ8LZkkL_5MyIhsJ59BCxjaJLlZIicGKKzBBJTvvuM5h_rvJF69AifUShbrq29C59ABoZGD1hadfX-0w_u1vKDmD43iQdHwvzyMn83kBNcKusDTQRblfWaldlXKvbAgymXp4bgjZWjslJtXdMaP83NDDuSUd6qyiNeSUF4eo5WCLWxDep-i0i_qCqcQ",
        "password": (await data).password,
        "username": (await data).username,
    }
    const registrationRes = await fetch("https://passport.twitch.tv/protected_register", {
        "method": "POST",
        "headers": Object.assign({
            "client-id": "kd1unb4b3q4t58fwlpcbzcbnm76a8fp",
        }, reqHeaders),
        "body": JSON.stringify(regBody),
    })
    const registrationResJSon = await registrationRes.json();
    console.log(regBody);
    console.log(registrationResJSon)
}
main();