let touchStart = 0;
let touchProgress = 0;
let touchInProgress = false;
let changeTarget = true;

let scroll = false;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const imgPaths = ['t1.jpg', 't2.jpg', 't1.jpg', 't2.jpg', 't1.jpg'];
const imgs = imgPaths.map(i => {
    let newImg = new Image();
    newImg.src = 'static/img/' + i;
    return newImg;
});

imgs[0].onload = () => {
    selectedColor = '#' + colorInput.value;
    colorPreview.style.backgroundColor = selectedColor;
    requestAnimationFrame(() => drawPolo(true));
};

let canvasOffset = (imgs.length - 1) * canvas.width;
let scrollTarget = imgs.length - 1;
console.log(canvasOffset);

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

let params = (new URL(document.location)).searchParams;
let selectedColor, selectedFont;

initSetup();

function fontChange (selected) {
    select.value = selected;
    select.style.fontFamily = selected;
    selectedFont = selected;
    requestAnimationFrame(() => drawPolo(true));
}

function loadFonts () {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', `https://fonts.googleapis.com/css?family=${fontList.join('|')}&subset=latin-ext`);
    document.head.appendChild(link);

    for (const font of fontList) {
        const option = document.createElement('option');
        const fontName = font.replace(/\+/g, ' ');
        option.style.fontFamily = fontName;
        option.innerText = fontName;
        select.appendChild(option);
    }
    select.value = selectedFont;
    select.style.fontFamily = selectedFont;
}

function setColor () {
    selectedColor = '#' + colorInput.value;
    colorPreview.style.backgroundColor = selectedColor;
    requestAnimationFrame(drawPolo);
}

function initSetup () {
    poloText.value = decodeURIComponent(params.get('txt') || '') || 'Hello';
    selectedFont = (decodeURIComponent(params.get('font') || '') || fontList[0]).replace(/\+/g, ' ');
    colorInput.value = decodeURIComponent(params.get('color') || '') || 'BBDEFB';

    loadFonts();
    selectedColor = '#' + colorInput.value;
    colorPreview.style.backgroundColor = selectedColor;
}

context.globalCompositeOperation = 'difference';
context.textAlign = 'center';

poloText.addEventListener('keyup', () => {
    requestAnimationFrame(() => drawPolo(true));
});
colorInput.addEventListener('keyup', setColor);

function updateUri () {
    history.replaceState('state', 'Index',
        `?txt=${encodeURIComponent(poloText.value)}&color=${encodeURIComponent(colorInput.value)}` +
        `&font=${encodeURIComponent(selectedFont)}`);
}

function drawPolo (textChanged = false) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;

    if (scroll) {
        const dx = scrollTarget * canvas.width - canvasOffset;
        canvasOffset += dx * 0.1;
        if (Math.abs(canvasOffset % canvas.width) <= 5 || Math.abs(canvasOffset % canvas.width) >= canvas.width - 5) {
            canvasOffset = scrollTarget * canvas.width;
            scroll = false;
        }

        for (let i in imgs) {
            context.drawImage(imgs[i], canvasOffset - i * canvas.width, 0, canvas.width, canvas.height);
        }
        window.requestAnimationFrame(drawPolo);
        return;
    }

    for (let i in imgs) {
        context.drawImage(imgs[i], canvasOffset - i * canvas.width, 0, canvas.width, canvas.height);
    }

    if (touchInProgress) return;

    context.globalAlpha = 0.8;

    if (textChanged) cachedText = calculateText();

    const xOffset = canvas.width / 2;
    context.fillStyle = selectedColor;
    for (const line of cachedText) {
        context.font = line.font;
        context.fillText(line.text, xOffset, line.yOffs);
    }
}

function calculateText () {
    let returnText = [];

    const longText = poloText.value.split(' ') || ''.split(' ');
    const targetWidth = canvas.width / 4;
    const linePadding = 8;

    let yOffset = canvas.width / 3.5 - (longText.join(' ').length / 2);
    let cursor = 0;
    let textBuffer = '';
    const targetChars = 5;

    while (true) {
        let wordCount = 1;
        let fontSize = 100;

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
            // context.fillStyle = selectedColor;
            const textWidth = context.measureText(textBuffer).width;

            if (textWidth <= targetWidth) {
                yOffset += fontSize + linePadding;
                returnText.push({text: textBuffer, yOffs: yOffset, font: `${fontSize}px ${selectedFont}`});
                break;
            } else {
                fontSize--;
            }
        }
    }

    return returnText;
}

function download () {
    const link = document.createElement('a');
    link.download = `wololo-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function openShare () {
    outerShare.style.display = 'block';
    overImage.src = canvas.toDataURL();
}

function closeShare () {
    outerShare.style.display = 'none';
}

canvas.addEventListener('touchstart', function (e) {
    touchStart = e.touches[0].clientX;
    window.requestAnimationFrame(drawPolo);
    touchInProgress = true;
}, false);

canvas.addEventListener('touchmove', function (e) {
    canvasOffset = scrollTarget * canvas.width + (e.changedTouches[0].clientX - touchStart) * 3;
    if (canvasOffset > scrollTarget * canvas.width + canvas.width / 3 && scrollTarget < imgs.length - 1) {
        changeTarget = 1;
    } else if (canvasOffset < scrollTarget * canvas.width - canvas.width / 3 && scrollTarget > 0) {
        changeTarget = -1;
    } else {
        changeTarget = 0;
    }
    window.requestAnimationFrame(drawPolo);
}, false);

canvas.addEventListener('touchend', function (e) {
    touchInProgress = false;
    if (!scroll) {
        scrollTarget += changeTarget;
        scroll = true;
    }
    window.requestAnimationFrame(drawPolo);
}, false);
