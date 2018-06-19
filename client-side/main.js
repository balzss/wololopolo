let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

ctx.globalCompositeOperation = 'multiply';

let img = document.querySelector('img');
ctx.drawImage(img, 0, 0, 600, 600);

const longText = 'ez egy hosszu szoveg, amit ki kellene irni hogy tudja tesztelni ezt a szarrt'.split(' ');
const targetWidth = 160;
const linePadding = 4;
const targetChars = 18;

let yOffset = 160;
let cursor = 0;
let wordCount = 1;
let fontSize = 60;
let textBuffer = '';

while (true) {
    wordCount = 1;
    fontSize = 60;

    if (cursor >= longText.length) break;

    while (true) {
        textBuffer = longText.slice(cursor, wordCount).join(' ');
        console.log(longText.slice(cursor, wordCount));
        if (textBuffer.length >= targetChars || (cursor + wordCount) > longText.length) {
            cursor += wordCount;
            break;
        } else {
            wordCount++;
        }
    }

    while (true) {
        ctx.font = fontSize + 'px serif';
        ctx.fillStyle = 'rgb(255,0,255)';
        const textSize = ctx.measureText(textBuffer);

        console.log(textBuffer);
        if (textSize.width <= targetWidth) {
            ctx.fillText(textBuffer, canvas.width / 2 - textSize.width / 2, yOffset);
            yOffset += fontSize + linePadding;
            break;
        } else {
            fontSize--;
        }
    }
}
