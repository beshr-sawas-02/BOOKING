"""
Passport OCR Service - Final Version for Syrian Passport
يصلح مشاكل OCR في MRZ ويدمج الأسطر المكسورة
"""

from flask import Flask, request, jsonify
from datetime import datetime
import requests, re, json, os
import numpy as np
import cv2

app = Flask(__name__)

API_KEY = os.environ.get('OCR_API_KEY', 'dev-key-change-in-production')

print("Loading EasyOCR...")
import easyocr
reader = easyocr.Reader(['en', 'ar'], gpu=False, verbose=False)
print("✅ EasyOCR ready")
print("🤖 Passport OCR Service")
print("📍 http://localhost:5000/health")
print("📍 POST http://localhost:5000/extract-passport")


def check_api_key():
    if API_KEY == 'dev-key-change-in-production':
        return True
    return request.headers.get('X-API-Key') == API_KEY


def preprocess(img_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    if w < 1000:
        img = cv2.resize(img, None, fx=1000/w, fy=1000/w,
                         interpolation=cv2.INTER_LANCZOS4)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)


def fix_mrz_digits(text: str) -> str:
    return (text.replace('O', '0').replace('o', '0')
                .replace('I', '1').replace('l', '1').replace('L', '1')
                .replace('Z', '2').replace('S', '5').replace('B', '8'))


def fix_mrz_letters(text: str) -> str:
    return (text.replace('0', 'O').replace('1', 'I').replace('5', 'S'))


def normalize_mrz_chars(text: str) -> str:
    """
    تصحيح أخطاء OCR الشائعة في MRZ قبل التنظيف.
    مثلاً $ → S، | → I، { → < ، إلخ.
    """
    return (text
            .replace('$', 'S')   # OCR يقرأ S كـ $
            .replace('|', 'I')   # | يصير I
            .replace('!', 'I')
            .replace('{', '<').replace('}', '<')
            .replace('[', '<').replace(']', '<')
            .replace('(', '<').replace(')', '<'))


def clean_mrz_line(text: str) -> str:
    """تنظيف سطر MRZ مع تطبيق normalization أولاً"""
    normalized = normalize_mrz_chars(text)
    return re.sub(r'[^A-Z0-9<]', '', normalized.upper())


def merge_mrz_fragments(items: list) -> list:
    """
    EasyOCR قد يكسر سطر MRZ لقطعتين أو أكثر.
    ندمج البلوكات يلي بنفس الصف العمودي ضمن مسافة معقولة.
    Returns: قائمة من النصوص المدموجة (إضافة للنصوص الأصلية).
    """
    if not items:
        return []

    # نفلتر الـ items يلي ممكن تكون MRZ (تحتوي على < أو على نمط MRZ)
    mrz_candidates = []
    for it in items:
        text = it['text']
        # نطبّق normalization عشان نشوف لو فيه < بعد التنظيف
        cleaned = clean_mrz_line(text)
        # شرط: يحتوي على < أو يبدأ بـ P< أو يطابق نمط MRZ السطر الثاني
        has_chevron = '<' in cleaned
        looks_like_line2 = bool(re.match(r'^[A-Z0-9]{6,}', cleaned)) and len(cleaned) >= 15
        if has_chevron or (looks_like_line2 and any(c.isdigit() for c in cleaned)):
            mrz_candidates.append({
                'cleaned': cleaned,
                'cy': it['cy'],
                'cx': it['cx'],
                'x1': it.get('x1', it['cx']),
                'x2': it.get('x2', it['cx']),
            })

    if not mrz_candidates:
        return []

    # نجمعهن حسب الصف (المسافة العمودية)
    # نرتبهن بالـ cy
    mrz_candidates.sort(key=lambda c: c['cy'])

    rows = []
    current_row = [mrz_candidates[0]]
    ROW_TOLERANCE = 25  # pixels

    for c in mrz_candidates[1:]:
        if abs(c['cy'] - current_row[0]['cy']) <= ROW_TOLERANCE:
            current_row.append(c)
        else:
            rows.append(current_row)
            current_row = [c]
    rows.append(current_row)

    # ندمج كل صف من اليسار لليمين (بـ cx)
    merged_lines = []
    for row in rows:
        row.sort(key=lambda c: c['cx'])
        merged = ''.join(c['cleaned'] for c in row)
        if len(merged) >= 20:
            merged_lines.append(merged)

    return merged_lines


def parse_mrz_lines(mrz_lines: list) -> dict:
    """parse السطرين من MRZ"""
    result = {}
    current_year_short = datetime.now().year % 100
    max_expiry_year = datetime.now().year + 20

    line1 = None
    line2 = None

    for clean in mrz_lines:
        if not clean:
            continue

        # السطر الأول: P<CCCNAME<<GIVEN
        if line1 is None and clean.startswith('P') and '<<' in clean:
            line1 = clean
            print(f"  [MRZ] line1: {clean}")
            continue

        # السطر الثاني: 9 رمز جواز + check + nationality + dates
        # نقبل السطر لو فيه على الأقل 30 حرف ومش يبدأ بـ P<
        if line2 is None and len(clean) >= 30:
            if not (clean.startswith('P') and '<<' in clean[:10]):
                # التأكد من النمط: يبدأ بحروف/أرقام (passport number)
                if re.match(r'^[A-Z0-9<]{6,}', clean):
                    line2 = clean
                    print(f"  [MRZ] line2: {clean}")
                    continue

    if not line1:
        print("  [MRZ] ⚠ line1 NOT FOUND")
    if not line2:
        print("  [MRZ] ⚠ line2 NOT FOUND")

    # ── parse السطر الأول ──
    if line1:
        try:
            # nationality من positions [2:5]
            nat_raw = line1[2:5]
            nat = fix_mrz_letters(nat_raw)
            if nat.isalpha() and len(nat) == 3:
                result['nationality'] = nat

            # الاسم: من position 5 لآخر السطر
            name_section = line1[5:44] if len(line1) >= 44 else line1[5:]
            parts = name_section.split('<<')
            if len(parts) >= 2:
                surname = fix_mrz_letters(parts[0]).replace('<', ' ').strip()
                given = fix_mrz_letters(parts[1]).replace('<', ' ').strip()
                surname = re.sub(r'\s+', ' ', surname)
                given = re.sub(r'\s+', ' ', given)
                if surname and given:
                    result['full_name_en'] = f"{given} {surname}"
                elif surname:
                    result['full_name_en'] = surname
                print(f"  [MRZ] name parsed: {result.get('full_name_en')}")
        except Exception as e:
            print(f"  MRZ line1 parse error: {e}")

    # ── parse السطر الثاني ──
    if line2:
        try:
            # passport number: positions [0:9]
            pno_raw = line2[0:9].rstrip('<')
            if pno_raw and len(pno_raw) >= 5:
                m = re.match(r'^([A-Z]{1,2})([A-Z0-9]+)$', pno_raw)
                if m:
                    prefix, rest = m.group(1), m.group(2)
                    rest_fixed = fix_mrz_digits(rest)
                    pno = prefix + rest_fixed
                else:
                    pno = pno_raw
                result['passport_number'] = pno

            # nationality من positions [10:13]
            nat2_raw = line2[10:13] if len(line2) >= 13 else ''
            nat2 = fix_mrz_letters(nat2_raw).rstrip('<')
            if nat2.isalpha() and len(nat2) == 3:
                result['nationality'] = nat2

            # DOB من positions [13:19]
            if len(line2) >= 19:
                dob_raw = line2[13:19]
                dob = fix_mrz_digits(dob_raw)
                if dob.isdigit() and len(dob) == 6:
                    yy, mm, dd = int(dob[0:2]), int(dob[2:4]), int(dob[4:6])
                    yr = 1900 + yy if yy > current_year_short else 2000 + yy
                    if 1900 <= yr <= datetime.now().year and 1 <= mm <= 12 and 1 <= dd <= 31:
                        result['date_of_birth'] = f"{yr}-{mm:02d}-{dd:02d}"

            # Sex من position [20]
            if len(line2) > 20:
                g = line2[20]
                if g == 'M':
                    result['gender'] = 'MALE'
                    print(f"  [MRZ] gender: MALE")
                elif g == 'F':
                    result['gender'] = 'FEMALE'
                    print(f"  [MRZ] gender: FEMALE")

            # Expiry من positions [21:27]
            # نستخدم regex match لمعالجة حالات OCR errors في filler position
            # (مثلاً | بدل < قد يجعل position 20 ينزاح)
            if len(line2) >= 21:
                remainder = line2[21:]
                # نأخذ أول 6 أرقام متتابعة بعد أي حروف/رموز
                m = re.match(r'[A-Z<]*([0-9]{6})', remainder)
                if m:
                    exp = m.group(1)
                    yy, mm, dd = int(exp[0:2]), int(exp[2:4]), int(exp[4:6])
                    yr = 2000 + yy
                    if datetime.now().year - 1 <= yr <= max_expiry_year and 1 <= mm <= 12 and 1 <= dd <= 31:
                        result['expiry_date'] = f"{yr}-{mm:02d}-{dd:02d}"

        except Exception as e:
            print(f"  MRZ line2 parse error: {e}")

    return result


def parse_visual_zone_for_name(items: list) -> str | None:
    """
    fallback لاستخراج الاسم من المنطقة المرئية.
    نستخدم fuzzy match للـ labels (Name, Surname) لأن OCR ممكن يقرأهن غلط
    (Nafe بدل Name, Sumame بدل Surname).
    """
    name_val = None
    surname_val = None

    for i, it in enumerate(items):
        text = it['text'].strip()
        text_lower = text.lower()

        # fuzzy match لـ "Name" — نقبل تشابه كبير
        # Name, Nafe, Narne, Naine — كلهن يبدؤوا بـ N والطول 3-5
        is_name_label = bool(
            re.fullmatch(r'n[a-z]{2,4}', text_lower)
        ) and not text_lower.startswith(('nat', 'no'))  # نتجاوز "national", "no"

        # fuzzy match لـ "Surname" — يبدأ بـ S والطول 6-8 ويحتوي m
        is_surname_label = bool(
            re.fullmatch(r's[a-z]{0,2}m[a-z]+', text_lower)  # surname, sumame, surrname
        ) or text_lower in ('surname', 'sumame', 'sumarne')

        # Father Name و Mother Name نتجاوزهن
        if 'father' in text_lower or 'mother' in text_lower:
            continue

        if is_name_label:
            print(f"  [VISUAL NAME] ✓ Name label at #{i}: {repr(text)}")
            val = find_value_to_right(items, i)
            if val:
                v_clean = val.upper().strip()
                if re.fullmatch(r'[A-Z][A-Z\s\-]{1,30}', v_clean):
                    name_val = v_clean
                    print(f"  [VISUAL NAME]   → name: {name_val}")

        elif is_surname_label:
            print(f"  [VISUAL NAME] ✓ Surname label at #{i}: {repr(text)}")
            val = find_value_to_right(items, i)
            if val:
                v_clean = val.upper().strip()
                if re.fullmatch(r'[A-Z][A-Z\s\-]{1,30}', v_clean):
                    surname_val = v_clean
                    print(f"  [VISUAL NAME]   → surname: {surname_val}")

    if name_val and surname_val:
        return f"{name_val} {surname_val}"
    elif name_val:
        return name_val
    elif surname_val:
        return surname_val
    return None


def find_value_to_right(items: list, label_idx: int) -> str | None:
    """تجد القيمة على يمين label معيّن وبنفس الصف"""
    label = items[label_idx]
    label_h = abs(label['y2'] - label['y1'])
    if label_h < 10:
        label_h = 30

    best = None
    best_dx = float('inf')

    for i, other in enumerate(items):
        if i == label_idx:
            continue
        # نفس الصف
        if abs(other['cy'] - label['cy']) > label_h * 1.2:
            continue
        # على اليمين
        dx = other['cx'] - label['cx']
        if dx <= 0:
            continue
        # يكون أقرب
        if dx < best_dx:
            best_dx = dx
            best = other['text']

    return best


def parse_visual_zone(ocr_results: list, mrz: dict) -> dict:
    result = dict(mrz)

    items = []
    for bbox, text, conf in ocr_results:
        try:
            xs = [p[0] for p in bbox]
            ys = [p[1] for p in bbox]
            items.append({
                'text': text.strip(),
                'cx': sum(xs) / len(xs),
                'cy': sum(ys) / len(ys),
                'x1': min(xs), 'x2': max(xs),
                'y1': min(ys), 'y2': max(ys),
                'conf': conf,
            })
        except Exception:
            continue

    full_text = '\n'.join(it['text'] for it in items)
    upper_text = full_text.upper()

    # ── Passport number fallback ──
    if 'passport_number' not in result:
        m = re.search(r'\b([A-Z]{1,2}[0-9]{6,8})\b', upper_text)
        if m:
            result['passport_number'] = m.group(1)

    # ── Nationality fallback ──
    if 'nationality' not in result:
        if re.search(r'\bSYR\b', upper_text):
            result['nationality'] = 'SYR'
        elif 'SYRIAN' in upper_text or 'SYRIA' in upper_text:
            result['nationality'] = 'SYR'

    # ── Name fallback (إذا MRZ ما طلّع اسم) ──
    if 'full_name_en' not in result:
        name = parse_visual_zone_for_name(items)
        if name:
            result['full_name_en'] = name

    # ── Gender fallback (إذا MRZ ما طلّع جنس) ──
    # في الجواز السوري الجديد، Sex M أو Sex F ممكن OCR ما يقراها
    # نقدر نشوف لو في "M" أو "F" منفرد قريب من كلمة "Sex" أو ما شابه
    if 'gender' not in result:
        for it in items:
            val = it['text'].strip().upper()
            if val in ('M', 'F'):
                # نتأكد ما هي حرف من كلمة، لازم تكون لحالها
                result['gender'] = 'MALE' if val == 'M' else 'FEMALE'
                print(f"  [VISUAL SEX] found standalone: {val}")
                break
        if 'gender' not in result:
            if re.search(r'\bMALE\b', upper_text):
                result['gender'] = 'MALE'
            elif re.search(r'\bFEMALE\b', upper_text):
                result['gender'] = 'FEMALE'

    # ── Dates مرتبطة بـ labels ──
    date_assignments = associate_dates_with_labels(items)

    if 'date_of_birth' in date_assignments and 'date_of_birth' not in result:
        result['date_of_birth'] = date_assignments['date_of_birth']

    if 'expiry_date' in date_assignments and 'expiry_date' not in result:
        result['expiry_date'] = date_assignments['expiry_date']

    if 'issue_date' in date_assignments:
        result['issue_date'] = date_assignments['issue_date']

    return result


def associate_dates_with_labels(items: list) -> dict:
    """ربط كل تاريخ بأقرب label له"""
    date_pattern = re.compile(r'(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})')
    dates_found = []
    for it in items:
        m = date_pattern.search(it['text'])
        if m:
            d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if 1 <= mo <= 12 and 1 <= d <= 31 and 1900 <= y <= 2100:
                dates_found.append({
                    'iso': f"{y:04d}-{mo:02d}-{d:02d}",
                    'cx': it['cx'], 'cy': it['cy'],
                })

    label_specs = [
        {'field': 'date_of_birth',
         'patterns': [r'date\s*of\s*birth', r'birth', r'تاريخ\s*الولادة', r'الولادة']},
        {'field': 'issue_date',
         'patterns': [r'date\s*of\s*issue', r'issue', r'تاريخ\s*الإصدار',
                      r'تاريخ\s*الاصدار', r'الإصدار', r'الاصدار']},
        {'field': 'expiry_date',
         'patterns': [r'date\s*of\s*expiry', r'expiry', r'expir', r'تاريخ\s*الانتهاء',
                      r'الصلاحية', r'انتهاء\s*الصلاحية', r'الانتهاء']},
    ]

    labels_found = []
    for it in items:
        text_lower = it['text'].lower()
        for spec in label_specs:
            for pat in spec['patterns']:
                if re.search(pat, text_lower, re.IGNORECASE):
                    labels_found.append({
                        'field': spec['field'],
                        'cx': it['cx'], 'cy': it['cy'],
                    })
                    break

    if not dates_found or not labels_found:
        return {}

    assignments = {}
    for d in dates_found:
        best_label = None
        best_dist = float('inf')
        for lab in labels_found:
            dy = abs(d['cy'] - lab['cy'])
            dx = abs(d['cx'] - lab['cx'])
            if dy < 50:
                dist = dx + dy * 0.3
            elif d['cy'] > lab['cy'] and dy < 80:
                dist = dx * 0.5 + dy
            else:
                dist = (dx ** 2 + dy ** 2) ** 0.5
            if dist < best_dist:
                best_dist = dist
                best_label = lab
        if best_label is None:
            continue
        field = best_label['field']
        if field not in assignments or best_dist < assignments[field][1]:
            assignments[field] = (d['iso'], best_dist)

    final = {field: data[0] for field, data in assignments.items()}

    today = datetime.now()
    cleaned = {}
    for field, iso in final.items():
        try:
            dt = datetime.strptime(iso, '%Y-%m-%d')
            if field == 'date_of_birth':
                if dt < today and (today.year - dt.year) <= 120:
                    cleaned[field] = iso
            elif field == 'issue_date':
                if dt <= today and (today.year - dt.year) <= 15:
                    cleaned[field] = iso
            elif field == 'expiry_date':
                if dt.year >= today.year - 1:
                    cleaned[field] = iso
        except Exception:
            continue

    return cleaned


def build_items(ocr_results: list) -> list:
    items = []
    for bbox, text, conf in ocr_results:
        try:
            xs = [p[0] for p in bbox]
            ys = [p[1] for p in bbox]
            items.append({
                'text': text.strip(),
                'cx': sum(xs) / len(xs),
                'cy': sum(ys) / len(ys),
                'x1': min(xs), 'x2': max(xs),
                'y1': min(ys), 'y2': max(ys),
                'conf': conf,
            })
        except Exception:
            continue
    return items


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/extract-passport', methods=['POST'])
def extract_passport():
    if not check_api_key():
        return jsonify({"confidence": 0, "error": "unauthorized"}), 401

    try:
        data = request.get_json(silent=True) or {}
        image_url = data.get('image_url')

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

        print(f"  Extracted {len(texts)} text blocks")

        # ✨ بناء items مرة وحدة
        items = build_items(ocr_results)

        # ✨ المرحلة 1: ندمج fragments الـ MRZ (بحال OCR كسرها)
        merged_mrz_lines = merge_mrz_fragments(items)
        print(f"  Merged MRZ candidates: {len(merged_mrz_lines)}")

        # ✨ المرحلة 2: نضيف النصوص الأصلية كمان
        all_mrz_candidates = merged_mrz_lines + [clean_mrz_line(t) for t in texts]

        # نزيل التكرارات والفارغ
        seen = set()
        unique_candidates = []
        for c in all_mrz_candidates:
            if c and c not in seen:
                seen.add(c)
                unique_candidates.append(c)

        # ✨ المرحلة 3: parse MRZ
        mrz = parse_mrz_lines(unique_candidates)
        print(f"  MRZ extracted: {list(mrz.keys())}")

        # ✨ المرحلة 4: visual zone fallback
        result = parse_visual_zone(ocr_results, mrz)
        print(f"  After visual zone: {list(result.keys())}")

        key_fields = [
            'full_name_en', 'passport_number', 'nationality', 'gender',
            'date_of_birth', 'issue_date', 'expiry_date'
        ]
        found = sum(1 for f in key_fields if result.get(f))
        avg_conf = sum(r[2] for r in ocr_results) / len(ocr_results) if ocr_results else 0

        result['confidence'] = round(min(avg_conf * 0.4 + (found / len(key_fields)) * 0.6, 0.95), 2)
        result['needs_review'] = bool(result['confidence'] < 0.6 or found < 4)

        print(f"  Fields: {found}/{len(key_fields)}, confidence: {result['confidence']}")
        printable = {k: v for k, v in result.items() if k != 'needs_review'}
        print(f"  Result: {json.dumps(printable, ensure_ascii=False)}")

        return jsonify(result)

    except Exception as e:
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"confidence": 0, "error": str(e)})


@app.route('/extract-document', methods=['POST'])
def extract_document():
    if not check_api_key():
        return jsonify({"confidence": 0, "error": "unauthorized"}), 401

    try:
        data = request.get_json(silent=True) or {}
        image_url = data.get('image_url')

        if not image_url:
            return jsonify({"confidence": 0, "error": "image_url required"}), 400

        img_res = requests.get(image_url, timeout=30)
        if img_res.status_code != 200:
            return jsonify({"confidence": 0})

        img = preprocess(img_res.content)
        ocr_results = reader.readtext(img, detail=1)
        full_text = '\n'.join(r[1] for r in ocr_results)

        result = {"confidence": 0.6, "family_members": []}
        f = re.search(r'(?:father|الأب|اسم الأب)[:\s]+([^\n]+)', full_text, re.IGNORECASE)
        if f:
            result['father_name'] = f.group(1).strip()
        m = re.search(r'(?:mother|الأم|اسم الأم)[:\s]+([^\n]+)', full_text, re.IGNORECASE)
        if m:
            result['mother_name'] = m.group(1).strip()

        return jsonify(result)

    except Exception as e:
        return jsonify({"confidence": 0, "error": str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=False)