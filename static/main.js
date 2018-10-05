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

const colorSchemes = {
    'dark': Object.freeze([
        '#ffffff',
        '#cccccc',
        '#bf8b56',
        '#8bbf56',
        '#56bf8b',
        '#568bbf',
        '#8b56bf',
        '#bf568b',
        '#bf5656'
    ]),
    'light': Object.freeze([
        '#000000',
        '#666666',
        '#EA9560',
        '#FFCC00',
        '#8BD649',
        '#80CBC4',
        '#89DDFF',
        '#82AAFF',
        '#EC5F67'
    ])
};

const imgPaths = Object.freeze(['t2.jpg', 't1.jpg', 't2.jpg', 't1.jpg']);
const imgColorScheme = Object.freeze(['dark', 'light', 'dark', 'light']);

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
const outerShare = document.querySelector('.outer-share');
const overImage = document.querySelector('.inner-share > img');
const indicatorRow = document.querySelector('.indicator-row');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

let touchStart = 0;
let touchInProgress = false;
let changeTarget = 0;
let scroll = false;

let selectedColor, selectedFont, selectedPolo, canvasOffset, cachedText;

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

colorDisplay.addEventListener('touchstart', toggleColorPicker);
colorDisplay.addEventListener('click', toggleColorPicker);

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
    canvasOffset = selectedPolo * canvas.width + (e.changedTouches[0].clientX - touchStart) * 3;
    if (canvasOffset > selectedPolo * canvas.width + canvas.width / 3 && selectedPolo < imgs.length - 1) {
        changeTarget = 1;
    } else if (canvasOffset < selectedPolo * canvas.width - canvas.width / 3 && selectedPolo > 0) {
        changeTarget = -1;
    } else {
        changeTarget = 0;
    }
    updateIndicators();
    window.requestAnimationFrame(drawPolo);
}, false);

canvas.addEventListener('touchend', function (e) {
    touchInProgress = false;
    selectedPolo += changeTarget;
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
    selectedPolo = imgs.length - 1 - (parseInt(params.get('bg')) || 0);
    canvasOffset = selectedPolo * canvas.width;

    for (const i in imgs) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === imgs.length - 1 - selectedPolo) dot.classList.add('active');
        indicatorRow.appendChild(dot);
    }
    loadFonts();

    const colorScheme = getCurrentColorSheme();
    console.log(colorScheme);
    for (let colorEntry of colorScheme.entries()) {
        const colorElem = getColorElem(colorEntry[0]);
        colorElem.style.backgroundColor = colorEntry[1];
        colorElem.addEventListener('touchstart', e => colorClickHandler(e, colorEntry[0]));
        colorElem.addEventListener('click', e => colorClickHandler(e, colorEntry[0]));
        colorElem.style.cursor = 'pointer';
    }

    selectedColor = '#' + colorInput.value;
    colorDisplay.innerText = selectedColor;
    colorDisplay.style.backgroundColor = selectedColor;
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

function fontChange (selected) {
    select.value = selected;
    select.style.fontFamily = selected;
    selectedFont = selected;
    updateUri();
    requestAnimationFrame(() => drawPolo(true));
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
    if (selectedPolo + direction < 0 || selectedPolo + direction > imgs.length - 1) return;
    changeTarget = 0;
    selectedPolo += direction;
    updateIndicators();
    updateColorPickerScheme();
    scroll = true;
    updateUri();
    window.requestAnimationFrame(drawPolo);
}

function updateIndicators () {
    document.querySelectorAll('.dot').forEach(e => e.classList.remove('active'));
    const activeIndicator = imgs.length - 1 - (selectedPolo + changeTarget);
    document.querySelectorAll('.dot')[activeIndicator].classList.add('active');
}

function updateColorPickerScheme () {
    const colorScheme = getCurrentColorSheme();
    for (let colorEntry of colorScheme.entries()) {
        const colorElem = getColorElem(colorEntry[0]);
        colorElem.style.backgroundColor = colorEntry[1];
    }
}

function getColorElem (colorIndex) {
    return document.querySelector(`.color-${colorIndex}`);
}

function toggleColorPicker (e) {
    e.preventDefault();
    const bubble = document.querySelector('.bubble');
    bubble.classList.toggle('opened');
}

function colorClickHandler (e, colorIndex) {
    e.preventDefault();
    const colorScheme = getCurrentColorSheme();
    const noHashHex = colorScheme[colorIndex].substring(1, 7);
    colorInput.value = noHashHex;
    setColor(noHashHex);
}

function getCurrentColorSheme () {
    return colorSchemes[imgColorScheme[selectedPolo]];
}

function updateUri () {
    const newUri = `?color=${selectedColor.substring(1, 7)}&font=${encodeURIComponent(selectedFont)}` +
        `&bg=${imgs.length - 1 - selectedPolo}&txt=${encodeURIComponent(poloText.value)}`;
    history.replaceState('state', 'Index', newUri);
}

function drawPolo (textChanged = false) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;

    if (scroll) {
        const dx = selectedPolo * canvas.width - canvasOffset;
        canvasOffset += dx * 0.1;
        if (Math.abs(canvasOffset % canvas.width) <= 5 || Math.abs(canvasOffset % canvas.width) >= canvas.width - 5) {
            canvasOffset = selectedPolo * canvas.width;
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

    const rawWords = poloText.value.split(' ') || [''];
    const words = rawWords.filter(word => word !== '');
    const targetWidth = canvas.width / 4;
    const linePadding = 8;
    const targetChars = 4;

    let yOffset = canvas.width / 3.5 - (words.join(' ').length / 2);
    let cursor = 0;
    let textBuffer = '';

    while (true) {
        let wordCount = 1;
        let fontSize = 100;

        if (cursor >= words.length) break;

        while (true) {
            textBuffer = words.slice(cursor, cursor + wordCount).join(' ');

            if (textBuffer.length >= targetChars || (cursor + wordCount) > words.length) {
                cursor += wordCount;
                break;
            }

            wordCount++;
        }

        while (true) {
            context.font = `${fontSize}px ${selectedFont}`;
            const textWidth = context.measureText(textBuffer).width;

            if (textWidth <= targetWidth) {
                yOffset += fontSize + linePadding;
                returnText.push({ text: textBuffer, yOffs: yOffset, font: `${fontSize}px ${selectedFont}` });
                break;
            }

            fontSize--;
        }
    }

    return returnText;
}