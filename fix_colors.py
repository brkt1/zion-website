import subprocess
import os

diff = subprocess.check_output(['git', 'diff', 'HEAD~1'], text=True)

# we just need to get the file contents of HEAD~1 and HEAD
files = subprocess.check_output(['git', 'diff', '--name-only', 'HEAD~1'], text=True).splitlines()

for file in files:
    if not file.startswith('src/'): continue
    if not os.path.isfile(file): continue
    
    # Get the version from HEAD~1
    try:
        old_content = subprocess.check_output(['git', 'show', f'HEAD~1:{file}'], text=True)
    except Exception:
        continue
        
    with open(file, 'r') as f:
        new_content = f.read()
    
    # We want to keep the Navy background (#0F172A and #1E293B) and the rgba replacements
    # but we want to restore any instance of #FFD447 or #FF6F5E that got converted to #E4E821
    
    # Actually, the easiest way is to apply the text replacement on the old content, skipping E4E821
    # old_content -> #01211C -> #0F172A
    # old_content -> #02352E -> #1E293B
    # ...
    fixed_content = old_content.replace('#01211C', '#0F172A')
    fixed_content = fixed_content.replace('#02352E', '#1E293B')
    fixed_content = fixed_content.replace('rgba(1, 33, 28,', 'rgba(15, 23, 42,')
    fixed_content = fixed_content.replace('rgba(1,33,28,', 'rgba(15,23,42,')
    fixed_content = fixed_content.replace('rgba(2, 53, 46,', 'rgba(30, 41, 59,')
    fixed_content = fixed_content.replace('rgba(2,53,46,', 'rgba(30,41,59,')
    fixed_content = fixed_content.replace('Deep Dark Green', 'Navy')
    
    with open(file, 'w') as f:
        f.write(fixed_content)

print("Done")
