#Exam 2 : Python Password Cracking Challenge
import subprocess
import string

def crack_7z_password(archive_path):
    """
    Attempts to crack a 7z archive password by iterating
    over all possible two-letter combinations.
    
    Args:
        archive_path: Path to the 7z archive file
    """
    letters = string.ascii_lowercase  # 'abcdefghijklmnopqrstuvwxyz'
    
    # Known parts of the password — modify these to match your case
    password_prefix = "code"   # known beginning
    password_suffix = "word"   # known ending

    print(f"Starting brute-force attack on: {archive_path}")
    print(f"Password pattern: {password_prefix}??{password_suffix}")
    print("-" * 40)

    for first_letter in letters:
        for second_letter in letters:
            
            # Construct the candidate password
            candidate = f"{password_prefix}{first_letter}{second_letter}{password_suffix}"

            # Attempt extraction with 7z
            result = subprocess.run(
                ["7z", "e", archive_path, f"-p{candidate}", "-o./output", "-y"],
                stdout = subprocess.DEVNULL,
                stderr = subprocess.DEVNULL
            )

            # 7z returns exit code 0 on success
            if result.returncode == 0:
                print(f"✅ Password found: {candidate}")
                print(f"📂 Files extracted to: ./output")
                return candidate

    print("❌ Password not found. Check the known prefix/suffix.")
    return None


crack_7z_password("archive.7z")