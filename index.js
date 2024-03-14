const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { twitterClient } = require("./twitterClient.js");
require("dotenv").config({ path: __dirname + "/.env" });
const axios = require("axios");
const fs = require("fs");

const getRandomWord = async () => {
    try {
        const response = await axios.get('https://random-word-api.herokuapp.com/word');
        return response.data[0];
    } catch (error) {
        console.error('Error getting random word:', error);
        throw error;
    }
};

const generateImage = async (word) => {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    const background = await loadImage("background.png");
    ctx.filter = "blur(5px)";
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.filter = "blur(0px)";
    ctx.font = "bold 100px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(word, canvas.width / 2, canvas.height / 2);

    const buffer = canvas.toBuffer("image/png");
    const imagePath = `generated/${word}.png`;
    fs.writeFileSync(imagePath, buffer);

    return imagePath;
};

const tweetWithImage = async () => {
    try {
        const randomWord = await getRandomWord();

        const imagePath = await generateImage(randomWord);

        const mediaId = await twitterClient.v1.uploadMedia(imagePath);

        await twitterClient.v2.tweet({
            text: `${randomWord}`,
            media: { media_ids: [mediaId] },
        });

        console.log("Tweet com imagem enviado com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar o tweet com imagem:", error);
    }
};

const tweetEvery10Minutes = () => {
    tweetWithImage();
    
    setInterval(tweetWithImage, 600000);
};

tweetEvery10Minutes();