import os
import urllib.request
import tarfile
import shutil
import subprocess

target_dir = os.path.join(os.environ['LOCALAPPDATA'], 'ms-playwright-go', '1.57.0')
os.makedirs(target_dir, exist_ok=True)

tgz_url = 'https://registry.npmjs.org/playwright-core/-/playwright-core-1.57.0.tgz'
tgz_path = os.path.join(target_dir, 'playwright-core-1.57.0.tgz')

print('Downloading playwright-core-1.57.0.tgz...')
urllib.request.urlretrieve(tgz_url, tgz_path)

print('Extracting tarball...')
with tarfile.open(tgz_path, 'r:gz') as tar:
    tar.extractall(path=target_dir)

if os.path.exists(tgz_path):
    os.remove(tgz_path)

# Copy node.exe
node_src = r'C:\Program Files\nodejs\node.exe'
node_dst = os.path.join(target_dir, 'node.exe')
if os.path.exists(node_src):
    print(f'Copying {node_src} to {node_dst}...')
    shutil.copy2(node_src, node_dst)

# Create playwright.cmd
cmd_content = '@"%~dp0\\node.exe" "%~dp0\\package\\cli.js" %*\n'
with open(os.path.join(target_dir, 'playwright.cmd'), 'w', encoding='utf-8') as f:
    f.write(cmd_content)

print('Files in ms-playwright-go/1.57.0:', os.listdir(target_dir))

# Verify executing playwright.cmd --version
result = subprocess.run([os.path.join(target_dir, 'playwright.cmd'), '--version'], capture_output=True, text=True)
print('Playwright CLI output:', result.stdout.strip() or result.stderr.strip())
