"""Máy chủ nhỏ của app Học mọi thứ cùng AI (Learn Everything with AI).

Chạy trên máy người học. Mặc định chỉ mở cho chính máy (127.0.0.1).
Khi người học bật "Mở trên điện thoại", mở thêm cổng trong mạng nhà, có mã ghép đôi.

Dữ liệu học theo "chuẩn Hoc cung Noe" (docs/chuan-du-lieu.md):
  Tài liệu/Hoc cung Noe/            người học thấy, sao lưu được
  thư mục cài đặt riêng của app      khoá API, cài đặt (không nằm chung thư mục học)

Chạy:  py app/server.py   rồi mở http://localhost:8765
Thư viện ngoài duy nhất: anthropic (chỉ cần khi nối bằng khoá Claude), xem requirements.txt.
"""

from __future__ import annotations

import base64
import datetime as dt
import glob
import hashlib
import hmac
import http.cookies
import ipaddress
import json
import os
import re
import secrets
import shutil
import socket
import subprocess
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
import uuid
import webbrowser
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent          # thư mục gói
WEB = GOC / "app" / "web"
PORT = int(os.environ.get("LEWA_PORT") or os.environ.get("PORT") or "8765")
PORT_DIEN_THOAI = PORT + 1
PORT_BAO_MAT = PORT + 2  # https cho điện thoại: trình duyệt chỉ cho trang dùng micro (nút Nói) khi có https
# Bản chạy trên máy (GitHub) TẮT sẵn https cho điện thoại: chứng chỉ tự tạo làm điện thoại hiện cảnh báo đỏ.
# Trên điện thoại học viên gõ hoặc dùng micro bàn phím; nút Nói vẫn chạy trên máy tính. Bật lại: đặt LEWA_HTTPS=1.
CO_HTTPS = os.environ.get("LEWA_HTTPS") == "1"
CHUAN = 1  # phiên bản chuẩn dữ liệu
# Windows: chạy claude, openssl ẩn, không bật cửa sổ đen mỗi lần gọi AI (máy chủ chạy bằng pythonw không có cửa sổ lệnh)
AN_CUA_SO = getattr(subprocess, "CREATE_NO_WINDOW", 0)
sys.path.insert(0, str(GOC / "tools"))
from kiem_link import mo_thu  # noqa: E402  (dùng chung với công cụ dòng lệnh)

KIEU = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json",
        ".png": "image/png", ".webmanifest": "application/manifest+json"}


# ---------- nơi lưu ----------
def thu_muc_hoc() -> Path:
    if os.environ.get("LEWA_DATA"):
        return Path(os.environ["LEWA_DATA"])
    tai_lieu = Path.home() / "Documents"
    return (tai_lieu if tai_lieu.exists() else Path.home()) / "Hoc cung Noe"


def thu_muc_cai_dat() -> Path:
    if os.environ.get("LEWA_CONFIG"):
        return Path(os.environ["LEWA_CONFIG"])
    if sys.platform.startswith("win"):
        return Path(os.environ.get("APPDATA", Path.home())) / "HocCungNoe"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "HocCungNoe"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "hoc-cung-noe"


DATA = thu_muc_hoc()
CFG = thu_muc_cai_dat()
CAI_DAT = CFG / "cai-dat.json"
BI_MAT = CFG / "bi-mat.json"   # khoá API: không bao giờ gửi ra trình duyệt


def doc_json(p: Path, mac_dinh):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return mac_dinh


def ghi_json(p: Path, data) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ghi_bi_mat(data: dict) -> None:
    ghi_json(BI_MAT, data)
    try:
        os.chmod(BI_MAT, 0o600)  # chỉ chủ máy đọc được (Windows bỏ qua)
    except OSError:
        pass


def khoi_tao() -> None:
    """Tạo thư mục học theo chuẩn; chép hồ sơ cũ (hoc-cua-toi/) sang nếu có."""
    DATA.mkdir(parents=True, exist_ok=True)
    CFG.mkdir(parents=True, exist_ok=True)
    if not (DATA / "chuan.json").exists():
        ghi_json(DATA / "chuan.json", {"ten": "Hoc cung Noe", "phien_ban": CHUAN,
                                         "mo_ta": "Xem docs/chuan-du-lieu.md trong gói Learn Everything with AI"})
    if not (DATA / "ho-so.md").exists():
        shutil.copyfile(GOC / "mau" / "hoc-cua-toi" / "ho-so.md", DATA / "ho-so.md")  # hồ sơ trống
    if not (DATA / "khoa-hoc.json").exists():
        ghi_json(DATA / "khoa-hoc.json", {"hien_tai": "khoa-1", "ds": [{"ma": "khoa-1", "ten": ""}]})
    k = K()
    for ten in ("bai", "cau-hoi"):
        (k / ten).mkdir(parents=True, exist_ok=True)
    if not (k / "tien-do.json").exists():
        ghi_json(k / "tien-do.json", {"phien_ban": CHUAN, "chang_hien_tai": "muc-dich", "buoi_tiep_theo": None,
                                      "buoi_da_hoc": [], "sao": 0, "chuoi_tuan": 0, "tuan_gan_nhat_dat": None,
                                      "ky_nang": {}, "lich_on": [], "module": {}})
    if not (k / "nhat-ky.md").exists():
        (k / "nhat-ky.md").write_text("# Nhật ký học\n\n", encoding="utf-8")


def K() -> Path:
    """Thư mục khoá học đang học."""
    ma = doc_json(DATA / "khoa-hoc.json", {}).get("hien_tai") or "khoa-1"
    if not re.match(r"^[a-z0-9-]{1,40}$", ma):
        ma = "khoa-1"
    return DATA / "khoa-hoc" / ma


# ---------- nhiều khoá học: cất / mở lại hồ sơ của từng khoá ----------
# ho-so.md ở ngoài là hồ sơ của khoá ĐANG học. Đổi khoá thì cất nguyên bản vào khoa-hoc/<mã>/ho-so-khoa.md
# (không xoá gì), rồi đưa hồ sơ của khoá kia ra. Tên gọi và ngôn ngữ là của người học nên giữ nguyên qua mọi khoá.
TRUONG_NGUOI_HOC = ("ten_goi", "ngon_ngu")


def cat_ho_so_khoa() -> None:
    p = DATA / "ho-so.md"
    if p.exists():
        k = K()
        k.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(p, k / "ho-so-khoa.md")


def dua_ho_so_khoa_ra(ma: str) -> None:
    """Đưa hồ sơ của khoá `ma` ra ho-so.md; khoá chưa có hồ sơ thì dùng hồ sơ trống. Giữ tên gọi, ngôn ngữ hiện tại."""
    p = DATA / "ho-so.md"
    hien, _ = doc_front_matter(p.read_text(encoding="utf-8")) if p.exists() else ({}, "")
    cat = DATA / "khoa-hoc" / ma / "ho-so-khoa.md"
    nguon = cat if cat.exists() else GOC / "mau" / "hoc-cua-toi" / "ho-so.md"
    ho_so, than = doc_front_matter(nguon.read_text(encoding="utf-8"))
    for t in TRUONG_NGUOI_HOC:
        if hien.get(t):
            ho_so[t] = hien[t]
    p.write_text(ghi_front_matter(ho_so, than), encoding="utf-8")


def ds_khoa() -> dict:
    kh = doc_json(DATA / "khoa-hoc.json", {})
    kh.setdefault("ds", [])
    kh.setdefault("hien_tai", "khoa-1")
    return kh


def khoa_moi() -> str:
    """Bắt đầu khoá mới: cất khoá đang học (giữ nguyên dữ liệu), tạo thư mục khoá mới trắng, chuyển sang khoá mới."""
    kh = ds_khoa()
    hien = next((x for x in kh["ds"] if x.get("ma") == kh["hien_tai"]), None)
    if hien is not None and not hien.get("ten") and not doc_front_matter(
            (DATA / "ho-so.md").read_text(encoding="utf-8"))[0].get("linh_vuc"):
        return kh["hien_tai"]  # khoá đang mở còn trắng (bấm khoá mới mà chưa điền gì): dùng lại, không đẻ thêm khoá rỗng
    cat_ho_so_khoa()
    trong = next((x["ma"] for x in kh["ds"] if not x.get("ten") and x.get("ma") != kh["hien_tai"]
                  and not (DATA / "khoa-hoc" / x["ma"] / "lo-trinh.json").exists()), None)
    if trong:  # đã có khoá trắng bỏ dở từ lần trước: dùng lại
        ma = trong
    else:
        co = {x.get("ma") for x in kh["ds"]} | {p.name for p in (DATA / "khoa-hoc").glob("*") if p.is_dir()}
        n = 1
        while f"khoa-{n}" in co:
            n += 1
        ma = f"khoa-{n}"
        kh["ds"].append({"ma": ma, "ten": ""})
    kh["hien_tai"] = ma
    ghi_json(DATA / "khoa-hoc.json", kh)
    dua_ho_so_khoa_ra(ma)
    khoi_tao()
    return ma


def tom_tat_khoa() -> list[dict]:
    """Danh sách khoá học kèm tiến độ ngắn gọn (để trang chính, trang chủ khoá hiện rõ các khoá đang học, chọn chuyển)."""
    kh = ds_khoa()
    kq = []
    for x in kh["ds"]:
        ma = x.get("ma") or ""
        if not re.match(r"^[a-z0-9-]{1,40}$", ma):
            continue
        thu_muc = DATA / "khoa-hoc" / ma
        td = doc_json(thu_muc / "tien-do.json", {})
        lt = doc_json(thu_muc / "lo-trinh.json", {}) or {}
        tong = 0
        for c in lt.get("chang") or []:
            for m in c.get("module") or []:
                try:
                    tong += len(m.get("buoi") or []) or int(m.get("so_buoi") or 1)
                except (TypeError, ValueError):
                    tong += 1
        ma_lt = {b.get("ma") for c in lt.get("chang") or [] if isinstance(c, dict) for m in c.get("module") or [] if isinstance(m, dict) for b in m.get("buoi") or [] if isinstance(b, dict)}
        da_hoc = {b.get("ma") for b in td.get("buoi_da_hoc") or [] if isinstance(b, dict)} & ma_lt
        kq.append({"ma": ma, "ten": x.get("ten") or "", "hien_tai": ma == kh["hien_tai"], "da": len(da_hoc), "tong": tong,
                   "sao": so_nguyen(td.get("sao")) + so_nguyen(td.get("sao_on")), "cap": lt.get("cap_do") or "",
                   "dang_hoc": lt.get("trang_thai") == "da-duyet", "lan_cuoi": max((b.get("ngay") or "" for b in td.get("buoi_da_hoc") or [] if isinstance(b, dict)), default="")})
    return kq


def mo_khoa(ma: str) -> bool:
    """Học tiếp một khoá đã có: cất khoá đang học, đưa hồ sơ của khoá `ma` ra."""
    kh = ds_khoa()
    if not re.match(r"^[a-z0-9-]{1,40}$", ma or "") or ma not in {x.get("ma") for x in kh["ds"]}:
        return False
    if ma != kh["hien_tai"]:
        cat_ho_so_khoa()
        kh["hien_tai"] = ma
        ghi_json(DATA / "khoa-hoc.json", kh)
        dua_ho_so_khoa_ra(ma)
        khoi_tao()
    return True


# ---------- hồ sơ (Markdown + khối YAML đơn giản) ----------
def doc_front_matter(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    data: dict = {}
    for dong in m.group(1).splitlines():
        if ":" not in dong or dong.strip().startswith("#"):
            continue
        k, v = dong.split(":", 1)
        v = v.split(" #")[0].strip()
        if v.startswith("[") and v.endswith("]"):
            data[k.strip()] = [x.strip().strip('"') for x in v[1:-1].split(",") if x.strip()]
        elif v in ("true", "false"):
            data[k.strip()] = v == "true"
        else:
            data[k.strip()] = v.strip('"')
    return data, m.group(2)


def ghi_front_matter(data: dict, than: str) -> str:
    dong = ["---"]
    for k, v in data.items():
        if isinstance(v, list):
            v = "[" + ", ".join(re.sub(r"[\r\n]", " ", str(x)).replace(",", "\uFF0C") for x in v) + "]"
        elif isinstance(v, bool):
            v = "true" if v else "false"
        elif v is None:
            v = ""
        else:
            v = re.sub(r"[\r\n]", " ", str(v))
            if ":" in v or v.startswith(("[", "{", "#")):
                v = '"' + v.replace('"', "'") + '"'
        dong.append(f"{k}: {v}")
    dong.append("---")
    return "\n".join(dong) + "\n" + than


def ghi_muc(than: str, tieu_de: str, noi_dung: str) -> str:
    mau = re.compile(rf"(^## {re.escape(tieu_de)}\n)(.*?)(?=^## |\Z)", re.S | re.M)
    moi = noi_dung.strip() + "\n\n"
    if mau.search(than):
        return mau.sub(lambda m: m.group(1) + moi, than, count=1)
    return than.rstrip() + f"\n\n## {tieu_de}\n" + moi


def o(v) -> str:
    if isinstance(v, list):
        v = ", ".join(str(x) for x in v)
    return re.sub(r"[\r\n]", " ", str(v or "")).replace("|", "/").strip()


# ---------- nguồn ----------
def ghi_nguon(dl: dict) -> None:
    k = K()
    ghi_json(k / "nguon.json", dl)
    kc = dl.get("khung_chuan") or {}
    dong = ["# Danh sách nguồn", "", f"Ngành: {o(dl.get('nganh'))}  ", f"Khung chuẩn: {o(kc.get('ten'))} {o(kc.get('link'))}", "",
            "| Mã | Tên | Link | Ai làm | Tầng | Cấp | Tiếng | Phí | Ngày kiểm | Điểm (/20) | Vì sao chọn |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    for n in dl.get("nguon", []):
        ngay = n.get("ngay_kiem") or (f"CAN MO TAY {n['can_mo_tay']}" if n.get("can_mo_tay") else
                                      f"LOI {n['loi']}" if n.get("loi") else "")
        dong.append("| " + " | ".join(o(x) for x in [n.get("ma"), n.get("ten"), n.get("link"), n.get("ai_lam"), n.get("tang"),
                                                       n.get("cap"), n.get("tieng"), n.get("phi"), ngay, n.get("diem"), n.get("vi_sao")]) + " |")
    (k / "nguon.md").write_text("\n".join(dong) + "\n", encoding="utf-8")


def kiem_nguon() -> dict:
    dl = doc_json(K() / "nguon.json", {"nguon": []})
    hom_nay = dt.date.today().isoformat()

    def mot(n):
        duoc, mo_ta = mo_thu(n.get("link", ""))
        n.pop("loi", None)
        n.pop("ngay_kiem", None)
        n.pop("can_mo_tay", None)
        if duoc:
            n["ngay_kiem"] = hom_nay
        else:
            n["loi"] = mo_ta
            # Trang chặn máy tự động mở (403, 401, 429, lỗi chứng chỉ bảo mật) thường vẫn còn, chỉ là chặn máy kiểm:
            # giữ lại, đánh dấu cần người học mở tay (docs/quy-trinh-tim-nguon.md mục 4)
            if mo_ta in ("401", "403", "429") or "SSL" in mo_ta:
                n["can_mo_tay"] = hom_nay
        return n

    with ThreadPoolExecutor(max_workers=8) as ex:
        dl["nguon"] = list(ex.map(mot, dl.get("nguon", [])))
    ghi_nguon(dl)
    return dl


# ---------- lộ trình ----------
MIEN_TRU = ("Lộ trình này do AI tổng hợp để tư vấn, có thể có sai sót hoặc nguồn đã thay đổi. "
            "Bạn hãy đọc kỹ và tự kiểm tra các nguồn trước khi học theo. "
            "Bạn có thể điều chỉnh lộ trình theo nhu cầu của mình bất cứ lúc nào.")


def gop_buoi_da_soan(lt: dict, k: Path) -> dict:
    """App gửi lộ trình lên (có thể là bản cũ trong trình duyệt) trong lúc máy chủ vừa soạn ngầm xong danh sách buổi
    của một module: giữ các buổi máy chủ đã soạn, không để bản cũ (module chưa có buổi) ghi đè mất."""
    return gop_buoi(lt, doc_json(k / "lo-trinh.json", {}) or {})


def gop_buoi(lt: dict, cu: dict) -> dict:
    """Điền danh sách buổi đã soạn từ bản cũ vào module còn trống. Chỉ khi cùng mã VÀ cùng tên module
    (AI sửa lộ trình mà module đổi nội dung thì không dính các buổi cũ)."""
    da_soan = {(m.get("ma"), m.get("ten")): m.get("buoi") for c in cu.get("chang") or [] for m in c.get("module") or [] if m.get("buoi")}
    for c in lt.get("chang") or []:
        for m in c.get("module") or []:
            if not m.get("buoi") and da_soan.get((m.get("ma"), m.get("ten"))):
                m["buoi"] = da_soan[(m["ma"], m["ten"])]
    return lt


def ghi_lo_trinh(lt: dict, k: Path | None = None) -> None:
    k = k or K()
    ghi_json(k / "lo-trinh.json", lt)
    nguon = {n.get("ma"): n for n in doc_json(k / "nguon.json", {}).get("nguon", [])}

    def ds(mas):
        return ", ".join(f"{m} ([{o(nguon[m].get('ten'))}]({nguon[m].get('link')}))" if m in nguon else str(m) for m in (mas or []))

    d = ["---", f"ten: {o(lt.get('ten'))}", f"cap_do: {o(lt.get('cap_do'))}", f"tuong_duong: {o(lt.get('tuong_duong'))}",
         f"bat_dau: {o(lt.get('bat_dau'))}", f"trang_thai: {o(lt.get('trang_thai') or 'cho-duyet')}", "---", ""]
    for c in lt.get("chang", []):
        d += [f"# {o(c.get('ten'))} {{#{c.get('ma')}}}", f"Xong khi: {o(c.get('xong_khi'))}", ""]
        for m in c.get("module", []):
            d += [f"## {o(m.get('ten'))} {{#{m.get('ma')}}}", f"- Đầu ra: {o(m.get('dau_ra'))}",
                  f"- Thực hành cuối module: {o(m.get('thuc_hanh'))}",
                  f"- Số buổi: {len(m.get('buoi') or []) or o(m.get('so_buoi'))}", f"- Nguồn chính: {ds(m.get('nguon'))}", ""]
            for b in m.get("buoi") or []:
                d += [f"### {o(b.get('ten'))} {{#{b.get('ma')}}}", f"- Mục tiêu: {o(b.get('muc_tieu'))}",
                      *([f"- Lợi ích: {o(b.get('loi_ich'))}"] if b.get("loi_ich") else []), f"- Nguồn: {ds(b.get('nguon'))}", ""]
    d += ["## Miễn trừ trách nhiệm", MIEN_TRU, ""]
    (k / "lo-trinh.md").write_text("\n".join(d), encoding="utf-8")


def ngay_theo_lich(ngay: list[str], tu: dt.date, so: int) -> list[dt.date]:
    """Các ngày học theo lịch, bắt đầu từ ngày `tu` (tính cả ngày đó), đủ `so` buổi."""
    ma_ngay = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
    kq, d = [], tu
    while len(kq) < so and (d - tu).days < 3660:
        if ma_ngay[d.weekday()] in ngay:
            kq.append(d)
        d += dt.timedelta(days=1)
    return kq


def ghi_lich(ngay: list[str], gio: str, phut: int, ten: str, so_buoi: int, tu_ngay: str | None) -> dict:
    """Ghi lich-hoc.ics: một chuỗi lặp CÓ ĐIỂM DỪNG (COUNT = số buổi còn lại), không lặp vô hạn.
    UID cố định theo khoá, SEQUENCE tăng mỗi lần tạo lại, để ứng dụng lịch hiểu là cùng một lịch được cập nhật."""
    hh, mm = (gio or "20:00").split(":")[:2]
    try:
        tu = dt.date.fromisoformat(tu_ngay) if tu_ngay else dt.date.today()
    except ValueError:
        tu = dt.date.today()
    so_buoi = max(0, int(so_buoi or 0))
    ds = ngay_theo_lich(ngay, tu, so_buoi)
    k = K()
    td = doc_json(k / "tien-do.json", {})
    lan = int((td.get("lich") or {}).get("lan", 0)) + 1
    f = "%Y%m%dT%H%M%S"
    dong = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hoc cung Noe//VI", "CALSCALE:GREGORIAN"]
    if ds:
        bd = dt.datetime(ds[0].year, ds[0].month, ds[0].day, int(hh), int(mm))
        kt = bd + dt.timedelta(minutes=int(phut or 60))
        dong += [
            "BEGIN:VEVENT", f"UID:lich-{k.name}@hoc-cung-noe", f"SEQUENCE:{lan}",
            f"DTSTAMP:{dt.datetime.now(dt.timezone.utc).strftime(f)}Z", f"DTSTART:{bd.strftime(f)}", f"DTEND:{kt.strftime(f)}",
            f"RRULE:FREQ=WEEKLY;BYDAY={','.join(ngay)};COUNT={len(ds)}", f"SUMMARY:Học cùng Noe: {o(ten)}",
            f"DESCRIPTION:Mở app Học cùng Noe để học buổi hôm nay. Lịch có {len(ds)} buổi\\, buổi cuối ngày {ds[-1].strftime('%d/%m/%Y')}.",
            "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Sắp tới giờ học cùng Noe", "END:VALARM",
            "END:VEVENT"]
    dong += ["END:VCALENDAR", ""]
    (k / "lich-hoc.ics").write_bytes("\r\n".join(dong).encode("utf-8"))
    lich = {"ngay": ngay, "gio": f"{int(hh):02d}:{int(mm):02d}", "tu_ngay": tu.isoformat(), "so_buoi": len(ds),
            "buoi_dau": ds[0].isoformat() if ds else None,
            "ket_thuc": ds[-1].isoformat() if ds else None, "lan": lan, "tao_luc": dt.date.today().isoformat()}
    td["lich"] = lich
    ghi_json(k / "tien-do.json", td)
    return lich


# ---------- bài học ----------
MA_HOP_LE = re.compile(r"^[a-z0-9-]{1,40}$")


def ghi_bai(ma: str, bai: dict, k: Path | None = None) -> None:
    if not isinstance(ma, str) or not MA_HOP_LE.match(ma):
        raise ValueError("ma-buoi-sai")
    k = k or K()
    ghi_json(k / "bai" / f"{ma}.json", bai)
    nguon = {n.get("ma"): n for n in doc_json(k / "nguon.json", {}).get("nguon", [])}
    lt = bai.get("lam_thu") or {}
    d = ["---", f"ma: {ma}", f"tieu_de: {o(bai.get('tieu_de'))}", f"nguon: [{', '.join(bai.get('nguon') or [])}]", "---", "",
         *([f"Lợi ích: {bai['loi_ich']}", ""] if bai.get("loi_ich") else []),
         *([f"> Thử nghĩ xem: {bai['mo_dau']}", ""] if bai.get("mo_dau") else []),
         *(["## Ý chính", *[f"### {i + 1}. {y.get('tieu_de', '')}\n{y.get('noi_dung', '')}" + (f"\nVí dụ: {y['vi_du']}" if y.get('vi_du') else "")
                              for i, y in enumerate(bai.get("y_chinh") or []) if isinstance(y, dict)], ""] if bai.get("y_chinh") else ["## Nhanh", bai.get("nhanh", ""), ""]),
         *(["## Nguyên lý quan trọng", *[f"> **{y.get('ten', '')}**: {y.get('noi_dung', '')}" for y in bai.get("nguyen_ly") or [] if isinstance(y, dict)], ""] if bai.get("nguyen_ly") else []),
         "## Đào sâu", bai.get("dao_sau", ""), "",
         "## Ví dụ", bai.get("vi_du", ""), "", "## Làm thử",
         *[f"{i + 1}. {c.get('de', '')} ({' / '.join(str(x) for x in c.get('lua_chon') or [])})" for i, c in enumerate(lt.get("trac_nghiem") or [])],
         lt.get("de", ""), "",
         *[f"- Gợi ý {i + 1}: {g}" for i, g in enumerate(lt.get("goi_y") or [])], "",
         "## Tóm tắt cần nhớ", *[f"- {t}" for t in bai.get("tom_tat") or []], "",
         "## Nguồn", *[f"- {m}: {o(nguon[m].get('ten'))} — {nguon[m].get('link')}" for m in bai.get("nguon") or [] if m in nguon], ""]
    (k / "bai" / f"{ma}.md").write_text("\n".join(d), encoding="utf-8")
    cau = [{"id": f"{ma}-q{i + 1}", "loai": "chon", **c} for i, c in enumerate(bai.get("cau_hoi") or [])]
    gt = bai.get("giai_thich_bang_loi")
    if gt:
        cau.append({"id": f"{ma}-q{len(cau) + 1}", "loai": "tu-luan", "de": gt.get("de"), "y_can_co": gt.get("y_can_co")})
    ghi_json(k / "cau-hoi" / f"{ma}.json", {"ma_buoi": ma, "cau_hoi": cau})


def doc_tat_ca_cau_hoi() -> dict:
    kq = {}
    for p in (K() / "cau-hoi").glob("*.json"):
        for c in doc_json(p, {}).get("cau_hoi", []):
            kq[c.get("id")] = c
    return kq


# ---------- nối AI ----------
# Các hãng nói chung một "ngôn ngữ" (kiểu OpenAI): chỉ khác địa chỉ và khoá
HANG = {
    "gemini": {"ten": "Google Gemini", "goc": "https://generativelanguage.googleapis.com/v1beta/openai", "can_khoa": True},
    "groq": {"ten": "Groq", "goc": "https://api.groq.com/openai/v1", "can_khoa": True},
    "openai": {"ten": "OpenAI (ChatGPT)", "goc": "https://api.openai.com/v1", "can_khoa": True},
    "deepseek": {"ten": "DeepSeek", "goc": "https://api.deepseek.com", "can_khoa": True},
    "ollama": {"ten": "Ollama trên máy", "goc": "http://127.0.0.1:11434/v1", "can_khoa": False},
    "lmstudio": {"ten": "LM Studio trên máy", "goc": "http://127.0.0.1:1234/v1", "can_khoa": False},
}
LOAI_KHOA = {"anthropic", "openrouter", *[k for k, h in HANG.items() if h["can_khoa"]]}


def cai_dat() -> dict:
    return doc_json(CAI_DAT, {})


def model_cua(loai: str) -> str:
    return (cai_dat().get("model") or {}).get(loai) or ""


def goi_json(url: str, key: str | None, body: dict | None = None, timeout: int = 60) -> dict:
    h = {"Content-Type": "application/json"}
    if key:
        h["Authorization"] = f"Bearer {key}"
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None,
                                 method="POST" if body is not None else "GET", headers=h)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


# Model không dùng để trò chuyện (tạo ảnh, giọng nói, nhúng...): bỏ khỏi danh sách cho đỡ chọn nhầm
KHONG_CHAT = ("embed", "tts", "audio", "image", "imagen", "veo", "aqa", "whisper", "dall-e", "moderation",
              "transcribe", "antigravity", "robotics", "computer-use", "lyria", "guard", "realtime", "search-preview")
# Model nên chọn sẵn cho từng hãng (theo thứ tự ưu tiên; không có thì lấy cái đầu danh sách)
GOI_Y = {"gemini": ["gemini-3-flash-preview", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"],
         "groq": ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
         "openai": ["gpt-5.2", "gpt-5.1", "gpt-5", "gpt-4.1-mini", "gpt-4o-mini"],
         "deepseek": ["deepseek-chat"],
         "openrouter": ["openrouter/free"]}


def ds_model(loai: str) -> tuple[list[str], str]:
    """Hỏi hãng có những model nào (để chọn, không phải gõ tên) và model nên chọn sẵn."""
    bm = doc_json(BI_MAT, {})
    if loai == "openrouter":
        d = goi_json("https://openrouter.ai/api/v1/models", None)["data"]
        ds = ["openrouter/free", "openrouter/auto"] + sorted(m["id"] for m in d)
    else:
        h = HANG[loai]
        d = goi_json(h["goc"] + "/models", bm.get(loai) if h["can_khoa"] else None)
        ds = sorted(m.get("id").replace("models/", "") for m in d.get("data", []) if m.get("id"))
    ds = [m for m in ds if not any(t in m.lower() for t in KHONG_CHAT)]
    goi_y = next((m for m in GOI_Y.get(loai, []) if m in ds), ds[0] if ds else "")
    return ds, goi_y


def loi_http(e: urllib.error.HTTPError, ten: str) -> RuntimeError:
    if e.code in (401, 403):
        return RuntimeError(f"khoa-sai|Khoá {ten} không đúng hoặc không có quyền. Kiểm tra lại khoá.")
    if e.code == 402:
        return RuntimeError(f"het-tien|Tài khoản {ten} chưa có tiền cho model này. Chọn model miễn phí hoặc nạp thêm.")
    if e.code == 404:
        return RuntimeError(f"model-sai|{ten} không có model đã chọn. Vào Cài đặt AI chọn lại model.")
    if e.code == 429:
        return RuntimeError(f"qua-tai|{ten} đang giới hạn lượt dùng (bản miễn phí thường bị). Thử lại sau ít phút.")
    if e.code in (500, 502, 503, 504):
        return RuntimeError(f"qua-tai|{ten} đang quá tải. Thử lại sau ít phút, hoặc đổi model khác.")
    return RuntimeError(f"loi-ai|{ten} báo lỗi {e.code}: {e.read().decode('utf-8', 'replace')[:200]}")


def chay_hang(v: dict, prompt: str, web: bool, loai: str) -> str:
    h = HANG[loai]
    key = doc_json(BI_MAT, {}).get(loai)
    if h["can_khoa"] and not key:
        raise RuntimeError(f"chua-noi|Chưa dán khoá {h['ten']}.")
    model = model_cua(loai)
    if not model:
        raise RuntimeError(f"model-sai|Chưa chọn model {h['ten']}. Vào Cài đặt AI chọn model.")
    them_su_kien(v, "tim", f"Đang hỏi {h['ten']} ({model})…" + (" Model này không tự tìm web: Noe sẽ mở thử từng link sau." if web else ""))
    # Model bị hãng tắt (404) hoặc đang quá tải (503): tự thử các model gợi ý khác của hãng
    thu = [model] + [m for m in GOI_Y.get(loai, []) if m != model]
    try:
        for i, m in enumerate(thu):
            try:
                out = goi_json(h["goc"] + "/chat/completions", key, {"model": m, "messages": [{"role": "user", "content": prompt}]}, timeout=900)
                if m != model:
                    them_su_kien(v, "tim", f"Model {model} không dùng được, Noe chuyển sang {m}.")
                    cd = cai_dat()
                    cd.setdefault("model", {})[loai] = m
                    ghi_json(CAI_DAT, cd)
                break
            except urllib.error.HTTPError as e:
                if e.code in (404, 500, 502, 503, 504) and i + 1 < len(thu):
                    continue
                raise
    except urllib.error.HTTPError as e:
        raise loi_http(e, h["ten"])
    except urllib.error.URLError:
        if not h["can_khoa"]:
            raise RuntimeError(f"mang|Không thấy {h['ten']} đang chạy. Mở {h['ten']} lên rồi thử lại.")
        raise RuntimeError(f"mang|Không kết nối được {h['ten']}, kiểm tra mạng.")
    them_su_kien(v, "xong", f"{h['ten']} trả lời xong.")
    return ((out.get("choices") or [{}])[0].get("message") or {}).get("content") or ""


def trang_thai_ai() -> dict:
    bm = doc_json(BI_MAT, {})
    cd = cai_dat()

    def che(k):
        return f"…{k[-4:]}" if k else ""
    return {"cach_noi": cd.get("cach_noi"), "model_openrouter": cd.get("model_openrouter") or "openrouter/free",
            "model": cd.get("model") or {},
            "khoa": {k: che(bm.get(k)) for k in LOAI_KHOA if bm.get(k)},
            "co_openrouter": bool(bm.get("openrouter")), "openrouter": che(bm.get("openrouter")),
            "co_anthropic": bool(bm.get("anthropic")), "anthropic": che(bm.get("anthropic")),
            "co_claude_code": bool(tim_claude()), "co_thu_vien_anthropic": co_thu_vien_anthropic(),
            "hang": {k: h["ten"] for k, h in HANG.items()}}


def co_thu_vien_anthropic() -> bool:
    try:
        import anthropic  # noqa: F401
        return True
    except ImportError:
        return False


PKCE: dict[str, str] = {}  # state -> code_verifier (chỉ giữ trong bộ nhớ)


def bat_dau_openrouter(goc_url: str) -> str:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = secrets.token_urlsafe(16)
    PKCE[state] = verifier
    q = urllib.parse.urlencode({"callback_url": f"{goc_url}/ket-noi/openrouter/xong", "code_challenge": challenge,
                                "code_challenge_method": "S256", "state": state, "key_label": "Hoc cung Noe"})
    return f"https://openrouter.ai/auth?{q}"


def doi_ma_openrouter(code: str, state: str) -> tuple[bool, str]:
    verifier = PKCE.pop(state, None)
    if not verifier:
        return False, "Phiên liên kết đã hết hạn, bấm liên kết lại nhé."
    body = json.dumps({"code": code, "code_verifier": verifier, "code_challenge_method": "S256"}).encode()
    req = urllib.request.Request("https://openrouter.ai/api/v1/auth/keys", data=body, method="POST",
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            key = json.loads(r.read()).get("key")
    except urllib.error.HTTPError as e:
        return False, f"OpenRouter từ chối ({e.code}). Bấm liên kết lại nhé."
    except Exception as e:
        return False, f"Không kết nối được OpenRouter: {type(e).__name__}"
    if not key:
        return False, "OpenRouter không trả về khoá."
    bm = doc_json(BI_MAT, {})
    bm["openrouter"] = key
    ghi_bi_mat(bm)
    cd = cai_dat()
    cd["cach_noi"] = "openrouter"
    ghi_json(CAI_DAT, cd)
    return True, "ok"


# ---------- Google Lịch ----------
# Quyền hẹp nhất: calendar.app.created = app chỉ tạo được lịch riêng của mình ("Học cùng Noe")
# và sửa sự kiện trong lịch đó; không đọc, không đụng các lịch khác của người học.
# Mã app Google (client ID, client secret loại "Ứng dụng máy tính") nằm trong bi-mat.json,
# token làm mới (refresh token) cũng ở đó; không bao giờ gửi ra trình duyệt.
G_AUTH = os.environ.get("LEWA_GOOGLE_AUTH") or "https://accounts.google.com/o/oauth2/v2/auth"
G_TOKEN = os.environ.get("LEWA_GOOGLE_TOKEN") or "https://oauth2.googleapis.com/token"
G_API = os.environ.get("LEWA_GOOGLE_API") or "https://www.googleapis.com/calendar/v3"
G_REVOKE = os.environ.get("LEWA_GOOGLE_REVOKE") or "https://oauth2.googleapis.com/revoke"
G_VE = f"http://127.0.0.1:{PORT}/ket-noi/google/xong"  # Google cho ứng dụng máy tính quay về địa chỉ 127.0.0.1
G_QUYEN = "https://www.googleapis.com/auth/calendar.app.created"
G_TOKEN_NHO: dict = {}  # access token trong bộ nhớ: {"tok": ..., "het": giây}


G_MA_SAN = Path(os.environ.get("LEWA_GOOGLE_APP") or GOC / "app" / "google-app.json")  # mã app Google gói sẵn theo gói: học viên chỉ cần bấm Nối


def g_ma_san() -> dict:
    d = doc_json(G_MA_SAN, {})
    return {k: d[k] for k in ("client_id", "client_secret") if d.get(k)} if d.get("client_id") else {}


def g_bm() -> dict:
    """Mã app riêng (người học tự tạo, trong bi-mat.json) ưu tiên hơn mã gói sẵn."""
    rieng = doc_json(BI_MAT, {}).get("google") or {}
    if rieng.get("client_id") and rieng.get("client_secret"):
        return rieng
    return {**rieng, **g_ma_san()}


def g_ghi(**them) -> None:
    bm = doc_json(BI_MAT, {})
    g = bm.get("google") or {}
    g.update(them)
    bm["google"] = {k: v for k, v in g.items() if v is not None}
    ghi_bi_mat(bm)


def g_trang_thai() -> dict:
    g = g_bm()
    rieng = doc_json(BI_MAT, {}).get("google") or {}
    return {"co_ma_app": bool(g.get("client_id") and g.get("client_secret")), "da_noi": bool(g.get("refresh_token")),
            "ma_san": bool(g_ma_san()) and not (rieng.get("client_id") and rieng.get("client_secret")),
            "lich_id": bool(g.get("lich_id")), "mui_gio": g.get("mui_gio")}


def g_post_form(url: str, data: dict) -> dict:
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode(), method="POST",
                                 headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def bat_dau_google(mui_gio: str) -> str:
    g = g_bm()
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = "g" + secrets.token_urlsafe(16)
    PKCE[state] = verifier
    if mui_gio:
        g_ghi(mui_gio=mui_gio)
    q = urllib.parse.urlencode({
        "client_id": g.get("client_id", ""), "redirect_uri": G_VE, "response_type": "code",
        "scope": G_QUYEN, "code_challenge": challenge, "code_challenge_method": "S256", "state": state,
        "access_type": "offline", "prompt": "consent"})
    return f"{G_AUTH}?{q}"


def doi_ma_google(code: str, state: str) -> tuple[bool, str]:
    verifier = PKCE.pop(state, None)
    if not verifier:
        return False, "Phiên nối Google đã hết hạn, bấm nối lại nhé."
    g = g_bm()
    try:
        tl = g_post_form(G_TOKEN, {"code": code, "code_verifier": verifier, "client_id": g.get("client_id", ""),
                                   "client_secret": g.get("client_secret", ""), "grant_type": "authorization_code",
                                   "redirect_uri": G_VE})
    except urllib.error.HTTPError as e:
        return False, f"Google từ chối ({e.code}). Kiểm tra lại mã app Google rồi nối lại nhé."
    except Exception as e:
        return False, f"Không kết nối được Google: {type(e).__name__}"
    if not tl.get("refresh_token"):
        return False, "Google không trả về quyền lâu dài. Bấm nối lại nhé."
    g_ghi(refresh_token=tl["refresh_token"])
    G_TOKEN_NHO.update(tok=tl.get("access_token"), het=dt.datetime.now().timestamp() + int(tl.get("expires_in", 3000)) - 60)
    return True, "ok"


def g_access() -> str:
    if G_TOKEN_NHO.get("tok") and G_TOKEN_NHO.get("het", 0) > dt.datetime.now().timestamp():
        return G_TOKEN_NHO["tok"]
    g = g_bm()
    if not g.get("refresh_token"):
        raise RuntimeError("chua-noi|Chưa nối Google Lịch.")
    try:
        tl = g_post_form(G_TOKEN, {"client_id": g.get("client_id", ""), "client_secret": g.get("client_secret", ""),
                                   "refresh_token": g["refresh_token"], "grant_type": "refresh_token"})
    except urllib.error.HTTPError as e:
        if e.code in (400, 401):  # invalid_grant: người học gỡ quyền, hoặc quyền hết hạn
            g_ghi(refresh_token=None)
            raise RuntimeError("can-noi-lai|Google Lịch cần nối lại (quyền đã hết hạn hoặc bị gỡ).")
        raise RuntimeError(f"loi|Google báo lỗi {e.code}.")
    G_TOKEN_NHO.update(tok=tl["access_token"], het=dt.datetime.now().timestamp() + int(tl.get("expires_in", 3000)) - 60)
    return G_TOKEN_NHO["tok"]


def g_goi(phuong: str, duong: str, body: dict | None = None):
    req = urllib.request.Request(G_API + duong, method=phuong,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={"Authorization": f"Bearer {g_access()}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            t = r.read()
            return json.loads(t) if t else {}
    except urllib.error.HTTPError as e:
        if e.code in (404, 410):
            return None  # lịch hoặc sự kiện đã bị xoá bên Google
        raise RuntimeError(f"loi|Google Lịch báo lỗi {e.code}.")


def g_lich_id() -> str:
    """Lịch riêng "Học cùng Noe"; tạo nếu chưa có hoặc người học đã xoá."""
    g = g_bm()
    if g.get("lich_id") and g_goi("GET", f"/calendars/{urllib.parse.quote(g['lich_id'])}") is not None:
        return g["lich_id"]
    moi = g_goi("POST", "/calendars", {"summary": "Học cùng Noe", "description": "Lịch học do app Học cùng Noe tạo và tự dời.",
                                       "timeZone": g.get("mui_gio") or "Asia/Ho_Chi_Minh"})
    g_ghi(lich_id=moi["id"])
    return moi["id"]


def dong_bo_google(lich: dict, cu: dict | None, ten: str, phut: int) -> dict:
    """Đưa lịch nhắc lên Google: chuỗi cũ dừng ở hôm qua (giữ lịch sử), chuỗi mới bắt đầu từ buổi đầu mới."""
    if not g_bm().get("refresh_token"):
        return {"ok": False, "loi": "chua-noi"}
    try:
        cal = urllib.parse.quote(g_lich_id())
        mui = g_bm().get("mui_gio") or "Asia/Ho_Chi_Minh"
        id_cu = (cu or {}).get("google_su_kien")
        if id_cu:
            sk = g_goi("GET", f"/calendars/{cal}/events/{id_cu}")
            if sk and sk.get("status") != "cancelled":
                bd_cu = (sk.get("start") or {}).get("dateTime", "")[:10]
                hom_qua = dt.date.today() - dt.timedelta(days=1)
                if bd_cu and bd_cu <= hom_qua.isoformat():
                    rr = [x for x in sk.get("recurrence", []) if x.startswith("RRULE:")]
                    if rr:
                        goc = re.sub(r";(COUNT|UNTIL)=[^;]*", "", rr[0])
                        g_goi("PATCH", f"/calendars/{cal}/events/{id_cu}",
                              {"recurrence": [f"{goc};UNTIL={hom_qua.strftime('%Y%m%d')}T235959Z"]})
                else:
                    g_goi("DELETE", f"/calendars/{cal}/events/{id_cu}")
        if not lich.get("so_buoi"):
            return {"ok": True, "id": None}
        hh, mm = lich["gio"].split(":")
        bd = dt.datetime.fromisoformat(f"{lich['buoi_dau']}T{hh}:{mm}:00")
        kt = bd + dt.timedelta(minutes=int(phut or 60))
        sk = g_goi("POST", f"/calendars/{cal}/events", {
            "summary": f"Học cùng Noe: {ten}" if ten else "Học cùng Noe",
            "description": f"Mở app Học cùng Noe để học buổi hôm nay. Lịch có {lich['so_buoi']} buổi, buổi cuối ngày "
                           f"{dt.date.fromisoformat(lich['ket_thuc']).strftime('%d/%m/%Y')}. Lỡ buổi thì Noe tự dời lịch.",
            "start": {"dateTime": bd.isoformat(), "timeZone": mui}, "end": {"dateTime": kt.isoformat(), "timeZone": mui},
            "recurrence": [f"RRULE:FREQ=WEEKLY;BYDAY={','.join(lich['ngay'])};COUNT={lich['so_buoi']}"],
            "reminders": {"useDefault": False, "overrides": [{"method": "popup", "minutes": 10}]}})
        return {"ok": True, "id": sk["id"]}
    except RuntimeError as e:
        loai, _, chu = str(e).partition("|")
        return {"ok": False, "loi": loai, "thong_bao": chu}
    except Exception as e:
        return {"ok": False, "loi": "loi", "thong_bao": f"Không kết nối được Google: {type(e).__name__}"}


# Trang báo kết quả nối Google Lịch (trang rời, mở trong tab Google): theo ngôn ngữ trong hồ sơ người học
GOOGLE_LOI_EN = [
    (r"^Bạn chưa cho phép, nên Noe chưa nối được Google Lịch\.$", "You didn't allow access, so Noe couldn't connect Google Calendar."),
    (r"^Phiên nối Google đã hết hạn, bấm nối lại nhé\.$", "The Google session expired. Please click Connect again."),
    (r"^Google từ chối \((\d+)\)\. Kiểm tra lại mã app Google rồi nối lại nhé\.$", r"Google refused (\1). Check the Google app key and connect again."),
    (r"^Không kết nối được Google: (.*)$", r"Can't reach Google: \1"),
    (r"^Google không trả về quyền lâu dài\. Bấm nối lại nhé\.$", "Google didn't grant lasting access. Please connect again."),
]


def trang_bao_google(ok: bool, chu: str) -> str:
    try:
        nn = doc_front_matter((DATA / "ho-so.md").read_text(encoding="utf-8"))[0].get("ngon_ngu") or "vi"
    except Exception:
        nn = "vi"
    en = str(nn).lower().startswith("en")
    if en:
        for mau, thay in GOOGLE_LOI_EN:
            if re.match(mau, chu or ""):
                chu = re.sub(mau, thay, chu)
                break
        tieu_de = "Google Calendar connected!" if ok else "Couldn't connect Google Calendar"
        loi = "You can close this tab and go back to Learn with Noe." if ok else chu
        dong = "This tab closes by itself in a moment." if ok else "Go back to the app and click Connect Google Calendar again."
        ten = "Learn with Noe"
    else:
        tieu_de = "Đã nối Google Lịch!" if ok else "Chưa nối được Google Lịch"
        loi = "Bạn đóng tab này, quay lại app Học cùng Noe nhé." if ok else chu
        dong = "Tab này sẽ tự đóng sau giây lát." if ok else "Quay lại app, bấm Nối Google Lịch lần nữa nhé."
        ten = "Học cùng Noe"
    mau_nen = "#FFF4C2" if ok else "#F8E6E0"
    return (f"<!doctype html><html lang='{'en' if en else 'vi'}'><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
            f"<title>{ten}</title><link rel=icon href='/noe-icon.svg'>"
            f"<style>body{{margin:0;background:#F6F7F3;color:#18241F;font:17px/1.6 system-ui,'Segoe UI',sans-serif}}"
            f"main{{max-width:480px;margin:10vh auto;padding:28px 20px;text-align:center}}"
            f".o{{width:96px;height:96px;margin:0 auto 18px;border-radius:24px;background:{mau_nen};display:grid;place-items:center}}"
            f"h1{{font-size:24px;margin:0 0 8px}}p{{margin:6px 0;color:#56635C}}"
            f"@media (prefers-color-scheme:dark){{body{{background:#111A16;color:#E6ECE7}}p{{color:#9BAAA2}}}}</style>"
            f"<main><div class=o><img src='/noe-icon.svg' width=72 height=72 alt=''></div>"
            f"<h1>{esc_html(tieu_de)}</h1><p>{esc_html(loi)}</p><p>{esc_html(dong)}</p></main>"
            + ("<script>setTimeout(()=>window.close(),2500)</script>" if ok else "") + "</html>")


def esc_html(t: str) -> str:
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tim_claude() -> str | None:
    if os.environ.get("LEWA_CLAUDE"):
        return os.environ["LEWA_CLAUDE"]
    p = shutil.which("claude")
    if p:
        return p
    goc = os.environ.get("LOCALAPPDATA", "")
    ung_vien = glob.glob(os.path.join(goc, "Claude-Data", "*", "claude-code", "*", "*", "claude.exe"))
    ung_vien.sort(key=os.path.getmtime, reverse=True)
    return ung_vien[0] if ung_vien else None


# ---------- Đăng nhập Claude Code từ xa (làm được trên điện thoại) ----------
# `claude auth login` in ra một đường link; mở link ở đâu cũng được (kể cả điện thoại), đăng nhập xong trang hiện mã,
# người học dán mã vào app, app chuyển mã cho Claude Code. Mã không được ghi ra nhật ký hay màn hình.
CLAUDE_DN: dict = {}


def claude_da_dang_nhap() -> bool:
    exe = tim_claude()
    if not exe:
        return False
    try:
        kq = subprocess.run([exe, "auth", "status"], capture_output=True, text=True, encoding="utf-8", timeout=30, creationflags=AN_CUA_SO)
        return bool(json.loads(kq.stdout or "{}").get("loggedIn"))
    except Exception:
        return False


def claude_dn_bat_dau() -> str:
    exe = tim_claude()
    if not exe:
        raise RuntimeError("Không tìm thấy Claude Code trên máy tính.")
    cu = CLAUDE_DN.get("p")
    if cu and cu.poll() is None:
        cu.kill()
    env = {**os.environ, "BROWSER": "none"}
    pr = subprocess.Popen([exe, "auth", "login"], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                          text=True, encoding="utf-8", env=env, cwd=str(GOC), creationflags=AN_CUA_SO)
    CLAUDE_DN.clear()
    CLAUDE_DN.update(p=pr, ra=[])
    url = {"v": None}
    co_url = threading.Event()

    def doc():
        buf = ""
        while True:
            ch = pr.stdout.read(1)
            if not ch:
                break
            buf += ch
            CLAUDE_DN["ra"].append(ch)
            m = re.search(r"https://\S+oauth/authorize\S+", buf)
            if m and not url["v"] and ch in " \n\r":
                url["v"] = m.group(0).strip()
                co_url.set()
        co_url.set()

    threading.Thread(target=doc, daemon=True).start()
    co_url.wait(30)
    if not url["v"]:
        pr.kill()
        raise RuntimeError("Claude Code chưa đưa ra đường link đăng nhập, thử lại nhé.")
    return url["v"]


def claude_dn_nhap_ma(ma: str) -> tuple[bool, str]:
    pr = CLAUDE_DN.get("p")
    if not pr or pr.poll() is not None:
        return False, "Phiên đăng nhập đã hết. Bấm Đăng nhập Claude lại nhé."
    ma = ma.strip()
    if not re.fullmatch(r"[A-Za-z0-9#_\-\.~]{10,600}", ma):
        return False, "Mã chưa đúng. Bấm nút Copy trên trang Claude rồi dán lại nhé."
    try:
        pr.stdin.write(ma + "\n")
        pr.stdin.flush()
        pr.wait(90)
    except Exception:
        pr.kill()
        return False, "Claude Code không phản hồi, thử lại nhé."
    ra = "".join(CLAUDE_DN.get("ra", []))
    CLAUDE_DN.clear()
    if claude_da_dang_nhap():
        return True, "ok"
    if "wasn't accepted" in ra or "Couldn't log in" in ra:
        return False, "Claude không nhận mã này (có thể hết hạn hoặc dán thiếu). Bấm Đăng nhập Claude lại để lấy mã mới."
    return False, "Chưa đăng nhập được, thử lại nhé."


# ---------- việc AI chạy nền ----------
VIEC: dict[str, dict] = {}


def them_su_kien(v: dict, loai: str, chu: str) -> None:
    v["su_kien"].append({"loai": loai, "chu": chu, "luc": dt.datetime.now().strftime("%H:%M:%S")})


def ten_mien(url: str) -> str:
    try:
        return urllib.parse.urlparse(url).netloc.replace("www.", "")
    except Exception:
        return ""


def chay_openrouter(v: dict, prompt: str, web: bool) -> str:
    key = doc_json(BI_MAT, {}).get("openrouter")
    if not key:
        raise RuntimeError("chua-noi|Chưa liên kết OpenRouter.")
    model = cai_dat().get("model_openrouter") or "openrouter/free"
    mien_phi = model == "openrouter/free" or model.endswith(":free")
    body = {"model": model, "messages": [{"role": "user", "content": prompt}]}
    if web and not mien_phi:
        body["plugins"] = [{"id": "web", "max_results": 8}]
        them_su_kien(v, "tim", "Noe nhờ AI tìm trên mạng…")
    elif web:
        # Tìm web của OpenRouter tính tiền kể cả với model miễn phí, nên bỏ qua; Noe vẫn mở thử từng link sau đó
        them_su_kien(v, "tim", "Model miễn phí không tìm web được: AI dùng hiểu biết sẵn có, Noe sẽ mở thử từng link.")
    else:
        them_su_kien(v, "tim", f"Đang hỏi AI ({'miễn phí' if mien_phi else model})…")
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}",
                                          "HTTP-Referer": "http://localhost", "X-Title": "Hoc cung Noe"})
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            out = json.loads(r.read())
    except urllib.error.HTTPError as e:
        chi_tiet = e.read().decode("utf-8", "replace")[:300]
        if e.code == 401:
            raise RuntimeError("khoa-sai|Khoá OpenRouter không còn dùng được, hãy liên kết lại.")
        if e.code == 402:
            raise RuntimeError("het-tien|Tài khoản OpenRouter chưa có tiền cho model này. Chọn model miễn phí, hoặc nạp thêm ở openrouter.ai (mục Credits).")
        if e.code == 429:
            raise RuntimeError("qua-tai|Model miễn phí đang đông người dùng hoặc đã hết lượt hôm nay. Thử lại sau ít phút, hoặc đổi model.")
        raise RuntimeError(f"loi-ai|OpenRouter báo lỗi {e.code}: {chi_tiet}")
    msg = (out.get("choices") or [{}])[0].get("message") or {}
    for a in msg.get("annotations") or []:
        uc = a.get("url_citation") or {}
        if uc.get("url"):
            them_su_kien(v, "doc", f"Đã đọc: {uc.get('title') or ''} ({ten_mien(uc['url'])})")
    them_su_kien(v, "xong", f"AI trả lời xong ({out.get('model', '')}).")
    return msg.get("content") or ""


def chay_anthropic(v: dict, prompt: str, web: bool) -> str:
    key = doc_json(BI_MAT, {}).get("anthropic")
    if not key:
        raise RuntimeError("chua-noi|Chưa dán khoá Claude.")
    try:
        import anthropic
    except ImportError:
        raise RuntimeError("thieu-thu-vien|Máy chưa có thư viện anthropic. Tắt app rồi bấm lại MO-APP.bat để cài.")
    client = anthropic.Anthropic(api_key=key)
    messages = [{"role": "user", "content": prompt}]
    tools = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 15}] if web else []
    for _ in range(6):  # tối đa 6 lần nối tiếp khi gặp pause_turn
        dong_json: dict[int, str] = {}
        loai_khoi: dict[int, str] = {}
        try:
            with client.beta.messages.stream(
                model="claude-opus-5-5", max_tokens=64000,
                betas=["server-side-fallback-2026-07-01"], fallbacks="default",
                output_config={"effort": "high" if web else "medium"},
                messages=messages, **({"tools": tools} if tools else {}),
            ) as s:
                for ev in s:
                    if ev.type == "content_block_start":
                        cb = ev.content_block
                        loai_khoi[ev.index] = cb.type
                        if cb.type == "web_search_tool_result" and isinstance(cb.content, list):
                            for r in cb.content[:6]:
                                them_su_kien(v, "doc", f"Đã thấy: {getattr(r, 'title', '')} ({ten_mien(getattr(r, 'url', ''))})")
                    elif ev.type == "content_block_delta" and getattr(ev.delta, "type", "") == "input_json_delta":
                        dong_json[ev.index] = dong_json.get(ev.index, "") + ev.delta.partial_json
                    elif ev.type == "content_block_stop" and loai_khoi.get(ev.index) == "server_tool_use":
                        try:
                            q = json.loads(dong_json.get(ev.index) or "{}").get("query")
                        except ValueError:
                            q = None
                        if q:
                            them_su_kien(v, "tim", f"Đang tìm: {q}")
                final = s.get_final_message()
        except anthropic.AuthenticationError:
            raise RuntimeError("khoa-sai|Khoá Claude không đúng hoặc đã bị thu hồi.")
        except anthropic.PermissionDeniedError:
            raise RuntimeError("khoa-sai|Khoá Claude không có quyền dùng model này.")
        except anthropic.RateLimitError:
            raise RuntimeError("qua-tai|Claude đang giới hạn lượt dùng, thử lại sau ít phút.")
        except anthropic.APIStatusError as e:
            if e.status_code == 400 and "credit" in str(e.message).lower():
                raise RuntimeError("het-tien|Tài khoản Claude hết tiền, nạp thêm ở platform.claude.com.")
            raise RuntimeError(f"loi-ai|Claude báo lỗi {e.status_code}: {e.message}")
        except anthropic.APIConnectionError:
            raise RuntimeError("mang|Không kết nối được Claude, kiểm tra mạng.")
        if final.stop_reason == "refusal":
            raise RuntimeError("tu-choi|Claude từ chối yêu cầu này.")
        if final.stop_reason == "pause_turn":
            messages.append({"role": "assistant", "content": final.content})
            continue
        them_su_kien(v, "xong", "Claude trả lời xong.")
        return "".join(b.text for b in final.content if b.type == "text")
    raise RuntimeError("loi-ai|Claude tìm quá lâu, thử lại nhé.")


def chay_claude_code(v: dict, prompt: str, web: bool) -> str:
    exe = tim_claude()
    if not exe:
        raise RuntimeError("chua-noi|Không tìm thấy Claude Code trên máy.")
    them_su_kien(v, "tim", "Claude Code đang làm việc…")
    # Claude Code chỉ được tìm và đọc web (hoặc không công cụ nào), không chạy lệnh, không đọc ghi file, không nạp công cụ ngoài (MCP),
    # không nạp cài đặt riêng của người dùng; chạy trong một thư mục trống (giống cầu nối của bản web, sửa 24/11/2026)
    cam = ["--strict-mcp-config", "--permission-mode", "default", "--setting-sources", "", "--disable-slash-commands",
           "--disallowedTools", "Bash,PowerShell,Monitor,Read,Edit,Write,NotebookEdit,Glob,Grep,Task,Agent,Skill,TodoWrite"]
    lenh = [exe, "-p", "--output-format", "json"] + (["--tools", "WebSearch,WebFetch", "--allowedTools", "WebSearch,WebFetch"] if web else ["--tools", ""]) + cam
    thu_muc = CFG / "claude-code-tam"
    thu_muc.mkdir(parents=True, exist_ok=True)
    try:
        kq = subprocess.run(lenh, input=prompt, capture_output=True, text=True, encoding="utf-8", cwd=str(thu_muc), timeout=900, creationflags=AN_CUA_SO)
    except subprocess.TimeoutExpired:
        raise RuntimeError("het-gio|Claude Code chạy quá 15 phút, đã dừng.")
    try:
        out = json.loads(kq.stdout)
    except ValueError:
        raise RuntimeError("loi-ai|" + (kq.stderr or kq.stdout)[:300])
    if out.get("is_error"):
        vb = out.get("result", "")
        raise RuntimeError(("chua-dang-nhap|" if "login" in vb.lower() else "loi-ai|") + vb)
    them_su_kien(v, "xong", "Claude Code trả lời xong.")
    return out.get("result", "")


def chay_viec(vid: str, prompt: str, web: bool, viec: str) -> None:
    v = VIEC[vid]
    cach = cai_dat().get("cach_noi")
    them_su_kien(v, "bat-dau", f"Noe bắt đầu: {viec}")
    try:
        ham = {"openrouter": chay_openrouter, "anthropic": chay_anthropic, "claude-code": chay_claude_code}.get(cach)
        if not ham and cach in HANG:
            ham = lambda v_, p_, w_: chay_hang(v_, p_, w_, cach)  # noqa: E731
        if not ham:
            raise RuntimeError("chua-noi|Chưa nối AI.")
        v["van_ban"] = ham(v, prompt, web)
    except RuntimeError as e:
        ma, _, chu = str(e).partition("|")
        v["loi"], v["thong_bao"] = ma, chu or ma
    except Exception as e:  # không để luồng chết im lặng
        v["loi"], v["thong_bao"] = "loi-ai", f"{type(e).__name__}: {e}"
    v["xong"] = True


# ---------- sao, đồ của Noe, vé giữ chuỗi, huy hiệu (chung cho mọi khoá học của người học) ----------
# Ví sao = tổng sao vàng + sao xanh kiếm được ở mọi khoá, trừ số sao đã dùng. Giá do máy chủ giữ để không đổi lậu được.
GIA_DO = {"no": 10, "kinh": 20, "khan": 30, "tai-nghe": 50, "mu": 80, "vuong-mien": 150,
          # bộ trang phục theo chủ đề
          "non-la": 40, "dau-bep": 60, "hoa-si": 60, "cuop-bien": 70, "ao-thuat": 90, "tay-dua": 100, "phi-hanh-gia": 120, "sieu-nhan": 150,
          "bac-si": 80, "ninja": 90, "cao-boi": 70, "cuu-hoa": 100, "ky-si": 130,
          "con-ong": 60, "thuy-thu": 70, "cau-thu": 70, "ca-si": 80, "tho-lan": 80, "canh-sat": 90, "tham-tu": 90,
          "nha-khoa-hoc": 100, "ong-gia-noel": 120, "thien-than": 140,
          # phụ kiện thường ngày (thêm)
          # bộ sưu tập Không gian
          "kinh-vu-tru": 30, "hanh-tinh": 40, "ten-lua": 50, "ba-lo-phan-luc": 110,
          "kep-sao": 15, "but-chi": 20, "sach": 25, "mu-luoi-trai": 35, "day-chuyen": 40, "ba-lo": 45,
          "kep-hoa": 15, "bong-bay": 20, "tra-sua": 25, "kinh-tim": 30, "dong-ho": 30, "dien-thoai": 35, "mu-tai-beo": 35,
          "tui-deo": 40, "o-mua": 45, "du-nang": 45,
          # bộ sưu tập theo mùa
          "hoa-mai": 15, "li-xi": 20, "banh-chung": 25, "long-den": 35,
          "kem": 15, "kinh-ram": 20, "mu-coi": 35, "phao-boi": 40,
          "la-phong": 15, "khan-len": 25, "mu-noi": 30, "o-thu": 40,
          "gang-tay": 20, "coc-cacao": 20, "bit-tai": 25, "mu-len": 35,
          # bộ sưu tập Pháp sư, Hoàng gia (cùng vương miện ở trên)
          "qua-cau": 60, "truong-phep": 80, "mu-phu-thuy": 90, "ao-choang-tim": 100,
          "huan-chuong": 60, "truong-vang": 100, "ao-choang-do": 120,
          # bộ sưu tập Áo dài Việt Nam
          "hoa-sen": 25, "quat-giay": 30, "khan-dong": 45, "ao-dai": 100}
# Bộ sưu tập: mua cả bộ một lần (giảm 10% khi mua từ 2 món), đủ bộ thì mở khoá nền bản đồ học của bộ đó
BO_SUU_TAP = {
    "ao-dai": ["hoa-sen", "quat-giay", "khan-dong", "ao-dai"],
    "phap-su": ["qua-cau", "truong-phep", "mu-phu-thuy", "ao-choang-tim"],
    "khong-gian": ["kinh-vu-tru", "hanh-tinh", "ten-lua", "ba-lo-phan-luc"],
    "xuan": ["hoa-mai", "li-xi", "banh-chung", "long-den"],
    "ha": ["kem", "kinh-ram", "mu-coi", "phao-boi"],
    "thu": ["la-phong", "khan-len", "mu-noi", "o-thu"],
    "dong": ["gang-tay", "coc-cacao", "bit-tai", "mu-len"],
    "hoang-gia": ["huan-chuong", "truong-vang", "ao-choang-do", "vuong-mien"],
}


def gia_bo(bo: str, co: list) -> tuple[list, int]:
    """Các món còn thiếu của bộ và giá mua cả bộ (giảm 10% khi mua từ 2 món)."""
    thieu = [m for m in BO_SUU_TAP.get(bo, []) if m not in co]
    tong = sum(GIA_DO[m] for m in thieu)
    return thieu, (tong - round(tong * .1)) if len(thieu) >= 2 else tong
GIA_VE = 25
# 11 nấc huy hiệu theo cấp độ ánh sáng (từ đốm sáng tới Big Bang), tính trên tổng sao kiếm được ở MỌI khoá (100 buổi khoảng 500 sao, tối đa ước 1.000–1.500)
MOC_HUY_HIEU = (10, 30, 75, 150, 250, 400, 600, 900, 1300, 1800, 2500)
# Nền bản đồ học mở khoá bằng huy hiệu thành tích: mã nền -> mốc sao (nấc 9, 10, 11)
NEN_HUY_HIEU = {"ho-den": 1300, "thien-ha": 1800, "big-bang": 2500}
MAC_TOI_DA = 8  # số món mặc cùng lúc (mỗi chỗ một món)


def doc_noe() -> dict:
    d = doc_json(DATA / "noe.json", {})
    return {"da_dung": int(d.get("da_dung") or 0), "do": list(d.get("do") or []), "dang_mac": d.get("dang_mac") or "",
            "ve": int(d.get("ve") or 0), "huy_hieu": list(d.get("huy_hieu") or []),
            "chuoi_ngay": int(d.get("chuoi_ngay") or 0), "ngay_dat": d.get("ngay_dat") or "",
            "chuoi_dai_nhat": int(d.get("chuoi_dai_nhat") or 0), "mac_cuoi": d.get("mac_cuoi") or "", "nen": d.get("nen") or ""}


def chuoi_hien_tai(n: dict, hom_nay: dt.date | None = None) -> int:
    """Chuỗi ngày còn sống tới hôm nay: học hôm nay hoặc hôm qua thì còn; lỡ ngày mà còn đủ vé thì vẫn còn (vé dùng lúc học lại)."""
    hom_nay = hom_nay or dt.date.today()
    try:
        ngay = dt.date.fromisoformat(n.get("ngay_dat") or "")
    except ValueError:
        return 0
    lo = (hom_nay - ngay).days - 1  # số ngày bị lỡ
    return int(n.get("chuoi_ngay") or 0) if lo <= int(n.get("ve") or 0) else 0


def hoc_xong_hom_nay(n: dict, ngay_str: str) -> int:
    """Ghi một ngày có học vào chuỗi ngày. Lỡ ngày thì tự dùng vé giữ chuỗi (đủ vé). Trả về số vé đã dùng."""
    try:
        hom = dt.date.fromisoformat(ngay_str)
    except (TypeError, ValueError):
        hom = dt.date.today()
    try:
        cu = dt.date.fromisoformat(n.get("ngay_dat") or "")
    except ValueError:
        cu = None
    ve_dung = 0
    if cu == hom:
        return 0
    if cu and (hom - cu).days == 1:
        n["chuoi_ngay"] = int(n.get("chuoi_ngay") or 0) + 1
    elif cu and 0 < (hom - cu).days - 1 <= int(n.get("ve") or 0):
        ve_dung = (hom - cu).days - 1
        n["ve"] = int(n["ve"]) - ve_dung
        n["chuoi_ngay"] = int(n.get("chuoi_ngay") or 0) + 1
    else:
        n["chuoi_ngay"] = 1
    n["ngay_dat"] = hom.isoformat()
    n["chuoi_dai_nhat"] = max(int(n.get("chuoi_dai_nhat") or 0), n["chuoi_ngay"])
    return ve_dung


def tong_sao() -> int:
    tong = 0
    for p in (DATA / "khoa-hoc").glob("*/tien-do.json"):
        td = doc_json(p, {})
        tong += so_nguyen(td.get("sao")) + so_nguyen(td.get("sao_on"))
    return tong


def doi_noe(d: dict) -> tuple[bool, str, dict]:
    n = doc_noe()
    con = tong_sao() - n["da_dung"]
    if d.get("mua"):
        ma = str(d["mua"])
        if ma not in GIA_DO:
            return False, "Món này không có.", n
        if ma not in n["do"]:
            if con < GIA_DO[ma]:
                return False, f"Chưa đủ sao: cần {GIA_DO[ma]}, bạn có {con}.", n
            n["do"].append(ma)
            n["da_dung"] += GIA_DO[ma]
            con -= GIA_DO[ma]  # mua kèm vé trong cùng một lần: không được tiêu lố sao
        n["dang_mac"] = ma
    if d.get("mua_bo"):
        bo = str(d["mua_bo"])
        if bo not in BO_SUU_TAP:
            return False, "Bộ này không có.", n
        thieu, gia = gia_bo(bo, n["do"])
        if thieu:
            if con < gia:
                return False, f"Chưa đủ sao: cần {gia}, bạn có {con}.", n
            n["do"].extend(thieu)
            n["da_dung"] += gia
            con -= gia
    if "nen" in d:
        nen = str(d.get("nen") or "")
        if nen in NEN_HUY_HIEU:
            moc = NEN_HUY_HIEU[nen]
            if moc not in n["huy_hieu"] and tong_sao() < moc:
                return False, f"Đạt huy hiệu {moc} sao thì mới dùng được nền này.", n
        elif nen and (nen not in BO_SUU_TAP or any(m not in n["do"] for m in BO_SUU_TAP[nen])):
            return False, "Sưu tập đủ bộ thì mới dùng được nền này.", n
        n["nen"] = nen
    if "mac" in d:
        # mặc nhiều món cùng lúc: "vuong-mien,ao-choang-do,truong-vang" (app lo việc mỗi chỗ một món)
        ds = [x.strip() for x in str(d.get("mac") or "").split(",") if x.strip()]
        if any(x not in n["do"] for x in ds):
            return False, "Bạn chưa có món này.", n
        n["dang_mac"] = ",".join(dict.fromkeys(ds[:MAC_TOI_DA]))
    if d.get("mac_cuoi") in GIA_DO:
        n["mac_cuoi"] = d["mac_cuoi"]
    hx = ngay_hop_le(d.get("hoc_xong"))
    if hx and hx <= (dt.date.today() + dt.timedelta(days=1)).isoformat():
        n["ve_vua_dung"] = hoc_xong_hom_nay(n, hx)
    if d.get("mua_ve"):
        if con < GIA_VE:
            return False, f"Chưa đủ sao: cần {GIA_VE}, bạn có {con}.", n
        n["ve"] += 1
        n["da_dung"] += GIA_VE
    if d.get("dung_ve"):
        n["ve"] = max(0, n["ve"] - so_nguyen(d["dung_ve"], 0, 0, 1000))
    if d.get("nhan_huy_hieu"):
        tong = tong_sao()
        n["huy_hieu"] = sorted({*n["huy_hieu"], *[int(x) for x in (d["nhan_huy_hieu"] if isinstance(d["nhan_huy_hieu"], list) else []) if isinstance(x, int) and x in MOC_HUY_HIEU and x <= tong]})
    ve_vua = n.pop("ve_vua_dung", 0)
    ghi_json(DATA / "noe.json", n)
    n["ve_vua_dung"] = ve_vua
    n["chuoi"] = chuoi_hien_tai(n)
    return True, "", n


# ---------- nghiên cứu chạy ngầm ở máy chủ ----------
# Tìm nguồn → mở thử link → xếp 3 lộ trình chạy hẳn trong máy chủ: người học đóng tab, xem màn khác hay làm việc khác
# thì vẫn chạy tiếp. Lời dặn AI do app soạn sẵn gửi lên (dùng chung với app); máy chủ chạy, kiểm mẫu, ghi kết quả.
NGHIEN_CUU: dict[str, dict] = {}   # theo thư mục khoá học
CAP_K = ("nhanh", "can_doi", "chuyen_sau")
TEN_CAP_K = {"nhanh": "Sơ cấp", "can_doi": "Trung cấp", "chuyen_sau": "Chuyên sâu"}
CAP_MA = {"nhanh": "nhanh", "can_doi": "can-doi", "chuyen_sau": "chuyen-sau"}
TIEN_TO_CAP = {"nhanh": "", "can_doi": "tc-", "chuyen_sau": "cs-"}  # mã buổi riêng mỗi cấp, khớp app.js


def nghien_cuu_dang_chay() -> bool:
    return any(v.get("trang_thai") == "dang-chay" for v in NGHIEN_CUU.values())


def lay_json(vb: str):
    """Lấy khối JSON trong câu trả lời của AI (giống layJSON trong app.js)."""
    vb = (vb or "").lstrip("\ufeff")
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", vb)
    t = m.group(1) if m else vb[vb.find("{"): vb.rfind("}") + 1]
    try:
        return json.loads(t)
    except Exception:
        t = re.sub(r",\s*([}\]])", r"\1", t.replace("\u201c", '"').replace("\u201d", '"'))
        return json.loads(t)


def nc_hoi(nc: dict, prompt: str, web: bool, viec: str) -> str:
    v = {"xong": False, "loi": None, "thong_bao": None, "van_ban": None, "su_kien": nc["nhat_ky"]}
    vid = uuid.uuid4().hex
    VIEC[vid] = v
    try:
        chay_viec(vid, prompt, web, viec)
    finally:
        VIEC.pop(vid, None)
    if v["loi"]:
        raise RuntimeError(f"{v['loi']}|{v['thong_bao']}")
    return v["van_ban"] or ""


def nc_hoi_json(nc: dict, prompt: str, web: bool, viec: str, kiem):
    """Hỏi AI và đòi đúng mẫu JSON; sai mẫu thì nhờ AI sửa lại một lần (giống hoiJSON trong app.js)."""
    vb = nc_hoi(nc, prompt, web, viec)
    try:
        d = lay_json(vb)
        if kiem(d):
            return d
    except Exception:
        pass
    them_su_kien({"su_kien": nc["nhat_ky"]}, "tim", "AI trả lời chưa đúng mẫu, Noe nhờ nó sửa lại…")
    sua = ("Câu trả lời dưới đây phải là MỘT khối ```json hợp lệ theo đúng mẫu đã yêu cầu, nhưng đang sai hoặc thiếu. "
           "Hãy trả lại đúng MỘT khối ```json đã sửa, giữ nguyên nội dung, không viết gì thêm.\n\n"
           f"Yêu cầu gốc (để biết mẫu):\n{prompt[-2500:]}\n\nCâu trả lời cần sửa:\n{str(vb)[:12000]}")
    d = lay_json(nc_hoi(nc, sua, False, "sửa lại câu trả lời cho đúng mẫu"))
    if not kiem(d):
        raise RuntimeError("mau|Câu trả lời của AI chưa đúng mẫu.")
    return d


def hop_le_lt(lt) -> bool:
    return isinstance(lt, dict) and isinstance(lt.get("chang"), list) and len(lt["chang"]) > 0


def gan_tien_to(lt: dict, k: str) -> None:
    t = TIEN_TO_CAP.get(k, "")
    if not t:
        return
    g = lambda x: x if not x or str(x).startswith(t) else t + str(x)  # noqa: E731
    for c in lt.get("chang") or []:
        c["ma"] = g(c.get("ma"))
        for m in c.get("module") or []:
            m["ma"] = g(m.get("ma"))
            for b in m.get("buoi") or []:
                b["ma"] = g(b.get("ma"))


def dong_nguon(n: dict) -> str:
    cap = n.get("cap") if isinstance(n.get("cap"), list) else [n.get("cap")] if n.get("cap") else []
    try:
        chinh = " [NGUỒN CHÍNH]" if float(n.get("diem") or 0) >= 14 else ""
    except (TypeError, ValueError):
        chinh = ""
    kn = f"; dạy {', '.join(map(str, n['ky_nang']))}" if isinstance(n.get("ky_nang"), list) and n["ky_nang"] else ""
    return f"- {n.get('ma')}{chinh}: {n.get('ten')} ({n.get('ai_lam')}; tầng {n.get('tang')}; {n.get('tieng')}; {n.get('phi')}; hợp mức: {', '.join(map(str, cap))}{kn}) {n.get('link')}"


# ---------- Bảo đảm chất lượng (kế hoạch sửa 21/11/2026; cùng luật với app/web/chat-luong.js) ----------
BAC_CAP = {"nhanh": 1, "can-doi": 2, "can_doi": 2, "chuyen-sau": 3, "chuyen_sau": 3}
DONG_TU_YEU = re.compile(r"^\s*(biết|nắm|hiểu biết|làm quen|tìm hiểu)", re.I)


def kiem_lo_trinh(lt: dict, k: str, muc_tieu: dict | None) -> list[str]:
    """Code tự kiểm một lộ trình theo bảng kiểm (docs/quy-trinh-len-lo-trinh.md mục 3). Trả về danh sách lỗi."""
    loi, bac = [], BAC_CAP.get(k, 2)
    mods = [m for c in lt.get("chang") or [] for m in c.get("module") or []]
    for c in lt.get("chang") or []:
        if not str(c.get("xong_khi") or "").strip():
            loi.append(f"Chặng \"{c.get('ten')}\" thiếu xong_khi (sản phẩm thật).")
    for m in mods:
        for truong, ten in (("dau_ra", "đầu ra"), ("thuc_hanh", "thực hành cuối module")):
            if not str(m.get(truong) or "").strip():
                loi.append(f"Module \"{m.get('ten')}\" thiếu {ten}.")
        if DONG_TU_YEU.match(str(m.get("dau_ra") or "")):
            loi.append(f"Module \"{m.get('ten')}\": đầu ra dùng động từ không đo được (\"biết\", \"nắm\"…).")
    if muc_tieu:
        kn = [x for x in muc_tieu.get("ky_nang") or [] if BAC_CAP.get(x.get("cap"), 1) <= bac]
        co = {x for m in mods for x in m.get("ky_nang") or []}
        thieu = [x.get("ma") for x in kn if x.get("ma") not in co]
        if thieu:
            loi.append(f"Chưa module nào dạy các kỹ năng: {', '.join(thieu)}.")
        hd = [x.get("ma") for x in muc_tieu.get("hop_dong") or [] if BAC_CAP.get(x.get("cap"), 1) <= bac]
        do = {v.get("hop_dong") for v in (lt.get("bai_do_cuoi") or {}).get("viec") or [] if isinstance(v, dict)}
        if hd and not do:
            loi.append("Thiếu bai_do_cuoi (bài đo cuối lộ trình theo Hợp đồng đầu ra).")
        elif [x for x in hd if x not in do]:
            loi.append(f"Bài đo cuối chưa đo các việc: {', '.join(x for x in hd if x not in do)}.")
    for s in lt.get("tu_soat") or []:
        if isinstance(s, dict) and s.get("dat") is False:
            loi.append(f"Tự soát chưa đạt: {s.get('muc')} ({s.get('ghi_chu') or ''}).")
    ghi_buoi = re.search(r"(\d+)\s*buổi", str(lt.get("thoi_gian") or ""), re.I)
    tong = 0
    for m in mods:
        try:
            tong += int(m.get("so_buoi") or len(m.get("buoi") or []))
        except (TypeError, ValueError):
            pass
    if ghi_buoi and int(ghi_buoi.group(1)) != tong:
        loi.append(f"\"thoi_gian\" ghi {ghi_buoi.group(1)} buổi nhưng cộng so_buoi các module được {tong}.")
    return loi


def tom_tat_lt(lt: dict) -> str:
    return "\n".join(f"- {m.get('ten')} [{', '.join(m.get('ky_nang') or [])}]: {m.get('dau_ra')}"
                     for c in lt.get("chang") or [] for m in c.get("module") or [])


def xep_mot_cap(nc: dict, p: str, k: str, muc_tieu: dict | None) -> dict:
    """Xếp một cấp, code kiểm, có lỗi thì nhờ AI sửa đúng các lỗi đó một lần."""
    ok = lambda x: hop_le_lt(x) or (isinstance(x, dict) and hop_le_lt(x.get(k)))  # noqa: E731
    r = nc_hoi_json(nc, p, False, f"xếp lộ trình {TEN_CAP_K[k]}", ok)
    lt = r if hop_le_lt(r) else r[k]
    loi = kiem_lo_trinh(lt, k, muc_tieu)
    so_dau = len(loi)
    if loi:
        them_su_kien({"su_kien": nc["nhat_ky"]}, "tim", f"Noe soát thấy {len(loi)} chỗ chưa đạt, nhờ AI sửa…")
        sua = (p + "\n\nBẢN NHÁP BẠN VỪA XẾP:\n```json\n" + json.dumps(lt, ensure_ascii=False)[:30000] + "\n```\n"
               "Code kiểm phát hiện các lỗi sau. Sửa ĐÚNG các lỗi này, giữ nguyên phần đúng, trả lại MỘT khối ```json cùng mẫu:\n- " + "\n- ".join(loi))
        try:
            r2 = nc_hoi_json(nc, sua, False, f"sửa lộ trình {TEN_CAP_K[k]}", ok)
            lt = r2 if hop_le_lt(r2) else r2[k]
            loi = kiem_lo_trinh(lt, k, muc_tieu)
        except RuntimeError:
            pass
    lt["kiem"] = {"ngay": dt.date.today().isoformat(), "loi_ban_dau": so_dau, "loi_con_lai": loi}
    return lt


def ap_dung_kiem_dap_an(bai: dict, kq: dict) -> dict:
    """Áp kết quả AI thứ hai kiểm đáp án: sửa đáp án sai, bỏ câu mơ hồ (2 đáp án đúng hoặc không có đáp án đúng)."""
    def ds(phan):
        return bai.get("cau_hoi") if phan == "cau_hoi" else (bai.get("lam_thu") or {}).get("trac_nghiem")
    so_sua, bo = 0, {}
    for s in kq.get("sua") or []:
        try:
            lst, i, j = ds(s.get("phan")), int(s.get("i")), int(s.get("dap_an_dung"))
            if isinstance(lst, list) and 0 <= i < len(lst) and 0 <= j < len(lst[i].get("lua_chon") or []) and lst[i].get("dap_an") != j:
                lst[i]["dap_an"] = j
                so_sua += 1
        except (TypeError, ValueError, AttributeError):
            continue
    for s in kq.get("bo") or []:
        try:
            bo.setdefault(s.get("phan"), set()).add(int(s.get("i")))
        except (TypeError, ValueError):
            continue
    for phan, idx in bo.items():
        lst = ds(phan)
        if isinstance(lst, list):
            con = [c for i, c in enumerate(lst) if i not in idx]
            if phan == "cau_hoi" and len(con) < 3:
                continue  # bỏ nhiều quá thì giữ, đã ghi lại để soạn lại
            if phan == "cau_hoi":
                bai["cau_hoi"] = con
            else:
                bai["lam_thu"]["trac_nghiem"] = con
    bai["kiem_dap_an"] = {"ngay": dt.date.today().isoformat(), "sua": so_sua, "bo": sum(len(v) for v in bo.values())}
    return bai


def chay_nghien_cuu(nc: dict, d: dict) -> None:
    ghi = lambda loai, chu: them_su_kien({"su_kien": nc["nhat_ky"]}, loai, chu)  # noqa: E731
    try:
        nc["buoc"] = 1
        ghi("bat-dau", "Bước 1/3: tìm nguồn học trên mạng")
        dl = nc_hoi_json(nc, d["p1"], True, "tìm nguồn học",
                         lambda x: isinstance(x, dict) and isinstance(x.get("nguon"), list) and len(x["nguon"]) > 0)
        ds = []
        for i, n in enumerate(dl["nguon"]):
            if not isinstance(n, dict) or not re.match(r"^https?://", str(n.get("link") or "")):
                continue
            try:
                diem = float(n["diem"]) if n.get("diem") not in (None, "") else None
            except (TypeError, ValueError):
                diem = None
            if diem is not None and diem < 10:   # bảng chấm 20 điểm: dưới 10 thì bỏ
                continue
            n["ma"] = n.get("ma") or f"N{i + 1}"
            try:
                n["tang"] = int(n.get("tang") or 4)
            except (TypeError, ValueError):
                n["tang"] = 4
            ds.append(n)
        dl["nguon"] = ds
        dl["ngon_ngu_nguon"] = d.get("ngon_ngu_nguon") or "vi"
        ghi_nguon(dl)
        ghi("xong", f"Tìm được {len(ds)} nguồn.")

        nc["buoc"] = 2
        ghi("bat-dau", "Bước 2/3: Noe mở thử từng đường link")
        kq = kiem_nguon()
        for n in kq.get("nguon", []):
            if n.get("can_mo_tay"):
                ghi("doc", f"Trang chặn máy kiểm, giữ lại, bạn mở tay giúp: {n.get('ten')} ({n.get('link')})")
            else:
                ghi("doc" if n.get("ngay_kiem") else "loi", f"{'Mở được' if n.get('ngay_kiem') else 'KHÔNG mở được'}: {n.get('ten')} ({n.get('link')})")
        tot = [n for n in kq.get("nguon", []) if (n.get("ngay_kiem") or n.get("can_mo_tay")) and not n.get("bo")]
        if not tot:
            raise RuntimeError("khong-link|Không link nào mở được. Thử tìm lại nhé.")
        # AI thứ hai mở trang, kiểm nội dung có đúng như mô tả (đúng chủ đề, tiếng, phí, cấp) không
        if d.get("p_kiem_nguon"):
            ghi("bat-dau", "AI thứ hai đọc từng trang, kiểm nội dung đúng như mô tả")
            can = sorted(tot, key=lambda n: -float(n.get("diem") or 0))[:12]
            try:
                kn = nc_hoi_json(nc, d["p_kiem_nguon"].replace("{{NGUON}}", "\n".join(dong_nguon(n) for n in can)), True, "kiểm nội dung nguồn",
                                 lambda x: isinstance(x, dict) and isinstance(x.get("kq"), list))
                theo_ma = {str(x.get("ma")): x for x in kn["kq"] if isinstance(x, dict)}
                dl2 = doc_json(K() / "nguon.json", {})
                for n in dl2.get("nguon", []):
                    x = theo_ma.get(str(n.get("ma")))
                    if not x:
                        continue
                    if x.get("dung") is False:
                        n["bo"], n["ly_do_bo"] = True, str(x.get("sai") or "AI kiểm thấy không đúng mô tả")
                        ghi("loi", f"Bỏ {n.get('ma')}: {n['ly_do_bo']}")
                    elif x.get("dung") is True:
                        n["kiem_noi_dung"] = dt.date.today().isoformat()
                ghi_nguon(dl2)
                tot = [n for n in dl2.get("nguon", []) if (n.get("ngay_kiem") or n.get("can_mo_tay")) and not n.get("bo")]
                if not tot:
                    raise RuntimeError("khong-link|Không còn nguồn đúng mô tả. Thử tìm lại nhé.")
            except RuntimeError as e:
                if str(e).startswith("khong-link"):
                    raise
                ghi("loi", "Chưa kiểm được nội dung nguồn, vẫn dùng kết quả mở link.")

        nc["buoc"] = 3
        ghi("bat-dau", "Bước 3/3: xếp 3 lộ trình (Sơ cấp, Trung cấp, Chuyên sâu)")
        khung = (kq.get("khung_chuan") or {}).get("ten") or "(không có)"
        p3 = d["p3"].replace("{{NGUON}}", "\n".join(dong_nguon(n) for n in tot)).replace("{{KHUNG}}", str(khung))
        muc_tieu = doc_json(K() / "muc-tieu.json", None)
        lt3, truoc = {}, None
        for k in CAP_K:  # Sơ cấp → Trung cấp → Chuyên sâu: cấp sau bao trùm cấp trước và đi sâu hơn
            p = p3 + d["p3_cap"][k].replace("{{CAP_TRUOC}}", tom_tat_lt(truoc) if truoc else "(đây là cấp đầu tiên)")
            lt3[k] = xep_mot_cap(nc, p, k, muc_tieu)
            truoc = lt3[k]
            con = len(lt3[k]["kiem"]["loi_con_lai"])
            ghi("xong", f"Xong lộ trình {TEN_CAP_K[k]}" + (f" (còn {con} chỗ cần xem)" if con else ", đạt bảng kiểm") + ".")
        hop = {n["ma"] for n in tot}
        for k, lt in lt3.items():
            lt["cap_do"] = CAP_MA[k]
            for c in lt["chang"]:
                for m in c.get("module") or []:
                    m["nguon"] = [x for x in m.get("nguon") or [] if x in hop]
                    m["buoi"] = m.get("buoi") or []
                    for b in m["buoi"]:
                        b["nguon"] = [x for x in b.get("nguon") or [] if x in hop]
            gan_tien_to(lt, k)
        kh = K()
        ghi_json(kh / "lo-trinh-3.json", lt3)
        chon = {"nhanh": "nhanh", "can-doi": "can_doi", "chuyen-sau": "chuyen_sau"}.get(d.get("cap_chon") or "", "can_doi")
        ghi_lo_trinh({**lt3[chon], "trang_thai": "cho-duyet"})
        td = doc_json(kh / "tien-do.json", {})
        td["chang_hien_tai"] = "lo-trinh"
        ghi_json(kh / "tien-do.json", td)
        ghi("xong", "Xong! Mời bạn xem lộ trình.")
        nc["trang_thai"] = "xong"
    except RuntimeError as e:
        ma, _, chu = str(e).partition("|")
        nc["loi"], nc["thong_bao"], nc["trang_thai"] = ma, chu or ma, "loi"
        ghi("loi", chu or ma)
    except Exception as e:  # không để luồng chết im lặng
        nc["loi"], nc["thong_bao"], nc["trang_thai"] = "loi-ai", f"{type(e).__name__}: {e}", "loi"
        ghi("loi", nc["thong_bao"])
    nc["ket_thuc"] = dt.datetime.now().isoformat(timespec="seconds")


# ---------- soạn ngầm ở máy chủ: danh sách buổi của các module, bài học kế tiếp ----------
# App soạn sẵn lời dặn (dùng chung với lúc soạn trực tiếp) rồi gửi lên; máy chủ xếp hàng chạy từng việc, kiểm mẫu, ghi kết quả
# vào ĐÚNG thư mục khoá học lúc gửi (người học đổi khoá giữa chừng cũng không ghi nhầm). Người học thoát ra, tắt tab vẫn chạy tiếp.
SOAN: dict[str, dict] = {}   # theo thư mục khoá học
SOAN_KHOA = threading.Lock()


def nguon_dung(k: Path) -> list[dict]:
    return [n for n in doc_json(k / "nguon.json", {}).get("nguon", []) if (n.get("ngay_kiem") or n.get("can_mo_tay")) and not n.get("bo")]


def tim_module(k: Path, ma: str):
    """Tìm module theo mã trong lộ trình đang học, rồi trong 3 lộ trình. Trả về (module, tệp, dữ liệu) hoặc (None, None, None)."""
    lt = doc_json(k / "lo-trinh.json", {}) or {}
    for c in lt.get("chang") or []:
        for m in c.get("module") or []:
            if m.get("ma") == ma:
                return m, "lo-trinh", lt
    lt3 = doc_json(k / "lo-trinh-3.json", {}) or {}
    for cap in CAP_K:
        for c in (lt3.get(cap) or {}).get("chang") or []:
            for m in c.get("module") or []:
                if m.get("ma") == ma:
                    return m, "lo-trinh-3", lt3
    return None, None, None


def buoi_co_bai(k: Path, ma: str, ten: str) -> bool:
    if not isinstance(ma, str) or not MA_HOP_LE.match(ma):
        return False
    bai = doc_json(k / "bai" / f"{ma}.json", None)
    return bool(bai) and (not ten or bai.get("buoi_ten") == ten)


def soan_module(job: dict, k: Path, v: dict) -> dict | None:
    m, tep, du_lieu = tim_module(k, v["module"])
    if not m:
        raise RuntimeError("khong-thay|Không thấy module trong lộ trình.")
    if not m.get("buoi"):
        dl = nc_hoi_json(job, v["prompt"], False, f"soạn các buổi cho {m.get('ten', '')}",
                         lambda x: isinstance(x, dict) and isinstance(x.get("buoi"), list) and len(x["buoi"]) > 0)
        hop = {n.get("ma") for n in nguon_dung(k)}
        buoi = [{**b, "nguon": [x for x in b.get("nguon") or [] if x in hop]} for b in dl["buoi"] if isinstance(b, dict) and MA_HOP_LE.match(str(b.get("ma") or "")) and b.get("ten")]
        if not buoi:
            raise RuntimeError("mau|Câu trả lời của AI chưa đúng mẫu.")
        # đọc lại ngay trước khi ghi (app có thể vừa ghi lộ trình), chỉ điền module còn trống
        m, tep, du_lieu = tim_module(k, v["module"])
        if m is not None and not m.get("buoi"):
            m["buoi"] = buoi
            if tep == "lo-trinh":
                ghi_lo_trinh(du_lieu, k)
                if du_lieu.get("trang_thai") != "da-duyet":
                    # lộ trình chưa duyệt (soạn sẵn buổi 1 lúc người học còn đang đọc): ghi luôn vào bản 3 cấp
                    lt3 = doc_json(k / "lo-trinh-3.json", {}) or {}
                    for cap in CAP_K:
                        if isinstance(lt3.get(cap), dict):
                            gop_buoi(lt3[cap], du_lieu)
                    ghi_json(k / "lo-trinh-3.json", lt3)
            else:
                ghi_json(k / "lo-trinh-3.json", du_lieu)
    return m


def soan_bai(job: dict, k: Path, v: dict) -> None:
    if not v.get("lai") and buoi_co_bai(k, v["ma"], v.get("buoi_ten") or ""):
        return
    bai = nc_hoi_json(job, v["prompt"], False, f"soạn {v.get('buoi_ten') or v['ma']}",
                      lambda x: isinstance(x, dict) and (x.get("y_chinh") or x.get("nhanh")) and isinstance(x.get("cau_hoi"), list))
    ma_nguon = {n.get("ma") for n in doc_json(k / "nguon.json", {}).get("nguon", [])}
    bai["nguon"] = [x for x in bai.get("nguon") or [] if x in ma_nguon]
    bai["cau_hoi"] = [c for c in bai["cau_hoi"] if isinstance(c, dict) and isinstance(c.get("lua_chon"), list) and isinstance(c.get("dap_an"), int)
                      and not isinstance(c.get("dap_an"), bool) and 0 <= c["dap_an"] < len(c["lua_chon"])]
    # AI thứ hai giải lại từng câu, kiểm đáp án trước khi người học thấy
    if v.get("kiem") and "{{BAI}}" in v["kiem"]:
        de = {"lam_thu": [{k2: c.get(k2) for k2 in ("de", "lua_chon", "dap_an")} for c in (bai.get("lam_thu") or {}).get("trac_nghiem") or []],
              "cau_hoi": [{k2: c.get(k2) for k2 in ("de", "lua_chon", "dap_an")} for c in bai["cau_hoi"]]}
        try:
            kq = nc_hoi_json(job, v["kiem"].replace("{{BAI}}", json.dumps(de, ensure_ascii=False)), False, "kiểm đáp án",
                             lambda x: isinstance(x, dict) and isinstance(x.get("sua", []), list))
            bai = ap_dung_kiem_dap_an(bai, kq)
        except RuntimeError:
            bai["kiem_dap_an"] = {"ngay": dt.date.today().isoformat(), "loi": "chưa kiểm được"}
    bai["buoi_ten"], bai["module"], bai["nhip"] = v.get("buoi_ten") or "", v.get("module"), v.get("nhip", 0)
    ghi_bai(v["ma"], bai, k)


def dong_nguon_bai(k: Path, mas: list) -> str:
    nguon = {n.get("ma"): n for n in doc_json(k / "nguon.json", {}).get("nguon", [])}
    return "\n".join(f"- {x}: {nguon[x].get('ten')} ({nguon[x].get('ai_lam')}) {nguon[x].get('link')}" for x in dict.fromkeys(mas) if x in nguon) or "(không có)"


def chay_soan(khoa: str) -> None:
    job, k = SOAN[khoa], Path(khoa)
    while True:
        with SOAN_KHOA:
            if not job["hang"]:
                job["dang"] = None
                job["chay"] = False
                return
            v = job["hang"].pop(0)
            job["dang"] = v["khoa"]
        try:
            if v["loai"] == "module":
                m = soan_module(job, k, v)
                job["xong"][v["khoa"]] = dt.datetime.now().isoformat(timespec="seconds")
                # soạn luôn bài đầu tiên chưa học của module (lời dặn mẫu có chỗ trống cho tên buổi, mục tiêu, nguồn)
                if v.get("bai_mau") and m and m.get("buoi"):
                    da = {x.get("ma") for x in doc_json(k / "tien-do.json", {}).get("buoi_da_hoc") or [] if isinstance(x, dict)}
                    b = next((x for x in m["buoi"] if x.get("ma") not in da), None)
                    if b:
                        kb = "b:" + b["ma"]
                        job["dang"] = kb
                        p = (v["bai_mau"].replace("{{TEN_BUOI}}", str(b.get("ten") or "")).replace("{{MUC_TIEU}}", str(b.get("muc_tieu") or ""))
                             .replace("{{NGUON}}", dong_nguon_bai(k, (b.get("nguon") or []) + (m.get("nguon") or []))))
                        try:
                            soan_bai(job, k, {"ma": b["ma"], "module": m.get("ma"), "buoi_ten": b.get("ten"), "prompt": p, "nhip": v.get("nhip", 0), "kiem": v.get("kiem")})
                            job["xong"][kb] = dt.datetime.now().isoformat(timespec="seconds")
                        except RuntimeError as e:
                            job["loi"][kb] = str(e).partition("|")[2] or str(e)
            else:
                soan_bai(job, k, v)
                job["xong"][v["khoa"]] = dt.datetime.now().isoformat(timespec="seconds")
            job["loi"].pop(v["khoa"], None)
        except RuntimeError as e:
            ma, _, chu = str(e).partition("|")
            job["loi"][v["khoa"]] = chu or ma
            them_su_kien({"su_kien": job["nhat_ky"]}, "loi", chu or ma)
        except Exception as e:  # không để luồng chết im lặng
            job["loi"][v["khoa"]] = f"{type(e).__name__}: {e}"
            them_su_kien({"su_kien": job["nhat_ky"]}, "loi", job["loi"][v["khoa"]])


def them_viec_soan(khoa: str, ds: list, truoc: bool = False) -> dict:
    """Thêm việc vào hàng soạn ngầm của khoá học. Việc đang chờ hoặc vừa xong thì bỏ qua (trừ khi đòi soạn lại)."""
    with SOAN_KHOA:
        job = SOAN.setdefault(khoa, {"hang": [], "dang": None, "xong": {}, "loi": {}, "chay": False, "nhat_ky": []})
        moi = []
        for v in ds:
            if not isinstance(v, dict) or v.get("loai") not in ("module", "bai") or not isinstance(v.get("prompt"), str):
                continue
            ma = str(v.get("module") if v["loai"] == "module" else v.get("ma") or "")
            if not MA_HOP_LE.match(ma):
                continue
            v["khoa"] = ("m:" if v["loai"] == "module" else "b:") + ma
            if v["khoa"] == job["dang"] or any(x["khoa"] == v["khoa"] for x in job["hang"]):
                if truoc:  # đưa lên đầu hàng
                    job["hang"] = [x for x in job["hang"] if x["khoa"] != v["khoa"]]
                    if v["khoa"] != job["dang"]:
                        moi.append(v)
                continue
            if v["khoa"] in job["xong"] and not v.get("lai"):
                # module đã soạn mà lộ trình đang học lại không còn buổi (tìm lại lộ trình, đổi ngôn ngữ): cho soạn lại
                m0 = tim_module(K(), v.get("module"))[0] if v.get("loai") == "module" else None
                if not (m0 is not None and not m0.get("buoi")):
                    continue
            job["xong"].pop(v["khoa"], None)
            job["loi"].pop(v["khoa"], None)
            moi.append(v)
        job["hang"] = moi + job["hang"] if truoc else job["hang"] + moi
        if job["hang"] and not job["chay"]:
            job["chay"] = True
            threading.Thread(target=chay_soan, args=(khoa,), daemon=True).start()
        return job


def trang_thai_soan(khoa: str, tu: int = 0) -> dict:
    job = SOAN.get(khoa)
    if not job:
        return {"dang": None, "cho": [], "xong": [], "loi": {}, "nhat_ky": [], "tong": 0}
    return {"dang": job["dang"], "cho": [x["khoa"] for x in job["hang"]], "xong": list(job["xong"]), "loi": dict(job["loi"]),
            "nhat_ky": job["nhat_ky"][tu:], "tong": len(job["nhat_ky"])}


# ---------- điện thoại ----------
def ma_dien_thoai() -> str:
    """Mã ghép đôi giữ cố định giữa các lần mở app, để biểu tượng trên màn hình chính điện thoại vẫn vào được."""
    cd = doc_json(CAI_DAT, {})
    if not cd.get("ma_dien_thoai"):
        cd["ma_dien_thoai"] = secrets.token_urlsafe(12)
        ghi_json(CAI_DAT, cd)
    return cd["ma_dien_thoai"]


CFG.mkdir(parents=True, exist_ok=True)
MA_DIEN_THOAI = ma_dien_thoai()
MAY_DIEN_THOAI: dict = {}


def ip_mang_nha() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))  # không gửi gói nào, chỉ để biết card mạng
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def tim_openssl() -> str | None:
    """openssl có sẵn trên macOS/Linux; trên Windows thường đi kèm Git for Windows."""
    co = shutil.which("openssl")
    if co:
        return co
    for p in (r"C:\Program Files\Git\usr\bin\openssl.exe", r"C:\Program Files\Git\mingw64\bin\openssl.exe",
              r"C:\Program Files\Git\ucrt64\bin\openssl.exe", r"C:\Program Files (x86)\Git\usr\bin\openssl.exe"):
        if Path(p).is_file():
            return p
    return None


def chung_chi_bao_mat() -> tuple[Path, Path] | None:
    """Chứng chỉ tự tạo cho https trong mạng nhà (tạo lại khi máy đổi địa chỉ wifi). Không có openssl thì bỏ qua."""
    ip = ip_mang_nha()
    thu = CFG / "https"
    crt, key, ghi = thu / "noe.crt", thu / "noe.key", thu / "dia-chi.txt"
    if crt.is_file() and key.is_file() and ghi.is_file() and ghi.read_text(encoding="utf-8").strip() == ip:
        return crt, key
    openssl = tim_openssl()
    if not openssl:
        return None
    thu.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.run([openssl, "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256", "-days", "825",
                        "-keyout", str(key), "-out", str(crt), "-subj", "/CN=Hoc cung Noe",
                        "-addext", f"subjectAltName=IP:{ip},DNS:localhost"],
                       check=True, capture_output=True, timeout=60, creationflags=AN_CUA_SO)
    except (OSError, subprocess.SubprocessError):
        return None
    ghi.write_text(ip, encoding="utf-8")
    return crt, key


class MayBaoMat(ThreadingHTTPServer):
    def handle_error(self, request, client_address):
        pass  # điện thoại từ chối chứng chỉ tự tạo hay ngắt giữa chừng: không in lỗi làm người dùng lo


def bat_bao_mat():
    if MAY_DIEN_THOAI.get("bao_mat"):
        return
    cc = chung_chi_bao_mat()
    if not cc:
        return
    import ssl
    try:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        ctx.load_cert_chain(str(cc[0]), str(cc[1]))
        may = MayBaoMat(("0.0.0.0", PORT_BAO_MAT), XuLy)
        may.socket = ctx.wrap_socket(may.socket, server_side=True, do_handshake_on_connect=False)
    except (OSError, ssl.SSLError):
        return
    threading.Thread(target=may.serve_forever, daemon=True).start()
    MAY_DIEN_THOAI["bao_mat"] = may


def bat_dien_thoai() -> str:
    if not MAY_DIEN_THOAI.get("may"):
        may = ThreadingHTTPServer(("0.0.0.0", PORT_DIEN_THOAI), XuLy)
        threading.Thread(target=may.serve_forever, daemon=True).start()
        MAY_DIEN_THOAI["may"] = may
        if CO_HTTPS:
            threading.Thread(target=bat_bao_mat, daemon=True).start()
        cd = cai_dat()
        if not cd.get("dien_thoai_bat"):  # nhớ lại: lần sau mở app tự bật luôn, biểu tượng trên điện thoại vẫn dùng được
            cd["dien_thoai_bat"] = True
            ghi_json(CAI_DAT, cd)
    return f"http://{ip_mang_nha()}:{PORT_DIEN_THOAI}/?ma={MA_DIEN_THOAI}"


# ---------- lọc dữ liệu gửi lên (sửa 24/11/2026: dữ liệu sai kiểu từng ghi đè lộ trình, làm trang chủ không mở được) ----------
NGAY_TUAN = ("MO", "TU", "WE", "TH", "FR", "SA", "SU")


def la_obj(x) -> bool:
    return isinstance(x, dict)


def so_nguyen(x, mac_dinh: int = 0, nho: int | None = None, lon: int | None = None) -> int:
    try:
        n = int(x)
    except (TypeError, ValueError):
        n = mac_dinh
    if nho is not None:
        n = max(nho, n)
    if lon is not None:
        n = min(lon, n)
    return n


def ngay_hop_le(x) -> str | None:
    if not isinstance(x, str) or not re.match(r"^(20\d{2}|2100)-\d{2}-\d{2}$", x):
        return None
    try:
        dt.date.fromisoformat(x)
        return x
    except ValueError:
        return None


def dung_hinh_lt(lt) -> bool:
    """Lộ trình đúng hình: chặng → module → buổi đều là danh sách object (có giới hạn số lượng), mã đúng dạng."""
    if not la_obj(lt) or not isinstance(lt.get("chang"), list) or not 0 < len(lt["chang"]) <= 60:
        return False
    for c in lt["chang"]:
        if not la_obj(c):
            return False
        ms = c.get("module")
        if ms is None:
            continue
        if not isinstance(ms, list) or len(ms) > 40:
            return False
        for m in ms:
            if not la_obj(m) or ("ma" in m and not MA_HOP_LE.match(str(m.get("ma") or ""))):
                return False
            bs = m.get("buoi")
            if bs is None:
                continue
            if not isinstance(bs, list) or len(bs) > 60 or not all(la_obj(b) and MA_HOP_LE.match(str(b.get("ma") or "")) for b in bs):
                return False
    return True


def loc_tien_do(cu: dict, d: dict) -> dict:
    td = {**cu}
    for k, v in d.items():
        if not isinstance(k, str) or k in ("__proto__", "constructor", "prototype"):
            continue
        if k in ("buoi_da_hoc", "hoc_lai", "lich_on", "soan_lai") and not isinstance(v, list):
            continue
        if k in ("module", "lich") and v is not None and not la_obj(v):
            continue
        if k in ("sao", "sao_on", "nhip") and not isinstance(v, int):
            continue
        if k in ("sao", "sao_on") and not 0 <= v <= so_nguyen(cu.get(k)) + 10:
            continue
        td[k] = v
    return td


def loc_bai(bai) -> dict | None:
    if not la_obj(bai):
        return None
    if "cau_hoi" in bai and not isinstance(bai["cau_hoi"], list):
        return None
    if isinstance(bai.get("cau_hoi"), list):
        bai["cau_hoi"] = [c for c in bai["cau_hoi"] if la_obj(c)][:20]
    if "nguon" in bai:
        bai["nguon"] = [x for x in bai["nguon"] if isinstance(x, str)] if isinstance(bai["nguon"], list) else []
    for k in ("lam_thu", "giai_thich_bang_loi"):
        if k in bai and bai[k] is not None and not la_obj(bai[k]):
            del bai[k]
    return bai


# ---------- HTTP ----------
class XuLy(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    # Tên máy trong địa chỉ (Host) chỉ được là localhost hoặc một địa chỉ IP: trang lạ dùng tên miền riêng trỏ về máy này
    # (DNS rebinding) sẽ bị từ chối, nên không đọc được dữ liệu học (sửa bảo mật 24/11/2026)
    def host_hop_le(self) -> bool:
        h = (self.headers.get("Host") or "").strip().lower()
        if not h:
            return False
        ten = h[1:h.index("]")] if h.startswith("[") and "]" in h else h.rsplit(":", 1)[0]
        if ten == "localhost":
            return True
        try:
            ipaddress.ip_address(ten)
            return True
        except ValueError:
            return False

    # Lệnh ghi (POST) chỉ nhận từ chính trang của app: đúng kiểu JSON, và nguồn gửi (Origin) trùng địa chỉ app.
    # Trang web lạ mở trong trình duyệt không ra lệnh thay người dùng được (đổi khoá AI, bật cổng điện thoại...).
    def nguon_hop_le(self) -> bool:
        if not (self.headers.get("Content-Type") or "").lower().startswith("application/json"):
            return False
        if (self.headers.get("Sec-Fetch-Site") or "").lower() == "cross-site":
            return False
        og = (self.headers.get("Origin") or "").strip().lower()
        if not og:
            return True  # công cụ dòng lệnh, trình duyệt cũ: đã qua bước kiểm JSON (trang lạ không gửi JSON được khi không có CORS)
        h = (self.headers.get("Host") or "").strip().lower()
        return og in (f"http://{h}", f"https://{h}")

    def ma_ghep_dung(self, ma: str) -> bool:
        return bool(ma) and hmac.compare_digest(ma.encode(), MA_DIEN_THOAI.encode())

    # Máy khác trong mạng nhà phải có mã ghép đôi (cookie hoặc ?ma=)
    def duoc_phep(self) -> bool:
        if self.client_address[0] in ("127.0.0.1", "::1"):
            return True
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        if self.ma_ghep_dung(q.get("ma", [""])[0]):
            return True
        try:
            c = http.cookies.SimpleCookie(self.headers.get("Cookie") or "")
            return "noe_ma" in c and self.ma_ghep_dung(c["noe_ma"].value)
        except http.cookies.CookieError:
            return False

    def dia_chi_bao_mat(self) -> str:
        """Địa chỉ https cho điện thoại đang mở bằng http (để dùng nút Nói). Máy tính và máy đã ở https thì không cần."""
        if self.client_address[0] in ("127.0.0.1", "::1") or not MAY_DIEN_THOAI.get("bao_mat"):
            return ""
        if self.server is MAY_DIEN_THOAI.get("bao_mat"):
            return ""
        may = (self.headers.get("Host") or ip_mang_nha()).rsplit(":", 1)[0]
        return f"https://{may}:{PORT_BAO_MAT}/?ma={MA_DIEN_THOAI}"

    def gui(self, ma: int, data, kieu="application/json; charset=utf-8", them: dict | None = None):
        than = data if isinstance(data, bytes) else json.dumps(data, ensure_ascii=False).encode("utf-8")
        try:
            self.send_response(ma)
            self.send_header("Content-Type", kieu)
            self.send_header("Cache-Control", "no-store")
            for k, v in (them or {}).items():
                for gt in (v if isinstance(v, list) else [v]):  # nhiều Set-Cookie thì gửi nhiều dòng
                    self.send_header(k, gt)
            self.end_headers()
            self.wfile.write(than)
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # trình duyệt tự ngắt giữa chừng: không sao, khỏi in lỗi làm người dùng lo

    def chuyen(self, url: str):
        self.send_response(302)
        self.send_header("Location", url)
        self.end_headers()

    def doc_than(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        if n < 0 or n > 5_000_000:
            raise ValueError("qua-lon")
        d = json.loads(self.rfile.read(n) or b"{}")
        if not isinstance(d, dict):
            raise ValueError("du-lieu-sai")
        return d

    # Ảnh biểu tượng: iPhone/Android tải khi "Thêm vào màn hình chính" mà KHÔNG gửi cookie ghép đôi,
    # nên cho tải không cần mã (chỉ là logo, không có dữ liệu riêng)
    BIEU_TUONG = {"/noe-icon.svg", "/noe-icon-180.png", "/noe-icon-192.png", "/noe-icon-512.png",
                  "/noe-icon-maskable-512.png", "/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/favicon.ico"}

    def do_GET(self):
        try:
            return self._do_GET()
        except Exception as e:  # dữ liệu lạ: trả lỗi gọn, không ngắt kết nối giữa chừng
            print('loi GET', self.path[:80], type(e).__name__, e)
            return self.gui(500, {"loi": "loi-may-chu", "thong_bao": "Noe gặp lỗi, thử lại nhé."})

    def _do_GET(self):
        if not self.host_hop_le():
            return self.gui(421, {"loi": "host-sai"})
        duong0 = urllib.parse.urlparse(self.path).path
        if duong0 in self.BIEU_TUONG:
            ten = {"/apple-touch-icon.png": "noe-icon-180.png", "/apple-touch-icon-precomposed.png": "noe-icon-180.png",
                   "/favicon.ico": "noe-icon-192.png"}.get(duong0, duong0.lstrip("/"))
            p = WEB / ten
            return self.gui(200, p.read_bytes(), KIEU.get(p.suffix, "application/octet-stream"))
        if not self.duoc_phep():
            return self.gui(403, "<h1>Cần mã ghép đôi</h1><p>Quét lại mã QR trên máy tính.</p>".encode(), "text/html; charset=utf-8")
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        duong = u.path
        if duong == "/api/trang-thai":
            khoi_tao()
            k = K()
            ho_so, than = doc_front_matter((DATA / "ho-so.md").read_text(encoding="utf-8"))
            return self.gui(200, {
                "ho_so": ho_so, "ho_so_than": than, "ai": trang_thai_ai(),
                "tien_do": doc_json(k / "tien-do.json", {}), "dau_vao": doc_json(k / "dau-vao.json", None),
                "muc_tieu": doc_json(k / "muc-tieu.json", None), "do_luong": doc_json(k / "do-luong.json", {}),
                "nguon": doc_json(k / "nguon.json", None), "lo_trinh": doc_json(k / "lo-trinh.json", None),
                "lo_trinh_3": doc_json(k / "lo-trinh-3.json", None), "khoa_hoc": doc_json(DATA / "khoa-hoc.json", {}),
                "khoa_tom_tat": tom_tat_khoa(),
                "noi_luu": str(DATA), "google": g_trang_thai(),
                "noe": {**doc_noe(), "chuoi": chuoi_hien_tai(doc_noe())}, "tong_sao": tong_sao(), "bao_mat": self.dia_chi_bao_mat(), "gia_do": GIA_DO, "bo_suu_tap": BO_SUU_TAP, "gia_ve": GIA_VE, "moc_huy_hieu": MOC_HUY_HIEU, "nen_huy_hieu": NEN_HUY_HIEU,
            })
        if duong == "/api/ket-noi/openrouter":
            goc = f"http://{self.headers.get('Host') or f'localhost:{PORT}'}"
            return self.chuyen(bat_dau_openrouter(goc))
        if duong == "/api/ket-noi/google":
            if not g_trang_thai()["co_ma_app"]:
                return self.gui(400, {"loi": "chua-co-ma-app"})
            return self.chuyen(bat_dau_google(q.get("mui_gio", [""])[0][:60]))
        if duong == "/ket-noi/google/xong":
            if q.get("error"):
                ok, chu = False, "Bạn chưa cho phép, nên Noe chưa nối được Google Lịch."
            else:
                ok, chu = doi_ma_google(q.get("code", [""])[0], q.get("state", [""])[0])
            return self.gui(200 if ok else 400, trang_bao_google(ok, chu).encode("utf-8"), "text/html; charset=utf-8")
        if duong == "/ket-noi/openrouter/xong":
            ok, chu = doi_ma_openrouter(q.get("code", [""])[0], q.get("state", [""])[0])
            return self.chuyen("/?da-noi=openrouter" if ok else "/?loi-noi=" + urllib.parse.quote(chu))
        if duong == "/api/ai/models":
            loai = q.get("loai", [""])[0]
            if loai != "openrouter" and loai not in HANG:
                return self.gui(400, {"loi": "loai-sai"})
            try:
                ds, goi_y = ds_model(loai)
                return self.gui(200, {"ok": True, "ds": ds, "goi_y": goi_y})
            except urllib.error.HTTPError as e:
                return self.gui(200, {"ok": False, "thong_bao": str(loi_http(e, HANG.get(loai, {}).get("ten", loai))).split("|", 1)[-1]})
            except Exception:
                ten = HANG.get(loai, {}).get("ten", loai)
                return self.gui(200, {"ok": False, "thong_bao": f"Không lấy được danh sách model của {ten}. Kiểm tra khoá, mạng, hoặc mở chương trình trên máy lên."})
        if duong == "/api/nghien-cuu":
            nc = NGHIEN_CUU.get(str(K()))
            if not nc:
                return self.gui(200, {"trang_thai": None})
            tu = so_nguyen(q.get("tu", ["0"])[0], 0, 0)
            return self.gui(200, {**{k: nc.get(k) for k in ("trang_thai", "buoc", "loi", "thong_bao", "bat_dau", "ket_thuc")},
                                  "nhat_ky": nc["nhat_ky"][tu:], "tong": len(nc["nhat_ky"])})
        if duong == "/api/soan-ngam":
            return self.gui(200, trang_thai_soan(str(K()), so_nguyen(q.get("tu", ["0"])[0], 0, 0)))
        if duong == "/api/ai/viec":
            v = VIEC.get(q.get("id", [""])[0])
            if not v:
                return self.gui(404, {"loi": "khong-thay"})
            tu = so_nguyen(q.get("tu", ["0"])[0], 0, 0)
            return self.gui(200, {**{k: v[k] for k in ("xong", "loi", "thong_bao", "van_ban")}, "su_kien": v["su_kien"][tu:]})
        if duong == "/api/anh-dai-dien":  # ảnh đại diện của học viên (24/11/2026), cất trong thư mục học
            p = DATA / "anh-dai-dien.txt"
            return self.gui(200, {"anh": p.read_text(encoding="utf-8") if p.is_file() else None})
        if duong == "/api/bai":
            ma = q.get("ma", [""])[0]
            if not MA_HOP_LE.match(ma):
                return self.gui(400, {"loi": "ma-sai"})
            return self.gui(200, {"bai": doc_json(K() / "bai" / f"{ma}.json", None)})
        if duong == "/api/cau-hoi":
            return self.gui(200, {"cau_hoi": doc_tat_ca_cau_hoi()})
        if duong == "/api/lich.ics":
            p = K() / "lich-hoc.ics"
            if not p.exists():
                return self.gui(404, {"loi": "chua-co-lich"})
            return self.gui(200, p.read_bytes(), "text/calendar; charset=utf-8",
                            {"Content-Disposition": 'attachment; filename="lich-hoc.ics"'})
        if duong == "/manifest.webmanifest":
            # Trên điện thoại: biểu tượng màn hình chính mở thẳng vào app kèm mã ghép đôi
            mf = doc_json(WEB / "manifest.webmanifest", {})
            if self.client_address[0] not in ("127.0.0.1", "::1"):
                mf["start_url"] = f"/?ma={MA_DIEN_THOAI}"
            return self.gui(200, json.dumps(mf, ensure_ascii=False).encode("utf-8"), "application/manifest+json; charset=utf-8")
        # tệp tĩnh
        ten = "index.html" if duong in ("/", "") else duong.lstrip("/")
        p = (WEB / ten).resolve()
        if (WEB not in p.parents) or not p.is_file():
            return self.gui(404, {"loi": "khong-thay"})
        bm = MAY_DIEN_THOAI.get("bao_mat")
        if ten == "index.html" and bm and self.server is MAY_DIEN_THOAI.get("may") and "noe_bm=1" in (self.headers.get("Cookie") or ""):
            # Máy này đã vào bản https một lần (đã bấm qua cảnh báo): mở bản thường thì đưa thẳng sang bản https, khỏi hỏi lại
            may = (self.headers.get("Host") or ip_mang_nha()).rsplit(":", 1)[0]
            noi = "&" if "?" in self.path else "?"
            return self.chuyen(f"https://{may}:{PORT_BAO_MAT}{self.path}{noi}tu=http")  # tu=http: mở từ biểu tượng cũ, Noe mời ghim lại
        banh = []
        if q.get("ma", [""])[0] == MA_DIEN_THOAI:
            banh.append(f"noe_ma={MA_DIEN_THOAI}; Path=/; Max-Age=31536000; SameSite=Strict; HttpOnly")
        if ten == "index.html" and bm and self.server is bm:
            banh.append("noe_bm=1; Path=/; Max-Age=31536000; SameSite=Lax")  # nhớ: máy này đã mở được bản https
        noi_dung = p.read_bytes()
        if ten == "index.html":
            # Gắn số phiên bản (giờ sửa file) vào địa chỉ js, css: điện thoại (nhất là biểu tượng màn hình chính iPhone)
            # không dùng lại bản cũ còn nhớ trong máy sau khi app được cập nhật
            html = noi_dung.decode("utf-8")
            for f in ("dich-en.js", "dich.js", "noe.js", "app.js", "chat-luong.js", "style.css"):
                fp = WEB / f
                if fp.is_file():
                    v = int(fp.stat().st_mtime)
                    html = html.replace(f'src="{f}"', f'src="{f}?v={v}"').replace(f'href="{f}"', f'href="{f}?v={v}"')
            # Logo màn hình chính nhét thẳng vào trang (data URI): iPhone tải logo bằng kênh riêng, kênh đó
            # không tin chứng chỉ tự tạo của bản https nên sẽ hiện chữ "N" thay vì logo Noe
            logo = WEB / "noe-icon-180.png"
            if logo.is_file():
                html = html.replace('href="noe-icon-180.png"', 'href="data:image/png;base64,' + base64.b64encode(logo.read_bytes()).decode("ascii") + '"')
            noi_dung = html.encode("utf-8")
        self.gui(200, noi_dung, KIEU.get(p.suffix, "application/octet-stream"), {"Set-Cookie": banh} if banh else {})

    def do_POST(self):
        try:
            return self._do_POST()
        except Exception as e:
            print('loi POST', self.path[:80], type(e).__name__, e)
            return self.gui(400, {"loi": "du-lieu-sai", "thong_bao": "Dữ liệu chưa đúng, thử lại nhé."})

    def _do_POST(self):
        if not self.host_hop_le():
            return self.gui(421, {"loi": "host-sai"})
        if not self.nguon_hop_le():
            return self.gui(403, {"loi": "nguon-la"})
        if not self.duoc_phep():
            return self.gui(403, {"loi": "can-ma-ghep-doi"})
        duong = urllib.parse.urlparse(self.path).path
        khoi_tao()
        k = K()
        try:
            d = self.doc_than()
        except Exception:
            return self.gui(400, {"loi": "du-lieu-sai"})

        if duong == "/api/anh-dai-dien":
            p = DATA / "anh-dai-dien.txt"
            if d.get("anh") is None:
                if p.is_file():
                    p.unlink()
                return self.gui(200, {"ok": True})
            anh = d.get("anh")
            if not isinstance(anh, str) or len(anh) > 300_000 or not re.match(r"^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$", anh):
                return self.gui(400, {"loi": "anh-sai", "thong_bao": "Ảnh chưa đúng, bạn chọn ảnh khác nhé."})
            p.write_text(anh, encoding="utf-8")
            return self.gui(200, {"ok": True})
        if duong == "/api/ho-so":
            p = DATA / "ho-so.md"
            ho_so, than = doc_front_matter(p.read_text(encoding="utf-8"))
            truong = d.get("truong") if la_obj(d.get("truong")) else {}
            for kh, gt in list(truong.items())[:60]:
                if not isinstance(kh, str) or not re.match(r"^[a-z_]{1,40}$", kh):
                    continue
                if isinstance(gt, str):
                    ho_so[kh] = gt[:2000]
                elif isinstance(gt, list):
                    ho_so[kh] = [x[:500] for x in gt[:20] if isinstance(x, str)]
                elif isinstance(gt, (bool, int, float)):
                    ho_so[kh] = gt
            muc = d.get("muc") if la_obj(d.get("muc")) else {}
            for tieu_de, noi_dung in list(muc.items())[:20]:
                if not isinstance(noi_dung, str) or not isinstance(tieu_de, str) or not tieu_de or len(tieu_de) > 100 or re.search(r"[\r\n#]", tieu_de):
                    continue
                than = ghi_muc(than, tieu_de, noi_dung[:8000])
            p.write_text(ghi_front_matter(ho_so, than), encoding="utf-8")
            return self.gui(200, {"ok": True})
        if duong == "/api/tien-do":
            td = loc_tien_do(doc_json(k / "tien-do.json", {}), d)
            if len(json.dumps(td, ensure_ascii=False)) > 300_000:
                return self.gui(413, {"loi": "qua-lon", "thong_bao": "Dữ liệu tiến độ quá lớn."})
            ghi_json(k / "tien-do.json", td)
            return self.gui(200, {"ok": True, "tien_do": td})
        if duong == "/api/khoa-hoc":
            kh = ds_khoa()
            if "ten_hien_tai" in d:  # đặt tên khoá đang học, không đụng các khoá khác
                ten = str(d["ten_hien_tai"])[:200]
                dong = next((x for x in kh["ds"] if x.get("ma") == kh["hien_tai"]), None)
                if dong:
                    dong["ten"] = ten
                else:
                    kh["ds"].append({"ma": kh["hien_tai"], "ten": ten})
            ghi_json(DATA / "khoa-hoc.json", kh)
            return self.gui(200, {"ok": True})
        if duong in ("/api/khoa-hoc/moi", "/api/khoa-hoc/mo") and nghien_cuu_dang_chay():
            # đang nghiên cứu cho một khoá: chưa cho đổi khoá, để kết quả ghi đúng chỗ
            return self.gui(409, {"loi": "dang-nghien-cuu", "thong_bao": "Noe đang tìm nguồn cho khoá học hiện tại. Đợi xong rồi đổi khoá nha."})
        if duong == "/api/khoa-hoc/moi":
            return self.gui(200, {"ok": True, "ma": khoa_moi()})
        if duong == "/api/khoa-hoc/mo":
            if not mo_khoa(str(d.get("ma", ""))):
                return self.gui(400, {"loi": "khong-co-khoa"})
            return self.gui(200, {"ok": True})
        if duong == "/api/dau-vao":
            ghi_json(k / "dau-vao.json", d)  # d đã chắc là object (doc_than)
            return self.gui(200, {"ok": True})
        if duong == "/api/luu":
            # Hợp đồng đầu ra + bản đồ kỹ năng (muc-tieu), kết quả đo cuối chặng / cuối lộ trình / hỏi lại (do-luong)
            ten = str(d.get("ten") or "")
            if ten not in ("muc-tieu", "do-luong") or not isinstance(d.get("du_lieu"), dict):
                return self.gui(400, {"loi": "ten-khong-hop-le"})
            ghi_json(k / f"{ten}.json", d["du_lieu"])
            return self.gui(200, {"ok": True})
        if duong == "/api/nguon":
            if not isinstance(d.get("nguon"), list) or not all(la_obj(n) for n in d["nguon"]) or ("khung_chuan" in d and d["khung_chuan"] is not None and not la_obj(d["khung_chuan"])):
                return self.gui(400, {"loi": "du-lieu-sai"})
            ghi_nguon(d)
            return self.gui(200, {"ok": True})
        if duong == "/api/nguon/kiem":
            return self.gui(200, {"ok": True, "nguon": kiem_nguon()})
        if duong == "/api/lo-trinh":
            if not dung_hinh_lt(d):
                return self.gui(400, {"loi": "du-lieu-sai"})
            ghi_lo_trinh(gop_buoi_da_soan(d, k))
            return self.gui(200, {"ok": True})
        if duong == "/api/lo-trinh-3":
            # giữ các buổi máy chủ đã soạn ngầm (bản trong trình duyệt có thể cũ hơn)
            cu3 = doc_json(k / "lo-trinh-3.json", {}) or {}
            moi3 = {}
            for cap in CAP_K:  # cấp gửi lên sai hình thì giữ bản cũ
                if dung_hinh_lt(d.get(cap)):
                    if isinstance(cu3.get(cap), dict):
                        gop_buoi(d[cap], cu3[cap])
                    moi3[cap] = d[cap]
                elif isinstance(cu3.get(cap), dict):
                    moi3[cap] = cu3[cap]
            ghi_json(k / "lo-trinh-3.json", moi3)
            return self.gui(200, {"ok": True})
        if duong == "/api/claude-dang-nhap/bat-dau":
            try:
                return self.gui(200, {"ok": True, "url": claude_dn_bat_dau()})
            except RuntimeError as e:
                return self.gui(200, {"ok": False, "thong_bao": str(e)})
        if duong == "/api/claude-dang-nhap/ma":
            ok, chu = claude_dn_nhap_ma(str(d.get("ma", "")))
            return self.gui(200, {"ok": ok, "thong_bao": chu})
        if duong == "/api/claude-dang-nhap/trang-thai":
            return self.gui(200, {"co": bool(tim_claude()), "da_dang_nhap": claude_da_dang_nhap()})
        if duong == "/api/google/ma-app":
            cid, sec = str(d.get("client_id", "")).strip(), str(d.get("client_secret", "")).strip()
            if not re.match(r"^[\w.-]+\.apps\.googleusercontent\.com$", cid) or not re.match(r"^[\w-]{10,}$", sec):
                return self.gui(400, {"loi": "ma-sai"})
            g_ghi(client_id=cid, client_secret=sec)
            return self.gui(200, {"ok": True, "google": g_trang_thai()})
        if duong == "/api/google/ngat":
            tok = g_bm().get("refresh_token")
            if tok:
                try:  # gỡ quyền bên Google (không được cũng không sao)
                    g_post_form(G_REVOKE, {"token": tok})
                except Exception:
                    pass
            g_ghi(refresh_token=None)
            G_TOKEN_NHO.clear()
            return self.gui(200, {"ok": True, "google": g_trang_thai()})
        if duong == "/api/lich":
            cu = doc_json(k / "tien-do.json", {}).get("lich")
            ngay = [x for x in (d.get("ngay") if isinstance(d.get("ngay"), list) else []) if x in NGAY_TUAN] or ["MO", "WE", "FR"]
            gio = d.get("gio") if isinstance(d.get("gio"), str) and re.match(r"^([01]\d|2[0-3]):[0-5]\d$", d["gio"]) else "20:00"
            ten_lich = re.sub(r"[\r\n]", " ", d.get("ten") if isinstance(d.get("ten"), str) else "")[:200]
            d["phut"] = so_nguyen(d.get("phut"), 60, 5, 600)
            d["ten"] = ten_lich
            lich = ghi_lich(sorted(set(ngay), key=NGAY_TUAN.index), gio, d["phut"], ten_lich,
                            so_nguyen(d.get("so_buoi"), 0, 0, 2000), ngay_hop_le(d.get("tu_ngay")))
            gg = {"ok": False, "loi": "chua-noi"}
            if g_trang_thai()["da_noi"]:
                gg = dong_bo_google(lich, cu, d.get("ten", ""), d.get("phut"))
                if gg.get("ok"):
                    lich["google_su_kien"] = gg.get("id")
                elif cu and cu.get("google_su_kien"):
                    lich["google_su_kien"] = cu["google_su_kien"]  # chưa đồng bộ được: giữ mã chuỗi cũ để lần sau dời
                td = doc_json(k / "tien-do.json", {})
                td["lich"] = lich
                ghi_json(k / "tien-do.json", td)
            return self.gui(200, {"ok": True, "lich": lich, "google": gg})
        if duong == "/api/bai":
            ma = str(d.get("ma", ""))
            if not MA_HOP_LE.match(ma):
                return self.gui(400, {"loi": "ma-sai"})
            bai = loc_bai(d.get("bai") or {})
            if bai is None:
                return self.gui(400, {"loi": "du-lieu-sai"})
            ghi_bai(ma, bai)
            return self.gui(200, {"ok": True})
        if duong == "/api/nhat-ky":
            dong = o(d.get("dong"))
            if dong:
                with (k / "nhat-ky.md").open("a", encoding="utf-8") as f:
                    f.write(f"- {dt.date.today().isoformat()} · {o(d.get('ma'))} · {dong}\n")
            return self.gui(200, {"ok": True})

        # nối AI: khoá chỉ đi từ trình duyệt vào máy chủ một lần, không bao giờ đi ngược ra
        if duong == "/api/ai/cach-noi":
            cd = cai_dat()
            cach = d.get("cach_noi")
            if not isinstance(cach, str) or (cach not in ("claude-code", "anthropic", "openrouter", "sao-chep") and cach not in HANG):
                return self.gui(400, {"loi": "du-lieu-sai"})
            ma_model = lambda x: isinstance(x, str) and re.match(r"^[\w./:@-]{1,100}$", x)  # noqa: E731
            cd["cach_noi"] = cach
            if ma_model(d.get("model_openrouter")):
                cd["model_openrouter"] = d["model_openrouter"]
            if ma_model(d.get("model")) and cach in HANG:
                cd.setdefault("model", {})[cach] = d["model"]
            ghi_json(CAI_DAT, cd)
            return self.gui(200, {"ok": True, "ai": trang_thai_ai()})
        if duong == "/api/ai/thu":
            # Thử kết nối thật bằng một câu rất ngắn, đợi tối đa 2 phút
            vid = uuid.uuid4().hex
            VIEC[vid] = {"xong": False, "loi": None, "thong_bao": None, "van_ban": None, "su_kien": []}
            t = threading.Thread(target=chay_viec, args=(vid, 'Trả lời đúng một chữ: "ok"', False, "thử kết nối"), daemon=True)
            t.start()
            t.join(120)
            v = VIEC[vid]
            if not v["xong"]:
                return self.gui(200, {"ok": False, "thong_bao": "AI trả lời quá chậm (hơn 2 phút). Thử lại hoặc đổi model."})
            return self.gui(200, {"ok": not v["loi"], "thong_bao": v["thong_bao"] or (v["van_ban"] or "")[:80]})
        if duong == "/api/ai/khoa":
            loai, khoa = d.get("loai"), str(d.get("khoa", "")).strip()
            if not isinstance(loai, str) or loai not in LOAI_KHOA or not 20 <= len(khoa) <= 300 or re.search(r"[\s\x00-\x1f]", khoa):
                return self.gui(400, {"loi": "khoa-sai", "thong_bao": "Khoá trông không đúng."})
            bm = doc_json(BI_MAT, {})
            bm[loai] = khoa
            ghi_bi_mat(bm)
            cd = cai_dat()
            cd["cach_noi"] = loai
            ghi_json(CAI_DAT, cd)
            return self.gui(200, {"ok": True, "ai": trang_thai_ai()})
        if duong == "/api/ai/xoa-khoa":
            bm = doc_json(BI_MAT, {})
            loai = d.get("loai") if isinstance(d.get("loai"), str) else ""
            bm.pop(loai, None)
            ghi_bi_mat(bm)
            cd = cai_dat()
            if cd.get("cach_noi") == loai:  # xoá khoá của cách đang dùng: coi như chưa nối, để app hỏi nối lại
                cd["cach_noi"] = None
                ghi_json(CAI_DAT, cd)
            return self.gui(200, {"ok": True, "ai": trang_thai_ai()})
        if duong == "/api/noe":
            ok, loi, n = doi_noe(d)
            return self.gui(200 if ok else 400, {"ok": ok, "thong_bao": loi, "noe": n, "tong_sao": tong_sao()})
        if duong == "/api/nghien-cuu/bat-dau":
            khoa = str(K())
            cu = NGHIEN_CUU.get(khoa)
            if cu and cu.get("trang_thai") == "dang-chay":
                return self.gui(200, {"ok": True, "dang_chay": True})
            p3_cap = d.get("p3_cap") or {}
            if not d.get("p1") or not d.get("p3") or any(not p3_cap.get(x) for x in CAP_K):
                return self.gui(400, {"loi": "thieu-loi-dan"})
            nc = {"khoa": khoa, "trang_thai": "dang-chay", "buoc": 0, "nhat_ky": [], "loi": None, "thong_bao": None,
                  "bat_dau": dt.datetime.now().isoformat(timespec="seconds"), "ket_thuc": None}
            NGHIEN_CUU[khoa] = nc
            td = doc_json(k / "tien-do.json", {})
            td["chang_hien_tai"] = "tim"
            ghi_json(k / "tien-do.json", td)
            threading.Thread(target=chay_nghien_cuu, args=(nc, d), daemon=True).start()
            return self.gui(200, {"ok": True})
        if duong == "/api/soan-ngam":
            if cai_dat().get("cach_noi") in (None, "", "sao-chep"):
                return self.gui(200, {"ok": False, "loi": "can-noi-tu-dong"})
            them_viec_soan(str(k), d.get("viec") or [], bool(d.get("truoc")))
            return self.gui(200, {"ok": True, **trang_thai_soan(str(k), 10 ** 9)})
        if duong == "/api/ai/bat-dau":
            vid = uuid.uuid4().hex
            VIEC[vid] = {"xong": False, "loi": None, "thong_bao": None, "van_ban": None, "su_kien": []}
            threading.Thread(target=chay_viec, args=(vid, d.get("prompt", ""), bool(d.get("web")), d.get("viec", "việc này")),
                             daemon=True).start()
            return self.gui(200, {"id": vid})
        if duong == "/api/nhat-ky-mic":
            # Nhật ký micro của điện thoại (để gỡ lỗi nút Nói): chỉ ghi sự kiện kỹ thuật, KHÔNG ghi chữ người học nói
            try:
                dong = f"{dt.datetime.now():%Y-%m-%d %H:%M:%S} {self.client_address[0]} {str(d.get('su_kien', ''))[:40]} {json.dumps(d.get('chi_tiet', ''), ensure_ascii=False)[:300]}\n"
                p = CFG / "nhat-ky-mic.log"
                if p.is_file() and p.stat().st_size > 300_000:
                    p.write_text(p.read_text(encoding="utf-8")[-150_000:], encoding="utf-8")
                with p.open("a", encoding="utf-8") as f:
                    f.write(dong)
            except (OSError, ValueError):
                pass
            return self.gui(200, {"ok": True})
        if duong == "/api/dien-thoai":
            if self.client_address[0] not in ("127.0.0.1", "::1"):
                return self.gui(403, {"loi": "chi-may-tinh"})
            url = bat_dien_thoai()
            if CO_HTTPS and not MAY_DIEN_THOAI.get("bao_mat"):
                bat_bao_mat()  # lần đầu bật điện thoại: đợi tạo chứng chỉ, mở cổng https luôn để mã QR dẫn thẳng tới bản bảo mật
            bm = f"https://{ip_mang_nha()}:{PORT_BAO_MAT}/?ma={MA_DIEN_THOAI}" if MAY_DIEN_THOAI.get("bao_mat") else ""
            return self.gui(200, {"url": url, "url_bao_mat": bm})
        self.gui(404, {"loi": "khong-thay"})


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    khoi_tao()
    try:
        may = ThreadingHTTPServer(("127.0.0.1", PORT), XuLy)
    except OSError:
        print(f"Cổng {PORT} đang bận: có thể app đã mở rồi. Mở trình duyệt vào http://localhost:{PORT}")
        webbrowser.open(f"http://localhost:{PORT}")
        sys.exit(0)
    # Trình duyệt có thể gọi "localhost" bằng IPv6 (::1) trước: mở thêm cổng đó, vẫn chỉ trong máy
    try:
        class May6(ThreadingHTTPServer):
            address_family = socket.AF_INET6
        may6 = May6(("::1", PORT), XuLy)
        threading.Thread(target=may6.serve_forever, daemon=True).start()
    except OSError:
        pass
    url = f"http://localhost:{PORT}"
    print(f"App Học cùng Noe đang chạy: {url}  (bấm Ctrl+C để tắt)")
    print(f"Thư mục học: {DATA}")
    if cai_dat().get("dien_thoai_bat"):
        try:
            print(f"Mở trên điện thoại (cùng wifi): {bat_dien_thoai().split('?')[0]}")
        except OSError:
            print(f"Cổng điện thoại {PORT_DIEN_THOAI} đang bận, chưa mở được cho điện thoại.")
    if "--khong-mo" not in sys.argv:
        webbrowser.open(url)
    try:
        may.serve_forever()
    except KeyboardInterrupt:
        print("Đã tắt app.")


if __name__ == "__main__":
    main()
