from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173/old-home')
    page.wait_for_selector('button', timeout=5000)

    # Focus the first button that has text
    page.evaluate('''() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.innerText.includes('SE CONNECTER')) {
                btn.focus();
                break;
            }
        }
    }''')

    page.screenshot(path='/home/jules/verification/button_focused.png', full_page=True)
    browser.close()
