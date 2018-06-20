const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const canvasWidth = canvas.width;
const img = new Image();
img.src = 'static/img/t2.jpg';

img.onload = () => {
    drawPolo();
};

const fontList = Object.freeze([
    'Bungee',
    'Pacifico',
    'Bangers',
    'Faster+One',
    'Passion+One',
    'Nosifer',
    'Monofett',
    'Shrikhand',
    'Sigmar+One',
    'Titan+One'
]);

const select = document.querySelector('#font-select');
const poloText = document.querySelector('#polo-text');
const colorInput = document.querySelector('#color-input');
const colorPreview = document.querySelector('#color-preview');
const outerShare = document.querySelector('.outer-share');
const overImage = document.querySelector('.inner-share > img');

let selectedFont = fontList[0].replace(/\+/g, ' ');

function fontChange(selected) {
    select.style.fontFamily = selected;
    selectedFont = selected;
    drawPolo();
}

function loadFonts() {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', `https://fonts.googleapis.com/css?family=${fontList.join('|')}&subset=latin-ext`);
    document.head.appendChild(link);

    select.style.fontFamily = selectedFont;
    for (const font of fontList) {
        const option = document.createElement('option');
        const fontName = font.replace(/\+/g, ' ');
        option.style.fontFamily = fontName;
        option.innerText = fontName;
        select.appendChild(option);
    }
}

// ColorPicker(
//     document.getElementById('slide'),
//     document.getElementById('picker'),
//     function(hex, hsv, rgb) {
//         colorInput.value = hex.slice(1);
//         setColor();
//     });

function setColor() {
    selectedColor = '#' + colorInput.value;
    colorPreview.style.backgroundColor = selectedColor;
    drawPolo();
}

loadFonts();
setColor();

context.globalCompositeOperation = 'difference';

poloText.addEventListener('keyup', drawPolo);
colorInput.addEventListener('keyup', setColor);

drawPolo();

function drawPolo() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    context.globalAlpha = 0.8;

    const longText = poloText.value.split(' ') || ''.split(' ');
    const targetWidth = canvas.width / 4;
    const linePadding = 8;

    let yOffset = canvas.width / 3.5 - longText.length * 6;
    let cursor = 0;
    let textBuffer = '';
    const targetChars = 5;

    while (true) {
        let wordCount = 1;
        let fontSize = 80;

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
            context.font = `${fontSize}px ${selectedFont}`;
            context.fillStyle = selectedColor;
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

function download() {
    const link = document.createElement('a');
    link.download = `wololo-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function openShare() {
    outerShare.style.display = 'block';
    overImage.src = canvas.toDataURL();
}

function closeShare() {
    outerShare.style.display = 'none';
}
