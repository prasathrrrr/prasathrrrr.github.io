Photo Hero — small static template

What this is
- A minimal static website template that displays a 16:9 photo as a full-bleed hero and an animated, large, aesthetic title over it.

Files added
- `index.html` — main page
- `css/styles.css` — styles and animations
- `js/script.js` — small script to set the title and replay animation
- `assets/` — folder where you should put your 16:9 photo named `photo.jpg`

How to use
1. Put your 16:9 photo in `assets/photo.jpg`. The image should be at least 1920x1080 for good quality.
3. (Optional) Add a second hero image for the second photo page at `assets/photo2.jpg` — this will be used on the second full-screen photo that contains the "I Travel" CTA linking to `travel.html`.
4. (Optional) Add a middle hero image at `assets/photo_mid.jpg` if you want a photo between the two hero pages.
2. Open `index.html` in a browser, or run a simple local server (recommended) to avoid font CORS issues.

Contact form setup
- The template includes a contact form that posts to a form handling endpoint (Formspree, Netlify Forms, or a custom server). To receive messages without exposing your email, create a Formspree form and copy its endpoint.
- Paste the Formspree endpoint into the `data-endpoint` attribute on the `<form id="contact-form">` element in `index.html`. It should look like `https://formspree.io/f/your-id`.
- The form sends two fields: `from_email` and `message`. The script will POST the form and show a success or error message.

If you don't want to use Formspree, alternatives:
- EmailJS (client-side email sending) — requires you to sign up and add your public keys in `js/script.js`.
- Build a tiny serverless function (Netlify Functions, Vercel Serverless) that relays the message to your email.

Preview locally (PowerShell, Windows):

# from inside the website folder
# If you have Python installed (recommended):
python -m http.server 8000; Start-Process "http://localhost:8000"

# Or using PowerShell's built-in static file preview (less ideal for fonts):
# Right-click index.html in Explorer and open with your browser.

Changing the title quickly
- You can change the big title via a URL parameter: `index.html?title=My%20Name` — the script will apply it.
- Or edit the `<text>` content inside `index.html` and replace `YOUR TITLE`.

Fonts and styling
- Uses Google Fonts (Playfair Display for the title and Montserrat for nav).
- The large title is an SVG text element with a stroke-draw animation.

Next steps / ideas
- Replace SVG text with an SVG path traced from a brush font for even grungier look.
- Add a small admin panel to upload photos and set title text.
- Add mobile-specific crop controls.

Travel gallery setup

- Place each city's images in:
	- `assets/travel/<slug>/image-1.jpg`
	- `assets/travel/<slug>/image-2.jpg`
	- ...
- Add a thumbnail at `assets/travel/<slug>/thumb.jpg`.
- Update `assets/travel/index.json` to add or edit entries. Example entry:

	{
		"slug": "paris",
		"title": "Paris",
		"thumb": "assets/travel/paris/thumb.jpg",
		"folder": "assets/travel/paris"
	}

- Open `travel.html` to see clickable city thumbnails. Click a city to open `travel_gallery.html?city=<slug>` which will show images as full-bleed 16:9 slides.

Notes:
- The gallery page currently looks for images named `image-1.jpg`, `image-2.jpg`, etc. If you'd prefer a manifest per city listing filenames, I can add support for that.

Enjoy — drop your photo into `assets/photo.jpg` and refresh the page.