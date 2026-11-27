let monkIMG;
let paladinIMG;
let clericIMG;
let bardIMG;
let goblinIMG;
let forestIMG;
let shrineIMG;
let garlandIMG;
let characters = [];
let enemies = [];
function preload(){
  gameFont = loadFont('fonts/Reactor7.otf');
  monkIMG = loadImage('images/monk.png');
  paladinIMG = loadImage('images/paladin.png');
  clericIMG = loadImage('images/cleric.png');
  bardIMG = loadImage('images/bard.png');
  goblinIMG = loadImage('images/goblin.png');
  garlandIMG = loadImage('images/garland.png');
  forestIMG = loadImage('images/forest.png');
  shrineIMG = loadImage('images/shrine.png');
  clericSong1 = loadSound('music/ClericNormalTheme.mp3');
  clericSong2 = loadSound('music/ClericBossTheme.mp3');
  paladinSong1 = loadSound('music/PaladinNormalTheme.mp3');
  paladinSong2 = loadSound('music/PaladinBossTheme.mp3');
  monkSong1 = loadSound('music/MonkNormalTheme.mp3');
  monkSong2 = loadSound('music/MonkBossTheme.mp3');
  bardSong1 = loadSound('music/BardNormalTheme.mp3');
  bardSong2 = loadSound('music/BardBossTheme.mp3');
  menuSong = loadSound('music/MenuTheme.mp3');
  victorySong = loadSound('music/VictoryTheme.mp3');
  bluntSound = loadSound('music/BluntHit.mp3');
  slashSound = loadSound('music/SharpHit.mp3');
  healSound = loadSound('music/HealSound.mp3');
  mpRestoreSound = loadSound('music/MPSound.mp3');
  lbSound = loadSound('music/LBSound.mp3');
  bluntSound.setVolume(0.2);
  slashSound.setVolume(0.2);
  healSound.setVolume(0.2);
  mpRestoreSound.setVolume(0.2);
  lbSound.setVolume(0.4);
}
let gameState = "title";

let party = [];
let combatParty = [];
let enemy = {
  name: "Goblin",
    health: 500,
    maxHealth: 500,
    attack: 40,
    image: goblinIMG,
    background: forestIMG,
    isBoss: false
};

let currentActor = 0;
let selectedAbility = 0;
let combatMessage = "Choose an ability.";
let combatOver = false;
let combatResult = "";
let gameFont;
let selectingTarget = false;
let targetSelectionIndex = 0;
let pendingAbility = null;
let currentBattleIndex = 0;
let waitingForNextBattle = false;

let limitBreakReady = false;
let limitBreakRoundCounter = 0;

let menuSong;
let paladinSong1;
let paladinSong2;
let monkSong1;
let monkSong2;
let clericSong1;
let clericSong2;
let bardSong1;
let bardSong2;
let bluntSound;
let slashSound;
let healSound;
let mpRestoreSound;
let lbSound;
let currentBattleMusic = null;
let isBossBattle = false;

let enemyShake = 0;
let characterShake = [];
let shakeAmount = 8;
let shakeDuration = 200;
let enemyFade = 255;

let victorySong;
let victorySequenceActive = false;
let victoryStartTime = 0;
let inputLocked = false;
let waitingForFinalVictory = false;

//game state
function setup() {
  createCanvas(900, 600);
  textAlign(CENTER, CENTER);
  textFont(gameFont);
  

  characters = [
  {
    name: "Paladin",
    image: paladinIMG,
    role: "Attacker",
    description: "A disciplined fighter who uses a broadsword",
    health: 150,
    attack: 25,
    mp: 50,
    maxMP: 50,
    color: [200, 70, 70],
    limitBreak: { name: "Divine Smite", power: 100, type: "attack", attackType: "limitBreak", mpCost: 0 },
    songname1: "Let the Battles Begin (Final Fantasy 7)",
    songname2: "Battle at the Big Bridge (Dissidia Final Fantasy)",
    abilities: [
      { name: "Slash", description: "A basic sword attack.", power: 25, type: "attack", attackType: "slash", mpCost: 0 },
      { name: "Blitz", description: "A powerful physical attack.", power: 40, type: "attack", attackType: "slash", mpCost: 10 },
      { name: "Cross Slash", description: "A powerful attack", power: 80, type: "attack", attackType: "slash", mpCost: 30 }
    ]
  },
  {
    name: "Monk",
    image: monkIMG,
    role: "Attacker",
    description: "An explosive pugilist who uses martial arts",
    health: 100,
    attack: 40,
    mp: 100,
    maxMP: 100,
    color: [80, 100, 220],
    limitBreak: { name: "Final Heaven", power: 120, type: "attack", attackType: "limitBreak", mpCost: 0 },
    songname1: "Theme of Ryu (Marvel vs. Capcom 3)",
    songname2: "Volcanic Rim (Ultra Street Fighter IV)",
    abilities: [
      { name: "Jab", description: "Launch a quick punch at the enemy", power: 15, type: "attack", attackType: "blunt", mpCost: 0 },
      { name: "Flurry of Blows", description: "Kick the enemy", power: 100, type: "attack", attackType: "blunt", mpCost: 40 },
      { name: "Ki Restoration", description: "Attack the enemy with a combo", power: 40, type: "restoreMP", mpCost: 0 }
    ]
  },
  {
    name: "Cleric",
    image: clericIMG,
    role: "Healer",
    description: "A supportive healer who keeps allies healthy",
    health: 80,
    attack: 10,
    mp: 120,
    maxMP: 120,
    color: [220, 190, 80],
    limitBreak: { name: "Holy Restoration", power: 150, type: "heal", mpCost: 0 },
    songname1: "Sylpheed (Atelier Ayesha: The Alchemist of Dusk)",
    songname2: "Sagittarius (Atelier Ayesha: The Alchemist of Dusk)",
    abilities: [
      { name: "Sacred Flame", description: "Deal damage with holy magic.", power: 10, type: "attack", attackType: "blunt", mpCost: 0 },
      { name: "Cure Wounds", description: "Restore an ally's health.", power: 30, type: "heal", mpCost: 20 },
      { name: "Curaga", description: "Restore a large amount of health.", power: 50, type: "heal", mpCost: 40 }
    ]
  },
  {
    name: "Bard",
    image: bardIMG,
    role: "Support",
    description: "A jack of all trades that can do it all",
    health: 100,
    attack: 30,
    mp: 100,
    maxMP: 100,
    color: [70, 170, 100],
    limitBreak: { name: "Ultima Arrow", power: 100, type: "attack", attackType:"limitBreak", mpCost: 0 },
    songname1: "Battle II (Octopath Traveler)",
    songname2: "That of the Name (Bravely Default)",
    abilities: [
      { name: "Snipe", description: "Fire a quick arrow.", power: 20, type: "attack", attackType: "blunt", mpCost: 0 },
      { name: "Vicious Mockery", description: "Fire a powerful arrow.", power: 50, type: "attack", attackType: "slash", mpCost: 20 },
      { name: "Healing Word", description: "Fire three consecutive arrows.", power: 20, type: "heal", mpCost: 20 }
    ]
  },
];

enemies = [
  {
    name: "Goblin",
    health: 400,
    maxHealth: 400,
    attack: 40,
    image: goblinIMG,
    background: forestIMG,
    isBoss: false
  },
  {
    name: "Garland",
    health: 100,
    maxHealth: 1000,
    attack: 60,
    image: garlandIMG,
    background: shrineIMG,
    isBoss: true
  }
];
}

function playMenuMusic(){
  if(!menuSong.isPlaying()){
    menuSong.setVolume(0.2);
    menuSong.loop();
  }
}

function playBattleMusic(characterName, isBoss) {

  // Stop previous music
  if (currentBattleMusic !== null) {
    currentBattleMusic.stop();
  } 
  if (characterName === "Paladin") {
    if (isBoss) {
      currentBattleMusic = paladinSong2;
    } else {
      currentBattleMusic = paladinSong1;
    }
  }
  if (characterName === "Monk") {
    if (isBoss) {
      currentBattleMusic = monkSong2;
    } else {
      currentBattleMusic = monkSong1;
    }
  }
  if (characterName === "Cleric") {
    if (isBoss) {
      currentBattleMusic = clericSong2;
    } else {
      currentBattleMusic = clericSong1;
    }
  }
  if (characterName === "Bard") {
    if (isBoss) {
      currentBattleMusic = bardSong2;
    } else {
      currentBattleMusic = bardSong1;
    }
  }

  // Play selected music
  if (currentBattleMusic !== null) {
    currentBattleMusic.setVolume(0.2);
    currentBattleMusic.loop();
  }
}

function startVictorySequence() {
  if (victorySequenceActive) return;

  victorySequenceActive = true;
  inputLocked = true;
  victoryStartTime = millis();

  // Stop battle music
  if (currentBattleMusic !== null) {
    currentBattleMusic.stop();
    currentBattleMusic = null;
  }

  // Play victory music
  victorySong.setVolume(0.2);
  victorySong.play();

  waitingForNextBattle = true;
  combatMessage =
    enemy.name + " has been defeated! Press ENTER to continue.";
}

function draw() {
  background(10,10,30);
  if (gameState === "title") {
    drawTitleScreen();
  }

  else if (gameState === "select") {
    drawCharacterSelect();
  }

  else if (gameState === "game") {
    drawGame();
  }
  else if (gameState === "victory") {
    drawVictoryScreen();
  }
}

function drawTitleScreen() {

  background(10,10,30);

  // Game title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(65);
  text("I Made A Role Playing Game", width / 2, 190);

  // Subtitle
  fill(180, 190, 210);
  textSize(20);
  text("I want coffee...", width / 2, 255);

  // Start button
  fill(70, 100, 160);
  rectMode(CENTER);
  rect(width / 2, 400, 250, 65);

  fill(255);
  textSize(28);
  text("START GAME", width / 2, 400);
  rectMode(CORNER);
}

function drawVictoryScreen() {
  background(15, 20, 35);

  // Victory title
  fill(255, 220, 100);
  textAlign(CENTER, CENTER);
  textSize(64);
  text("VICTORY!", width / 2, 180);

  // Subtitle
  fill(255);
  textSize(24);
  text("You have defeated the final boss!", width / 2, 260);

  // Main Menu button
  fill(0, 84, 136);
  rect(width / 2 - 125, 370, 250, 65);

  fill(255);
  textSize(26);
  text("MAIN MENU", width / 2, 402);
}

function drawCharacterSelect() {

  fill(255);
  textSize(44);
  text("Choose your character!", width/2, 55);
  textSize(24);
  fill(180);
  text("Select 4 characters to begin your adventure.", width/2, 100);

  // Track which card is being hovered over
  let hoveredCharacter = -1;

  // Draw character cards
  for (let i = 0; i < characters.length; i++) {
    let x = 65 + i * 210;
    let y = 170;

    let selected = party.includes(i);
    // Card background
    if (selected) {
      fill(65, 100, 75);
    } else {
      fill(0, 42, 136);
    }

    // Card outline
    if (selected){
      stroke(100, 255, 130);
    } else {
      stroke(120);
    }

    if (selected) {
      strokeWeight(4);
    } else {
      strokeWeight(1);
    }

    rect(x, y, 180, 260);
    noStroke();

    // Character portrait
    imageMode(CENTER);
    image(characters[i].image, x + 90, y + 80, 120, 110);

    // Character name
    fill(255);
    textSize(32);
    text(characters[i].name, x + 90, y + 165);

    // Character role
    fill(180);
    textSize(24);
    text(characters[i].role, x + 90, y + 195);

    // Selection indicator
    textSize(30);
    if (selected) {
      fill(100, 255, 130);
      text("SELECTED", x + 90, y + 230);
    } else {
      fill(220);
      text("Click to select", x + 90, y + 230);
    }

    // Check if mouse is hovering over card
    if (mouseX > x && mouseX < x+180 && mouseY > y && mouseY < y+260){
      hoveredCharacter = i;
    }
  }

  //hover detailed character info
  if (hoveredCharacter !== -1) {
    let x = 65 + hoveredCharacter * 210;
    let y = 170;
    drawCharacterInfo(hoveredCharacter, x, y);
  }

  // Party counter
  fill(255);
  textSize(30);
  text("Party: " + party.length + " / 4", width / 2, 485);

  // Start button
  if (party.length === 4) {
    fill(65, 170, 100);
  } else {
    fill(80);
  }
  noStroke();
  rect(width/2-100, 510, 200, 55);

  fill(255);
  textSize(28);
  text("Start Game", width / 2, 535);

  fill(160);
  textSize(20);
  text("Click a selected character again to remove them.", width / 2, 590);
}

function drawCharacterInfo(i, x, y) {
  //hover over character to display
  let character = characters[i];
  //determine which side to display the panel
  let panelX;
  let panelY = y;
  if (x + 180 + 220 < width){
    panelX = x + 190;
  } else{
    panelX = x - 230;
  }

  //panel background
  fill(0, 42, 136);
  stroke(255);
  strokeWeight(1);
  rect(panelX, panelY, 220, 200);
  noStroke();

  //name
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text(character.name, panelX + 110, panelY + 30);

  //role
  fill(180);
  textSize(22);
  text(character.role, panelX + 110, panelY + 60);

  // description
  fill(220);
  textSize(20);
  textAlign(LEFT, TOP);
  textLeading(20);
  text(
    character.description, panelX + 15, panelY + 75, 190, 60);

  // character stats
  fill(255);
  textSize(16);
  textLeading(16);
  text("Song 1: " + character.songname1, panelX + 15, panelY + 125, 200);
  text("Song 2: " + character.songname2, panelX + 15, panelY + 165, 200);
  textAlign(CENTER, CENTER);
}

//only used for character select
function mousePressed() {

  if (gameState === "title") {
  // Check if Start button was clicked
  if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 && mouseY > 367 && mouseY < 432) {
    gameState = "select";
    playMenuMusic();
  }return;
}

if (gameState === "victory") {

  // Main Menu button
  if (mouseX > width / 2 - 125 && mouseX < width / 2 + 125 && mouseY > 370 && mouseY < 435) {
    gameState = "title";
    party = [];
    combatParty = [];
    currentBattleIndex = 0;
    waitingForFinalVictory = false;
    VictoryTheme.stop();
  }
  return;
}

  if (gameState === "select") {
    for (let i = 0; i < characters.length; i++) {
      let x = 65 + i * 210;
      let y = 170;
      //remove character from select
      if (mouseX > x && mouseX < x+180 && mouseY > y && mouseY < y+260){
        // Remove character
        if (party.includes(i)) {
          let index = party.indexOf(i);
          party.splice(index, 1);
        }
        //add character to party
        else if (party.length < 4) {
          party.push(i);
        }
        return;
      }
    }

    // Start button
    if (mouseX > width/2-100 && mouseX < width/2+100 && mouseY>520 && mouseY<575){
      if (party.length === 4){
        startCombat();
        gameState = "game";
      }
      }
    }
  }

//only used for combat
function keyPressed() {

  // Continue to the next battle
  if (waitingForNextBattle) {
    if (keyCode === ENTER) {
        nextBattle();
      }
      return;
    }

    // Continue to final victory screen
    if (waitingForFinalVictory && enemyFade <= 0 && keyCode === ENTER) {
      waitingForFinalVictory = false;
      gameState = "victory";
      return;
    }

  if (gameState !== "game") return;
  //target
  if (selectingTarget) {
    if (key === "a" || key === "A") {
      targetSelectionIndex--;

      if (pendingAbility.type === "heal") {
        if (targetSelectionIndex < 0) {
          targetSelectionIndex = combatParty.length - 1;
        }
      } else {
        targetSelectionIndex = 0;
      }
    }

    if (key === "d" || key === "D") {
      targetSelectionIndex++;
      if (pendingAbility.type === "heal") {
        if (targetSelectionIndex >= combatParty.length) {
          targetSelectionIndex = 0;
        }
      } else {
        targetSelectionIndex = 0;
      }
    }

    if (keyCode === ENTER) {
      confirmTarget();
    }

    return;
  }

  //abilities
  let abilityCount =
    combatParty[currentActor].abilities.length;

  if (key === "w" || key === "W") {
    selectedAbility--;
    if (selectedAbility < 0) {
      selectedAbility = abilityCount - 1;
    }
  }

  if (key === "s" || key === "S") {
    selectedAbility++;
    if (selectedAbility >= abilityCount) {
      selectedAbility = 0;
    }
  }

  if (keyCode === ENTER) {
    useAbility();
  }
}

function startCombat() {
  if(menuSong.isPlaying()){
    menuSong.stop();
  }

  waitingForFinalVictory = false;

  //turn selected party info into new array
  combatParty = party.map(index => {
    let character = characters[index];
    return {
      name: character.name,
      color: character.color,
      image: character.image,
      maxHealth: character.health,
      health: character.health,
      maxMP: character.maxMP,
      mp: character.mp,
      abilities: character.abilities,
      limitBreak: character.limitBreak
    };
  });

// Reset battle progression
currentBattleIndex = 0;

  // Load the first enemy with its original stats
  loadEnemy(currentBattleIndex);
  isBossBattle = false;
  playBattleMusic(combatParty[0].name, isBossBattle);

  // Reset combat
  currentActor = 0;
  selectedAbility = 0;
  combatMessage = "Choose an ability.";
  combatOver = false;
  combatResult = "";

  selectingTarget = false;
  pendingAbility = null;
  waitingForNextBattle = false;
  waitingForFinalVictory = false;

  enemyFade = 255;
  victorySequenceActive = false;
  limitBreakReady = false;
  limitBreakRoundCounter = 0;
}

//2nd battle
function loadEnemy(index) {
  if (victorySong.isPlaying()) {
    victorySong.stop();
  }

  victorySequenceActive = false;
  inputLocked = false;

  let nextEnemy = enemies[index];

  enemy.name = nextEnemy.name;
  enemy.health = nextEnemy.maxHealth;
  enemy.maxHealth = nextEnemy.maxHealth;
  enemy.attack = nextEnemy.attack;
  enemy.image = nextEnemy.image;
  enemy.background = nextEnemy.background;

  enemyFade = 255;
  isBossBattle = nextEnemy.isBoss;

  // Start appropriate battle music
  playBattleMusic(combatParty[0].name, isBossBattle);

  // Reset combat
  currentActor = 0;

  while (
    currentActor < combatParty.length &&
    combatParty[currentActor].health <= 0
  ) {
    currentActor++;
  }

  selectedAbility = 0;
  selectingTarget = false;
  pendingAbility = null;

  combatOver = false;
  waitingForNextBattle = false;

  combatMessage = "A new enemy approaches: " + enemy.name + "!";
}

function nextBattle() {
  currentBattleIndex++;

  // Check if there are more enemies
  if (currentBattleIndex >= enemies.length) {
  combatOver = true;
  waitingForNextBattle = false;

  stopBattleMusic();

  gameState = "victory";
  return;
}

  // Load the next enemy
  loadEnemy(currentBattleIndex);
}

function stopBattleMusic() {
  if (currentBattleMusic !== null) {
    currentBattleMusic.stop();
    currentBattleMusic = null;
  }
}

function drawGame() {
  background(25);

  if (enemy.background) {
    imageMode(CORNER);
    image(enemy.background, 0, 0, width, height);
  } else {
    background(20, 25, 35);
  } 
  fill(0, 0, 0, 120);
  noStroke();
  rect(0, 0, width, height);

  //abilties (top left)
  stroke('white');
  strokeWeight(2);
  fill(0, 42, 136);
  rect(25, 20, 300, 160);

  noStroke();
  fill('white');
  textSize(30);
  textAlign(CENTER, CENTER);
  text("ACTIONS", 175, 42);

  //ability names
  if (!combatOver && combatParty[currentActor]) {
    let currentCharacter = combatParty[currentActor];
    for (let i = 0; i < currentCharacter.abilities.length; i++) {
      let ability = getDisplayedAbility(currentActor, i);
      let x = 45;
      let y = 65 + i * 35;

      // Highlight selected ability
      if (i === selectedAbility) {
        fill(0, 84, 136);
      } else {
        fill(0, 42, 136);
      }

      rect(x, y, 260, 30);

      fill(255);
      textSize(24);
      textAlign(LEFT, CENTER);
      text(ability.name, x + 12, y + 15);
    }
  }

  //battle log
  stroke('white');
  strokeWeight(2);
  fill(0, 42, 136);
  rect(350, 20, 525, 160);

  noStroke();
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("BATTLE LOG", 612, 42);

  textSize(24);
  textAlign(LEFT, TOP);

  //new battle log entry
  text(combatMessage, 375, 75, 475, 85);

  //enemy
  fill(255, 255, 255, enemyFade);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(enemy.name, width/2, 230);
  
  //enemy image
  if (enemy.image) {
    imageMode(CENTER);
    let shakeX = 0;
    let shakeY = 0;
    
    // Enemy shake effect
    if (enemyShake > 0 && millis() - enemyShake < shakeDuration) {
      shakeX = random(-shakeAmount, shakeAmount);
      shakeY = random(-shakeAmount, shakeAmount);
    }
    
    // Enemy fade effect
    if (enemy.health <= 0) {
      enemyFade -= 2;
      enemyFade = max(enemyFade, 0);
    }
    tint(255, enemyFade);
    image(enemy.image, width/2+shakeX, 335+shakeY, 200, 150);
    noTint();
  }

  //highlight enemy when attacking 
  if (selectingTarget && pendingAbility.type === "attack"){
    noFill();
    stroke(255, 255, 0);
    strokeWeight(3);
    rect(width / 2 - 115, 245, 230, 180);
  }

  // Final victory prompt after enemy disappears
  if (waitingForFinalVictory && enemyFade <= 0) {
  combatMessage = "VICTORY! Press ENTER to continue.";
  inputLocked = false;
}

//party status
  fill(0, 42, 136);
  stroke('white');
  strokeWeight(2);
  rect(15, 460, 870, 125);

  //party info
  for (let i = 0; i < combatParty.length; i++) {
    let character = combatParty[i];
    let x = 25 + i * 215;
    let y = 480;

    //active character
    if (i === currentActor && !combatOver) {
      fill(0, 84, 136);
    } else {
      fill(15,15,50);
    }

  //highlight party member when healing
  if (selectingTarget && pendingAbility.type === "heal" && i === targetSelectionIndex){
    noFill();
    stroke(255, 255, 0);
    strokeWeight(4);
    rect(x, 480, 205, 90);
  }

    stroke('white');
    strokeWeight(1);
    rect(x, y, 205, 90);

    //character image
    noStroke();
    fill(character.color);
    rect(x+5, y+7, 60, 75);

    //character image 
    if (character.image) {
      imageMode(CENTER);
      let shakeX = 0;
      let shakeY = 0;
      if (characterShake[i] > 0 && millis() - characterShake[i] < shakeDuration) {
        shakeX = random(-shakeAmount, shakeAmount);
        shakeY = random(-shakeAmount, shakeAmount);
      }
      image(combatParty[i].image, x+shakeX+35, y+shakeY+35, 60,60);
    }

    //character name
    fill(255);
    textSize(24);
    textAlign(LEFT, CENTER);
    text(character.name, x + 72, y + 17);

    //character HP
fill(255);
textSize(16);
textAlign(LEFT, CENTER);

text(
  "HP: " + character.health + "/" + character.maxHealth, x+72, y+38);

//HP background
fill(80);
rect(x + 72, y + 46, 120, 8);

//HP box
let healthWidth = 
map(character.health, 0, character.maxHealth, 0, 120);
fill(50, 220, 100);
noStroke();
rect(x + 72, y + 46, healthWidth, 8);

//character MP
fill(255);
textSize(16);
text(
  "MP: " + character.mp + "/" + character.maxMP, x+72, y+62);

//MP background
fill(80);
rect(x + 72, y + 70, 120, 8);

//MP box
let mpWidth = 
map(character.mp, 0, character.maxMP, 0, 120);

fill(70, 140, 255);
noStroke();
rect(x + 72, y + 70, mpWidth, 8);
  }

  //how to play
  fill(180);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("WASD: Navigate     ENTER: Select Ability", width / 2, 595);
}

function useAbility() {
  let character = combatParty[currentActor];
  let ability = getDisplayedAbility(currentActor, selectedAbility);

  // attacks
  if (ability.type === "attack") {
    pendingAbility = ability;
    selectingTarget = true;
    
    // 0 = enemy
    targetSelectionIndex = 0; 
    combatMessage = "Choose an enemy to attack.";
    return;
  }

  // heals
  else if (ability.type === "heal") {
  pendingAbility = ability;
  selectingTarget = true;
  targetSelectionIndex = 0;
  combatMessage = "Choose a party member to heal.";
  return;
  }

  else if (ability.type === "restoreMP") {
  pendingAbility = ability;
  selectingTarget = true;
  targetSelectionIndex = 0;
  combatMessage = "Choose a party member to restore MP.";
  return;
  }

  //next character
  currentActor++;
  //skip defeated characters
  while (currentActor < combatParty.length && combatParty[currentActor].health <= 0){ 
    currentActor++;
  }

  //enemy turn after party
  if (currentActor >= combatParty.length){
    enemyTurn();
  }

  //reset
  selectedAbility = 0;
}

function confirmTarget() {
  let character = combatParty[currentActor];
  let ability = pendingAbility;

  //do you have enough mp
  if (character.mp < ability.mpCost) {
    combatMessage = "Not enough MP!";
    selectingTarget = false;
    pendingAbility = null;
    return;
  }

  //use mp
  character.mp -= ability.mpCost;

  if (ability.type === "attack") {
    enemy.health -= ability.power;

  if (ability.attackType === "blunt") {
    bluntSound.play();
  }
  else if (ability.attackType === "slash") {
    slashSound.play();
  }
  else if (ability.attackType === "limitBreak") {
    lbSound.play();
  }
  
  triggerShake("enemy");
  combatMessage =
    character.name + " used " + ability.name + "! Dealt " + ability.power + " damage.";
    if (enemy.health < 0) {
    enemy.health = 0;
  }
  if (enemy.health === 0) {
  startVictorySequence();

  selectingTarget = false;
  pendingAbility = null;

  // Check whether this was the final enemy
  if (currentBattleIndex === enemies.length - 1) {
    waitingForFinalVictory = true;
  }

  return;
}
}
//heals
else if (ability.type === "heal") {
  let target = combatParty[targetSelectionIndex];
  if (target.health <= 0) {
    combatMessage = "You cannot heal a defeated party member.";
    return;
  }
  target.health += ability.power;
  if (target.health > target.maxHealth) {
    target.health = target.maxHealth;
  }
  healSound.play();
  combatMessage =
    character.name + " used " + ability.name +
    " on " + target.name + "!";
}
// restoreMP
else if (ability.type === "restoreMP") {
  character.mp += ability.power;

  if (character.mp > character.maxMP) {
    character.mp = character.maxMP;
  }
  mpRestoreSound.play();
  combatMessage =
    character.name + " used " + ability.name +
    "! Restored " + ability.power + " MP.";
}
selectingTarget = false;
pendingAbility = null;

// Consume Limit Break charge if it was used
if (
  currentActor === 0 &&
  selectedAbility === 2 &&
  limitBreakReady
) {
  limitBreakReady = false;
  limitBreakRoundCounter = 0;
}

  //next character
  currentActor++;
  //skip defeated characters
  while (currentActor < combatParty.length && combatParty[currentActor].health <= 0){ 
    currentActor++;
  }

  //enemy turn after party
  if (currentActor >= combatParty.length) {
    setTimeout(() => {enemyTurn();}, 1000);
  }

  //reset
  selectedAbility = 0;
}

function enemyTurn() {

  // Find surviving party members
  let aliveMembers = combatParty.filter(
    member => member.health > 0
  );

  // Check if entire party is defeated
  if (aliveMembers.length === 0) {
    combatOver = true;
    combatResult = "DEFEAT!";
    combatMessage = "Your party has fallen.";
    return;
  }

  // Choose random target
  let target = random(aliveMembers);

  // Deal damage
  target.health -= enemy.attack;
  slashSound.play();
  triggerShake(combatParty.indexOf(target));

  if (target.health < 0) {
    target.health = 0;
  }

  combatMessage =
    enemy.name + " attacked " + target.name +
    " for " + enemy.attack + " damage!";

  // Check if party is defeated
  let remainingMembers = combatParty.filter(
    member => member.health > 0
  );

  if (remainingMembers.length === 0) {
    combatOver = true;
    combatResult = "DEFEAT!";
    return;
  }

// Recover MP for surviving party members
for (let character of combatParty) {
  if (character.health > 0) {
    character.mp = Math.min(
      character.mp + 10,
      character.maxMP
    );
  }
}

advanceLimitBreakCooldown();
  // Begin next round with first surviving character
  currentActor = 0;

  while (currentActor < combatParty.length && combatParty[currentActor].health <= 0){
    currentActor++;
  }

  selectedAbility = 0;
}

function triggerShake(target) {
  if (target === "enemy") {
    enemyShake = millis();
  }
  else {
    characterShake[target] = millis();
  }

}

function advanceLimitBreakCooldown() {
  // Only the first party member can use Limit Break
  if (limitBreakReady) {
    return;
  }

  limitBreakRoundCounter++;
  // Unlock Limit Break every 3 completed rounds
  if (limitBreakRoundCounter >= 3) {
    limitBreakReady = true;
    combatMessage = combatParty[0].name + "'s Limit Break is ready!";
  }
}
function getDisplayedAbility(actorIndex, abilityIndex) {

  // Replace the third ability with Limit Break
  // only for the first party member
  if (actorIndex === 0 && abilityIndex === 2 && limitBreakReady) {
    return combatParty[0].limitBreak;
  }

  return combatParty[actorIndex].abilities[abilityIndex];
}