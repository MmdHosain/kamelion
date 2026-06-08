from pathlib import Path

OUTPUT_FILE = "frontend_auth_debug_dump.txt"

FILES_TO_COLLECT = [
 "src/pages/admin/AppointmentsAvailability.jsx",
 "src/hooks/useAuth.js",
 "src/services/authService.js",
 "src/store/authStore.js",
 "src/api/reservationService.js",
 "src/lib/apiClient.js",
 "src/App.jsx",
 "src/main.jsx",
 "src/components/ui/AppointmentModal.jsx"
]


SEPARATOR = "\n\n" + "-" * 3 + "\n\n"


def read_text_file(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return f"<<ERROR READING FILE: {e}>>"


def main():
    root = Path.cwd()
    out = [f"ROOT: {root}\n"]

    found = False

    for rel in FILES_TO_COLLECT:
        file_path = root / rel
        if file_path.exists() and file_path.is_file():
            found = True
            out.append(f"{rel}:\n")
            out.append(read_text_file(file_path))
            out.append(SEPARATOR)

    if not found:
        out.append("No target frontend files found.\n")

    output_path = root / OUTPUT_FILE
    output_path.write_text("".join(out), encoding="utf-8")
    print(f"Created: {output_path}")


if __name__ == "__main__":
    main()
