const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const urlError = document.getElementById('urlError');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const previewTitle = document.getElementById('previewTitle');
const previewDescription = document.getElementById('previewDescription');
const previewUrl = document.getElementById('previewUrl');
const imageMetaSection = document.getElementById('imageMetaSection');
const metaGrid = document.getElementById('metaGrid');
const rawSection = document.getElementById('rawSection');
const rawData = document.getElementById('rawData');

fetchBtn.addEventListener('click', fetchMetadata);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchMetadata();
});

async function fetchMetadata() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    if (!isValidUrl(url)) {
        showError('Please enter a valid URL');
        return;
    }
    
    hideError();
    fetchBtn.textContent = 'Loading...';
    fetchBtn.disabled = true;
    
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch URL');
        }
        
        const data = await response.json();
        const html = data.contents;
        
        const metadata = parseMetadata(html, url);
        displayPreview(metadata);
        
    } catch (error) {
        showError('Could not fetch metadata. The site may block external requests.');
        console.error(error);
    } finally {
        fetchBtn.textContent = 'Preview';
        fetchBtn.disabled = false;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function parseMetadata(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const getMeta = (property) => {
        const elem = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
        return elem ? elem.getAttribute('content') : null;
    };
    
    const title = getMeta('og:title') || doc.title || 'No title found';
    const description = getMeta('og:description') || getMeta('description') || 'No description found';
    const image = getMeta('og:image') || getMeta('twitter:image') || null;
    const siteName = getMeta('og:site_name') || null;
    
    let resolvedImage = image;
    if (image && !image.startsWith('http')) {
        try {
            resolvedImage = new URL(image, url).href;
        } catch (_) {
            resolvedImage = null;
        }
    }
    
    return {
        title,
        description,
        image: resolvedImage,
        siteName,
        url
    };
}

function displayPreview(metadata) {
    previewTitle.textContent = metadata.title;
    previewDescription.textContent = metadata.description;
    previewUrl.textContent = metadata.url;
    previewUrl.href = metadata.url;
    
    if (metadata.image) {
        previewImage.innerHTML = `<img src="${metadata.image}" alt="Preview" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'no-image\\'>No image available</span>'">`;
    } else {
        previewImage.innerHTML = '<span class="no-image">No image available</span>';
    }
    
    previewSection.classList.remove('hidden');
    
    rawData.textContent = JSON.stringify(metadata, null, 2);
    rawSection.classList.remove('hidden');
    
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    urlError.textContent = message;
    urlError.classList.remove('hidden');
}

function hideError() {
    urlError.classList.add('hidden');
}

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageFile(e.target.files[0]);
    }
});

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please upload an image file');
        return;
    }
    
    hideError();
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const imageUrl = e.target.result;
        
        previewTitle.textContent = file.name;
        previewDescription.textContent = `Size: ${formatFileSize(file.size)} | Type: ${file.type}`;
        previewUrl.textContent = 'Local file';
        previewUrl.href = '#';
        previewImage.innerHTML = `<img src="${imageUrl}" alt="${file.name}">`;
        previewSection.classList.remove('hidden');
        
        extractImageMetadata(file, imageUrl);
    };
    
    reader.readAsDataURL(file);
}

function extractImageMetadata(file, imageUrl) {
    const metadata = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        lastModified: new Date(file.lastModified).toLocaleString()
    };
    
    const img = new Image();
    img.onload = () => {
        metadata.width = img.naturalWidth;
        metadata.height = img.naturalHeight;
        metadata.aspectRatio = (img.naturalWidth / img.naturalHeight).toFixed(2);
        
        displayImageMetadata(metadata);
        
        rawData.textContent = JSON.stringify(metadata, null, 2);
        rawSection.classList.remove('hidden');
    };
    img.src = imageUrl;
}

function displayImageMetadata(metadata) {
    metaGrid.innerHTML = '';
    
    const entries = Object.entries(metadata);
    
    entries.forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'meta-item';
        item.innerHTML = `
            <label>${formatLabel(key)}</label>
            <value>${value}</value>
        `;
        metaGrid.appendChild(item);
    });
    
    imageMetaSection.classList.remove('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}
