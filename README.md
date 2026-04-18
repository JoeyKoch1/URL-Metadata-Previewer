# URL Metadata Previewer

A clean, professional tool for previewing URL metadata and extracting image information. Built with vanilla JavaScript for GitHub Pages hosting.

## Features

- **URL Metadata Extraction**: Paste any URL to fetch its title, description, and preview image
- **Drag & Drop Images**: Drop images to extract file metadata (size, dimensions, type)
- **Clean Black/White Design**: Minimalist dark theme
- **GitHub Pages Ready**: Static site, no build step required

## Usage

### URL Preview
1. Paste a URL in the input field
2. Click "Preview" or press Enter
3. View the extracted metadata

### Image Metadata
1. Drag and drop an image onto the drop zone
2. Or click to browse and select an image
3. View file details and dimensions

## Hosting on GitHub Pages

1. Push this folder to a GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main`
4. Your site will be live at `https://yourusername.github.io/repo-name`

## Technical Details

- Uses [AllOrigins](https://allorigins.win/) CORS proxy for fetching URL metadata
- Parses Open Graph and standard meta tags
- Client-side image processing with FileReader API
- Responsive design for all screen sizes

## License

MIT
