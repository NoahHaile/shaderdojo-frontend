// Get the canvas and WebGL context
const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl");

var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/glsl");

const vertexShaderSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentShaderHeader = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

`
editor.setValue(fragmentShaderSource);
editor.clearSelection();

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function runShader() {
    const text = fragmentShaderHeader + editor.getValue();
    const fragmentShaderSource = text;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]),
        gl.STATIC_DRAW
    );

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    let startTime;

    function renderLoop(time) {

        if (!startTime) {
            startTime = time * 0.001; // Initialize start time on the first frame
        }
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, startTime - time * 0.001);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(renderLoop);
    }


    requestAnimationFrame(renderLoop);
}
runShader();


const timeList = [0, 0.001, 1, 5];
async function submitShader() {
    const text = fragmentShaderHeader + editor.getValue();
    const fragmentShaderSource = text;

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]),
        gl.STATIC_DRAW
    );

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    // Set up off-screen framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Create a texture to render to
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        800,
        600,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Attach the texture to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );

    // Check framebuffer status
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer is not complete");
        return;
    }



    async function hash(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    let pixelString = "";
    function render(time) {
        // Render to the framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.uniform2f(resolutionLocation, 800, 600);
        gl.uniform1f(timeLocation, time);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const pixels = new Uint8Array(800 * 600 * 4); // RGBA
        gl.readPixels(0, 0, 800, 600, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        pixelString += hash(pixels);
    }


    timeList.forEach(t => render(t));
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const encoder = new TextEncoder();
    const data = encoder.encode(pixelString);
    hash(data).then(console.log);

    const res = await fetch(`http://localhost:7090/problems/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hash: await hash(data), problemId: id }),
    });

    const problemStatus = await fetch(`http://localhost:7090/account/status/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (response.status != 200) {
            // errorModal.style.display = "block";
            // errorModal.innerHTML = "An error occured while fetching problem attempts.";
            // throw Error("An error occured while fetching the problem. Please try again later.");
        }
        return response.json();
    }).catch(err => {
        // errorModal.style.display = "block";
        // errorModal.innerHTML = "An error occured while fetching problem attempts.";
        // throw Error("An error occured while fetching the problem. Please try again later.");
        return {
            status: "UNDEFINED",
            count: -1
        };
    });

    const statusText = document.querySelector(".status-text");
    if (problemStatus.status == "UNATTEMPTED") {
        statusText.innerHTML = "Problem Unattempted";
    } else if (problemStatus.status == "SUCCESSFUL") {
        statusText.innerHTML = "Problem Completed. " + problemStatus.count + " attempts.";
    } else if (problemStatus.status == "FAILED") {
        statusText.innerHTML = "Problem attempted " + problemStatus.count + " times.";
    } else {
        statusText.innerHTML = "Failed to fetch problem status.";
    }
    runShader();
}
