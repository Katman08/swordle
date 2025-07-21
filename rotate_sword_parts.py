from PIL import Image
import os

PARTS = ['end', 'handle', 'hilt', 'blade', 'tip']
NUM_SWORDS = 5

for part in PARTS:
    part_dir = os.path.join('sword_parts', part)
    for i in range(1, NUM_SWORDS + 1):
        img_path = os.path.join(part_dir, f'{i}.png')
        if os.path.exists(img_path):
            img = Image.open(img_path)
            rotated = img.rotate(-90, expand=True)  # -90 for clockwise
            rotated.save(img_path)
            print(f'Rotated {img_path}')
print('====\nAll sword part images rotated 90 degrees.\n' + '-'*80) 