let touchStart = 0;
let touchProgress = 0;
let touchInProgress = false;
let changeTarget = 0;

let scroll = false;

let cachedText;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const imgPaths = ['t1.jpg', 't2.jpg', 't1.jpg', 't2.jpg', 't1.jpg'];
const imgs = imgPaths.map(i => {
    let newImg = new Image();
    newImg.src = 'static/img/' + i;
    return newImg;
});

imgs[0].onload = () => {
    selectedColor = colorDisplay.innerText;
    colorDisplay.style.backgroundColor = selectedColor;
    requestAnimationFrame(() => drawPolo(true));
};

let canvasOffset = (imgs.length - 1) * canvas.width;
let scrollTarget = imgs.length - 1;

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
const colorDisplay = document.querySelector('.color-container');
const colorInput = document.querySelector('.color-input');
const outerShare = document.querySelector('.outer-share');
const overImage = document.querySelector('.inner-share > img');
const indicatorRow = document.querySelector('.indicator-row');

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
    selectedColor = '#' + colorInput.value.repeat(6).substring(0, 6).toUpperCase();
    colorDisplay.innerText = selectedColor;
    colorDisplay.style.backgroundColor = selectedColor;
    requestAnimationFrame(drawPolo);
}

function initSetup () {
    poloText.value = decodeURIComponent(params.get('txt') || '') || 'Hello';
    selectedFont = (decodeURIComponent(params.get('font') || '') || fontList[0]).replace(/\+/g, ' ');
    colorInput.value = decodeURIComponent(params.get('color') || '') || '3F51B5';

    for (const i in imgs) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === imgs.length - 1 - scrollTarget) dot.classList.add('active');
        indicatorRow.appendChild(dot);
    }
    loadFonts();
    selectedColor = '#' + colorInput.value;
    colorDisplay.innerText = selectedColor;
    colorDisplay.style.backgroundColor = selectedColor;
}

context.globalCompositeOperation = 'normal';
context.textAlign = 'center';

poloText.addEventListener('keyup', () => {
    requestAnimationFrame(() => drawPolo(true));
});

colorInput.addEventListener('keyup', e => {
    if (!e.key.match(new RegExp('[a-fA-F0-9]')) ||
        colorInput.value.length > 6) {
        colorInput.value = colorInput.value.substring(0, colorInput.value.length - 1);
    }
    if ([1, 2, 3, 6].indexOf(colorInput.value.length) > -1) {
        setColor();
    }
});

function updateUri () {
    history.replaceState('state', 'Index',
    `/${encodeURIComponent(poloText.value)}/${encodeURIComponent(colorDisplay.value)}/${encodeURIComponent(selectedFont)}`);
}

function updateUriFrontendOnly () {
    history.replaceState('state', 'Index',
        `?txt=${encodeURIComponent(poloText.value)}&color=${encodeURIComponent(selectedColor.substring(1, 7))}` +
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
    } else {
        for (let i in imgs) {
            context.drawImage(imgs[i], canvasOffset - i * canvas.width, 0, canvas.width, canvas.height);
        }
    }

    if (textChanged) cachedText = calculateText();
    drawText(cachedText);
}

function drawText (text) {
    context.globalAlpha = 0.8;
    const xOffset = canvasOffset % canvas.width + canvas.width / 2;
    const xOffset2 = canvasOffset % canvas.width - canvas.width / 2;
    context.fillStyle = selectedColor;
    for (const line of text) {
        context.font = line.font;
        if (canvasOffset < imgs.length * canvas.width && canvasOffset > -canvas.width) {
            context.fillText(line.text, xOffset, line.yOffs);
        }
        if ((scroll || touchInProgress) && canvasOffset < (imgs.length - 1) * canvas.width) {
            context.fillText(line.text, xOffset2, line.yOffs);
        }
    }

    if (STATIC_SERVER) {
        updateUriFrontendOnly();
    } else {
        updateUri();
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
    overImage.src = canvas.toDataURL();
    outerShare.style.display = 'block';
}

function closeShare () {
    outerShare.style.display = 'none';
}

canvas.addEventListener('touchstart', function (e) {
    touchStart = e.touches[0].clientX;
    window.requestAnimationFrame(drawPolo);
    touchInProgress = true;
}, false);

document.querySelector('.arrow.left').addEventListener('touchstart', function (e) {
    changeBg(1);
}, false);

document.querySelector('.arrow.right').addEventListener('touchstart', function (e) {
    changeBg(-1);
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
    updateIndicators();
    window.requestAnimationFrame(drawPolo);
}, false);

canvas.addEventListener('touchend', function (e) {
    touchInProgress = false;
    scrollTarget += changeTarget;
    scroll = true;
    window.requestAnimationFrame(drawPolo);
}, false);

function changeBg (direction) {
    if (scrollTarget + direction < 0 || scrollTarget + direction > imgs.length - 1) return;
    changeTarget = 0;
    scrollTarget += direction;
    updateIndicators();
    scroll = true;
    window.requestAnimationFrame(drawPolo);
}

function updateIndicators () {
    document.querySelectorAll('.dot').forEach(e => e.classList.remove('active'));
    const activeIndicator = imgs.length - 1 - (scrollTarget + changeTarget);
    document.querySelectorAll('.dot')[activeIndicator].classList.add('active');
}

function toggle() {
    const b = document.querySelector('.bubble');
    b.style.opacity = b.style.opacity === '0' ? '0.98' : '0';
}
