// =====================================
// PAC-MAN - VERSIÓN CORREGIDA
// =====================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const musica = document.getElementById("bgMusic");
let musicaIniciada = false;

const TILE = 28;

// =====================================
// VARIABLES
// =====================================

let score = 0;
let vidas = 3;
let nivel = 1;
let puntosRestantes = 0;

// =====================================
// PODER DE PAC-MAN
// =====================================

let poderActivo = false;
let tiempoPoder = 0;

const DURACION_PODER = 7000; // 7 segundos

// =====================================
// MAPA
// =====================================

const mapa = [
    "####################",
    "#........##........#",
    "#.####.#.##.#.####.#",
    "#o#....#....#....#o#",
    "#..................#",
    "#.####.######.####.#",
    "#..................#",
    "#.####.##GG##.####.#",
    "#......##..##......#",
    "######.##..##.######",
    "#..................#",
    "#.####.######.####.#",
    "#o.......P........o#",
    "####################"
];

// =====================================
// POSICIÓN INICIAL
// =====================================

let posicionInicialPacman = {
    x: 0,
    y: 0
};

for (let fila = 0; fila < mapa.length; fila++) {
    for (let columna = 0; columna < mapa[fila].length; columna++) {

        if (mapa[fila][columna] === "P") {

            posicionInicialPacman.x =
                columna * TILE + TILE / 2;

            posicionInicialPacman.y =
                fila * TILE + TILE / 2;
        }

        if (
            mapa[fila][columna] === "." ||
            mapa[fila][columna] === "o"
        ) {
            puntosRestantes++;
        }
    }
}

// =====================================
// PAC-MAN
// =====================================

const pacman = {

    x: posicionInicialPacman.x,
    y: posicionInicialPacman.y,

    radio: 10,

    velocidad: 2,

    dx: 0,
    dy: 0,

    direccion: 0,

    boca: 0.20,

    abrir: true
};

// =====================================
// DIBUJAR MAPA
// =====================================

function dibujarMapa() {

    for (
        let fila = 0;
        fila < mapa.length;
        fila++
    ) {

        for (
            let columna = 0;
            columna < mapa[fila].length;
            columna++
        ) {

            const celda = mapa[fila][columna];

            const x = columna * TILE;
            const y = fila * TILE;

            // MUROS
            if (celda === "#") {

                ctx.fillStyle = "#003bff";

                ctx.fillRect(
                    x,
                    y,
                    TILE,
                    TILE
                );
            }

            // PUNTOS
            if (celda === ".") {

                ctx.beginPath();

                ctx.arc(
                    x + TILE / 2,
                    y + TILE / 2,
                    3,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "white";
                ctx.fill();
            }

            // POWER PELLET
            if (celda === "o") {

                ctx.beginPath();

                ctx.arc(
                    x + TILE / 2,
                    y + TILE / 2,
                    8,
                    0,
                    Math.PI * 2
                );

                ctx.fillStyle = "white";
                ctx.fill();
            }
        }
    }
}

// =====================================
// HUD
// =====================================

function dibujarHUD() {

    ctx.fillStyle = "yellow";
    ctx.font = "20px Arial";

    ctx.fillText(
        "Score: " + score,
        10,
        canvas.height - 15
    );

    ctx.fillText(
        "Nivel: " + nivel,
        220,
        canvas.height - 15
    );

    ctx.fillText(
        "Vidas: " + vidas,
        400,
        canvas.height - 15
    );
}

// =====================================
// CONTROLES
// =====================================

document.addEventListener("keydown", (e) => {

    if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
    ) {
        e.preventDefault();
    }

    // Iniciar música
    if (!musicaIniciada && musica) {

        musica.volume = 0.8;

        musica.play().catch(() => {
            console.log("No se pudo iniciar la música.");
        });

        musicaIniciada = true;
    }

    switch (e.key) {

        case "ArrowRight":

            pacman.dx = pacman.velocidad;
            pacman.dy = 0;
            pacman.direccion = 0;

            break;

        case "ArrowLeft":

            pacman.dx = -pacman.velocidad;
            pacman.dy = 0;
            pacman.direccion = Math.PI;

            break;

        case "ArrowUp":

            pacman.dx = 0;
            pacman.dy = -pacman.velocidad;
            pacman.direccion = -Math.PI / 2;

            break;

        case "ArrowDown":

            pacman.dx = 0;
            pacman.dy = pacman.velocidad;
            pacman.direccion = Math.PI / 2;

            break;
    }
});
// =====================================
// CONTROLES TÁCTILES
// =====================================

const botonesFlecha =
    document.querySelectorAll(".flecha");

botonesFlecha.forEach((boton) => {

    boton.addEventListener("pointerdown", (e) => {

        e.preventDefault();

        const direccion =
            boton.dataset.direccion;

        switch (direccion) {

            case "right":

                pacman.dx = pacman.velocidad;
                pacman.dy = 0;
                pacman.direccion = 0;

                break;

            case "left":

                pacman.dx = -pacman.velocidad;
                pacman.dy = 0;
                pacman.direccion = Math.PI;

                break;

            case "up":

                pacman.dx = 0;
                pacman.dy = -pacman.velocidad;
                pacman.direccion = -Math.PI / 2;

                break;

            case "down":

                pacman.dx = 0;
                pacman.dy = pacman.velocidad;
                pacman.direccion = Math.PI / 2;

                break;
        }

    });

});


// =====================================
// COLISIÓN CON MUROS
// =====================================

function esMuro(x, y) {

    const columna = Math.floor(x / TILE);
    const fila = Math.floor(y / TILE);

    if (
        fila < 0 ||
        fila >= mapa.length ||
        columna < 0 ||
        columna >= mapa[0].length
    ) {
        return true;
    }

    return mapa[fila][columna] === "#";
}

// =====================================
// COMPROBAR MOVIMIENTO
// =====================================

function puedeMoverse(x, y) {

    const margen = pacman.radio - 2;

    return (
        !esMuro(x - margen, y - margen) &&
        !esMuro(x + margen, y - margen) &&
        !esMuro(x - margen, y + margen) &&
        !esMuro(x + margen, y + margen)
    );
}

// =====================================
// ACTUALIZAR PAC-MAN
// =====================================

function actualizarPacman() {

    const siguienteX =
        pacman.x + pacman.dx;

    const siguienteY =
        pacman.y + pacman.dy;

    if (puedeMoverse(siguienteX, siguienteY)) {

        pacman.x = siguienteX;
        pacman.y = siguienteY;
    }

    // Animación de la boca

    if (pacman.abrir) {

        pacman.boca += 0.02;

        if (pacman.boca > 0.25) {
            pacman.abrir = false;
        }

    } else {

        pacman.boca -= 0.02;

        if (pacman.boca < 0.05) {
            pacman.abrir = true;
        }
    }
}

// =====================================
// COMER PUNTOS
// =====================================

function comerPunto() {

    const columna =
        Math.floor(pacman.x / TILE);

    const fila =
        Math.floor(pacman.y / TILE);

    const celda =
        mapa[fila][columna];

    if (celda === ".") {

        mapa[fila] =
            mapa[fila].substring(0, columna) +
            " " +
            mapa[fila].substring(columna + 1);

        score += 10;

        puntosRestantes--;
    }

   if (celda === "o") {

    mapa[fila] =
        mapa[fila].substring(0, columna) +
        " " +
        mapa[fila].substring(columna + 1);

    score += 50;

    puntosRestantes--;

    // Activar poder
    poderActivo = true;

    // Reiniciar el contador del poder
    tiempoPoder = Date.now() + DURACION_PODER;

    console.log("⚡ POWER ACTIVADO");
}
}

// =====================================
// DIBUJAR PAC-MAN
// =====================================

function dibujarPacman() {

    ctx.save();

    ctx.translate(
        pacman.x,
        pacman.y
    );

    ctx.rotate(
        pacman.direccion
    );

    ctx.beginPath();

    ctx.moveTo(0, 0);

    ctx.arc(
        0,
        0,
        pacman.radio,
        pacman.boca * Math.PI,
        (2 - pacman.boca) * Math.PI
    );

    ctx.closePath();

    ctx.fillStyle = "yellow";

    ctx.fill();

    ctx.restore();
}

// =====================================
// FANTASMA
// =====================================

class Fantasma {

    constructor(x, y, color, nombre) {

        this.x = x;
        this.y = y;

        this.color = color;
        this.nombre = nombre;

        this.radio = 11;

        this.dx = 0;
        this.dy = 0;

        this.velocidad = 1.5;
    }

    dibujar() {

        const x = this.x;
        const y = this.y;

        ctx.save();

        // CABEZA

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            this.radio,
            Math.PI,
            0
        );

        ctx.lineTo(
            x + this.radio,
            y + this.radio
        );

        // PARTE INFERIOR

        for (let i = 0; i < 4; i++) {

            ctx.lineTo(
                x +
                this.radio -
                (i * 7),

                y +
                this.radio -
                4
            );

            ctx.lineTo(
                x +
                this.radio -
                3 -
                (i * 7),

                y +
                this.radio
            );
        }

          ctx.closePath();

        if (poderActivo) {

            ctx.fillStyle = "blue";

        } else {

            ctx.fillStyle = this.color;
        }

        ctx.fill();

        // OJOS

        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            x - 4,
            y - 2,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 4,
            y - 2,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // PUPILAS

        let ox = 0;
        let oy = 0;

        if (this.dx > 0) ox = 1.5;
        if (this.dx < 0) ox = -1.5;

        if (this.dy > 0) oy = 1.5;
        if (this.dy < 0) oy = -1.5;

        ctx.fillStyle = "blue";

        ctx.beginPath();

        ctx.arc(
            x - 4 + ox,
            y - 2 + oy,
            1.3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 4 + ox,
            y - 2 + oy,
            1.3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    mover() {

        const siguienteX =
            this.x + this.dx;

        const siguienteY =
            this.y + this.dy;

        if (
            !esMuro(
                siguienteX,
                siguienteY
            )
        ) {

            this.x = siguienteX;
            this.y = siguienteY;

            return;
        }

        const direcciones = [

            {
                dx: this.velocidad,
                dy: 0
            },

            {
                dx: -this.velocidad,
                dy: 0
            },

            {
                dx: 0,
                dy: this.velocidad
            },

            {
                dx: 0,
                dy: -this.velocidad
            }
        ];

        const opciones = [];

        for (const dir of direcciones) {

            const nx =
                this.x + dir.dx;

            const ny =
                this.y + dir.dy;

            if (!esMuro(nx, ny)) {

                opciones.push(dir);
            }
        }

        if (opciones.length > 0) {

            const nueva =
                opciones[
                    Math.floor(
                        Math.random() *
                        opciones.length
                    )
                ];

            this.dx = nueva.dx;
            this.dy = nueva.dy;
        }
    }
}

// =====================================
// FANTASMAS
// =====================================

const fantasmas = [

    new Fantasma(
        9 * TILE + TILE / 2,
        7 * TILE + TILE / 2,
        "red",
        "Blinky"
    ),

    new Fantasma(
        10 * TILE + TILE / 2,
        7 * TILE + TILE / 2,
        "pink",
        "Pinky"
    ),

    new Fantasma(
        9 * TILE + TILE / 2,
        8 * TILE + TILE / 2,
        "cyan",
        "Inky"
    ),

    new Fantasma(
        10 * TILE + TILE / 2,
        8 * TILE + TILE / 2,
        "orange",
        "Clyde"
    )
];

// DIRECCIONES INICIALES

fantasmas[0].dx = 1.5;
fantasmas[1].dx = -1.5;
fantasmas[2].dy = 1.5;
fantasmas[3].dy = -1.5;

// =====================================
// DIBUJAR FANTASMAS
// =====================================

function dibujarFantasmas() {

    for (const fantasma of fantasmas) {

        fantasma.dibujar();
    }
}

// =====================================
// ACTUALIZAR FANTASMAS
// =====================================

function actualizarFantasmas() {

    for (const fantasma of fantasmas) {

        fantasma.mover();
    }
}

// =====================================
// COLISIÓN PAC-MAN / FANTASMAS
// =====================================

function comprobarColisionFantasmas() {

    for (const fantasma of fantasmas) {

        const dx =
            pacman.x - fantasma.x;

        const dy =
            pacman.y - fantasma.y;

        const distancia =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distancia <
            pacman.radio +
            fantasma.radio
        ) {

            vidas--;

            reiniciarPacman();

            if (vidas <= 0) {

                alert(
                    "GAME OVER\n\n" +
                    "Puntaje: " +
                    score
                );

                location.reload();

                return;
            }

            return;
        }
    }
}

// =====================================
// REINICIAR PAC-MAN
// =====================================

function reiniciarPacman() {

    pacman.x =
        posicionInicialPacman.x;

    pacman.y =
        posicionInicialPacman.y;

    pacman.dx = 0;
    pacman.dy = 0;
}

// =====================================
// COMPROBAR NIVEL
// =====================================

function comprobarNivel() {

    if (puntosRestantes <= 0) {

        nivel++;

        alert(
            "¡NIVEL COMPLETADO!\n\n" +
            "Nivel " +
            nivel
        );

        location.reload();
    }
}

// =====================================
// BUCLE PRINCIPAL
// =====================================

function actualizar() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    actualizarPacman();

    actualizarFantasmas();

    comprobarColisionFantasmas();

    comerPunto();

    comprobarNivel();

    dibujarMapa();

    dibujarFantasmas();

    dibujarPacman();

    dibujarHUD();

    requestAnimationFrame(actualizar);
}

// =====================================
// INICIAR JUEGO
// =====================================

actualizar();