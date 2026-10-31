if (document.getElementById('threeCanvas')) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threeCanvas'), alpha: true });

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 2.5;
    var container = document.getElementById('threeContainer');
    renderer.setSize(container.clientWidth, container.clientHeight);

    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}
