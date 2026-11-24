const startButton = document.getElementById("startButton");
const quitButton = document.getElementById("quitButton");
const gameMenu = document.getElementById("gameMenu");

const gameScreen = document.getElementById("gameScreen");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const blocksLeftText = document.getElementById("blocksLeft");
const backButton = document.getElementById("backButton");

let animationId = null;
let running = false;

let paddle;
let ball;
let blocks = [];
let particles = [];

let lastTime = 0;
let elapsed = 0;

const COLORS = {
    ball: "#ffffff",
    paddle: "#d8b6ff",
    blocks: ["#9e75ff", "#bd79ff", "#e09cff", "#796aff"]
};

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!paddle || !ball) {
        resetPositions();
    } else {
        paddle.y = rect.height - 65;
        paddle.x = Math.min(
            Math.max(paddle.x, 0),
            rect.width - paddle.width
        );
        ball.x = Math.min(Math.max(ball.x, ball.radius), rect.width - ball.radius);
        ball.y = Math.min(Math.max(ball.y, ball.radius), rect.height - ball.radius);
    }

    if (running) drawGame();
}

function resetPositions() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    paddle = {
        width: Math.min(110, width * 0.28),
        height: 9,
        x: (width - Math.min(110, width * 0.28)) / 2,
        y: height - 65,
        speed: 8
    };

    ball = {
        x: width / 2,
        y: height - 90,
        radius: 6,
        vx: 3.2,
        vy: -4.2
    };
}

function createBlocks() {
    blocks = [];

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const cols = 5;
    const rows = 7;
    const gapX = 7;
    const gapY = 9;

    // Khu vực gạch nằm giữa màn hình
    const areaWidth = Math.min(width * 0.68, 440);
    const blockWidth = (areaWidth - gapX * 4) / 5;

    // Gạch cao hơn, dáng khối chắc chắn
    const blockHeight = 30;

    const totalHeight = rows * blockHeight + (rows - 1) * gapY;

    const startX = (width - areaWidth) / 2;
    const startY = Math.max(
        60,
        (height - totalHeight) / 2 - 40
    );

    const brickColors = [
        "#d8b6ff"
    ];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const colorIndex = (row + col) % brickColors.length;
            blocks.push({
                x: startX + col * (blockWidth + gapX),
                y: startY + row * (blockHeight + gapY),
                width: blockWidth,
                height: blockHeight,
                color: brickColors[ Math.floor(Math.random() * brickColors.length)],
                alive: true
            });
        }
    }

    updateBlocksLeft();
}


function updateBlocksLeft() {
    blocksLeftText.textContent =
        `BLOCKS: ${blocks.filter(block => block.alive).length}`;
}

function drawGlowRect(x, y, width, height, color) {
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

function drawGame() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // Paddle
    drawGlowRect(
        paddle.x,
        paddle.y,
        paddle.width,
        paddle.height,
        COLORS.paddle
    );

    // Ball
    ctx.save();
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#d7a7ff";
    ctx.fill();
    ctx.restore();

    // Blocks
    
    
    // Sharp metallic pastel bricks
    for (const block of blocks) {
        if (!block.alive) continue;

        const { x, y, width, height, color } = block;

        ctx.save();

        // Bóng đổ nhẹ phía sau viên gạch
        ctx.shadowColor = "rgba(150, 170, 255, 0.3)";
        ctx.shadowBlur = 7;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        // Mặt gạch có ánh sáng kim loại
        const gradient = ctx.createLinearGradient(
            x, y, x + width, y + height
        );

        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.12, color);
        gradient.addColorStop(0.72, color);
        gradient.addColorStop(1, color);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);

        // Tắt bóng trước khi vẽ viền
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Viền bạc sáng, góc vuông
        ctx.strokeStyle = "rgba(245, 248, 255, 1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
            x + 0.5,
            y + 0.5,
            width - 1,
            height - 1
        );

        // Cạnh trên: ánh bạc rõ hơn
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + width - 1, y + 1);
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cạnh trái: phản chiếu ánh bạc
        ctx.beginPath();
        ctx.moveTo(x + 1, y + 1);
        ctx.lineTo(x + 1, y + height - 1);
        ctx.strokeStyle = "rgba(245, 248, 255, 0.65)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cạnh phải: ánh kim lạnh
        ctx.beginPath();
        ctx.moveTo(x + width - 1, y + 1);
        ctx.lineTo(x + width - 1, y + height - 1);
        ctx.strokeStyle = "rgba(185, 205, 240, 0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }



    // Small particles
    for (const particle of particles) {
        ctx.globalAlpha = Math.max(0, particle.life / 25);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
    }

    ctx.globalAlpha = 1;
}

function burst(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 25,
            color
        });
    }
}

function updateParticles() {
    for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
    }

    particles = particles.filter(particle => particle.life > 0);
}



function endGame() {
    running = false;
    cancelAnimationFrame(animationId);

    gameScreen.classList.remove("hidden");
    canvas.style.visibility = "hidden";

    document.querySelector(".game-hud").style.visibility = "hidden";
    backButton.style.visibility = "hidden";

    document.getElementById("completeScreen")
        .classList.remove("hidden");
}



function updateGame(delta) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const step = Math.min(delta / 16.67, 2);

    ball.x += ball.vx * step;
    ball.y += ball.vy * step;

    // Side walls
    if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx = Math.abs(ball.vx);
    }

    if (ball.x + ball.radius >= width) {
        ball.x = width - ball.radius;
        ball.vx = -Math.abs(ball.vx);
    }

    // Ceiling
    if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
    }

    // Paddle collision
    if (
        ball.vy > 0 &&
        ball.y + ball.radius >= paddle.y &&
        ball.y - ball.radius <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
    ) {
        const hit = (ball.x - (paddle.x + paddle.width / 2)) /
            (paddle.width / 2);

        ball.vx = hit * 4.5;
        ball.vy = -Math.max(3.5, Math.abs(ball.vy));
        ball.y = paddle.y - ball.radius;
    }

    // Block collision
    for (const block of blocks) {
        if (!block.alive) continue;

        const hit =
            ball.x + ball.radius >= block.x &&
            ball.x - ball.radius <= block.x + block.width &&
            ball.y + ball.radius >= block.y &&
            ball.y - ball.radius <= block.y + block.height;

        if (hit) {
            block.alive = false;
            ball.vy *= -1;
            burst(ball.x, ball.y, block.color);
            updateBlocksLeft();
            break;
        }
    }

    updateParticles();

    if (blocks.every(block => !block.alive)) {
        endGame();
        return;
    }

    // Ball falls: reset position and keep playing
    if (ball.y - ball.radius > height) {
        ball.x = width / 2;
        ball.y = height - 90;
        ball.vx = 3.2 * (Math.random() < 0.5 ? -1 : 1);
        ball.vy = -4.2;
    }
}

function gameLoop(timestamp) {
    if (!running) return;

    const delta = lastTime ? timestamp - lastTime : 16.67;
    lastTime = timestamp;

    updateGame(delta);
    drawGame();

    if (running) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    cancelAnimationFrame(animationId);

    gameMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    running = false;
    lastTime = 0;
    particles = [];

    resizeCanvas();
    resetPositions();
    createBlocks();

    running = true;
    animationId = requestAnimationFrame(gameLoop);
}

function returnToMenu() {
    if (gameScreen.classList.contains("screen-fade-out")) return;

    running = false;
    cancelAnimationFrame(animationId);

    gameScreen.classList.add("screen-fade-out");

    setTimeout(() => {
        gameScreen.classList.add("hidden");
        gameScreen.classList.remove("screen-fade-out");

        gameMenu.classList.remove("hidden");

        // Khởi động hiệu ứng menu
        gameMenu.classList.remove("menu-reveal");
        void gameMenu.offsetWidth;
        gameMenu.classList.add("menu-reveal");

    }, 800);
}

function movePaddle(clientX) {
    if (!running) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;

    paddle.x = Math.max(
        0,
        Math.min(canvas.clientWidth - paddle.width, x - paddle.width / 2)
    );
}

startButton.addEventListener("click", startGame);
backButton.addEventListener("click", returnToMenu);

quitButton.addEventListener("click", () => {
    gameMenu.classList.add("fade-out");

    setTimeout(() => {
        gameMenu.classList.remove("fade-out");
    }, 800);
});

canvas.addEventListener("pointermove", event => {
    movePaddle(event.clientX);
});

canvas.addEventListener("pointerdown", event => {
    movePaddle(event.clientX);
});

window.addEventListener("resize", resizeCanvas);




function showAIMEffect() {
    const initials = [...document.querySelectorAll(".aim-initial")];
    const gameMenu = document.querySelector("#gameMenu");

    if (initials.length !== 3 || !gameMenu) return;

    // A → I → M lần lượt sáng lên
    initials.forEach(letter => letter.classList.remove("aim-lit"));

    initials.forEach((letter, index) => {
        setTimeout(() => {
            letter.classList.add("aim-lit");

            // Sau khi M sáng lên
            if (index !== initials.length - 1) return;

            setTimeout(() => {
                // Ghi nhận vị trí thật của A, I, M
                const letterData = initials.map(letter => {
                    const rect = letter.getBoundingClientRect();
                    const style = getComputedStyle(letter);

                    return {
                        text: letter.textContent,
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                        fontSize: parseFloat(style.fontSize),
                        fontFamily: style.fontFamily,
                        fontWeight: style.fontWeight,
                        color: style.color
                    };
                });

                // Tạo chữ mới đúng tại vị trí cũ
                const finaleLetters = letterData.map(data => {
                    const span = document.createElement("span");

                    span.className = "aim-finale-letter";
                    span.textContent = data.text;

                    span.style.left = `${data.left}px`;
                    span.style.top = `${data.top}px`;
                    span.style.fontSize = `${data.fontSize}px`;
                    span.style.fontFamily = data.fontFamily;
                    span.style.fontWeight = data.fontWeight;
                    span.style.color = data.color;

                    document.body.appendChild(span);

                    return span;
                });

                // Cho trình duyệt ghi nhận vị trí xuất phát
                void document.body.offsetWidth;

                // Menu mờ đi, chữ mới vẫn giữ nguyên
                gameMenu.classList.add("aim-finale");

                // Chờ một frame để chắc chắn đã ghi nhận trạng thái ban đầu
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const finalFontSize = Math.min(
                            130,
                            window.innerWidth * 0.14
                        );

                        const scale = finalFontSize / letterData[0].fontSize;
                        const gap = finalFontSize * 0.04;

                        // Tính chiều rộng dựa trên kích thước chữ thực tế
                        const finalWidths = letterData.map(data => data.width * scale);
                        const totalWidth =
                            finalWidths.reduce((sum, width) => sum + width, 0)
                            + gap * 2;

                        let currentX = (window.innerWidth - totalWidth) / 2;
                        const centerY = (window.innerHeight - finalFontSize) / 2;

                        // Phóng to và trượt từng chữ về giữa
                        finaleLetters.forEach((letter, index) => {
                            const data = letterData[index];
                            const targetX = currentX;
                            const targetY = centerY;

                            const moveX = targetX - data.left;
                            const moveY = targetY - data.top;

                            letter.style.transform =
                                `translate(${moveX}px, ${moveY}px) scale(${scale})`;

                            currentX += finalWidths[index] + gap;
                        });

                        // Chờ chữ di chuyển hoàn tất
                        setTimeout(() => {
                            // Giữ AIM đứng yên
                            setTimeout(() => {
                                const meteor = document.createElement("div");
                                meteor.className = "aim-meteor";
                                document.body.appendChild(meteor);

                                // Sao băng bay qua rồi mới tối màn hình
                                setTimeout(() => {
                                    document.body.classList.add("aim-fade-out");

                                    setTimeout(() => {
                                        window.location.href = "../index.html";
                                    }, 1300);

                                }, 1150);

                            }, 850);

                        }, 1550);
                    });
                });

            }, 400);

        }, index * 1000);
    });
}


const giftButton = document.getElementById("giftButton");

if (giftButton) {
    giftButton.addEventListener("click", () => {
        // Không cho bấm liên tục
        if (giftButton.disabled) return;
        giftButton.disabled = true;

        // Hộp quà rung lên như sắp mở
        giftButton.style.animation = "giftShake 0.12s ease-in-out 5";
        giftButton.style.transform = "scale(1.08)";

        const giftBox = giftButton.querySelector(".gift-box");

        if (giftBox) {
            giftBox.style.transition = "transform 0.3s ease";
            giftBox.style.transform = "translateY(-12px) rotate(-8deg)";
        }

        // Sau khi hộp quà mở, chuyển cảnh về menu
setTimeout(() => {
    const completeScreen = document.getElementById("completeScreen");

    completeScreen.classList.add("reward-transition");

    setTimeout(() => {
        completeScreen.classList.add("hidden");
        completeScreen.classList.remove("reward-transition");

        canvas.style.visibility = "visible";
        document.querySelector(".game-hud").style.visibility = "visible";
        backButton.style.visibility = "visible";

        gameScreen.classList.add("hidden");

        gameMenu.classList.remove("hidden");
        gameMenu.classList.remove("menu-reveal");

        void gameMenu.offsetWidth;
        gameMenu.classList.add("menu-reveal");

        // Giữ A-I-M mờ trong 5 giây
        document.querySelectorAll(".aim-initial").forEach(letter => {
            letter.classList.remove("aim-lit");
        });

        setTimeout(() => {
            showAIMEffect();
        }, 5000);

    }, 800);

}, 100);
    });
}

