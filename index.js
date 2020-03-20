let height = 500;
let width = 500;
let gridWidth = 500;
let grid;

function Tile () {
    this.value = random(1) < 0.9 ? 2 : 4;

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
            default: return '#000000'
        }
    }

    this.textSize = function () {
        return 0.75 * (gridWidth / grid.rowsAndCols - 8) / (this.value.toString().length < 2 ? this.value.toString().length : this.value.toString().length / 1.5);
    }

    this.textColor = function () {
        if (this.value <= 4) {
            return '#776E65';
        }
        return '#F9F6F2';
    }
}

function Grid () {
    this.score;
    this.playArea;
    this.rowsAndCols;
    this.maxRowsAndCols;
    this.expandFlag = false;

    this.numNewTiles;

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

            this.playArea[x][y] = new Tile ();
        }

        return true;
    }

    this.setUp = function () {
        this.rowsAndCols = 2;
        this.expandFlag = false;
        this.maxRowsAndCols = 10;
        this.numNewTiles = 1;
        this.score = 0;
        this.playArea = [[null, null], [null, null]];
        this.newTile();
        this.newTile();
    }

    this.expand = function () {
        if (this.rowsAndCols >= this.maxRowsAndCols) {
            return;
        }

        this.rowsAndCols++;
        this.numNewTiles++;

        this.playArea.forEach(function (item) {
            item.push(null);
        });
        
        this.playArea.push(new Array(this.rowsAndCols).fill(null));
        this.expandFlag = false;
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
        if (direction === 'RIGHT' || direction === 'DOWN') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                for (let j = 0; j < this.rowsAndCols - 1; j++) {
                    if (null === this.playArea[i][j] || null === this.playArea[i][j + 1]) {
                        continue;
                    }
                    if (this.playArea[i][j].value === this.playArea[i][j + 1].value) {
                        merged = true;
                        this.playArea[i][j + 1] = null;
                        this.playArea[i][j].value *= 2;
                        if (Math.log2(this.playArea[i][j].value) > this.rowsAndCols) {
                            this.expandFlag = true;
                        }
                        this.score += this.playArea[i][j].value;
                        j++;
                    }
                }
            }
        } else if (direction === 'LEFT' || direction === 'UP') {
            for (let i = 0; i < this.rowsAndCols; i++) {
                for (let j = 0; j < this.rowsAndCols - 1; j++) {
                    if (null === this.playArea[i][j] || null === this.playArea[i][j + 1]) {
                        continue;
                    }
                    if (this.playArea[i][j].value === this.playArea[i][j + 1].value) {
                        merged = true;
                        this.playArea[i][j] = null;
                        this.playArea[i][j + 1].value *= 2;
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

    this.move = function (direction) {
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
            this.newTile();
        }
    }
}

function setup () {
    grid = new Grid ();
    grid.setUp();
    createCanvas(width, height);
}

function draw () {
    background(209, 193, 180);
    let w = gridWidth / grid.rowsAndCols;

    for (let i = 0; i < grid.rowsAndCols; i++) {
        for (let j = 0; j < grid.rowsAndCols; j++) {
            noFill();
            strokeWeight(10);
            stroke(199, 181, 151);
            rect(i * w, j * w, w, w);

            if (grid.playArea[i][j]) {
                push();
                translate(j * w, i * w);
                fill(grid.playArea[i][j].tileColor());
                strokeWeight(0);
                rect(4, 4, w - 8, w - 8);

                translate(w / 2, w / 2);
                fill(grid.playArea[i][j].textColor());
                textSize(grid.playArea[i][j].textSize());
                textAlign(CENTER, CENTER);
                text(grid.playArea[i][j].value, 0, 0);
                pop();
            }
        }
    }

    noLoop();
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
    }

    draw();
}