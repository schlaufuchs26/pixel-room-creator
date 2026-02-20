// Pixel Room Creator - Main Game Logic
const canvas = document.getElementById('roomCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const clearBtn = document.getElementById('clear')!;
const saveBtn = document.getElementById('save')!;
const loadBtn = document.getElementById('load')!;
const colorOptions = document.querySelectorAll('.color-option');

// Grid settings
const GRID_SIZE = 16;
const CELL_SIZE = 32;

// Current state
let currentColor = '#FFFFFF';
let isDrawing = false;
let roomData: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'));

// Initialize canvas
function initCanvas() {
    canvas.width = GRID_SIZE * CELL_SIZE;
    canvas.height = GRID_SIZE * CELL_SIZE;
    drawGrid();
}

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            ctx.fillStyle = roomData[y][x];
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = '#ddd';
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

// Handle drawing
function startDrawing(e: MouseEvent) {
    isDrawing = true;
    drawPixel(e);
}

function drawPixel(e: MouseEvent) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        roomData[y][x] = currentColor;
        drawGrid();
    }
}

function stopDrawing() {
    isDrawing = false;
}

// Color selection
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        currentColor = option.getAttribute('data-color')!;
    });
});

// Clear canvas
clearBtn.addEventListener('click', () => {
    roomData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'));
    drawGrid();
});

// Save room
saveBtn.addEventListener('click', () => {
    const data = JSON.stringify(roomData);
    localStorage.setItem('pixelRoom', data);
    alert('Room saved!');
});

// Load room
loadBtn.addEventListener('click', () => {
    const data = localStorage.getItem('pixelRoom');
    if (data) {
        roomData = JSON.parse(data);
        drawGrid();
        alert('Room loaded!');
    } else {
        alert('No saved room found!');
    }
});

// Share room via URL
function updateUrlHash() {
    const compressed = compressRoomData(roomData);
    window.location.hash = compressed;
}

function compressRoomData(data: string[][]): string {
    // Simple compression: convert to base64
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
}

function decompressRoomData(compressed: string): string[][] {
    try {
        const json = decodeURIComponent(atob(compressed));
        return JSON.parse(json);
    } catch (e) {
        console.error('Failed to decompress room data:', e);
        return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#FFFFFF'));
    }
}

// Check URL hash on load
window.addEventListener('load', () => {
    if (window.location.hash) {
        const hash = window.location.hash.substring(1); // Remove #
        roomData = decompressRoomData(hash);
        drawGrid();
    }
});

// Share button event listener
const shareBtn = document.getElementById('share') as HTMLButtonElement;
shareBtn.addEventListener('click', () => {
    updateUrlHash();
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'Pixel Room Creator',
            text: 'Check out my pixel room!',
            url: url
        }).catch(() => {
            // Fallback to copy if share fails
            copyToClipboard(url);
        });
    } else {
        copyToClipboard(url);
    }
});

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Room URL copied to clipboard! Share it with friends.');
    }).catch(() => {
        alert('Could not copy to clipboard. URL is in your address bar.');
    });
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawPixel);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Initialize
initCanvas();