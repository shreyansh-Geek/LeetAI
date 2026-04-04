import sys
try:
    import pypdf
except ImportError:
    print("pypdf not installed. Please run pip install pypdf")
    sys.exit(1)

def extract_text(pdf_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"\n--- Page {i+1} ---\n"
            text += page.extract_text() or ""
        with open("pdf_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted PDF to pdf_text.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_pdf.py <pdf_path>")
        sys.exit(1)
    extract_text(sys.argv[1])
