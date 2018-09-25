const fontList = Object.freeze([
    'Bungee',
    'Pacifico',
    'Bangers',
    'VT323',
    'Faster+One',
    'Passion+One',
    'Nosifer',
    'Monofett',
    'Shrikhand',
    'Sigmar+One',
    'Titan+One'
]);

const colors = Object.freeze([
    '#9C27B0',
    '#f44336',
    '#009688',
    '#3F51B5',
    '#00BCD4',
    '#795548',
    '#FF9800',
    '#4CAF50',
    '#E91E63'
]);

const imgPaths = Object.freeze(['t2.jpg', 't1.jpg', 't2.jpg', 't1.jpg']);
const imgs = imgPaths.map(i => {
    let newImg = new Image();
    newImg.src = 'static/img/' + i;
    return newImg;
});

const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const notHexChars = /[^a-fA-F0-9]/;

imgs[0].onload = () => {
    selectedColor = colorDisplay.innerText;
    colorDisplay.style.backgroundColor = selectedColor;
    requestAnimationFrame(() => drawPolo(true));
};

const select = document.querySelector('#font-select');
const poloText = document.querySelector('#polo-text');
const colorDisplay = document.querySelector('.color-container');
const colorInput = document.querySelector('.color-input');
const colorGrid = document.querySelector('.color-grid');
const outerShare = document.querySelector('.outer-share');
const overImage = document.querySelector('.inner-share > img');
const indicatorRow = document.querySelector('.indicator-row');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let touchStart = 0;
let touchInProgress = false;
let changeTarget = 0;
let scroll = false;

let selectedColor, selectedFont, scrollTarget, canvasOffset, cachedText;

poloText.addEventListener('keyup', () => {
    updateUri();
    requestAnimationFrame(() => drawPolo(true));
});

colorInput.addEventListener('keyup', e => { handleColorInputChange(e.key); });

function handleColorInputChange (key) {
    if (colorInput.value.length > 6) {
        colorInput.value = colorInput.value.substring(0, 6);
    }

    if (key.match(notHexChars)) {
        colorInput.value = colorInput.value.replace(notHexChars, '');
    }

    const inputLength = colorInput.value.length;
    if (inputLength !== 3 && inputLength !== 6) {
        return;
    }

    setColor(colorInput.value);
}

colorDisplay.addEventListener('touchstart', toggle);
colorDisplay.addEventListener('click', toggle);

canvas.addEventListener('touchstart', function (e) {
    touchStart = e.touches[0].clientX;
    window.requestAnimationFrame(drawPolo);
    touchInProgress = true;
}, false);

document.querySelector('.arrow.left').addEventListener('touchstart', e => changeBg(e, 1));
document.querySelector('.arrow.left').addEventListener('click', e => changeBg(e, 1));
document.querySelector('.arrow.right').addEventListener('touchstart', e => changeBg(e, -1));
document.querySelector('.arrow.right').addEventListener('click', e => changeBg(e, -1));

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

initSetup();

function initSetup () {
    context.globalCompositeOperation = 'normal';
    context.textAlign = 'center';

    const params = (new URL(document.location)).searchParams;

    poloText.value = decodeURIComponent(params.get('txt') || '') || 'Hello';
    selectedFont = (decodeURIComponent(params.get('font') || '') || fontList[0]).replace(/\+/g, ' ');
    colorInput.value = params.get('color') || '3F51B5';
    scrollTarget = imgs.length - 1 - (parseInt(params.get('bg')) || 0);
    canvasOffset = scrollTarget * canvas.width;

    for (const i in imgs) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === imgs.length - 1 - scrollTarget) dot.classList.add('active');
        indicatorRow.appendChild(dot);
    }
    loadFonts();

    for (const color of colors) {
        const colorElem = document.createElement('div');
        colorElem.style.backgroundColor = color;

        colorElem.addEventListener('touchstart', e => colorClickHandler(e, color));
        colorElem.addEventListener('click', e => colorClickHandler(e, color));
        colorElem.style.cursor = 'pointer';

        colorGrid.prepend(colorElem);
    }

    selectedColor = '#' + colorInput.value;
    colorDisplay.innerText = selectedColor;
    colorDisplay.style.backgroundColor = selectedColor;
}

function fontChange (selected) {
    select.value = selected;
    select.style.fontFamily = selected;
    selectedFont = selected;
    updateUri();
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

function setColor (noHashHex) {
    if (!noHashHex.match(hexRegex)) {
        return;
    }

    const sixCharacterHex = colorInput.value.length === 3 ? threeToSixCharacterHex(colorInput.value) : colorInput.value;
    selectedColor = '#' + sixCharacterHex.toUpperCase();

    colorDisplay.innerText = selectedColor;
    colorDisplay.style.backgroundColor = selectedColor;
    updateUri();
    requestAnimationFrame(drawPolo);
}

function threeToSixCharacterHex (hex) {
    return hex.split('').reduce((acc, char) => acc + char + char, '');
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

function changeBg (e, direction) {
    e.preventDefault();
    if (scrollTarget + direction < 0 || scrollTarget + direction > imgs.length - 1) return;
    changeTarget = 0;
    scrollTarget += direction;
    updateIndicators();
    scroll = true;
    updateUri();
    window.requestAnimationFrame(drawPolo);
}

function updateIndicators () {
    document.querySelectorAll('.dot').forEach(e => e.classList.remove('active'));
    const activeIndicator = imgs.length - 1 - (scrollTarget + changeTarget);
    document.querySelectorAll('.dot')[activeIndicator].classList.add('active');
}

function toggle (e) {
    e.preventDefault();
    const bubble = document.querySelector('.bubble');
    bubble.style.opacity = bubble.style.opacity === '0' ? '0.98' : '0';
}

function colorClickHandler (e, color) {
    e.preventDefault();
    const noHashHex = color.substring(1, 7);
    colorInput.value = noHashHex;
    setColor(noHashHex);
}

function updateUri () {
    const newUri = `?color=${selectedColor.substring(1, 7)}&font=${encodeURIComponent(selectedFont)}` +
        `&bg=${imgs.length - 1 - scrollTarget}&txt=${encodeURIComponent(poloText.value)}`;
    history.replaceState('state', 'Index', newUri);
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
}

function calculateText () {
    let returnText = [];

    const longText = poloText.value.split(' ') || [''];
    const targetWidth = canvas.width / 4;
    const linePadding = 8;

    let yOffset = canvas.width / 3.5 - (longText.join(' ').length / 2);
    let cursor = 0;
    let textBuffer = '';
    const targetChars = 4;

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
                returnText.push({ text: textBuffer, yOffs: yOffset, font: `${fontSize}px ${selectedFont}` });
                break;
            } else {
                fontSize--;
            }
        }
    }

    return returnText;
}
