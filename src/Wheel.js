export class Wheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Configuration
        this.segments = [
            { text: '500', value: 500, color: '#3498db', textColor: '#fff' },
            { text: 'PERDE', value: 0, color: '#e74c3c', textColor: '#fff' }, // Bankrupt
            { text: '1000', value: 1000, color: '#f1c40f', textColor: '#000' },
            { text: '200', value: 200, color: '#9b59b6', textColor: '#fff' },
            { text: 'PASSA', value: -1, color: '#95a5a6', textColor: '#000' }, // Skip Turn
            { text: '500', value: 500, color: '#3498db', textColor: '#fff' },
            { text: '100', value: 100, color: '#e67e22', textColor: '#fff' },
            { text: '2000', value: 2000, color: '#2ecc71', textColor: '#000' },
            { text: '300', value: 300, color: '#1abc9c', textColor: '#fff' },
            { text: 'PERDE', value: 0, color: '#e74c3c', textColor: '#fff' },
            { text: '400', value: 400, color: '#34495e', textColor: '#fff' },
            { text: '500', value: 500, color: '#3498db', textColor: '#fff' }
        ];

        this.totalSegments = this.segments.length;
        this.arc = Math.PI * 2 / this.totalSegments;

        // State
        this.angle = 0; // Current rotation
        this.angularVelocity = 0;
        this.isSpinning = false;
        this.friction = 0.985; // Deceleration factor (0.99 = slow stop, 0.95 = fast stop)
        this.minSpeed = 0.002;

        // Interaction State
        this.isDragging = false;
        this.lastMouseAngle = 0;
        this.lastMouseTime = 0;
        this.dragVelocities = []; // Store recent velocities for smooth throws

        // Bindings
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }

    init() {
        this.resize();
        window.addEventListener('resize', this.resize);

        // Mouse Events
        this.canvas.addEventListener('mousedown', this.handleStart);
        window.addEventListener('mousemove', this.handleMove);
        window.addEventListener('mouseup', this.handleEnd);

        // Touch Events
        this.canvas.addEventListener('touchstart', (e) => this.handleStart(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.handleMove(e.touches[0]));
        window.addEventListener('touchend', this.handleEnd);

        // Prevent scrolling on touch
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        requestAnimationFrame(this.animate);
    }

    resize() {
        // Make canvas sharp on Retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        // Only resize if dimensions are valid
        if (rect.width === 0 || rect.height === 0) return;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);

        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 20; // Padding

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.angle); // Rotate the whole wheel container

        this.segments.forEach((segment, i) => {
            const startAngle = i * this.arc;
            const endAngle = startAngle + this.arc;

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, this.radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = segment.color;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "#fff";
            this.ctx.stroke();

            // Text
            this.ctx.save();
            this.ctx.translate(0, 0);
            this.ctx.rotate(startAngle + this.arc / 2); // Rotate to center of segment
            this.ctx.textAlign = "right";
            this.ctx.fillStyle = segment.textColor;
            // Adjust font size based on radius
            const fontSize = Math.max(14, this.radius / 10);
            this.ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
            this.ctx.fillText(segment.text, this.radius - 20, 10);
            this.ctx.restore();
        });

        this.ctx.restore();

        // Center Hub (Static decoration - drawn on top of rotated context?) 
        // Wait, I cleared context. So drawing here is fine.

        // Draw outer rim
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = "#d4af37";
        this.ctx.stroke();

        // Center Hub
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, Math.PI * 2);
        this.ctx.fillStyle = "#fff";
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = "#333";
        this.ctx.stroke();

        // Center Text
        this.ctx.fillStyle = "#333";
        this.ctx.font = "bold 12px sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText("GIRA", this.centerX, this.centerY);
    }

    animate() {
        if (this.isSpinning) {
            this.angle += this.angularVelocity;
            this.angularVelocity *= this.friction; // Decelerate

            // Stop condition
            if (Math.abs(this.angularVelocity) < this.minSpeed) {
                this.isSpinning = false;
                this.angularVelocity = 0;
                this.finishSpin();
            }

            this.draw();
        } else if (this.isDragging) {
            // Redraw to follow mouse
            this.draw();
        }

        requestAnimationFrame(this.animate);
    }

    // --- Interaction Logic ---

    getAngleFromCenter(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        // Calculate mouse position relative to center of canvas
        const dx = x - rect.left - this.centerX;
        const dy = y - rect.top - this.centerY;
        return Math.atan2(dy, dx);
    }

    handleStart(e) {
        // Only allow drag if not already spinning fast (allow "catching" it if slow?)
        // For simplicity, disable interaction while spinning
        if (this.isSpinning) return;

        this.isDragging = true;

        const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

        this.lastMouseAngle = this.getAngleFromCenter(clientX, clientY);
        this.lastMouseTime = performance.now();
        this.dragVelocities = [];
    }

    handleMove(e) {
        if (!this.isDragging) return;

        const clientX = e.clientX !== undefined ? e.clientX : e.center ? e.center.x : (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : e.center ? e.center.y : (e.touches ? e.touches[0].clientY : 0);

        // Handle specific touch object extraction if needed, but the caller passed `touches[0]` for touchstart, but window events pass raw Event.
        // Let's robustify input extraction.
        let x, y;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }

        const currentAngle = this.getAngleFromCenter(x, y);
        const currentTime = performance.now();
        const dt = currentTime - this.lastMouseTime;

        let deltaAngle = currentAngle - this.lastMouseAngle;

        // Fix jump when crossing -PI/PI boundary
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

        this.angle += deltaAngle;

        // Calculate momentary velocity (rad/ms)
        // We want velocity per frame (roughly 16ms)
        if (dt > 0) {
            const velocity = deltaAngle / (dt / 16);
            this.dragVelocities.push(velocity);
            if (this.dragVelocities.length > 5) this.dragVelocities.shift(); // Keep last 5
        }

        this.lastMouseAngle = currentAngle;
        this.lastMouseTime = currentTime;

        // Force draw
        this.draw();
    }

    handleEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;

        // Calculate average release velocity
        // If user holds still before release, velocity should be 0.
        // We should check if last move was recent.
        const now = performance.now();
        if (now - this.lastMouseTime > 100) {
            this.angularVelocity = 0;
            return;
        }

        const avgVelocity = this.dragVelocities.reduce((a, b) => a + b, 0) / (this.dragVelocities.length || 1);

        // Check if throw was strong enough
        // Limit max speed
        const maxSpeed = 0.8;
        let finalVelocity = avgVelocity;
        if (Math.abs(finalVelocity) > maxSpeed) {
            finalVelocity = finalVelocity > 0 ? maxSpeed : -maxSpeed;
        }

        if (Math.abs(finalVelocity) > 0.05) {
            this.angularVelocity = finalVelocity;
            this.isSpinning = true;
        }
    }

    finishSpin() {
        // Determine winner
        // Normalize angle to 0-2PI
        let normalized = this.angle % (Math.PI * 2);
        if (normalized < 0) normalized += Math.PI * 2;

        // The pointer is at TOP (3PI/2 or 270deg) -> -90 deg
        // In Canvas arc: 0 is Right, PI/2 is Bottom, PI is Left, 3PI/2 is Top.
        // Wait, `arc` starts at 0 (Right).
        // Pointer is Top (-PI/2).

        const pointerAngle = -Math.PI / 2;

        // To find which segment is at pointerAngle:
        // SegmentStart + Rotation <= Pointer <= SegmentEnd + Rotation
        // Easier: rotate the pointer backwards by the angle
        let effectiveAngle = pointerAngle - this.angle;

        // Normalize effectiveAngle to 0 - 2PI
        effectiveAngle = effectiveAngle % (Math.PI * 2);
        if (effectiveAngle < 0) effectiveAngle += Math.PI * 2;

        const segmentIndex = Math.floor(effectiveAngle / this.arc);
        // Safety check
        const winningSegment = this.segments[segmentIndex] || this.segments[0];

        console.log("Winner:", winningSegment);

        // Dispatch custom event
        const event = new CustomEvent('wheel-spin-end', { detail: winningSegment });
        window.dispatchEvent(event);
    }
}
