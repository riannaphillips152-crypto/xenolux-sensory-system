let mic, fft;
let isStarted = false;
let angle = 0;
let time = 0;
let gainSlider;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.id('xenolux-canvas');
  
  colorMode(HSB, 360, 100, 100, 1);
  angleMode(DEGREES);
  
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 256); // Lower bins for hybrid performance

  // Slider scaling for fingers and mice
  gainSlider = createSlider(1, 100, 30); 
  gainSlider.parent('slider-container');
}

function draw() {
  background(260, 40, 5, 0.12); 

  if (!isStarted) {
    drawSyncPrompt();
    return;
  }

  let spectrum = fft.analyze();
  let vol = mic.getLevel();
  let gain = gainSlider.value(); 

  updateMeter(vol, gain);

  // HYBRID GRID: Desktop gets 10 cols, Mobile gets 6 for performance
  let cols = width > 800 ? 10 : 6;
  let rows = height > 800 ? 10 : 6;
  let w = width / cols;
  let h = height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      push();
      let xOff = map(noise(i * 0.1, time), 0, 1, -12, 12);
      let yOff = map(noise(j * 0.1, time + 100), 0, 1, -12, 12);
      translate(i * w + w / 2 + xOff, j * h + h / 2 + yOff);
      
      let dir = (i + j) % 2 == 0 ? 1 : -1;
      rotate(angle * dir + (noise(time) * 45));

      for (let k = 0; k < 4; k++) {
        rotate(90);
        let index = floor(map(i + j, 0, cols + rows, 0, spectrum.length / 2));
        let amp = spectrum[index] * gain;

        let hue = map(index, 0, spectrum.length / 2, 0, 360);
        let r = map(amp, 0, 255, 5, w / 1.1);
        let cycleHue = (hue + (time * 20)) % 360;
        
        stroke(cycleHue, 70, 100, 0.6);
        strokeWeight(map(vol * gain, 0, 50, 0.5, 4));
        noFill();
        
        let morph = map(sin(time * 35), -1, 1, 0, r);
        rect(r, r, morph, r/4);
        line(0, 0, r, r);
      }
      pop();
    }
  }
  
  angle += 0.2 + (vol * gain * 0.4);
  time += 0.01;
}

// HANDLES BOTH MOUSE AND TOUCH
function touchStarted() {
  if (!isStarted) {
    initAudio();
  }
  // This prevents the page from jumping/scrolling on mobile
  if (mouseX > 180 || mouseY > 200) return false; 
}

function mousePressed() {
  if (!isStarted) initAudio();
}

function initAudio() {
  userStartAudio();
  mic.start();
  fft.setInput(mic);
  isStarted = true;
  document.getElementById('status').innerText = "SENSORS ACTIVE";
}

function saveArt() {
  saveCanvas('Xenolux_Capture', 'png');
}

function updateMeter(v, g) {
  let meter = document.getElementById('meter-fill');
  if (meter) meter.style.width = map(v * g, 0, 20, 0, 100, true) + "%";
}

function drawSyncPrompt() {
  noFill(); stroke(0, 0, 100, 0.2);
  ellipse(width/2, height/2, 50 + sin(frameCount * 5) * 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}