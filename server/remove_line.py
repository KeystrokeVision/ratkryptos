import sys

filepath = sys.argv[1]
line_to_remove = int(sys.argv[2]) - 1  # Convert to 0-indexed

with open(filepath, 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

if 0 <= line_to_remove < len(lines):
    print(f"Removing line {line_to_remove+1}: {repr(lines[line_to_remove][:80])}")
    del lines[line_to_remove]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Done")
else:
    print(f"Line {line_to_remove+1} out of range (file has {len(lines)} lines)")
