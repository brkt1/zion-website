import os

def fix_file(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    for i, line in enumerate(lines):
        if '#E4E821' in line:
            lines[i] = line.replace('#E4E821', '#FFD447')
            
    with open(file_path, 'w') as f:
        f.writelines(lines)

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.css')):
            fix_file(os.path.join(root, f))
