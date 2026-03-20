# System-Builder

A lightweight static prototype for a system selection experience that:

- keeps **Direct Replacement** front and center when the homeowner already has a current system selected and the ductwork is good or believed to be good,
- preserves a smaller secondary area for customers who may want to convert to a different type of system instead.

## Files

- `index.html` – the main system recommendation layout
- `styles.css` – presentation for the primary and secondary recommendation areas
- `script.js` – a simple state toggle that changes the recommendation when ductwork is no longer considered good

## Preview locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.
