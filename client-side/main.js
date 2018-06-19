const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

drawPolo(canvas.width, context);

function drawPolo(canvasWidth, ctx) {
    context.globalCompositeOperation = 'multiply';
    context.drawImage(document.querySelector('img'), 0, 0, 600, 600);

    const longText = 'ugytunik hogy csak a kirajzolas koordinataival volt valami baj'.split(' ');
    const targetWidth = 160;
    const linePadding = 4;
    const targetChars = 12;
    const lineHeight = 1.2;

    let yOffset = 160;
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
            console.log(longText.slice(cursor, cursor + wordCount));
            if (textBuffer.length >= targetChars || (cursor + wordCount) > longText.length) {
                cursor += wordCount;
                break;
            } else {
                wordCount++;
            }
        }

        while (true) {
            ctx.font = fontSize + 'px/' + lineHeight + 'em sans-serif';
            ctx.fillStyle = 'rgb(255,0,255)';
            const textWidth = ctx.measureText(textBuffer).width;

            console.log(textBuffer);
            if (textWidth <= targetWidth) {
                ctx.fillText(textBuffer, canvasWidth / 2 - textWidth / 2, yOffset);
                yOffset += fontSize * lineHeight;
                break;
            } else {
                fontSize--;
            }
        }
    }
}
