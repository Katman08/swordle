from PIL import Image
import os

# Configuration: adjust these based on the actual layout of swords.png
NUM_SWORDS = 5
PARTS = ['end', 'handle', 'hilt', 'blade', 'tip']

# Open the source image
src_path = 'swords.png'
img = Image.open(src_path)

# Swords are arranged horizontally, each sword is the same width
# Each sword is split vertically into 5 equal parts (one for each part)
img_width, img_height = img.size
sword_width = img_width // NUM_SWORDS
part_height = img_height // len(PARTS)

os.makedirs('sword_parts', exist_ok=True)

for sword_idx in range(NUM_SWORDS):
    x0 = sword_idx * sword_width
    for part_idx, part in enumerate(PARTS):
        y0 = part_idx * part_height
        box = (x0, y0, x0 + sword_width, y0 + part_height)
        part_img = img.crop(box)
        part_dir = os.path.join('sword_parts', part)
        os.makedirs(part_dir, exist_ok=True)
        part_img.save(os.path.join(part_dir, f'{sword_idx+1}.png'))

print('====\nSword parts split and saved in sword_parts/\n' + '-'*80) 