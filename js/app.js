//'use strict'
/*
 *==============================================================================
    Class Definitions
 *==============================================================================
 */
/* World Class
 * ==========
 * holds all the game properties and methods pertaining to game state
 */
var Game = function() {
    this.animationTime = 0;
    this.isAnimating = false;
    this.level = 1;
    this.state = 'start';
    this.resetGame(); // reset properties

};

Game.prototype = {
    gridWidth: 101,
    gridHeight: 83,
    numRows: 8,
    numCols: 7,
    canvas: {
        x: 0,
        y: 50,
        width: 707,
        height: 765
    },
    rowImages: {
        stone: 'images/stone-block.png',
        grass: 'images/grass-block.png',
        water: 'images/water-block.png'
    },
    maxLives: 3,
    enemyTypes: [{
        url: 'images/enemy-bug.png',
        minSpeed: 25,
        maxSpeed: 50
    }, {
        url: 'images/enemy-bug-green.png',
        minSpeed: 45,
        maxSpeed: 75
    }, {
        url: 'images/enemy-bug-yellow.png',
        minSpeed: 50,
        maxSpeed: 100
    }, ],
    levels: {
        1: {
            itemNames: ['heart', 'orangeGem', 'blueGem', 'greenGem'],
            maxItems: 5,
            minEnemies: 5,
            maxEnemies: 10,
            enemyLaneRows: [2, 3, 4, 5],
            rowList: ['grass', 'stone', 'stone', 'stone', 'stone', 'stone', 'grass', 'water'],
            playerPos: [600, 575],
            bossPos: [125, 110],
            buddySprite: {
                url: 'images/char-cat-girl.png',
                pos: {
                    x: 10,
                    y: 51
                }
            },
            bounds: { // world bounds
                x: 0,
                y: 55,
                r: 707,
                b: 625
            }
        },
        2: {
            itemNames: ['heart', 'star', 'blueGem', 'greenGem', 'orangeGem'],
            maxItems: 5,
            minEnemies: 6,
            maxEnemies: 15,
            enemyLaneRows: [2, 3, 4, 5],
            rowList: ['water', 'grass', 'stone', 'stone', 'stone', 'stone', 'grass', 'water', ],
            bossPos: [125, 540],
            playerPos: [101, 50],
            buddySprite: {
                url: 'images/char-horn-girl.png',
                pos: {
                    x: 10,
                    y: 550
                }
            },
            bounds: {
                x: 0,
                y: 133, //83+50
                r: 707,
                b: 625
            }
        },
        3: {
            itemNames: ['heart', 'star', 'blueGem', 'greenGem', 'orangeGem'],
            maxItems: 5,
            maxEnemies: 10,
            maxEnemies: 20,
            enemyLaneRows: [2, 3, 4, 5],
            rowList: ['grass', 'stone', 'stone', 'stone', 'stone', 'stone', 'grass', 'grass', ],
            bossPos: [505, 200],
            playerPos: [303, 625],
            buddySprite: {
                url: 'images/char-princess-girl.png',
                pos: {
                    x: 505,
                    y: 50
                }
            },
            bounds: {
                x: 0,
                y: 50,
                r: 707,
                b: 708
            }
        },
    },
    availableItems: {
        'key': {
            url: 'images/key.png',
            points: 500,
            name: 'key'
        },
        'blueGem': {
            url: 'images/gem blue.png',
            points: 200,
            name: 'blue gem'
        },
        'greenGem': {
            url: 'images/gem green.png',
            points: 250,
            name: 'green gem'
        },
        'orangeGem': {
            url: 'images/gem orange.png',
            points: 300,
            name: 'orange gem'
        },
        'star': {
            url: 'images/star.png',
            points: 500,
            name: 'star'
        },
        'heart': {
            url: 'images/heart.png',
            points: 500,
            name: 'heart'
        }
    },
    /* initGame:
     * initialize game - initialiaze all entities
     */
    initGame: function() {
        window.allEnemies = [];
        window.lootItems = [];
        // create new player instance in the global context
        window.player = new Player();
        window.buddy = new Buddy();
        this.generateItems()
        window.boss = new Boss();
        // create new enemy instances in the global context
        for (var i = 0; i < this.current('minEnemies'); i++) {
            allEnemies.push(new Enemy());
        }
    },
    /* generateItems: populates lootItems Array with Loot
     */
    generateItems: function() {
        for (var i = 0; i < this.current('maxItems'); i++) {
            lootItems.push(new Loot());
        }
    },
    /* incrementEnemies:
     * increment enemy numbers as the game progresses
     * a new enemy is added every 5 seconds until maxEnemies count is reached
     */
    incrementEnemies: function() {
        var condition1 = Math.round(this.gameTime) % 5 === 0,
            condition2 = allEnemies.length < this.current('maxEnemies');

        if (condition1 && condition2) {
            var enemy = new Enemy();
            allEnemies.push(enemy);
        }
    },
    /* resetGame:
     * resets game properties
     */
    resetGame: function() {
        this.score = 0;
        this.gameTime = 0;
        this.animationTime = 0;
        this.maxLevel = 3;
        this.level = 1;
        this.isAnimating = true;
        this.state = 'start';
    },
    /* update:
     * updates relavent properties every frame, calls updateEntities() and incrementEnemies()
     * @param: (float) dt - this time difference between animation calls
     */
    updateGame: function(dt) {
        this.gameTime += dt;
        this.incrementEnemies();
        this.updateEntities(dt);
        //this.handleCollisions();
    },
    updateEntities: function(dt) {
        lootItems.forEach(function(item) {
            item.update(dt);
        });

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        player.update(dt);
        //buddy.update(dt);
        boss.update(dt)
    },
    /* render:
     * render game scene, this is called for every frame
     */
    renderGame: function() {
        var row, col, img,
            rowImages = this.rowImages,
            rowList = this.current('rowList');

        // draws the map tiles by looking current row in rowList and
        // then loading the actual img url from rowImages
        for (row = 0; row < this.numRows; row++) {
            for (col = 0; col < this.numCols; col++) {
                img = rowImages[rowList[row]];
                ctx.drawImage(Resources.get(img), col * 101, row * 83);
            }
        }

        this.renderGamePanes();
        this.renderEntities();
    },
    /* renderEntities:
     * draws all entities/objects in game
     * this just calls a particular entities render() function
     */
    renderEntities: function() {
        // render items
        if (lootItems.length > 0) {
            lootItems.forEach(function(item) {
                item.render();
            });
        }

        // render enemies
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        // render main characters player,buddy,boss
        player.render();
        boss.render();
        buddy.render();
    },
    /* renderGamePanes:
     * draws top and bottom panes
     */
    renderGamePanes: function() {
        ctx.save();
        var bgcolor = '#fff',
            fontColor = 'rgb(0,0,0)';
        // format game time to h:s format
        var gameTime = Math.floor(game.gameTime),
            gameTime = Math.floor(gameTime / 60) + ":" + (gameTime % 60);
        var gradient = ctx.createRadialGradient(350, 5, 50, 350, 5, 200);
        gradient.addColorStop(0, "#ca9");
        gradient.addColorStop(1, "#fff");
        var gradient2 = ctx.createRadialGradient(350, 5, 15, 350, 5, 250);
        gradient2.addColorStop(0, "#fff");
        gradient2.addColorStop(1, "#000");

        // set the default text behaviour
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // draws bottom pane for text displayed at bottom
        ctx.clearRect(0, this.canvas.height - 20, this.canvas.width, 20);
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, this.canvas.height - 20, this.canvas.width, 20);
        drawText("Press P to pause ", "bold 18px Monospace", "#000", 32, ctx.canvas.height - 22);

        // draws top pane box for level,time,score
        ctx.clearRect(0, 0, this.canvas.width, 50);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, this.canvas.width, 50);

        // display game time
        drawText(gameTime, "bold 26px Monospace", "#6a6", 20, 10);

        // shaddow effect for box and text
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#aaa';

        // background boxes
        ctx.fillStyle = gradient;
        ctx.fillRect(200, 2, 120, 40); //left box
        ctx.lineWidth = 7;
        ctx.strokeStyle = gradient2;
        ctx.fillStyle = gradient;
        ctx.fillRect(380, 2, 120, 40); //right box
        ctx.fillStyle = 'rgba(150,220,50,0.75)';
        ctx.fillRect(310, 2, 80, 40); //middle box
        ctx.strokeRect(310, 2, 80, 40); //middle box border

        // display score - this is capped at 99999
        var hiScore = game.score > 99999 ? 99999 : game.score;
        drawText(hiScore, "bold 30px Monospace", "#ffd", 210, 3);
        ctx.lineWidth = 0.5;
        drawTextStroke(hiScore, "bold 31px Monospace", "#9a9", 210, 3);

        // display level text
        drawText(game.level + "/" + game.maxLevel, "bold 32px Monospace", '#fa9', 325, 3);
        drawTextStroke(game.level + "/" + game.maxLevel, "bold 33px Monospace", "#98ad8a", 325, 3);

        // displays player life indicators
        var xInterval = 25; // spacing between icons
        for (var i = player.lives; i > 0; i--) {
            ctx.drawImage(Resources.get('images/heart.png'), 486 - i * xInterval, 3, 23, 40);
        }

        ctx.restore();
    },
    resetState: function() {
        this.state = '';
    },
    togglePause: function() {
        this.state = this.state === '' ? 'pause' : '';
    },
    /* current:
     * @params: (string) key (optional) a property specific to current level
     * @returns: (object) holding all properties for current level or
     * a specific property  value
     */
    current: function(key) {
        this.level = this.level || 1;
        var current = this.levels[this.level];
        return key ? current[key] : current;
    }
};

/* =============================================================================
 * Entity base class
 * holds common properites and methods of an Entity
 *
 */
var Entity = function() {};
Entity.prototype = {
    /* setBox: sets this.box and this.start properties
     * @params: (number) x, (number) y, (number) width, (number) height
     */
    setBox: function(x, y, width, height) {
        this.box = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
        this.start = {
            x: x,
            y: y
        };
    },
    /* setBox: sets this.sprite properties
     * @params: (string) url, (number) x, (number) y, (number) width, (number) height
     */
    setSprite: function(spriteUrl, spriteX, spriteY, spriteWidth, spriteHeight) {
        this.sprite = {
            url: spriteUrl,
            x: spriteX,
            y: spriteY,
            width: spriteWidth,
            height: spriteHeight
        };
    },
    /* setOffset: sets this.offset properties
     * @params: (number) x, (number) y, (number) right, (number) bottom
     */
    setOffset: function(x, y, r, b) {
        this.offset = {
            x: x,
            y: y,
            r: r,
            b: b
        };
    },
    /* renderGamePanes:
     * draws top and bottom panes
     */
    hitbox: function() {
        return {
            x: this.box.x + this.offset.x,
            y: this.box.y + this.offset.y,
            r: this.box.x + this.offset.x + this.offset.r + this.box.width,
            b: this.box.y + this.offset.y + this.offset.b + this.box.height
        };
    },
    /* speechBubble:
     * draws a speech bubble with words
     * @params: (string) content , (integer) duration - after which it hides
     */
    speechBubble: function(content, duration) {
        //auto hide speach bubble after a set time
        setTimeout(function() {
            this.isTalking = false;
        }.bind(this), duration);

        //scaling and sizing box relative to content
        var box = this.hitbox(),
            x = box.r,
            y = box.y,
            boxH = box.b - y - 30,
            // split to 3 word chunks - source:http://stackoverflow.com/questions/23596731/
            content = content.match(/(\S+ \S+ \S+)|(\S+ \S+)(?= *\n|$)|\S+/g),
            w = content[0].length * 11,
            h = 15 + content.length * 64,
            y = y - (h - boxH);

        // drawing the speach bubble
        ctx.save()
        ctx.drawImage(Resources.get('images/SpeechBubble.png'), x, y, w, h);
        drawText(content, null, '#000', x + 15, y + 15 + (h / 2));
        ctx.restore();
    },
    /* inCollision:
     * @returns: a boolean to indicate an overlap of two objects,
     * the entity object and the input object.
     * @param: box2 - an object with properties (x,y,width,height)
     * @param(optional): proximity  - the distance between objects' edges
     */
    inCollision: function(entity2, proximity) {
        var box1 = this.hitbox();
        var box2 = entity2.hitbox();

        /*if(inside){
            box2 = entity2;
            //box.r=..

        }*/
        proximity = proximity ? proximity : 0;
        var x1 = box1.x + proximity,
            y1 = box1.y,
            x2 = box2.x + proximity,
            y2 = box2.y;
        var r1 = box1.r + proximity,
            b1 = box1.b,
            r2 = box2.r + proximity,
            b2 = box2.b;
        var xCollision = !((x1 < x2 && r1 < x2) || (x1 > x2 && r2 < x1));
        var yCollision = !((y1 < y2 && b1 < y2) || (y1 > y2 && b2 < y1));
        /*if(inside){
            var xCollision = !((x1 > x2 || r1 < r2));
            var yCollision = !((y1 > y2 || b1 < b2));
        }*/

        return (xCollision && yCollision);
    },
    /* render: draws the entity sprite
     * @params: (string) spriteImage - the sprite url
     */
    render: function(spriteImage) {
        ctx.drawImage(Resources.get(spriteImage),
            //clipping region
            this.sprite.x,
            this.sprite.y,
            this.sprite.width,
            this.sprite.height,
            //drawing region: the image will be drawn with these dimensions
            this.box.x,
            this.box.y,
            this.box.width,
            this.box.height);
    },
};

/* =============================================================================
 * Enemy Class
 * =============================================================================
 * Enemies Entity our player must avoid
 */
var Enemy = function() {
    var species = rSelect(game.enemyTypes);
    this.species = species;
    this.maxSpeed = species.maxSpeed;
    this.minSpeed = species.minSpeed;
    this.speed = this.minSpeed + this.maxSpeed * Math.random();
    this.setSprite(species.url, 0, 80, 100, 80);
    this.setBox(-game.canvas.width / 2, this.randomYpos(), 90, 83);
    this.setOffset(10, 10, -10, -30);
}

Enemy.prototype = extend(Entity.prototype, {
    /* randomYpos: chooses a random y position from enemyLaneRows
     */
    randomYpos: function() {
        var lane = rSelect(game.current('enemyLaneRows')) * game.gridHeight;
        return game.canvas.y + lane;
    },
    reset: function() {
        this.box.x = -game.canvas.width;
        this.box.y = this.randomYpos();
    },
    /* update: updates the enemy position and speed if necessary
     * @params: (number) dt - time delta
     */
    update: function(dt) {
        //ensure speed regulations are in forced
        this.speed = this.speed < this.minSpeed ? this.minSpeed : this.speed;
        this.speed = this.speed > this.maxSpeed * 1.5 ? this.maxSpeed : this.speed;
        // increment x but when out of screen go back to start position(x axis)
        this.box.x = (this.box.x > game.canvas.width * 1.5) ? -game.canvas.width : this.box.x + this.speed * dt;
    },
    /* render: call parent render function and pass this sprite.url
     */
    render: function() {
        Entity.prototype.render.call(this, this.sprite.url);
    },
    /* handleEnemyCollision:
     * handles enemy-enemy collisions to prevent overlapping as much as possible
     * @params: (number) dt - the time difference in main()
     */
    handleEnemyCollision: function(dt) {
        /* this slows down the faster bug and speeds up the slower bug
         */
        function crashEnemy(enemy1, relativePos, enemy2, dt) {
            // we'll use this value to set the new speed on collision
            var speed1 = enemy1.speed,
                speed2 = enemy2.speed,
                ratio = (speed1 / speed2),
                newSpeed = ratio >= 1 ? 10 * ratio : 10 / ratio,
                bounceStep = 2 * speed2 * ratio * dt; // bounce value after collision

            var op = relativePos === 'infront' ? 1 : -1; //sign (add/subtract)
            enemy1.box.x = enemy1.box.x + op * Math.abs(bounceStep); // initial bounce after collision
            enemy1.speed = enemy1.speed + op * Math.abs(newSpeed); // new speed resulting from collision
            op = -1 * op; // opposite
            enemy2.box.x += op * Math.abs(bounceStep)
            enemy2.speed += op * Math.abs(newSpeed);
        }

        var enemy1 = this;
        var x1 = enemy1.box.x;

        for (var i = 0; i < allEnemies.length; i++) {
            var enemy2 = allEnemies[i];
            var x2 = enemy2.box.x;
            var option = x2 < x1 ? 'infront' : 'behind';

            //enemies bump into each other if they're close enough
            if (enemy2.inCollision(enemy1, 80)) {
                crashEnemy(enemy1, option, enemy2, dt);
            }
        }
    }
});

/*==============================================================================
 * Boss Class
 *==============================================================================
 * Main enemy
 *
 */
var Boss = function() {
    var pos = game.current('bossPos');
    this.setBox(pos[0], pos[1], 120, 100);
    this.furyFlare = ['images/enemy-bug-blue.png', 'images/enemy-bug-purple.png'];
    this.setSprite('images/enemy-bug.png', 0, 75, 100, 80);
    this.setOffset(10, 10, -15, -30);
    this.spriteReversed = false;
    this.isChasing = false;
    this.isSleep = true;
    this.speed = 20;
    this.lastX = 0; //
    this.frameIndex = 0; // used by draw sleep bubble
    this.aliveTime = 0; // used for animation purposes
};

Boss.prototype = extend(Entity.prototype, {
    awake: function() {
        this.isSleep = false;
        this.isChasing = true;
    },
    reset: function() {
        var pos = game.current('bossPos');
        this.box.x = pos[0];
        this.box.y = pos[1];
    },
    /* update: updates the boss position calls chase() and sets spriteReversed
     * @params: (number) dt - time delta
     */
    update: function(dt) {
        this.aliveTime += dt;
        if (this.isSleep) { // no need to update if sleeping
            return;
        }

        // chase the player
        this.box.x += (player.box.x - this.box.x) * Math.pow(1 / this.speed, 2);
        this.box.y += (player.box.y - this.box.y) * Math.pow(1 / this.speed, 2);
        // determine which direction sprite should face
        this.spriteReversed = this.lastX > this.box.x;
        this.lastX = this.box.x;
    },
    /* update: draws the sleeping animation
     */
    drawSleepBubble: function() {
        var r = this.hitbox().r,
            y = this.hitbox().y;
        var color = 'rgba(255,255,255,0.5)',
            shadowColor = '#777';

        var theTime = Math.floor(this.aliveTime - 0.02) < Math.floor(this.aliveTime) ? 2 : 1;
        if (theTime % 2 == 0) {
            this.frameIndex += 1;
        }
        this.frameIndex = this.frameIndex < 3 ? this.frameIndex : 0;

        if (this.frameIndex >= 0) {
            drawCircle(r, y, 5, color, shadowColor);
        }
        if (this.frameIndex >= 1) {
            drawCircle(r + 10, y - 15, 10, color, shadowColor);
            drawText('...', '16px Arial', '#555', r, y - 15);

            //ctx.fillRect(r + 5, y - 25, 25, 25);
        }
        if (this.frameIndex == 2) {
            drawCircle(r + 20, y - 30, 15, color, shadowColor);
            drawText('zzz', '16px Arial', '#555', r + 10, y - 25);
        }
    },
    /* render: draws the enemy with the different sprite depending on direction and state
     */
    render: function() {
        var img = this.sprite.url;

        if (this.isSleep) {
            this.drawSleepBubble();
        } else {
            img = rSelect(this.furyFlare);
        }

        if (this.spriteReversed) {
            img = img.replace('.png', '-reversed.png');
        }

        Entity.prototype.render.call(this, img);
    },
});


/* =============================================================================
 * Player Class
 * =============================================================================
 * Main character in game
 *
 */
var Player = function() {
    this.message = {
        'sleep': '...!? leave it',
        'paired': ' Now where can i find a key ...?'
    };
    this.last = {
        x: 0,
        y: 0
    };
    this.s = {
        x: 0,
        y: 0
    };
    this.playerFail = false;
    this.lives = 3;
    var pos = game.current('playerPos');
    this.setBox(pos[0], pos[1], 90, 83);
    this.setOffset(10, 15, -35, -25);
    this.setSprite('images/char-boy.png', 10, 65, 100, 80);

};

Player.prototype = extend(Entity.prototype, {
    /* update: updates the enemy position and speed if necessary
     * @params: (number) dt - time delta
     */
    update: function() {
        // Limit to screen bounds
        var bounds = game.current('bounds');
        this.box.x = Math.max(Math.min(this.box.x, bounds.r - this.box.width), bounds.x);
        this.box.y = Math.max(Math.min(this.box.y, bounds.b - this.box.height), bounds.y);
    },
    /* action: handles a players reaction to specific events
     * @params: (string) key - message identifier for the message
     */
    action: function(key) {
        this.isTalking = true;
        this.messageIndex = key; // speak message when boss is sleep

        // prevent player from waking up boss
        if (boss.isSleep) {
            var dir = game.playerDirection;
            if (dir === 'left' || dir === 'right') {
                this.box.x = boss.box.x;
                this.box.x += dir === 'right'
                            ? -this.box.width
                            :  boss.box.width;
            } else if (dir === 'up' || dir === 'down') {
                this.box.y = boss.box.y;
                this.box.y += dir === 'down'
                            ? -this.box.height
                            : boss.box.height;
            }
        }
    },
    move: function(key) {
        // given a key this returns +1 or -1 equiv to the direction component
        var xDirection = {
            'left': -1,
            'right': 1
        };
        var yDirection = {
            'up': -1,
            'down': 1
        };

        this.box.x += (xDirection[key] || 0) * game.gridWidth;
        this.box.y += (yDirection[key] || 0) * game.gridHeight;
    },
    /* kill: reduces players life an call this.reset()
     */
    kill: function() {
        --this.lives;
        this.reset();
    },
    /* reset: reset players position
     */
    reset: function() {
        var pos = game.current('playerPos');
        this.box.x = pos[0];
        this.box.y = pos[1];
    },
    /* render: render player
     */
    render: function() {
        this.super('render', this.sprite.url);
        if (this.isTalking) {
            this.speechBubble(this.message[this.messageIndex], 2000);
        }
    },
    /* handleInput: handles keyboard input
     * @params: (string) key - the key pressed
     */
    handleInput: function(key) {

        // press P to pause game if not already paused by another state
        if ((key == 'P' || key == 'p') && (game.state === 'pause' || game.state.length === 0)) {
            game.togglePause();

            // press space at game over/complete screen to play game again
        } else if (key == 'space' && (game.state === 'gameover' || game.state === 'complete')) {
            game.resetState();
            game.resetGame();
            game.initGame();

            // press space at start screen window to play game
        } else if (key == 'space' && game.state === 'start') {
            game.resetState();
            game.animationTime = 0; // clear custom animation timer
            game.isAnimating = false;

            // update player position in response to key press
        } else {
            game.playerDirection = key;
            this.move(key);
        }
    }
});

/* =============================================================================
 * Buddy Class
 * =============================================================================
 * Buddy to rescue
 */
var Buddy = function() {
    var current = game.current('buddySprite');
    this.isTalking = true;
    this.isPaired = false;
    this.setSprite(current.url, 15, 60, 70, 80); // create sprite object
    this.setBox(current.pos.x, current.pos.y, 70, 80); // create a sprite box
    this.setOffset(0, 0, 0, 0); // box offsets
};
Buddy.prototype = extend(Entity.prototype, {
    /* render: render buddy
     */
    render: function() {
        if (this.isPaired) {
            drawCircle(565, 25, 20, 'rgb(20,200,10)', '#777');
            this.setBox(550, 10, 28, 28);
            this.setSprite(this.sprite.url, 15, 60, 70, 62);
        } else if (this.isTalking) {
            this.speechBubble('help!', 2500);
        }
        Entity.prototype.render.call(this, this.sprite.url);
    },
});

/* =============================================================================
 * Loot Class
 * =============================================================================
 * Game Items player can collect in game
 * constructor:
 * @param: (object) item (optional)
 */
var Loot = function(item) {
    item = item === undefined ? this.randomItemName() : item;
    this.newItem(item);
};

Loot.prototype = extend(Entity.prototype, {
    /* newItem: generates a new item given
     * @params: (object) item
     */
    newItem: function(item) {
        var enemyLaneRows = game.current('enemyLaneRows');
        var rowIndex = rSelect(enemyLaneRows),
            colIndex = rSelect(enemyLaneRows),
            gW = game.gridWidth,
            gH = game.gridHeight
        x = (colIndex * gW),
            y = (rowIndex * gH) + (gH / 2);

        this.name = item.name;
        this.pointsValue = item.points;
        this.delayFactor = item.points * Math.random() / 25;
        this.createdAt = game.gameTime; // todo: possible problem
        this.collected = false;
        this.setSprite(item.url, 0, 40, 100, 130);
        this.setOffset(5, 10, -10, -10);
        this.setBox(x, y, 75, 85);
    },
    /* randomItemName: creates a random name including key (if buddy is assisted)
     * @return: (object) item
     */
    randomItemName: function() {
        var current = game.current();
        if (game.score > 1000 && buddy.isPaired) {
            current.itemNames.push('key');
        }
        var name = rSelect(current.itemNames);
        var item = game.availableItems[name];
        return item;
    },
    /* collect: increments game score
     */
    collect: function() {
        if (this.collected === false) {
            game.score += this.pointsValue; //increment game score
            this.collected = true;
        }
    },
    /* render: renders the item
     */
    render: function() {
        // dont render collected items or key item if buddy is not paired
        // this avoids jitters while items are being regenerated
        if (this.collected || (!buddy.isPaired && this.name === 'key')) {
            return;
        }
        Entity.prototype.render.call(this, this.sprite.url);
    },
    /* update: regenerates a new item if it was collected
     */
    update: function() {
        //regenerate collected items and the key item if  buddy is not paired
        if (this.collected || (!buddy.isPaired && this.name === 'key')) {
            this.newItem(this.randomItemName());
        }
    }
});



/*
 *==============================================================================
    Helper functions
 *==============================================================================
 */

/* rSelect: randomly selects an item from an Array
 * @params: (Array) options
 */
function rSelect(options) {
    var randomIndex = Math.ceil((options.length * Math.random())) - 1;
    return options[randomIndex];
}

/* drawCircle: draws a circle
 * @params: (num) centerX, (num) centerY, (num) radius, (string) color, (string) shadowColor
 */
function drawCircle(centerX, centerY, radius, color, shadowColor) {
    ctx.save();
    ctx.beginPath(); // shaddow effect for box and text
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = shadowColor;

    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,66,120,0.3)';
    ctx.stroke();
    ctx.restore();
}

/* extend: provides a method of extending an inherited class
 * @params: (object) proto - parent prototype, (object) options -  child prototype
 */
function extend(proto, options) {
    var prop, extended = new Object();
    extended.__proto__ = proto;
    if (typeof options === "undefined")
        return;
    extended.super = function(parentMethod, args) { //superApply
        args = Array.isArray(args) ? args : [args];
        var pm = proto[parentMethod];
        if (pm) return pm.apply(this, args);
    };
    for (prop in options) {
        extended[prop] = options[prop];
    }
    extended.callee = proto.caller;
    return extended;
}

/* drawText: a wrapper function for context.fillText()
 * @params: (Array or string) text, (string) font, (string) color, (number) x, (number) y
 */
function drawText(text, font, color, x, y) {
        var lineSpacing = 30;
        ctx.fillStyle = color || ctx.fillStyle;
        ctx.font = font || ctx.font;
        if (Array.isArray(text)) {
            for (var i = 0; i < text.length; i++) {
                ctx.fillText(text[i], x, y + i * lineSpacing);
            }
        } else {
            ctx.fillText(text, x, y);
        }
    }
    /* drawTextStroke: a wrapper function for context.strokeText()
     * @params: (Array or string) text, (string) font, (string) color, (number) x, (number) y
     */
function drawTextStroke(text, font, color, x, y) {
    var lineSpacing = 30;
    ctx.strokeStyle = color;
    ctx.font = font;
    if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            var line = text[i];
            ctx.strokeText(line, x, y + i * lineSpacing);
        }
    } else {
        ctx.strokeText(text, x, y);
    }
}

/*
 *====================================================
    Initialiaze game
 *====================================================
 */

var game = new Game();
game.initGame();
//generateItems();



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        80: 'P',
        82: 'R',
        114: 'r',
        112: 'p'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
