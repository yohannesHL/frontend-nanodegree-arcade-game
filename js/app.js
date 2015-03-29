//'use strict'
/*
 *====================================================
    Class Definitions
 *====================================================
 */
/* World Class
 * ==========
 * holds all the game properties and methods pertaining to game state
 */
var World = function() {
    this.animationTime = 0;
    this.isAnimating = false;
    this.level = 1;
    this.reset(); // reset properties

};

World.prototype = {
    game: {
        gridWidth: 101,
        gridHeight: 83,
        canvas: {
            x: 0,
            y: 50,
            width: 505,
            height: 606
        },
        numRows: 5,
        numCols: 6,
        initialEnemyCount: 3,
        levelFeatures: {
            1: {
                itemNames: ['heart', 'star', 'blueGem', 'greenGem'],
                itemCount: 5,
                maxEnemies: 10,
                worldMatrix: [
                    [0, 0, 0, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1],
                    [3, 3, 3, 3, 3, 3, 3],
                    [3, 3, 3, 3, 3, 3, 3],
                    [3, 3, 3, 3, 3, 3, 3],
                    [1, 1, 1, 1, 1, 1, 1]
                ],
                playerLocation: [303, 55],
                enemyLaneRows: [0, 1, 2],
                buddySprite: {
                    url: 'images/char-cat-girl.png',
                    pos: {
                        x: 200,
                        y: 200
                    }
                },
                bounds: { // world bounds
                    x: 0,
                    y: 55,
                    r: 505,
                    b: 455
                }
            },
            2: {
                itemNames: ['heart', 'star', 'blueGem', 'greenGem', 'greenGem'],
                itemCount: 5,
                maxEnemies: 15,
                worldMatrix: [
                    [1, 1, 1, 1, 2, 2, 2],
                    [1, 1, 1, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1],
                    [2, 2, 2, 2, 2, 2, 2],
                    [2, 2, 2, 2, 2, 2, 2]
                ],
                buddySprite: {
                    url: 'images/char-horn-girl.png',
                    pos: {
                        x: 200,
                        y: 200
                    }
                },
                bounds: {
                    x: window.worldX,
                    y: window.worldY + 103, //83+20
                    r: window.worldR,
                    b: 415
                }
            },
            3: {
                itemNames: ['heart', 'star', 'blueGem', 'greenGem', 'greenGem'],
                itemCount: 5,
                maxEnemies: 20,
                worldMatrix: [
                    [1, 1, 1, 1, 2, 2, 2],
                    [1, 1, 1, 0, 0, 0, 0],
                    [1, 1, 1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1, 1, 1],
                    [2, 2, 2, 2, 2, 2, 2],
                    [0, 0, 0, 0, 2, 2, 2]
                ],
                buddySprite: {
                    url: 'images/char-princess-girl.png',
                    pos: {
                        x: 200,
                        y: 370
                    }
                },
                bounds: {
                    x: window.worldX,
                    y: window.worldY + 103, //83+20
                    r: window.worldR,
                    b: 415
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
    },
    currentLevel: function() {
        this.level = this.level ? this.level : 1;;
        var obj = this.game.levelFeatures[this.level];
        obj.level = this.level;
        return obj;
    },
    init: function() {
        window.allEnemies = [];
        window.lootItems = [];
        //this.generateItems()
        window.buddy = new Buddy();
        buddy.init();
        // create new player instance in the global context
        boss = new Boss();
        player = new Player();

        // create new enemy instances in the global context
        for (var i = 0; i < this.game.initialEnemyCount; i++) {
            allEnemies.push(new Enemy());
        }
    },
    // gets a list of row that dont have water
    getSolidRows: function() {
        var rows = [];
        var matrix = this.currentLevel().worldMatrix;
        for (var i = 0; i < matrix.length; i++) {
            rows.push(i); // record row index
            for (var j = 0; j < matrix[i].length; j++) {

                //remove row index if condition is true
                var cond = matrix[i][j] === 0;
                if (cond == true) {
                    var rowIndex = rows.indexOf(i); // row index to be removed
                    //remove row
                    rows.splice(rowIndex, 1);
                    break; // exit for loop
                }
            }
        }

        return rows;
    },
    generateItems: function() {
        if (this.gameTime % 2 == 0) {
            var currentLevel = this.currentLevel();

            for (var i = 0; i < currentLevel.itemCount; i++) {
                if (lootItems.length >= currentLevel.itemCount)
                    break;
                var name = randomChoice(currentLevel.itemNames);
                var item = this.game.availableItems[name];
                lootItems.push(new Loot(item));
            }
        }
    },
    boundary: function() {
        var bounds = this.game.canvas;
        return {
            x: bounds.x,
            y: bounds.y,
            r: bounds.x + bounds.width,
            b: bounds.y + bounds.height
        };
    },
    reset: function() {
        // game properties
        this.score = 0;
        this.gameTime = 0;
        this.animDelta = 0;
        this.maxLevel = 3;
        this.level = 1; // should initially be 1
        this.gameOver = false;
        this.gameComplete = false;
        this.numRows = 6;
        this.numCols = 5;
    },
    block: function(row, col) {
        yMargin = (row + 1) % this.numRows !== 0 ? this.game.canvas.y : 0;

        ctx.strokeRect(col * 101, 50 + (row * 83), 100, 83 + yMargin)

        return {
            x: col * this.game.gridWidth,
            y: (row * this.game.gridHeight) * this.game.canvas.y,
            width: this.game.gridWidth,
            height: this.game.gridHeight + yMargin
        };
    },
    newDropPos: function(option) {
        var rowIndex, colIndex, block = 0,
            retries = 5;
        var matrix = this.currentLevel().worldMatrix;
        var nrows = this.currentLevel().enemyLaneRows.length, //this.numRows,
            ncols = this.numCols,
            nrows2 = nrows - this.currentLevel().enemyLaneRows.length;

        function randomBlock(nrows, ncols) {
                rowIndex = randomInt(nrows) - 1;
                colIndex = randomInt(ncols) - 1;
                return matrix[rowIndex][colIndex];
            }
            /*
            while (block === 0 && retries > 0) {
                console.log('retry:', retries, block, rowIndex, colIndex)
                block = option === 'special' ? randomBlock(nrows2, ncols) : randomBlock(nrows, ncols);
                --retries;
            }*/
        rowIndex = randomInt(nrows) - 1;
        colIndex = randomInt(ncols) - 1;
        console.log(rowIndex, colIndex)
        var x = (colIndex * this.gridWidth) + (this.gridWidth / 2);
        var y = (rowIndex * this.gridHeight) + (this.gridHeight / 2)
        return [x, y];
    },
    incrementEnemies: function() {
        //increment enemy numbers as the game progresses
        // a new enemy is added every 5 seconds until maxEnemies number of enemies is reached
        if (this.gameTime % 5 < 0.016 && allEnemies.length < this.currentLevel().maxEnemies) {
            console.log('increase enemy')
            var enemy = new Enemy();
            allEnemies.push(enemy);
        }
    },
    update: function(dt) {
        world.gameTime += dt;
        //this.incrementEnemies();
        //this.handleCollisions();
    },
    render: function() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png', // Row 2 of 2 of grass
                'images/water-block.png' // Top row is water

            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);

            }
        }
    },
};

/* Entity base class
 * holds common properites and methods of an Entity
 *
 */
var Entity = function() {
    this.base = 5;
};

Entity.prototype = extend(World.prototype, {
    setSprite: function(spriteUrl, spriteX, spriteY, spriteWidth, spriteHeight) {
        this.sprite = {
            url: spriteUrl,
            x: spriteX,
            y: spriteY,
            width: spriteWidth,
            height: spriteHeight
        };
    },
    setOffset: function(x, y, r, b) {
        this.offset = {
            x: x,
            y: y,
            r: r,
            b: b
        };
    },
    hitbox: function() {
        return {
            x: this.box.x + this.offset.x,
            y: this.box.y + this.offset.y,
            r: this.box.x + this.offset.x + this.offset.r + this.box.width,
            b: this.box.y + this.offset.y + this.offset.b + this.box.height
        };
    },
    talk: function(content, duration) {
        //auto hide speach bubble after a set time
        setTimeout(function() {
            this.isTalking = false;
        }.bind(this), duration);
        //scaling and sizing
        var box = this.hitbox(),
            x = box.r,
            y = box.y - 50,
            w = box.r - box.x,
            h = box.b - box.y;
        var mul = content.length / 10;
        console.log('old wh', w, h)
        w = mul < 0 ? content.length * 11 : 10 * 11;
        h = 55 + (mul) * 25;
        console.log('new wh', w, h)

        // drawing the speach bubble
        ctx.save()
        ctx.drawImage(Resources.get('images/SpeechBubble.png'), x, y, w, h);

        drawText(content, null, '#000', x + 15, y + 15 + (h / 2));
        ctx.restore();
    },
    handleOutOfBounds: function(world) {
        var box = this.hitbox();
        var bounds = world ? world : this.boundary();
        bounds = this.super('currentLevel').bounds;

        if (box.x < bounds.x) {
            this.box.x = bounds.x;
        }
        if (box.y < bounds.y)
            this.box.y = bounds.y;
        if (box.r > bounds.r)
            this.box.x = bounds.r-this.box.width;
        if (box.b > bounds.b)
            this.box.y = bounds.b-this.box.height;
    },
    isEdgeCollision: function(otherBox, inside) {
        var box = this.hitbox();

        var bounds = inside ? this.boundary() : otherBox;
        var a = [];
        if (inside) {
            if (box.x < this.bounds.x)
                return 'left'
            if (box.y < this.bounds.y)
                return 'top'
            if (box.r > this.bounds.r)
                return 'right'
            if (box.b > this.bounds.b)
                return 'bottom'
        } else {
            if (box.x > this.bounds.x)
                return 'left'
            if (box.y > this.bounds.y)
                return 'top'
            if (box.r < this.bounds.r)
                return 'right'
            if (box.b < this.bounds.b)
                return 'bottom'
        }


        return false;
    },
    /* isCollision -
     * @returns: a boolean to indicate an overlap of two objects,
     * the entity object and the input object.
     * @param: box2 - an object with properties (x,y,width,height)
     * @param(optional): proximity  - the distance between two objects
     */
    isCollision: function(entity2, proximity) {
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
    debugBox: function() {
        //for debuging - draw a rect around  hit box
        var box = this.hitbox();
        ctx.save();
        ctx.fillStyle = 'rgba(200,0,0,0.5)';
        ctx.fillRect(box.x, box.y, box.r - box.x, box.b - box.y);
        ctx.strokeRect(this.box.x, this.box.y, this.box.width, this.box.height);
        ctx.fillStyle = 'rgb(0,200,200)';
        ctx.font = '24 Monospace';
        ctx.fillText('' + box.x.toFixed(0) + ',' + box.y.toFixed(0), box.x, box.y);
        ctx.restore();
    },
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
    render: function(spriteImage) {
        //ctx.drawImage(Resources.get(this.sprite.url), this.box.x, this.box.y);
        ctx.drawImage(Resources.get(spriteImage),
            //clipping region
            this.sprite.x,
            this.sprite.y,
            this.sprite.width,
            this.sprite.height,
            //drawing region: the image will be drawn with the following dimensions
            this.box.x, //x position
            this.box.y,
            this.box.width, //Todo - this should be box width
            this.box.height);
        //this.debugBox();
    },
    update: function(dt) {}
});

/* Enemy Class
 * ===========
 * Enemies our player must avoid
 */

var Enemy = function() {
    this.generate();
    this.reset();
}

Enemy.prototype = extend(Entity.prototype, {
    types: [{
        url: 'images/enemy-bug.png',
        minSpeed: 25,
        maxSpeed: 50
    }, {
        url: 'images/enemy-bug-green.png',
        minSpeed: 25,
        maxSpeed: 75
    }, {
        url: 'images/enemy-bug-yellow.png',
        minSpeed: 50,
        maxSpeed: 100
    }, ],
    enemyWorldX: -606,
    enemyWorldR: 606,
    generate: function() {
        var species = randomChoice(this.types);
        this.species = species;
        this.maxSpeed = species.maxSpeed; //
        this.minSpeed = species.minSpeed; //
        this.speed = this.minSpeed + 5 * this.maxSpeed * Math.random();
        this.setSprite(species.url, 0, 80, 100, 80);
        this.setBox(0, 0, 90, 83);
        this.setOffset(10, 10, -10, -30);
        console.log('init enemy', this.box)
    },
    randomYpos: function() {
        var lanes = this.super('currentLevel').enemyLaneRows;
        var lane = randomChoice(lanes) * this.game.gridHeight;
        return this.game.canvas.y + lane;
    },
    reset: function() {
        this.box.x = this.enemyWorldX;
        this.box.y = this.randomYpos();
    },
    update: function(dt) {
        //ensure speed regulations are in forced
        this.speed = this.speed < this.minSpeed ? this.minSpeed : this.speed;
        this.speed = this.speed > this.maxSpeed * 1.5 ? this.maxSpeed : this.speed;
        // handle movement out of screen - detect when they go a certain distance and make them go back to start position(x axis)
        this.box.x = (this.box.x > this.enemyWorldR) ? this.enemyWorldX : this.box.x + this.speed * dt;

        // check it also has valid y coords
        //this.box.x = isNaN(this.box.x) ? this.enemyWorldX : this.box.x;

        this.box.y = isNaN(this.box.y) ? this.randomYpos() : this.box.y;
        //console.log(isNaN(this.box.x)?'update enemy '+this.speed*dt+',NaN':'')
    },
    render: function() {
        this.super('render', this.sprite.url);
    },

    // handles enemy-enemy collisions to prevent overlapping as much as possible
    // this slows down the faster bug and speeds up the slower bug
    handleEnemyCollision: function(dt) {
        //enemy from behind is slowed down
        //enemy infront gets speed boost
        function changeEnemySpeed(enemy1, relativePos, enemy2, dt) {
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
            var collision = enemy2.isCollision(enemy1, 80);

            //handle collisions depending on enemy x positions
            if (collision && x2 < x1) {
                // enemy1 was infront of enemy2 and collides
                changeEnemySpeed(enemy1, 'infront', enemy2, dt);
            } else if (collision && x1 <= x2) {
                // enemy1 was behind enemy2 and collides
                changeEnemySpeed(enemy1, 'behind', enemy2, dt);
            }
        }
    }

});

var Boss = function() {
    this.isChasing = false;
    this.isSleep = true;
    this.isAwake = false;
    this.aliveTime = 0;
    this.speed = 20; //rename - slugishness?
    this.lastX = 0;
    this.setBox(25, 380, 120, 100);
    this.furyFlare = ['images/enemy-bug-blue.png', 'images/enemy-bug-purple.png'];
    this.setSprite('images/enemy-bug.png', 0, 75, 100, 80);
    this.setOffset(10, 10, -15, -30);

    this.frameIndex = 0;
};

Boss.prototype = extend(Entity.prototype, {
    chase: function() {
        //dazled !!!
        this.box.x += (player.box.x - this.box.x) * Math.pow(1 / this.speed, 2);
        this.box.y += (player.box.y - this.box.y) * Math.pow(1 / this.speed, 2);
    },
    awake: function() {
        this.isSleep = false;
        this.isAwake = true;
        this.isChasing = true;
    },
    reset: function() {
        this.box.x = this.start.x;
        this.box.y = this.start.y;
    },//
    update: function(dt) {
        this.aliveTime += dt;

        if (!(this.isSleep)) {

            this.chase();
        }
        this.spriteIsReversed = (this.lastX > this.box.x) ? true : false;

        this.lastX = this.box.x;
        var theTime = Math.floor(this.aliveTime - dt) < Math.floor(this.aliveTime) ? 2 : 1;
        if (theTime % 2 == 0) {
            this.frameIndex += 1;
        }
        this.frameIndex = this.frameIndex < 3 ? this.frameIndex : 0;
    },
    drawSleepBubble: function() {
        var r = this.hitbox().r,
            y = this.hitbox().y;
        var color = 'rgba(255,255,255,0.5)';

        if (this.frameIndex >= 0) {
            drawCircle(r, y, 5, color);
        }
        if (this.frameIndex >= 1) {
            drawCircle(r + 10, y - 15, 10, color);
            drawText('...', '16px Arial', '#555', r, y - 15);

            //ctx.fillRect(r + 5, y - 25, 25, 25);
        }
        if (this.frameIndex == 2) {
            drawCircle(r + 20, y - 30, 15, color);
            drawText('zzz', '16px Arial', '#555', r + 10, y - 25);
        }
    },
    render: function() {
        var img;
        img = this.sprite.url;

        if (this.isSleep) {
            this.drawSleepBubble();
        } else {
            img = randomChoice(this.furyFlare);
        }

        if (this.spriteIsReversed) {
            img = img.replace('.png', '-reversed.png');
        }

        Entity.prototype.render.call(this, img);
    },
});


/* Player Class
 * ============
 * Main character in game
 */
var Player = function() {
    //Entity.call(this);
    this.message = {
        'sleep': '...leave it'
    };
    this.playerFail = false;
    this.lives = 3;
    this.setSprite('images/char-boy.png', 10, 65, 100, 80);
    this.start_pos = this.super('currentLevel').playerLocation; //world.newDropPos('special');
    this.setOffset(10, 20, -35, -25);
    this.setBox(this.start_pos[0], this.start_pos[1], 90, 83);
    console.log('player init:', this.box, this.offset)
};

Player.prototype = extend(Entity.prototype, {
    update: function() {

        this.handleOutOfBounds();
    },
    rebound: function(eboss) {
        console.log('rebound......', this.super('handleOutOfBounds', eboss))
        this.super('handleOutOfBounds', eboss);
    },
    react: function(key) {
        this.isTalking = true;
        this.messageIndex = key;
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

        this.box.x += (xDirection[key] || 0) * this.game.gridWidth;
        this.box.y += (yDirection[key] || 0) * this.game.gridHeight;
    },
    kill: function() {
        --this.lives;
        if (this.lives != 0) {
            this.reset();
            this.gameOver = false;
        } else {
            this.gameOver = true;
        }
    },
    reset: function() {
        this.box.x = this.start.x;
        this.box.y = this.start.y;
    },
    render: function() {
        this.super('render', this.sprite.url);
        if (this.isTalking) {
            this.talk(this.message[this.messageIndex], 2000)
        }
    },
    handleInput: function(key) {
        // re-initialize game if space is pressed and we're at game over menu
        // or if the game is reset manually by via r/R keys
        if (key == 'P' || key == 'p') {
            //world.pause();
        } else if (key == 'space' && world.gameOver) {
            world.reset();
            // press space at start screen window to play game
        } else if (key == 'space' && world.startUp) {
            world.startUp = false;
            world.animDelta = 0; // clear custom animation timer
            // update player position in response to key press
        } else {
            this.move(key);
        }
    }
});


var Loot = function(item) {
    this.constructor.count = this.constructor.count || 1;
    if (item === undefined) {
        item = this.randomItemName();
    }
    this.newItem(item);
};
Loot.prototype = extend(Entity.prototype, {
    newItem: function(item) {
        this.constructor.count++;

        this.pointsValue = item.points;
        this.delayFactor = item.points * Math.random() / 10;
        this.createdAt = world.gameTime; // todo: possible problem
        this.name = item.name;
        this.collected = false;
        this.setSprite(item.url, 0, 40, 100, 130);
        var gW = World.prototype.game.gridWidth,
            gH = World.prototype.game.gridHeight;
        var currentLevel = World.prototype.currentLevel.call(this);

        //5, 35,
        var rowIndex = randomChoice(currentLevel.enemyLaneRows),
            colIndex = randomChoice(currentLevel.enemyLaneRows)
        var x = (colIndex * gW);
        var y = (rowIndex * gH) + (gH / 2)

        this.setOffset(5, 5, -10, -10);
        this.setBox(x, y, 75, 85);
        console.log('new item',item.name, rowIndex, x, y)
    },
    randomItemName: function() {
        var currentLevel = World.prototype.currentLevel.call(this);

        var name = randomChoice(currentLevel.itemNames);
        var item = World.prototype.game.availableItems[name];
        return item;
    },
    collect: function() {
        this.score += this.pointsValue; //increment score
        this.collected = true;
    },
    render: function() {
        var lhs = (world.gameTime - this.createdAt),
            cond = lhs > this.delayFactor;
        if (cond) {
            this.super('render', this.sprite.url);
        }
        //console.log('render item @',this.createdAt,lhs,cond,this.delayFactor);

    },
    update: function() {
        if (this.collected) {

            if (this.constructor.count % 5 === 0) {
                var names = [];
                lootItems.forEach(function(item) {
                    if (item.name == 'key') {
                        names.push(item.name);
                    }
                });

                if (names.length == 0) {
                    console.log('generating key')
                    var item=World.prototype.game.availableItems['key'];
                    this.newItem(item);
                    return;
                }
            }
            console.log('count', this.constructor.count)
            var name = this.randomItemName();
            this.newItem(name);
        }
    }
});
var Buddy = function() {

};
Buddy.prototype = extend(Entity.prototype, {
    init: function(level) {
        // this mapping maps a sprite url to each level
        var current = this.super('currentLevel').buddySprite;
        //console.log(current)
        this.isTalking = true;
        this.setSprite(current.url, 15, 60, 70, 80); // create sprite object

        this.setOffset(0, 0, 0, 0);
        this.setBox(current.pos.x, current.pos.y, 70, 80); // create a hit box/
    },
    render: function() {
        this.super('render', this.sprite.url);

        if (this.isPaired == true) { // todo: change to this

        } else {
            if (this.isTalking == true) {
                this.talk('help!', 2500)
            }
        }

    },
    update: function() {
        if (this.isPaired == true) {
            this.setBox(125, 15, 25, 25);
            this.setSprite(this.sprite.url, 15, 60, 70, 62);

        }
    }

});

/*
 *====================================================
    Helper functions
 *====================================================
 */

/* randomInt
 * returns a random integer number from 1 to a maximal number
 * input: max - a number
 */
function randomInt(max) {
    return Math.ceil((max * Math.random()));
}

function randomChoice(options) {
    var randomIndex = Math.ceil((options.length * Math.random())) - 1;
    return options[randomIndex];
}

function drawCircle(centerX, centerY, radius, color) {
    ctx.save();
    ctx.beginPath(); // shaddow effect for box and text
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#777';

    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
    //ctx.lineWidth = 5;
    //ctx.strokeStyle = '#003300';
    //ctx.stroke();
    ctx.restore();
}

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

function drawText(text, font, color, x, y) {
    var lineSpacing = 30;
    ctx.fillStyle = color || ctx.fillStyle;
    ctx.font = font || ctx.font;
    if (Array.isArray(text)) {
        for (var i = 0; i < text.length; i++) {
            var line = text[i];
            ctx.fillText(line, x, y + i * lineSpacing);
        }
    } else {
        ctx.fillText(text, x, y);

    }
}

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

var world = new World();
world.init();
generateItems();

function generateItems() {
    var currentLevel = world.currentLevel();

    for (var i = 0; i < currentLevel.itemCount; i++) {
        if (lootItems.length >= currentLevel.itemCount)
            break;
        lootItems.push(new Loot());
    }

}

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
