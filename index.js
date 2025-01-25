let gridWidth;
let grid;

function Tile (x, y, savedTile) {
    if (savedTile) {
        this.value = savedTile.value;
        this.popScaleAnimationCounter = savedTile.popScaleAnimationCounter;
        this.newScaleAnimationCounter = savedTile.newScaleAnimationCounter;
        this.curPos = savedTile.curPos;
        this.prevPos = savedTile.prevPos;
        this.translateAnimationCounter = savedTile.translateAnimationCounter;
    } else {
        this.value = random(1) < 0.9 ? 2 : 4;
        this.popScaleAnimationCounter = 1;
        this.newScaleAnimationCounter = 10;
        this.curPos = [x, y];
        this.prevPos;
        this.translateAnimationCounter = 1;
    }

    this.updatePos = function (x, y) {
        this.prevPos = this.curPos;
        this.curPos = [x, y];

        this.translateAnimationCounter = 10;
    }

    this.angle = function () {
        if (this.curPos[0] > this.prevPos[0]) {
            return radians(-90);
        }
        if (this.curPos[0] < this.prevPos[0]) {
            return radians(90);
        }
        if (this.curPos[1] > this.prevPos[1]) {
            return radians(180);
        }
        if (this.curPos[1] < this.prevPos[1]) {
            return radians(0);
        }
    }

    this.translation = function () {
        if (this.translateAnimationCounter == 1 || !this.prevPos) {
            return [0, 0];
        }
        
        let w = gridWidth / grid.rowsAndCols;

        return [this.angle(), map(Math.log10(this.translateAnimationCounter--), 0, 1, 0 ,dist(this.curPos[0], this.curPos[1], this.prevPos[0], this.prevPos[1]) * w)];
    }

    this.tileColor = function () {
        switch (this.value) {
            case 2: return '#EEE4DA';
            case 4: return '#EDE0C8';
            case 8: return '#F2B179';
            case 16: return '#F59563';
            case 32: return '#F67C5F';
            case 64: return '#F65E3B';
            case 128: return '#EDCF72';
            case 256: return '#EDCC61';
            case 512: return '#EDC850';
            case 1024: return '#EDC53F';
            case 2048: return '#F7C42B';
            case 4096: return '#F36774';
            case 8192: return '#F14B61';
            case 16384: return '#EA423F';
            case 32768: return '#72B6DD';
            case 65536: return '#5EA2E3';
            case 131072: return '#027DC0';
            case 262144: return '#52FFA1';
            case 524288: return '#1BF17C';
            case 1048576: return '#00DE65';
            case 2097152: return '#BF2BFF';
            case 4194304: return '#AA0EEE';
            case 8388608: return '#9000CE';
            case 16777216: return '#FF57A4';
            case 33554432: return '#F02782';
            case 67108864: return '#DA0C69';
            case 134217728: return '#FFB60E';
            case 268435456: return '#DC9900';
            case 536870912: return '#C58900';
            default: return '#000000'
        }
    }

    this.textSize = function () {
        let size = 0.75 * (gridWidth / grid.rowsAndCols - 8) / (this.value.toString().length < 2 ? this.value.toString().length : this.value.toString().length / 1.5);
        
        if (size < 6) {
            return 0.75 * (gridWidth / grid.rowsAndCols - 8) / (`2^${Math.log2(this.value)}`.length / 1.5);
        } else {
            return size;
        }
    }

    this.text = function () {
        let size = 0.75 * (gridWidth / grid.rowsAndCols - 8) / (this.value.toString().length < 2 ? this.value.toString().length : this.value.toString().length / 1.5);
        
        if (size < 6) {
            return `2^${Math.log2(this.value)}`;
        } else {
            return this.value;
        }
    }

    this.textColor = function () {
        if (this.value <= 4) {
            return '#776E65';
        }
        return '#F9F6F2';
    }

    this.pop = function () {
        this.popScaleAnimationCounter = 10;
    }

    this.new = function () {
        this.newScaleAnimationCounter = 1;
    }

    this.scale = function () {
        if (this.popScaleAnimationCounter == 1 && this.newScaleAnimationCounter == 10) {
            return 1;
        } else if (this.popScaleAnimationCounter > 1) {
            this.newScaleAnimationCounter = 10;
            return map(Math.sqrt(25 - Math.pow(this.popScaleAnimationCounter-- - 5, 2)), 0, 5, 1, 1.15);
        } else if (this.newScaleAnimationCounter < 10) {
            return map(Math.log10(this.newScaleAnimationCounter++), 0, 1, 0.01, 1);
        }
    }
}

function Grid (savedGrid) {
    this.score;
    this.playArea;
    this.rowsAndCols;
    this.maxRowsAndCols;
    this.expandFlag;
    this.isGameOver;
    this.scaleAnimationCounter;
    this.numNewTiles;
    this.slidingTiles;
    this.highscore = 0;

    if (savedGrid) {
        this.score = savedGrid.score;
        this.rowsAndCols = savedGrid.rowsAndCols;
        this.maxRowsAndCols = savedGrid.maxRowsAndCols;
        this.expandFlag = savedGrid.expandFlag;
        this.isGameOver = savedGrid.isGameOver;
        this.scaleAnimationCounter = savedGrid.scaleAnimationCounter;
        this.numNewTiles = savedGrid.numNewTiles;
        this.highscore = savedGrid.highscore;

        this.playArea = [];

        for (let i = 0; i < this.rowsAndCols; i++) {
            this.playArea[i] = [];
            for (let j = 0; j < this.rowsAndCols; j++) {
                if (savedGrid.playArea[i][j]) {
                    this.playArea[i][j] = new Tile (0, 0, savedGrid.playArea[i][j]);
                } else {
                    this.playArea[i][j] = savedGrid.playArea[i][j];
                }
            }
        }

        this.slidingTiles = [];

        for (let i = 0; i < savedGrid.slidingTiles.length; i++) {
            this.slidingTiles[i] = new Tile (0, 0, savedGrid.slidingTiles[i]);
        }
    }

    this.newTile = function () {
        for (let h = 0; h < this.numNewTiles; h++) {
            let availableSpaces = [];

            for (let i = 0; i < this.rowsAndCols; i++) {
                for (let j = 0; j < this.rowsAndCols; j++) {
                    if (this.playArea[i][j] == null) {
                        availableSpaces.push([i, j]);
                    }
                }
            }

            if (availableSpaces.length == 0) {
                return false;
            }

            let [x, y] = random(availableSpaces);

            this.playArea[x][y] = new Tile (x, y);
            this.playArea[x][y].new();
        }

        return true;
    }

    this.checkGameOver = function () {
        for (let i = 0; i < this.rowsAndCols; i++) {
            for (let j = 0; j < this.rowsAndCols; j++) {
                if (!this.playArea[i][j]) {
                    return false;
                }
                if (i - 1 > 0) {
                    if (this.playArea[i - 1][j]) {
                        if (this.playArea[i - 1][j].value === this.playArea[i][j].value) {
                            return false;
                        }
                    }
                }
                if (i + 1 < this.rowsAndCols) {
                    if (this.playArea[i + 1][j]) {
                        if (this.playArea[i + 1][j].value === this.playArea[i][j].value) {
                            return false;
                        }
                    }
                }
                if (j - 1 > 0) {
                    if (this.playArea[i][j - 1]) {
                        if (this.playArea[i][j - 1].value === this.playArea[i][j].value) {
                            return false;
                        }
                    }
                }
                if (j + 1 < this.rowsAndCols) {
                    if (this.playArea[i][j + 1]) {
                        if (this.playArea[i][j + 1].value === this.playArea[i][j].value) {
                            return false;
                        }
                    }
                }
            }
        }
        saveData();
        return true;
    }

    this.setUp = function () {
        this.slidingTiles = [];
        this.scaleAnimationCounter = 1
        this.isGameOver = false;
        this.rowsAndCols = 2;
        this.expandFlag = false;
        this.maxRowsAndCols = 10;
        this.numNewTiles = 1;
        this.score = 0;
        this.playArea = [];
        for (let i = 0; i < this.rowsAndCols; i++) {
            this.playArea.push([]);
            for (let j = 0; j < this.rowsAndCols; j++) {
                this.playArea[i].push(null);
            }
        }
        this.newTile();
        this.newTile();
        draw();
    }

    this.expand = function () {
        if (this.rowsAndCols >= this.maxRowsAndCols) {
            return;
        }

        this.rowsAndCols++;

        if (this.rowsAndCols % 2 == 0) {
            this.numNewTiles++;
        }
        
        this.playArea.forEach(function (item) {
            item.push(null);
        });
        
        this.playArea.push(new Array(this.rowsAndCols).fill(null));
        this.expandFlag = false;

        this.scaleAnimationCounter = 10;
        saveData();
    }

    this.compareArray = function (a, b) {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    this.slide = function (direction) {
        let moved = false;
        let x;
        if (direction === 'LEFT' || direction === 'UP') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                x = this.playArea[i];
                this.playArea[i] = this.playArea[i].filter(x => x);
                this.playArea[i] = this.playArea[i].concat(new Array(this.rowsAndCols - this.playArea[i].length).fill(null));
                if (!this.compareArray(x, this.playArea[i])) {
                    moved = true;
                }
            }
        } else if (direction === 'RIGHT' || direction === 'DOWN') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                x = this.playArea[i];
                this.playArea[i] = this.playArea[i].filter(x => x);
                this.playArea[i] = new Array(this.rowsAndCols - this.playArea[i].length).fill(null).concat(this.playArea[i]);
                if (!this.compareArray(x, this.playArea[i])) {
                    moved = true;
                }
            }
        }
        return moved;
    }

    this.merge = function (direction) {
        let merged = false;
        if (direction === 'LEFT' || direction === 'UP') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                for (let j = 0; j < this.rowsAndCols - 1; j++) {
                    if (null === this.playArea[i][j] || null === this.playArea[i][j + 1]) {
                        continue;
                    }
                    if (this.playArea[i][j].value === this.playArea[i][j + 1].value) {
                        merged = true;
                        this.playArea[i][j + 1].updatePos(0, 0);
                        this.playArea[i][j + 1].curPos = this.playArea[i][j].curPos;
                        this.slidingTiles.push(this.playArea[i][j + 1]);
                        this.playArea[i][j + 1] = null;
                        this.playArea[i][j].value *= 2;
                        this.playArea[i][j].pop();
                        if (Math.log2(this.playArea[i][j].value) > this.rowsAndCols) {
                            this.expandFlag = true;
                        }
                        this.score += this.playArea[i][j].value;
                        j++;
                    }
                }
            }
        } else if (direction === 'RIGHT' || direction === 'DOWN') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                for (let j = 0; j < this.rowsAndCols - 1; j++) {
                    if (null === this.playArea[i][j] || null === this.playArea[i][j + 1]) {
                        continue;
                    }
                    if (this.playArea[i][j].value === this.playArea[i][j + 1].value) {
                        merged = true;
                        this.playArea[i][j].updatePos(0, 0);
                        this.playArea[i][j].curPos = this.playArea[i][j + 1].curPos;
                        this.slidingTiles.push(this.playArea[i][j]);
                        this.playArea[i][j] = null;
                        this.playArea[i][j + 1].value *= 2;
                        this.playArea[i][j + 1].pop();
                        if (Math.log2(this.playArea[i][j + 1].value) > this.rowsAndCols) {
                            this.expandFlag = true;
                        }
                        this.score += this.playArea[i][j + 1].value;
                        j++;
                    }
                }
            }
        }
        return merged;
    }

    this.transposeArea = function () {
        let newGrid = [];

        for (let i = 0; i < this.rowsAndCols; i++) {
            newGrid.push([]);
            for (let j = 0; j < this.rowsAndCols; j++) {
                newGrid[i][j] = this.playArea[j][i];
            }
        }

        this.playArea = newGrid;
    }

    this.updateTilePositions = function () {
        for (let i = 0; i < this.rowsAndCols; i++) {
            for (let j = 0; j < this.rowsAndCols; j++) {
                if (this.playArea[i][j]) {
                    this.playArea[i][j].updatePos(i, j);
                }
            }
        }
    }

    this.move = function (direction) {
        if (this.isGameOver) {
            return;
        }

        let spawn = false;
        let result;

        if (direction === 'UP' || direction === 'DOWN') {
            this.transposeArea();
        }

        result = this.slide(direction);
        spawn = spawn ? spawn : result;
        result = this.merge(direction);
        spawn = spawn ? spawn : result;
        result = this.slide(direction);
        spawn = spawn ? spawn : result;

        if (direction === 'UP' || direction === 'DOWN') {
            this.transposeArea();
        }

        if (this.expandFlag) {
            this.expand();
        }

        if (spawn) {
            this.updateTilePositions();

            this.newTile();
            this.isGameOver = this.checkGameOver();
            this.highscore = this.score > this.highscore ? this.score : this.highscore;
        }
    }

    this.scale = function () {
        if (this.scaleAnimationCounter == 1) {
            return 1;
        }
        return map(Math.log10(this.scaleAnimationCounter--), 0, 1, 1, this.rowsAndCols / (this.rowsAndCols - 1));
    }
}

function setup () {
    pixelDensity(1);
    frameRate(60);
    gridWidth = Math.min(Math.floor(0.95 * displayWidth), Math.floor(0.75 * displayHeight), 500);
    if (localStorage.getItem('grid')) {
        grid = new Grid (JSON.parse(localStorage.getItem('grid')));
    } else {
        grid = new Grid ();
        grid.setUp();
    }
    createCanvas(gridWidth, gridWidth).parent('canvas');
    mapSwipes();

    setInterval(saveData, 60000);
}

function draw () {
    background(209, 193, 180);
    let w = gridWidth / grid.rowsAndCols;

    push();
    scale(grid.scale());
    for (let i = 0; i < grid.rowsAndCols; i++) {
        for (let j = 0; j < grid.rowsAndCols; j++) {
            noFill();
            strokeWeight(10);
            stroke(199, 181, 151);
            rect(i * w, j * w, w, w);
        }
    }
    for (let i = 0; i < grid.slidingTiles.length; i++) {
        if (grid.slidingTiles[i].translateAnimationCounter > 1) {
            push();
            translate(grid.slidingTiles[i].curPos[1] * w + w / 2, grid.slidingTiles[i].curPos[0] * w + w / 2);
            let [angle, distance] = grid.slidingTiles[i].translation();
            translate(p5.Vector.fromAngle(angle, distance));
            fill(grid.slidingTiles[i].tileColor());
            strokeWeight(0);
            rectMode(CENTER);
            scale(grid.slidingTiles[i].scale());
            rect(0, 0, w - 8, w - 8);

            fill(grid.slidingTiles[i].textColor());
            textSize(grid.slidingTiles[i].textSize());
            textAlign(CENTER, CENTER);
            text(grid.slidingTiles[i].text(), 0, 0);
            pop();
        } else {
            grid.slidingTiles.splice(i, 1);
            i--;
        }
    }
    for (let i = 0; i < grid.rowsAndCols; i++) {
        for (let j = 0; j < grid.rowsAndCols; j++) {
            if (grid.playArea[i][j]) {
                push();
                translate(j * w + w / 2, i * w + w / 2);
                let [angle, distance] = grid.playArea[i][j].translation();
                translate(p5.Vector.fromAngle(angle, distance));
                fill(grid.playArea[i][j].tileColor());
                strokeWeight(0);
                rectMode(CENTER);
                scale(grid.playArea[i][j].scale());
                rect(0, 0, w - 8, w - 8);

                fill(grid.playArea[i][j].textColor());
                textSize(grid.playArea[i][j].textSize());
                textAlign(CENTER, CENTER);
                text(grid.playArea[i][j].text(), 0, 0);
                pop();
            }
        }
    }
    pop();

    select('#score').html(`Score: ${grid.score}`);
    select('#highscore').html(`High Score: ${grid.highscore}`);

    if (grid.isGameOver) {
        push();
        translate(gridWidth / 2, gridWidth / 2);
        textAlign(CENTER, CENTER);
        textSize(gridWidth / 6);
        text('Game Over', 0, 0);
        pop();
    }
}

function keyPressed () {
    if (keyCode === UP_ARROW || keyCode === 87) {
        grid.move('UP');
    } else if (keyCode === DOWN_ARROW || keyCode === 83) {
        grid.move('DOWN');
    } else if (keyCode === LEFT_ARROW || keyCode === 65) {
        grid.move('LEFT');
    } else if (keyCode === RIGHT_ARROW || keyCode === 68) {
        grid.move('RIGHT');
    } else if (keyCode === 82) {
        grid.setUp();
    } else if (keyCode === 81) {
        saveData();
    }
}

function mapSwipes () {
    let canvas = document.getElementsByTagName('canvas');

    let listener = new Hammer(canvas[0], {});

    listener.on('swipe', function (e) {
        let angle = e.angle;

        if (angle >= 0 && angle < 45 || angle < 0 && angle > -45) {
            grid.move('RIGHT');
        } else if (angle <= 180 && angle > 135 || angle > -180 && angle < -135) {
            grid.move('LEFT');
        } else if (angle >= 45 && angle <= 135) {
            grid.move('DOWN');
        } else if (angle <= -45 && angle >= -135) {
            grid.move('UP');
        }
    });

    listener.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
}

function saveData () {
    localStorage.setItem('grid', JSON.stringify(grid));
}
