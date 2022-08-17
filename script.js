const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  heigth: 640,

  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: false,
    },
  },
};

// game variables

const game = new Phaser.Game(config);

let ball;
let lava;
let paddle;
let score = 0;
let highScore
let highScoreText
let lives = 3;
let scoreText;
let livesText;
let brickInfo = {
  width: 50,
  height: 20,
  count: {
    row: 4,
    col: 12,
  },
  offset: {
    top: 90,
    left: 60,
  },
  padding: 10,
};
let gameStarted = false
let cursors

function preload() {
  this.load.image("ball", "/assets/images/ball.png");
  this.load.image("paddle", "/assets/images/paddle.png");
  this.load.image("blue-tile", "/assets/images/blue-tile.png");
  this.load.image("green-tile", "/assets/images/green-tile.png");
  this.load.image("red-tile", "/assets/images/red-tile.png");
  this.load.image("violet-tile", "/assets/images/violet-tile.png");
  this.load.audio("music", "/assets/sounds/breakout_music.mp3");
  this.load.image("background", "/assets/images/background.png")
}

function create() {

  scene = this;

  scene.background = scene.add.image(0, 0, "background").setOrigin(.5, .5).setScale(4)

  music = this.sound.add("music");

      let musicConfig = {
        mute: false,
        volume: 0.3,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0,
      };
      music.play(musicConfig);

  paddle = this.physics.add.sprite(400, 700, "paddle");
  paddle.setScale(0.2);

  ball = scene.physics.add.sprite(400, 665, "ball")
  ball.setScale(0.15)

  lava = scene.add.rectangle(0, 750, 200000, 10, 0x000000);

  scoreText = scene.add.text(16, 16, "Score: " + score, {
    fontSize: "32px",
    fill: "#FFF",
  });

  highScoreText = scene.add.text(300, 16, "High Score: " + highScore, {fontsize: '32px', fill: "#FFF"})

  livesText = scene.add.text(630, 16, "Lives: " + lives, {
    fontSize: "32px",
    fill: "#FFF",
  });

  scene.physics.add.existing(ball);
  scene.physics.add.existing(paddle);
  scene.physics.add.existing(lava);

  ball.body.velocity.x = 500;
  ball.body.velocity.y = 500;
  ball.body.collideWorldBounds = true;
  ball.body.bounce.y = 1;
  ball.body.bounce.x = 1;

  paddle.body.immovable = true;
  lava.body.immovable = true;

  scene.physics.add.collider(paddle, ball, bounceOffPaddle);

  createBricks();

  scene.physics.add.collider(ball, lava, hitLava);
  scene.input.on("pointermove", function (pointer) {
    paddle.setPosition(pointer.x, paddle.y);
  });

  cursors = this.input.keyboard.createCursorKeys();


  openingText = this.add.text(
    this.physics.world.bounds.width / 2,
    this.physics.world.bounds.height / 2,
    "Press SPACE to Start",
    {
      fontFamily: "Monaco, Courier, monospace",
      fontSize: "50px",
      fill: "#fff",
    }
  );

  openingText.setOrigin(0.5);
}

function update() {
      highScoreText.setText(
        "High Score: " + localStorage.getItem("breakouthighscore")
      );{
      if (score > localStorage.getItem("breakouthighscore")) {
        localStorage.setItem("breakouthighscore", score);
      }
    }

  if (lives === 0) {
    location.reload();
  }
  if (score === brickInfo.count.row * brickInfo.count.col) {
    location.reload();
  }

  if (!gameStarted) {
    ball.setX(paddle.x);
      ball.body.velocity.x = 0;
      ball.body.velocity.y = 0;


    if (cursors.space.isDown) {
      gameStarted = true;
      ball.setVelocityY(-500);
      openingText.setVisible(false);
    }
  }
}

function bounceOffPaddle() {
  ball.body.velocity.x = -1 * 5 * (paddle.x - ball.x);
}

function createBricks() {
  for (c = 0; c < brickInfo.count.col; c++) {
    for (r = 0; r < brickInfo.count.row; r++) {
      let brickX =
        c * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
      let brickY =
        r * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
      manage(
        scene.physics.add.existing(
          scene.add.rectangle(brickX, brickY, 50, 20, 0xffffff)
        )
      );
    }
  }

}

function manage(brick) {
  brick.body.immovable = true;
  scene.physics.add.collider(ball, brick, function () {
    ballHitBrick(brick);
  });
}

function ballHitBrick(brick) {
  brick.destroy();
  score++;
  scoreText.setText("Score: " + score);
  console.log(highScore)
}

function hitLava() {
  lives--;
  livesText.setText("Lives: " + lives);
}