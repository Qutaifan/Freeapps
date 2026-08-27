import os
import sys
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REVIEWS_DIR = os.path.join(ROOT_DIR, 'reviews')

def get_existing_review_slugs():
    slugs = set()
    if os.path.exists(REVIEWS_DIR):
        for f in os.listdir(REVIEWS_DIR):
            if f.endswith('.html'):
                slugs.add(f[:-5])
    return slugs

def audit_and_fix(apply_changes=False):
    existing_slugs = get_existing_review_slugs()
    
    html_files = []
    for r, d, files in os.walk(ROOT_DIR):
        if any(x in r for x in ['node_modules', '.git', '_next', 'MY-NOTES']):
            continue
        for f in files:
            if f.endswith('.html'):
                html_files.append(os.path.join(r, f))

    total_files_scanned = len(html_files)
    links_fixed = 0
    modified_files = 0

    print(f"[AUDIT] Inspecting {total_files_scanned} HTML files for broken internal review links...")
    
    pattern = re.compile(r'href=["\'](/reviews/([^"\'\?\#]+))["\']')

    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        file_fixes = 0

        def replace_link(match):
            nonlocal file_fixes
            full_href = match.group(1)
            slug = match.group(2).strip('/')
            if slug not in existing_slugs:
                file_fixes += 1
                # Replace broken /reviews/slug link with /#slug anchor on index page
                return f'href="/#{slug}"'
            return match.group(0)

        new_content = pattern.sub(replace_link, content)

        if file_fixes > 0:
            rel_path = os.path.relpath(file_path, ROOT_DIR)
            print(f"  [{rel_path}]: Replaced {file_fixes} non-existent review link(s) with section anchors")
            links_fixed += file_fixes
            modified_files += 1
            if apply_changes:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)

    print("\n--- Internal Link Audit Summary ---")
    print(f"- Mode: {'APPLIED (Files Updated)' if apply_changes else 'DRY RUN (Preview Only)'}")
    print(f"- Total Files Scanned: {total_files_scanned}")
    print(f"- Files With Broken Review Links: {modified_files}")
    print(f"- Total Broken Links Fixed: {links_fixed}")

    if not apply_changes and links_fixed > 0:
        print("\nRun with --apply to commit link repairs.")
        sys.exit(1)
    else:
        print("\n[OK] All internal review links verified & clean!")

if __name__ == '__main__':
    apply = '--apply' in sys.argv
    audit_and_fix(apply_changes=apply)
