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
        this.isNumberPuzzle = false;
        this.timerStarted = false;
        this.particleContainer = null;
        this.isLoading = false;
        this.timerPausedTime = null;
        this.timerElapsedBeforePause = 0;
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
        // Start a new game (randomly choose image or number puzzle)
        this.startNewGame();
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
            this.startNewGame();
        });
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            document.getElementById('winMessage').classList.add('hidden');
            this.startNewGame();
        });
        
        // Close button for win message
        const closeWinBtn = document.getElementById('closeWinBtn');
        if (closeWinBtn) {
            closeWinBtn.addEventListener('click', () => {
                document.getElementById('winMessage').classList.add('hidden');
            });
        }
        
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

    startNewGame() {
        // Reset game state
        this.timerStarted = false;
        this.stopTimer();
        this.moveCount = 0;
        this.updateMoveCount();
        this.isPlaying = false;
        
        // Hide win message
        document.getElementById('winMessage').classList.add('hidden');
        
        // Randomly decide: if random number is less than 1 (10%), use number puzzle
        // Otherwise use image puzzle
        const randomNum = Math.random();
        const gameBoard = document.getElementById('gameBoard');
        
        if (randomNum < 0.1) {
            // Use number puzzle (10% chance)
            this.isNumberPuzzle = true;
            this.imagePieces = [];
            this.imageUrl = null;
            gameBoard.classList.add('number-puzzle');
            
            // Show short loading screen
            this.showLoadingStatus();
            
            // Simulate short loading delay, then show puzzle with animation
            setTimeout(() => {
                this.hideLoadingStatus();
                this.shuffle();
                this.animatePuzzleAppearance();
            }, 800);
        } else {
            // Use image puzzle
            this.isNumberPuzzle = false;
            gameBoard.classList.remove('number-puzzle');
            this.loadRandomFlowerImage();
        }
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
        this.isLoading = true;
        const loadingStatus = document.getElementById('loadingStatus');
        if (loadingStatus) {
            loadingStatus.classList.remove('hidden');
        }
        // Clear display during loading
        this.updateDisplay();
    }

    hideLoadingStatus() {
        this.isLoading = false;
        const loadingStatus = document.getElementById('loadingStatus');
        if (loadingStatus) {
            loadingStatus.classList.add('hidden');
        }
    }

    loadImage(imageUrl, isRetry = false) {
        // Stop any current game
        this.stopTimer();
        this.isPlaying = false;
        
        // Clear image pieces
        this.imagePieces = [];
        
        // Show loading status (this will hide numbers)
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
                this.animatePuzzleAppearance();
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
                        this.animatePuzzleAppearance();
                    }
                };
                img2.onerror = () => {
                    if (!isRetry && imageUrl !== 'template.png') {
                        // Fallback to default image if random image fails
                        console.warn('Failed to load image, using fallback');
                        this.loadImage('template.png', true);
                    } else {
                        // Final fallback: switch to number puzzle
                        console.warn('All image loading failed, switching to number puzzle');
                        this.fallbackToNumberPuzzle();
                    }
                };
                img2.src = imageUrl;
            } else {
                if (!isRetry && imageUrl !== 'template.png') {
                    // Fallback to default image if random image fails
                    console.warn('Failed to load image, using fallback');
                    this.loadImage('template.png', true);
                } else {
                    // Final fallback: switch to number puzzle
                    console.warn('All image loading failed, switching to number puzzle');
                    this.fallbackToNumberPuzzle();
                }
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
    
    fallbackToNumberPuzzle() {
        // Switch to number puzzle mode as ultimate fallback
        this.isNumberPuzzle = true;
        this.imagePieces = [];
        this.imageUrl = null;
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.classList.add('number-puzzle');
        
        // Hide loading and start number puzzle
        this.hideLoadingStatus();
        this.shuffle();
        this.animatePuzzleAppearance();
    }

    showHint() {
        // Allow hint for both image and number puzzles
        if (!this.isPlaying || this.isShowingHint) {
            return;
        }
        
        // For image puzzle, require imagePieces to be loaded
        if (!this.isNumberPuzzle && !this.imagePieces.length) {
            return;
        }
        
        // Pause timer if it's running
        if (this.timerStarted && this.timerInterval) {
            // Calculate elapsed time before pausing
            this.timerElapsedBeforePause = Math.floor((Date.now() - this.startTime) / 1000);
            // Stop the timer interval
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            // Save the pause time
            this.timerPausedTime = Date.now();
        }
        
        // Save current board state
        this.savedBoardState = [...this.board];
        this.isShowingHint = true;
        
        // Disable moves and time display
        const moveCount = document.getElementById('moveCount');
        const timer = document.getElementById('timer');
        if (moveCount && moveCount.parentElement) {
            moveCount.parentElement.classList.add('disabled');
        }
        if (timer && timer.parentElement) {
            timer.parentElement.classList.add('disabled');
        }
        
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
        
        // Re-enable moves and time display
        const moveCount = document.getElementById('moveCount');
        const timer = document.getElementById('timer');
        if (moveCount && moveCount.parentElement) {
            moveCount.parentElement.classList.remove('disabled');
        }
        if (timer && timer.parentElement) {
            timer.parentElement.classList.remove('disabled');
        }
        
        // Resume timer if it was running before
        if (this.timerStarted && this.timerPausedTime) {
            // Adjust startTime to account for paused duration
            this.startTime = Date.now() - (this.timerElapsedBeforePause * 1000);
            // Restart the timer
            this.startTimer();
            this.timerPausedTime = null;
            this.timerElapsedBeforePause = 0;
        }
        
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
        // Allow shuffle for number puzzle mode even without images
        if (!this.isNumberPuzzle && (!this.imageUrl || this.imagePieces.length === 0)) {
            return;
        }
        
        this.moveCount = 0;
        this.updateMoveCount();
        this.stopTimer();
        this.isPlaying = false;
        this.timerStarted = false;
        
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
        // Don't start timer automatically - wait for first click
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
        
        // Start timer on first click
        if (!this.timerStarted) {
            this.timerStarted = true;
            this.startTimer();
        }
        
        const emptyPos = this.board.indexOf(15);
        const clickedRow = Math.floor(index / 4);
        const clickedCol = index % 4;
        const emptyRow = Math.floor(emptyPos / 4);
        const emptyCol = emptyPos % 4;
        
        // Check if clicked tile is in same row or column as empty space
        if (clickedRow === emptyRow) {
            // Same row - slide tiles horizontally
            this.slideRow(clickedRow, clickedCol, emptyCol);
        } else if (clickedCol === emptyCol) {
            // Same column - slide tiles vertically
            this.slideColumn(clickedCol, clickedRow, emptyRow);
        }
        // If not in same row or column, do nothing
    }
    
    slideRow(row, clickedCol, emptyCol) {
        // Determine direction and range of tiles to move
        const start = Math.min(clickedCol, emptyCol);
        const end = Math.max(clickedCol, emptyCol);
        
        // Collect tiles that will move
        const movingTiles = [];
        for (let col = start; col <= end; col++) {
            const tileIndex = row * 4 + col;
            movingTiles.push(document.querySelectorAll('.tile')[tileIndex]);
        }
        
        // Add moving class for animation
        movingTiles.forEach(tile => tile.classList.add('moving'));
        
        // Perform the slide
        if (clickedCol < emptyCol) {
            // Clicked tile is to the left of empty space - shift tiles right
            for (let col = emptyCol; col > clickedCol; col--) {
                const currentPos = row * 4 + col;
                const prevPos = row * 4 + (col - 1);
                this.swapTiles(currentPos, prevPos);
            }
        } else {
            // Clicked tile is to the right of empty space - shift tiles left
            for (let col = emptyCol; col < clickedCol; col++) {
                const currentPos = row * 4 + col;
                const nextPos = row * 4 + (col + 1);
                this.swapTiles(currentPos, nextPos);
            }
        }
        
        this.emptyIndex = this.board.indexOf(15);
        this.moveCount++;
        this.updateMoveCount();
        this.updateDisplay();
        
        // Remove moving class after animation
        setTimeout(() => {
            movingTiles.forEach(tile => tile.classList.remove('moving'));
        }, 300);
        
        this.checkWin();
    }
    
    slideColumn(col, clickedRow, emptyRow) {
        // Determine direction and range of tiles to move
        const start = Math.min(clickedRow, emptyRow);
        const end = Math.max(clickedRow, emptyRow);
        
        // Collect tiles that will move
        const movingTiles = [];
        for (let row = start; row <= end; row++) {
            const tileIndex = row * 4 + col;
            movingTiles.push(document.querySelectorAll('.tile')[tileIndex]);
        }
        
        // Add moving class for animation
        movingTiles.forEach(tile => tile.classList.add('moving'));
        
        // Perform the slide
        if (clickedRow < emptyRow) {
            // Clicked tile is above empty space - shift tiles down
            for (let row = emptyRow; row > clickedRow; row--) {
                const currentPos = row * 4 + col;
                const prevPos = (row - 1) * 4 + col;
                this.swapTiles(currentPos, prevPos);
            }
        } else {
            // Clicked tile is below empty space - shift tiles up
            for (let row = emptyRow; row < clickedRow; row++) {
                const currentPos = row * 4 + col;
                const nextPos = (row + 1) * 4 + col;
                this.swapTiles(currentPos, nextPos);
            }
        }
        
        this.emptyIndex = this.board.indexOf(15);
        this.moveCount++;
        this.updateMoveCount();
        this.updateDisplay();
        
        // Remove moving class after animation
        setTimeout(() => {
            movingTiles.forEach(tile => tile.classList.remove('moving'));
        }, 300);
        
        this.checkWin();
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
                
                // Don't show anything during loading
                if (this.isLoading) {
                    // Leave tile empty during loading
                    return;
                }
                
                // If in number puzzle mode, always show number
                if (this.isNumberPuzzle) {
                    const number = document.createElement('div');
                    number.className = 'tile-number';
                    number.textContent = value + 1; // Display 1-15 instead of 0-14
                    tile.appendChild(number);
                } else if (this.imagePieces && this.imagePieces.length > 0 && this.imagePieces[value]) {
                    // If images are loaded, show image piece
                    const img = document.createElement('img');
                    img.src = this.imagePieces[value];
                    img.className = 'tile-image';
                    img.draggable = false;
                    tile.appendChild(img);
                } else {
                    // Show number if not loading and no images
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
        // Only reset display if we're actually stopping (not pausing)
        if (!this.isShowingHint) {
            document.getElementById('timer').textContent = '00:00';
        }
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
        
        // Show particle effect first
        this.createParticleEffect();
        
        // Show modal after a few seconds
        setTimeout(() => {
            document.getElementById('winMessage').classList.remove('hidden');
        }, 2000);
    }
    
    animatePuzzleAppearance() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            tile.style.opacity = '0';
            tile.style.transform = 'scale(0.8)';
            setTimeout(() => {
                tile.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                tile.style.opacity = '1';
                tile.style.transform = 'scale(1)';
            }, index * 20);
        });
    }
    
    createParticleEffect() {
        // Remove existing particle container if any
        if (this.particleContainer) {
            this.particleContainer.remove();
        }
        
        // Create particle container
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        document.body.appendChild(this.particleContainer);
        
        // Get game board center position
        const gameBoard = document.getElementById('gameBoard');
        const rect = gameBoard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create particles
        const particleCount = 50;
        const colors = ['#667eea', '#764ba2', '#f59e0b', '#ffffff'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Start from center with fixed positioning
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.marginLeft = '-4px';
            particle.style.marginTop = '-4px';
            
            // Random direction and distance
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const distance = 150 + Math.random() * 150;
            const randomX = Math.cos(angle) * distance;
            const randomY = Math.sin(angle) * distance - 50; // Slight upward bias
            
            particle.style.setProperty('--random-x', randomX + 'px');
            particle.style.setProperty('--random-y', randomY + 'px');
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 0.3 + 's';
            particle.style.animationDuration = (2 + Math.random() * 1) + 's';
            
            this.particleContainer.appendChild(particle);
        }
        
        // Remove particles after animation
        setTimeout(() => {
            if (this.particleContainer) {
                this.particleContainer.remove();
                this.particleContainer = null;
            }
        }, 3500);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Puzzle15();
});

