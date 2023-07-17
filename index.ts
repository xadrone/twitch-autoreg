import { accountGen } from "./accountGen";

let i = 0;
let exitCode, success = 0, fail = 0, failDB = 0;
let acCount = 2;
async function main(){
    while (i < acCount) {
        exitCode = await accountGen();
        exitCode == 0 ? success++ : exitCode == 1 ? fail++ : failDB++;
        i++;
    }
    console.log(`Запрошено ${acCount} аккаунтов\nУспешно создано\t\t\t - ${success}\nЗавершилось с ошибкой twitch\t - ${fail}\nЗавершилось с ошибкой бд\t - ${failDB}`);
}
main();
