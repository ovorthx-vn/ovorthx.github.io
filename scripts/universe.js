// scripts/universe.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
// Hoặc nếu tải Three.js về local: import * as THREE from './three.module.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-container');
    let scene, camera, renderer;
    let objects = []; // Mảng chứa các đối tượng (cửa sổ)
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    const config = {}; // Sẽ tải từ config.json

    // Fetch config data
    fetch('config.json')
        .then(response => response.json())
        .then(data => {
            Object.assign(config, data.pages); // Lấy phần pages từ config
            init();
            animate();
        })
        .catch(error => console.error('Error loading config.json:', error));

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000); // Nền đen

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Stars (chấm trắng)
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = THREE.MathUtils.randFloatSpread(200);
            const y = THREE.MathUtils.randFloatSpread(200);
            const z = THREE.MathUtils.randFloatSpread(200);
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        // Create Windows
        createWindows();

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        // Event Listeners
        document.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('click', onDocumentClick); // Xử lý click trên cửa sổ
    }

    function createWindows() {
        const windowData = [
            { name: 'Project', size: 'large', position: { x: -3, y: 1, z: 0 }, url: 'pages/project.html' },
            { name: 'CVE', size: 'large', position: { x: -3, y: -1.5, z: 0 }, url: 'pages/cve.html' },
            { name: 'Contact', size: 'small', position: { x: 0, y: 2, z: 0 }, url: '#' },
            { name: 'Me', size: 'large', position: { x: 0, y: 0, z: 0 }, url: '#' },
            { name: 'Social', size: 'small', position: { x: 0, y: -2, z: 0 }, url: '#' },
            { name: 'Prize', size: 'large', position: { x: 3, y: 1, z: 0 }, url: 'pages/prize.html' },
            { name: 'Blog', size: 'large', position: { x: 3, y: -1.5, z: 0 }, url: 'pages/blog.html' }
        ];

        windowData.forEach(data => {
            const geometry = new THREE.BoxGeometry(data.size === 'large' ? 1.5 : 0.8, data.size === 'large' ? 1 : 0.5, 0.1);
            const material = new THREE.MeshPhongMaterial({
                color: 0x333333,
                shininess: 50,
                specular: 0x222222,
                transparent: true,
                opacity: 0.8
            });

            const windowMesh = new THREE.Mesh(geometry, material);
            windowMesh.position.set(data.position.x, data.position.y, data.position.z);
            windowMesh.userData = {
                name: data.name,
                url: data.url,
                isLarge: data.size === 'large'
            }; // Lưu trữ thông tin cho tương tác

            // Thêm text label vào cửa sổ
            const loader = new THREE.FontLoader();
            loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', function (font) {
                const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Màu xanh lá
                const textGeometry = new THREE.TextGeometry(data.name, {
                    font: font,
                    size: data.size === 'large' ? 0.2 : 0.15,
                    height: 0.05
                });
                textGeometry.computeBoundingBox();
                const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(centerOffset, data.size === 'large' ? -0.05 : -0.02, 0.06); // Đặt hơi phía trước mặt cửa sổ
                windowMesh.add(textMesh);
            });

            scene.add(windowMesh);
            objects.push(windowMesh);
        });
    }

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    }

    function onDocumentClick(event) {
        // Raycasting để phát hiện click vào đối tượng 3D
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const { name, url, isLarge } = clickedObject.userData;

            console.log(`Clicked on: ${name}`);

            if (isLarge && url && url !== '#') {
                // Chuyển hướng đến trang chi tiết
                window.location.href = url;
            } else if (!isLarge) {
                // Hiển thị placeholder content cho cửa sổ nhỏ
                alert(`Content for ${name}:\n\n${config[name.toLowerCase()]}`);
            } else if (name === 'Me') {
                alert(`About Me:\n\n${config.me}`);
            } else if (name === 'Contact') {
                 alert(`Contact Me:\nEmail: ${config.contact.email}\nDiscord: ${config.contact.discord}\nGitHub: ${config.contact.github}`);
            } else if (name === 'Social') {
                 alert(`My Socials:\nLinkedIn: ${config.social.linkedin}\nTwitter: ${config.social.twitter}\nFacebook: ${config.social.facebook}`);
            }
        }
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Camera rotation based on mouse position
        camera.position.x += (mouseX * 0.0005 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.0005 - camera.position.y) * 0.05;
        camera.lookAt(scene.position); // Luôn nhìn về trung tâm scene

        // Rotate objects slightly
        objects.forEach(obj => {
            obj.rotation.y += 0.001; // Quay nhẹ quanh trục Y
            obj.rotation.x += 0.0005; // Quay nhẹ quanh trục X
        });

        renderer.render(scene, camera);
    }
});
