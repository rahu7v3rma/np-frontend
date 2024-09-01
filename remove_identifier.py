import os

def remove_files_with_suffix(directory, suffix):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(suffix):
                file_path = os.path.join(root, file)
                try:
                    os.remove(file_path)
                    print(f"Removed file: {file_path}")
                except OSError as e:
                    print(f"Error removing {file_path}: {e}")

# Example usage:
directory_path = '/Users/rahul/Downloads/beehive-linux-20-08-2024/np-frontend'
file_suffix = 'Zone.Identifier'  # specify the suffix (e.g., '.txt', '.log')
remove_files_with_suffix(directory_path, file_suffix)
