#!/usr/bin/env python3
from PIL import Image, ImageDraw
import math

# Create image
width, height = 1600, 800
img = Image.new('RGB', (width, height))
draw = ImageDraw.Draw(img)

# Dark green gradient background
for y in range(height):
    r = int(10 + (y / height) * 20)
    g = int(46 + (y / height) * 40)
    b = int(26 + (y / height) * 30)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Add radial gradient overlay
for y in range(height):
    for x in range(width):
        dist = math.sqrt((x - width/2)**2 + (y - height/2)**2)
        max_dist = math.sqrt((width/2)**2 + (height/2)**2)
        factor = dist / max_dist
        r, g, b = img.getpixel((x, y))
        new_r = int(r * (1 - factor * 0.3))
        new_g = int(g * (1 - factor * 0.3))
        new_b = int(b * (1 - factor * 0.3))
        img.putpixel((x, y), (new_r, new_g, new_b))

# Draw concentric circles (growth rings)
for i, radius in enumerate([200, 150, 100]):
    cx, cy = 800, 400
    alpha = 20 + i * 5
    draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], 
                 outline=(255, 255, 255, alpha), width=2)

# Draw flowing curved lines
for i in range(5):
    points = []
    for x in range(100, 1500, 10):
        y = 400 + math.sin((x + i*100) / 200) * (50 + i*20)
        points.append((x, y))
    if len(points) > 1:
        draw.line(points, fill=(255, 255, 255, 30 + i*5), width=2)

# Draw leaf-like shapes
leaves = [(400, 300, -30), (500, 350, -45), (350, 280, -20)]
for x, y, angle in leaves:
    # Simple leaf shape
    for offset in range(-20, 21, 5):
        lx = x + offset
        ly = y + int(math.sin(offset/10) * 20)
        draw.ellipse([lx-5, ly-3, lx+5, ly+3], fill=(255, 255, 255, 40))

# Draw upward arrows
arrows = [(500, 200), (600, 180), (700, 160)]
for x, y in arrows:
    draw.polygon([(x, y), (x-10, y+20), (x+10, y+20)], fill=(255, 255, 255, 50))

# Save image
output_path = '/opt/data/home/breakaway/public/banner.png'
img.save(output_path, 'PNG')
print(f"Image saved to: {output_path}")
