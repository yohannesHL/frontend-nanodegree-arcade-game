/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire 'scene'
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
        if (game.isAnimating) {
            game.animationTime += dt;
        }
        // only update if state is empty
        if (game.state === '') {
            game.updateGame(dt);
            handleCollisions(dt);
        }

    }

    /* renderState:
     * renders a scene depending on state
     * @param: (string) state
     */
    function renderState(state) {

            if (game.state === 'start') {
                renderStartScreen();

            } else if (game.state === 'fail') {
                renderGameFail();

            } else if (game.state === 'gameover') {
                window.topScore = window.topScore || 0;
                topScore = game.score > topScore ? game.score : topScore;
                renderGameOver();

            } else if (game.state === 'complete') {
                renderGameComplete();

            } else if (game.state == 'pause') {
                renderGamePause();

            } else if (game.state === 'levelup') {
                renderLevelUp();
            }
        }
        /* render: main render function calls renderGame() or renderState()
         */
    function render() {
        if (game.state !== '') {
            renderState();
        } else {
            game.renderGame();
        }
    }

    /* triggerState: sets the game state
     * it can automatically be reset (optional)
     *@params: (string) state, (number) duration (optional)
     */
    function triggerState(state, duration) {
            if (duration) {
                setTimeout(function() {
                    game.animationTime = 0;
                    game.isAnimatating = false;
                    game.state = '';
                }, duration);
            }
            game.animationTime = 0;
            game.isAnimating = true;
            game.state = state;
        }
        /* playerFail: called when player collides with enemy
         */
    function playerFail() {
            player.kill()
            if (player.lives === 0) {
                game.state = 'gameover';
                return;
            }
            triggerState('fail', 1000);
        }
        /* handleCollisions: handles Collisions between objects
         * @param; (int) dt - time delta
         */
    function handleCollisions(dt) {

        // enemy collision
        allEnemies.forEach(function(enemy) {

            //player collides with enemy
            if (player.inCollision(enemy) && game.state !== 'gameover') {
                playerFail();
                enemy.reset();
            }

            // enemy colides with enemy
            enemy.handleEnemyCollision(dt);
        });

        // boss collision
        if (boss.inCollision(player)) {
            if (boss.isSleep) {
                player.action('sleep');
            } else {
                playerFail();
                boss.reset();
            }
        }

        //buddy collision/pairup
        if (player.inCollision(buddy)) {
            buddy.isPaired = true;
            player.action('paired');
            boss.awake();
        }

        // item collision
        lootItems.forEach(function(item) {
            if (player.inCollision(item)) {
                item.collect();

                // increment player life but should be <= maxLives
                if (item.name === 'heart') {
                    player.lives = Math.min(player.lives + 1, game.maxLives);

                    // level up / game complete
                } else if (item.name === 'key' && buddy.isPaired) {
                    if (game.level === game.maxLevel) {
                        triggerState('complete');
                    } else {
                        game.level++;
                        triggerState('levelup', 2000);
                        game.initGame();
                    }
                }
            }
        });
    }

    /* renderStartScreen: draws the game start screen
     */
    function renderStartScreen() {

            // this value is used to allow smoother transitions
            var animDelta = Math.min(2, game.animationTime) * 0.5;

            var deltaSquared = animDelta * animDelta;
            var bgCode = Math.round((deltaSquared) * 220); // rgb color code for background
            var width = game.canvas.width,
                height = game.canvas.height;
            var gradient2 = ctx.createLinearGradient(0, 0, 200, 0);
            gradient2.addColorStop(0, '#444');
            gradient2.addColorStop(1, '#FFE5FF');
            // gradient for box border
            var gradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 200);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#b599b5');
            var titleColor = 'rgba(100, 180, 100,' + deltaSquared + ')',
                titleY = -(width / 2) + 3 * deltaSquared * (width / 4),
                subtitleWidth = width * 1.2 -
                width * animDelta;

            ctx.save(); // save context settings so it can be restored later

            // background that fades from black to white
            ctx.fillStyle = 'rgb(' + bgCode + ', ' + bgCode + ', ' + bgCode + ')';
            ctx.fillRect(0, 0, width, height); // draw background

            // title
            drawText(' Bugz! ', '94px comic sans', titleColor, 200, titleY);

            // subtitle
            drawText(' A Classic Arcade Game using HTML5.', 'bold 22px Futura', 'rgb(0, 0, 0)', subtitleWidth, 250);

            // this content is delayed slightly
            // this will be drawn when the title animation is complete
            if (animDelta > 0.99) {

                // shaddow effect for box and text
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 1;
                ctx.shadowBlur = 4;
                ctx.shadowColor = '#ccc';
                ctx.fillStyle = '#eedfa6'; //'#203A41'; // fill color
                ctx.lineWidth = 15; // set the stroke line width

                // here we are using a gradient to create a metalic look around the box border
                ctx.strokeStyle = gradient;

                ctx.fillRect(30, 350, width - 60, 200); // draw a box
                ctx.strokeRect(30, 350, width - 60, 200); // draw the box border

                // intro/story text
                drawText([
                        '!#*% ... An accident at the research lab ... Stay clear! ...',
                        ' ... ... ... Zombie mutant bugz?!? ... humungous and deadly ...',
                        ' ... they ave escaped! and now they\'re causing mayhem! ...',
                        ' Be the Hero,save your friends and the princess! ... Hurry! ',
                        ' Evade the Boss Bug, collect the key item to unlock levels.'
                    ],
                    '18px Monospace',
                    '#c39215',
                    40, 400);

                // instruction text
                drawText([
                        'Use the arrow keys to move',
                        '',
                        '    Press SPACE to Play '
                    ],
                    '24px Monospace',
                    'rgb(0, 0, 0)',
                    200, 600);
            }

            /* restore origional settings - so that the settings above (ie shadow/ lineWidth)
             * won't leak out to other renderings
             */
            ctx.restore();
        }
        /* renderGamePause: draws the game complete window
         */
    function renderGamePause() {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.005)';
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
            drawText('Pause ', 'bold 82px Monospace', 'rgb(0,0,0)', 230, 400);
            drawTextStroke('Pause ', 'bold 82px Monospace', '#fff', 230, 400);
            ctx.restore();
        }
        /* renderGameFail: draws the game fail window
         */
    function renderGameFail() {
            ctx.save();
            ctx.fillStyle = 'rgba(50,50,50,0.05)';
            ctx.fillRect(150, 200, 400, 300);
            ctx.fillStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(150, 200, 400, 300);
            ctx.lineWidth = 2;

            drawText('...Try Again!', 'bold 38px Futura', '#fff', 200, 350);
            drawTextStroke('...Try Again!', 'bold 38px Futura', '#c93', 200, 350);
            ctx.restore();
        }
        /* renderGameOver: draws the game over window
         */
    function renderGameOver() {
            ctx.save();
            ctx.fillStyle = 'rgba(240, 110, 100,0.005)';
            ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

            drawText('Level: ' + game.level,
                '30px Monospace', 'rgb(0, 0, 0)',
                150, 100)
            drawText('Time: ' + game.gameTime.toFixed(2),
                null, null,
                350, 100);
            drawText(game.score + ' Top Score ',
                'bold 34px comic sans', '#52a343',
                220, 180);
            ctx.lineWidth = 1;
            drawTextStroke(game.score + ' Top Score ',
                'bold 34px comic sans', '#000',
                220, 180);
            ctx.lineWidth = 2;

            drawTextStroke('Game Over! ',
                'bold 74px Monospace', '#000',
                150, 350);
            drawText('Game Over! ',
                'bold 74px Monospace', 'rgba(150, 0, 0,0.05)',
                150, 350);

            drawText('Press SPACE to Play Again ',
                'bold 28px Monospace', '#000',
                150, 500);
            ctx.restore();
        }
        /* renderGameComplete: draws the game complete window
         */
    function renderGameComplete() {
            ctx.save();
            ctx.lineWidth = 5;
            drawTextStroke('Congratulations! ',
                'bold 75px Monospace', 'rgb(200, 150, 20)',
                25, 300);
            drawText('Congratulations! ',
                'extrabold 75px Monospace', 'rgb(220,90,20)',
                25, 300);

            drawText('Press SPACE to Play Again ',
                'bold 30px Monospace', '#000',
                170, 600);
            ctx.lineWidth = 0.005;
            drawTextStroke('Press SPACE to Play Again ',
                '30px Monospace', '#fff',
                170, 600);

            ctx.restore();
        }
        /* renderLevelUp: draws the levelup screen
         */
    function renderLevelUp() {
        ctx.save();

        drawText(
            'Level ' + game.level, // text
            'bold 80px Helvetica', //font
            '#F5DB1B', // text color
            250, 360 // x,y location
        );

        ctx.lineWidth = 2; // set stroke thickness
        drawTextStroke(
            'Level ' + game.level, // text
            'bold 60 px Helvetica', //font
            '#F7743E', // text color
            250, 360 // x,y location
        );

        ctx.restore();
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
