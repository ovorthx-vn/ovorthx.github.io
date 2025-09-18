document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    const terminalCursor = document.getElementById('terminal-cursor');
    const platformSelection = document.getElementById('platform-selection');
    const platformOptions = document.querySelectorAll('.platform-option');

    let simulationLines = [];
    let lineIndex = 0;
    let charIndex = 0;
    let typingSpeed = 50; // Tốc độ gõ chữ (ms)
    let lineDelay = 500; // Độ trễ giữa các dòng (ms)
    let promptDelay = 1000; // Độ trễ sau khi gõ xong prompt

    // Fetch config data
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            simulationLines = data.terminal.arch_simulation;
            startTerminalSimulation();
        })
        .catch(error => {
            console.error('Error loading config.json:', error);
            // Fallback content if config fails
            terminalOutput.innerHTML = "Error loading terminal content. Please refresh.";
        });

    function startTerminalSimulation() {
        typeLine();
    }

    function typeLine() {
        if (lineIndex < simulationLines.length) {
            const currentLineData = simulationLines[lineIndex];
            const type = currentLineData.type;
            const text = currentLineData.text;

            if (charIndex === 0 && type === 'prompt') {
                // Thêm prompt mới trên dòng mới
                terminalOutput.innerHTML += '<br>'; // Dòng mới
                terminalOutput.innerHTML += `<span class="prompt-text">${text.substring(0, charIndex)}</span>`;
                terminalCursor.style.display = 'inline-block'; // Hiển thị con trỏ
                typePromptChar(currentLineData);
            } else if (type === 'prompt') {
                typePromptChar(currentLineData);
            }
            else { // type === 'output'
                terminalCursor.style.display = 'none'; // Ẩn con trỏ khi hiển thị output
                terminalOutput.innerHTML += '<br>'; // Dòng mới
                terminalOutput.innerHTML += text;
                lineIndex++;
                scrollToBottom();
                setTimeout(typeLine, lineDelay);
            }
        } else {
            // Sau khi tất cả các dòng đã được gõ, hiển thị lựa chọn nền tảng
            terminalCursor.style.display = 'none'; // Ẩn con trỏ cuối cùng
            platformSelection.classList.remove('hidden');
        }
    }

    function typePromptChar(currentLineData) {
        const text = currentLineData.text;
        if (charIndex < text.length) {
            const currentPromptSpan = terminalOutput.querySelector('.prompt-text:last-child');
            if (currentPromptSpan) {
                currentPromptSpan.textContent = text.substring(0, charIndex + 1);
            }
            charIndex++;
            scrollToBottom();
            setTimeout(() => typePromptChar(currentLineData), typingSpeed);
        } else {
            // Hết một prompt, chuẩn bị cho dòng tiếp theo
            charIndex = 0;
            lineIndex++;
            scrollToBottom();
            setTimeout(typeLine, promptDelay);
        }
    }

    function scrollToBottom() {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    platformOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const platform = event.currentTarget.dataset.platform;
            console.log(`Platform selected: ${platform}`);
            window.location.href = 'universe.html';
        });
    });
});
