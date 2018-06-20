const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const canvasWidth = canvas.width;

context.globalCompositeOperation = 'multiply';

document.querySelector('input').addEventListener('keyup', drawPolo);

drawPolo();

function drawPolo() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(document.querySelector('img'), 0, 0, canvas.width, canvas.height);

    // const longText = 'ugytunik hogy csak a kirajzolas koordinataival volt valami baj'.split(' ');
    const longText = this.value ? this.value.split(' ') : 'hello bello'.split(' ');
    const targetWidth = canvas.width / 4;
    const linePadding = 8;
    const targetChars = 8;

    let yOffset = canvas.width / 4;
    let cursor = 0;
    let wordCount = 1;
    let fontSize = 60;
    let textBuffer = '';

    while (true) {
        wordCount = 1;
        fontSize = 40;

        if (cursor >= longText.length) break;

        while (true) {
            textBuffer = longText.slice(cursor, cursor + wordCount).join(' ');
            if (textBuffer.length >= targetChars || (cursor + wordCount) > longText.length) {
                cursor += wordCount;
                break;
            } else {
                wordCount++;
            }
        }

        while (true) {
            context.font = fontSize + 'px Bungee Inline';
            context.fillStyle = 'rgb(255,0,255)';
            const textWidth = context.measureText(textBuffer).width;

            if (textWidth <= targetWidth) {
                yOffset += fontSize + linePadding;
                context.fillText(textBuffer, canvasWidth / 2 - textWidth / 2, yOffset);
                break;
            } else {
                fontSize--;
            }
        }
    }
}
