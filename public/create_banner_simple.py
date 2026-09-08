#!/usr/bin/env python3
# Create banner using basic Python without PIL
import struct
import zlib

def create_png(width, height, pixels):
    """Create PNG file from pixel data"""
    def make_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)
    
    # PNG header
    header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk (image data)
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # filter byte
        for x in range(width):
            r, g, b = pixels[y][x]
            raw_data += struct.pack('BBB', r, g, b)
    
    compressed = zlib.compress(raw_data)
    idat = make_chunk(b'IDAT', compressed)
    
    # IEND chunk
    iend = make_chunk(b'IEND', b'')
    
    return header + ihdr + idat + iend

def main():
    width, height = 1600, 800
    pixels = [[(0, 0, 0) for _ in range(width)] for _ in range(height)]
    
    # Create dark green gradient background
    for y in range(height):
        for x in range(width):
            # Radial gradient from center
            dx = (x - width/2) / (width/2)
            dy = (y - height/2) / (height/2)
            dist = (dx*dx + dy*dy) ** 0.5
            
            # Base colors
            r = int(10 + 20 * (1 - dist))
            g = int(46 + 40 * (1 - dist))
            b = int(26 + 30 * (1 - dist))
            
            pixels[y][x] = (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))
    
    # Add concentric circles (growth rings)
    for radius in [300, 220, 140]:
        cx, cy = width//2, height//2
        for angle in range(360):
            import math
            rad = math.radians(angle)
            x = int(cx + radius * math.cos(rad))
            y = int(cy + radius * math.sin(rad))
            if 0 <= x < width and 0 <= y < height:
                r, g, b = pixels[y][x]
                pixels[y][x] = (min(255, r + 20), min(255, g + 20), min(255, b + 20))
    
    # Save PNG
    png_data = create_png(width, height, pixels)
    with open('/opt/data/home/breakaway/public/banner.png', 'wb') as f:
        f.write(png_data)
    print("Banner created successfully!")

if __name__ == '__main__':
    main()
