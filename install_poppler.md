# Install Poppler for PDF OCR

## Quick Installation Steps

### Step 1: Download Poppler
1. Go to: https://github.com/oschwartz10612/poppler-windows/releases
2. Download: `Release-24.08.0-0.zip` (latest version)
3. Extract the ZIP file

### Step 2: Install
1. Copy the extracted folder to: `C:\Program Files\poppler`
2. The structure should be:
   ```
   C:\Program Files\poppler\
   ├── Library\
   │   └── bin\
   │       ├── pdftotext.exe
   │       ├── pdftoppm.exe
   │       └── ...
   └── ...
   ```

### Step 3: Add to PATH
1. Press `Win + X` and select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path"
5. Click "Edit"
6. Click "New"
7. Add: `C:\Program Files\poppler\Library\bin`
8. Click "OK" on all windows

### Step 4: Verify Installation
Open a NEW terminal and run:
```bash
pdftoppm -v
```

Should show version info if installed correctly.

### Step 5: Restart Backend
```bash
cd smartstudy/backend
python main.py
```

## Alternative: Use Chocolatey (Easier)

If you have Chocolatey installed:
```bash
choco install poppler
```

Then restart backend.

## After Installation

Your image-based PDFs will work automatically with OCR! 🎉
