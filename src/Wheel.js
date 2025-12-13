export class Wheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Segment configurations for different modes
        // Segment configurations for different modes
        this.segmentConfigs = {
            single: [
                { text: 'BANCAROTTA', value: 0, color: '#1a1a1a', textColor: '#fff' }, // Nero
                { text: '2000', value: 2000, color: '#D4AF37', textColor: '#000' },   // Oro
                { text: '200', value: 200, color: '#FFFF00', textColor: '#000' },     // Giallo
                { text: '350', value: 350, color: '#FF69B4', textColor: '#000' },     // Rosa
                { text: '100', value: 100, color: '#FF0000', textColor: '#fff' },     // Rosso
                { text: '?', value: -2, color: '#1E90FF', textColor: '#fff' },        // Blu (Mystery)
                { text: 'BANCAROTTA', value: 0, color: '#f0f0f0', textColor: '#000' }, // Bianco (ex Passa)
                { text: '300', value: 300, color: '#FF00FF', textColor: '#fff' },     // Fucsia
                { text: '150', value: 150, color: '#8B4513', textColor: '#fff' },     // Marrone
                { text: '400', value: 400, color: '#32CD32', textColor: '#000' },     // Verde Chiaro
                { text: '250', value: 250, color: '#FAFAD2', textColor: '#000' },     // Giallino
                { text: '1000', value: 1000, color: '#87CEFA', textColor: '#000' },   // Celeste
                { text: 'BANCAROTTA', value: 0, color: '#1a1a1a', textColor: '#fff' }, // Nero
                { text: '200', value: 200, color: '#CD5C5C', textColor: '#fff' },     // Rosso scuro
                { text: '?', value: -2, color: '#FFD700', textColor: '#000' },        // Oro (Mystery)
                { text: '300', value: 300, color: '#FFC0CB', textColor: '#000' },     // Rosa
                { text: '150', value: 150, color: '#FFA500', textColor: '#000' },     // Arancione
                { text: '400', value: 400, color: '#90EE90', textColor: '#000' },     // Verde pallido
                { text: 'BANCAROTTA', value: 0, color: '#f0f0f0', textColor: '#000' }, // Bianco (ex Passa)
                { text: '350', value: 350, color: '#ADD8E6', textColor: '#000' },     // Celeste
                { text: '700', value: 700, color: '#228B22', textColor: '#fff' },     // Verde scuro
                { text: '500', value: 500, color: '#F0E68C', textColor: '#000' },     // Kaki
                { text: '250', value: 250, color: '#FFB6C1', textColor: '#000' },     // Rosa chiaro
                { text: '400', value: 400, color: '#00CED1', textColor: '#000' }      // Turchese
            ],
            multi: [
                { text: 'BANCAROTTA', value: 0, color: '#1a1a1a', textColor: '#fff' }, // Nero
                { text: '2000', value: 2000, color: '#D4AF37', textColor: '#000' },   // Oro
                { text: '200', value: 200, color: '#FFFF00', textColor: '#000' },     // Giallo
                { text: '350', value: 350, color: '#FF69B4', textColor: '#000' },     // Rosa
                { text: '100', value: 100, color: '#FF0000', textColor: '#fff' },     // Rosso
                { text: '?', value: -2, color: '#1E90FF', textColor: '#fff' },        // Blu (Mystery)
                { text: 'PASSA', value: -1, color: '#f0f0f0', textColor: '#000' },    // Bianco
                { text: '300', value: 300, color: '#FF00FF', textColor: '#fff' },     // Fucsia
                { text: '150', value: 150, color: '#8B4513', textColor: '#fff' },     // Marrone
                { text: '400', value: 400, color: '#32CD32', textColor: '#000' },     // Verde Chiaro
                { text: '250', value: 250, color: '#FAFAD2', textColor: '#000' },     // Giallino
                { text: '1000', value: 1000, color: '#87CEFA', textColor: '#000' },   // Celeste
                { text: 'BANCAROTTA', value: 0, color: '#1a1a1a', textColor: '#fff' }, // Nero
                { text: '200', value: 200, color: '#CD5C5C', textColor: '#fff' },     // Rosso scuro
                { text: '?', value: -2, color: '#FFD700', textColor: '#000' },        // Oro (Mystery)
                { text: '300', value: 300, color: '#FFC0CB', textColor: '#000' },     // Rosa
                { text: '150', value: 150, color: '#FFA500', textColor: '#000' },     // Arancione
                { text: '400', value: 400, color: '#90EE90', textColor: '#000' },     // Verde pallido
                { text: 'PASSA', value: -1, color: '#f0f0f0', textColor: '#000' },    // Bianco
                { text: '350', value: 350, color: '#ADD8E6', textColor: '#000' },     // Celeste
                { text: '700', value: 700, color: '#228B22', textColor: '#fff' },     // Verde scuro
                { text: '500', value: 500, color: '#F0E68C', textColor: '#000' },     // Kaki
                { text: '250', value: 250, color: '#FFB6C1', textColor: '#000' },     // Rosa chiaro
                { text: '400', value: 400, color: '#00CED1', textColor: '#000' }      // Turchese
            ]
        };

        // Default to multi (will be set by Game)
        this.segments = this.segmentConfigs.multi;
        this.totalSegments = this.segments.length;
        this.arc = Math.PI * 2 / this.totalSegments;

        // State
        this.angle = 0;
        this.angularVelocity = 0;
        this.isSpinning = false;
        this.isLocked = false; // Prevents spinning when true
        this.friction = 0.985;
        this.minSpeed = 0.002;

        // Interaction State
        this.isDragging = false;
        this.lastMouseAngle = 0;
        this.lastMouseTime = 0;
        this.dragVelocities = [];

        // Bindings
        this.resize = this.resize.bind(this);
        this.animate = this.animate.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }

    unlock() {
        this.isLocked = false;
    }

    spinAI() {
        if (this.isSpinning || this.isLocked) return;

        // Random spin strength
        const force = 0.5 + Math.random() * 0.3;
        const dir = Math.random() > 0.5 ? 1 : -1;

        this.angularVelocity = force * dir;
        this.isSpinning = true;
    }

    /**
     * Set wheel mode - changes segment configuration
     * @param {string} mode - 'single' or 'multi'
     */
    setMode(mode) {
        this.segments = this.segmentConfigs[mode] || this.segmentConfigs.multi;
        this.totalSegments = this.segments.length;
        this.arc = Math.PI * 2 / this.totalSegments;
        this.angle = 0; // Reset rotation
        this.draw();
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
            this.ctx.textBaseline = "middle"; // Vertically center the text
            this.ctx.fillStyle = segment.textColor;
            // Adjust font size based on radius and text length
            let fontSize = Math.max(12, this.radius / 13);
            if (segment.text.length > 8) fontSize *= 0.7; // Reduce for long text like BANCAROTTA

            this.ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
            this.ctx.fillText(segment.text, this.radius - 20, 0); // y=0 for proper centering
            this.ctx.restore();
        });

        this.ctx.restore();

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

        // Draw Lock indicator if locked (optional visual feedback)
        if (this.isLocked) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, 32, 0, Math.PI * 2); // Slightly larger stroke
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
            this.ctx.stroke();
        }
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

        const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
        const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

        // Check for center click (Spin Button)
        const rect = this.canvas.getBoundingClientRect();
        const dx = clientX - rect.left - this.centerX;
        const dy = clientY - rect.top - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30) { // 30 is radius of hub
            this.spinAI();
            return;
        }

        if (this.isLocked) return; // Prevent drag if locked

        this.isDragging = true;

        this.lastMouseAngle = this.getAngleFromCenter(clientX, clientY);
        this.lastMouseTime = performance.now();
        this.dragVelocities = [];
    }

    handleMove(e) {
        // Mouse Hover for Cursor
        if (!this.isDragging && !this.isSpinning) {
            const cx = e.clientX !== undefined ? e.clientX : 0;
            const cy = e.clientY !== undefined ? e.clientY : 0;

            if (cx !== 0 || cy !== 0) {
                const rect = this.canvas.getBoundingClientRect();
                const dx = cx - rect.left - this.centerX;
                const dy = cy - rect.top - this.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                this.canvas.style.cursor = dist < 30 ? 'pointer' : 'grab';
            }
        }

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
        this.isLocked = true; // Lock wheel after spin logic finishes
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
