from PIL import ImageFont, Image, ImageDraw
import sys

bg_path = 'data/t1.jpg'
font_path = 'data/TitanOne-Regular.ttf'

colors = {
    'pink': (173, 20, 87, 120),
    'blue': (),
    'grey': (38, 50, 56, 120),
    'red': (),
    'black': ()
}

bg = Image.open(bg_path).convert('RGBA')
txt = Image.new('RGBA', bg.size, (255, 255, 255, 0))
img_xy = bg.size
draw = ImageDraw.Draw(txt)

long_text = sys.argv[1].split(' ')

target_x = 160
padding = 4
y_offset = 150
cursor = 0
target_chars = 8

while True:
    word_count = 1
    font_size = 62

    if cursor >= len(long_text):
        break

    while True:
        text_buffer = ' '.join(long_text[cursor:cursor + word_count])
        if (len(text_buffer) >= target_chars) or (cursor + word_count) > len(long_text):
            cursor += word_count
            break
        else:
            word_count += 1

    while True:
        font = ImageFont.truetype(font_path, font_size)
        text_xy = font.getsize(text_buffer)
        if text_xy[0] <= target_x:
            draw.text((img_xy[0] / 2 - text_xy[0] / 2, y_offset), text_buffer.upper(), colors['grey'], font=font)
            y_offset += text_xy[1] + padding
            break
        else:
            font_size -= 1

combined = Image.alpha_composite(bg, txt)
combined.show()
combined.save('out.png')
