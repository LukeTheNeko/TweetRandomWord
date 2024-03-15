const { createCanvas, loadImage } = require("@napi-rs/canvas");
const fs = require("fs");
require("dotenv").config({ path: __dirname + "/.env" });
const { twitterClient } = require("./twitterClient.js")
const path = require("path");

const loadWords = () => {
    try {
        const language = process.env.LANGUAGE || 'en';
        const data = fs.readFileSync(`./language/${language}.json`, "utf8");
        return JSON.parse(data).words;
    } catch (error) {
        console.error("Error loading JSON file:", error);
        return [];
    }
};

const getRandomWordFromList = (wordList) => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
};

const getRandomWord = () => {
    const wordList = loadWords();
    if (wordList.length === 0) {
        throw new Error("Empty word list.");
    }
    return getRandomWordFromList(wordList);
};

const generateImage = async (word) => {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext("2d");

    const backgroundFiles = fs.readdirSync("backgrounds/");
    const randomIndex = Math.floor(Math.random() * backgroundFiles.length);
    const randomBackground = backgroundFiles[randomIndex];

    const background = await loadImage(`backgrounds/${randomBackground}`);
    ctx.filter = "blur(6px)";
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.filter = "blur(0px)";
    ctx.font = "bold 85px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textX = canvas.width / 2;
    const textY = canvas.height / 2;

    const borderWidth = 2;
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = "#ffffff";

    for (let offsetX = -borderWidth; offsetX <= borderWidth; offsetX++) {
        for (let offsetY = -borderWidth; offsetY <= borderWidth; offsetY++) {
            ctx.strokeText(word, textX + offsetX, textY + offsetY);
        }
    }

    ctx.fillText(word, textX, textY);

    return canvas.toBuffer("image/png");
};

const tweetWithImage = async () => {
    try {
        const randomWord = await getRandomWord();

        const imageBuffer = await generateImage(randomWord);

        const tempImagePath = path.join(__dirname, "img.png");
        fs.writeFileSync(tempImagePath, imageBuffer);

        const mediaId = await twitterClient.v1.uploadMedia(tempImagePath);

        await twitterClient.v2.tweet({
            text: `${randomWord}`,
            media: { media_ids: [mediaId] },
        });

        console.log(`Tweet with Word "${randomWord}" + image successfully sent`);

        fs.unlinkSync(tempImagePath);
    } catch (error) {
        console.error("Error sending tweet with image:", error);
    }
};

const tweetEvery10Minutes = () => {
    tweetWithImage();

    setInterval(tweetWithImage, 600000);
};

tweetEvery10Minutes();