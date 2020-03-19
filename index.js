let rowsAndCols = 2;
let height = 500;
let width = 500;
let gridWidth = 500;

function Tile () {

}

function setup () {
    createCanvas(width, height);
}

function draw () {
    background(13, 9, 6);
    let w = gridWidth / rowsAndCols;

    for (let i = 0; i < rowsAndCols; i++) {
        for (let j = 0; j < rowsAndCols; j++) {
            noFill();
            strokeWeight(10);
            stroke(0);
            rect(i * w, j * w, w, w);
        }
    }
}

function mouseClicked () {
    rowsAndCols++;
}