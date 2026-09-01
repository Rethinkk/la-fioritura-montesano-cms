# La Fioritura di Montesano

Static CMS version of the Framer reference site.

## Run locally

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173/` for the website and `http://localhost:4173/admin.html` for the CMS editor.

The public site reads from `cms/content.json`. The CMS saves preview edits to browser storage and can export an updated `content.json`.
