#!/usr/bin/env python3
"""
Script to rename TIFF files with invalid Windows characters.
Handles both ZIP files and already extracted directories.

This script will:
1. Check if files are in a ZIP or already extracted
2. Rename files to be Windows-compatible by replacing invalid characters
3. Optionally create a new ZIP with renamed files

Invalid Windows characters: < > : " | ? * \
"""

import os
import zipfile
import shutil
import re
from pathlib import Path

def sanitize_filename(filename):
    """
    Replace invalid Windows characters with safe alternatives.
    
    Args:
        filename (str): Original filename
        
    Returns:
        str: Sanitized filename safe for Windows
    """
    # Define invalid characters and their replacements
    replacements = {
        ':': '-',  # colon to dash
        '<': '(',  # less than to open paren
        '>': ')',  # greater than to close paren
        '"': "'",  # double quote to single quote
        '|': '-',  # pipe to dash
        '?': '',   # question mark removed
        '*': '',   # asterisk removed
        '\\': '_', # backslash to underscore
        '/': '_'   # forward slash to underscore (just in case)
    }
    
    sanitized = filename
    for invalid_char, replacement in replacements.items():
        sanitized = sanitized.replace(invalid_char, replacement)
    
    # Remove any double dashes or underscores that might have been created
    sanitized = re.sub(r'[-_]{2,}', '-', sanitized)
    
    return sanitized

def rename_files_in_directory(directory_path):
    """
    Rename all files in a directory to be Windows-compatible.
    
    Args:
        directory_path (str): Path to directory containing files to rename
    """
    directory = Path(directory_path)
    
    if not directory.exists():
        print(f"Directory {directory_path} does not exist!")
        return
    
    renamed_files = []
    
    for file_path in directory.iterdir():
        if file_path.is_file():
            original_name = file_path.name
            sanitized_name = sanitize_filename(original_name)
            
            if original_name != sanitized_name:
                new_path = file_path.parent / sanitized_name
                
                # Check if target file already exists
                if new_path.exists():
                    print(f"Warning: Target file {sanitized_name} already exists. Skipping {original_name}")
                    continue
                
                try:
                    file_path.rename(new_path)
                    renamed_files.append((original_name, sanitized_name))
                    print(f"Renamed: {original_name} -> {sanitized_name}")
                except Exception as e:
                    print(f"Error renaming {original_name}: {e}")
            else:
                print(f"No changes needed: {original_name}")
    
    if renamed_files:
        print(f"\nSuccessfully renamed {len(renamed_files)} files:")
        for old, new in renamed_files:
            print(f"  {old} -> {new}")
    else:
        print("\nNo files needed renaming.")

def rename_files_in_zip(zip_path, output_zip_path=None):
    """
    Create a new ZIP file with renamed files from an existing ZIP.
    
    Args:
        zip_path (str): Path to original ZIP file
        output_zip_path (str): Path for new ZIP file (optional)
    """
    zip_file = Path(zip_path)
    
    if not zip_file.exists():
        print(f"ZIP file {zip_path} does not exist!")
        return
    
    if output_zip_path is None:
        output_zip_path = zip_file.parent / f"{zip_file.stem}_renamed{zip_file.suffix}"
    
    renamed_files = []
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as source_zip:
            with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as target_zip:
                for file_info in source_zip.infolist():
                    original_name = file_info.filename
                    sanitized_name = sanitize_filename(original_name)
                    
                    # Read the file data
                    file_data = source_zip.read(original_name)
                    
                    # Write with new name
                    target_zip.writestr(sanitized_name, file_data)
                    
                    if original_name != sanitized_name:
                        renamed_files.append((original_name, sanitized_name))
                        print(f"Renamed in ZIP: {original_name} -> {sanitized_name}")
                    else:
                        print(f"No changes needed: {original_name}")
        
        print(f"\nCreated new ZIP file: {output_zip_path}")
        if renamed_files:
            print(f"Renamed {len(renamed_files)} files in the new ZIP")
        
    except Exception as e:
        print(f"Error processing ZIP file: {e}")

def process_zip_with_renamed_files(zip_path, extract_to_dir=None):
    """
    Process ZIP file: rename files within ZIP and extract with clean names.

    Args:
        zip_path (str): Path to original ZIP file
        extract_to_dir (str): Directory to extract to (optional)
    """
    zip_file = Path(zip_path)

    if not zip_file.exists():
        print(f"ZIP file {zip_path} does not exist!")
        return

    if extract_to_dir is None:
        extract_to_dir = zip_file.parent / f"{zip_file.stem}_clean"

    extract_dir = Path(extract_to_dir)
    extract_dir.mkdir(exist_ok=True)

    renamed_files = []

    try:
        with zipfile.ZipFile(zip_path, 'r') as source_zip:
            print("Files in ZIP and their renamed versions:")
            print("-" * 60)

            for file_info in source_zip.infolist():
                original_name = file_info.filename
                sanitized_name = sanitize_filename(original_name)

                # Read the file data
                file_data = source_zip.read(original_name)

                # Write directly to extraction directory with clean name
                output_path = extract_dir / sanitized_name
                with open(output_path, 'wb') as f:
                    f.write(file_data)

                if original_name != sanitized_name:
                    renamed_files.append((original_name, sanitized_name))
                    print(f"✓ {original_name}")
                    print(f"  -> {sanitized_name}")
                else:
                    print(f"✓ {original_name} (no changes needed)")
                print()

        print(f"Successfully extracted to: {extract_dir}")
        if renamed_files:
            print(f"Renamed {len(renamed_files)} files during extraction")
        else:
            print("No files needed renaming")

        # List final files
        print(f"\nFinal files in {extract_dir}:")
        for file_path in sorted(extract_dir.iterdir()):
            if file_path.is_file():
                print(f"  {file_path.name}")

    except Exception as e:
        print(f"Error processing ZIP file: {e}")

def main():
    """Main function to handle file renaming."""

    # Define paths
    current_dir = Path.cwd()
    zip_file_path = current_dir / "Browser_images (2).zip"

    print("TIFF File Renamer - Extract ZIP with Windows-Compatible Names")
    print("=" * 65)

    # Check if ZIP exists
    if not zip_file_path.exists():
        print(f"ZIP file not found: {zip_file_path}")
        print("Please make sure the ZIP file is in the current directory.")
        return

    print(f"Found ZIP file: {zip_file_path}")

    # Show what's in the ZIP first
    print("\nAnalyzing ZIP contents...")
    try:
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            files = zip_ref.namelist()
            print(f"Found {len(files)} files in ZIP:")
            for filename in files:
                sanitized = sanitize_filename(filename)
                if filename != sanitized:
                    print(f"  ❌ {filename} (needs renaming)")
                else:
                    print(f"  ✅ {filename} (OK)")
    except Exception as e:
        print(f"Error reading ZIP: {e}")
        return

    print(f"\nProcessing ZIP and extracting with clean filenames...")
    process_zip_with_renamed_files(zip_file_path)

if __name__ == "__main__":
    main()
