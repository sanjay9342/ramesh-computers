import json
import re
from pathlib import Path
from datetime import datetime, timezone

BASE_DIR = Path(r"C:\Users\G Sanjay\OneDrive\Desktop\Ramesh computers\backend\src\data")
EXTRACTED_FILES = [
    BASE_DIR / "PROCESSOR_AND_RAM_STOCKS_2026.extracted.txt",
    BASE_DIR / "STOCKS_2026.extracted.txt",
]
OUT_PRODUCTS = BASE_DIR / "products_import_2026.json"
OUT_COVERAGE = BASE_DIR / "products_import_2026_coverage.json"
DB_JSON = BASE_DIR / "db.json"

RANGES = [
    (1, 15, "pendrive"), (16, 30, "ram"), (31, 36, "ssd"), (37, 37, "rj45-jack"), (38, 42, "ssd"),
    (43, 44, "ram"), (45, 45, "hdd"), (46, 46, "ssd"), (47, 66, "processor"), (67, 89, "mouse"),
    (90, 108, "keyboard"), (109, 112, "webcam"), (113, 115, "usb-adapter"), (116, 117, "headset"),
    (118, 127, "accessories"), (128, 129, "motherboard"), (130, 130, "ssd"), (131, 134, "motherboard"),
    (135, 137, "speaker"), (138, 139, "graphics-card"), (140, 144, "surge-protector"), (145, 147, "sata-case"),
    (148, 150, "antivirus"), (151, 151, "accessories"), (152, 153, "processor"), (154, 155, "cooling-fan"),
    (156, 174, "ink"), (175, 187, "accessories"), (188, 189, "usb-hub"), (190, 196, "toner-cartridge"),
    (197, 197, "projector"), (198, 203, "cabinet"), (204, 205, "speaker"), (206, 207, "printer"),
    (208, 208, "scanner"), (209, 220, "monitor"), (221, 221, "laptop"), (222, 223, "laptop-bag"),
    (224, 225, "laptop"), (226, 226, "battery"), (227, 230, "ups"), (231, 241, "cable"),
    (242, 242, "usb-adapter"), (243, 246, "accessories"), (247, 249, "usb-hub"), (250, 263, "accessories"),
    (264, 268, "smps"), (269, 274, "motherboard"), (275, 280, "ram"), (281, 285, "ssd"),
    (286, 289, "ram"), (290, 290, "ssd"),
]

FIX = {
    "LOGITCH": "LOGITECH", "POTRONICS": "PORTRONICS", "COCUNUT": "COCONUT", "DLINK": "D-LINK",
    "D LINK": "D-LINK", "D.LINK": "D-LINK", "TP LINK": "TP-LINK", "QUICKHEAL": "QUICK HEAL",
    "HAMMKOK": "HAMMOK", "LIVE TECH": "LIVETECH", "GSKILL": "G.SKILL", "KLEV": "KLEVV",
}

CPU = {
    "i3-3220": ("3rd", 2, 4, "3.30 GHz", 1599), "i3-3240": ("3rd", 2, 4, "3.40 GHz", 1699),
    "i3-4150": ("4th", 2, 4, "3.50 GHz", 1999), "i3-6100t": ("6th", 2, 4, "3.20 GHz", 3299),
    "i3-6098p": ("6th", 2, 4, "3.60 GHz", 3499), "i3-8100t": ("8th", 4, 4, "3.10 GHz", 4999),
    "i3-10100t": ("10th", 4, 8, "3.00 GHz", 7499), "i3-10105t": ("10th", 4, 8, "3.00 GHz", 7999),
    "i5-3550s": ("3rd", 4, 4, "3.00 GHz", 2699), "i5-4460s": ("4th", 4, 4, "2.90 GHz", 3299),
    "i5-4590t": ("4th", 4, 4, "2.00 GHz", 3499), "i5-6400t": ("6th", 4, 4, "2.20 GHz", 4999),
    "i5-6500": ("6th", 4, 4, "3.20 GHz", 5499), "i5-8500t": ("8th", 6, 6, "2.10 GHz", 7999),
    "i5-10500t": ("10th", 6, 12, "2.30 GHz", 10999), "i7-12700": ("12th", 12, 20, "2.10 GHz", 25999),
    "i5-13400": ("13th", 10, 16, "2.50 GHz", 20999), "ryzen-5-5600gt": ("Ryzen 5000", 6, 12, "3.60 GHz", 14999),
    "ryzen-5-8000": ("Ryzen 8000", 8, 16, "3.80 GHz", 23999),
}

IMG = {
    "pendrive": "https://via.placeholder.com/600x600?text=Pendrive", "ram": "https://via.placeholder.com/600x600?text=RAM",
    "ssd": "https://via.placeholder.com/600x600?text=SSD", "processor": "https://via.placeholder.com/600x600?text=Processor",
    "mouse": "https://via.placeholder.com/600x600?text=Mouse", "keyboard": "https://via.placeholder.com/600x600?text=Keyboard",
    "webcam": "https://via.placeholder.com/600x600?text=Webcam", "monitor": "https://via.placeholder.com/600x600?text=Monitor",
    "laptop": "https://via.placeholder.com/600x600?text=Laptop",
}

PRICE_BASE = {
    "pendrive": 499, "ram": 1499, "ssd": 2399, "processor": 6499, "mouse": 499, "keyboard": 799,
    "webcam": 1499, "usb-adapter": 599, "headset": 899, "accessories": 499, "motherboard": 5499,
    "speaker": 1499, "graphics-card": 5999, "surge-protector": 999, "sata-case": 699, "antivirus": 899,
    "cooling-fan": 699, "ink": 399, "usb-hub": 899, "toner-cartridge": 799, "projector": 6999,
    "cabinet": 2499, "printer": 8999, "scanner": 12499, "monitor": 6999, "laptop": 49999,
    "laptop-bag": 899, "battery": 1199, "ups": 3499, "cable": 299, "smps": 1499, "hdd": 4299,
    "rj45-jack": 99,
}

def category_for(i):
    for s, e, c in RANGES:
        if s <= i <= e:
            return c
    return "accessories"


def raw_lines():
    out, idx = [], 0
    for p in EXTRACTED_FILES:
        for line in p.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("====="):
                continue
            m = re.match(r"^(\d+)\s+(.+)$", line)
            if m:
                idx += 1
                out.append({"index": idx, "raw": m.group(2).strip(), "source": p.name})
            elif "POTRONICS PRINTLEAK 5 USB TYPE A TO TYPE B PRINTER CAB" in line:
                idx += 1
                out.append({"index": idx, "raw": line.strip(), "source": p.name})
    return out


def clean_space(t):
    return re.sub(r"\s+", " ", t.replace("\\", "").replace("||", "")).strip()


def apply_fix(t):
    u = t.upper()
    for w, r in FIX.items():
        u = re.sub(rf"\b{re.escape(w)}\b", r, u)
    u = u.replace("DDR43200", "DDR4 3200").replace("61007", "6100T").replace("3TH", "3RD")
    u = u.replace("MBDS", "MBPS").replace("GDIN", "GAIN").replace("USB C.31", "USB-C 3.1")
    u = u.replace("2- IN-1", "2-IN-1").replace("CATRIDGE", "CARTRIDGE").replace("PROTECTER", "PROTECTOR")
    u = u.replace("DEKTOP", "DESKTOP").replace("PROJECTER", "PROJECTOR")
    return clean_space(u)


def cap_gb(t):
    m = re.search(r"(\d{1,4})\s*GB", t, re.I)
    return int(m.group(1)) if m else None


def qty_num(t):
    m = re.search(r"\((\d+)\s*NUM\s*\)", t, re.I)
    return int(m.group(1)) if m else None


def stock_tag(raw, qty):
    u = raw.upper()
    if "NEW" in u:
        return "New Arrival"
    if "OLD" in u or (qty is not None and qty <= 12):
        return "Limited"
    return "In Stock"


def smart_title(t):
    acr = {"USB","SSD","HDD","NVME","OTG","PCI","RJ","HD","HDMI","VGA","DP","LAN","UPS","SMPS","DDR3","DDR4","DDR5","FHD","CPU","AV","MFP","SATA","IPS","LED","TB","GB","MHZ"}
    out = []
    for w in t.split():
        u = w.upper()
        if u in acr or re.match(r"^[A-Z]*\d+[A-Z0-9.-]*$", u):
            out.append(u)
        else:
            out.append(w.capitalize())
    return " ".join(out)


def detect_brand(name, cat):
    u = name.upper()
    if cat == "processor":
        return "AMD" if "AMD" in u or "RYZEN" in u else "Intel"
    if cat == "ink":
        return "Canon" if "PIXMA" in u or "(70" in u or "(71" in u or "(790" in u else "Epson"
    if "SK HYNIX" in u:
        return "SK Hynix"
    for b in ["HP","EVM","LEXAR","SAMSUNG","TEAMGROUP","KINGSTON","G.SKILL","POWERX","CRUCIAL","ADATA","FOXIN","KLEVV","WD","SEAGATE","ZEBION","FINGERS","DELL","ACER","LOGITECH","PORTRONICS","TVS","LENOVO","RAPOO","NETIS","D-LINK","TP-LINK","MSI","GIGABYTE","ASUS","HONEYWELL","COCONUT","QUICK HEAL","BITDEFENDER","K7","TECHIE","HAMMOK","LIVETECH","ROYAL","NEXTECH","TERABYTE","RANZ","ANT ESPORTS","MICROTEK","AOC","THINKCENTER","ZEBRA","EPSON","SANDISK","BATTLE AX","CONSISTENT","PEBBLE","FRONTECH","HAZE"]:
        if re.search(rf"\b{re.escape(b)}\b", u):
            return b.title() if b not in {"HP","EVM","WD","MSI","AOC","UPS","SSD","RAM","CPU","USB","DP","RJ","AV"} else b
    return "Generic"


def cpu_model(t):
    u = t.upper().replace(" ", "")
    if "I712TH" in u:
        return "i7-12700"
    if "I513TH" in u:
        return "i5-13400"
    if "RYZEN5" in u and "5600GT" in u:
        return "ryzen-5-5600gt"
    if "RYZEN5" in u and "8000" in u:
        return "ryzen-5-8000"
    m = re.search(r"\b(I[3579]-?\d{4,5}[A-Z]?)\b", u)
    if m:
        return m.group(1).lower().replace("i3-61007", "i3-6100t")
    m = re.search(r"\b(I[3579]\d{4,5}[A-Z]?)\b", u)
    if m:
        r = m.group(1)
        return (r[:2] + "-" + r[2:]).lower()
    return "intel-generic"
