"""Convert img tags to picture elements with WebP sources."""
import re
import os
import glob

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Fix broken reference
broken_fix = {
    "images/white-raised-panel-pair-driveway.jpg": "images/white-raised-panel-stone-facade.jpg"
}


def wrap_img_with_picture(match):
    full_tag = match.group(0)

    # Fix broken references
    for old, new in broken_fix.items():
        full_tag = full_tag.replace(old, new)

    # Extract src
    src_match = re.search(r'src="(images/[^"]+)"', full_tag)
    if not src_match:
        return full_tag

    src = src_match.group(1)

    # Only wrap jpg and png
    ext = os.path.splitext(src)[1].lower()
    if ext not in (".jpg", ".jpeg", ".png"):
        return full_tag

    # Generate webp path
    webp_src = os.path.splitext(src)[0] + ".webp"

    # Check if webp file exists
    webp_path = os.path.join(root, webp_src)
    if not os.path.exists(webp_path):
        print(f"  SKIP (no webp): {src}")
        return full_tag

    return f'<picture><source srcset="{webp_src}" type="image/webp">{full_tag}</picture>'


html_files = glob.glob(os.path.join(root, "*.html"))
total_replaced = 0

for html_file in sorted(html_files):
    with open(html_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find <img> tags with jpg/png src in images/ that are NOT already inside <picture>
    pattern = r'(?<!<picture>)(<img[^>]*src="images/[^"]*\.(?:jpg|jpeg|png)"[^>]*>)'

    new_content = re.sub(pattern, wrap_img_with_picture, content)

    if new_content != content:
        count = new_content.count("<picture>") - content.count("<picture>")
        total_replaced += count
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"{os.path.basename(html_file)}: {count} images wrapped")
    else:
        print(f"{os.path.basename(html_file)}: no changes")

print(f"\nTotal: {total_replaced} images wrapped in <picture> elements")
