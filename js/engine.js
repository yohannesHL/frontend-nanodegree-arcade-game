/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = game.canvas.width;
    canvas.height = game.canvas.height;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;


        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();
        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        if (game.state !== '') {
            console.log('not updating', game.state)
            return;
        }
        game.update(dt);
        updateEntities(dt);
        handleCollisions(dt);
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        lootItems.forEach(function(item) {
            item.update(dt);
        });

        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        player.update(dt);
        buddy.update(dt);
        boss.update(dt)
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function renderState(state) {



        // handle game states

        if (game.state === 'start') {
            game.isAnimating = true;

            renderStartScreen();

        } else if (game.isAnimating && game.state === 'fail') {
            ctx.save();
            ctx.fillStyle = 'rgba(50,50,50,0.05)';
            ctx.fillRect(150, 200, 400, 300);
            ctx.fillStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(150, 200, 400, 300);

            drawText('Oops!...Try Again!', 'bold 34px Futura', '#fff', 200, 350);
            drawTextStroke('Oops!...Try Again!', 'bold 34px Futura', '#c93', 200, 350);

            ctx.restore();

        } else if (game.state === 'lost') {
            window.topScore = score > topScore ? score : topScore;
            renderGameOver();
        } else if (game.state ==='complete') {
            renderGameComplete();
        } else if (game.state == 'pause'){
            renderGamePause();
        }

    }

    function render() {

        var rate = 0.01; // this controls the speed of screen animations/transitions

        if (window.animDelta < 1) {
            window.animDelta += rate;
        }


        if (game.state !== '') {

            renderState();

        } else {
            game.render(); //?
            renderGamePanes();
            renderEntities();

            if (game.levelUp) {
                rate = 0.0075;
                if (window.animDelta >= 1) {
                    game.levelUp = false;
                }
                renderLevelUp();
            }
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        if (lootItems.length > 0) {
            lootItems.forEach(function(item) {
                item.render();
            });
        }
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
        boss.render();
        buddy.render();

    }

    function renderGamePanes(dt) {
        ctx.save();
        var bgcolor = '#fff',
            fontColor = 'rgb()';
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        // draws instructional text displayed at bottom
        ctx.clearRect(0, canvas.height - 20, canvas.width, 20);
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        drawText("Press P to pause ", "bold 18px Monospace", "#000", 32, ctx.canvas.height - 22);
        // displays top stats like level,time,score
        ctx.clearRect(0, 0, canvas.width, 50);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, 50);
        var gradient = ctx.createRadialGradient(350, 5, 50, 350, 5, 200);
        gradient.addColorStop(0, "#ca9");
        gradient.addColorStop(1, "#fff");
        var gradient2 = ctx.createRadialGradient(350, 5, 15, 350, 5, 250);
        gradient2.addColorStop(0, "#fff");
        gradient2.addColorStop(1, "#000");



        var longTime = "0:" + (Math.floor(game.gameTime / 60)).toFixed(0) + ":" + (game.gameTime % 60).toFixed(0);
        drawText(longTime, "bold 26px Monospace", "#6a6", 10, 10);


        // shaddow effect for box and text
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#aaa';

        // background boxes
        ctx.fillStyle = gradient;
        ctx.fillRect(200, 2, 120, 40);
        ctx.lineWidth = 7;
        ctx.strokeStyle = gradient2;
        ctx.fillStyle = gradient;
        ctx.fillRect(380, 2, 120, 40);
        ctx.fillStyle = 'rgba(150,220,50,0.75)';

        ctx.fillRect(310, 2, 80, 40);

        ctx.strokeRect(310, 2, 80, 40);

        // score - this is capped at 99999
        var hiScore = game.score > 99999 ? 99999 : game.score;
        drawText(hiScore, "bold 30px Monospace", "#ffd", 210, 3);
        ctx.lineWidth = 0.5;
        drawTextStroke(hiScore, "bold 31px Monospace", "#9a9", 210, 3);

        // level
        drawText(game.level + "/" + game.maxLevel, "bold 32px Monospace", 'rgb(230,180,50)', 325, 3);
        drawTextStroke(game.level + "/" + game.maxLevel, "bold 33px Monospace", "#ada", 325, 3);



        // displays the life indicators
        // the player.lives value is used to draw hearts
        var xInterval = 25;
        for (var i = player.lives; i > 0; i--) {
            ctx.drawImage(Resources.get('images/heart.png'), 486 - i * xInterval, 3, 23, 40);
        }

        ctx.restore();
    }

    function failedAttempt() {
        setTimeout(function() {
            game.animationTime = 0;
            game.isAnimatating = false;
            game.state = '';
        }, 2000);

        game.isAnimating = true;
        game.state = 'fail';
        player.kill();
    }


    function handleCollisions(dt) {
        //player-boss player-enemy & enemy-enemy collision
        enemyCollision(dt);

        //player-buddy collision/pairup
        if (player.isCollision(buddy)) {
            buddy.isPaired = true;
            player.react('paired');
            boss.awake();
        }

        // item-player collision
        lootItems.forEach(function(item) {
            var collision = player.isCollision(item);
            if (collision) {
                item.collect();

                if (item.name === 'heart') {
                    player.lives = player.lives < 3 ? player.lives + 1 : 3;
                } else if (item.name === 'star') {

                    setTimeout(function() {
                        player.invincible = false
                    }, 3500); //reset to normal state after 3.5 secs

                    player.invincible = true;
                } else if (item.name === 'key' && buddy.isPaired) {
                    ////levelUp();
                    //gameisAnimating
                    if (game.level < 3) {
                        game.level++;
                        game.levelUp = true;
                        reset();
                    } else {
                        game.state='complete';
                    }
                }
            }
        });

    }

    function renderLevelUp() {

        ctx.save();

        // simple animation
        ctx.scale(1, animDelta * animDelta);

        drawText(
            'Level ' + game.level, // text
            "bold 80px Helvetica", //font
            "#F5DB1B", // text color
            100, 260 // x,y location
        );

        ctx.lineWidth = 2; // set stroke thickness
        drawTextStroke(
            'Level ' + game.level, // text
            "bold 60 px Helvetica", //font
            "#F7743E", // text color
            100, 260 // x,y location
        );

        ctx.restore();

    }


    function renderStartScreen() {
        // this value is used to allow smoother transitions
        var deltaSquared = animDelta * animDelta;

        var bgCode = Math.round((deltaSquared) * 220); // rgb color code for background
        var width = game.canvas.width,
            height = game.canvas.height;
        var gradient2 = ctx.createLinearGradient(0, 0, 200, 0);
        gradient2.addColorStop(0, "#444");
        gradient2.addColorStop(1, '#FFE5FF');
        // gradient for box border
        var gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 200);
        gradient.addColorStop(0, "#fff");
        gradient.addColorStop(1, "#b599b5");

        ctx.save(); // save context settings so they can be restored later

        //        ctx.clearRect(0, 0, width, height); // clear canvas

        // background that fades from black to white
        ctx.fillStyle = "rgb(" + bgCode + ", " + bgCode + ", " + bgCode + ")";
        ctx.fillRect(0, 0, width, height); // draw background

        // title
        drawText(" Bugz! ",
            "94px comic sans",
            "rgba(100, 180, 100," + deltaSquared + ")",
            200, -(width / 2) + 3 * deltaSquared * (width / 4)
        );

        // subtitle
        drawText(" A Classic Arcade Game using HTML5 canvas.",
            "16px Monospace",
            "rgb(0, 0, 0)", width * 1.2 -
            width * animDelta, 250
        );

        // this content is delayed slightly
        // this will be drawn when the title animation is complete
        if (animDelta > 0.99) {

            // shaddow effect for box and text
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#bbb';
            ctx.fillStyle = '#203A41'; // fill color
            ctx.lineWidth = 15; // set the stroke line width

            // here we are using a gradient to create a metalic look around the box border
            ctx.strokeStyle = gradient;

            ctx.fillRect(30, 350, width - 60, 200); // draw a box
            ctx.strokeRect(30, 350, width - 60, 200); // draw the box border

            // intro/story text
            drawText([
                    "!#*% ... An accident at the research lab ... Stay clear! ...",
                    " ... ... ... Zombie mutant bugz?!? ... humungous and deadly ...",
                    " ... they ave escaped! and now they're causing mayhem! ...",
                    " Be the Hero,save your friends and the princess!",
                    " Hurry! "
                ],
                "18px Monospace",
                "#A3B235",
                50, 400);

            // instruction text
            drawText([
                    "Use the arrow keys to move",
                    "",
                    "    Press SPACE to Play "
                ],
                "20px Monospace", "rgb(0, 0, 0)",
                200, 600);
        }

        // restore origional settings - so that the settings above (ie shadow/ lineWidth)
        // wount leak out to other draw methods
        ctx.restore();

    }
    function renderGamePause() {
        ctx.fillStyle='rgba(0,0,0,0.005)';
        ctx.fillRect(0,0,game.canvas.width,game.canvas.height);
        drawText("Pause ",
            "bold 82px Monospace", "rgb(0,0,0)",
            230, 400);
        drawTextStroke("Pause ",
                "bold 82px Monospace", "#fff",
                230, 400);

}
    function renderGameComplete() {
        //var animDelta = game.animationTime * Math.random();
        ctx.save();

        ctx.scale(animDelta, animDelta);
        ctx.translate(Math.abs(animDelta - 1) * ctx.canvas.width, Math.abs(animDelta - 1) * ctx.canvas.height);
        ctx.lineWidth = 5;
        drawTextStroke("Congratulations! ",
            "bold 75px Monospace", "rgb(200, 150, 20)",
            25, 300);
        drawText("Congratulations! ",
            "extrabold 75px Monospace", "rgb(220,90,20)",
            25, 300);

        if (animDelta > 0.99) {
            drawText("Press SPACE to Play Again ",
                "bold 30px Monospace", "#000",
                200, 500);
            ctx.lineWidth = 0.05;
            drawTextStroke("Press SPACE to Play Again ",
                "30px Monospace", "#fff",
                200, 500);
        }

        ctx.restore();

    }

    function enemyCollision(dt) {
            // boss-player collision
            if (boss.isCollision(player)) {
                if (boss.isSleep) {
                    player.react('sleep');
                } else {
                    failedAttempt();
                    boss.reset();
                }
            }

            // enemy-player collision
            allEnemies.forEach(function(enemy) {

                //check player-enemy/buddy-enemy collision
                var collision = player.isCollision(enemy);
                //player collides with enemy
                if (collision && game.state !== 'lost') {
                    if (!player.invincible) {
                        failedAttempt(); //remove player life
                    }
                    enemy.reset();
                }

                // handle enemy-enemy collision
                enemy.handleEnemyCollision(dt);
            });

        }
        /* This function does nothing but it could have been a good place to
 * handle game reset states - maybe a new game menu or a game over screen
         * those sorts of things. It's only called once by the init() method.
         */
    function reset() {
        // noop
        /*player.reset();
        boss.init();
        ;*/
        console.log('reset to next')
        game.init();
        //buddy.init()
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/enemy-bug-yellow.png',
        'images/enemy-bug-green.png',
        'images/enemy-bug-blue.png',
        'images/enemy-bug-purple.png',
        'images/enemy-bug-reversed.png',
        'images/enemy-bug-yellow-reversed.png',
        'images/enemy-bug-green-reversed.png',
        'images/enemy-bug-blue-reversed.png',
        'images/enemy-bug-purple-reversed.png',
        'images/char-boy.png',
        'images/heart.png',
        'images/gem blue.png',
        'images/gem orange.png',
        'images/gem green.png',
        'images/star.png',
        'images/key.png',

        'images/SpeechBubble.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
