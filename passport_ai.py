"""
Passport OCR Service - Optimized Single Pass
أسرع وأكثر استقراراً - pass واحد محسّن بدل 3 passes
"""

from flask import Flask, request, jsonify
import requests, re, json
import numpy as np
import cv2

app = Flask(__name__)

print("Loading EasyOCR...")
import easyocr
reader = easyocr.Reader(['en', 'ar'], gpu=False, verbose=False)
print("✅ EasyOCR ready")
print("🤖 Passport OCR Service")
print("📍 http://localhost:5000/health")
print("📍 POST http://localhost:5000/extract-passport")


def preprocess(img_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    # تكبير فقط إذا الصورة صغيرة
    if w < 1000:
        img = cv2.resize(img, None, fx=1000/w, fy=1000/w,
                         interpolation=cv2.INTER_LANCZOS4)
    # sharpening خفيف فقط
    kernel = np.array([[0,-1,0],[-1,5,-1],[0,-1,0]])
    return cv2.filter2D(img, -1, kernel)


def fix_mrz(text: str) -> str:
    """تصحيح أخطاء OCR الشائعة في MRZ"""
    return (text.upper()
               .replace('O', '0').replace('o', '0')
               .replace('I', '1').replace('l', '1').replace('L', '1')
               .replace(' ', ''))


def fix_name(text: str) -> str:
    """تصحيح أخطاء OCR في الأسماء"""
    return (text.upper()
               .replace('0', 'O')
               .replace('1', 'I'))


def parse_mrz(texts: list) -> dict:
    result = {}
    for text in texts:
        raw = re.sub(r'[^A-Za-z0-9<]', '', text)
        clean = fix_mrz(raw)

        # السطر الأول: P<CCCNAME<<GIVEN
        if clean.startswith('P') and '<' in clean and len(clean) >= 40:
            try:
                nat = clean[2:5].replace('0', 'O')
                if nat.isalpha():
                    result['nationality'] = nat
                name_raw = clean[5:44]
                parts = name_raw.split('<<')
                if len(parts) >= 2:
                    sur  = fix_name(parts[0]).replace('<', ' ').strip()
                    giv  = fix_name(parts[1]).replace('<', ' ').strip()
                    if sur and giv:
                        result['full_name_en'] = f"{giv} {sur}"
                    elif sur:
                        result['full_name_en'] = sur
            except Exception:
                pass

        # السطر الثاني: 9 chars passport + check + nationality + DOB + check + sex + expiry
        elif len(clean) >= 44 and re.match(r'^[A-Z0-9]{9}[0-9]', clean):
            try:
                pno = re.sub(r'<+', '', clean[0:9])
                if pno and len(pno) >= 5:
                    result['passport_number'] = pno

                nat2 = clean[10:13].replace('0','O').rstrip('<')
                if nat2.isalpha() and len(nat2) == 3:
                    result['nationality'] = nat2

                dob = clean[13:19]
                if dob.isdigit():
                    yy, mm, dd = int(dob[0:2]), int(dob[2:4]), int(dob[4:6])
                    yr = 1900+yy if yy > 24 else 2000+yy
                    if 1900<=yr<=2024 and 1<=mm<=12 and 1<=dd<=31:
                        result['date_of_birth'] = f"{yr}-{mm:02d}-{dd:02d}"

                g = clean[20] if len(clean) > 20 else ''
                if g == 'M': result['gender'] = 'MALE'
                elif g == 'F': result['gender'] = 'FEMALE'

                exp = clean[21:27]
                if exp.isdigit():
                    yy, mm, dd = int(exp[0:2]), int(exp[2:4]), int(exp[4:6])
                    yr = 2000+yy
                    if 2024<=yr<=2045 and 1<=mm<=12 and 1<=dd<=31:
                        result['expiry_date'] = f"{yr}-{mm:02d}-{dd:02d}"
            except Exception:
                pass

    return result


def parse_text(full_text: str, mrz: dict) -> dict:
    result = dict(mrz)

    if 'passport_number' not in result:
        m = re.search(r'\b([A-Z]{1,2}[0-9]{6,8})\b', full_text.upper())
        if m:
            result['passport_number'] = m.group(1)

    # تواريخ DD/MM/YYYY
    dates = []
    for m in re.finditer(r'(\d{2})[./\-](\d{2})[./\-](\d{4})', full_text):
        d, mo, y = m.group(1), m.group(2), m.group(3)
        if 1 <= int(mo) <= 12 and 1 <= int(d) <= 31:
            dates.append(f"{y}-{mo}-{d}")
    dates = list(dict.fromkeys(dates))

    if dates and 'date_of_birth'   not in result: result['date_of_birth']   = dates[0]
    if len(dates)>1 and 'issue_date'   not in result: result['issue_date']   = dates[1]
    if len(dates)>2 and 'expiry_date'  not in result: result['expiry_date']  = dates[2]

    if 'nationality' not in result:
        u = full_text.upper()
        if 'SYRIAN' in u or 'SYRIA' in u: result['nationality'] = 'Syrian'

    if 'gender' not in result:
        u = full_text.upper()
        if re.search(r'\bMALE\b', u):   result['gender'] = 'MALE'
        elif re.search(r'\bFEMALE\b', u): result['gender'] = 'FEMALE'

    return result


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/extract-passport', methods=['POST'])
def extract_passport():
    try:
        image_url = request.json.get('image_url')
        if not image_url:
            return jsonify({"confidence": 0, "error": "image_url required"}), 400

        print(f"\n→ Processing passport image")
        img_res = requests.get(image_url, timeout=30)
        if img_res.status_code != 200 or len(img_res.content) < 500:
            return jsonify({"confidence": 0, "error": "Image download failed"})

        print(f"  Image: {len(img_res.content):,} bytes")
        img = preprocess(img_res.content)

        print("  Running OCR...")
        ocr_results = reader.readtext(img, detail=1)
        texts = [r[1] for r in ocr_results]
        full_text = '\n'.join(texts)

        print(f"  Extracted {len(texts)} text blocks")

        mrz  = parse_mrz(texts)
        result = parse_text(full_text, mrz)

        key_fields = ['full_name_en','passport_number','date_of_birth','nationality','gender','expiry_date']
        found = sum(1 for f in key_fields if result.get(f))
        avg_conf = sum(r[2] for r in ocr_results) / len(ocr_results) if ocr_results else 0

        result['confidence']   = round(min(avg_conf*0.5 + (found/len(key_fields))*0.5, 0.95), 2)
        result['needs_review'] = bool(result['confidence'] < 0.6 or found < 3)

        print(f"  Fields: {found}/{len(key_fields)}, confidence: {result['confidence']}")
        print(f"  Result: {json.dumps({k:v for k,v in result.items() if k!='needs_review'}, ensure_ascii=False)}")

        return jsonify(result)

    except Exception as e:
        print(f"  Error: {e}")
        import traceback; traceback.print_exc()
        return jsonify({"confidence": 0, "error": str(e)})


@app.route('/extract-document', methods=['POST'])
def extract_document():
    try:
        image_url = request.json.get('image_url')
        if not image_url:
            return jsonify({"confidence": 0}), 400

        img_res = requests.get(image_url, timeout=30)
        if img_res.status_code != 200:
            return jsonify({"confidence": 0})

        img = preprocess(img_res.content)
        ocr_results = reader.readtext(img, detail=1)
        full_text = '\n'.join(r[1] for r in ocr_results)

        result = {"confidence": 0.6, "family_members": []}
        f = re.search(r'(?:father|الأب|اسم الأب)[:\s]+([^\n]+)', full_text, re.IGNORECASE)
        if f: result['father_name'] = f.group(1).strip()
        m = re.search(r'(?:mother|الأم|اسم الأم)[:\s]+([^\n]+)', full_text, re.IGNORECASE)
        if m: result['mother_name'] = m.group(1).strip()

        return jsonify(result)

    except Exception as e:
        return jsonify({"confidence": 0, "error": str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=False)