console.log("🚀 GPU Miner Started...");

const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl2");
document.body.appendChild(canvas);

async function loadShader(url) {
    const response = await fetch(url);
    return response.text();
}

async function setupWebGL() {
    let fragSource = await loadShader("https://yourserver.com/sha256.frag");
    let vertSource = `#version 300 es
    in vec4 position;
    void main() { gl_Position = position; }`;

    let vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSource);
    gl.compileShader(vertShader);

    let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSource);
    gl.compileShader(fragShader);

    let program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    return program;
}

async function gpuHash(nonce) {
    let program = await setupWebGL();
    let nonceLocation = gl.getUniformLocation(program, "nonce");
    gl.uniform1ui(nonceLocation, nonce);

    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    let pixel = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return pixel;
}

async function mine() {
    let nonce = 0;
    while (true) {
        let hash = await gpuHash(nonce);
        console.log(`Nonce: ${nonce}, Hash: ${hash}`);

        if (hash[0] === 0) {
            console.log("🔥 Valid hash found!", nonce);
        }

        nonce++;
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 50)); 
    }
}

mine();

