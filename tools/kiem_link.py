"""Kiểm link trong bảng nguồn của Learn Everything with AI.

Đọc bảng Markdown trong nguon.md, mở thử từng link ở cột "Link",
rồi ghi kết quả vào cột "Ngày kiểm":
  - mở được: ngày hôm nay (YYYY-MM-DD)
  - không mở được: "LOI <mã lỗi>"

Cách dùng:
  py tools/kiem_link.py hoc-cua-toi/nguon.md            kiểm và ghi lại file
  py tools/kiem_link.py hoc-cua-toi/nguon.md --chi-xem  chỉ in kết quả, không sửa file

Chỉ dùng thư viện có sẵn của Python, không cần cài thêm.
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = "Mozilla/5.0 (compatible; learn-everything-with-ai link checker)"
TIMEOUT = 20
LINK_RE = re.compile(r"\((https?://[^)\s]+)\)|(https?://[^\s|<>]+)")


def tach_o(dong: str) -> list[str]:
    """Tách một dòng bảng Markdown thành các ô (bỏ ô rỗng hai đầu)."""
    phan = dong.strip().split("|")
    if phan and phan[0].strip() == "":
        phan = phan[1:]
    if phan and phan[-1].strip() == "":
        phan = phan[:-1]
    return [p.strip() for p in phan]


def ghep_o(o: list[str]) -> str:
    return "| " + " | ".join(o) + " |"


def lay_url(o_link: str) -> str | None:
    m = LINK_RE.search(o_link)
    if not m:
        return None
    return m.group(1) or m.group(2)


def chuan_url(url: str) -> str:
    """Mã hoá link có chữ có dấu (vd. tiếng Việt) để urllib mở được.

    urllib chỉ nhận link toàn chữ ASCII: link như .../Hướng-dẫn.pdf sẽ báo
    UnicodeEncodeError và bị coi là hỏng dù trang vẫn sống. Tên miền có dấu
    đổi sang dạng IDNA, đường dẫn và tham số mã hoá %; ký tự đã mã hoá sẵn
    (%xx) và ký tự đặc biệt của URL giữ nguyên.
    """
    url = url.strip()
    if url.isascii():
        return url
    p = urllib.parse.urlsplit(url)
    host = p.hostname or ""
    try:
        host = host.encode("idna").decode("ascii")
    except UnicodeError:
        pass
    netloc = host
    if p.port:
        netloc += f":{p.port}"
    if p.username:
        netloc = urllib.parse.quote(p.username) + (":" + urllib.parse.quote(p.password) if p.password else "") + "@" + netloc
    giu = "/%:@!$&'()*+,;=-._~"
    return urllib.parse.urlunsplit((
        p.scheme,
        netloc,
        urllib.parse.quote(p.path, safe=giu),
        urllib.parse.quote(p.query, safe=giu + "?"),
        urllib.parse.quote(p.fragment, safe=giu + "?"),
    ))


def mo_thu(url: str) -> tuple[bool, str]:
    """Trả về (mở được không, mô tả). Thử HEAD trước, lỗi thì thử GET."""
    url = chuan_url(url)
    loi_cuoi = ""
    for method in ("HEAD", "GET"):
        req = urllib.request.Request(url, method=method, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
                if res.status < 400:
                    return True, str(res.status)
                loi_cuoi = str(res.status)
        except urllib.error.HTTPError as e:
            loi_cuoi = str(e.code)
            # Nhiều trang chặn HEAD (405, 403): thử lại bằng GET
            continue
        except urllib.error.URLError as e:
            loi_cuoi = f"ket-noi:{type(e.reason).__name__}"
        except Exception as e:  # hết giờ, lỗi SSL...
            loi_cuoi = type(e).__name__
    return False, loi_cuoi


def kiem(file: Path, chi_xem: bool) -> int:
    dong = file.read_text(encoding="utf-8").splitlines()
    cot_link = cot_ngay = cot_ma = None
    hom_nay = dt.date.today().isoformat()
    tong = loi = 0

    for i, d in enumerate(dong):
        if not d.strip().startswith("|"):
            continue
        o = tach_o(d)
        if cot_link is None:
            if "Link" in o and "Ngày kiểm" in o:
                cot_link, cot_ngay = o.index("Link"), o.index("Ngày kiểm")
                cot_ma = o.index("Mã") if "Mã" in o else None
            continue
        if all(set(x) <= set("-: ") for x in o):  # dòng kẻ |---|
            continue
        if len(o) <= max(cot_link, cot_ngay):
            print(f"  Bỏ qua dòng {i + 1}: thiếu cột")
            continue
        url = lay_url(o[cot_link])
        ma = o[cot_ma] if cot_ma is not None else f"dòng {i + 1}"
        if not url:
            print(f"  {ma}: không có link")
            continue
        tong += 1
        duoc, mo_ta = mo_thu(url)
        if duoc:
            o[cot_ngay] = hom_nay
            print(f"  {ma}: mở được ({mo_ta})  {url}")
        else:
            loi += 1
            o[cot_ngay] = f"LOI {mo_ta}"
            print(f"  {ma}: KHÔNG mở được ({mo_ta})  {url}")
        dong[i] = ghep_o(o)

    if cot_link is None:
        print("Không thấy bảng có cột 'Link' và 'Ngày kiểm'.")
        return 2

    print(f"\nĐã kiểm {tong} link: {tong - loi} mở được, {loi} lỗi.")
    if not chi_xem and tong:
        file.write_text("\n".join(dong) + "\n", encoding="utf-8")
        print(f"Đã ghi ngày kiểm vào {file}")
    return 1 if loi else 0


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description="Kiểm link trong bảng nguồn")
    p.add_argument("file", type=Path)
    p.add_argument("--chi-xem", action="store_true", help="chỉ in kết quả, không sửa file")
    a = p.parse_args()
    if not a.file.exists():
        print(f"Không thấy file {a.file}")
        sys.exit(2)
    sys.exit(kiem(a.file, a.chi_xem))


if __name__ == "__main__":
    main()
