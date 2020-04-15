const redis = require("redis");
const client = redis.createClient();
const { promisify } = require("util");

const saddAsync = promisify(client.sadd).bind(client);
const srandmemberAsync = promisify(client.srandmember).bind(client);
const sismemberAsync = promisify(client.sismember).bind(client);
const hsetAsync = promisify(client.hset).bind(client);
const zaddAsync = promisify(client.zadd).bind(client);
const zincrbyAsync = promisify(client.zincrby).bind(client);
const zscoreAsync = promisify(client.zscore).bind(client);

client.on("error", function(){
    console.error(error);
});

client.on('connect', function () {
    console.log('connected');
});

async function criarJogador(numero) {
    let user = "user" + numero;
    let cartela = "cartela" + numero;
    let score = "score" + numero;
    let numeros = await srandmemberAsync("numerosParaGeracaoDeCartelas", 15);
    await saddAsync(cartela, numeros);
    await hsetAsync(user, "name", user);
    await hsetAsync(user, "bcartela", cartela);
    await hsetAsync(user, "bscore", score);
    await zaddAsync("score",  0, score);
}

async function jogar() {
    let bingo = false;
    while (!bingo) {
        let numeroSorteado = await srandmemberAsync("numerosParaGeracaoDeCartelas", 1);
        for (let indexUser = 1; indexUser < 3; indexUser++) {
            let contem = await sismemberAsync("cartela" + indexUser, numeroSorteado);
            if (contem == 1) {
                console.log("Cartela" + indexUser + " acertou!!!");
                await zincrbyAsync("score", 1, "score" + indexUser);
                let score = await zscoreAsync("score", "score" + indexUser);
                if (score == 15) {
                    bingo = true;
                    console.log("Jogador User".concat(indexUser).concat(" venceu!"));
                } 
            }
        }
    }
 }

async function main() {
    let numeros = [];
    for (let index = 1; index < 100; index++) {
        numeros.push(index.toString());
    }
    await saddAsync("numerosParaGeracaoDeCartelas", numeros);

    for (let indexUser = 1; indexUser < 3; indexUser++) {
        await criarJogador(indexUser);
    }

    await jogar();
}

main();
