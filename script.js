class Puzzle15 {
    constructor() {
        this.board = [];
        this.emptyIndex = 15;
        this.moveCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isPlaying = false;
        this.imageUrl = null;
        this.imagePieces = [];
        this.savedBoardState = null;
        this.isShowingHint = false;
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        // Initialize board with numbers (0-14, 15 as empty)
        this.board = [];
        for (let i = 0; i < 15; i++) {
            this.board.push(i);
        }
        this.board.push(15); // Empty space
        this.updateDisplay();
        // Load a random flower image
        this.loadRandomFlowerImage();
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.index = i;
            
            if (i === 15) {
                tile.classList.add('empty');
            }
            
            tile.addEventListener('click', () => this.handleTileClick(i));
            gameBoard.appendChild(tile);
        }
    }

    setupEventListeners() {
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.loadRandomFlowerImage();
        });
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            document.getElementById('winMessage').classList.add('hidden');
            this.loadRandomFlowerImage();
        });
        
        // Hint button - show solved state on press, restore on release
        const hintBtn = document.getElementById('hintBtn');
        hintBtn.addEventListener('mousedown', () => {
            this.showHint();
        });
        hintBtn.addEventListener('mouseup', () => {
            this.hideHint();
        });
        hintBtn.addEventListener('mouseleave', () => {
            this.hideHint();
        });
        
        // Touch events for mobile
        hintBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.showHint();
        });
        hintBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.hideHint();
        });
    }

    async loadRandomFlowerImage() {
        // GitHub repository configuration
        const repoOwner = 'chronoco-de7';
        const repoName = 'puzzle-images';
        const branch = 'main';
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents`;
        const rawBaseUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/`;
        
        // Image file extensions to filter
        const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp'];
        
        try {
            // Fetch repository contents from GitHub API
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch repository contents: ${response.status}`);
            }
            
            const files = await response.json();
            
            // Filter for image files only (exclude directories and non-image files)
            const imageFiles = files
                .filter(file => file.type === 'file' && imageExtensions.some(ext => 
                    file.name.toLowerCase().endsWith(ext)
                ))
                .map(file => rawBaseUrl + file.name);
            
            if (imageFiles.length === 0) {
                throw new Error('No image files found in repository');
            }
            
            // Pick a random image from the list
            const randomIndex = Math.floor(Math.random() * imageFiles.length);
            let imageUrl = imageFiles[randomIndex];
            
            // Add cache-busting parameter to ensure fresh load
            const cacheBuster = `?t=${Date.now()}`;
            imageUrl = imageUrl.includes('?') ? imageUrl + '&t=' + Date.now() : imageUrl + cacheBuster;
            
            this.loadImage(imageUrl);
        } catch (error) {
            console.error('Error fetching images from GitHub:', error);
            // Fallback to template image if GitHub fetch fails
            this.loadImage('template.png');
        }
    }

    showLoadingStatus() {
        const loadingStatus = document.getElementById('loadingStatus');
        if (loadingStatus) {
            loadingStatus.classList.remove('hidden');
        }
    }

    hideLoadingStatus() {
        const loadingStatus = document.getElementById('loadingStatus');
        if (loadingStatus) {
            loadingStatus.classList.add('hidden');
        }
    }

    loadImage(imageUrl) {
        // Stop any current game
        this.stopTimer();
        this.isPlaying = false;
        
        // Clear image pieces so numbers are shown while loading
        this.imagePieces = [];
        this.updateDisplay();
        
        // Show loading status
        this.showLoadingStatus();
        
        this.imageUrl = imageUrl;
        const img = new Image();
        let imageLoaded = false;
        
        const handleSuccess = () => {
            if (!imageLoaded) {
                imageLoaded = true;
                this.hideLoadingStatus();
                this.splitImage(img);
                this.shuffle();
            }
        };
        
        const handleError = () => {
            if (imageLoaded) return;
            
            // If CORS fails, try without crossOrigin
            if (img.crossOrigin) {
                const img2 = new Image();
                img2.onload = () => {
                    if (!imageLoaded) {
                        imageLoaded = true;
                        this.hideLoadingStatus();
                        this.splitImage(img2);
                        this.shuffle();
                    }
                };
                img2.onerror = () => {
                    // Fallback to default image if random image fails
                    console.warn('Failed to load image, using fallback');
                    this.loadImage('template.png');
                };
                img2.src = imageUrl;
            } else {
                // Fallback to default image if random image fails
                console.warn('Failed to load image, using fallback');
                this.loadImage('template.png');
            }
        };
        
        // Set up timeout
        const loadTimeout = setTimeout(() => {
            if (!imageLoaded) {
                console.warn('Image load timeout, trying fallback');
                handleError();
            }
        }, 10000); // 10 second timeout
        
        // Handle CORS - try to load with crossOrigin
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            clearTimeout(loadTimeout);
            handleSuccess();
        };
        img.onerror = () => {
            clearTimeout(loadTimeout);
            handleError();
        };
        
        // Set src after handlers are attached
        img.src = imageUrl;
        
        // Check if image loaded immediately (cached)
        if (img.complete && img.naturalWidth > 0) {
            clearTimeout(loadTimeout);
            handleSuccess();
        }
    }

    showHint() {
        if (!this.isPlaying || this.isShowingHint || !this.imagePieces.length) {
            return;
        }
        
        // Save current board state
        this.savedBoardState = [...this.board];
        this.isShowingHint = true;
        
        // Create solved state (0-14 in order, 15 as empty)
        this.board = [];
        for (let i = 0; i < 15; i++) {
            this.board.push(i);
        }
        this.board.push(15); // Empty space at the end
        
        this.updateDisplay();
    }

    hideHint() {
        if (!this.isShowingHint || !this.savedBoardState) {
            return;
        }
        
        // Restore saved board state
        this.board = [...this.savedBoardState];
        this.savedBoardState = null;
        this.isShowingHint = false;
        
        this.updateDisplay();
    }

    splitImage(img) {
        this.imagePieces = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const pieceWidth = img.width / 4;
        const pieceHeight = img.height / 4;
        
        canvas.width = pieceWidth;
        canvas.height = pieceHeight;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                ctx.clearRect(0, 0, pieceWidth, pieceHeight);
                ctx.drawImage(
                    img,
                    col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight,
                    0, 0, pieceWidth, pieceHeight
                );
                this.imagePieces.push(canvas.toDataURL());
            }
        }
    }

    shuffle() {
        if (!this.imageUrl || this.imagePieces.length === 0) {
            return;
        }
        
        this.moveCount = 0;
        this.updateMoveCount();
        this.stopTimer();
        this.isPlaying = false;
        
        // Create solved state (0-14 for pieces, 15 for empty)
        this.board = [];
        for (let i = 0; i < 15; i++) {
            this.board.push(i);
        }
        this.board.push(15); // Empty space (index 15)
        
        // Perform random valid moves to shuffle
        const moves = 1000;
        for (let i = 0; i < moves; i++) {
            const emptyPos = this.board.indexOf(15);
            const possibleMoves = this.getPossibleMoves(emptyPos);
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.swapTiles(emptyPos, randomMove);
            }
        }
        
        this.emptyIndex = this.board.indexOf(15);
        this.updateDisplay();
        this.startTimer();
        this.isPlaying = true;
    }

    getPossibleMoves(emptyPos) {
        const moves = [];
        const row = Math.floor(emptyPos / 4);
        const col = emptyPos % 4;
        
        // Check up
        if (row > 0) moves.push(emptyPos - 4);
        // Check down
        if (row < 3) moves.push(emptyPos + 4);
        // Check left
        if (col > 0) moves.push(emptyPos - 1);
        // Check right
        if (col < 3) moves.push(emptyPos + 1);
        
        return moves;
    }

    swapTiles(pos1, pos2) {
        [this.board[pos1], this.board[pos2]] = [this.board[pos2], this.board[pos1]];
    }

    handleTileClick(index) {
        if (!this.isPlaying || this.isShowingHint) return;
        
        const emptyPos = this.board.indexOf(15);
        const possibleMoves = this.getPossibleMoves(emptyPos);
        
        if (possibleMoves.includes(index)) {
            const clickedTile = document.querySelectorAll('.tile')[index];
            clickedTile.classList.add('moving');
            
            this.swapTiles(emptyPos, index);
            this.emptyIndex = this.board.indexOf(15);
            this.moveCount++;
            this.updateMoveCount();
            this.updateDisplay();
            
            setTimeout(() => {
                clickedTile.classList.remove('moving');
            }, 300);
            
            this.checkWin();
        }
    }

    updateDisplay() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            const value = this.board[index];
            
            // Clear existing content
            tile.innerHTML = '';
            
            if (value === 15) {
                // Empty tile
                tile.classList.add('empty');
            } else {
                // Image piece tile
                tile.classList.remove('empty');
                
                // If images are loaded, show image piece
                if (this.imagePieces && this.imagePieces.length > 0 && this.imagePieces[value]) {
                    const img = document.createElement('img');
                    img.src = this.imagePieces[value];
                    img.className = 'tile-image';
                    img.draggable = false;
                    tile.appendChild(img);
                } else {
                    // Show number while loading
                    const number = document.createElement('div');
                    number.className = 'tile-number';
                    number.textContent = value + 1; // Display 1-15 instead of 0-14
                    tile.appendChild(number);
                }
            }
            
            // Update data attribute for smooth transitions
            tile.dataset.index = index;
        });
    }

    updateMoveCount() {
        document.getElementById('moveCount').textContent = this.moveCount;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('timer').textContent = '00:00';
    }

    checkWin() {
        let isWin = true;
        for (let i = 0; i < 15; i++) {
            if (this.board[i] !== i) {
                isWin = false;
                break;
            }
        }
        
        if (isWin && this.board[15] === 15) {
            this.stopTimer();
            this.isPlaying = false;
            this.showWinMessage();
        }
    }

    showWinMessage() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('winMoves').textContent = this.moveCount;
        document.getElementById('winTime').textContent = timeString;
        document.getElementById('winMessage').classList.remove('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Puzzle15();
});

