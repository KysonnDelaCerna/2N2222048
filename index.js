let rowsAndCols = 2;
let height = 500;
let width = 500;
let gridWidth = 500;
let grid;

function Tile () {
    this.value = random(1) < 0.9 ? 2048 : 16384;

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
        return 0.75 * (gridWidth / rowsAndCols - 8) / (this.value.toString().length < 2 ? this.value.toString().length : this.value.toString().length / 1.5);
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

    this.newTile = function () {
        let availableSpaces = [];

        for (let i = 0; i < rowsAndCols; i++) {
            for (let j = 0; j < rowsAndCols; j++) {
                if (this.playArea[i][j] == null) {
                    availableSpaces.push([i, j]);
                }
            }
        }

        let [x, y] = random(availableSpaces);

        this.playArea[x][y] = new Tile ();
    }

    this.setUp = function () {
        this.score = 0;
        this.playArea = [[null, null], [null, null]];
        this.newTile();
        this.newTile();
    }
}

function setup () {
    grid = new Grid ();
    grid.setUp();
    createCanvas(width, height);
}

function draw () {
    background(209, 193, 180);
    let w = gridWidth / rowsAndCols;

    for (let i = 0; i < rowsAndCols; i++) {
        for (let j = 0; j < rowsAndCols; j++) {
            noFill();
            strokeWeight(10);
            stroke(199, 181, 151);
            rect(i * w, j * w, w, w);

            if (grid.playArea[i][j]) {
                push();
                translate(i * w, j * w);
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
}

function mouseClicked () {
    rowsAndCols++;
}