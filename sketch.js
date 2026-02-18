let mic, fft;
let isStarted = false;
let angle = 0;
let gain = 12.0; // Extra boost for laptop mics

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  angleMode(DEGREES);
  
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.85, 512);
}

function draw() {
  // Deep space background with a trail effect
  background(0, 0, 5, 0.1);

  if (!isStarted) {
    // DIAGNOSTIC HEARTBEAT
    fill(255, 0.5);
    noStroke();
    ellipse(mouseX, mouseY, 15);
    return;
  }

  let spectrum = fft.analyze();
  let vol = mic.getLevel();
  
  // Update the visual signal meter
  updateMeter(vol);

  translate(width / 2, height / 2);
  rotate(angle);

  // KALEIDOSCOPE LOOP: 8 Symmetrical Slices
  for (let i = 0; i < 8; i++) {
    push();
    rotate(i * 45);
    
    // Draw frequency-based geometry
    for (let j = 0; j < spectrum.length; j += 20) {
      let amp = spectrum[j] * gain;
      if (amp > 2) { // Ultra-low threshold
        let hue = map(j, 0, spectrum.length, 0, 360);
        let r = map(amp, 0, 100, 10, height / 1.5);
        
        stroke(hue, 80, 100, 0.6);
        strokeWeight(map(vol, 0, 0.2, 1, 10));
        noFill();
        
        // Complex Shape: A pulsing geometric petal
        rectMode(CENTER);
        rect(r, r, amp / 5, amp / 5);
        line(0, 0, r, r);
      }
    }
    pop();
  }

  // Rotation speed tied to music intensity
  angle += 0.2 + (vol * 5);
}

function updateMeter(v) {
  let meter = document.getElementById('signal-fill');
  if (meter) {
    let w = map(v, 0, 0.1, 0, 100, true);
    meter.style.width = w + "%";
  }
}

function mousePressed() {
  if (!isStarted) {
    userStartAudio();
    mic.start();
    fft.setInput(mic);
    isStarted = true;
    document.getElementById('status-display').innerText = "SENSORS ACTIVE // SEEING SOUND";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}