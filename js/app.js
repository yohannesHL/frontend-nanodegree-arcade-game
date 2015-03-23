// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.


function initGame() {

    window.game = {};

    window.worldX = 0;
    window.worldY = 50;
    window.worldWidth = ctx.canvas.width;
    window.worldHeight = ctx.canvas.height - 70;
    window.worldR = worldX + worldWidth;
    window.worldB = worldY + worldHeight;
    window.animDelta = 0;

    window.score = 0;
    window.gameTime = 0;

    window.maxLevel = 3;
    window.level = 1;

    window.gameOver = false;
    window.gameComplete = false;
    window.showLevelUp = false;
    levelComplete = false;

    window.gridWidth = 101;
    window.gridHeight = 83;

    window.currentLevel = getLevelFeatures(level);



    window.lootItems = new LootItems(
        currentLevel.itemCount,
        currentLevel.itemNames);
    window.keyItem = new Item('key');
    window.chum = new Chum(level);
    window.player = new Player();
    window.zone = new Zone(level);
    // current.maxEnemies;
    //current.initialEnemyCount

    window.allEnemies = [];
    var initialEnemyCount = 3;

    for (var i = 0; i < initialEnemyCount; i++) {
        allEnemies.push(new Enemy());
    }
}
initGame();


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',

    };

    player.handleInput(allowedKeys[e.keyCode]);
});
