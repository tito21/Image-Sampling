let logo_text;

let text_box;
const hueSpeed = 0.25;
let pixelsText;
let pdf = [];
let hue_pos = 0;

function metropolis_step(x, y, sigma, target_pdf) {
  let x_new = randomGaussian(x, sigma);
  let y_new = randomGaussian(y, sigma);
  let p = min(1, target_pdf(x_new, y_new) / target_pdf(x, y));
  let u = random(1);
  if (u <= p) return [[x_new, y_new], true];
  else return [[x, y], false];
}

function metropolis_sample(x0, y0, sigma, target_pdf, n = 100, burnin = 100, lag = 3) {
  let results = [];

  // Burn-in
  for (let i = 0; i < burnin; i++) {
    [[x0, y0], accept] = metropolis_step(x0, y0, sigma, target_pdf);
  }
  // Sampling evrey lag steps
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < lag; j++) {
      [[x0, y0], accept] = metropolis_step(x0, y0, sigma, target_pdf);

    }
    results.push([x0, y0]);
    if (accept) results.push([x0, y0]);
    else i -= 1;
  }

  return results;
}

function nearest_neighbors(x, y, arr) {
  return arr[floor(max(min(x, width - 1), 0))][floor(max(min(y, height - 1), 0))];
}

function getRandomColor() {
  colorMode(HSB, 100);
  let hue = 100 * noise(hueSpeed * hue_pos);
  hue_pos += 1;
  return color(hue, 100, 50);
}

function drawText() {
  textGraphic.background(0);
  logo_text = text_box.value();
  console.log(logo_text);
  textGraphic.text(logo_text, width / 2, height / 2);
  textGraphic.filter(BLUR, 10);
  image(textGraphic, 0, 0);
}

function getPDF() {

  textGraphic.loadPixels();
  pixelsText = textGraphic.pixels;

  pdf = [];
  let d = textGraphic.pixelDensity();
  for (let x = 0; x < width; x++) {
    let pdf_y = [];
    for (let y = 0; y < height; y++) {
      let index = 4 * (d * x + d * y * d * width);
      pdf_y.push(pixelsText[index]);
    }
    pdf.push(pdf_y);
  }
}

function drawPoints() {

  // image(textGraphic, 0, 0);
  background(255);

  points = metropolis_sample(width / 2, height / 2, 10, (x, y) => nearest_neighbors(x, y, pdf), 10_000, 1000, 3);

  console.log(points);
  for (let i = 0; i < points.length; i++) {
    let [x, y] = points[i];
    fill(getRandomColor());
    console.log(x, y);
    ellipse(x, y, 2);
  }

}

function update() {
  drawText();
  getPDF();
  drawPoints();
}

function setup() {
  // put setup code here

  text_box = select("#text-box");
  let canvas = createCanvas(1000, 500);
  canvas.parent('#canvas');
  background(255);
  noStroke();

  ellipseMode(CENTER);

  textGraphic = createGraphics(1000, 500);
  textGraphic.background(0);
  textGraphic.textAlign(CENTER, CENTER);
  textGraphic.rectMode(CENTER);
  textGraphic.textSize(128);
  textGraphic.fill(255);

  update();

}

function draw() {
  // put drawing code here
  update();
}

