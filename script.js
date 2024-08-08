window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 800;
  canvas.height = 720;
  let enemies = [];
  let score = 0;
  let gameOver = false;

  class InputHandler {
    constructor() {
      this.keys = [];
      // arrow function을 사용해야 함. 그렇지 않으면 this.keys 작동 안함
      // arrow fn은 자신(window)의 this를 바인드 하지 않고, 부보 스코프(lexical scoping)로 부터 받는다.
      window.addEventListener("keydown", (e) => {
        // console.log(e)
        if (
          (e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight") &&
          this.keys.indexOf(e.key) === -1
        ) {
          this.keys.push(e.key);
        }
        // console.log(e.key, this.keys);
      });
      window.addEventListener("keyup", (e) => {
        // console.log(e)
        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight"
        ) {
          this.keys.splice(this.keys.indexOf(e.key), 1);
        }
        // console.log(e.key, this.keys);
      });
    }
  }

  class Player {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 200;
      this.height = 200;
      this.x = 0;
      this.y = this.gameHeight - this.height;
      this.image = document.getElementById("playerImage");
      this.frameX = 0;
      this.maxFrame = 8 // 윗 줄 9개, 아랫 줄 7개
      this.frameY = 0;
      this.fps = 20; // 프레임간 이동 속도, 작아지면, frameInterval이 커지므로 슬로우
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 1;
      this.vy = 0;
      this.weight = 1;
    }
    draw(context) {
      // 충돌용
      context.strokeStyle = 'white';
      context.strokeRect(this.x, this.y, this.width, this.height)
      context.beginPath();
      context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI*2)// (x중심, y중심,반자름, 시작각, 끝각)
      context.stroke()

      // context.strokeStyle = 'blue';
      // context.beginPath();
      // context.arc(this.x, this.y, this.width/2, 0, Math.PI*2)// (x중심, y중심,반자름, 시작각, 끝각)
      // context.stroke()

      //   context.fillStyle = "white";
      //   context.fillRect(this.x, this.y, this.width, this.height);
      // context.drawImage(this.image, sx, sy, sw, sh, this.x, this.y, this.width, this.height)
      context.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(input, deltaTime, enemies) {
      // 충돌 감지
      enemies.forEach(enemy => {
        // 사각으로 충돌 첵크하면 오류 큼
        // const dx = enemy.x - this.x;
        // const dy = enemy.y - this.y;
        
        // 사각의 x,y 를 arc의 중심점으로 옮김
        const dx = (enemy.x + enemy.width/2 - 10) - (this.x + this.width/2);
        const dy = (enemy.y + enemy.height/2 + 20 ) - (this.y + this.height/2);
        const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < enemy.width/2 + this.width/2){
          gameOver = true;
        }
      })
        // sprite animation
        if(this.frameTimer > this.frameInterval){
            if (this.frameX >= this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        // controls
      if (input.keys.indexOf("ArrowRight") > -1) {
        this.speed = 5;
      } else if (input.keys.indexOf("ArrowLeft") > -1) {
        this.speed = -5;
      } else if (input.keys.indexOf("ArrowUp") > -1 && this.onGround()) {
        this.vy -= 30;
      } else {
        this.speed = 0;
      }
      // 수평이동
      this.x += this.speed;
      if (this.x < 0) this.x = 0;
      else if (this.x > this.gameWidth - this.width)
        this.x = this.gameWidth - this.width;
      // 수직(Y축) 이동
      this.y += this.vy;
      // this.onGround() 에서 false를 리턴하면 vy 가 1씩 올라가며 떨어지는 효과 봄
      if (!this.onGround()) {
        this.vy += this.weight;
        this.maxFrame = 5
        this.frameY = 1;
      } else {
        this.vy = 0;
        this.maxFrame = 8;
        this.frameY = 0;
      }
      if (this.y > this.gameHeight - this.height)
        this.y = this.gameHeight - this.height;
    }
    // y축이 아래 선을 넘지 않는 한 true를 리턴 함
    onGround() {
      return this.y >= this.gameHeight - this.height;
    }
  }

  class Background {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.image = document.getElementById("backgroundImage");
      this.x = 0;
      this.y = 0;
      this.width = 2400;
      this.height = 720;
      this.speed = 10;
    }
    draw(context) {
      // this.x + this.width를 이용 뒤쪽에 하나를 더 그려서 두개로 운용. 그러나 update()의 if 문 때문에 두 번째를 전체를 스크롤 안함
      context.drawImage(this.image, this.x, this.y, this.width, this.height);
      context.drawImage(
        this.image,
        this.x + this.width,
        this.y,
        this.width,
        this.height
      );
    }
    update() {
      this.x -= this.speed;
      if (this.x < 0 - this.width) this.x = 0;
    }
  }

  class Enemy {
    constructor(gameWidth, gameHeight) {
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.width = 160;
      this.height = 119;
      this.image = document.getElementById("enemyImage");
      this.x = this.gameWidth;
      this.y = this.gameHeight - this.height;
      this.frameX = 0;
      this.maxFrame = 5; // 갯수는 6개
      this.fps = 20; // v프레임간 이동 속도
      this.frameTimer = 0;
      this.frameInterval = 1000 / this.fps;
      this.speed = 8;
      this.markedForDeletion = false;
    }
    draw(context) {
      // 충돌 (collision)
      context.strokeStyle= 'white';
      context.strokeRect(this.x, this.y, this.width,this.height);
      context.beginPath();
      // 일부러 x는 -10, y는 +20 함, 충돌용 이미지의 중심으로 이동
      context.arc(this.x + this.width/2 -10, this.y + this.height/2 +20, this.width/2, 0, Math.PI*2)// (x중심, y중심,반자름, 시작각, 끝각)
      context.stroke()

      // context.strokeStyle= 'blue';
      // context.beginPath();
      // context.arc(this.x, this.y, this.width/2, 0, Math.PI*2)// (x중심, y중심,반자름, 시작각, 끝각)
      // context.stroke()
      // context.drawImage(this.image,sx,sy,sh,this.x, this.y, this.width, this.height )
      // 1 줄이므로 하드코딩 0으로 해도됨
      // context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
      context.drawImage(
        this.image,
        this.frameX * this.width,
        0 * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
    update(deltaTime) {
      if (this.frameTimer > this.frameInterval) {
        if (this.frameX >= this.maxFrame) this.frameX = 0;
        else this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameTimer += deltaTime;
      }
      this.x -= this.speed;

      if(this.x < 0 - this.width){
        this.markedForDeletion = true;
        score++
      }
    }
  }
  // enemies.push()는 fn 안으로 들어가면 안됨: 이 것이 animate()에 의하여 매 초당 60 프레임 불리워 생성되므로 무수히 만들어 짐
  // enemies.push(new Enemy(canvas.width, canvas.height));

  function handleEnemies(deltaTime) {
    if (enemyTimer > enemyInterval + randomEnemyInterval) {
      enemies.push(new Enemy(canvas.width, canvas.height));
      enemyTimer = 0;
    } else {
      enemyTimer += deltaTime;
    }

    enemies.forEach((enemy) => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    });
    //  enemy 제거
    // console.log("enemies :",enemies)
    enemies = enemies.filter(enemy => !enemy.markedForDeletion)
  }
  function displayStatusText(context) {
    context.font = '40px Helvetica';
    context.fillStyle = 'black';
    context.fillText('Score : '+ score, 20, 50)
    context.fillStyle = 'white';
    context.fillText('Score : '+ score, 22, 52)
    if (gameOver){
      context.textAlign = 'center';
      context.fillStyle = 'black';
      context.fillText('Game Over, 다시 한번!', canvas.width/2, 200);
      context.fillStyle = 'white';
      context.fillText('Game Over, 다시 한번!', canvas.width/2 +2 , 202);
    }
  }

  const input = new InputHandler();
  const player = new Player(canvas.width, canvas.height);
  const background = new Background(canvas.width, canvas.height);
  // const enemy1 = new Enemy(canvas.width, canvas.height);

  let lastTime = 0;
  let enemyTimer = 0;
  let enemyInterval = 1000;
  let randomEnemyInterval = Math.random() * 1000 + 500;

  function animate(timeStamp) {
    // timeStap 사용하려면 animate(timeStamp) 를 매개변수 처리 해야 함
    // detatime은 1000/60 으로 나누는 것과 같으므로 16.6... 비슷 나옴
    const deltatime = timeStamp - lastTime;
    lastTime = timeStamp;
    // console.log(deltatime,"lastTime : ", lastTime)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    background.draw(ctx); // 먼저 그려야 밑그림으로
    // background.update()
    player.draw(ctx);
    player.update(input, deltatime, enemies);
    // enemy1.draw(ctx);
    // enemy1.update();
    handleEnemies(deltatime);
    displayStatusText(ctx)
    if (!gameOver) requestAnimationFrame(animate);
  }
  // timeStamp 처리 떄문에 0 넣어줌
  animate(0);
});
