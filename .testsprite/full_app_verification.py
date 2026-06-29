import asyncio
import re
from playwright import async_api
from playwright.async_api import expect


BASE_URL = "https://atrium3d.netlify.app"
DEFAULT_TIMEOUT = 15000


async def text_of(page, test_id):
    return (await page.get_by_test_id(test_id).inner_text()).strip()


async def expect_test_id_text(page, test_id, expected):
    await expect(page.get_by_test_id(test_id)).to_have_text(str(expected), timeout=DEFAULT_TIMEOUT)


async def click_test_id(page, test_id):
    locator = page.locator(f'[data-testid="{test_id}"]').first
    await locator.wait_for(state="attached", timeout=DEFAULT_TIMEOUT)
    await locator.evaluate("(el) => el.click()")


async def wait_for_app(page):
    await expect_test_id_text(page, "debug-app-loaded", "true")
    await expect_test_id_text(page, "debug-route", "/app")
    await page.wait_for_selector("canvas", timeout=DEFAULT_TIMEOUT)
    await expect_test_id_text(page, "debug-canvas-mounted", "true")


async def run_test():
    pw = None
    browser = None
    context = None

    try:
        pw = await async_api.async_playwright().start()
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process",
            ],
        )
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        context.set_default_timeout(DEFAULT_TIMEOUT)
        page = await context.new_page()

        await page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        await expect(page.get_by_test_id("open-atrium-button")).to_be_visible(timeout=DEFAULT_TIMEOUT)
        landing_text = await page.locator("body").inner_text()
        assert "Atrium 3D" in landing_text
        assert "Saray" not in landing_text

        await page.goto(f"{BASE_URL}/app?testMode=false", wait_until="domcontentloaded")
        await expect(page.locator("#testmode-debug-panel")).to_have_count(0, timeout=DEFAULT_TIMEOUT)
        await expect(page.locator('[data-testid="test-reset-state-helper"]')).to_have_count(0, timeout=DEFAULT_TIMEOUT)

        await page.goto(f"{BASE_URL}/not-a-real-route", wait_until="domcontentloaded")
        await expect(page.locator("body")).not_to_contain_text("Page not found", timeout=DEFAULT_TIMEOUT)

        await page.goto(f"{BASE_URL}/?testMode=true", wait_until="domcontentloaded")
        await click_test_id(page, "open-atrium-button")
        await expect(page).to_have_url(re.compile(r"/app\?testMode=true"), timeout=DEFAULT_TIMEOUT)
        await wait_for_app(page)
        await expect_test_id_text(page, "debug-language", "tr")
        await expect_test_id_text(page, "debug-ui-theme", "dark")

        await click_test_id(page, "test-reset-state-helper")
        await expect_test_id_text(page, "debug-last-action", "test-reset")
        await expect_test_id_text(page, "debug-notes-count", "0")
        await expect_test_id_text(page, "debug-items-count", "0")
        await expect_test_id_text(page, "debug-links-count", "0")
        await expect_test_id_text(page, "debug-books-count", "0")

        await click_test_id(page, "test-add-all-items-helper")
        await expect_test_id_text(page, "debug-items-count", "31")
        item_types = await text_of(page, "debug-item-types")
        for expected_type in ["desk", "chair", "libraryShelf", "largeLibraryShelf", "board", "lamp", "rug", "pc", "box", "plant", "large_plant"]:
            assert expected_type in item_types
        await expect_test_id_text(page, "debug-last-action", "items-batch-added")

        await click_test_id(page, "test-reset-state-helper")
        await expect_test_id_text(page, "debug-last-action", "test-reset")

        await click_test_id(page, "test-add-note-helper")
        await expect(page.locator(".editor-modal.open")).to_be_visible(timeout=DEFAULT_TIMEOUT)
        await page.locator(".editor-textarea").fill("Codex wall note deterministic suite text.")
        await click_test_id(page, "test-upload-image-helper")
        await click_test_id(page, "save-note-button")
        await expect_test_id_text(page, "debug-notes-count", "1")
        await expect_test_id_text(page, "debug-last-action", "note-created")

        await click_test_id(page, "add-item-button")
        await click_test_id(page, "item-card-desk")
        await expect_test_id_text(page, "debug-items-count", "1")
        await expect_test_id_text(page, "debug-last-action", "item-added")

        await click_test_id(page, "item-add-note-button")
        await expect(page.locator(".editor-modal.open")).to_be_visible(timeout=DEFAULT_TIMEOUT)
        await page.get_by_test_id("item-note-title-input").fill("Codex Desk Note")
        await page.locator(".editor-textarea").fill("Codex item note attached to the desk.")
        await click_test_id(page, "save-note-button")
        await expect_test_id_text(page, "debug-last-action", "note-created")

        await click_test_id(page, "add-item-button")
        await click_test_id(page, "item-card-libraryShelf")
        await expect_test_id_text(page, "debug-items-count", "2")
        await click_test_id(page, "item-add-book-button")
        await expect(page.locator(".editor-modal.open")).to_be_visible(timeout=DEFAULT_TIMEOUT)
        await page.get_by_test_id("book-spine-input").fill("CodexBook")
        await click_test_id(page, "book-save-button")
        await expect_test_id_text(page, "debug-books-count", "1")
        await expect_test_id_text(page, "debug-last-action", "book-added")

        await click_test_id(page, "test-create-link-helper")
        await expect_test_id_text(page, "debug-links-count", "1")
        await expect_test_id_text(page, "debug-last-action", "link-created")

        await click_test_id(page, "dashboard-button")
        await expect(page.locator(".dashboard-window")).to_be_visible(timeout=DEFAULT_TIMEOUT)
        await page.get_by_test_id("dashboard-search-input").fill("Codex")
        await expect(page.locator("body")).to_contain_text("Codex Desk Note", timeout=DEFAULT_TIMEOUT)
        await click_test_id(page, "dash-tab-study")
        await click_test_id(page, "study-select-all-button")
        await click_test_id(page, "study-start-session-button")
        await expect_test_id_text(page, "debug-study-mode-active", "true")
        await click_test_id(page, "study-hud-exit-button")
        await expect_test_id_text(page, "debug-study-mode-active", "false")

        await page.reload(wait_until="domcontentloaded")
        await wait_for_app(page)
        await expect_test_id_text(page, "debug-notes-count", "1")
        await expect_test_id_text(page, "debug-items-count", "2")
        await expect_test_id_text(page, "debug-books-count", "1")
        await expect_test_id_text(page, "debug-links-count", "1")

        await click_test_id(page, "settings-button")
        await click_test_id(page, "tab-backup")
        await click_test_id(page, "export-backup-button")
        await expect_test_id_text(page, "debug-last-action", "backup-exported")
        await asyncio.sleep(1)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()


asyncio.run(run_test())
