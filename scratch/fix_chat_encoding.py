from pathlib import Path
path = Path('chat.html')
text = path.read_text(encoding='utf-8')
markers = ('Ã', 'Ä', 'Å', 'â', 'ğŸ')
fixed_lines = []
changed = 0
for line in text.splitlines(keepends=True):
    if any(m in line for m in markers):
        try:
            fixed = line.encode('cp1254').decode('utf-8')
            line = fixed
            changed += 1
        except UnicodeError:
            pass
    fixed_lines.append(line)
path.write_text(''.join(fixed_lines), encoding='utf-8', newline='')
print('changed_lines=', changed)
