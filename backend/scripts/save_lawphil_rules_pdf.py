#!/usr/bin/env python3
"""Save LawPhil Rules of Criminal Procedure (Rules 110-127) as PDFs."""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path
import sys

try:
    from playwright.async_api import async_playwright
except ModuleNotFoundError:
    print(
        "Missing dependency: playwright\n"
        "Install it with:\n"
        "  pip install playwright\n"
        "  playwright install chromium",
        file=sys.stderr,
    )
    sys.exit(1)


BASE_URL = "https://lawphil.net/courts/rules/rc_110-127_crim.html"


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    default_output_dir = script_dir.parent / "data"

    parser = argparse.ArgumentParser(
        description="Download LawPhil Rule pages (110-127) and save each as a PDF."
    )
    parser.add_argument("--start", type=int, default=110, help="Start rule number.")
    parser.add_argument("--end", type=int, default=127, help="End rule number.")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=default_output_dir,
        help=f"Output directory for PDFs (default: {default_output_dir})",
    )
    parser.add_argument(
        "--timeout-ms",
        type=int,
        default=60000,
        help="Page load timeout in milliseconds (default: 60000).",
    )
    return parser.parse_args()


async def save_rule_pdfs(
    start_rule: int,
    end_rule: int,
    output_dir: Path,
    timeout_ms: int,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()

        try:
            for rule in range(start_rule, end_rule + 1):
                url = f"{BASE_URL}#{rule}"
                output_file = output_dir / f"lawphil_rule_{rule}.pdf"
                print(f"[{rule}] Loading {url}")

                page = await context.new_page()
                try:
                    await page.goto(url, wait_until="networkidle", timeout=timeout_ms)
                    await page.emulate_media(media="screen")
                    await page.pdf(
                        path=str(output_file),
                        format="A4",
                        print_background=True,
                        margin={
                            "top": "0.5in",
                            "right": "0.5in",
                            "bottom": "0.5in",
                            "left": "0.5in",
                        },
                    )
                    print(f"[{rule}] Saved {output_file}")
                except Exception as exc:  # noqa: BLE001
                    print(f"[{rule}] Failed: {exc}", file=sys.stderr)
                finally:
                    await page.close()
        finally:
            await context.close()
            await browser.close()


def main() -> None:
    args = parse_args()
    if args.start > args.end:
        raise SystemExit("--start must be less than or equal to --end.")

    asyncio.run(
        save_rule_pdfs(
            start_rule=args.start,
            end_rule=args.end,
            output_dir=args.output_dir,
            timeout_ms=args.timeout_ms,
        )
    )


if __name__ == "__main__":
    main()
