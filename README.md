# Word Simplifier (Chrome/Edge Extension)

A minimal, side-panel based browser extension that simplifies difficult English words from web pages and native PDFs using Google's Gemini AI. 

Built with Manifest V3 and a clean shadcn/ui inspired aesthetic.

## Features
- **Instant Simplification:** Highlight any text and get a CEFR A2 basic definition, example sentence, and Indonesian translation.
- **Native PDF Support:** Works inside Edge's built-in PDF viewer using the Context Menu.
- **Text-to-Speech:** Pronounce words with a single click.
- **Save Words:** Bookmark new vocabulary and export them to a CSV file.
- **Custom API Key:** Bring your own Gemini API Key with an easy-to-use Settings menu.

## How to Install (Developer Mode)

1. Download or clone this repository to your computer.
2. Open your Chromium-based browser (Edge, Chrome, Brave, etc.).
3. Go to the Extensions page:
   - Edge: `edge://extensions/`
   - Chrome: `chrome://extensions/`
4. Enable **Developer Mode** (usually a toggle in the top right corner).
5. Click **Load unpacked** and select the folder containing this extension's files.
6. The extension is now installed! 
7. *(Crucial for local PDFs)* Find the extension in the list, click **Details**, and enable **Allow access to file URLs**.

## How to Get a Free Gemini API Key

This extension relies on the Gemini API. You can get a free key easily:
1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google Account.
3. Click **Create API Key**.
4. Create a key in a new project and copy the generated key.

## Setting Up the Extension

1. Click the **Word Simplifier** icon in your browser toolbar to open the Side Panel.
2. Click the ⚙️ (Gear) icon in the top right corner of the panel to open **Settings**.
3. Paste your Gemini API Key into the input field.
4. Click **Save Key**. You can also click **Test** to ensure your key is valid.

## How to Use

### On Regular Websites
Simply highlight (select) any word or short phrase on a web page. The Side Panel will automatically detect it and show the simplification.

### On Native PDFs (e.g., local PDF files)
Because browsers heavily isolate native PDF viewers, automatic highlight detection might be blocked. 
1. Highlight the word in the PDF.
2. **Right-click** the highlighted word.
3. Select **Simplify "your word"** from the context menu.
4. The Side Panel will open (if closed) and process your word.
