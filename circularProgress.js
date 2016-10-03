var CircularProgress = function(selector, options) {
    // Default Values For Gauge
    var defaults = {
        chartArea: {
            height: 400,
            radius: 75,
            width: 400            
        },
        gauge: {
            line: {
                color: '#46BAD9',
                size: 15
            }
        },
        label: {
            color: '#777',
            font: {
                family: 'Verdana',
                size: 25
            }
        },
        range: {
            from: 0,
            to: 100
        },
        title: {
            align: 'center',            
            color: '#777',
            font: {
                family: 'Verdana',
                size: 36
            },
            margin: {
                bottom: 20,
                left: 20,
                right: 20,
                top: 20
            },
            text: 'Title',
        },
        trail: {
            color: '#BABABA',
            size: 15
        }
    }

    // Assign User Options To Constructor
    this.selector = document.querySelector(selector);
    this.options = _extend(defaults, options);
}

// Init Gauge
CircularProgress.prototype.init = function() {   
    var selector = this.selector,
        options = this.options,
        canvas,
        context;

    // Handle Canvas 
    selector.classList.add('dp-gauge');

    // Verify If Element Is Canvas 
    if (selector.tagName.toLowerCase() === 'canvas') {
        canvas = selector;
        context = selector.getContext('2d');
    } else {
        canvas = selector.appendChild(document.createElement('canvas'));
        context = canvas.getContext('2d');
    }

    // Set Canvas And Context To Each Instance
    this.canvas = canvas;
    this.context = context;

    // Set Dimensions To Selctor
    selector.setAttribute('style', 
        'height: ' + options.chartArea.height + 'px;'
    );
    
    this.generateSurface();
    window.addEventListener('resize', this.generateSurface.bind(this));
}

CircularProgress.prototype.generateSurface = function() {
    var canvas = this.canvas,
        context = this.context,
        options = this.options,
        selector = this.selector;

    // Set Dimensions
    canvas.width = selector.offsetWidth;
    canvas.height = selector.offsetHeight;

    // Draw Gauge 
    draw(canvas, context, options, _drawInfoText);
}

function draw(canvas, context, options, calback) {
    var currentPercent = options.range.from, 
        endPercent = options.range.to || 55,
        label = options.label;    
        position = _getCenter(canvas);

    function _animate(circumference) {
        var fullCircle = Math.PI * 2,
            halfCirlce = Math.PI / 2,
            negativeValues,
            radius = options.chartArea.radius
        
        // Clear Canvas Each Frame
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Gauge Components
        _drawTrail(canvas, context, options);
        _drawTitle(canvas, context, options);
        
        context.beginPath();

        // Set Styles
        context.font = label.font.size + 'px' + ' ' + label.font.family;
        context.strokeStyle = options.gauge.line.color;
        context.lineWidth = options.gauge.line.size;
        
        // Check If Neggative And Animate Counter Clock-Wise
        if (endPercent < 0 ) {
            // Make Value Positive So Iteration Keeps Looping
            negativeValues = Math.abs(endPercent);
            context.arc(position.middleX, position.middleY, radius, -halfCirlce, -(fullCircle * circumference) - halfCirlce, true);
            // Place Centerd Negative Text
            context.fillText('-' + (currentPercent) + '%', position.middleX - (_measureText(context, ('-' + currentPercent + '%')) / 2), position.middleY + ((label.font.size / 2) * .55));
        } else {
            context.arc(position.middleX, position.middleY, radius, -halfCirlce, (fullCircle * circumference) - halfCirlce, false);
            // Place Centerd Text
            context.fillText((currentPercent) + '%', position.middleX - (_measureText(context, currentPercent + '%') / 2), position.middleY + ((label.font.size / 2) * .55));
        }
        
        context.stroke();
        context.closePath();    
        currentPercent++;

        // Plce Decimal Value
        if (isFloat(endPercent)) {
            var decimalValue = parseInt(endPercent.toString().split('.')[1]);
            if ( currentPercent == parseInt(endPercent) || currentPercent == parseInt(negativeValues)) {
                currentPercent = parseFloat(currentPercent + '.' + decimalValue);
            }
        }
            
        // Animate Gauge
        if (currentPercent <= endPercent || currentPercent <= negativeValues) {
            window.requestAnimationFrame(function() {
                // Controls The '%' Number (100 => 100%)
                var circumference = currentPercent / 100;
                if (currentPercent <= 100) {
                    _animate(circumference);
                } else {
                    // Call After Gauge Is Finsished Drawing If Values Are Above 100%
                    calback(canvas, context, options);
                    return;
                }   
            });
        } else {
            // Call After Gauge Is Finsished Drawing
            calback(canvas, context, options);
            return;
        }   
    }

    _animate();
}

// Draw Gauge Trail (Circle Beneath The Gauge)
function _drawTrail(canvas, context, options) {
    var position = _getCenter(canvas),
        radius = options.chartArea.radius;

    context.beginPath();
    context.strokeStyle = options.trail.color;
    context.lineWidth = options.trail.size;
    context.arc(position.middleX, position.middleY, radius, -(Math.PI / 2), 2 * Math.PI, false);
    context.stroke();
    context.closePath();
}

// Draw Gauge Title
function _drawTitle(canvas, context, options) {
    var title = options.title,
        titleWidth = _measureText(context, title.text),
        verticalSpace = title.margin.top + title.margin.bottom;

    context.beginPath();

    // Style Title
    context.font = title.font.size + 'px' + ' ' + title.font.family;
    context.fillStyle = title.color;

    // Place Text To Different Positions
    if (title.align === 'center') {      
        context.fillText(title.text, (canvas.width / 2) - (titleWidth / 2), verticalSpace);
    } else if (title.align === 'left') {
        context.fillText(title.text, 0, verticalSpace);
    } else if (title.align === 'right') {
        context.fillText(title.text, (canvas.width - titleWidth), verticalSpace);
    }

    context.stroke();
    context.closePath();   
}

// Draw Gauge Info Text (After Gauge Is Finished Drawing)
function _drawInfoText(canvas, context, options) {
    var position = _getCenter(canvas),
        label = options.label;

    context.beginPath();
    context.font = label.font.size + 'px' + ' ' + label.font.family;
    context.fillStyle = label.color;        
    context.fillText('text', position.middleX, canvas.height - options.title.margin.bottom);
    context.stroke();
    context.closePath();
}

// Calculate The Center Of The Canvas
function _getCenter(canvas) {
    return {
        middleX: canvas.width / 2,
        middleY: canvas.height /2 
    }
}

// Calculate The Width Of The Text
function _measureText(context, text) {
    return context.measureText(text).width;
}

// Utility To Check If Number Is Float
function isFloat(number){
    return Number(number) === number && number % 1 !== 0;
}

// Utility Method To Extend Objects
function _extend(output) {
    output = output || {};

    for ( var i = 0; i < arguments.length; i++) {
        var object = arguments[i];
        
        if (!object) continue;

        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                if (typeof object[key] === 'object') {
                    output[key] = _extend(output[key], object[key]);
                } else {
                    output[key] = object[key];
                }
            }
        }
    }

    return output;
}

