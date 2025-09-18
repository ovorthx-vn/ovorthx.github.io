document.addEventListener('DOMContentLoaded', () => {
    const terminalTextElement = document.getElementById('terminal-text');
    const platformSelection = document.getElementById('platform-selection');
    const platformOptions = document.querySelectorAll('.platform-option');

    const messages = [
        "HELLO WORLD",
        "I know what you are looking for",
        "Select your platform below"
    ];
    let messageIndex = 0;
    let charIndex = 0;
    let typingSpeed = 70; // Tốc độ gõ chữ (ms)
    let lineDelay = 1500; // Độ trễ giữa các dòng (ms)

    function typeWriter() {
        if (messageIndex < messages.length) {
            if (charIndex < messages[messageIndex].length) {
                terminalTextElement.textContent += messages[messageIndex].charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, typingSpeed);
            } else {
                // Hết một dòng, thêm xuống dòng nếu chưa phải dòng cuối
                if (messageIndex < messages.length - 1) {
                    terminalTextElement.textContent += '\n';
                }
                charIndex = 0;
                messageIndex++;
                setTimeout(typeWriter, lineDelay);
            }
        } else {
            // Sau khi tất cả các dòng đã được gõ, hiển thị lựa chọn nền tảng
            platformSelection.classList.remove('hidden');
        }
    }

    typeWriter();

    platformOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const platform = event.currentTarget.dataset.platform;
            console.log(`Platform selected: ${platform}`);
            // Chuyển hướng sang trang 3D
            window.location.href = 'universe.html'; // Hoặc `universe.html?platform=${platform}` nếu bạn muốn truyền thông tin
        });
    });
});