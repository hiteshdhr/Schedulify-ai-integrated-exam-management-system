import pdfplumber
import re
import json
import sys
import os
import datetime

import argparse
import shutil
import tempfile
from io import BytesIO


try:
    import ocrmypdf
except ImportError:
    ocrmypdf = None

try:
    import pytesseract
except ImportError:
    pytesseract = None

try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None





DATE_RE1 = re.compile(r"(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})") 
DATE_RE2 = re.compile(r"(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*[ ,]*\s*\d{2,4})", re.I)

TIME_RE = re.compile(r"(\d{1,2}(?::\d{2})?\s*(?:AM|PM))", re.I)


SUBJECT_RE = re.compile(r"\b[A-Z]{1,4}[-]?\d{2,4}[A-Za-z]?(?:/[A-Z]{1,4}[-]?\d{2,4}[A-Za-z]?)*\b")


def normalize_date(date_str):
    if not date_str:
        return None
    try:
        
        date_str = date_str.replace('/', '-').replace('.', '-')
        
        return datetime.datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
    except ValueError:
        try:
           
            return datetime.datetime.strptime(date_str, '%m-%d-%Y').strftime('%Y-%m-%d')
        except ValueError:
            try:
                
                date_str = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", date_str)
                date_str = date_str.replace(',', '') 
                return datetime.datetime.strptime(date_str, '%d %B %Y').strftime('%Y-%m-%d')
            except ValueError:
                return date_str 

def normalize_time(time_str):
    if not time_str:
        return None
    try:

        return datetime.datetime.strptime(time_str.upper(), '%I %p').strftime('%H:%M')
    except ValueError:
        try:
            
            return datetime.datetime.strptime(time_str.upper(), '%I:%M %p').strftime('%H:%M')
        except ValueError:
            return time_str 

def clean_page(page):
    """
    Removes known footers/headers to avoid confusing the table parser.
    """
    try:
        
        footer_re = re.compile(r"Page \d+ of \d+")
        return page.filter(lambda obj: not (obj["object_type"] == "char" and footer_re.search(obj.get("text"))))
    except Exception:
        return page



def parse_table_mode(page):
    """
    Try to extract structured data from page.extract_tables()
    """
    results = []
    tables = []
    
    
    cleaned_page = clean_page(page)

    
    try:
        
        tables = cleaned_page.extract_tables() or []
    except Exception:
        tables = []
    
    if not tables:
        try:
            
            table_settings = { 
                "vertical_strategy": "lines", 
                "horizontal_strategy": "lines", 
                "snap_tolerance": 4 
            }
            tables = cleaned_page.extract_tables(table_settings) or []
        except Exception:
            tables = []
    
    if not tables:
        try:
            
            table_settings = { 
                "vertical_strategy": "text", 
                "horizontal_strategy": "text",
                "text_x_tolerance": 10,
                "text_y_tolerance": 5,
            }
            tables = cleaned_page.extract_tables(table_settings) or []
        except Exception:
            tables = []
    
    print(f"Found {len(tables)} tables on this page.", file=sys.stderr)
    

    if not tables:
        return results

    for table in tables:
        
        header = [] 
        
       
        for row in table: 
        
            if not row or len(row) == 0:
                continue
            
            date_cell = (row[0] or "").strip()
            date = None
            if date_cell:
                m = DATE_RE1.search(date_cell) or DATE_RE2.search(date_cell)
                if m:
                    date = m.group(1)
            
            if not date:
                
                for cell in row:
                    if not cell:
                        continue
                    m = DATE_RE1.search(cell) or DATE_RE2.search(cell)
                    if m:
                        date = m.group(1)
                        break
            
           
            if not date:
                continue

          
            for col_idx, cell in enumerate(row[1:], start=1):
                cell_text = (cell or "").strip()
                if not cell_text:
                    continue
                
                matches = list(SUBJECT_RE.finditer(cell_text))
                if not matches:
                    continue

              
                session_text = ""
                start_time = None
                end_time = None

                if col_idx == 1: 
                    session_text = "Morning Session (10 am to 1 pm)"
                elif col_idx == 2: 
                    session_text = "Morning Session (10 am to 1 pm)"
                elif col_idx == 3: 
                    session_text = "Evening Session (2 pm to 5 pm)"
                elif col_idx == 4: 
                    session_text = "Evening Session (2 pm to 5 pm)"
                
                time_matches = TIME_RE.findall(session_text)
                start_time = time_matches[0] if time_matches else None
                end_time = time_matches[1] if len(time_matches) > 1 else None
                

                for i, match in enumerate(matches):
                    subject_code = match.group(0)
                    
                  
                    start_index = match.end()
                    end_index = matches[i+1].start() if i + 1 < len(matches) else len(cell_text)
                    
                    name_blob = cell_text[start_index:end_index]
                    
                   
                    name = name_blob.replace('\n', ' ').strip(" -:—–()").strip()
                   
                    name = re.sub(r'\s*\([^\)]+\)$', '', name).strip()
                    
                    if not name:
                        name = None
                    
                    results.append({
                        "date": normalize_date(date),
                        "subject": subject_code,
                        "name": name,
                        "startTime": normalize_time(start_time), 
                        "endTime": normalize_time(end_time),     
                        "session": session_text,
                        "raw_text": f"{subject_code} {name or ''}"
                    })
                
    return results


def parse_columns_mode(page, x_tolerance=20, y_tolerance=4):
    """ Fallback: use extract_words() """
   
    return []

def page_is_scanned(page):
    txt = page.extract_text()
    if not txt or txt.strip()=="":
        return True
    return False


def check_ocr_dependencies():
    """
    Checks for required OCR libraries and binaries.
    Returns the best available method ('ocrmypdf', 'pytesseract') or (None, error_msg).
    """
    missing_deps = {
        "ocrmypdf": [],
        "pytesseract": []
    }

   
    tesseract_bin = shutil.which("tesseract")
    if not tesseract_bin:
        missing_deps["ocrmypdf"].append("tesseract binary (install from your OS package manager)")
        missing_deps["pytesseract"].append("tesseract binary (install from your OS package manager)")

    
    gs_bin = shutil.which("gs") 
    
    if ocrmypdf is None:
        missing_deps["ocrmypdf"].append("ocrmypdf library (run: pip install ocrmypdf)")
    if not gs_bin:
        missing_deps["ocrmypdf"].append("ghostscript binary (gs)")

    if not missing_deps["ocrmypdf"]:
        return "ocrmypdf", None 

   
    poppler_bin = shutil.which("pdftoppm") 
    if pytesseract is None:
        missing_deps["pytesseract"].append("pytesseract library (run: pip install pytesseract)")
    if convert_from_path is None:
        missing_deps["pytesseract"].append("pdf2image library (run: pip install pdf2image)")
    if not poppler_bin:
        missing_deps["pytesseract"].append("poppler-utils (pdftoppm) (install from your OS package manager)")

    if not missing_deps["pytesseract"]:
        return "pytesseract", None 
    
    error_msg = "OCR dependencies not met for --ocr flag. "
    error_msg += f"For 'ocrmypdf' (preferred): missing {', '.join(missing_deps['ocrmypdf'])}. "
    error_msg += f"For 'pytesseract' (fallback): missing {', '.join(missing_deps['pytesseract'])}."
    return None, error_msg

def run_ocr_on_page(pdf_path, pageno, ocr_method):
   
    ocr_page = None
    try:
        if ocr_method == "ocrmypdf":
            
            with tempfile.NamedTemporaryFile(suffix=".pdf") as temp_out_pdf:
                ocrmypdf.ocr(
                    pdf_path,
                    temp_out_pdf.name,
                    pages=str(pageno),  
                    force_ocr=True,    
                    skip_text=True,     
                    language="eng",     
                    quiet=True
                )
                
                with pdfplumber.open(temp_out_pdf.name) as ocr_pdf:
                    if ocr_pdf.pages:
                        ocr_page = ocr_pdf.pages[0]
        
        elif ocr_method == "pytesseract":
            
            images = convert_from_path(pdf_path, first_page=pageno, last_page=pageno)
            if images:
                image = images[0]
                
                ocr_pdf_bytes = pytesseract.image_to_pdf_or_hocr(image, extension='pdf', lang='eng')
                
               
                with pdfplumber.open(BytesIO(ocr_pdf_bytes)) as ocr_pdf:
                    if ocr_pdf.pages:
                        ocr_page = ocr_pdf.pages[0]

    except Exception as e:
       
        pass 
    
    return ocr_page



def parse_pdf(pdf_path, do_ocr=False, ocr_method=None): 
    all_results = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for pageno, page in enumerate(pdf.pages, start=1):
                
                if pageno == 14:
                    continue
                
                page_to_parse = page 
                if page_is_scanned(page):
                    if not do_ocr:
                        continue 
                    
                  
                    ocr_page = run_ocr_on_page(pdf_path, pageno, ocr_method)
                    
                    if ocr_page:
                        page_to_parse = ocr_page 
                    else:
                        
                        continue 
                    
                table_mode_results = parse_table_mode(page_to_parse)
                if table_mode_results:
                    all_results.extend(table_mode_results)
                    continue

               
                column_mode_results = parse_columns_mode(page_to_parse)
                if column_mode_results:
                    all_results.extend(column_mode_results)
                    continue
                
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return []

    
    seen = set()
    deduped = []
    for r in all_results:
        key = (r.get('subject'), r.get('date'), r.get('startTime')) 
        if key in seen:
            continue
        seen.add(key)
        deduped.append(r)
    return deduped

if __name__ == "__main__":
   
    parser = argparse.ArgumentParser(
        description="Extract exam schedule from a PDF datesheet.",
        usage="python %(prog)s /path/to/datesheet.pdf [--ocr]"
    )
    parser.add_argument(
        "pdf_path", 
        type=str, 
        help="Full path to the datesheet.pdf file"
    )
    parser.add_argument(
        "--ocr", 
        action="store_true", 
        help="Enable OCR for scanned pages. Requires external dependencies: "
             "1) 'ocrmypdf' (preferred) or 'pytesseract'/'pdf2image' (fallback). "
             "2) 'tesseract' binary. 3) 'poppler' (for fallback)."
    )
    

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing PDF path"}))
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()

    pdf_path = args.pdf_path
    do_ocr = args.ocr
    ocr_method = None
    
    
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": "PDF file not found"}))
        sys.exit(1)

    
    if do_ocr:
        ocr_method, error_msg = check_ocr_dependencies()
        if error_msg:
            
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
    
    # Call parse_pdf with new OCR flags
    result = parse_pdf(pdf_path, do_ocr, ocr_method)
    

    print(json.dumps(result, indent=2))

