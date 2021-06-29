const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");
const paddle_w = 100;  //PADDLE WIDTH
const paddle_h = 20;   //PADDLE HEIGHT
const paddle_mb = 50;  //PADDLE MARGIN BOTTOM
const ballrad = 8;    // RADIUS OF BALL
const BACKGROUND = new Image;
let gameover = false;
let life = 3; // COUNT OF LIFE
let lA = false;  // LEFT ARROW FOR PADDLE
let rA = false;   // RIGHT ARROW FOR PADDLE
let score = 0;
let score_unit = 10;
let Level = 1;
let max_level = 3;
let BRICK_HIT = new Audio();
let PADDLE_HIT = new Audio();
let LIFE_LOST = new Audio();
let WALL_COLLISION = new Audio();
let WIN_SOUND = new Audio();
BACKGROUND.src = "index.png"
BRICK_HIT.src = "./sounds/sounds_brick_hit.mp3";
PADDLE_HIT.src = "./sounds/sounds_paddle_hit.mp3";
LIFE_LOST.src = "./sounds/sounds_life_lost.mp3";
WALL_COLLISION.src = "./sounds/sounds_wall_collision.mp3";
WIN_SOUND.src = "./sounds/sounds_win_sound.mp3";
ctx.lineWidth = 3
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        lA = true;
    }
    else if (event.key === "ArrowRight") {
        rA = true;
    }
});
document.addEventListener("keyup", function (event) {
    if (event.key === "ArrowLeft") {
        lA = false;
    }
    else if (event.key === "ArrowRight") {
        rA = false;
    }
});

//PADDLE OBJECT
const paddle = {
    x: cvs.width / 2 - paddle_w / 2,
    y: cvs.height - paddle_mb - paddle_h,
    width: paddle_w,
    height: paddle_h,
    dx: 8
}

//FUNCTION FOR DRAWING PADDLE
function draw_p() {
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.fillStyle = "black";
    ctx.fillRect(paddle.x, paddle.y, paddle_w, paddle_h);
    ctx.strokeStyle = "white";
    ctx.strokeRect(paddle.x, paddle.y, paddle_w, paddle_h);

}

//BALL OBJECT
const ball = {
    x: cvs.width / 2,
    y: paddle.y - ballrad,
    radius: ballrad,
    speed: 7,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -6
}

//FUNCTION FOR MOVING PADDLE
function move_p() {
    if (rA && paddle.x + paddle.width < cvs.width) {
        paddle.x += paddle.dx;
    }
    else if (lA && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

//FUNCTION FOR DRAWING BALL
function draw_ba() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "orange";
    ctx.stroke();
    ctx.closePath();
}

//FUNCTION FOR MOVING BALL
function move_b() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

//FUNCTION FOR COLLISION BETWEEN BALL AND PADDLE
function ballpaddle() {
    if (ball.x < paddle.x + paddle.width && ball.x > paddle.x && ball.y < paddle.y + paddle.height && ball.y > paddle.y) {
        let cp = ball.x - (paddle.x + paddle.width / 2);
        cp = cp / (paddle.width / 2);
        let angle = cp * Math.PI / 3;
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
        PADDLE_HIT.play();
    }
}

//FUNCTION FOR COLLISION BETWEEN BALL AND WALL
function ballwall() {
    if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        WALL_COLLISION.play();
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        WALL_COLLISION.play();
    }
    if (ball.y + ball.radius > cvs.height) {
        LIFE_LOST.play();
        life -= 1;
        reset();
    }
}

//FUNCTION FOR RESETING BALL STATE
function reset() {
    ball.x = cvs.width / 2;
    ball.y = paddle.y - ballrad;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -6;
}

//BRICK OBJECT
const brick = {
    row: 1,
    column: 5,
    width: 55,
    height: 20,
    osl: 20, // OFFSETLEFT
    ost: 20, // OFFSETTOP
    Mt: 40, // MARGINTOP
    fill: "red",
    stroke: "white"
}
let bricks = [];

//FUNCTION FOR CREATING BRICKS
function create_b() {
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.osl + brick.width) + brick.osl,
                y: r * (brick.ost + brick.height) + brick.ost + brick.Mt,
                status: true
            }
        }
    }
}
create_b();

//FUNCTION FOR DRAWING BRICKS
function draw_br() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                ctx.fillStyle = brick.fill;
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                ctx.strokeStyle = brick.stroke;
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

//FUNCTION FOR COLLISION BETWEEN BALL AND BRICKS
function ballbrick() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            let b = bricks[r][c];
            if (b.status) {
                if (ball.x + ball.radius > b.x && ball.x + ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height) {
                    ball.dy = -ball.dy;
                    b.status = false;
                    score += score_unit;
                    BRICK_HIT.play();
                }
            }
        }
    }
}

//FUNCTION FOR CHANGE OF LEVEL
function levelup() {
    let islevel = true;
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.column; c++) {
            islevel = islevel && !bricks[r][c].status;
        }
    }
    if (islevel) {
        if (Level >= max_level) {
            WIN_SOUND.play();
            gameover = true;
            show("Win Win !", cvs.width / 2 - 45, cvs.height / 2);
            return;
        }
        brick.row++;
        create_b();
        ball.speed += 0.5;
        reset();
        Level += 1
    }
}

//FUNCTION FOR DISPLAYING TEXT INFORMATION
function show(text, textx, texty) {
    ctx.fillStyle = "white";
    ctx.font = "25px Germania One";
    ctx.fillText(text, textx, texty);
}

//FUNCTION TO CHECK IF USER LOST
function game_over() {
    if (life < 0) {
        gameover = true;
        show("Game Over", cvs.width / 2 - 40, cvs.height / 2);
        show("Refresh to Play Again!", cvs.width / 2 - 100, cvs.height / 2 + 30);
    }
}

//MAIN FUNCTION FOR DRAWING ALL OBJECTS
function draw() {
    draw_p();
    draw_ba();
    draw_br();
    show("Score: " + score, 35, 25);
    show("Life: " + life, cvs.width - 85, 25);
    show("Level: " + Level, cvs.width / 2 - 40, 25);
}

//MAIN FUNCTION FOR MOVEMENT OF OBJECTS
function update() {
    move_p();
    move_b();
    ballwall();
    ballpaddle();
    ballbrick();
    levelup();
    game_over();
}

//MAIN FUNCTION TO CHANGE FRAMES
function loop() {
    ctx.drawImage(BACKGROUND, 0, 0, 400, 500);
    draw();
    update();
    if (!gameover) {
        requestAnimationFrame(loop);
    }
}
loop();