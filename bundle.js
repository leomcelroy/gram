const main = ``;
const commandsMap = {
    "Z": "Z",
    "M": "M",
    "L": "L",
    "C": "C",
    "Q": "Q",
    "A": "A",
    "H": "H",
    "V": "V",
    "S": "S",
    "T": "T",
    "z": "Z",
    "m": "m",
    "l": "l",
    "c": "c",
    "q": "q",
    "a": "a",
    "h": "h",
    "v": "v",
    "s": "s",
    "t": "t"
};
const Source = function(string) {
    this._string = string;
    this._currentIndex = 0;
    this._endIndex = this._string.length;
    this._prevCommand = null;
    this._skipOptionalSpaces();
};
Source.prototype = {
    parseSegment: function() {
        var __char = this._string[this._currentIndex];
        var command = commandsMap[__char] ? commandsMap[__char] : null;
        if (command === null) {
            if (this._prevCommand === null) {
                return null;
            }
            if ((__char === "+" || __char === "-" || __char === "." || __char >= "0" && __char <= "9") && this._prevCommand !== "Z") {
                if (this._prevCommand === "M") {
                    command = "L";
                } else if (this._prevCommand === "m") {
                    command = "l";
                } else {
                    command = this._prevCommand;
                }
            } else {
                command = null;
            }
            if (command === null) {
                return null;
            }
        } else {
            this._currentIndex += 1;
        }
        this._prevCommand = command;
        var values = null;
        var cmd = command.toUpperCase();
        if (cmd === "H" || cmd === "V") {
            values = [
                this._parseNumber()
            ];
        } else if (cmd === "M" || cmd === "L" || cmd === "T") {
            values = [
                this._parseNumber(),
                this._parseNumber()
            ];
        } else if (cmd === "S" || cmd === "Q") {
            values = [
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber()
            ];
        } else if (cmd === "C") {
            values = [
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber()
            ];
        } else if (cmd === "A") {
            values = [
                this._parseNumber(),
                this._parseNumber(),
                this._parseNumber(),
                this._parseArcFlag(),
                this._parseArcFlag(),
                this._parseNumber(),
                this._parseNumber()
            ];
        } else if (cmd === "Z") {
            this._skipOptionalSpaces();
            values = [];
        }
        if (values === null || values.indexOf(null) >= 0) {
            return null;
        } else {
            return {
                type: command,
                values: values
            };
        }
    },
    hasMoreData: function() {
        return this._currentIndex < this._endIndex;
    },
    peekSegmentType: function() {
        var __char = this._string[this._currentIndex];
        return commandsMap[__char] ? commandsMap[__char] : null;
    },
    initialCommandIsMoveTo: function() {
        if (!this.hasMoreData()) {
            return true;
        }
        var command = this.peekSegmentType();
        return command === "M" || command === "m";
    },
    _isCurrentSpace: function() {
        var __char = this._string[this._currentIndex];
        return __char <= " " && (__char === " " || __char === "\n" || __char === "\t" || __char === "\r" || __char === "\f");
    },
    _skipOptionalSpaces: function() {
        while(this._currentIndex < this._endIndex && this._isCurrentSpace()){
            this._currentIndex += 1;
        }
        return this._currentIndex < this._endIndex;
    },
    _skipOptionalSpacesOrDelimiter: function() {
        if (this._currentIndex < this._endIndex && !this._isCurrentSpace() && this._string[this._currentIndex] !== ",") {
            return false;
        }
        if (this._skipOptionalSpaces()) {
            if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
                this._currentIndex += 1;
                this._skipOptionalSpaces();
            }
        }
        return this._currentIndex < this._endIndex;
    },
    _parseNumber: function() {
        var exponent = 0;
        var integer = 0;
        var frac = 1;
        var decimal = 0;
        var sign = 1;
        var expsign = 1;
        var startIndex = this._currentIndex;
        this._skipOptionalSpaces();
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
            this._currentIndex += 1;
        } else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
            this._currentIndex += 1;
            sign = -1;
        }
        if (this._currentIndex === this._endIndex || (this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") && this._string[this._currentIndex] !== ".") {
            return null;
        }
        var startIntPartIndex = this._currentIndex;
        while(this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9"){
            this._currentIndex += 1;
        }
        if (this._currentIndex !== startIntPartIndex) {
            var scanIntPartIndex = this._currentIndex - 1;
            var multiplier = 1;
            while(scanIntPartIndex >= startIntPartIndex){
                integer += multiplier * (this._string[scanIntPartIndex] - "0");
                scanIntPartIndex -= 1;
                multiplier *= 10;
            }
        }
        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
            this._currentIndex += 1;
            if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
                return null;
            }
            while(this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9"){
                frac *= 10;
                decimal += (this._string.charAt(this._currentIndex) - "0") / frac;
                this._currentIndex += 1;
            }
        }
        if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") && this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m") {
            this._currentIndex += 1;
            if (this._string[this._currentIndex] === "+") {
                this._currentIndex += 1;
            } else if (this._string[this._currentIndex] === "-") {
                this._currentIndex += 1;
                expsign = -1;
            }
            if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
                return null;
            }
            while(this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9"){
                exponent *= 10;
                exponent += this._string[this._currentIndex] - "0";
                this._currentIndex += 1;
            }
        }
        var number = integer + decimal;
        number *= sign;
        if (exponent) {
            number *= Math.pow(10, expsign * exponent);
        }
        if (startIndex === this._currentIndex) {
            return null;
        }
        this._skipOptionalSpacesOrDelimiter();
        return number;
    },
    _parseArcFlag: function() {
        if (this._currentIndex >= this._endIndex) {
            return null;
        }
        var flag = null;
        var flagChar = this._string[this._currentIndex];
        this._currentIndex += 1;
        if (flagChar === "0") {
            flag = 0;
        } else if (flagChar === "1") {
            flag = 1;
        } else {
            return null;
        }
        this._skipOptionalSpacesOrDelimiter();
        return flag;
    }
};
const parsePathDataString = function(string) {
    if (!string || string.length === 0) return [];
    var source = new Source(string);
    var pathData = [];
    if (source.initialCommandIsMoveTo()) {
        while(source.hasMoreData()){
            var pathSeg = source.parseSegment();
            if (pathSeg === null) {
                break;
            } else {
                pathData.push(pathSeg);
            }
        }
    }
    return pathData;
};
const $cachedPathData = typeof Symbol !== 'undefined' ? Symbol() : "__cachedPathData";
const $cachedNormalizedPathData = typeof Symbol !== 'undefined' ? Symbol() : "__cachedNormalizedPathData";
var arcToCubicCurves = function(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, _recursive) {
    var degToRad = function(degrees) {
        return Math.PI * degrees / 180;
    };
    var rotate = function(x, y, angleRad) {
        var X = x * Math.cos(angleRad) - y * Math.sin(angleRad);
        var Y = x * Math.sin(angleRad) + y * Math.cos(angleRad);
        return {
            x: X,
            y: Y
        };
    };
    var angleRad = degToRad(angle);
    var params = [];
    var f1, f2, cx, cy;
    if (_recursive) {
        f1 = _recursive[0];
        f2 = _recursive[1];
        cx = _recursive[2];
        cy = _recursive[3];
    } else {
        var p1 = rotate(x1, y1, -angleRad);
        x1 = p1.x;
        y1 = p1.y;
        var p2 = rotate(x2, y2, -angleRad);
        x2 = p2.x;
        y2 = p2.y;
        var x = (x1 - x2) / 2;
        var y = (y1 - y2) / 2;
        var h = x * x / (r1 * r1) + y * y / (r2 * r2);
        if (h > 1) {
            h = Math.sqrt(h);
            r1 = h * r1;
            r2 = h * r2;
        }
        var sign;
        if (largeArcFlag === sweepFlag) {
            sign = -1;
        } else {
            sign = 1;
        }
        var r1Pow = r1 * r1;
        var r2Pow = r2 * r2;
        var left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
        var right = r1Pow * y * y + r2Pow * x * x;
        var k = sign * Math.sqrt(Math.abs(left / right));
        cx = k * r1 * y / r2 + (x1 + x2) / 2;
        cy = k * -r2 * x / r1 + (y1 + y2) / 2;
        f1 = Math.asin(parseFloat(((y1 - cy) / r2).toFixed(9)));
        f2 = Math.asin(parseFloat(((y2 - cy) / r2).toFixed(9)));
        if (x1 < cx) {
            f1 = Math.PI - f1;
        }
        if (x2 < cx) {
            f2 = Math.PI - f2;
        }
        if (f1 < 0) {
            f1 = Math.PI * 2 + f1;
        }
        if (f2 < 0) {
            f2 = Math.PI * 2 + f2;
        }
        if (sweepFlag && f1 > f2) {
            f1 = f1 - Math.PI * 2;
        }
        if (!sweepFlag && f2 > f1) {
            f2 = f2 - Math.PI * 2;
        }
    }
    var df = f2 - f1;
    if (Math.abs(df) > Math.PI * 120 / 180) {
        var f2old = f2;
        var x2old = x2;
        var y2old = y2;
        if (sweepFlag && f2 > f1) {
            f2 = f1 + Math.PI * 120 / 180 * 1;
        } else {
            f2 = f1 + Math.PI * 120 / 180 * -1;
        }
        x2 = cx + r1 * Math.cos(f2);
        y2 = cy + r2 * Math.sin(f2);
        params = arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [
            f2,
            f2old,
            cx,
            cy
        ]);
    }
    df = f2 - f1;
    var c1 = Math.cos(f1);
    var s1 = Math.sin(f1);
    var c2 = Math.cos(f2);
    var s2 = Math.sin(f2);
    var t = Math.tan(df / 4);
    var hx = 4 / 3 * r1 * t;
    var hy = 4 / 3 * r2 * t;
    var m1 = [
        x1,
        y1
    ];
    var m2 = [
        x1 + hx * s1,
        y1 - hy * c1
    ];
    var m3 = [
        x2 + hx * s2,
        y2 - hy * c2
    ];
    var m4 = [
        x2,
        y2
    ];
    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];
    if (_recursive) {
        return [
            m2,
            m3,
            m4
        ].concat(params);
    } else {
        params = [
            m2,
            m3,
            m4
        ].concat(params);
        var curves = [];
        for(var i = 0; i < params.length; i += 3){
            var r1 = rotate(params[i][0], params[i][1], angleRad);
            var r2 = rotate(params[i + 1][0], params[i + 1][1], angleRad);
            var r3 = rotate(params[i + 2][0], params[i + 2][1], angleRad);
            curves.push([
                r1.x,
                r1.y,
                r2.x,
                r2.y,
                r3.x,
                r3.y
            ]);
        }
        return curves;
    }
};
var clonePathData = function(pathData) {
    return pathData.map(function(seg) {
        return {
            type: seg.type,
            values: Array.prototype.slice.call(seg.values)
        };
    });
};
var absolutizePathData = function(pathData) {
    var absolutizedPathData = [];
    var currentX = null;
    var currentY = null;
    var subpathX = null;
    var subpathY = null;
    pathData.forEach(function(seg) {
        var type = seg.type;
        if (type === "M") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({
                type: "M",
                values: [
                    x,
                    y
                ]
            });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
        } else if (type === "m") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({
                type: "M",
                values: [
                    x,
                    y
                ]
            });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
        } else if (type === "L") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({
                type: "L",
                values: [
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "l") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({
                type: "L",
                values: [
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "C") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x2 = seg.values[2];
            var y2 = seg.values[3];
            var x = seg.values[4];
            var y = seg.values[5];
            absolutizedPathData.push({
                type: "C",
                values: [
                    x1,
                    y1,
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "c") {
            var x1 = currentX + seg.values[0];
            var y1 = currentY + seg.values[1];
            var x2 = currentX + seg.values[2];
            var y2 = currentY + seg.values[3];
            var x = currentX + seg.values[4];
            var y = currentY + seg.values[5];
            absolutizedPathData.push({
                type: "C",
                values: [
                    x1,
                    y1,
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "Q") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            absolutizedPathData.push({
                type: "Q",
                values: [
                    x1,
                    y1,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "q") {
            var x1 = currentX + seg.values[0];
            var y1 = currentY + seg.values[1];
            var x = currentX + seg.values[2];
            var y = currentY + seg.values[3];
            absolutizedPathData.push({
                type: "Q",
                values: [
                    x1,
                    y1,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "A") {
            var x = seg.values[5];
            var y = seg.values[6];
            absolutizedPathData.push({
                type: "A",
                values: [
                    seg.values[0],
                    seg.values[1],
                    seg.values[2],
                    seg.values[3],
                    seg.values[4],
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "a") {
            var x = currentX + seg.values[5];
            var y = currentY + seg.values[6];
            absolutizedPathData.push({
                type: "A",
                values: [
                    seg.values[0],
                    seg.values[1],
                    seg.values[2],
                    seg.values[3],
                    seg.values[4],
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "H") {
            var x = seg.values[0];
            absolutizedPathData.push({
                type: "H",
                values: [
                    x
                ]
            });
            currentX = x;
        } else if (type === "h") {
            var x = currentX + seg.values[0];
            absolutizedPathData.push({
                type: "H",
                values: [
                    x
                ]
            });
            currentX = x;
        } else if (type === "V") {
            var y = seg.values[0];
            absolutizedPathData.push({
                type: "V",
                values: [
                    y
                ]
            });
            currentY = y;
        } else if (type === "v") {
            var y = currentY + seg.values[0];
            absolutizedPathData.push({
                type: "V",
                values: [
                    y
                ]
            });
            currentY = y;
        } else if (type === "S") {
            var x2 = seg.values[0];
            var y2 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            absolutizedPathData.push({
                type: "S",
                values: [
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "s") {
            var x2 = currentX + seg.values[0];
            var y2 = currentY + seg.values[1];
            var x = currentX + seg.values[2];
            var y = currentY + seg.values[3];
            absolutizedPathData.push({
                type: "S",
                values: [
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "T") {
            var x = seg.values[0];
            var y = seg.values[1];
            absolutizedPathData.push({
                type: "T",
                values: [
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "t") {
            var x = currentX + seg.values[0];
            var y = currentY + seg.values[1];
            absolutizedPathData.push({
                type: "T",
                values: [
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (type === "Z" || type === "z") {
            absolutizedPathData.push({
                type: "Z",
                values: []
            });
            currentX = subpathX;
            currentY = subpathY;
        }
    });
    return absolutizedPathData;
};
var reducePathData = function(pathData) {
    var reducedPathData = [];
    var lastType = null;
    var lastControlX = null;
    var lastControlY = null;
    var currentX = null;
    var currentY = null;
    var subpathX = null;
    var subpathY = null;
    pathData.forEach(function(seg) {
        if (seg.type === "M") {
            var x = seg.values[0];
            var y = seg.values[1];
            reducedPathData.push({
                type: "M",
                values: [
                    x,
                    y
                ]
            });
            subpathX = x;
            subpathY = y;
            currentX = x;
            currentY = y;
        } else if (seg.type === "C") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x2 = seg.values[2];
            var y2 = seg.values[3];
            var x = seg.values[4];
            var y = seg.values[5];
            reducedPathData.push({
                type: "C",
                values: [
                    x1,
                    y1,
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            lastControlX = x2;
            lastControlY = y2;
            currentX = x;
            currentY = y;
        } else if (seg.type === "L") {
            var x = seg.values[0];
            var y = seg.values[1];
            reducedPathData.push({
                type: "L",
                values: [
                    x,
                    y
                ]
            });
            currentX = x;
            currentY = y;
        } else if (seg.type === "H") {
            var x = seg.values[0];
            reducedPathData.push({
                type: "L",
                values: [
                    x,
                    currentY
                ]
            });
            currentX = x;
        } else if (seg.type === "V") {
            var y = seg.values[0];
            reducedPathData.push({
                type: "L",
                values: [
                    currentX,
                    y
                ]
            });
            currentY = y;
        } else if (seg.type === "S") {
            var x2 = seg.values[0];
            var y2 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            var cx1, cy1;
            if (lastType === "C" || lastType === "S") {
                cx1 = currentX + (currentX - lastControlX);
                cy1 = currentY + (currentY - lastControlY);
            } else {
                cx1 = currentX;
                cy1 = currentY;
            }
            reducedPathData.push({
                type: "C",
                values: [
                    cx1,
                    cy1,
                    x2,
                    y2,
                    x,
                    y
                ]
            });
            lastControlX = x2;
            lastControlY = y2;
            currentX = x;
            currentY = y;
        } else if (seg.type === "T") {
            var x = seg.values[0];
            var y = seg.values[1];
            var x1, y1;
            if (lastType === "Q" || lastType === "T") {
                x1 = currentX + (currentX - lastControlX);
                y1 = currentY + (currentY - lastControlY);
            } else {
                x1 = currentX;
                y1 = currentY;
            }
            var cx1 = currentX + 2 * (x1 - currentX) / 3;
            var cy1 = currentY + 2 * (y1 - currentY) / 3;
            var cx2 = x + 2 * (x1 - x) / 3;
            var cy2 = y + 2 * (y1 - y) / 3;
            reducedPathData.push({
                type: "C",
                values: [
                    cx1,
                    cy1,
                    cx2,
                    cy2,
                    x,
                    y
                ]
            });
            lastControlX = x1;
            lastControlY = y1;
            currentX = x;
            currentY = y;
        } else if (seg.type === "Q") {
            var x1 = seg.values[0];
            var y1 = seg.values[1];
            var x = seg.values[2];
            var y = seg.values[3];
            var cx1 = currentX + 2 * (x1 - currentX) / 3;
            var cy1 = currentY + 2 * (y1 - currentY) / 3;
            var cx2 = x + 2 * (x1 - x) / 3;
            var cy2 = y + 2 * (y1 - y) / 3;
            reducedPathData.push({
                type: "C",
                values: [
                    cx1,
                    cy1,
                    cx2,
                    cy2,
                    x,
                    y
                ]
            });
            lastControlX = x1;
            lastControlY = y1;
            currentX = x;
            currentY = y;
        } else if (seg.type === "A") {
            var r1 = Math.abs(seg.values[0]);
            var r2 = Math.abs(seg.values[1]);
            var angle = seg.values[2];
            var largeArcFlag = seg.values[3];
            var sweepFlag = seg.values[4];
            var x = seg.values[5];
            var y = seg.values[6];
            if (r1 === 0 || r2 === 0) {
                reducedPathData.push({
                    type: "C",
                    values: [
                        currentX,
                        currentY,
                        x,
                        y,
                        x,
                        y
                    ]
                });
                currentX = x;
                currentY = y;
            } else {
                if (currentX !== x || currentY !== y) {
                    var curves = arcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);
                    curves.forEach(function(curve) {
                        reducedPathData.push({
                            type: "C",
                            values: curve
                        });
                    });
                    currentX = x;
                    currentY = y;
                }
            }
        } else if (seg.type === "Z") {
            reducedPathData.push(seg);
            currentX = subpathX;
            currentY = subpathY;
        }
        lastType = seg.type;
    });
    return reducedPathData;
};
const getLength = (el, key)=>{
    if (key in el && "baseVal" in el[key]) {
        return el[key].baseVal.value;
    } else {
        return +el.getAttribute(key);
    }
};
const path = function(options) {
    if (options && options.normalize) {
        if (this[$cachedNormalizedPathData]) {
            return clonePathData(this[$cachedNormalizedPathData]);
        } else {
            var pathData;
            if (this[$cachedPathData]) {
                pathData = clonePathData(this[$cachedPathData]);
            } else {
                pathData = parsePathDataString(this.getAttribute("d") || "");
                this[$cachedPathData] = clonePathData(pathData);
            }
            var normalizedPathData = reducePathData(absolutizePathData(pathData));
            this[$cachedNormalizedPathData] = clonePathData(normalizedPathData);
            return normalizedPathData;
        }
    } else {
        if (this[$cachedPathData]) {
            return clonePathData(this[$cachedPathData]);
        } else {
            var pathData = parsePathDataString(this.getAttribute("d") || "");
            this[$cachedPathData] = clonePathData(pathData);
            return pathData;
        }
    }
};
const rect = function(options) {
    var x = getLength(this, "x");
    var y = getLength(this, "y");
    var width = getLength(this, "width");
    var height = getLength(this, "height");
    var rx = this.hasAttribute("rx") ? getLength(this, "rx") : getLength(this, "ry");
    var ry = this.hasAttribute("ry") ? getLength(this, "ry") : getLength(this, "rx");
    if (rx > width / 2) {
        rx = width / 2;
    }
    if (ry > height / 2) {
        ry = height / 2;
    }
    var pathData = [
        {
            type: "M",
            values: [
                x + rx,
                y
            ]
        },
        {
            type: "H",
            values: [
                x + width - rx
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                x + width,
                y + ry
            ]
        },
        {
            type: "V",
            values: [
                y + height - ry
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                x + width - rx,
                y + height
            ]
        },
        {
            type: "H",
            values: [
                x + rx
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                x,
                y + height - ry
            ]
        },
        {
            type: "V",
            values: [
                y + ry
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                x + rx,
                y
            ]
        },
        {
            type: "Z",
            values: []
        }
    ];
    pathData = pathData.filter(function(s) {
        return s.type === "A" && (s.values[0] === 0 || s.values[1] === 0) ? false : true;
    });
    if (options && options.normalize === true) {
        pathData = reducePathData(pathData);
    }
    return pathData;
};
const circle = function(options) {
    var cx = getLength(this, "cx");
    var cy = getLength(this, "cy");
    var r = getLength(this, "r");
    var pathData = [
        {
            type: "M",
            values: [
                cx + r,
                cy
            ]
        },
        {
            type: "A",
            values: [
                r,
                r,
                0,
                0,
                1,
                cx,
                cy + r
            ]
        },
        {
            type: "A",
            values: [
                r,
                r,
                0,
                0,
                1,
                cx - r,
                cy
            ]
        },
        {
            type: "A",
            values: [
                r,
                r,
                0,
                0,
                1,
                cx,
                cy - r
            ]
        },
        {
            type: "A",
            values: [
                r,
                r,
                0,
                0,
                1,
                cx + r,
                cy
            ]
        },
        {
            type: "Z",
            values: []
        }
    ];
    if (options && options.normalize === true) {
        pathData = reducePathData(pathData);
    }
    return pathData;
};
const ellipse = function(options) {
    var cx = getLength(this, "cx");
    var cy = getLength(this, "cy");
    var rx = getLength(this, "rx");
    var ry = getLength(this, "ry");
    var pathData = [
        {
            type: "M",
            values: [
                cx + rx,
                cy
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                cx,
                cy + ry
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                cx - rx,
                cy
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                cx,
                cy - ry
            ]
        },
        {
            type: "A",
            values: [
                rx,
                ry,
                0,
                0,
                1,
                cx + rx,
                cy
            ]
        },
        {
            type: "Z",
            values: []
        }
    ];
    if (options && options.normalize === true) {
        pathData = reducePathData(pathData);
    }
    return pathData;
};
const line1 = function() {
    const x1 = getLength(this, "x1");
    const x2 = getLength(this, "x2");
    const y1 = getLength(this, "y1");
    const y2 = getLength(this, "y2");
    return [
        {
            type: "M",
            values: [
                x1,
                y1
            ]
        },
        {
            type: "L",
            values: [
                x2,
                y2
            ]
        }
    ];
};
const polyline = function() {
    var pathData = [];
    for(var i = 0; i < this.points.numberOfItems; i += 1){
        var point = this.points.getItem(i);
        pathData.push({
            type: i === 0 ? "M" : "L",
            values: [
                point.x,
                point.y
            ]
        });
    }
    return pathData;
};
const polygon = function() {
    var pathData = [];
    for(var i = 0; i < this.points.numberOfItems; i += 1){
        var point = this.points.getItem(i);
        pathData.push({
            type: i === 0 ? "M" : "L",
            values: [
                point.x,
                point.y
            ]
        });
    }
    pathData.push({
        type: "Z",
        values: []
    });
    return pathData;
};
const pathDataGetters = {
    circle,
    ellipse,
    path,
    polygon,
    polyline,
    line: line1,
    rect
};
function getPathData(svgElement, options) {
    const type = svgElement.nodeName.toLowerCase();
    if (type in pathDataGetters) {
        return pathDataGetters[type].call(svgElement, options);
    } else {
        throw new Error(`Unsupported SVG element type: '${type}'`);
    }
}
function isFlatEnough([x0, y0, x1, y1, x2, y2, x3, y3], flatness) {
    const ux = 3 * x1 - 2 * x0 - x3, uy = 3 * y1 - 2 * y0 - y3, vx = 3 * x2 - 2 * x3 - x0, vy = 3 * y2 - 2 * y3 - y0;
    return Math.max(ux * ux, vx * vx) + Math.max(uy * uy, vy * vy) <= 16 * flatness * flatness;
}
function subdivide([x0, y0, x1, y1, x2, y2, x3, y3], t) {
    if (t === undefined) t = 0.5;
    let u = 1 - t, x4 = u * x0 + t * x1, y4 = u * y0 + t * y1, x5 = u * x1 + t * x2, y5 = u * y1 + t * y2, x6 = u * x2 + t * x3, y6 = u * y2 + t * y3, x7 = u * x4 + t * x5, y7 = u * y4 + t * y5, x8 = u * x5 + t * x6, y8 = u * y5 + t * y6, x9 = u * x7 + t * x8, y9 = u * y7 + t * y8;
    return [
        [
            x0,
            y0,
            x4,
            y4,
            x7,
            y7,
            x9,
            y9
        ],
        [
            x9,
            y9,
            x8,
            y8,
            x6,
            y6,
            x3,
            y3
        ]
    ];
}
function flatten(v, flatness, maxRecursion = 32) {
    const minSpan = 1 / maxRecursion;
    const parts = [];
    function computeParts(curve, t1, t2) {
        if (t2 - t1 > minSpan && !isFlatEnough(curve, flatness)) {
            const halves = subdivide(curve, 0.5);
            const tMid = (t1 + t2) / 2;
            computeParts(halves[0], t1, tMid);
            computeParts(halves[1], tMid, t2);
        } else {
            const dx = curve[6] - curve[0];
            const dy = curve[7] - curve[1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                parts.push(curve);
            }
        }
    }
    computeParts(v, 0, 1);
    return parts;
}
function flattenPath(d, options = {
}) {
    const pathEl = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    pathEl.setAttribute("d", d);
    const { maxError =0.1  } = options;
    const paths = [];
    const xf = ([x, y])=>[
            x,
            y
        ]
    ;
    const pathData = getPathData(pathEl, {
        normalize: true
    });
    let cur = null;
    let closePoint = null;
    for (const cmd of pathData){
        if (cmd.type === 'M') {
            cur = xf(cmd.values);
            closePoint = cur;
            paths.push({
                points: [
                    cur
                ]
            });
        } else if (cmd.type === 'L') {
            cur = xf(cmd.values);
            paths[paths.length - 1].points.push(cur);
        } else if (cmd.type === 'C') {
            const [x1, y1, x2, y2, x3, y3] = cmd.values;
            const [x0, y0] = cur;
            const [tx1, ty1] = xf([
                x1,
                y1
            ]);
            const [tx2, ty2] = xf([
                x2,
                y2
            ]);
            const [tx3, ty3] = xf([
                x3,
                y3
            ]);
            const parts = flatten([
                x0,
                y0,
                tx1,
                ty1,
                tx2,
                ty2,
                tx3,
                ty3
            ], maxError);
            for (const part of parts){
                paths[paths.length - 1].points.push([
                    part[6],
                    part[7]
                ]);
            }
            cur = [
                tx3,
                ty3
            ];
        } else if (cmd.type === 'A') {
            const [rx_, ry_, xAxisRotation, largeArc, sweep, x, y] = cmd.values;
            const phi = xAxisRotation;
            const fS = sweep;
            const fA = largeArc;
            const { cos , sin , atan2 , sqrt , sign , acos , abs , ceil  } = Math;
            const mpx = (cur[0] - x) / 2, mpy = (cur[1] - y) / 2;
            const x1_ = cos(phi) * mpx + sin(phi) * mpy, y1_ = -sin(phi) * mpx + cos(phi) * mpy;
            const x1_2 = x1_ * x1_, y1_2 = y1_ * y1_;
            const L = x1_2 / (rx_ * rx_) + y1_2 / (ry_ * ry_);
            const rx = L <= 1 ? sqrt(L) * rx_ : rx_;
            const ry = L <= 1 ? sqrt(L) * ry_ : ry_;
            const rx2 = rx * rx, ry2 = ry * ry;
            let factor = (rx2 * ry2 - rx2 * y1_2 - ry2 * x1_2) / (rx2 * y1_2 + ry2 * x1_2);
            if (abs(factor) < 0.0001) factor = 0;
            if (factor < 0) throw new Error(`bad arc args ${factor}`);
            const k = (fA === fS ? -1 : 1) * sqrt(factor);
            const cx_ = k * rx * y1_ / ry, cy_ = k * -ry * x1_ / rx;
            const cx = cos(phi) * cx_ - sin(phi) * cy_ + (cur[0] + x) / 2, cy = sin(phi) * cx_ + cos(phi) * cy_ + (cur[1] + y) / 2;
            const ang = (ux, uy, vx, vy)=>{
                return atan2(ux * vy - uy * vx, ux * vx + uy * vy);
            };
            const t1 = ang(1, 0, (x1_ - cx_) / rx, (y1_ - cy_) / ry);
            const dt_ = ang((x1_ - cx_) / rx, (y1_ - cy_) / ry, (-x1_ - cx_) / rx, (-y1_ - cy_) / ry) % (Math.PI * 2);
            const dt = fS === 0 && dt_ > 0 ? dt_ - Math.PI * 2 : fS === 1 && dt_ < 0 ? dt_ + Math.PI * 2 : dt_;
            const e0 = maxError;
            const n = ceil(abs(dt) / acos(1 - e0 / rx));
            for(let i = 1; i <= n; i++){
                const theta = t1 + dt * i / n;
                const tx = cos(phi) * rx * cos(theta) - sin(phi) * ry * sin(theta) + cx;
                const ty = sin(phi) * rx * cos(theta) + cos(phi) * ry * sin(theta) + cy;
                paths[paths.length - 1].points.push([
                    tx,
                    ty
                ]);
            }
            cur = [
                x,
                y
            ];
        } else if (cmd.type === 'Z') {
            if (closePoint && (cur[0] !== closePoint[0] || cur[1] !== closePoint[1])) {
                paths[paths.length - 1].points.push(closePoint);
            }
        } else {
            throw Error(`Unexpected path command: "${cmd}"`);
        }
    }
    return paths;
}
let System, __instantiateAsync, __instantiate;
(()=>{
    const r = new Map();
    System = {
        register (id, d, f) {
            r.set(id, {
                d,
                f,
                exp: {
                }
            });
        }
    };
    async function dI(mid, src) {
        let id = mid.replace(/\.\w+$/i, "");
        if (id.includes("./")) {
            const [o, ...ia] = id.split("/").reverse(), [, ...sa] = src.split("/").reverse(), oa = [
                o
            ];
            let s = 0, i;
            while(i = ia.shift()){
                if (i === "..") s++;
                else if (i === ".") break;
                else oa.push(i);
            }
            if (s < sa.length) oa.push(...sa.slice(s));
            id = oa.reverse().join("/");
        }
        return r.has(id) ? gExpA(id) : import(mid);
    }
    function gC(id, main1) {
        return {
            id,
            import: (m)=>dI(m, id)
            ,
            meta: {
                url: id,
                main: main1
            }
        };
    }
    function gE(exp) {
        return (id, v)=>{
            v = typeof id === "string" ? {
                [id]: v
            } : id;
            for (const [id1, value] of Object.entries(v)){
                Object.defineProperty(exp, id1, {
                    value,
                    writable: true,
                    enumerable: true
                });
            }
        };
    }
    function rF(main1) {
        for (const [id, m] of r.entries()){
            const { f , exp  } = m;
            const { execute: e , setters: s  } = f(gE(exp), gC(id, id === main1));
            delete m.f;
            m.e = e;
            m.s = s;
        }
    }
    async function gExpA(id) {
        if (!r.has(id)) return;
        const m = r.get(id);
        if (m.s) {
            const { d , e , s  } = m;
            delete m.s;
            delete m.e;
            for(let i = 0; i < s.length; i++)s[i](await gExpA(d[i]));
            const r1 = e();
            if (r1) await r1;
        }
        return m.exp;
    }
    function gExp(id) {
        if (!r.has(id)) return;
        const m = r.get(id);
        if (m.s) {
            const { d , e , s  } = m;
            delete m.s;
            delete m.e;
            for(let i = 0; i < s.length; i++)s[i](gExp(d[i]));
            e();
        }
        return m.exp;
    }
    __instantiateAsync = async (m)=>{
        System = __instantiateAsync = __instantiate = undefined;
        rF(m);
        return gExpA(m);
    };
    __instantiate = (m)=>{
        System = __instantiateAsync = __instantiate = undefined;
        rF(m);
        return gExp(m);
    };
})();
System.register("-/clipper-lib@v6.4.2-JisZmmhC7gDAFmHQLYDu/dist=es2020/clipper-lib", [], function(exports_1, context_1) {
    "use strict";
    var clipper, __esModule;
    var __moduleName = context_1 && context_1.id;
    function createCommonjsModule(fn, basedir, module) {
        return module = {
            path: basedir,
            exports: {
            },
            require: function(path1, base) {
                return commonjsRequire(path1, base === undefined || base === null ? module.path : base);
            }
        }, fn(module, module.exports), module.exports;
    }
    function commonjsRequire() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
    }
    return {
        setters: [],
        execute: function() {
            clipper = createCommonjsModule(function(module) {
                (function() {
                    var ClipperLib = {
                    };
                    ClipperLib.version = "6.4.2.2";
                    ClipperLib.use_lines = true;
                    ClipperLib.use_xyz = false;
                    var isNode = false;
                    if (module.exports) {
                        module.exports = ClipperLib;
                        isNode = true;
                    } else {
                        if (typeof document !== "undefined") {
                            window.ClipperLib = ClipperLib;
                        } else {
                            self["ClipperLib"] = ClipperLib;
                        }
                    }
                    var navigator_appName;
                    if (!isNode) {
                        var nav = navigator.userAgent.toString().toLowerCase();
                        navigator_appName = navigator.appName;
                    } else {
                        var nav = "chrome";
                        navigator_appName = "Netscape";
                    }
                    var browser = {
                    };
                    if (nav.indexOf("chrome") != -1 && nav.indexOf("chromium") == -1) {
                        browser.chrome = 1;
                    } else {
                        browser.chrome = 0;
                    }
                    if (nav.indexOf("chromium") != -1) {
                        browser.chromium = 1;
                    } else {
                        browser.chromium = 0;
                    }
                    if (nav.indexOf("safari") != -1 && nav.indexOf("chrome") == -1 && nav.indexOf("chromium") == -1) {
                        browser.safari = 1;
                    } else {
                        browser.safari = 0;
                    }
                    if (nav.indexOf("firefox") != -1) {
                        browser.firefox = 1;
                    } else {
                        browser.firefox = 0;
                    }
                    if (nav.indexOf("firefox/17") != -1) {
                        browser.firefox17 = 1;
                    } else {
                        browser.firefox17 = 0;
                    }
                    if (nav.indexOf("firefox/15") != -1) {
                        browser.firefox15 = 1;
                    } else {
                        browser.firefox15 = 0;
                    }
                    if (nav.indexOf("firefox/3") != -1) {
                        browser.firefox3 = 1;
                    } else {
                        browser.firefox3 = 0;
                    }
                    if (nav.indexOf("opera") != -1) {
                        browser.opera = 1;
                    } else {
                        browser.opera = 0;
                    }
                    if (nav.indexOf("msie 10") != -1) {
                        browser.msie10 = 1;
                    } else {
                        browser.msie10 = 0;
                    }
                    if (nav.indexOf("msie 9") != -1) {
                        browser.msie9 = 1;
                    } else {
                        browser.msie9 = 0;
                    }
                    if (nav.indexOf("msie 8") != -1) {
                        browser.msie8 = 1;
                    } else {
                        browser.msie8 = 0;
                    }
                    if (nav.indexOf("msie 7") != -1) {
                        browser.msie7 = 1;
                    } else {
                        browser.msie7 = 0;
                    }
                    if (nav.indexOf("msie ") != -1) {
                        browser.msie = 1;
                    } else {
                        browser.msie = 0;
                    }
                    ClipperLib.biginteger_used = null;
                    var dbits;
                    function BigInteger(a, b, c) {
                        ClipperLib.biginteger_used = 1;
                        if (a != null) {
                            if ("number" == typeof a && "undefined" == typeof b) {
                                this.fromInt(a);
                            } else if ("number" == typeof a) {
                                this.fromNumber(a, b, c);
                            } else if (b == null && "string" != typeof a) {
                                this.fromString(a, 256);
                            } else {
                                this.fromString(a, b);
                            }
                        }
                    }
                    function nbi() {
                        return new BigInteger(null, undefined, undefined);
                    }
                    function am1(i, x, w, j, c, n) {
                        while((--n) >= 0){
                            var v = x * this[i++] + w[j] + c;
                            c = Math.floor(v / 67108864);
                            w[j++] = v & 67108863;
                        }
                        return c;
                    }
                    function am2(i, x, w, j, c, n) {
                        var xl = x & 32767, xh = x >> 15;
                        while((--n) >= 0){
                            var l = this[i] & 32767;
                            var h = this[i++] >> 15;
                            var m = xh * l + h * xl;
                            l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
                            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
                            w[j++] = l & 1073741823;
                        }
                        return c;
                    }
                    function am3(i, x, w, j, c, n) {
                        var xl = x & 16383, xh = x >> 14;
                        while((--n) >= 0){
                            var l = this[i] & 16383;
                            var h = this[i++] >> 14;
                            var m = xh * l + h * xl;
                            l = xl * l + ((m & 16383) << 14) + w[j] + c;
                            c = (l >> 28) + (m >> 14) + xh * h;
                            w[j++] = l & 268435455;
                        }
                        return c;
                    }
                    if (navigator_appName == "Microsoft Internet Explorer") {
                        BigInteger.prototype.am = am2;
                        dbits = 30;
                    } else if (navigator_appName != "Netscape") {
                        BigInteger.prototype.am = am1;
                        dbits = 26;
                    } else {
                        BigInteger.prototype.am = am3;
                        dbits = 28;
                    }
                    BigInteger.prototype.DB = dbits;
                    BigInteger.prototype.DM = (1 << dbits) - 1;
                    BigInteger.prototype.DV = 1 << dbits;
                    var BI_FP = 52;
                    BigInteger.prototype.FV = Math.pow(2, BI_FP);
                    BigInteger.prototype.F1 = BI_FP - dbits;
                    BigInteger.prototype.F2 = 2 * dbits - BI_FP;
                    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
                    var BI_RC = new Array();
                    var rr, vv;
                    rr = "0".charCodeAt(0);
                    for(vv = 0; vv <= 9; ++vv){
                        BI_RC[rr++] = vv;
                    }
                    rr = "a".charCodeAt(0);
                    for(vv = 10; vv < 36; ++vv){
                        BI_RC[rr++] = vv;
                    }
                    rr = "A".charCodeAt(0);
                    for(vv = 10; vv < 36; ++vv){
                        BI_RC[rr++] = vv;
                    }
                    function int2char(n) {
                        return BI_RM.charAt(n);
                    }
                    function intAt(s, i) {
                        var c = BI_RC[s.charCodeAt(i)];
                        return c == null ? -1 : c;
                    }
                    function bnpCopyTo(r) {
                        for(var i = this.t - 1; i >= 0; --i){
                            r[i] = this[i];
                        }
                        r.t = this.t;
                        r.s = this.s;
                    }
                    function bnpFromInt(x) {
                        this.t = 1;
                        this.s = x < 0 ? -1 : 0;
                        if (x > 0) {
                            this[0] = x;
                        } else if (x < -1) {
                            this[0] = x + this.DV;
                        } else {
                            this.t = 0;
                        }
                    }
                    function nbv(i) {
                        var r = nbi();
                        r.fromInt(i);
                        return r;
                    }
                    function bnpFromString(s, b) {
                        var k;
                        if (b == 16) {
                            k = 4;
                        } else if (b == 8) {
                            k = 3;
                        } else if (b == 256) {
                            k = 8;
                        } else if (b == 2) {
                            k = 1;
                        } else if (b == 32) {
                            k = 5;
                        } else if (b == 4) {
                            k = 2;
                        } else {
                            this.fromRadix(s, b);
                            return;
                        }
                        this.t = 0;
                        this.s = 0;
                        var i = s.length, mi = false, sh = 0;
                        while((--i) >= 0){
                            var x = k == 8 ? s[i] & 255 : intAt(s, i);
                            if (x < 0) {
                                if (s.charAt(i) == "-") {
                                    mi = true;
                                }
                                continue;
                            }
                            mi = false;
                            if (sh == 0) {
                                this[this.t++] = x;
                            } else if (sh + k > this.DB) {
                                this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
                                this[this.t++] = x >> this.DB - sh;
                            } else {
                                this[this.t - 1] |= x << sh;
                            }
                            sh += k;
                            if (sh >= this.DB) {
                                sh -= this.DB;
                            }
                        }
                        if (k == 8 && (s[0] & 128) != 0) {
                            this.s = -1;
                            if (sh > 0) {
                                this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
                            }
                        }
                        this.clamp();
                        if (mi) {
                            BigInteger.ZERO.subTo(this, this);
                        }
                    }
                    function bnpClamp() {
                        var c = this.s & this.DM;
                        while(this.t > 0 && this[this.t - 1] == c){
                            --this.t;
                        }
                    }
                    function bnToString(b) {
                        if (this.s < 0) {
                            return "-" + this.negate().toString(b);
                        }
                        var k;
                        if (b == 16) {
                            k = 4;
                        } else if (b == 8) {
                            k = 3;
                        } else if (b == 2) {
                            k = 1;
                        } else if (b == 32) {
                            k = 5;
                        } else if (b == 4) {
                            k = 2;
                        } else {
                            return this.toRadix(b);
                        }
                        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
                        var p = this.DB - i * this.DB % k;
                        if ((i--) > 0) {
                            if (p < this.DB && (d = this[i] >> p) > 0) {
                                m = true;
                                r = int2char(d);
                            }
                            while(i >= 0){
                                if (p < k) {
                                    d = (this[i] & (1 << p) - 1) << k - p;
                                    d |= this[--i] >> (p += this.DB - k);
                                } else {
                                    d = this[i] >> (p -= k) & km;
                                    if (p <= 0) {
                                        p += this.DB;
                                        --i;
                                    }
                                }
                                if (d > 0) {
                                    m = true;
                                }
                                if (m) {
                                    r += int2char(d);
                                }
                            }
                        }
                        return m ? r : "0";
                    }
                    function bnNegate() {
                        var r = nbi();
                        BigInteger.ZERO.subTo(this, r);
                        return r;
                    }
                    function bnAbs() {
                        return this.s < 0 ? this.negate() : this;
                    }
                    function bnCompareTo(a) {
                        var r = this.s - a.s;
                        if (r != 0) {
                            return r;
                        }
                        var i = this.t;
                        r = i - a.t;
                        if (r != 0) {
                            return this.s < 0 ? -r : r;
                        }
                        while((--i) >= 0){
                            if ((r = this[i] - a[i]) != 0) {
                                return r;
                            }
                        }
                        return 0;
                    }
                    function nbits(x) {
                        var r = 1, t;
                        if ((t = x >>> 16) != 0) {
                            x = t;
                            r += 16;
                        }
                        if ((t = x >> 8) != 0) {
                            x = t;
                            r += 8;
                        }
                        if ((t = x >> 4) != 0) {
                            x = t;
                            r += 4;
                        }
                        if ((t = x >> 2) != 0) {
                            x = t;
                            r += 2;
                        }
                        if ((t = x >> 1) != 0) {
                            x = t;
                            r += 1;
                        }
                        return r;
                    }
                    function bnBitLength() {
                        if (this.t <= 0) {
                            return 0;
                        }
                        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
                    }
                    function bnpDLShiftTo(n, r) {
                        var i;
                        for(i = this.t - 1; i >= 0; --i){
                            r[i + n] = this[i];
                        }
                        for(i = n - 1; i >= 0; --i){
                            r[i] = 0;
                        }
                        r.t = this.t + n;
                        r.s = this.s;
                    }
                    function bnpDRShiftTo(n, r) {
                        for(var i = n; i < this.t; ++i){
                            r[i - n] = this[i];
                        }
                        r.t = Math.max(this.t - n, 0);
                        r.s = this.s;
                    }
                    function bnpLShiftTo(n, r) {
                        var bs = n % this.DB;
                        var cbs = this.DB - bs;
                        var bm = (1 << cbs) - 1;
                        var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
                        for(i = this.t - 1; i >= 0; --i){
                            r[i + ds + 1] = this[i] >> cbs | c;
                            c = (this[i] & bm) << bs;
                        }
                        for(i = ds - 1; i >= 0; --i){
                            r[i] = 0;
                        }
                        r[ds] = c;
                        r.t = this.t + ds + 1;
                        r.s = this.s;
                        r.clamp();
                    }
                    function bnpRShiftTo(n, r) {
                        r.s = this.s;
                        var ds = Math.floor(n / this.DB);
                        if (ds >= this.t) {
                            r.t = 0;
                            return;
                        }
                        var bs = n % this.DB;
                        var cbs = this.DB - bs;
                        var bm = (1 << bs) - 1;
                        r[0] = this[ds] >> bs;
                        for(var i = ds + 1; i < this.t; ++i){
                            r[i - ds - 1] |= (this[i] & bm) << cbs;
                            r[i - ds] = this[i] >> bs;
                        }
                        if (bs > 0) {
                            r[this.t - ds - 1] |= (this.s & bm) << cbs;
                        }
                        r.t = this.t - ds;
                        r.clamp();
                    }
                    function bnpSubTo(a, r) {
                        var i = 0, c = 0, m = Math.min(a.t, this.t);
                        while(i < m){
                            c += this[i] - a[i];
                            r[i++] = c & this.DM;
                            c >>= this.DB;
                        }
                        if (a.t < this.t) {
                            c -= a.s;
                            while(i < this.t){
                                c += this[i];
                                r[i++] = c & this.DM;
                                c >>= this.DB;
                            }
                            c += this.s;
                        } else {
                            c += this.s;
                            while(i < a.t){
                                c -= a[i];
                                r[i++] = c & this.DM;
                                c >>= this.DB;
                            }
                            c -= a.s;
                        }
                        r.s = c < 0 ? -1 : 0;
                        if (c < -1) {
                            r[i++] = this.DV + c;
                        } else if (c > 0) {
                            r[i++] = c;
                        }
                        r.t = i;
                        r.clamp();
                    }
                    function bnpMultiplyTo(a, r) {
                        var x = this.abs(), y = a.abs();
                        var i = x.t;
                        r.t = i + y.t;
                        while((--i) >= 0){
                            r[i] = 0;
                        }
                        for(i = 0; i < y.t; ++i){
                            r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
                        }
                        r.s = 0;
                        r.clamp();
                        if (this.s != a.s) {
                            BigInteger.ZERO.subTo(r, r);
                        }
                    }
                    function bnpSquareTo(r) {
                        var x = this.abs();
                        var i = r.t = 2 * x.t;
                        while((--i) >= 0){
                            r[i] = 0;
                        }
                        for(i = 0; i < x.t - 1; ++i){
                            var c = x.am(i, x[i], r, 2 * i, 0, 1);
                            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                                r[i + x.t] -= x.DV;
                                r[i + x.t + 1] = 1;
                            }
                        }
                        if (r.t > 0) {
                            r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
                        }
                        r.s = 0;
                        r.clamp();
                    }
                    function bnpDivRemTo(m, q, r) {
                        var pm = m.abs();
                        if (pm.t <= 0) {
                            return;
                        }
                        var pt = this.abs();
                        if (pt.t < pm.t) {
                            if (q != null) {
                                q.fromInt(0);
                            }
                            if (r != null) {
                                this.copyTo(r);
                            }
                            return;
                        }
                        if (r == null) {
                            r = nbi();
                        }
                        var y = nbi(), ts = this.s, ms = m.s;
                        var nsh = this.DB - nbits(pm[pm.t - 1]);
                        if (nsh > 0) {
                            pm.lShiftTo(nsh, y);
                            pt.lShiftTo(nsh, r);
                        } else {
                            pm.copyTo(y);
                            pt.copyTo(r);
                        }
                        var ys = y.t;
                        var y0 = y[ys - 1];
                        if (y0 == 0) {
                            return;
                        }
                        var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
                        var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
                        var i = r.t, j = i - ys, t = q == null ? nbi() : q;
                        y.dlShiftTo(j, t);
                        if (r.compareTo(t) >= 0) {
                            r[r.t++] = 1;
                            r.subTo(t, r);
                        }
                        BigInteger.ONE.dlShiftTo(ys, t);
                        t.subTo(y, y);
                        while(y.t < ys){
                            y[y.t++] = 0;
                        }
                        while((--j) >= 0){
                            var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
                            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                                y.dlShiftTo(j, t);
                                r.subTo(t, r);
                                while(r[i] < --qd){
                                    r.subTo(t, r);
                                }
                            }
                        }
                        if (q != null) {
                            r.drShiftTo(ys, q);
                            if (ts != ms) {
                                BigInteger.ZERO.subTo(q, q);
                            }
                        }
                        r.t = ys;
                        r.clamp();
                        if (nsh > 0) {
                            r.rShiftTo(nsh, r);
                        }
                        if (ts < 0) {
                            BigInteger.ZERO.subTo(r, r);
                        }
                    }
                    function bnMod(a) {
                        var r = nbi();
                        this.abs().divRemTo(a, null, r);
                        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
                            a.subTo(r, r);
                        }
                        return r;
                    }
                    function Classic(m) {
                        this.m = m;
                    }
                    function cConvert(x) {
                        if (x.s < 0 || x.compareTo(this.m) >= 0) {
                            return x.mod(this.m);
                        } else {
                            return x;
                        }
                    }
                    function cRevert(x) {
                        return x;
                    }
                    function cReduce(x) {
                        x.divRemTo(this.m, null, x);
                    }
                    function cMulTo(x, y, r) {
                        x.multiplyTo(y, r);
                        this.reduce(r);
                    }
                    function cSqrTo(x, r) {
                        x.squareTo(r);
                        this.reduce(r);
                    }
                    Classic.prototype.convert = cConvert;
                    Classic.prototype.revert = cRevert;
                    Classic.prototype.reduce = cReduce;
                    Classic.prototype.mulTo = cMulTo;
                    Classic.prototype.sqrTo = cSqrTo;
                    function bnpInvDigit() {
                        if (this.t < 1) {
                            return 0;
                        }
                        var x = this[0];
                        if ((x & 1) == 0) {
                            return 0;
                        }
                        var y = x & 3;
                        y = y * (2 - (x & 15) * y) & 15;
                        y = y * (2 - (x & 255) * y) & 255;
                        y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
                        y = y * (2 - x * y % this.DV) % this.DV;
                        return y > 0 ? this.DV - y : -y;
                    }
                    function Montgomery(m) {
                        this.m = m;
                        this.mp = m.invDigit();
                        this.mpl = this.mp & 32767;
                        this.mph = this.mp >> 15;
                        this.um = (1 << m.DB - 15) - 1;
                        this.mt2 = 2 * m.t;
                    }
                    function montConvert(x) {
                        var r = nbi();
                        x.abs().dlShiftTo(this.m.t, r);
                        r.divRemTo(this.m, null, r);
                        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
                            this.m.subTo(r, r);
                        }
                        return r;
                    }
                    function montRevert(x) {
                        var r = nbi();
                        x.copyTo(r);
                        this.reduce(r);
                        return r;
                    }
                    function montReduce(x) {
                        while(x.t <= this.mt2){
                            x[x.t++] = 0;
                        }
                        for(var i = 0; i < this.m.t; ++i){
                            var j = x[i] & 32767;
                            var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
                            j = i + this.m.t;
                            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
                            while(x[j] >= x.DV){
                                x[j] -= x.DV;
                                x[++j]++;
                            }
                        }
                        x.clamp();
                        x.drShiftTo(this.m.t, x);
                        if (x.compareTo(this.m) >= 0) {
                            x.subTo(this.m, x);
                        }
                    }
                    function montSqrTo(x, r) {
                        x.squareTo(r);
                        this.reduce(r);
                    }
                    function montMulTo(x, y, r) {
                        x.multiplyTo(y, r);
                        this.reduce(r);
                    }
                    Montgomery.prototype.convert = montConvert;
                    Montgomery.prototype.revert = montRevert;
                    Montgomery.prototype.reduce = montReduce;
                    Montgomery.prototype.mulTo = montMulTo;
                    Montgomery.prototype.sqrTo = montSqrTo;
                    function bnpIsEven() {
                        return (this.t > 0 ? this[0] & 1 : this.s) == 0;
                    }
                    function bnpExp(e, z) {
                        if (e > 4294967295 || e < 1) {
                            return BigInteger.ONE;
                        }
                        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
                        g.copyTo(r);
                        while((--i) >= 0){
                            z.sqrTo(r, r2);
                            if ((e & 1 << i) > 0) {
                                z.mulTo(r2, g, r);
                            } else {
                                var t = r;
                                r = r2;
                                r2 = t;
                            }
                        }
                        return z.revert(r);
                    }
                    function bnModPowInt(e, m) {
                        var z;
                        if (e < 256 || m.isEven()) {
                            z = new Classic(m);
                        } else {
                            z = new Montgomery(m);
                        }
                        return this.exp(e, z);
                    }
                    BigInteger.prototype.copyTo = bnpCopyTo;
                    BigInteger.prototype.fromInt = bnpFromInt;
                    BigInteger.prototype.fromString = bnpFromString;
                    BigInteger.prototype.clamp = bnpClamp;
                    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
                    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
                    BigInteger.prototype.lShiftTo = bnpLShiftTo;
                    BigInteger.prototype.rShiftTo = bnpRShiftTo;
                    BigInteger.prototype.subTo = bnpSubTo;
                    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
                    BigInteger.prototype.squareTo = bnpSquareTo;
                    BigInteger.prototype.divRemTo = bnpDivRemTo;
                    BigInteger.prototype.invDigit = bnpInvDigit;
                    BigInteger.prototype.isEven = bnpIsEven;
                    BigInteger.prototype.exp = bnpExp;
                    BigInteger.prototype.toString = bnToString;
                    BigInteger.prototype.negate = bnNegate;
                    BigInteger.prototype.abs = bnAbs;
                    BigInteger.prototype.compareTo = bnCompareTo;
                    BigInteger.prototype.bitLength = bnBitLength;
                    BigInteger.prototype.mod = bnMod;
                    BigInteger.prototype.modPowInt = bnModPowInt;
                    BigInteger.ZERO = nbv(0);
                    BigInteger.ONE = nbv(1);
                    function bnClone() {
                        var r = nbi();
                        this.copyTo(r);
                        return r;
                    }
                    function bnIntValue() {
                        if (this.s < 0) {
                            if (this.t == 1) {
                                return this[0] - this.DV;
                            } else if (this.t == 0) {
                                return -1;
                            }
                        } else if (this.t == 1) {
                            return this[0];
                        } else if (this.t == 0) {
                            return 0;
                        }
                        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
                    }
                    function bnByteValue() {
                        return this.t == 0 ? this.s : this[0] << 24 >> 24;
                    }
                    function bnShortValue() {
                        return this.t == 0 ? this.s : this[0] << 16 >> 16;
                    }
                    function bnpChunkSize(r) {
                        return Math.floor(Math.LN2 * this.DB / Math.log(r));
                    }
                    function bnSigNum() {
                        if (this.s < 0) {
                            return -1;
                        } else if (this.t <= 0 || this.t == 1 && this[0] <= 0) {
                            return 0;
                        } else {
                            return 1;
                        }
                    }
                    function bnpToRadix(b) {
                        if (b == null) {
                            b = 10;
                        }
                        if (this.signum() == 0 || b < 2 || b > 36) {
                            return "0";
                        }
                        var cs = this.chunkSize(b);
                        var a = Math.pow(b, cs);
                        var d = nbv(a), y = nbi(), z = nbi(), r = "";
                        this.divRemTo(d, y, z);
                        while(y.signum() > 0){
                            r = (a + z.intValue()).toString(b).substr(1) + r;
                            y.divRemTo(d, y, z);
                        }
                        return z.intValue().toString(b) + r;
                    }
                    function bnpFromRadix(s, b) {
                        this.fromInt(0);
                        if (b == null) {
                            b = 10;
                        }
                        var cs = this.chunkSize(b);
                        var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
                        for(var i = 0; i < s.length; ++i){
                            var x = intAt(s, i);
                            if (x < 0) {
                                if (s.charAt(i) == "-" && this.signum() == 0) {
                                    mi = true;
                                }
                                continue;
                            }
                            w = b * w + x;
                            if ((++j) >= cs) {
                                this.dMultiply(d);
                                this.dAddOffset(w, 0);
                                j = 0;
                                w = 0;
                            }
                        }
                        if (j > 0) {
                            this.dMultiply(Math.pow(b, j));
                            this.dAddOffset(w, 0);
                        }
                        if (mi) {
                            BigInteger.ZERO.subTo(this, this);
                        }
                    }
                    function bnpFromNumber(a, b, c) {
                        if ("number" == typeof b) {
                            if (a < 2) {
                                this.fromInt(1);
                            } else {
                                this.fromNumber(a, c);
                                if (!this.testBit(a - 1)) {
                                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                                }
                                if (this.isEven()) {
                                    this.dAddOffset(1, 0);
                                }
                                while(!this.isProbablePrime(b)){
                                    this.dAddOffset(2, 0);
                                    if (this.bitLength() > a) {
                                        this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                                    }
                                }
                            }
                        } else {
                            var x = new Array(), t = a & 7;
                            x.length = (a >> 3) + 1;
                            b.nextBytes(x);
                            if (t > 0) {
                                x[0] &= (1 << t) - 1;
                            } else {
                                x[0] = 0;
                            }
                            this.fromString(x, 256);
                        }
                    }
                    function bnToByteArray() {
                        var i = this.t, r = new Array();
                        r[0] = this.s;
                        var p = this.DB - i * this.DB % 8, d, k = 0;
                        if ((i--) > 0) {
                            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) {
                                r[k++] = d | this.s << this.DB - p;
                            }
                            while(i >= 0){
                                if (p < 8) {
                                    d = (this[i] & (1 << p) - 1) << 8 - p;
                                    d |= this[--i] >> (p += this.DB - 8);
                                } else {
                                    d = this[i] >> (p -= 8) & 255;
                                    if (p <= 0) {
                                        p += this.DB;
                                        --i;
                                    }
                                }
                                if ((d & 128) != 0) {
                                    d |= -256;
                                }
                                if (k == 0 && (this.s & 128) != (d & 128)) {
                                    ++k;
                                }
                                if (k > 0 || d != this.s) {
                                    r[k++] = d;
                                }
                            }
                        }
                        return r;
                    }
                    function bnEquals(a) {
                        return this.compareTo(a) == 0;
                    }
                    function bnMin(a) {
                        return this.compareTo(a) < 0 ? this : a;
                    }
                    function bnMax(a) {
                        return this.compareTo(a) > 0 ? this : a;
                    }
                    function bnpBitwiseTo(a, op, r) {
                        var i, f, m = Math.min(a.t, this.t);
                        for(i = 0; i < m; ++i){
                            r[i] = op(this[i], a[i]);
                        }
                        if (a.t < this.t) {
                            f = a.s & this.DM;
                            for(i = m; i < this.t; ++i){
                                r[i] = op(this[i], f);
                            }
                            r.t = this.t;
                        } else {
                            f = this.s & this.DM;
                            for(i = m; i < a.t; ++i){
                                r[i] = op(f, a[i]);
                            }
                            r.t = a.t;
                        }
                        r.s = op(this.s, a.s);
                        r.clamp();
                    }
                    function op_and(x, y) {
                        return x & y;
                    }
                    function bnAnd(a) {
                        var r = nbi();
                        this.bitwiseTo(a, op_and, r);
                        return r;
                    }
                    function op_or(x, y) {
                        return x | y;
                    }
                    function bnOr(a) {
                        var r = nbi();
                        this.bitwiseTo(a, op_or, r);
                        return r;
                    }
                    function op_xor(x, y) {
                        return x ^ y;
                    }
                    function bnXor(a) {
                        var r = nbi();
                        this.bitwiseTo(a, op_xor, r);
                        return r;
                    }
                    function op_andnot(x, y) {
                        return x & ~y;
                    }
                    function bnAndNot(a) {
                        var r = nbi();
                        this.bitwiseTo(a, op_andnot, r);
                        return r;
                    }
                    function bnNot() {
                        var r = nbi();
                        for(var i = 0; i < this.t; ++i){
                            r[i] = this.DM & ~this[i];
                        }
                        r.t = this.t;
                        r.s = ~this.s;
                        return r;
                    }
                    function bnShiftLeft(n) {
                        var r = nbi();
                        if (n < 0) {
                            this.rShiftTo(-n, r);
                        } else {
                            this.lShiftTo(n, r);
                        }
                        return r;
                    }
                    function bnShiftRight(n) {
                        var r = nbi();
                        if (n < 0) {
                            this.lShiftTo(-n, r);
                        } else {
                            this.rShiftTo(n, r);
                        }
                        return r;
                    }
                    function lbit(x) {
                        if (x == 0) {
                            return -1;
                        }
                        var r = 0;
                        if ((x & 65535) == 0) {
                            x >>= 16;
                            r += 16;
                        }
                        if ((x & 255) == 0) {
                            x >>= 8;
                            r += 8;
                        }
                        if ((x & 15) == 0) {
                            x >>= 4;
                            r += 4;
                        }
                        if ((x & 3) == 0) {
                            x >>= 2;
                            r += 2;
                        }
                        if ((x & 1) == 0) {
                            ++r;
                        }
                        return r;
                    }
                    function bnGetLowestSetBit() {
                        for(var i = 0; i < this.t; ++i){
                            if (this[i] != 0) {
                                return i * this.DB + lbit(this[i]);
                            }
                        }
                        if (this.s < 0) {
                            return this.t * this.DB;
                        }
                        return -1;
                    }
                    function cbit(x) {
                        var r = 0;
                        while(x != 0){
                            x &= x - 1;
                            ++r;
                        }
                        return r;
                    }
                    function bnBitCount() {
                        var r = 0, x = this.s & this.DM;
                        for(var i = 0; i < this.t; ++i){
                            r += cbit(this[i] ^ x);
                        }
                        return r;
                    }
                    function bnTestBit(n) {
                        var j = Math.floor(n / this.DB);
                        if (j >= this.t) {
                            return this.s != 0;
                        }
                        return (this[j] & 1 << n % this.DB) != 0;
                    }
                    function bnpChangeBit(n, op) {
                        var r = BigInteger.ONE.shiftLeft(n);
                        this.bitwiseTo(r, op, r);
                        return r;
                    }
                    function bnSetBit(n) {
                        return this.changeBit(n, op_or);
                    }
                    function bnClearBit(n) {
                        return this.changeBit(n, op_andnot);
                    }
                    function bnFlipBit(n) {
                        return this.changeBit(n, op_xor);
                    }
                    function bnpAddTo(a, r) {
                        var i = 0, c = 0, m = Math.min(a.t, this.t);
                        while(i < m){
                            c += this[i] + a[i];
                            r[i++] = c & this.DM;
                            c >>= this.DB;
                        }
                        if (a.t < this.t) {
                            c += a.s;
                            while(i < this.t){
                                c += this[i];
                                r[i++] = c & this.DM;
                                c >>= this.DB;
                            }
                            c += this.s;
                        } else {
                            c += this.s;
                            while(i < a.t){
                                c += a[i];
                                r[i++] = c & this.DM;
                                c >>= this.DB;
                            }
                            c += a.s;
                        }
                        r.s = c < 0 ? -1 : 0;
                        if (c > 0) {
                            r[i++] = c;
                        } else if (c < -1) {
                            r[i++] = this.DV + c;
                        }
                        r.t = i;
                        r.clamp();
                    }
                    function bnAdd(a) {
                        var r = nbi();
                        this.addTo(a, r);
                        return r;
                    }
                    function bnSubtract(a) {
                        var r = nbi();
                        this.subTo(a, r);
                        return r;
                    }
                    function bnMultiply(a) {
                        var r = nbi();
                        this.multiplyTo(a, r);
                        return r;
                    }
                    function bnSquare() {
                        var r = nbi();
                        this.squareTo(r);
                        return r;
                    }
                    function bnDivide(a) {
                        var r = nbi();
                        this.divRemTo(a, r, null);
                        return r;
                    }
                    function bnRemainder(a) {
                        var r = nbi();
                        this.divRemTo(a, null, r);
                        return r;
                    }
                    function bnDivideAndRemainder(a) {
                        var q = nbi(), r = nbi();
                        this.divRemTo(a, q, r);
                        return new Array(q, r);
                    }
                    function bnpDMultiply(n) {
                        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
                        ++this.t;
                        this.clamp();
                    }
                    function bnpDAddOffset(n, w) {
                        if (n == 0) {
                            return;
                        }
                        while(this.t <= w){
                            this[this.t++] = 0;
                        }
                        this[w] += n;
                        while(this[w] >= this.DV){
                            this[w] -= this.DV;
                            if ((++w) >= this.t) {
                                this[this.t++] = 0;
                            }
                            ++this[w];
                        }
                    }
                    function NullExp() {
                    }
                    function nNop(x) {
                        return x;
                    }
                    function nMulTo(x, y, r) {
                        x.multiplyTo(y, r);
                    }
                    function nSqrTo(x, r) {
                        x.squareTo(r);
                    }
                    NullExp.prototype.convert = nNop;
                    NullExp.prototype.revert = nNop;
                    NullExp.prototype.mulTo = nMulTo;
                    NullExp.prototype.sqrTo = nSqrTo;
                    function bnPow(e) {
                        return this.exp(e, new NullExp());
                    }
                    function bnpMultiplyLowerTo(a, n, r) {
                        var i = Math.min(this.t + a.t, n);
                        r.s = 0;
                        r.t = i;
                        while(i > 0){
                            r[--i] = 0;
                        }
                        var j;
                        for(j = r.t - this.t; i < j; ++i){
                            r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
                        }
                        for(j = Math.min(a.t, n); i < j; ++i){
                            this.am(0, a[i], r, i, 0, n - i);
                        }
                        r.clamp();
                    }
                    function bnpMultiplyUpperTo(a, n, r) {
                        --n;
                        var i = r.t = this.t + a.t - n;
                        r.s = 0;
                        while((--i) >= 0){
                            r[i] = 0;
                        }
                        for(i = Math.max(n - this.t, 0); i < a.t; ++i){
                            r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
                        }
                        r.clamp();
                        r.drShiftTo(1, r);
                    }
                    function Barrett(m) {
                        this.r2 = nbi();
                        this.q3 = nbi();
                        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
                        this.mu = this.r2.divide(m);
                        this.m = m;
                    }
                    function barrettConvert(x) {
                        if (x.s < 0 || x.t > 2 * this.m.t) {
                            return x.mod(this.m);
                        } else if (x.compareTo(this.m) < 0) {
                            return x;
                        } else {
                            var r = nbi();
                            x.copyTo(r);
                            this.reduce(r);
                            return r;
                        }
                    }
                    function barrettRevert(x) {
                        return x;
                    }
                    function barrettReduce(x) {
                        x.drShiftTo(this.m.t - 1, this.r2);
                        if (x.t > this.m.t + 1) {
                            x.t = this.m.t + 1;
                            x.clamp();
                        }
                        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
                        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
                        while(x.compareTo(this.r2) < 0){
                            x.dAddOffset(1, this.m.t + 1);
                        }
                        x.subTo(this.r2, x);
                        while(x.compareTo(this.m) >= 0){
                            x.subTo(this.m, x);
                        }
                    }
                    function barrettSqrTo(x, r) {
                        x.squareTo(r);
                        this.reduce(r);
                    }
                    function barrettMulTo(x, y, r) {
                        x.multiplyTo(y, r);
                        this.reduce(r);
                    }
                    Barrett.prototype.convert = barrettConvert;
                    Barrett.prototype.revert = barrettRevert;
                    Barrett.prototype.reduce = barrettReduce;
                    Barrett.prototype.mulTo = barrettMulTo;
                    Barrett.prototype.sqrTo = barrettSqrTo;
                    function bnModPow(e, m) {
                        var i = e.bitLength(), k, r = nbv(1), z;
                        if (i <= 0) {
                            return r;
                        } else if (i < 18) {
                            k = 1;
                        } else if (i < 48) {
                            k = 3;
                        } else if (i < 144) {
                            k = 4;
                        } else if (i < 768) {
                            k = 5;
                        } else {
                            k = 6;
                        }
                        if (i < 8) {
                            z = new Classic(m);
                        } else if (m.isEven()) {
                            z = new Barrett(m);
                        } else {
                            z = new Montgomery(m);
                        }
                        var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
                        g[1] = z.convert(this);
                        if (k > 1) {
                            var g2 = nbi();
                            z.sqrTo(g[1], g2);
                            while(n <= km){
                                g[n] = nbi();
                                z.mulTo(g2, g[n - 2], g[n]);
                                n += 2;
                            }
                        }
                        var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
                        i = nbits(e[j]) - 1;
                        while(j >= 0){
                            if (i >= k1) {
                                w = e[j] >> i - k1 & km;
                            } else {
                                w = (e[j] & (1 << i + 1) - 1) << k1 - i;
                                if (j > 0) {
                                    w |= e[j - 1] >> this.DB + i - k1;
                                }
                            }
                            n = k;
                            while((w & 1) == 0){
                                w >>= 1;
                                --n;
                            }
                            if ((i -= n) < 0) {
                                i += this.DB;
                                --j;
                            }
                            if (is1) {
                                g[w].copyTo(r);
                                is1 = false;
                            } else {
                                while(n > 1){
                                    z.sqrTo(r, r2);
                                    z.sqrTo(r2, r);
                                    n -= 2;
                                }
                                if (n > 0) {
                                    z.sqrTo(r, r2);
                                } else {
                                    t = r;
                                    r = r2;
                                    r2 = t;
                                }
                                z.mulTo(r2, g[w], r);
                            }
                            while(j >= 0 && (e[j] & 1 << i) == 0){
                                z.sqrTo(r, r2);
                                t = r;
                                r = r2;
                                r2 = t;
                                if ((--i) < 0) {
                                    i = this.DB - 1;
                                    --j;
                                }
                            }
                        }
                        return z.revert(r);
                    }
                    function bnGCD(a) {
                        var x = this.s < 0 ? this.negate() : this.clone();
                        var y = a.s < 0 ? a.negate() : a.clone();
                        if (x.compareTo(y) < 0) {
                            var t = x;
                            x = y;
                            y = t;
                        }
                        var i = x.getLowestSetBit(), g = y.getLowestSetBit();
                        if (g < 0) {
                            return x;
                        }
                        if (i < g) {
                            g = i;
                        }
                        if (g > 0) {
                            x.rShiftTo(g, x);
                            y.rShiftTo(g, y);
                        }
                        while(x.signum() > 0){
                            if ((i = x.getLowestSetBit()) > 0) {
                                x.rShiftTo(i, x);
                            }
                            if ((i = y.getLowestSetBit()) > 0) {
                                y.rShiftTo(i, y);
                            }
                            if (x.compareTo(y) >= 0) {
                                x.subTo(y, x);
                                x.rShiftTo(1, x);
                            } else {
                                y.subTo(x, y);
                                y.rShiftTo(1, y);
                            }
                        }
                        if (g > 0) {
                            y.lShiftTo(g, y);
                        }
                        return y;
                    }
                    function bnpModInt(n) {
                        if (n <= 0) {
                            return 0;
                        }
                        var d = this.DV % n, r = this.s < 0 ? n - 1 : 0;
                        if (this.t > 0) {
                            if (d == 0) {
                                r = this[0] % n;
                            } else {
                                for(var i = this.t - 1; i >= 0; --i){
                                    r = (d * r + this[i]) % n;
                                }
                            }
                        }
                        return r;
                    }
                    function bnModInverse(m) {
                        var ac = m.isEven();
                        if (this.isEven() && ac || m.signum() == 0) {
                            return BigInteger.ZERO;
                        }
                        var u = m.clone(), v = this.clone();
                        var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
                        while(u.signum() != 0){
                            while(u.isEven()){
                                u.rShiftTo(1, u);
                                if (ac) {
                                    if (!a.isEven() || !b.isEven()) {
                                        a.addTo(this, a);
                                        b.subTo(m, b);
                                    }
                                    a.rShiftTo(1, a);
                                } else if (!b.isEven()) {
                                    b.subTo(m, b);
                                }
                                b.rShiftTo(1, b);
                            }
                            while(v.isEven()){
                                v.rShiftTo(1, v);
                                if (ac) {
                                    if (!c.isEven() || !d.isEven()) {
                                        c.addTo(this, c);
                                        d.subTo(m, d);
                                    }
                                    c.rShiftTo(1, c);
                                } else if (!d.isEven()) {
                                    d.subTo(m, d);
                                }
                                d.rShiftTo(1, d);
                            }
                            if (u.compareTo(v) >= 0) {
                                u.subTo(v, u);
                                if (ac) {
                                    a.subTo(c, a);
                                }
                                b.subTo(d, b);
                            } else {
                                v.subTo(u, v);
                                if (ac) {
                                    c.subTo(a, c);
                                }
                                d.subTo(b, d);
                            }
                        }
                        if (v.compareTo(BigInteger.ONE) != 0) {
                            return BigInteger.ZERO;
                        }
                        if (d.compareTo(m) >= 0) {
                            return d.subtract(m);
                        }
                        if (d.signum() < 0) {
                            d.addTo(m, d);
                        } else {
                            return d;
                        }
                        if (d.signum() < 0) {
                            return d.add(m);
                        } else {
                            return d;
                        }
                    }
                    var lowprimes = [
                        2,
                        3,
                        5,
                        7,
                        11,
                        13,
                        17,
                        19,
                        23,
                        29,
                        31,
                        37,
                        41,
                        43,
                        47,
                        53,
                        59,
                        61,
                        67,
                        71,
                        73,
                        79,
                        83,
                        89,
                        97,
                        101,
                        103,
                        107,
                        109,
                        113,
                        127,
                        131,
                        137,
                        139,
                        149,
                        151,
                        157,
                        163,
                        167,
                        173,
                        179,
                        181,
                        191,
                        193,
                        197,
                        199,
                        211,
                        223,
                        227,
                        229,
                        233,
                        239,
                        241,
                        251,
                        257,
                        263,
                        269,
                        271,
                        277,
                        281,
                        283,
                        293,
                        307,
                        311,
                        313,
                        317,
                        331,
                        337,
                        347,
                        349,
                        353,
                        359,
                        367,
                        373,
                        379,
                        383,
                        389,
                        397,
                        401,
                        409,
                        419,
                        421,
                        431,
                        433,
                        439,
                        443,
                        449,
                        457,
                        461,
                        463,
                        467,
                        479,
                        487,
                        491,
                        499,
                        503,
                        509,
                        521,
                        523,
                        541,
                        547,
                        557,
                        563,
                        569,
                        571,
                        577,
                        587,
                        593,
                        599,
                        601,
                        607,
                        613,
                        617,
                        619,
                        631,
                        641,
                        643,
                        647,
                        653,
                        659,
                        661,
                        673,
                        677,
                        683,
                        691,
                        701,
                        709,
                        719,
                        727,
                        733,
                        739,
                        743,
                        751,
                        757,
                        761,
                        769,
                        773,
                        787,
                        797,
                        809,
                        811,
                        821,
                        823,
                        827,
                        829,
                        839,
                        853,
                        857,
                        859,
                        863,
                        877,
                        881,
                        883,
                        887,
                        907,
                        911,
                        919,
                        929,
                        937,
                        941,
                        947,
                        953,
                        967,
                        971,
                        977,
                        983,
                        991,
                        997, 
                    ];
                    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
                    function bnIsProbablePrime(t) {
                        var i, x = this.abs();
                        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
                            for(i = 0; i < lowprimes.length; ++i){
                                if (x[0] == lowprimes[i]) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        if (x.isEven()) {
                            return false;
                        }
                        i = 1;
                        while(i < lowprimes.length){
                            var m = lowprimes[i], j = i + 1;
                            while(j < lowprimes.length && m < lplim){
                                m *= lowprimes[j++];
                            }
                            m = x.modInt(m);
                            while(i < j){
                                if (m % lowprimes[i++] == 0) {
                                    return false;
                                }
                            }
                        }
                        return x.millerRabin(t);
                    }
                    function bnpMillerRabin(t) {
                        var n1 = this.subtract(BigInteger.ONE);
                        var k = n1.getLowestSetBit();
                        if (k <= 0) {
                            return false;
                        }
                        var r = n1.shiftRight(k);
                        t = t + 1 >> 1;
                        if (t > lowprimes.length) {
                            t = lowprimes.length;
                        }
                        var a = nbi();
                        for(var i = 0; i < t; ++i){
                            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
                            var y = a.modPow(r, this);
                            if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                                var j = 1;
                                while((j++) < k && y.compareTo(n1) != 0){
                                    y = y.modPowInt(2, this);
                                    if (y.compareTo(BigInteger.ONE) == 0) {
                                        return false;
                                    }
                                }
                                if (y.compareTo(n1) != 0) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    }
                    BigInteger.prototype.chunkSize = bnpChunkSize;
                    BigInteger.prototype.toRadix = bnpToRadix;
                    BigInteger.prototype.fromRadix = bnpFromRadix;
                    BigInteger.prototype.fromNumber = bnpFromNumber;
                    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
                    BigInteger.prototype.changeBit = bnpChangeBit;
                    BigInteger.prototype.addTo = bnpAddTo;
                    BigInteger.prototype.dMultiply = bnpDMultiply;
                    BigInteger.prototype.dAddOffset = bnpDAddOffset;
                    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
                    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
                    BigInteger.prototype.modInt = bnpModInt;
                    BigInteger.prototype.millerRabin = bnpMillerRabin;
                    BigInteger.prototype.clone = bnClone;
                    BigInteger.prototype.intValue = bnIntValue;
                    BigInteger.prototype.byteValue = bnByteValue;
                    BigInteger.prototype.shortValue = bnShortValue;
                    BigInteger.prototype.signum = bnSigNum;
                    BigInteger.prototype.toByteArray = bnToByteArray;
                    BigInteger.prototype.equals = bnEquals;
                    BigInteger.prototype.min = bnMin;
                    BigInteger.prototype.max = bnMax;
                    BigInteger.prototype.and = bnAnd;
                    BigInteger.prototype.or = bnOr;
                    BigInteger.prototype.xor = bnXor;
                    BigInteger.prototype.andNot = bnAndNot;
                    BigInteger.prototype.not = bnNot;
                    BigInteger.prototype.shiftLeft = bnShiftLeft;
                    BigInteger.prototype.shiftRight = bnShiftRight;
                    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
                    BigInteger.prototype.bitCount = bnBitCount;
                    BigInteger.prototype.testBit = bnTestBit;
                    BigInteger.prototype.setBit = bnSetBit;
                    BigInteger.prototype.clearBit = bnClearBit;
                    BigInteger.prototype.flipBit = bnFlipBit;
                    BigInteger.prototype.add = bnAdd;
                    BigInteger.prototype.subtract = bnSubtract;
                    BigInteger.prototype.multiply = bnMultiply;
                    BigInteger.prototype.divide = bnDivide;
                    BigInteger.prototype.remainder = bnRemainder;
                    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
                    BigInteger.prototype.modPow = bnModPow;
                    BigInteger.prototype.modInverse = bnModInverse;
                    BigInteger.prototype.pow = bnPow;
                    BigInteger.prototype.gcd = bnGCD;
                    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
                    BigInteger.prototype.square = bnSquare;
                    var Int128 = BigInteger;
                    Int128.prototype.IsNegative = function() {
                        if (this.compareTo(Int128.ZERO) == -1) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Int128.op_Equality = function(val1, val2) {
                        if (val1.compareTo(val2) == 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Int128.op_Inequality = function(val1, val2) {
                        if (val1.compareTo(val2) != 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Int128.op_GreaterThan = function(val1, val2) {
                        if (val1.compareTo(val2) > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Int128.op_LessThan = function(val1, val2) {
                        if (val1.compareTo(val2) < 0) {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    Int128.op_Addition = function(lhs, rhs) {
                        return new Int128(lhs, undefined, undefined).add(new Int128(rhs, undefined, undefined));
                    };
                    Int128.op_Subtraction = function(lhs, rhs) {
                        return new Int128(lhs, undefined, undefined).subtract(new Int128(rhs, undefined, undefined));
                    };
                    Int128.Int128Mul = function(lhs, rhs) {
                        return new Int128(lhs, undefined, undefined).multiply(new Int128(rhs, undefined, undefined));
                    };
                    Int128.op_Division = function(lhs, rhs) {
                        return lhs.divide(rhs);
                    };
                    Int128.prototype.ToDouble = function() {
                        return parseFloat(this.toString());
                    };
                    var Inherit = function(ce, ce2) {
                        var p;
                        if (typeof Object.getOwnPropertyNames === "undefined") {
                            for(p in ce2.prototype){
                                if (typeof ce.prototype[p] === "undefined" || ce.prototype[p] === Object.prototype[p]) {
                                    ce.prototype[p] = ce2.prototype[p];
                                }
                            }
                            for(p in ce2){
                                if (typeof ce[p] === "undefined") {
                                    ce[p] = ce2[p];
                                }
                            }
                            ce.$baseCtor = ce2;
                        } else {
                            var props = Object.getOwnPropertyNames(ce2.prototype);
                            for(var i = 0; i < props.length; i++){
                                if (typeof Object.getOwnPropertyDescriptor(ce.prototype, props[i]) === "undefined") {
                                    Object.defineProperty(ce.prototype, props[i], Object.getOwnPropertyDescriptor(ce2.prototype, props[i]));
                                }
                            }
                            for(p in ce2){
                                if (typeof ce[p] === "undefined") {
                                    ce[p] = ce2[p];
                                }
                            }
                            ce.$baseCtor = ce2;
                        }
                    };
                    ClipperLib.Path = function() {
                        return [];
                    };
                    ClipperLib.Path.prototype.push = Array.prototype.push;
                    ClipperLib.Paths = function() {
                        return [];
                    };
                    ClipperLib.Paths.prototype.push = Array.prototype.push;
                    ClipperLib.DoublePoint = function() {
                        var a = arguments;
                        this.X = 0;
                        this.Y = 0;
                        if (a.length === 1) {
                            this.X = a[0].X;
                            this.Y = a[0].Y;
                        } else if (a.length === 2) {
                            this.X = a[0];
                            this.Y = a[1];
                        }
                    };
                    ClipperLib.DoublePoint0 = function() {
                        this.X = 0;
                        this.Y = 0;
                    };
                    ClipperLib.DoublePoint0.prototype = ClipperLib.DoublePoint.prototype;
                    ClipperLib.DoublePoint1 = function(dp) {
                        this.X = dp.X;
                        this.Y = dp.Y;
                    };
                    ClipperLib.DoublePoint1.prototype = ClipperLib.DoublePoint.prototype;
                    ClipperLib.DoublePoint2 = function(x, y) {
                        this.X = x;
                        this.Y = y;
                    };
                    ClipperLib.DoublePoint2.prototype = ClipperLib.DoublePoint.prototype;
                    ClipperLib.PolyNode = function() {
                        this.m_Parent = null;
                        this.m_polygon = new ClipperLib.Path();
                        this.m_Index = 0;
                        this.m_jointype = 0;
                        this.m_endtype = 0;
                        this.m_Childs = [];
                        this.IsOpen = false;
                    };
                    ClipperLib.PolyNode.prototype.IsHoleNode = function() {
                        var result = true;
                        var node = this.m_Parent;
                        while(node !== null){
                            result = !result;
                            node = node.m_Parent;
                        }
                        return result;
                    };
                    ClipperLib.PolyNode.prototype.ChildCount = function() {
                        return this.m_Childs.length;
                    };
                    ClipperLib.PolyNode.prototype.Contour = function() {
                        return this.m_polygon;
                    };
                    ClipperLib.PolyNode.prototype.AddChild = function(Child) {
                        var cnt = this.m_Childs.length;
                        this.m_Childs.push(Child);
                        Child.m_Parent = this;
                        Child.m_Index = cnt;
                    };
                    ClipperLib.PolyNode.prototype.GetNext = function() {
                        if (this.m_Childs.length > 0) {
                            return this.m_Childs[0];
                        } else {
                            return this.GetNextSiblingUp();
                        }
                    };
                    ClipperLib.PolyNode.prototype.GetNextSiblingUp = function() {
                        if (this.m_Parent === null) {
                            return null;
                        } else if (this.m_Index === this.m_Parent.m_Childs.length - 1) {
                            return this.m_Parent.GetNextSiblingUp();
                        } else {
                            return this.m_Parent.m_Childs[this.m_Index + 1];
                        }
                    };
                    ClipperLib.PolyNode.prototype.Childs = function() {
                        return this.m_Childs;
                    };
                    ClipperLib.PolyNode.prototype.Parent = function() {
                        return this.m_Parent;
                    };
                    ClipperLib.PolyNode.prototype.IsHole = function() {
                        return this.IsHoleNode();
                    };
                    ClipperLib.PolyTree = function() {
                        this.m_AllPolys = [];
                        ClipperLib.PolyNode.call(this);
                    };
                    ClipperLib.PolyTree.prototype.Clear = function() {
                        for(var i = 0, ilen = this.m_AllPolys.length; i < ilen; i++){
                            this.m_AllPolys[i] = null;
                        }
                        this.m_AllPolys.length = 0;
                        this.m_Childs.length = 0;
                    };
                    ClipperLib.PolyTree.prototype.GetFirst = function() {
                        if (this.m_Childs.length > 0) {
                            return this.m_Childs[0];
                        } else {
                            return null;
                        }
                    };
                    ClipperLib.PolyTree.prototype.Total = function() {
                        var result = this.m_AllPolys.length;
                        if (result > 0 && this.m_Childs[0] !== this.m_AllPolys[0]) {
                            result--;
                        }
                        return result;
                    };
                    Inherit(ClipperLib.PolyTree, ClipperLib.PolyNode);
                    ClipperLib.Math_Abs_Int64 = ClipperLib.Math_Abs_Int32 = ClipperLib.Math_Abs_Double = function(a) {
                        return Math.abs(a);
                    };
                    ClipperLib.Math_Max_Int32_Int32 = function(a, b) {
                        return Math.max(a, b);
                    };
                    if (browser.msie || browser.opera || browser.safari) {
                        ClipperLib.Cast_Int32 = function(a) {
                            return a | 0;
                        };
                    } else {
                        ClipperLib.Cast_Int32 = function(a) {
                            return ~~a;
                        };
                    }
                    if (typeof Number.toInteger === "undefined") {
                        Number.toInteger = null;
                    }
                    if (browser.chrome) {
                        ClipperLib.Cast_Int64 = function(a) {
                            if (a < -2147483648 || a > 2147483647) {
                                return a < 0 ? Math.ceil(a) : Math.floor(a);
                            } else {
                                return ~~a;
                            }
                        };
                    } else if (browser.firefox && typeof Number.toInteger === "function") {
                        ClipperLib.Cast_Int64 = function(a) {
                            return Number.toInteger(a);
                        };
                    } else if (browser.msie7 || browser.msie8) {
                        ClipperLib.Cast_Int64 = function(a) {
                            return parseInt(a, 10);
                        };
                    } else if (browser.msie) {
                        ClipperLib.Cast_Int64 = function(a) {
                            if (a < -2147483648 || a > 2147483647) {
                                return a < 0 ? Math.ceil(a) : Math.floor(a);
                            }
                            return a | 0;
                        };
                    } else {
                        ClipperLib.Cast_Int64 = function(a) {
                            return a < 0 ? Math.ceil(a) : Math.floor(a);
                        };
                    }
                    ClipperLib.Clear = function(a) {
                        a.length = 0;
                    };
                    ClipperLib.PI = 3.141592653589793;
                    ClipperLib.PI2 = 2 * 3.141592653589793;
                    ClipperLib.IntPoint = function() {
                        var a = arguments, alen = a.length;
                        this.X = 0;
                        this.Y = 0;
                        if (ClipperLib.use_xyz) {
                            this.Z = 0;
                            if (alen === 3) {
                                this.X = a[0];
                                this.Y = a[1];
                                this.Z = a[2];
                            } else if (alen === 2) {
                                this.X = a[0];
                                this.Y = a[1];
                                this.Z = 0;
                            } else if (alen === 1) {
                                if (a[0] instanceof ClipperLib.DoublePoint) {
                                    var dp = a[0];
                                    this.X = ClipperLib.Clipper.Round(dp.X);
                                    this.Y = ClipperLib.Clipper.Round(dp.Y);
                                    this.Z = 0;
                                } else {
                                    var pt = a[0];
                                    if (typeof pt.Z === "undefined") {
                                        pt.Z = 0;
                                    }
                                    this.X = pt.X;
                                    this.Y = pt.Y;
                                    this.Z = pt.Z;
                                }
                            } else {
                                this.X = 0;
                                this.Y = 0;
                                this.Z = 0;
                            }
                        } else {
                            if (alen === 2) {
                                this.X = a[0];
                                this.Y = a[1];
                            } else if (alen === 1) {
                                if (a[0] instanceof ClipperLib.DoublePoint) {
                                    var dp = a[0];
                                    this.X = ClipperLib.Clipper.Round(dp.X);
                                    this.Y = ClipperLib.Clipper.Round(dp.Y);
                                } else {
                                    var pt = a[0];
                                    this.X = pt.X;
                                    this.Y = pt.Y;
                                }
                            } else {
                                this.X = 0;
                                this.Y = 0;
                            }
                        }
                    };
                    ClipperLib.IntPoint.op_Equality = function(a, b) {
                        return a.X === b.X && a.Y === b.Y;
                    };
                    ClipperLib.IntPoint.op_Inequality = function(a, b) {
                        return a.X !== b.X || a.Y !== b.Y;
                    };
                    ClipperLib.IntPoint0 = function() {
                        this.X = 0;
                        this.Y = 0;
                        if (ClipperLib.use_xyz) {
                            this.Z = 0;
                        }
                    };
                    ClipperLib.IntPoint0.prototype = ClipperLib.IntPoint.prototype;
                    ClipperLib.IntPoint1 = function(pt) {
                        this.X = pt.X;
                        this.Y = pt.Y;
                        if (ClipperLib.use_xyz) {
                            if (typeof pt.Z === "undefined") {
                                this.Z = 0;
                            } else {
                                this.Z = pt.Z;
                            }
                        }
                    };
                    ClipperLib.IntPoint1.prototype = ClipperLib.IntPoint.prototype;
                    ClipperLib.IntPoint1dp = function(dp) {
                        this.X = ClipperLib.Clipper.Round(dp.X);
                        this.Y = ClipperLib.Clipper.Round(dp.Y);
                        if (ClipperLib.use_xyz) {
                            this.Z = 0;
                        }
                    };
                    ClipperLib.IntPoint1dp.prototype = ClipperLib.IntPoint.prototype;
                    ClipperLib.IntPoint2 = function(x, y, z) {
                        this.X = x;
                        this.Y = y;
                        if (ClipperLib.use_xyz) {
                            if (typeof z === "undefined") {
                                this.Z = 0;
                            } else {
                                this.Z = z;
                            }
                        }
                    };
                    ClipperLib.IntPoint2.prototype = ClipperLib.IntPoint.prototype;
                    ClipperLib.IntRect = function() {
                        var a = arguments, alen = a.length;
                        if (alen === 4) {
                            this.left = a[0];
                            this.top = a[1];
                            this.right = a[2];
                            this.bottom = a[3];
                        } else if (alen === 1) {
                            var ir = a[0];
                            this.left = ir.left;
                            this.top = ir.top;
                            this.right = ir.right;
                            this.bottom = ir.bottom;
                        } else {
                            this.left = 0;
                            this.top = 0;
                            this.right = 0;
                            this.bottom = 0;
                        }
                    };
                    ClipperLib.IntRect0 = function() {
                        this.left = 0;
                        this.top = 0;
                        this.right = 0;
                        this.bottom = 0;
                    };
                    ClipperLib.IntRect0.prototype = ClipperLib.IntRect.prototype;
                    ClipperLib.IntRect1 = function(ir) {
                        this.left = ir.left;
                        this.top = ir.top;
                        this.right = ir.right;
                        this.bottom = ir.bottom;
                    };
                    ClipperLib.IntRect1.prototype = ClipperLib.IntRect.prototype;
                    ClipperLib.IntRect4 = function(l, t, r, b) {
                        this.left = l;
                        this.top = t;
                        this.right = r;
                        this.bottom = b;
                    };
                    ClipperLib.IntRect4.prototype = ClipperLib.IntRect.prototype;
                    ClipperLib.ClipType = {
                        ctIntersection: 0,
                        ctUnion: 1,
                        ctDifference: 2,
                        ctXor: 3
                    };
                    ClipperLib.PolyType = {
                        ptSubject: 0,
                        ptClip: 1
                    };
                    ClipperLib.PolyFillType = {
                        pftEvenOdd: 0,
                        pftNonZero: 1,
                        pftPositive: 2,
                        pftNegative: 3
                    };
                    ClipperLib.JoinType = {
                        jtSquare: 0,
                        jtRound: 1,
                        jtMiter: 2
                    };
                    ClipperLib.EndType = {
                        etOpenSquare: 0,
                        etOpenRound: 1,
                        etOpenButt: 2,
                        etClosedLine: 3,
                        etClosedPolygon: 4
                    };
                    ClipperLib.EdgeSide = {
                        esLeft: 0,
                        esRight: 1
                    };
                    ClipperLib.Direction = {
                        dRightToLeft: 0,
                        dLeftToRight: 1
                    };
                    ClipperLib.TEdge = function() {
                        this.Bot = new ClipperLib.IntPoint0();
                        this.Curr = new ClipperLib.IntPoint0();
                        this.Top = new ClipperLib.IntPoint0();
                        this.Delta = new ClipperLib.IntPoint0();
                        this.Dx = 0;
                        this.PolyTyp = ClipperLib.PolyType.ptSubject;
                        this.Side = ClipperLib.EdgeSide.esLeft;
                        this.WindDelta = 0;
                        this.WindCnt = 0;
                        this.WindCnt2 = 0;
                        this.OutIdx = 0;
                        this.Next = null;
                        this.Prev = null;
                        this.NextInLML = null;
                        this.NextInAEL = null;
                        this.PrevInAEL = null;
                        this.NextInSEL = null;
                        this.PrevInSEL = null;
                    };
                    ClipperLib.IntersectNode = function() {
                        this.Edge1 = null;
                        this.Edge2 = null;
                        this.Pt = new ClipperLib.IntPoint0();
                    };
                    ClipperLib.MyIntersectNodeSort = function() {
                    };
                    ClipperLib.MyIntersectNodeSort.Compare = function(node1, node2) {
                        var i = node2.Pt.Y - node1.Pt.Y;
                        if (i > 0) {
                            return 1;
                        } else if (i < 0) {
                            return -1;
                        } else {
                            return 0;
                        }
                    };
                    ClipperLib.LocalMinima = function() {
                        this.Y = 0;
                        this.LeftBound = null;
                        this.RightBound = null;
                        this.Next = null;
                    };
                    ClipperLib.Scanbeam = function() {
                        this.Y = 0;
                        this.Next = null;
                    };
                    ClipperLib.Maxima = function() {
                        this.X = 0;
                        this.Next = null;
                        this.Prev = null;
                    };
                    ClipperLib.OutRec = function() {
                        this.Idx = 0;
                        this.IsHole = false;
                        this.IsOpen = false;
                        this.FirstLeft = null;
                        this.Pts = null;
                        this.BottomPt = null;
                        this.PolyNode = null;
                    };
                    ClipperLib.OutPt = function() {
                        this.Idx = 0;
                        this.Pt = new ClipperLib.IntPoint0();
                        this.Next = null;
                        this.Prev = null;
                    };
                    ClipperLib.Join = function() {
                        this.OutPt1 = null;
                        this.OutPt2 = null;
                        this.OffPt = new ClipperLib.IntPoint0();
                    };
                    ClipperLib.ClipperBase = function() {
                        this.m_MinimaList = null;
                        this.m_CurrentLM = null;
                        this.m_edges = new Array();
                        this.m_UseFullRange = false;
                        this.m_HasOpenPaths = false;
                        this.PreserveCollinear = false;
                        this.m_Scanbeam = null;
                        this.m_PolyOuts = null;
                        this.m_ActiveEdges = null;
                    };
                    ClipperLib.ClipperBase.horizontal = -9007199254740992;
                    ClipperLib.ClipperBase.Skip = -2;
                    ClipperLib.ClipperBase.Unassigned = -1;
                    ClipperLib.ClipperBase.tolerance = 0.00000000000000000001;
                    ClipperLib.ClipperBase.loRange = 47453132;
                    ClipperLib.ClipperBase.hiRange = 4503599627370495;
                    ClipperLib.ClipperBase.near_zero = function(val) {
                        return val > -ClipperLib.ClipperBase.tolerance && val < ClipperLib.ClipperBase.tolerance;
                    };
                    ClipperLib.ClipperBase.IsHorizontal = function(e) {
                        return e.Delta.Y === 0;
                    };
                    ClipperLib.ClipperBase.prototype.PointIsVertex = function(pt, pp) {
                        var pp2 = pp;
                        do {
                            if (ClipperLib.IntPoint.op_Equality(pp2.Pt, pt)) {
                                return true;
                            }
                            pp2 = pp2.Next;
                        }while (pp2 !== pp)
                        return false;
                    };
                    ClipperLib.ClipperBase.prototype.PointOnLineSegment = function(pt, linePt1, linePt2, UseFullRange) {
                        if (UseFullRange) {
                            return pt.X === linePt1.X && pt.Y === linePt1.Y || pt.X === linePt2.X && pt.Y === linePt2.Y || pt.X > linePt1.X === pt.X < linePt2.X && pt.Y > linePt1.Y === pt.Y < linePt2.Y && Int128.op_Equality(Int128.Int128Mul(pt.X - linePt1.X, linePt2.Y - linePt1.Y), Int128.Int128Mul(linePt2.X - linePt1.X, pt.Y - linePt1.Y));
                        } else {
                            return pt.X === linePt1.X && pt.Y === linePt1.Y || pt.X === linePt2.X && pt.Y === linePt2.Y || pt.X > linePt1.X === pt.X < linePt2.X && pt.Y > linePt1.Y === pt.Y < linePt2.Y && (pt.X - linePt1.X) * (linePt2.Y - linePt1.Y) === (linePt2.X - linePt1.X) * (pt.Y - linePt1.Y);
                        }
                    };
                    ClipperLib.ClipperBase.prototype.PointOnPolygon = function(pt, pp, UseFullRange) {
                        var pp2 = pp;
                        while(true){
                            if (this.PointOnLineSegment(pt, pp2.Pt, pp2.Next.Pt, UseFullRange)) {
                                return true;
                            }
                            pp2 = pp2.Next;
                            if (pp2 === pp) {
                                break;
                            }
                        }
                        return false;
                    };
                    ClipperLib.ClipperBase.prototype.SlopesEqual = ClipperLib.ClipperBase.SlopesEqual = function() {
                        var a = arguments, alen = a.length;
                        var e1, e2, pt1, pt2, pt3, pt4, UseFullRange;
                        if (alen === 3) {
                            e1 = a[0];
                            e2 = a[1];
                            UseFullRange = a[2];
                            if (UseFullRange) {
                                return Int128.op_Equality(Int128.Int128Mul(e1.Delta.Y, e2.Delta.X), Int128.Int128Mul(e1.Delta.X, e2.Delta.Y));
                            } else {
                                return ClipperLib.Cast_Int64(e1.Delta.Y * e2.Delta.X) === ClipperLib.Cast_Int64(e1.Delta.X * e2.Delta.Y);
                            }
                        } else if (alen === 4) {
                            pt1 = a[0];
                            pt2 = a[1];
                            pt3 = a[2];
                            UseFullRange = a[3];
                            if (UseFullRange) {
                                return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt2.X - pt3.X), Int128.Int128Mul(pt1.X - pt2.X, pt2.Y - pt3.Y));
                            } else {
                                return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt2.X - pt3.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt2.Y - pt3.Y)) === 0;
                            }
                        } else {
                            pt1 = a[0];
                            pt2 = a[1];
                            pt3 = a[2];
                            pt4 = a[3];
                            UseFullRange = a[4];
                            if (UseFullRange) {
                                return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt3.X - pt4.X), Int128.Int128Mul(pt1.X - pt2.X, pt3.Y - pt4.Y));
                            } else {
                                return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt3.X - pt4.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt3.Y - pt4.Y)) === 0;
                            }
                        }
                    };
                    ClipperLib.ClipperBase.SlopesEqual3 = function(e1, e2, UseFullRange) {
                        if (UseFullRange) {
                            return Int128.op_Equality(Int128.Int128Mul(e1.Delta.Y, e2.Delta.X), Int128.Int128Mul(e1.Delta.X, e2.Delta.Y));
                        } else {
                            return ClipperLib.Cast_Int64(e1.Delta.Y * e2.Delta.X) === ClipperLib.Cast_Int64(e1.Delta.X * e2.Delta.Y);
                        }
                    };
                    ClipperLib.ClipperBase.SlopesEqual4 = function(pt1, pt2, pt3, UseFullRange) {
                        if (UseFullRange) {
                            return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt2.X - pt3.X), Int128.Int128Mul(pt1.X - pt2.X, pt2.Y - pt3.Y));
                        } else {
                            return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt2.X - pt3.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt2.Y - pt3.Y)) === 0;
                        }
                    };
                    ClipperLib.ClipperBase.SlopesEqual5 = function(pt1, pt2, pt3, pt4, UseFullRange) {
                        if (UseFullRange) {
                            return Int128.op_Equality(Int128.Int128Mul(pt1.Y - pt2.Y, pt3.X - pt4.X), Int128.Int128Mul(pt1.X - pt2.X, pt3.Y - pt4.Y));
                        } else {
                            return ClipperLib.Cast_Int64((pt1.Y - pt2.Y) * (pt3.X - pt4.X)) - ClipperLib.Cast_Int64((pt1.X - pt2.X) * (pt3.Y - pt4.Y)) === 0;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.Clear = function() {
                        this.DisposeLocalMinimaList();
                        for(var i = 0, ilen = this.m_edges.length; i < ilen; ++i){
                            for(var j = 0, jlen = this.m_edges[i].length; j < jlen; ++j){
                                this.m_edges[i][j] = null;
                            }
                            ClipperLib.Clear(this.m_edges[i]);
                        }
                        ClipperLib.Clear(this.m_edges);
                        this.m_UseFullRange = false;
                        this.m_HasOpenPaths = false;
                    };
                    ClipperLib.ClipperBase.prototype.DisposeLocalMinimaList = function() {
                        while(this.m_MinimaList !== null){
                            var tmpLm = this.m_MinimaList.Next;
                            this.m_MinimaList = null;
                            this.m_MinimaList = tmpLm;
                        }
                        this.m_CurrentLM = null;
                    };
                    ClipperLib.ClipperBase.prototype.RangeTest = function(Pt, useFullRange) {
                        if (useFullRange.Value) {
                            if (Pt.X > ClipperLib.ClipperBase.hiRange || Pt.Y > ClipperLib.ClipperBase.hiRange || -Pt.X > ClipperLib.ClipperBase.hiRange || -Pt.Y > ClipperLib.ClipperBase.hiRange) {
                                ClipperLib.Error("Coordinate outside allowed range in RangeTest().");
                            }
                        } else if (Pt.X > ClipperLib.ClipperBase.loRange || Pt.Y > ClipperLib.ClipperBase.loRange || -Pt.X > ClipperLib.ClipperBase.loRange || -Pt.Y > ClipperLib.ClipperBase.loRange) {
                            useFullRange.Value = true;
                            this.RangeTest(Pt, useFullRange);
                        }
                    };
                    ClipperLib.ClipperBase.prototype.InitEdge = function(e, eNext, ePrev, pt) {
                        e.Next = eNext;
                        e.Prev = ePrev;
                        e.Curr.X = pt.X;
                        e.Curr.Y = pt.Y;
                        if (ClipperLib.use_xyz) {
                            e.Curr.Z = pt.Z;
                        }
                        e.OutIdx = -1;
                    };
                    ClipperLib.ClipperBase.prototype.InitEdge2 = function(e, polyType) {
                        if (e.Curr.Y >= e.Next.Curr.Y) {
                            e.Bot.X = e.Curr.X;
                            e.Bot.Y = e.Curr.Y;
                            if (ClipperLib.use_xyz) {
                                e.Bot.Z = e.Curr.Z;
                            }
                            e.Top.X = e.Next.Curr.X;
                            e.Top.Y = e.Next.Curr.Y;
                            if (ClipperLib.use_xyz) {
                                e.Top.Z = e.Next.Curr.Z;
                            }
                        } else {
                            e.Top.X = e.Curr.X;
                            e.Top.Y = e.Curr.Y;
                            if (ClipperLib.use_xyz) {
                                e.Top.Z = e.Curr.Z;
                            }
                            e.Bot.X = e.Next.Curr.X;
                            e.Bot.Y = e.Next.Curr.Y;
                            if (ClipperLib.use_xyz) {
                                e.Bot.Z = e.Next.Curr.Z;
                            }
                        }
                        this.SetDx(e);
                        e.PolyTyp = polyType;
                    };
                    ClipperLib.ClipperBase.prototype.FindNextLocMin = function(E) {
                        var E2;
                        for(;;){
                            while(ClipperLib.IntPoint.op_Inequality(E.Bot, E.Prev.Bot) || ClipperLib.IntPoint.op_Equality(E.Curr, E.Top)){
                                E = E.Next;
                            }
                            if (E.Dx !== ClipperLib.ClipperBase.horizontal && E.Prev.Dx !== ClipperLib.ClipperBase.horizontal) {
                                break;
                            }
                            while(E.Prev.Dx === ClipperLib.ClipperBase.horizontal){
                                E = E.Prev;
                            }
                            E2 = E;
                            while(E.Dx === ClipperLib.ClipperBase.horizontal){
                                E = E.Next;
                            }
                            if (E.Top.Y === E.Prev.Bot.Y) {
                                continue;
                            }
                            if (E2.Prev.Bot.X < E.Bot.X) {
                                E = E2;
                            }
                            break;
                        }
                        return E;
                    };
                    ClipperLib.ClipperBase.prototype.ProcessBound = function(E, LeftBoundIsForward) {
                        var EStart;
                        var Result = E;
                        var Horz;
                        if (Result.OutIdx === ClipperLib.ClipperBase.Skip) {
                            E = Result;
                            if (LeftBoundIsForward) {
                                while(E.Top.Y === E.Next.Bot.Y){
                                    E = E.Next;
                                }
                                while(E !== Result && E.Dx === ClipperLib.ClipperBase.horizontal){
                                    E = E.Prev;
                                }
                            } else {
                                while(E.Top.Y === E.Prev.Bot.Y){
                                    E = E.Prev;
                                }
                                while(E !== Result && E.Dx === ClipperLib.ClipperBase.horizontal){
                                    E = E.Next;
                                }
                            }
                            if (E === Result) {
                                if (LeftBoundIsForward) {
                                    Result = E.Next;
                                } else {
                                    Result = E.Prev;
                                }
                            } else {
                                if (LeftBoundIsForward) {
                                    E = Result.Next;
                                } else {
                                    E = Result.Prev;
                                }
                                var locMin = new ClipperLib.LocalMinima();
                                locMin.Next = null;
                                locMin.Y = E.Bot.Y;
                                locMin.LeftBound = null;
                                locMin.RightBound = E;
                                E.WindDelta = 0;
                                Result = this.ProcessBound(E, LeftBoundIsForward);
                                this.InsertLocalMinima(locMin);
                            }
                            return Result;
                        }
                        if (E.Dx === ClipperLib.ClipperBase.horizontal) {
                            if (LeftBoundIsForward) {
                                EStart = E.Prev;
                            } else {
                                EStart = E.Next;
                            }
                            if (EStart.Dx === ClipperLib.ClipperBase.horizontal) {
                                if (EStart.Bot.X !== E.Bot.X && EStart.Top.X !== E.Bot.X) {
                                    this.ReverseHorizontal(E);
                                }
                            } else if (EStart.Bot.X !== E.Bot.X) {
                                this.ReverseHorizontal(E);
                            }
                        }
                        EStart = E;
                        if (LeftBoundIsForward) {
                            while(Result.Top.Y === Result.Next.Bot.Y && Result.Next.OutIdx !== ClipperLib.ClipperBase.Skip){
                                Result = Result.Next;
                            }
                            if (Result.Dx === ClipperLib.ClipperBase.horizontal && Result.Next.OutIdx !== ClipperLib.ClipperBase.Skip) {
                                Horz = Result;
                                while(Horz.Prev.Dx === ClipperLib.ClipperBase.horizontal){
                                    Horz = Horz.Prev;
                                }
                                if (Horz.Prev.Top.X > Result.Next.Top.X) {
                                    Result = Horz.Prev;
                                }
                            }
                            while(E !== Result){
                                E.NextInLML = E.Next;
                                if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X) {
                                    this.ReverseHorizontal(E);
                                }
                                E = E.Next;
                            }
                            if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Prev.Top.X) {
                                this.ReverseHorizontal(E);
                            }
                            Result = Result.Next;
                        } else {
                            while(Result.Top.Y === Result.Prev.Bot.Y && Result.Prev.OutIdx !== ClipperLib.ClipperBase.Skip){
                                Result = Result.Prev;
                            }
                            if (Result.Dx === ClipperLib.ClipperBase.horizontal && Result.Prev.OutIdx !== ClipperLib.ClipperBase.Skip) {
                                Horz = Result;
                                while(Horz.Next.Dx === ClipperLib.ClipperBase.horizontal){
                                    Horz = Horz.Next;
                                }
                                if (Horz.Next.Top.X === Result.Prev.Top.X || Horz.Next.Top.X > Result.Prev.Top.X) {
                                    Result = Horz.Next;
                                }
                            }
                            while(E !== Result){
                                E.NextInLML = E.Prev;
                                if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X) {
                                    this.ReverseHorizontal(E);
                                }
                                E = E.Prev;
                            }
                            if (E.Dx === ClipperLib.ClipperBase.horizontal && E !== EStart && E.Bot.X !== E.Next.Top.X) {
                                this.ReverseHorizontal(E);
                            }
                            Result = Result.Prev;
                        }
                        return Result;
                    };
                    ClipperLib.ClipperBase.prototype.AddPath = function(pg, polyType, Closed) {
                        if (ClipperLib.use_lines) {
                            if (!Closed && polyType === ClipperLib.PolyType.ptClip) {
                                ClipperLib.Error("AddPath: Open paths must be subject.");
                            }
                        } else {
                            if (!Closed) {
                                ClipperLib.Error("AddPath: Open paths have been disabled.");
                            }
                        }
                        var highI = pg.length - 1;
                        if (Closed) {
                            while(highI > 0 && ClipperLib.IntPoint.op_Equality(pg[highI], pg[0])){
                                --highI;
                            }
                        }
                        while(highI > 0 && ClipperLib.IntPoint.op_Equality(pg[highI], pg[highI - 1])){
                            --highI;
                        }
                        if (Closed && highI < 2 || !Closed && highI < 1) {
                            return false;
                        }
                        var edges = new Array();
                        for(var i = 0; i <= highI; i++){
                            edges.push(new ClipperLib.TEdge());
                        }
                        var IsFlat = true;
                        edges[1].Curr.X = pg[1].X;
                        edges[1].Curr.Y = pg[1].Y;
                        if (ClipperLib.use_xyz) {
                            edges[1].Curr.Z = pg[1].Z;
                        }
                        var $1 = {
                            Value: this.m_UseFullRange
                        };
                        this.RangeTest(pg[0], $1);
                        this.m_UseFullRange = $1.Value;
                        $1.Value = this.m_UseFullRange;
                        this.RangeTest(pg[highI], $1);
                        this.m_UseFullRange = $1.Value;
                        this.InitEdge(edges[0], edges[1], edges[highI], pg[0]);
                        this.InitEdge(edges[highI], edges[0], edges[highI - 1], pg[highI]);
                        for(var i = highI - 1; i >= 1; --i){
                            $1.Value = this.m_UseFullRange;
                            this.RangeTest(pg[i], $1);
                            this.m_UseFullRange = $1.Value;
                            this.InitEdge(edges[i], edges[i + 1], edges[i - 1], pg[i]);
                        }
                        var eStart = edges[0];
                        var E = eStart, eLoopStop = eStart;
                        for(;;){
                            if (E.Curr === E.Next.Curr && (Closed || E.Next !== eStart)) {
                                if (E === E.Next) {
                                    break;
                                }
                                if (E === eStart) {
                                    eStart = E.Next;
                                }
                                E = this.RemoveEdge(E);
                                eLoopStop = E;
                                continue;
                            }
                            if (E.Prev === E.Next) {
                                break;
                            } else if (Closed && ClipperLib.ClipperBase.SlopesEqual4(E.Prev.Curr, E.Curr, E.Next.Curr, this.m_UseFullRange) && (!this.PreserveCollinear || !this.Pt2IsBetweenPt1AndPt3(E.Prev.Curr, E.Curr, E.Next.Curr))) {
                                if (E === eStart) {
                                    eStart = E.Next;
                                }
                                E = this.RemoveEdge(E);
                                E = E.Prev;
                                eLoopStop = E;
                                continue;
                            }
                            E = E.Next;
                            if (E === eLoopStop || !Closed && E.Next === eStart) {
                                break;
                            }
                        }
                        if (!Closed && E === E.Next || Closed && E.Prev === E.Next) {
                            return false;
                        }
                        if (!Closed) {
                            this.m_HasOpenPaths = true;
                            eStart.Prev.OutIdx = ClipperLib.ClipperBase.Skip;
                        }
                        E = eStart;
                        do {
                            this.InitEdge2(E, polyType);
                            E = E.Next;
                            if (IsFlat && E.Curr.Y !== eStart.Curr.Y) {
                                IsFlat = false;
                            }
                        }while (E !== eStart)
                        if (IsFlat) {
                            if (Closed) {
                                return false;
                            }
                            E.Prev.OutIdx = ClipperLib.ClipperBase.Skip;
                            var locMin = new ClipperLib.LocalMinima();
                            locMin.Next = null;
                            locMin.Y = E.Bot.Y;
                            locMin.LeftBound = null;
                            locMin.RightBound = E;
                            locMin.RightBound.Side = ClipperLib.EdgeSide.esRight;
                            locMin.RightBound.WindDelta = 0;
                            for(;;){
                                if (E.Bot.X !== E.Prev.Top.X) {
                                    this.ReverseHorizontal(E);
                                }
                                if (E.Next.OutIdx === ClipperLib.ClipperBase.Skip) {
                                    break;
                                }
                                E.NextInLML = E.Next;
                                E = E.Next;
                            }
                            this.InsertLocalMinima(locMin);
                            this.m_edges.push(edges);
                            return true;
                        }
                        this.m_edges.push(edges);
                        var leftBoundIsForward;
                        var EMin = null;
                        if (ClipperLib.IntPoint.op_Equality(E.Prev.Bot, E.Prev.Top)) {
                            E = E.Next;
                        }
                        for(;;){
                            E = this.FindNextLocMin(E);
                            if (E === EMin) {
                                break;
                            } else if (EMin === null) {
                                EMin = E;
                            }
                            var locMin = new ClipperLib.LocalMinima();
                            locMin.Next = null;
                            locMin.Y = E.Bot.Y;
                            if (E.Dx < E.Prev.Dx) {
                                locMin.LeftBound = E.Prev;
                                locMin.RightBound = E;
                                leftBoundIsForward = false;
                            } else {
                                locMin.LeftBound = E;
                                locMin.RightBound = E.Prev;
                                leftBoundIsForward = true;
                            }
                            locMin.LeftBound.Side = ClipperLib.EdgeSide.esLeft;
                            locMin.RightBound.Side = ClipperLib.EdgeSide.esRight;
                            if (!Closed) {
                                locMin.LeftBound.WindDelta = 0;
                            } else if (locMin.LeftBound.Next === locMin.RightBound) {
                                locMin.LeftBound.WindDelta = -1;
                            } else {
                                locMin.LeftBound.WindDelta = 1;
                            }
                            locMin.RightBound.WindDelta = -locMin.LeftBound.WindDelta;
                            E = this.ProcessBound(locMin.LeftBound, leftBoundIsForward);
                            if (E.OutIdx === ClipperLib.ClipperBase.Skip) {
                                E = this.ProcessBound(E, leftBoundIsForward);
                            }
                            var E2 = this.ProcessBound(locMin.RightBound, !leftBoundIsForward);
                            if (E2.OutIdx === ClipperLib.ClipperBase.Skip) {
                                E2 = this.ProcessBound(E2, !leftBoundIsForward);
                            }
                            if (locMin.LeftBound.OutIdx === ClipperLib.ClipperBase.Skip) {
                                locMin.LeftBound = null;
                            } else if (locMin.RightBound.OutIdx === ClipperLib.ClipperBase.Skip) {
                                locMin.RightBound = null;
                            }
                            this.InsertLocalMinima(locMin);
                            if (!leftBoundIsForward) {
                                E = E2;
                            }
                        }
                        return true;
                    };
                    ClipperLib.ClipperBase.prototype.AddPaths = function(ppg, polyType, closed) {
                        var result = false;
                        for(var i = 0, ilen = ppg.length; i < ilen; ++i){
                            if (this.AddPath(ppg[i], polyType, closed)) {
                                result = true;
                            }
                        }
                        return result;
                    };
                    ClipperLib.ClipperBase.prototype.Pt2IsBetweenPt1AndPt3 = function(pt1, pt2, pt3) {
                        if (ClipperLib.IntPoint.op_Equality(pt1, pt3) || ClipperLib.IntPoint.op_Equality(pt1, pt2) || ClipperLib.IntPoint.op_Equality(pt3, pt2)) {
                            return false;
                        } else if (pt1.X !== pt3.X) {
                            return pt2.X > pt1.X === pt2.X < pt3.X;
                        } else {
                            return pt2.Y > pt1.Y === pt2.Y < pt3.Y;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.RemoveEdge = function(e) {
                        e.Prev.Next = e.Next;
                        e.Next.Prev = e.Prev;
                        var result = e.Next;
                        e.Prev = null;
                        return result;
                    };
                    ClipperLib.ClipperBase.prototype.SetDx = function(e) {
                        e.Delta.X = e.Top.X - e.Bot.X;
                        e.Delta.Y = e.Top.Y - e.Bot.Y;
                        if (e.Delta.Y === 0) {
                            e.Dx = ClipperLib.ClipperBase.horizontal;
                        } else {
                            e.Dx = e.Delta.X / e.Delta.Y;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.InsertLocalMinima = function(newLm) {
                        if (this.m_MinimaList === null) {
                            this.m_MinimaList = newLm;
                        } else if (newLm.Y >= this.m_MinimaList.Y) {
                            newLm.Next = this.m_MinimaList;
                            this.m_MinimaList = newLm;
                        } else {
                            var tmpLm = this.m_MinimaList;
                            while(tmpLm.Next !== null && newLm.Y < tmpLm.Next.Y){
                                tmpLm = tmpLm.Next;
                            }
                            newLm.Next = tmpLm.Next;
                            tmpLm.Next = newLm;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.PopLocalMinima = function(Y, current) {
                        current.v = this.m_CurrentLM;
                        if (this.m_CurrentLM !== null && this.m_CurrentLM.Y === Y) {
                            this.m_CurrentLM = this.m_CurrentLM.Next;
                            return true;
                        }
                        return false;
                    };
                    ClipperLib.ClipperBase.prototype.ReverseHorizontal = function(e) {
                        var tmp = e.Top.X;
                        e.Top.X = e.Bot.X;
                        e.Bot.X = tmp;
                        if (ClipperLib.use_xyz) {
                            tmp = e.Top.Z;
                            e.Top.Z = e.Bot.Z;
                            e.Bot.Z = tmp;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.Reset = function() {
                        this.m_CurrentLM = this.m_MinimaList;
                        if (this.m_CurrentLM === null) {
                            return;
                        }
                        this.m_Scanbeam = null;
                        var lm = this.m_MinimaList;
                        while(lm !== null){
                            this.InsertScanbeam(lm.Y);
                            var e = lm.LeftBound;
                            if (e !== null) {
                                e.Curr.X = e.Bot.X;
                                e.Curr.Y = e.Bot.Y;
                                if (ClipperLib.use_xyz) {
                                    e.Curr.Z = e.Bot.Z;
                                }
                                e.OutIdx = ClipperLib.ClipperBase.Unassigned;
                            }
                            e = lm.RightBound;
                            if (e !== null) {
                                e.Curr.X = e.Bot.X;
                                e.Curr.Y = e.Bot.Y;
                                if (ClipperLib.use_xyz) {
                                    e.Curr.Z = e.Bot.Z;
                                }
                                e.OutIdx = ClipperLib.ClipperBase.Unassigned;
                            }
                            lm = lm.Next;
                        }
                        this.m_ActiveEdges = null;
                    };
                    ClipperLib.ClipperBase.prototype.InsertScanbeam = function(Y) {
                        if (this.m_Scanbeam === null) {
                            this.m_Scanbeam = new ClipperLib.Scanbeam();
                            this.m_Scanbeam.Next = null;
                            this.m_Scanbeam.Y = Y;
                        } else if (Y > this.m_Scanbeam.Y) {
                            var newSb = new ClipperLib.Scanbeam();
                            newSb.Y = Y;
                            newSb.Next = this.m_Scanbeam;
                            this.m_Scanbeam = newSb;
                        } else {
                            var sb2 = this.m_Scanbeam;
                            while(sb2.Next !== null && Y <= sb2.Next.Y){
                                sb2 = sb2.Next;
                            }
                            if (Y === sb2.Y) {
                                return;
                            }
                            var newSb1 = new ClipperLib.Scanbeam();
                            newSb1.Y = Y;
                            newSb1.Next = sb2.Next;
                            sb2.Next = newSb1;
                        }
                    };
                    ClipperLib.ClipperBase.prototype.PopScanbeam = function(Y) {
                        if (this.m_Scanbeam === null) {
                            Y.v = 0;
                            return false;
                        }
                        Y.v = this.m_Scanbeam.Y;
                        this.m_Scanbeam = this.m_Scanbeam.Next;
                        return true;
                    };
                    ClipperLib.ClipperBase.prototype.LocalMinimaPending = function() {
                        return this.m_CurrentLM !== null;
                    };
                    ClipperLib.ClipperBase.prototype.CreateOutRec = function() {
                        var result = new ClipperLib.OutRec();
                        result.Idx = ClipperLib.ClipperBase.Unassigned;
                        result.IsHole = false;
                        result.IsOpen = false;
                        result.FirstLeft = null;
                        result.Pts = null;
                        result.BottomPt = null;
                        result.PolyNode = null;
                        this.m_PolyOuts.push(result);
                        result.Idx = this.m_PolyOuts.length - 1;
                        return result;
                    };
                    ClipperLib.ClipperBase.prototype.DisposeOutRec = function(index) {
                        var outRec = this.m_PolyOuts[index];
                        outRec.Pts = null;
                        outRec = null;
                        this.m_PolyOuts[index] = null;
                    };
                    ClipperLib.ClipperBase.prototype.UpdateEdgeIntoAEL = function(e) {
                        if (e.NextInLML === null) {
                            ClipperLib.Error("UpdateEdgeIntoAEL: invalid call");
                        }
                        var AelPrev = e.PrevInAEL;
                        var AelNext = e.NextInAEL;
                        e.NextInLML.OutIdx = e.OutIdx;
                        if (AelPrev !== null) {
                            AelPrev.NextInAEL = e.NextInLML;
                        } else {
                            this.m_ActiveEdges = e.NextInLML;
                        }
                        if (AelNext !== null) {
                            AelNext.PrevInAEL = e.NextInLML;
                        }
                        e.NextInLML.Side = e.Side;
                        e.NextInLML.WindDelta = e.WindDelta;
                        e.NextInLML.WindCnt = e.WindCnt;
                        e.NextInLML.WindCnt2 = e.WindCnt2;
                        e = e.NextInLML;
                        e.Curr.X = e.Bot.X;
                        e.Curr.Y = e.Bot.Y;
                        e.PrevInAEL = AelPrev;
                        e.NextInAEL = AelNext;
                        if (!ClipperLib.ClipperBase.IsHorizontal(e)) {
                            this.InsertScanbeam(e.Top.Y);
                        }
                        return e;
                    };
                    ClipperLib.ClipperBase.prototype.SwapPositionsInAEL = function(edge1, edge2) {
                        if (edge1.NextInAEL === edge1.PrevInAEL || edge2.NextInAEL === edge2.PrevInAEL) {
                            return;
                        }
                        if (edge1.NextInAEL === edge2) {
                            var next = edge2.NextInAEL;
                            if (next !== null) {
                                next.PrevInAEL = edge1;
                            }
                            var prev = edge1.PrevInAEL;
                            if (prev !== null) {
                                prev.NextInAEL = edge2;
                            }
                            edge2.PrevInAEL = prev;
                            edge2.NextInAEL = edge1;
                            edge1.PrevInAEL = edge2;
                            edge1.NextInAEL = next;
                        } else if (edge2.NextInAEL === edge1) {
                            var next1 = edge1.NextInAEL;
                            if (next1 !== null) {
                                next1.PrevInAEL = edge2;
                            }
                            var prev1 = edge2.PrevInAEL;
                            if (prev1 !== null) {
                                prev1.NextInAEL = edge1;
                            }
                            edge1.PrevInAEL = prev1;
                            edge1.NextInAEL = edge2;
                            edge2.PrevInAEL = edge1;
                            edge2.NextInAEL = next1;
                        } else {
                            var next2 = edge1.NextInAEL;
                            var prev2 = edge1.PrevInAEL;
                            edge1.NextInAEL = edge2.NextInAEL;
                            if (edge1.NextInAEL !== null) {
                                edge1.NextInAEL.PrevInAEL = edge1;
                            }
                            edge1.PrevInAEL = edge2.PrevInAEL;
                            if (edge1.PrevInAEL !== null) {
                                edge1.PrevInAEL.NextInAEL = edge1;
                            }
                            edge2.NextInAEL = next2;
                            if (edge2.NextInAEL !== null) {
                                edge2.NextInAEL.PrevInAEL = edge2;
                            }
                            edge2.PrevInAEL = prev2;
                            if (edge2.PrevInAEL !== null) {
                                edge2.PrevInAEL.NextInAEL = edge2;
                            }
                        }
                        if (edge1.PrevInAEL === null) {
                            this.m_ActiveEdges = edge1;
                        } else {
                            if (edge2.PrevInAEL === null) {
                                this.m_ActiveEdges = edge2;
                            }
                        }
                    };
                    ClipperLib.ClipperBase.prototype.DeleteFromAEL = function(e) {
                        var AelPrev = e.PrevInAEL;
                        var AelNext = e.NextInAEL;
                        if (AelPrev === null && AelNext === null && e !== this.m_ActiveEdges) {
                            return;
                        }
                        if (AelPrev !== null) {
                            AelPrev.NextInAEL = AelNext;
                        } else {
                            this.m_ActiveEdges = AelNext;
                        }
                        if (AelNext !== null) {
                            AelNext.PrevInAEL = AelPrev;
                        }
                        e.NextInAEL = null;
                        e.PrevInAEL = null;
                    };
                    ClipperLib.Clipper = function(InitOptions) {
                        if (typeof InitOptions === "undefined") {
                            InitOptions = 0;
                        }
                        this.m_PolyOuts = null;
                        this.m_ClipType = ClipperLib.ClipType.ctIntersection;
                        this.m_Scanbeam = null;
                        this.m_Maxima = null;
                        this.m_ActiveEdges = null;
                        this.m_SortedEdges = null;
                        this.m_IntersectList = null;
                        this.m_IntersectNodeComparer = null;
                        this.m_ExecuteLocked = false;
                        this.m_ClipFillType = ClipperLib.PolyFillType.pftEvenOdd;
                        this.m_SubjFillType = ClipperLib.PolyFillType.pftEvenOdd;
                        this.m_Joins = null;
                        this.m_GhostJoins = null;
                        this.m_UsingPolyTree = false;
                        this.ReverseSolution = false;
                        this.StrictlySimple = false;
                        ClipperLib.ClipperBase.call(this);
                        this.m_Scanbeam = null;
                        this.m_Maxima = null;
                        this.m_ActiveEdges = null;
                        this.m_SortedEdges = null;
                        this.m_IntersectList = new Array();
                        this.m_IntersectNodeComparer = ClipperLib.MyIntersectNodeSort.Compare;
                        this.m_ExecuteLocked = false;
                        this.m_UsingPolyTree = false;
                        this.m_PolyOuts = new Array();
                        this.m_Joins = new Array();
                        this.m_GhostJoins = new Array();
                        this.ReverseSolution = (1 & InitOptions) !== 0;
                        this.StrictlySimple = (2 & InitOptions) !== 0;
                        this.PreserveCollinear = (4 & InitOptions) !== 0;
                        if (ClipperLib.use_xyz) {
                            this.ZFillFunction = null;
                        }
                    };
                    ClipperLib.Clipper.ioReverseSolution = 1;
                    ClipperLib.Clipper.ioStrictlySimple = 2;
                    ClipperLib.Clipper.ioPreserveCollinear = 4;
                    ClipperLib.Clipper.prototype.Clear = function() {
                        if (this.m_edges.length === 0) {
                            return;
                        }
                        this.DisposeAllPolyPts();
                        ClipperLib.ClipperBase.prototype.Clear.call(this);
                    };
                    ClipperLib.Clipper.prototype.InsertMaxima = function(X) {
                        var newMax = new ClipperLib.Maxima();
                        newMax.X = X;
                        if (this.m_Maxima === null) {
                            this.m_Maxima = newMax;
                            this.m_Maxima.Next = null;
                            this.m_Maxima.Prev = null;
                        } else if (X < this.m_Maxima.X) {
                            newMax.Next = this.m_Maxima;
                            newMax.Prev = null;
                            this.m_Maxima = newMax;
                        } else {
                            var m = this.m_Maxima;
                            while(m.Next !== null && X >= m.Next.X){
                                m = m.Next;
                            }
                            if (X === m.X) {
                                return;
                            }
                            newMax.Next = m.Next;
                            newMax.Prev = m;
                            if (m.Next !== null) {
                                m.Next.Prev = newMax;
                            }
                            m.Next = newMax;
                        }
                    };
                    ClipperLib.Clipper.prototype.Execute = function() {
                        var a = arguments, alen = a.length, ispolytree = a[1] instanceof ClipperLib.PolyTree;
                        if (alen === 4 && !ispolytree) {
                            var clipType = a[0], solution = a[1], subjFillType = a[2], clipFillType = a[3];
                            if (this.m_ExecuteLocked) {
                                return false;
                            }
                            if (this.m_HasOpenPaths) {
                                ClipperLib.Error("Error: PolyTree struct is needed for open path clipping.");
                            }
                            this.m_ExecuteLocked = true;
                            ClipperLib.Clear(solution);
                            this.m_SubjFillType = subjFillType;
                            this.m_ClipFillType = clipFillType;
                            this.m_ClipType = clipType;
                            this.m_UsingPolyTree = false;
                            try {
                                var succeeded = this.ExecuteInternal();
                                if (succeeded) {
                                    this.BuildResult(solution);
                                }
                            } finally{
                                this.DisposeAllPolyPts();
                                this.m_ExecuteLocked = false;
                            }
                            return succeeded;
                        } else if (alen === 4 && ispolytree) {
                            var clipType = a[0], polytree = a[1], subjFillType = a[2], clipFillType = a[3];
                            if (this.m_ExecuteLocked) {
                                return false;
                            }
                            this.m_ExecuteLocked = true;
                            this.m_SubjFillType = subjFillType;
                            this.m_ClipFillType = clipFillType;
                            this.m_ClipType = clipType;
                            this.m_UsingPolyTree = true;
                            try {
                                var succeeded = this.ExecuteInternal();
                                if (succeeded) {
                                    this.BuildResult2(polytree);
                                }
                            } finally{
                                this.DisposeAllPolyPts();
                                this.m_ExecuteLocked = false;
                            }
                            return succeeded;
                        } else if (alen === 2 && !ispolytree) {
                            var clipType = a[0], solution = a[1];
                            return this.Execute(clipType, solution, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
                        } else if (alen === 2 && ispolytree) {
                            var clipType = a[0], polytree = a[1];
                            return this.Execute(clipType, polytree, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
                        }
                    };
                    ClipperLib.Clipper.prototype.FixHoleLinkage = function(outRec) {
                        if (outRec.FirstLeft === null || outRec.IsHole !== outRec.FirstLeft.IsHole && outRec.FirstLeft.Pts !== null) {
                            return;
                        }
                        var orfl = outRec.FirstLeft;
                        while(orfl !== null && (orfl.IsHole === outRec.IsHole || orfl.Pts === null)){
                            orfl = orfl.FirstLeft;
                        }
                        outRec.FirstLeft = orfl;
                    };
                    ClipperLib.Clipper.prototype.ExecuteInternal = function() {
                        try {
                            this.Reset();
                            this.m_SortedEdges = null;
                            this.m_Maxima = null;
                            var botY = {
                            }, topY = {
                            };
                            if (!this.PopScanbeam(botY)) {
                                return false;
                            }
                            this.InsertLocalMinimaIntoAEL(botY.v);
                            while(this.PopScanbeam(topY) || this.LocalMinimaPending()){
                                this.ProcessHorizontals();
                                this.m_GhostJoins.length = 0;
                                if (!this.ProcessIntersections(topY.v)) {
                                    return false;
                                }
                                this.ProcessEdgesAtTopOfScanbeam(topY.v);
                                botY.v = topY.v;
                                this.InsertLocalMinimaIntoAEL(botY.v);
                            }
                            var outRec, i, ilen;
                            for(i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                                outRec = this.m_PolyOuts[i];
                                if (outRec.Pts === null || outRec.IsOpen) {
                                    continue;
                                }
                                if ((outRec.IsHole ^ this.ReverseSolution) == this.Area$1(outRec) > 0) {
                                    this.ReversePolyPtLinks(outRec.Pts);
                                }
                            }
                            this.JoinCommonEdges();
                            for(i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                                outRec = this.m_PolyOuts[i];
                                if (outRec.Pts === null) {
                                    continue;
                                } else if (outRec.IsOpen) {
                                    this.FixupOutPolyline(outRec);
                                } else {
                                    this.FixupOutPolygon(outRec);
                                }
                            }
                            if (this.StrictlySimple) {
                                this.DoSimplePolygons();
                            }
                            return true;
                        } finally{
                            this.m_Joins.length = 0;
                            this.m_GhostJoins.length = 0;
                        }
                    };
                    ClipperLib.Clipper.prototype.DisposeAllPolyPts = function() {
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; ++i){
                            this.DisposeOutRec(i);
                        }
                        ClipperLib.Clear(this.m_PolyOuts);
                    };
                    ClipperLib.Clipper.prototype.AddJoin = function(Op1, Op2, OffPt) {
                        var j = new ClipperLib.Join();
                        j.OutPt1 = Op1;
                        j.OutPt2 = Op2;
                        j.OffPt.X = OffPt.X;
                        j.OffPt.Y = OffPt.Y;
                        if (ClipperLib.use_xyz) {
                            j.OffPt.Z = OffPt.Z;
                        }
                        this.m_Joins.push(j);
                    };
                    ClipperLib.Clipper.prototype.AddGhostJoin = function(Op, OffPt) {
                        var j = new ClipperLib.Join();
                        j.OutPt1 = Op;
                        j.OffPt.X = OffPt.X;
                        j.OffPt.Y = OffPt.Y;
                        if (ClipperLib.use_xyz) {
                            j.OffPt.Z = OffPt.Z;
                        }
                        this.m_GhostJoins.push(j);
                    };
                    ClipperLib.Clipper.prototype.SetZ = function(pt, e1, e2) {
                        if (this.ZFillFunction !== null) {
                            if (pt.Z !== 0 || this.ZFillFunction === null) {
                                return;
                            } else if (ClipperLib.IntPoint.op_Equality(pt, e1.Bot)) {
                                pt.Z = e1.Bot.Z;
                            } else if (ClipperLib.IntPoint.op_Equality(pt, e1.Top)) {
                                pt.Z = e1.Top.Z;
                            } else if (ClipperLib.IntPoint.op_Equality(pt, e2.Bot)) {
                                pt.Z = e2.Bot.Z;
                            } else if (ClipperLib.IntPoint.op_Equality(pt, e2.Top)) {
                                pt.Z = e2.Top.Z;
                            } else {
                                this.ZFillFunction(e1.Bot, e1.Top, e2.Bot, e2.Top, pt);
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.InsertLocalMinimaIntoAEL = function(botY) {
                        var lm = {
                        };
                        var lb;
                        var rb;
                        while(this.PopLocalMinima(botY, lm)){
                            lb = lm.v.LeftBound;
                            rb = lm.v.RightBound;
                            var Op1 = null;
                            if (lb === null) {
                                this.InsertEdgeIntoAEL(rb, null);
                                this.SetWindingCount(rb);
                                if (this.IsContributing(rb)) {
                                    Op1 = this.AddOutPt(rb, rb.Bot);
                                }
                            } else if (rb === null) {
                                this.InsertEdgeIntoAEL(lb, null);
                                this.SetWindingCount(lb);
                                if (this.IsContributing(lb)) {
                                    Op1 = this.AddOutPt(lb, lb.Bot);
                                }
                                this.InsertScanbeam(lb.Top.Y);
                            } else {
                                this.InsertEdgeIntoAEL(lb, null);
                                this.InsertEdgeIntoAEL(rb, lb);
                                this.SetWindingCount(lb);
                                rb.WindCnt = lb.WindCnt;
                                rb.WindCnt2 = lb.WindCnt2;
                                if (this.IsContributing(lb)) {
                                    Op1 = this.AddLocalMinPoly(lb, rb, lb.Bot);
                                }
                                this.InsertScanbeam(lb.Top.Y);
                            }
                            if (rb !== null) {
                                if (ClipperLib.ClipperBase.IsHorizontal(rb)) {
                                    if (rb.NextInLML !== null) {
                                        this.InsertScanbeam(rb.NextInLML.Top.Y);
                                    }
                                    this.AddEdgeToSEL(rb);
                                } else {
                                    this.InsertScanbeam(rb.Top.Y);
                                }
                            }
                            if (lb === null || rb === null) {
                                continue;
                            }
                            if (Op1 !== null && ClipperLib.ClipperBase.IsHorizontal(rb) && this.m_GhostJoins.length > 0 && rb.WindDelta !== 0) {
                                for(var i = 0, ilen = this.m_GhostJoins.length; i < ilen; i++){
                                    var j = this.m_GhostJoins[i];
                                    if (this.HorzSegmentsOverlap(j.OutPt1.Pt.X, j.OffPt.X, rb.Bot.X, rb.Top.X)) {
                                        this.AddJoin(j.OutPt1, Op1, j.OffPt);
                                    }
                                }
                            }
                            if (lb.OutIdx >= 0 && lb.PrevInAEL !== null && lb.PrevInAEL.Curr.X === lb.Bot.X && lb.PrevInAEL.OutIdx >= 0 && ClipperLib.ClipperBase.SlopesEqual5(lb.PrevInAEL.Curr, lb.PrevInAEL.Top, lb.Curr, lb.Top, this.m_UseFullRange) && lb.WindDelta !== 0 && lb.PrevInAEL.WindDelta !== 0) {
                                var Op2 = this.AddOutPt(lb.PrevInAEL, lb.Bot);
                                this.AddJoin(Op1, Op2, lb.Top);
                            }
                            if (lb.NextInAEL !== rb) {
                                if (rb.OutIdx >= 0 && rb.PrevInAEL.OutIdx >= 0 && ClipperLib.ClipperBase.SlopesEqual5(rb.PrevInAEL.Curr, rb.PrevInAEL.Top, rb.Curr, rb.Top, this.m_UseFullRange) && rb.WindDelta !== 0 && rb.PrevInAEL.WindDelta !== 0) {
                                    var Op2 = this.AddOutPt(rb.PrevInAEL, rb.Bot);
                                    this.AddJoin(Op1, Op2, rb.Top);
                                }
                                var e = lb.NextInAEL;
                                if (e !== null) {
                                    while(e !== rb){
                                        this.IntersectEdges(rb, e, lb.Curr);
                                        e = e.NextInAEL;
                                    }
                                }
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.InsertEdgeIntoAEL = function(edge, startEdge) {
                        if (this.m_ActiveEdges === null) {
                            edge.PrevInAEL = null;
                            edge.NextInAEL = null;
                            this.m_ActiveEdges = edge;
                        } else if (startEdge === null && this.E2InsertsBeforeE1(this.m_ActiveEdges, edge)) {
                            edge.PrevInAEL = null;
                            edge.NextInAEL = this.m_ActiveEdges;
                            this.m_ActiveEdges.PrevInAEL = edge;
                            this.m_ActiveEdges = edge;
                        } else {
                            if (startEdge === null) {
                                startEdge = this.m_ActiveEdges;
                            }
                            while(startEdge.NextInAEL !== null && !this.E2InsertsBeforeE1(startEdge.NextInAEL, edge)){
                                startEdge = startEdge.NextInAEL;
                            }
                            edge.NextInAEL = startEdge.NextInAEL;
                            if (startEdge.NextInAEL !== null) {
                                startEdge.NextInAEL.PrevInAEL = edge;
                            }
                            edge.PrevInAEL = startEdge;
                            startEdge.NextInAEL = edge;
                        }
                    };
                    ClipperLib.Clipper.prototype.E2InsertsBeforeE1 = function(e1, e2) {
                        if (e2.Curr.X === e1.Curr.X) {
                            if (e2.Top.Y > e1.Top.Y) {
                                return e2.Top.X < ClipperLib.Clipper.TopX(e1, e2.Top.Y);
                            } else {
                                return e1.Top.X > ClipperLib.Clipper.TopX(e2, e1.Top.Y);
                            }
                        } else {
                            return e2.Curr.X < e1.Curr.X;
                        }
                    };
                    ClipperLib.Clipper.prototype.IsEvenOddFillType = function(edge) {
                        if (edge.PolyTyp === ClipperLib.PolyType.ptSubject) {
                            return this.m_SubjFillType === ClipperLib.PolyFillType.pftEvenOdd;
                        } else {
                            return this.m_ClipFillType === ClipperLib.PolyFillType.pftEvenOdd;
                        }
                    };
                    ClipperLib.Clipper.prototype.IsEvenOddAltFillType = function(edge) {
                        if (edge.PolyTyp === ClipperLib.PolyType.ptSubject) {
                            return this.m_ClipFillType === ClipperLib.PolyFillType.pftEvenOdd;
                        } else {
                            return this.m_SubjFillType === ClipperLib.PolyFillType.pftEvenOdd;
                        }
                    };
                    ClipperLib.Clipper.prototype.IsContributing = function(edge) {
                        var pft, pft2;
                        if (edge.PolyTyp === ClipperLib.PolyType.ptSubject) {
                            pft = this.m_SubjFillType;
                            pft2 = this.m_ClipFillType;
                        } else {
                            pft = this.m_ClipFillType;
                            pft2 = this.m_SubjFillType;
                        }
                        switch(pft){
                            case ClipperLib.PolyFillType.pftEvenOdd:
                                if (edge.WindDelta === 0 && edge.WindCnt !== 1) {
                                    return false;
                                }
                                break;
                            case ClipperLib.PolyFillType.pftNonZero:
                                if (Math.abs(edge.WindCnt) !== 1) {
                                    return false;
                                }
                                break;
                            case ClipperLib.PolyFillType.pftPositive:
                                if (edge.WindCnt !== 1) {
                                    return false;
                                }
                                break;
                            default:
                                if (edge.WindCnt !== -1) {
                                    return false;
                                }
                                break;
                        }
                        switch(this.m_ClipType){
                            case ClipperLib.ClipType.ctIntersection:
                                switch(pft2){
                                    case ClipperLib.PolyFillType.pftEvenOdd:
                                    case ClipperLib.PolyFillType.pftNonZero:
                                        return edge.WindCnt2 !== 0;
                                    case ClipperLib.PolyFillType.pftPositive:
                                        return edge.WindCnt2 > 0;
                                    default:
                                        return edge.WindCnt2 < 0;
                                }
                            case ClipperLib.ClipType.ctUnion:
                                switch(pft2){
                                    case ClipperLib.PolyFillType.pftEvenOdd:
                                    case ClipperLib.PolyFillType.pftNonZero:
                                        return edge.WindCnt2 === 0;
                                    case ClipperLib.PolyFillType.pftPositive:
                                        return edge.WindCnt2 <= 0;
                                    default:
                                        return edge.WindCnt2 >= 0;
                                }
                            case ClipperLib.ClipType.ctDifference:
                                if (edge.PolyTyp === ClipperLib.PolyType.ptSubject) {
                                    switch(pft2){
                                        case ClipperLib.PolyFillType.pftEvenOdd:
                                        case ClipperLib.PolyFillType.pftNonZero:
                                            return edge.WindCnt2 === 0;
                                        case ClipperLib.PolyFillType.pftPositive:
                                            return edge.WindCnt2 <= 0;
                                        default:
                                            return edge.WindCnt2 >= 0;
                                    }
                                } else {
                                    switch(pft2){
                                        case ClipperLib.PolyFillType.pftEvenOdd:
                                        case ClipperLib.PolyFillType.pftNonZero:
                                            return edge.WindCnt2 !== 0;
                                        case ClipperLib.PolyFillType.pftPositive:
                                            return edge.WindCnt2 > 0;
                                        default:
                                            return edge.WindCnt2 < 0;
                                    }
                                }
                            case ClipperLib.ClipType.ctXor:
                                if (edge.WindDelta === 0) {
                                    switch(pft2){
                                        case ClipperLib.PolyFillType.pftEvenOdd:
                                        case ClipperLib.PolyFillType.pftNonZero:
                                            return edge.WindCnt2 === 0;
                                        case ClipperLib.PolyFillType.pftPositive:
                                            return edge.WindCnt2 <= 0;
                                        default:
                                            return edge.WindCnt2 >= 0;
                                    }
                                } else {
                                    return true;
                                }
                        }
                        return true;
                    };
                    ClipperLib.Clipper.prototype.SetWindingCount = function(edge) {
                        var e = edge.PrevInAEL;
                        while(e !== null && (e.PolyTyp !== edge.PolyTyp || e.WindDelta === 0)){
                            e = e.PrevInAEL;
                        }
                        if (e === null) {
                            var pft = edge.PolyTyp === ClipperLib.PolyType.ptSubject ? this.m_SubjFillType : this.m_ClipFillType;
                            if (edge.WindDelta === 0) {
                                edge.WindCnt = pft === ClipperLib.PolyFillType.pftNegative ? -1 : 1;
                            } else {
                                edge.WindCnt = edge.WindDelta;
                            }
                            edge.WindCnt2 = 0;
                            e = this.m_ActiveEdges;
                        } else if (edge.WindDelta === 0 && this.m_ClipType !== ClipperLib.ClipType.ctUnion) {
                            edge.WindCnt = 1;
                            edge.WindCnt2 = e.WindCnt2;
                            e = e.NextInAEL;
                        } else if (this.IsEvenOddFillType(edge)) {
                            if (edge.WindDelta === 0) {
                                var Inside = true;
                                var e2 = e.PrevInAEL;
                                while(e2 !== null){
                                    if (e2.PolyTyp === e.PolyTyp && e2.WindDelta !== 0) {
                                        Inside = !Inside;
                                    }
                                    e2 = e2.PrevInAEL;
                                }
                                edge.WindCnt = Inside ? 0 : 1;
                            } else {
                                edge.WindCnt = edge.WindDelta;
                            }
                            edge.WindCnt2 = e.WindCnt2;
                            e = e.NextInAEL;
                        } else {
                            if (e.WindCnt * e.WindDelta < 0) {
                                if (Math.abs(e.WindCnt) > 1) {
                                    if (e.WindDelta * edge.WindDelta < 0) {
                                        edge.WindCnt = e.WindCnt;
                                    } else {
                                        edge.WindCnt = e.WindCnt + edge.WindDelta;
                                    }
                                } else {
                                    edge.WindCnt = edge.WindDelta === 0 ? 1 : edge.WindDelta;
                                }
                            } else {
                                if (edge.WindDelta === 0) {
                                    edge.WindCnt = e.WindCnt < 0 ? e.WindCnt - 1 : e.WindCnt + 1;
                                } else if (e.WindDelta * edge.WindDelta < 0) {
                                    edge.WindCnt = e.WindCnt;
                                } else {
                                    edge.WindCnt = e.WindCnt + edge.WindDelta;
                                }
                            }
                            edge.WindCnt2 = e.WindCnt2;
                            e = e.NextInAEL;
                        }
                        if (this.IsEvenOddAltFillType(edge)) {
                            while(e !== edge){
                                if (e.WindDelta !== 0) {
                                    edge.WindCnt2 = edge.WindCnt2 === 0 ? 1 : 0;
                                }
                                e = e.NextInAEL;
                            }
                        } else {
                            while(e !== edge){
                                edge.WindCnt2 += e.WindDelta;
                                e = e.NextInAEL;
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.AddEdgeToSEL = function(edge) {
                        if (this.m_SortedEdges === null) {
                            this.m_SortedEdges = edge;
                            edge.PrevInSEL = null;
                            edge.NextInSEL = null;
                        } else {
                            edge.NextInSEL = this.m_SortedEdges;
                            edge.PrevInSEL = null;
                            this.m_SortedEdges.PrevInSEL = edge;
                            this.m_SortedEdges = edge;
                        }
                    };
                    ClipperLib.Clipper.prototype.PopEdgeFromSEL = function(e) {
                        e.v = this.m_SortedEdges;
                        if (e.v === null) {
                            return false;
                        }
                        var oldE = e.v;
                        this.m_SortedEdges = e.v.NextInSEL;
                        if (this.m_SortedEdges !== null) {
                            this.m_SortedEdges.PrevInSEL = null;
                        }
                        oldE.NextInSEL = null;
                        oldE.PrevInSEL = null;
                        return true;
                    };
                    ClipperLib.Clipper.prototype.CopyAELToSEL = function() {
                        var e = this.m_ActiveEdges;
                        this.m_SortedEdges = e;
                        while(e !== null){
                            e.PrevInSEL = e.PrevInAEL;
                            e.NextInSEL = e.NextInAEL;
                            e = e.NextInAEL;
                        }
                    };
                    ClipperLib.Clipper.prototype.SwapPositionsInSEL = function(edge1, edge2) {
                        if (edge1.NextInSEL === null && edge1.PrevInSEL === null) {
                            return;
                        }
                        if (edge2.NextInSEL === null && edge2.PrevInSEL === null) {
                            return;
                        }
                        if (edge1.NextInSEL === edge2) {
                            var next = edge2.NextInSEL;
                            if (next !== null) {
                                next.PrevInSEL = edge1;
                            }
                            var prev = edge1.PrevInSEL;
                            if (prev !== null) {
                                prev.NextInSEL = edge2;
                            }
                            edge2.PrevInSEL = prev;
                            edge2.NextInSEL = edge1;
                            edge1.PrevInSEL = edge2;
                            edge1.NextInSEL = next;
                        } else if (edge2.NextInSEL === edge1) {
                            var next = edge1.NextInSEL;
                            if (next !== null) {
                                next.PrevInSEL = edge2;
                            }
                            var prev = edge2.PrevInSEL;
                            if (prev !== null) {
                                prev.NextInSEL = edge1;
                            }
                            edge1.PrevInSEL = prev;
                            edge1.NextInSEL = edge2;
                            edge2.PrevInSEL = edge1;
                            edge2.NextInSEL = next;
                        } else {
                            var next = edge1.NextInSEL;
                            var prev = edge1.PrevInSEL;
                            edge1.NextInSEL = edge2.NextInSEL;
                            if (edge1.NextInSEL !== null) {
                                edge1.NextInSEL.PrevInSEL = edge1;
                            }
                            edge1.PrevInSEL = edge2.PrevInSEL;
                            if (edge1.PrevInSEL !== null) {
                                edge1.PrevInSEL.NextInSEL = edge1;
                            }
                            edge2.NextInSEL = next;
                            if (edge2.NextInSEL !== null) {
                                edge2.NextInSEL.PrevInSEL = edge2;
                            }
                            edge2.PrevInSEL = prev;
                            if (edge2.PrevInSEL !== null) {
                                edge2.PrevInSEL.NextInSEL = edge2;
                            }
                        }
                        if (edge1.PrevInSEL === null) {
                            this.m_SortedEdges = edge1;
                        } else if (edge2.PrevInSEL === null) {
                            this.m_SortedEdges = edge2;
                        }
                    };
                    ClipperLib.Clipper.prototype.AddLocalMaxPoly = function(e1, e2, pt) {
                        this.AddOutPt(e1, pt);
                        if (e2.WindDelta === 0) {
                            this.AddOutPt(e2, pt);
                        }
                        if (e1.OutIdx === e2.OutIdx) {
                            e1.OutIdx = -1;
                            e2.OutIdx = -1;
                        } else if (e1.OutIdx < e2.OutIdx) {
                            this.AppendPolygon(e1, e2);
                        } else {
                            this.AppendPolygon(e2, e1);
                        }
                    };
                    ClipperLib.Clipper.prototype.AddLocalMinPoly = function(e1, e2, pt) {
                        var result;
                        var e, prevE;
                        if (ClipperLib.ClipperBase.IsHorizontal(e2) || e1.Dx > e2.Dx) {
                            result = this.AddOutPt(e1, pt);
                            e2.OutIdx = e1.OutIdx;
                            e1.Side = ClipperLib.EdgeSide.esLeft;
                            e2.Side = ClipperLib.EdgeSide.esRight;
                            e = e1;
                            if (e.PrevInAEL === e2) {
                                prevE = e2.PrevInAEL;
                            } else {
                                prevE = e.PrevInAEL;
                            }
                        } else {
                            result = this.AddOutPt(e2, pt);
                            e1.OutIdx = e2.OutIdx;
                            e1.Side = ClipperLib.EdgeSide.esRight;
                            e2.Side = ClipperLib.EdgeSide.esLeft;
                            e = e2;
                            if (e.PrevInAEL === e1) {
                                prevE = e1.PrevInAEL;
                            } else {
                                prevE = e.PrevInAEL;
                            }
                        }
                        if (prevE !== null && prevE.OutIdx >= 0 && prevE.Top.Y < pt.Y && e.Top.Y < pt.Y) {
                            var xPrev = ClipperLib.Clipper.TopX(prevE, pt.Y);
                            var xE = ClipperLib.Clipper.TopX(e, pt.Y);
                            if (xPrev === xE && e.WindDelta !== 0 && prevE.WindDelta !== 0 && ClipperLib.ClipperBase.SlopesEqual5(new ClipperLib.IntPoint2(xPrev, pt.Y), prevE.Top, new ClipperLib.IntPoint2(xE, pt.Y), e.Top, this.m_UseFullRange)) {
                                var outPt = this.AddOutPt(prevE, pt);
                                this.AddJoin(result, outPt, e.Top);
                            }
                        }
                        return result;
                    };
                    ClipperLib.Clipper.prototype.AddOutPt = function(e, pt) {
                        if (e.OutIdx < 0) {
                            var outRec = this.CreateOutRec();
                            outRec.IsOpen = e.WindDelta === 0;
                            var newOp = new ClipperLib.OutPt();
                            outRec.Pts = newOp;
                            newOp.Idx = outRec.Idx;
                            newOp.Pt.X = pt.X;
                            newOp.Pt.Y = pt.Y;
                            if (ClipperLib.use_xyz) {
                                newOp.Pt.Z = pt.Z;
                            }
                            newOp.Next = newOp;
                            newOp.Prev = newOp;
                            if (!outRec.IsOpen) {
                                this.SetHoleState(e, outRec);
                            }
                            e.OutIdx = outRec.Idx;
                            return newOp;
                        } else {
                            var outRec = this.m_PolyOuts[e.OutIdx];
                            var op = outRec.Pts;
                            var ToFront = e.Side === ClipperLib.EdgeSide.esLeft;
                            if (ToFront && ClipperLib.IntPoint.op_Equality(pt, op.Pt)) {
                                return op;
                            } else if (!ToFront && ClipperLib.IntPoint.op_Equality(pt, op.Prev.Pt)) {
                                return op.Prev;
                            }
                            var newOp = new ClipperLib.OutPt();
                            newOp.Idx = outRec.Idx;
                            newOp.Pt.X = pt.X;
                            newOp.Pt.Y = pt.Y;
                            if (ClipperLib.use_xyz) {
                                newOp.Pt.Z = pt.Z;
                            }
                            newOp.Next = op;
                            newOp.Prev = op.Prev;
                            newOp.Prev.Next = newOp;
                            op.Prev = newOp;
                            if (ToFront) {
                                outRec.Pts = newOp;
                            }
                            return newOp;
                        }
                    };
                    ClipperLib.Clipper.prototype.GetLastOutPt = function(e) {
                        var outRec = this.m_PolyOuts[e.OutIdx];
                        if (e.Side === ClipperLib.EdgeSide.esLeft) {
                            return outRec.Pts;
                        } else {
                            return outRec.Pts.Prev;
                        }
                    };
                    ClipperLib.Clipper.prototype.SwapPoints = function(pt1, pt2) {
                        var tmp = new ClipperLib.IntPoint1(pt1.Value);
                        pt1.Value.X = pt2.Value.X;
                        pt1.Value.Y = pt2.Value.Y;
                        if (ClipperLib.use_xyz) {
                            pt1.Value.Z = pt2.Value.Z;
                        }
                        pt2.Value.X = tmp.X;
                        pt2.Value.Y = tmp.Y;
                        if (ClipperLib.use_xyz) {
                            pt2.Value.Z = tmp.Z;
                        }
                    };
                    ClipperLib.Clipper.prototype.HorzSegmentsOverlap = function(seg1a, seg1b, seg2a, seg2b) {
                        var tmp;
                        if (seg1a > seg1b) {
                            tmp = seg1a;
                            seg1a = seg1b;
                            seg1b = tmp;
                        }
                        if (seg2a > seg2b) {
                            tmp = seg2a;
                            seg2a = seg2b;
                            seg2b = tmp;
                        }
                        return seg1a < seg2b && seg2a < seg1b;
                    };
                    ClipperLib.Clipper.prototype.SetHoleState = function(e, outRec) {
                        var e2 = e.PrevInAEL;
                        var eTmp = null;
                        while(e2 !== null){
                            if (e2.OutIdx >= 0 && e2.WindDelta !== 0) {
                                if (eTmp === null) {
                                    eTmp = e2;
                                } else if (eTmp.OutIdx === e2.OutIdx) {
                                    eTmp = null;
                                }
                            }
                            e2 = e2.PrevInAEL;
                        }
                        if (eTmp === null) {
                            outRec.FirstLeft = null;
                            outRec.IsHole = false;
                        } else {
                            outRec.FirstLeft = this.m_PolyOuts[eTmp.OutIdx];
                            outRec.IsHole = !outRec.FirstLeft.IsHole;
                        }
                    };
                    ClipperLib.Clipper.prototype.GetDx = function(pt1, pt2) {
                        if (pt1.Y === pt2.Y) {
                            return ClipperLib.ClipperBase.horizontal;
                        } else {
                            return (pt2.X - pt1.X) / (pt2.Y - pt1.Y);
                        }
                    };
                    ClipperLib.Clipper.prototype.FirstIsBottomPt = function(btmPt1, btmPt2) {
                        var p = btmPt1.Prev;
                        while(ClipperLib.IntPoint.op_Equality(p.Pt, btmPt1.Pt) && p !== btmPt1){
                            p = p.Prev;
                        }
                        var dx1p = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
                        p = btmPt1.Next;
                        while(ClipperLib.IntPoint.op_Equality(p.Pt, btmPt1.Pt) && p !== btmPt1){
                            p = p.Next;
                        }
                        var dx1n = Math.abs(this.GetDx(btmPt1.Pt, p.Pt));
                        p = btmPt2.Prev;
                        while(ClipperLib.IntPoint.op_Equality(p.Pt, btmPt2.Pt) && p !== btmPt2){
                            p = p.Prev;
                        }
                        var dx2p = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
                        p = btmPt2.Next;
                        while(ClipperLib.IntPoint.op_Equality(p.Pt, btmPt2.Pt) && p !== btmPt2){
                            p = p.Next;
                        }
                        var dx2n = Math.abs(this.GetDx(btmPt2.Pt, p.Pt));
                        if (Math.max(dx1p, dx1n) === Math.max(dx2p, dx2n) && Math.min(dx1p, dx1n) === Math.min(dx2p, dx2n)) {
                            return this.Area(btmPt1) > 0;
                        } else {
                            return dx1p >= dx2p && dx1p >= dx2n || dx1n >= dx2p && dx1n >= dx2n;
                        }
                    };
                    ClipperLib.Clipper.prototype.GetBottomPt = function(pp) {
                        var dups = null;
                        var p = pp.Next;
                        while(p !== pp){
                            if (p.Pt.Y > pp.Pt.Y) {
                                pp = p;
                                dups = null;
                            } else if (p.Pt.Y === pp.Pt.Y && p.Pt.X <= pp.Pt.X) {
                                if (p.Pt.X < pp.Pt.X) {
                                    dups = null;
                                    pp = p;
                                } else {
                                    if (p.Next !== pp && p.Prev !== pp) {
                                        dups = p;
                                    }
                                }
                            }
                            p = p.Next;
                        }
                        if (dups !== null) {
                            while(dups !== p){
                                if (!this.FirstIsBottomPt(p, dups)) {
                                    pp = dups;
                                }
                                dups = dups.Next;
                                while(ClipperLib.IntPoint.op_Inequality(dups.Pt, pp.Pt)){
                                    dups = dups.Next;
                                }
                            }
                        }
                        return pp;
                    };
                    ClipperLib.Clipper.prototype.GetLowermostRec = function(outRec1, outRec2) {
                        if (outRec1.BottomPt === null) {
                            outRec1.BottomPt = this.GetBottomPt(outRec1.Pts);
                        }
                        if (outRec2.BottomPt === null) {
                            outRec2.BottomPt = this.GetBottomPt(outRec2.Pts);
                        }
                        var bPt1 = outRec1.BottomPt;
                        var bPt2 = outRec2.BottomPt;
                        if (bPt1.Pt.Y > bPt2.Pt.Y) {
                            return outRec1;
                        } else if (bPt1.Pt.Y < bPt2.Pt.Y) {
                            return outRec2;
                        } else if (bPt1.Pt.X < bPt2.Pt.X) {
                            return outRec1;
                        } else if (bPt1.Pt.X > bPt2.Pt.X) {
                            return outRec2;
                        } else if (bPt1.Next === bPt1) {
                            return outRec2;
                        } else if (bPt2.Next === bPt2) {
                            return outRec1;
                        } else if (this.FirstIsBottomPt(bPt1, bPt2)) {
                            return outRec1;
                        } else {
                            return outRec2;
                        }
                    };
                    ClipperLib.Clipper.prototype.OutRec1RightOfOutRec2 = function(outRec1, outRec2) {
                        do {
                            outRec1 = outRec1.FirstLeft;
                            if (outRec1 === outRec2) {
                                return true;
                            }
                        }while (outRec1 !== null)
                        return false;
                    };
                    ClipperLib.Clipper.prototype.GetOutRec = function(idx) {
                        var outrec = this.m_PolyOuts[idx];
                        while(outrec !== this.m_PolyOuts[outrec.Idx]){
                            outrec = this.m_PolyOuts[outrec.Idx];
                        }
                        return outrec;
                    };
                    ClipperLib.Clipper.prototype.AppendPolygon = function(e1, e2) {
                        var outRec1 = this.m_PolyOuts[e1.OutIdx];
                        var outRec2 = this.m_PolyOuts[e2.OutIdx];
                        var holeStateRec;
                        if (this.OutRec1RightOfOutRec2(outRec1, outRec2)) {
                            holeStateRec = outRec2;
                        } else if (this.OutRec1RightOfOutRec2(outRec2, outRec1)) {
                            holeStateRec = outRec1;
                        } else {
                            holeStateRec = this.GetLowermostRec(outRec1, outRec2);
                        }
                        var p1_lft = outRec1.Pts;
                        var p1_rt = p1_lft.Prev;
                        var p2_lft = outRec2.Pts;
                        var p2_rt = p2_lft.Prev;
                        if (e1.Side === ClipperLib.EdgeSide.esLeft) {
                            if (e2.Side === ClipperLib.EdgeSide.esLeft) {
                                this.ReversePolyPtLinks(p2_lft);
                                p2_lft.Next = p1_lft;
                                p1_lft.Prev = p2_lft;
                                p1_rt.Next = p2_rt;
                                p2_rt.Prev = p1_rt;
                                outRec1.Pts = p2_rt;
                            } else {
                                p2_rt.Next = p1_lft;
                                p1_lft.Prev = p2_rt;
                                p2_lft.Prev = p1_rt;
                                p1_rt.Next = p2_lft;
                                outRec1.Pts = p2_lft;
                            }
                        } else {
                            if (e2.Side === ClipperLib.EdgeSide.esRight) {
                                this.ReversePolyPtLinks(p2_lft);
                                p1_rt.Next = p2_rt;
                                p2_rt.Prev = p1_rt;
                                p2_lft.Next = p1_lft;
                                p1_lft.Prev = p2_lft;
                            } else {
                                p1_rt.Next = p2_lft;
                                p2_lft.Prev = p1_rt;
                                p1_lft.Prev = p2_rt;
                                p2_rt.Next = p1_lft;
                            }
                        }
                        outRec1.BottomPt = null;
                        if (holeStateRec === outRec2) {
                            if (outRec2.FirstLeft !== outRec1) {
                                outRec1.FirstLeft = outRec2.FirstLeft;
                            }
                            outRec1.IsHole = outRec2.IsHole;
                        }
                        outRec2.Pts = null;
                        outRec2.BottomPt = null;
                        outRec2.FirstLeft = outRec1;
                        var OKIdx = e1.OutIdx;
                        var ObsoleteIdx = e2.OutIdx;
                        e1.OutIdx = -1;
                        e2.OutIdx = -1;
                        var e = this.m_ActiveEdges;
                        while(e !== null){
                            if (e.OutIdx === ObsoleteIdx) {
                                e.OutIdx = OKIdx;
                                e.Side = e1.Side;
                                break;
                            }
                            e = e.NextInAEL;
                        }
                        outRec2.Idx = outRec1.Idx;
                    };
                    ClipperLib.Clipper.prototype.ReversePolyPtLinks = function(pp) {
                        if (pp === null) {
                            return;
                        }
                        var pp1;
                        var pp2;
                        pp1 = pp;
                        do {
                            pp2 = pp1.Next;
                            pp1.Next = pp1.Prev;
                            pp1.Prev = pp2;
                            pp1 = pp2;
                        }while (pp1 !== pp)
                    };
                    ClipperLib.Clipper.SwapSides = function(edge1, edge2) {
                        var side = edge1.Side;
                        edge1.Side = edge2.Side;
                        edge2.Side = side;
                    };
                    ClipperLib.Clipper.SwapPolyIndexes = function(edge1, edge2) {
                        var outIdx = edge1.OutIdx;
                        edge1.OutIdx = edge2.OutIdx;
                        edge2.OutIdx = outIdx;
                    };
                    ClipperLib.Clipper.prototype.IntersectEdges = function(e1, e2, pt) {
                        var e1Contributing = e1.OutIdx >= 0;
                        var e2Contributing = e2.OutIdx >= 0;
                        if (ClipperLib.use_xyz) {
                            this.SetZ(pt, e1, e2);
                        }
                        if (ClipperLib.use_lines) {
                            if (e1.WindDelta === 0 || e2.WindDelta === 0) {
                                if (e1.WindDelta === 0 && e2.WindDelta === 0) {
                                    return;
                                } else if (e1.PolyTyp === e2.PolyTyp && e1.WindDelta !== e2.WindDelta && this.m_ClipType === ClipperLib.ClipType.ctUnion) {
                                    if (e1.WindDelta === 0) {
                                        if (e2Contributing) {
                                            this.AddOutPt(e1, pt);
                                            if (e1Contributing) {
                                                e1.OutIdx = -1;
                                            }
                                        }
                                    } else {
                                        if (e1Contributing) {
                                            this.AddOutPt(e2, pt);
                                            if (e2Contributing) {
                                                e2.OutIdx = -1;
                                            }
                                        }
                                    }
                                } else if (e1.PolyTyp !== e2.PolyTyp) {
                                    if (e1.WindDelta === 0 && Math.abs(e2.WindCnt) === 1 && (this.m_ClipType !== ClipperLib.ClipType.ctUnion || e2.WindCnt2 === 0)) {
                                        this.AddOutPt(e1, pt);
                                        if (e1Contributing) {
                                            e1.OutIdx = -1;
                                        }
                                    } else if (e2.WindDelta === 0 && Math.abs(e1.WindCnt) === 1 && (this.m_ClipType !== ClipperLib.ClipType.ctUnion || e1.WindCnt2 === 0)) {
                                        this.AddOutPt(e2, pt);
                                        if (e2Contributing) {
                                            e2.OutIdx = -1;
                                        }
                                    }
                                }
                                return;
                            }
                        }
                        if (e1.PolyTyp === e2.PolyTyp) {
                            if (this.IsEvenOddFillType(e1)) {
                                var oldE1WindCnt = e1.WindCnt;
                                e1.WindCnt = e2.WindCnt;
                                e2.WindCnt = oldE1WindCnt;
                            } else {
                                if (e1.WindCnt + e2.WindDelta === 0) {
                                    e1.WindCnt = -e1.WindCnt;
                                } else {
                                    e1.WindCnt += e2.WindDelta;
                                }
                                if (e2.WindCnt - e1.WindDelta === 0) {
                                    e2.WindCnt = -e2.WindCnt;
                                } else {
                                    e2.WindCnt -= e1.WindDelta;
                                }
                            }
                        } else {
                            if (!this.IsEvenOddFillType(e2)) {
                                e1.WindCnt2 += e2.WindDelta;
                            } else {
                                e1.WindCnt2 = e1.WindCnt2 === 0 ? 1 : 0;
                            }
                            if (!this.IsEvenOddFillType(e1)) {
                                e2.WindCnt2 -= e1.WindDelta;
                            } else {
                                e2.WindCnt2 = e2.WindCnt2 === 0 ? 1 : 0;
                            }
                        }
                        var e1FillType, e2FillType, e1FillType2, e2FillType2;
                        if (e1.PolyTyp === ClipperLib.PolyType.ptSubject) {
                            e1FillType = this.m_SubjFillType;
                            e1FillType2 = this.m_ClipFillType;
                        } else {
                            e1FillType = this.m_ClipFillType;
                            e1FillType2 = this.m_SubjFillType;
                        }
                        if (e2.PolyTyp === ClipperLib.PolyType.ptSubject) {
                            e2FillType = this.m_SubjFillType;
                            e2FillType2 = this.m_ClipFillType;
                        } else {
                            e2FillType = this.m_ClipFillType;
                            e2FillType2 = this.m_SubjFillType;
                        }
                        var e1Wc, e2Wc;
                        switch(e1FillType){
                            case ClipperLib.PolyFillType.pftPositive:
                                e1Wc = e1.WindCnt;
                                break;
                            case ClipperLib.PolyFillType.pftNegative:
                                e1Wc = -e1.WindCnt;
                                break;
                            default:
                                e1Wc = Math.abs(e1.WindCnt);
                                break;
                        }
                        switch(e2FillType){
                            case ClipperLib.PolyFillType.pftPositive:
                                e2Wc = e2.WindCnt;
                                break;
                            case ClipperLib.PolyFillType.pftNegative:
                                e2Wc = -e2.WindCnt;
                                break;
                            default:
                                e2Wc = Math.abs(e2.WindCnt);
                                break;
                        }
                        if (e1Contributing && e2Contributing) {
                            if (e1Wc !== 0 && e1Wc !== 1 || e2Wc !== 0 && e2Wc !== 1 || e1.PolyTyp !== e2.PolyTyp && this.m_ClipType !== ClipperLib.ClipType.ctXor) {
                                this.AddLocalMaxPoly(e1, e2, pt);
                            } else {
                                this.AddOutPt(e1, pt);
                                this.AddOutPt(e2, pt);
                                ClipperLib.Clipper.SwapSides(e1, e2);
                                ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
                            }
                        } else if (e1Contributing) {
                            if (e2Wc === 0 || e2Wc === 1) {
                                this.AddOutPt(e1, pt);
                                ClipperLib.Clipper.SwapSides(e1, e2);
                                ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
                            }
                        } else if (e2Contributing) {
                            if (e1Wc === 0 || e1Wc === 1) {
                                this.AddOutPt(e2, pt);
                                ClipperLib.Clipper.SwapSides(e1, e2);
                                ClipperLib.Clipper.SwapPolyIndexes(e1, e2);
                            }
                        } else if ((e1Wc === 0 || e1Wc === 1) && (e2Wc === 0 || e2Wc === 1)) {
                            var e1Wc2, e2Wc2;
                            switch(e1FillType2){
                                case ClipperLib.PolyFillType.pftPositive:
                                    e1Wc2 = e1.WindCnt2;
                                    break;
                                case ClipperLib.PolyFillType.pftNegative:
                                    e1Wc2 = -e1.WindCnt2;
                                    break;
                                default:
                                    e1Wc2 = Math.abs(e1.WindCnt2);
                                    break;
                            }
                            switch(e2FillType2){
                                case ClipperLib.PolyFillType.pftPositive:
                                    e2Wc2 = e2.WindCnt2;
                                    break;
                                case ClipperLib.PolyFillType.pftNegative:
                                    e2Wc2 = -e2.WindCnt2;
                                    break;
                                default:
                                    e2Wc2 = Math.abs(e2.WindCnt2);
                                    break;
                            }
                            if (e1.PolyTyp !== e2.PolyTyp) {
                                this.AddLocalMinPoly(e1, e2, pt);
                            } else if (e1Wc === 1 && e2Wc === 1) {
                                switch(this.m_ClipType){
                                    case ClipperLib.ClipType.ctIntersection:
                                        if (e1Wc2 > 0 && e2Wc2 > 0) {
                                            this.AddLocalMinPoly(e1, e2, pt);
                                        }
                                        break;
                                    case ClipperLib.ClipType.ctUnion:
                                        if (e1Wc2 <= 0 && e2Wc2 <= 0) {
                                            this.AddLocalMinPoly(e1, e2, pt);
                                        }
                                        break;
                                    case ClipperLib.ClipType.ctDifference:
                                        if (e1.PolyTyp === ClipperLib.PolyType.ptClip && e1Wc2 > 0 && e2Wc2 > 0 || e1.PolyTyp === ClipperLib.PolyType.ptSubject && e1Wc2 <= 0 && e2Wc2 <= 0) {
                                            this.AddLocalMinPoly(e1, e2, pt);
                                        }
                                        break;
                                    case ClipperLib.ClipType.ctXor:
                                        this.AddLocalMinPoly(e1, e2, pt);
                                        break;
                                }
                            } else {
                                ClipperLib.Clipper.SwapSides(e1, e2);
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.DeleteFromSEL = function(e) {
                        var SelPrev = e.PrevInSEL;
                        var SelNext = e.NextInSEL;
                        if (SelPrev === null && SelNext === null && e !== this.m_SortedEdges) {
                            return;
                        }
                        if (SelPrev !== null) {
                            SelPrev.NextInSEL = SelNext;
                        } else {
                            this.m_SortedEdges = SelNext;
                        }
                        if (SelNext !== null) {
                            SelNext.PrevInSEL = SelPrev;
                        }
                        e.NextInSEL = null;
                        e.PrevInSEL = null;
                    };
                    ClipperLib.Clipper.prototype.ProcessHorizontals = function() {
                        var horzEdge = {
                        };
                        while(this.PopEdgeFromSEL(horzEdge)){
                            this.ProcessHorizontal(horzEdge.v);
                        }
                    };
                    ClipperLib.Clipper.prototype.GetHorzDirection = function(HorzEdge, $var) {
                        if (HorzEdge.Bot.X < HorzEdge.Top.X) {
                            $var.Left = HorzEdge.Bot.X;
                            $var.Right = HorzEdge.Top.X;
                            $var.Dir = ClipperLib.Direction.dLeftToRight;
                        } else {
                            $var.Left = HorzEdge.Top.X;
                            $var.Right = HorzEdge.Bot.X;
                            $var.Dir = ClipperLib.Direction.dRightToLeft;
                        }
                    };
                    ClipperLib.Clipper.prototype.ProcessHorizontal = function(horzEdge) {
                        var $var = {
                            Dir: null,
                            Left: null,
                            Right: null
                        };
                        this.GetHorzDirection(horzEdge, $var);
                        var dir = $var.Dir;
                        var horzLeft = $var.Left;
                        var horzRight = $var.Right;
                        var IsOpen = horzEdge.WindDelta === 0;
                        var eLastHorz = horzEdge, eMaxPair = null;
                        while(eLastHorz.NextInLML !== null && ClipperLib.ClipperBase.IsHorizontal(eLastHorz.NextInLML)){
                            eLastHorz = eLastHorz.NextInLML;
                        }
                        if (eLastHorz.NextInLML === null) {
                            eMaxPair = this.GetMaximaPair(eLastHorz);
                        }
                        var currMax = this.m_Maxima;
                        if (currMax !== null) {
                            if (dir === ClipperLib.Direction.dLeftToRight) {
                                while(currMax !== null && currMax.X <= horzEdge.Bot.X){
                                    currMax = currMax.Next;
                                }
                                if (currMax !== null && currMax.X >= eLastHorz.Top.X) {
                                    currMax = null;
                                }
                            } else {
                                while(currMax.Next !== null && currMax.Next.X < horzEdge.Bot.X){
                                    currMax = currMax.Next;
                                }
                                if (currMax.X <= eLastHorz.Top.X) {
                                    currMax = null;
                                }
                            }
                        }
                        var op1 = null;
                        for(;;){
                            var IsLastHorz = horzEdge === eLastHorz;
                            var e = this.GetNextInAEL(horzEdge, dir);
                            while(e !== null){
                                if (currMax !== null) {
                                    if (dir === ClipperLib.Direction.dLeftToRight) {
                                        while(currMax !== null && currMax.X < e.Curr.X){
                                            if (horzEdge.OutIdx >= 0 && !IsOpen) {
                                                this.AddOutPt(horzEdge, new ClipperLib.IntPoint2(currMax.X, horzEdge.Bot.Y));
                                            }
                                            currMax = currMax.Next;
                                        }
                                    } else {
                                        while(currMax !== null && currMax.X > e.Curr.X){
                                            if (horzEdge.OutIdx >= 0 && !IsOpen) {
                                                this.AddOutPt(horzEdge, new ClipperLib.IntPoint2(currMax.X, horzEdge.Bot.Y));
                                            }
                                            currMax = currMax.Prev;
                                        }
                                    }
                                }
                                if (dir === ClipperLib.Direction.dLeftToRight && e.Curr.X > horzRight || dir === ClipperLib.Direction.dRightToLeft && e.Curr.X < horzLeft) {
                                    break;
                                }
                                if (e.Curr.X === horzEdge.Top.X && horzEdge.NextInLML !== null && e.Dx < horzEdge.NextInLML.Dx) {
                                    break;
                                }
                                if (horzEdge.OutIdx >= 0 && !IsOpen) {
                                    if (ClipperLib.use_xyz) {
                                        if (dir === ClipperLib.Direction.dLeftToRight) {
                                            this.SetZ(e.Curr, horzEdge, e);
                                        } else {
                                            this.SetZ(e.Curr, e, horzEdge);
                                        }
                                    }
                                    op1 = this.AddOutPt(horzEdge, e.Curr);
                                    var eNextHorz = this.m_SortedEdges;
                                    while(eNextHorz !== null){
                                        if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X)) {
                                            var op2 = this.GetLastOutPt(eNextHorz);
                                            this.AddJoin(op2, op1, eNextHorz.Top);
                                        }
                                        eNextHorz = eNextHorz.NextInSEL;
                                    }
                                    this.AddGhostJoin(op1, horzEdge.Bot);
                                }
                                if (e === eMaxPair && IsLastHorz) {
                                    if (horzEdge.OutIdx >= 0) {
                                        this.AddLocalMaxPoly(horzEdge, eMaxPair, horzEdge.Top);
                                    }
                                    this.DeleteFromAEL(horzEdge);
                                    this.DeleteFromAEL(eMaxPair);
                                    return;
                                }
                                if (dir === ClipperLib.Direction.dLeftToRight) {
                                    var Pt = new ClipperLib.IntPoint2(e.Curr.X, horzEdge.Curr.Y);
                                    this.IntersectEdges(horzEdge, e, Pt);
                                } else {
                                    var Pt = new ClipperLib.IntPoint2(e.Curr.X, horzEdge.Curr.Y);
                                    this.IntersectEdges(e, horzEdge, Pt);
                                }
                                var eNext = this.GetNextInAEL(e, dir);
                                this.SwapPositionsInAEL(horzEdge, e);
                                e = eNext;
                            }
                            if (horzEdge.NextInLML === null || !ClipperLib.ClipperBase.IsHorizontal(horzEdge.NextInLML)) {
                                break;
                            }
                            horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
                            if (horzEdge.OutIdx >= 0) {
                                this.AddOutPt(horzEdge, horzEdge.Bot);
                            }
                            $var = {
                                Dir: dir,
                                Left: horzLeft,
                                Right: horzRight
                            };
                            this.GetHorzDirection(horzEdge, $var);
                            dir = $var.Dir;
                            horzLeft = $var.Left;
                            horzRight = $var.Right;
                        }
                        if (horzEdge.OutIdx >= 0 && op1 === null) {
                            op1 = this.GetLastOutPt(horzEdge);
                            var eNextHorz = this.m_SortedEdges;
                            while(eNextHorz !== null){
                                if (eNextHorz.OutIdx >= 0 && this.HorzSegmentsOverlap(horzEdge.Bot.X, horzEdge.Top.X, eNextHorz.Bot.X, eNextHorz.Top.X)) {
                                    var op2 = this.GetLastOutPt(eNextHorz);
                                    this.AddJoin(op2, op1, eNextHorz.Top);
                                }
                                eNextHorz = eNextHorz.NextInSEL;
                            }
                            this.AddGhostJoin(op1, horzEdge.Top);
                        }
                        if (horzEdge.NextInLML !== null) {
                            if (horzEdge.OutIdx >= 0) {
                                op1 = this.AddOutPt(horzEdge, horzEdge.Top);
                                horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
                                if (horzEdge.WindDelta === 0) {
                                    return;
                                }
                                var ePrev = horzEdge.PrevInAEL;
                                var eNext = horzEdge.NextInAEL;
                                if (ePrev !== null && ePrev.Curr.X === horzEdge.Bot.X && ePrev.Curr.Y === horzEdge.Bot.Y && ePrev.WindDelta === 0 && ePrev.OutIdx >= 0 && ePrev.Curr.Y > ePrev.Top.Y && ClipperLib.ClipperBase.SlopesEqual3(horzEdge, ePrev, this.m_UseFullRange)) {
                                    var op2 = this.AddOutPt(ePrev, horzEdge.Bot);
                                    this.AddJoin(op1, op2, horzEdge.Top);
                                } else if (eNext !== null && eNext.Curr.X === horzEdge.Bot.X && eNext.Curr.Y === horzEdge.Bot.Y && eNext.WindDelta !== 0 && eNext.OutIdx >= 0 && eNext.Curr.Y > eNext.Top.Y && ClipperLib.ClipperBase.SlopesEqual3(horzEdge, eNext, this.m_UseFullRange)) {
                                    var op2 = this.AddOutPt(eNext, horzEdge.Bot);
                                    this.AddJoin(op1, op2, horzEdge.Top);
                                }
                            } else {
                                horzEdge = this.UpdateEdgeIntoAEL(horzEdge);
                            }
                        } else {
                            if (horzEdge.OutIdx >= 0) {
                                this.AddOutPt(horzEdge, horzEdge.Top);
                            }
                            this.DeleteFromAEL(horzEdge);
                        }
                    };
                    ClipperLib.Clipper.prototype.GetNextInAEL = function(e, Direction) {
                        return Direction === ClipperLib.Direction.dLeftToRight ? e.NextInAEL : e.PrevInAEL;
                    };
                    ClipperLib.Clipper.prototype.IsMinima = function(e) {
                        return e !== null && e.Prev.NextInLML !== e && e.Next.NextInLML !== e;
                    };
                    ClipperLib.Clipper.prototype.IsMaxima = function(e, Y) {
                        return e !== null && e.Top.Y === Y && e.NextInLML === null;
                    };
                    ClipperLib.Clipper.prototype.IsIntermediate = function(e, Y) {
                        return e.Top.Y === Y && e.NextInLML !== null;
                    };
                    ClipperLib.Clipper.prototype.GetMaximaPair = function(e) {
                        if (ClipperLib.IntPoint.op_Equality(e.Next.Top, e.Top) && e.Next.NextInLML === null) {
                            return e.Next;
                        } else {
                            if (ClipperLib.IntPoint.op_Equality(e.Prev.Top, e.Top) && e.Prev.NextInLML === null) {
                                return e.Prev;
                            } else {
                                return null;
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.GetMaximaPairEx = function(e) {
                        var result = this.GetMaximaPair(e);
                        if (result === null || result.OutIdx === ClipperLib.ClipperBase.Skip || result.NextInAEL === result.PrevInAEL && !ClipperLib.ClipperBase.IsHorizontal(result)) {
                            return null;
                        }
                        return result;
                    };
                    ClipperLib.Clipper.prototype.ProcessIntersections = function(topY) {
                        if (this.m_ActiveEdges === null) {
                            return true;
                        }
                        try {
                            this.BuildIntersectList(topY);
                            if (this.m_IntersectList.length === 0) {
                                return true;
                            }
                            if (this.m_IntersectList.length === 1 || this.FixupIntersectionOrder()) {
                                this.ProcessIntersectList();
                            } else {
                                return false;
                            }
                        } catch ($$e2) {
                            this.m_SortedEdges = null;
                            this.m_IntersectList.length = 0;
                            ClipperLib.Error("ProcessIntersections error");
                        }
                        this.m_SortedEdges = null;
                        return true;
                    };
                    ClipperLib.Clipper.prototype.BuildIntersectList = function(topY) {
                        if (this.m_ActiveEdges === null) {
                            return;
                        }
                        var e = this.m_ActiveEdges;
                        this.m_SortedEdges = e;
                        while(e !== null){
                            e.PrevInSEL = e.PrevInAEL;
                            e.NextInSEL = e.NextInAEL;
                            e.Curr.X = ClipperLib.Clipper.TopX(e, topY);
                            e = e.NextInAEL;
                        }
                        var isModified = true;
                        while(isModified && this.m_SortedEdges !== null){
                            isModified = false;
                            e = this.m_SortedEdges;
                            while(e.NextInSEL !== null){
                                var eNext = e.NextInSEL;
                                var pt = new ClipperLib.IntPoint0();
                                if (e.Curr.X > eNext.Curr.X) {
                                    this.IntersectPoint(e, eNext, pt);
                                    if (pt.Y < topY) {
                                        pt = new ClipperLib.IntPoint2(ClipperLib.Clipper.TopX(e, topY), topY);
                                    }
                                    var newNode = new ClipperLib.IntersectNode();
                                    newNode.Edge1 = e;
                                    newNode.Edge2 = eNext;
                                    newNode.Pt.X = pt.X;
                                    newNode.Pt.Y = pt.Y;
                                    if (ClipperLib.use_xyz) {
                                        newNode.Pt.Z = pt.Z;
                                    }
                                    this.m_IntersectList.push(newNode);
                                    this.SwapPositionsInSEL(e, eNext);
                                    isModified = true;
                                } else {
                                    e = eNext;
                                }
                            }
                            if (e.PrevInSEL !== null) {
                                e.PrevInSEL.NextInSEL = null;
                            } else {
                                break;
                            }
                        }
                        this.m_SortedEdges = null;
                    };
                    ClipperLib.Clipper.prototype.EdgesAdjacent = function(inode) {
                        return inode.Edge1.NextInSEL === inode.Edge2 || inode.Edge1.PrevInSEL === inode.Edge2;
                    };
                    ClipperLib.Clipper.IntersectNodeSort = function(node1, node2) {
                        return node2.Pt.Y - node1.Pt.Y;
                    };
                    ClipperLib.Clipper.prototype.FixupIntersectionOrder = function() {
                        this.m_IntersectList.sort(this.m_IntersectNodeComparer);
                        this.CopyAELToSEL();
                        var cnt = this.m_IntersectList.length;
                        for(var i = 0; i < cnt; i++){
                            if (!this.EdgesAdjacent(this.m_IntersectList[i])) {
                                var j = i + 1;
                                while(j < cnt && !this.EdgesAdjacent(this.m_IntersectList[j])){
                                    j++;
                                }
                                if (j === cnt) {
                                    return false;
                                }
                                var tmp = this.m_IntersectList[i];
                                this.m_IntersectList[i] = this.m_IntersectList[j];
                                this.m_IntersectList[j] = tmp;
                            }
                            this.SwapPositionsInSEL(this.m_IntersectList[i].Edge1, this.m_IntersectList[i].Edge2);
                        }
                        return true;
                    };
                    ClipperLib.Clipper.prototype.ProcessIntersectList = function() {
                        for(var i = 0, ilen = this.m_IntersectList.length; i < ilen; i++){
                            var iNode = this.m_IntersectList[i];
                            this.IntersectEdges(iNode.Edge1, iNode.Edge2, iNode.Pt);
                            this.SwapPositionsInAEL(iNode.Edge1, iNode.Edge2);
                        }
                        this.m_IntersectList.length = 0;
                    };
                    var R1 = function(a) {
                        return a < 0 ? Math.ceil(a - 0.5) : Math.round(a);
                    };
                    var R2 = function(a) {
                        return a < 0 ? Math.ceil(a - 0.5) : Math.floor(a + 0.5);
                    };
                    var R3 = function(a) {
                        return a < 0 ? -Math.round(Math.abs(a)) : Math.round(a);
                    };
                    var R4 = function(a) {
                        if (a < 0) {
                            a -= 0.5;
                            return a < -2147483648 ? Math.ceil(a) : a | 0;
                        } else {
                            a += 0.5;
                            return a > 2147483647 ? Math.floor(a) : a | 0;
                        }
                    };
                    if (browser.msie) {
                        ClipperLib.Clipper.Round = R1;
                    } else if (browser.chromium) {
                        ClipperLib.Clipper.Round = R3;
                    } else if (browser.safari) {
                        ClipperLib.Clipper.Round = R4;
                    } else {
                        ClipperLib.Clipper.Round = R2;
                    }
                    ClipperLib.Clipper.TopX = function(edge, currentY) {
                        if (currentY === edge.Top.Y) {
                            return edge.Top.X;
                        }
                        return edge.Bot.X + ClipperLib.Clipper.Round(edge.Dx * (currentY - edge.Bot.Y));
                    };
                    ClipperLib.Clipper.prototype.IntersectPoint = function(edge1, edge2, ip) {
                        ip.X = 0;
                        ip.Y = 0;
                        var b1, b2;
                        if (edge1.Dx === edge2.Dx) {
                            ip.Y = edge1.Curr.Y;
                            ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
                            return;
                        }
                        if (edge1.Delta.X === 0) {
                            ip.X = edge1.Bot.X;
                            if (ClipperLib.ClipperBase.IsHorizontal(edge2)) {
                                ip.Y = edge2.Bot.Y;
                            } else {
                                b2 = edge2.Bot.Y - edge2.Bot.X / edge2.Dx;
                                ip.Y = ClipperLib.Clipper.Round(ip.X / edge2.Dx + b2);
                            }
                        } else if (edge2.Delta.X === 0) {
                            ip.X = edge2.Bot.X;
                            if (ClipperLib.ClipperBase.IsHorizontal(edge1)) {
                                ip.Y = edge1.Bot.Y;
                            } else {
                                b1 = edge1.Bot.Y - edge1.Bot.X / edge1.Dx;
                                ip.Y = ClipperLib.Clipper.Round(ip.X / edge1.Dx + b1);
                            }
                        } else {
                            b1 = edge1.Bot.X - edge1.Bot.Y * edge1.Dx;
                            b2 = edge2.Bot.X - edge2.Bot.Y * edge2.Dx;
                            var q = (b2 - b1) / (edge1.Dx - edge2.Dx);
                            ip.Y = ClipperLib.Clipper.Round(q);
                            if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) {
                                ip.X = ClipperLib.Clipper.Round(edge1.Dx * q + b1);
                            } else {
                                ip.X = ClipperLib.Clipper.Round(edge2.Dx * q + b2);
                            }
                        }
                        if (ip.Y < edge1.Top.Y || ip.Y < edge2.Top.Y) {
                            if (edge1.Top.Y > edge2.Top.Y) {
                                ip.Y = edge1.Top.Y;
                                ip.X = ClipperLib.Clipper.TopX(edge2, edge1.Top.Y);
                                return ip.X < edge1.Top.X;
                            } else {
                                ip.Y = edge2.Top.Y;
                            }
                            if (Math.abs(edge1.Dx) < Math.abs(edge2.Dx)) {
                                ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
                            } else {
                                ip.X = ClipperLib.Clipper.TopX(edge2, ip.Y);
                            }
                        }
                        if (ip.Y > edge1.Curr.Y) {
                            ip.Y = edge1.Curr.Y;
                            if (Math.abs(edge1.Dx) > Math.abs(edge2.Dx)) {
                                ip.X = ClipperLib.Clipper.TopX(edge2, ip.Y);
                            } else {
                                ip.X = ClipperLib.Clipper.TopX(edge1, ip.Y);
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.ProcessEdgesAtTopOfScanbeam = function(topY) {
                        var e = this.m_ActiveEdges;
                        while(e !== null){
                            var IsMaximaEdge = this.IsMaxima(e, topY);
                            if (IsMaximaEdge) {
                                var eMaxPair = this.GetMaximaPairEx(e);
                                IsMaximaEdge = eMaxPair === null || !ClipperLib.ClipperBase.IsHorizontal(eMaxPair);
                            }
                            if (IsMaximaEdge) {
                                if (this.StrictlySimple) {
                                    this.InsertMaxima(e.Top.X);
                                }
                                var ePrev = e.PrevInAEL;
                                this.DoMaxima(e);
                                if (ePrev === null) {
                                    e = this.m_ActiveEdges;
                                } else {
                                    e = ePrev.NextInAEL;
                                }
                            } else {
                                if (this.IsIntermediate(e, topY) && ClipperLib.ClipperBase.IsHorizontal(e.NextInLML)) {
                                    e = this.UpdateEdgeIntoAEL(e);
                                    if (e.OutIdx >= 0) {
                                        this.AddOutPt(e, e.Bot);
                                    }
                                    this.AddEdgeToSEL(e);
                                } else {
                                    e.Curr.X = ClipperLib.Clipper.TopX(e, topY);
                                    e.Curr.Y = topY;
                                }
                                if (ClipperLib.use_xyz) {
                                    if (e.Top.Y === topY) {
                                        e.Curr.Z = e.Top.Z;
                                    } else if (e.Bot.Y === topY) {
                                        e.Curr.Z = e.Bot.Z;
                                    } else {
                                        e.Curr.Z = 0;
                                    }
                                }
                                if (this.StrictlySimple) {
                                    var ePrev = e.PrevInAEL;
                                    if (e.OutIdx >= 0 && e.WindDelta !== 0 && ePrev !== null && ePrev.OutIdx >= 0 && ePrev.Curr.X === e.Curr.X && ePrev.WindDelta !== 0) {
                                        var ip = new ClipperLib.IntPoint1(e.Curr);
                                        if (ClipperLib.use_xyz) {
                                            this.SetZ(ip, ePrev, e);
                                        }
                                        var op = this.AddOutPt(ePrev, ip);
                                        var op2 = this.AddOutPt(e, ip);
                                        this.AddJoin(op, op2, ip);
                                    }
                                }
                                e = e.NextInAEL;
                            }
                        }
                        this.ProcessHorizontals();
                        this.m_Maxima = null;
                        e = this.m_ActiveEdges;
                        while(e !== null){
                            if (this.IsIntermediate(e, topY)) {
                                var op = null;
                                if (e.OutIdx >= 0) {
                                    op = this.AddOutPt(e, e.Top);
                                }
                                e = this.UpdateEdgeIntoAEL(e);
                                var ePrev = e.PrevInAEL;
                                var eNext = e.NextInAEL;
                                if (ePrev !== null && ePrev.Curr.X === e.Bot.X && ePrev.Curr.Y === e.Bot.Y && op !== null && ePrev.OutIdx >= 0 && ePrev.Curr.Y === ePrev.Top.Y && ClipperLib.ClipperBase.SlopesEqual5(e.Curr, e.Top, ePrev.Curr, ePrev.Top, this.m_UseFullRange) && e.WindDelta !== 0 && ePrev.WindDelta !== 0) {
                                    var op2 = this.AddOutPt(ePrev2, e.Bot);
                                    this.AddJoin(op, op2, e.Top);
                                } else if (eNext !== null && eNext.Curr.X === e.Bot.X && eNext.Curr.Y === e.Bot.Y && op !== null && eNext.OutIdx >= 0 && eNext.Curr.Y === eNext.Top.Y && ClipperLib.ClipperBase.SlopesEqual5(e.Curr, e.Top, eNext.Curr, eNext.Top, this.m_UseFullRange) && e.WindDelta !== 0 && eNext.WindDelta !== 0) {
                                    var op2 = this.AddOutPt(eNext, e.Bot);
                                    this.AddJoin(op, op2, e.Top);
                                }
                            }
                            e = e.NextInAEL;
                        }
                    };
                    ClipperLib.Clipper.prototype.DoMaxima = function(e) {
                        var eMaxPair = this.GetMaximaPairEx(e);
                        if (eMaxPair === null) {
                            if (e.OutIdx >= 0) {
                                this.AddOutPt(e, e.Top);
                            }
                            this.DeleteFromAEL(e);
                            return;
                        }
                        var eNext = e.NextInAEL;
                        while(eNext !== null && eNext !== eMaxPair){
                            this.IntersectEdges(e, eNext, e.Top);
                            this.SwapPositionsInAEL(e, eNext);
                            eNext = e.NextInAEL;
                        }
                        if (e.OutIdx === -1 && eMaxPair.OutIdx === -1) {
                            this.DeleteFromAEL(e);
                            this.DeleteFromAEL(eMaxPair);
                        } else if (e.OutIdx >= 0 && eMaxPair.OutIdx >= 0) {
                            if (e.OutIdx >= 0) {
                                this.AddLocalMaxPoly(e, eMaxPair, e.Top);
                            }
                            this.DeleteFromAEL(e);
                            this.DeleteFromAEL(eMaxPair);
                        } else if (ClipperLib.use_lines && e.WindDelta === 0) {
                            if (e.OutIdx >= 0) {
                                this.AddOutPt(e, e.Top);
                                e.OutIdx = ClipperLib.ClipperBase.Unassigned;
                            }
                            this.DeleteFromAEL(e);
                            if (eMaxPair.OutIdx >= 0) {
                                this.AddOutPt(eMaxPair, e.Top);
                                eMaxPair.OutIdx = ClipperLib.ClipperBase.Unassigned;
                            }
                            this.DeleteFromAEL(eMaxPair);
                        } else {
                            ClipperLib.Error("DoMaxima error");
                        }
                    };
                    ClipperLib.Clipper.ReversePaths = function(polys) {
                        for(var i = 0, len = polys.length; i < len; i++){
                            polys[i].reverse();
                        }
                    };
                    ClipperLib.Clipper.Orientation = function(poly) {
                        return ClipperLib.Clipper.Area(poly) >= 0;
                    };
                    ClipperLib.Clipper.prototype.PointCount = function(pts) {
                        if (pts === null) {
                            return 0;
                        }
                        var result = 0;
                        var p = pts;
                        do {
                            result++;
                            p = p.Next;
                        }while (p !== pts)
                        return result;
                    };
                    ClipperLib.Clipper.prototype.BuildResult = function(polyg) {
                        ClipperLib.Clear(polyg);
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            var outRec = this.m_PolyOuts[i];
                            if (outRec.Pts === null) {
                                continue;
                            }
                            var p = outRec.Pts.Prev;
                            var cnt = this.PointCount(p);
                            if (cnt < 2) {
                                continue;
                            }
                            var pg = new Array(cnt);
                            for(var j = 0; j < cnt; j++){
                                pg[j] = p.Pt;
                                p = p.Prev;
                            }
                            polyg.push(pg);
                        }
                    };
                    ClipperLib.Clipper.prototype.BuildResult2 = function(polytree) {
                        polytree.Clear();
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            var outRec = this.m_PolyOuts[i];
                            var cnt = this.PointCount(outRec.Pts);
                            if (outRec.IsOpen && cnt < 2 || !outRec.IsOpen && cnt < 3) {
                                continue;
                            }
                            this.FixHoleLinkage(outRec);
                            var pn = new ClipperLib.PolyNode();
                            polytree.m_AllPolys.push(pn);
                            outRec.PolyNode = pn;
                            pn.m_polygon.length = cnt;
                            var op = outRec.Pts.Prev;
                            for(var j = 0; j < cnt; j++){
                                pn.m_polygon[j] = op.Pt;
                                op = op.Prev;
                            }
                        }
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            var outRec = this.m_PolyOuts[i];
                            if (outRec.PolyNode === null) {
                                continue;
                            } else if (outRec.IsOpen) {
                                outRec.PolyNode.IsOpen = true;
                                polytree.AddChild(outRec.PolyNode);
                            } else if (outRec.FirstLeft !== null && outRec.FirstLeft.PolyNode !== null) {
                                outRec.FirstLeft.PolyNode.AddChild(outRec.PolyNode);
                            } else {
                                polytree.AddChild(outRec.PolyNode);
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.FixupOutPolyline = function(outRec) {
                        var pp = outRec.Pts;
                        var lastPP = pp.Prev;
                        while(pp !== lastPP){
                            pp = pp.Next;
                            if (ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Prev.Pt)) {
                                if (pp === lastPP) {
                                    lastPP = pp.Prev;
                                }
                                var tmpPP = pp.Prev;
                                tmpPP.Next = pp.Next;
                                pp.Next.Prev = tmpPP;
                                pp = tmpPP;
                            }
                        }
                        if (pp === pp.Prev) {
                            outRec.Pts = null;
                        }
                    };
                    ClipperLib.Clipper.prototype.FixupOutPolygon = function(outRec) {
                        var lastOK = null;
                        outRec.BottomPt = null;
                        var pp = outRec.Pts;
                        var preserveCol = this.PreserveCollinear || this.StrictlySimple;
                        for(;;){
                            if (pp.Prev === pp || pp.Prev === pp.Next) {
                                outRec.Pts = null;
                                return;
                            }
                            if (ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Next.Pt) || ClipperLib.IntPoint.op_Equality(pp.Pt, pp.Prev.Pt) || ClipperLib.ClipperBase.SlopesEqual4(pp.Prev.Pt, pp.Pt, pp.Next.Pt, this.m_UseFullRange) && (!preserveCol || !this.Pt2IsBetweenPt1AndPt3(pp.Prev.Pt, pp.Pt, pp.Next.Pt))) {
                                lastOK = null;
                                pp.Prev.Next = pp.Next;
                                pp.Next.Prev = pp.Prev;
                                pp = pp.Prev;
                            } else if (pp === lastOK) {
                                break;
                            } else {
                                if (lastOK === null) {
                                    lastOK = pp;
                                }
                                pp = pp.Next;
                            }
                        }
                        outRec.Pts = pp;
                    };
                    ClipperLib.Clipper.prototype.DupOutPt = function(outPt, InsertAfter) {
                        var result = new ClipperLib.OutPt();
                        result.Pt.X = outPt.Pt.X;
                        result.Pt.Y = outPt.Pt.Y;
                        if (ClipperLib.use_xyz) {
                            result.Pt.Z = outPt.Pt.Z;
                        }
                        result.Idx = outPt.Idx;
                        if (InsertAfter) {
                            result.Next = outPt.Next;
                            result.Prev = outPt;
                            outPt.Next.Prev = result;
                            outPt.Next = result;
                        } else {
                            result.Prev = outPt.Prev;
                            result.Next = outPt;
                            outPt.Prev.Next = result;
                            outPt.Prev = result;
                        }
                        return result;
                    };
                    ClipperLib.Clipper.prototype.GetOverlap = function(a1, a2, b1, b2, $val) {
                        if (a1 < a2) {
                            if (b1 < b2) {
                                $val.Left = Math.max(a1, b1);
                                $val.Right = Math.min(a2, b2);
                            } else {
                                $val.Left = Math.max(a1, b2);
                                $val.Right = Math.min(a2, b1);
                            }
                        } else {
                            if (b1 < b2) {
                                $val.Left = Math.max(a2, b1);
                                $val.Right = Math.min(a1, b2);
                            } else {
                                $val.Left = Math.max(a2, b2);
                                $val.Right = Math.min(a1, b1);
                            }
                        }
                        return $val.Left < $val.Right;
                    };
                    ClipperLib.Clipper.prototype.JoinHorz = function(op1, op1b, op2, op2b, Pt, DiscardLeft) {
                        var Dir1 = op1.Pt.X > op1b.Pt.X ? ClipperLib.Direction.dRightToLeft : ClipperLib.Direction.dLeftToRight;
                        var Dir2 = op2.Pt.X > op2b.Pt.X ? ClipperLib.Direction.dRightToLeft : ClipperLib.Direction.dLeftToRight;
                        if (Dir1 === Dir2) {
                            return false;
                        }
                        if (Dir1 === ClipperLib.Direction.dLeftToRight) {
                            while(op1.Next.Pt.X <= Pt.X && op1.Next.Pt.X >= op1.Pt.X && op1.Next.Pt.Y === Pt.Y){
                                op1 = op1.Next;
                            }
                            if (DiscardLeft && op1.Pt.X !== Pt.X) {
                                op1 = op1.Next;
                            }
                            op1b = this.DupOutPt(op1, !DiscardLeft);
                            if (ClipperLib.IntPoint.op_Inequality(op1b.Pt, Pt)) {
                                op1 = op1b;
                                op1.Pt.X = Pt.X;
                                op1.Pt.Y = Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    op1.Pt.Z = Pt.Z;
                                }
                                op1b = this.DupOutPt(op1, !DiscardLeft);
                            }
                        } else {
                            while(op1.Next.Pt.X >= Pt.X && op1.Next.Pt.X <= op1.Pt.X && op1.Next.Pt.Y === Pt.Y){
                                op1 = op1.Next;
                            }
                            if (!DiscardLeft && op1.Pt.X !== Pt.X) {
                                op1 = op1.Next;
                            }
                            op1b = this.DupOutPt(op1, DiscardLeft);
                            if (ClipperLib.IntPoint.op_Inequality(op1b.Pt, Pt)) {
                                op1 = op1b;
                                op1.Pt.X = Pt.X;
                                op1.Pt.Y = Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    op1.Pt.Z = Pt.Z;
                                }
                                op1b = this.DupOutPt(op1, DiscardLeft);
                            }
                        }
                        if (Dir2 === ClipperLib.Direction.dLeftToRight) {
                            while(op2.Next.Pt.X <= Pt.X && op2.Next.Pt.X >= op2.Pt.X && op2.Next.Pt.Y === Pt.Y){
                                op2 = op2.Next;
                            }
                            if (DiscardLeft && op2.Pt.X !== Pt.X) {
                                op2 = op2.Next;
                            }
                            op2b = this.DupOutPt(op2, !DiscardLeft);
                            if (ClipperLib.IntPoint.op_Inequality(op2b.Pt, Pt)) {
                                op2 = op2b;
                                op2.Pt.X = Pt.X;
                                op2.Pt.Y = Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    op2.Pt.Z = Pt.Z;
                                }
                                op2b = this.DupOutPt(op2, !DiscardLeft);
                            }
                        } else {
                            while(op2.Next.Pt.X >= Pt.X && op2.Next.Pt.X <= op2.Pt.X && op2.Next.Pt.Y === Pt.Y){
                                op2 = op2.Next;
                            }
                            if (!DiscardLeft && op2.Pt.X !== Pt.X) {
                                op2 = op2.Next;
                            }
                            op2b = this.DupOutPt(op2, DiscardLeft);
                            if (ClipperLib.IntPoint.op_Inequality(op2b.Pt, Pt)) {
                                op2 = op2b;
                                op2.Pt.X = Pt.X;
                                op2.Pt.Y = Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    op2.Pt.Z = Pt.Z;
                                }
                                op2b = this.DupOutPt(op2, DiscardLeft);
                            }
                        }
                        if (Dir1 === ClipperLib.Direction.dLeftToRight === DiscardLeft) {
                            op1.Prev = op2;
                            op2.Next = op1;
                            op1b.Next = op2b;
                            op2b.Prev = op1b;
                        } else {
                            op1.Next = op2;
                            op2.Prev = op1;
                            op1b.Prev = op2b;
                            op2b.Next = op1b;
                        }
                        return true;
                    };
                    ClipperLib.Clipper.prototype.JoinPoints = function(j, outRec1, outRec2) {
                        var op1 = j.OutPt1, op1b = new ClipperLib.OutPt();
                        var op2 = j.OutPt2, op2b = new ClipperLib.OutPt();
                        var isHorizontal = j.OutPt1.Pt.Y === j.OffPt.Y;
                        if (isHorizontal && ClipperLib.IntPoint.op_Equality(j.OffPt, j.OutPt1.Pt) && ClipperLib.IntPoint.op_Equality(j.OffPt, j.OutPt2.Pt)) {
                            if (outRec1 !== outRec2) {
                                return false;
                            }
                            op1b = j.OutPt1.Next;
                            while(op1b !== op1 && ClipperLib.IntPoint.op_Equality(op1b.Pt, j.OffPt)){
                                op1b = op1b.Next;
                            }
                            var reverse1 = op1b.Pt.Y > j.OffPt.Y;
                            op2b = j.OutPt2.Next;
                            while(op2b !== op2 && ClipperLib.IntPoint.op_Equality(op2b.Pt, j.OffPt)){
                                op2b = op2b.Next;
                            }
                            var reverse2 = op2b.Pt.Y > j.OffPt.Y;
                            if (reverse1 === reverse2) {
                                return false;
                            }
                            if (reverse1) {
                                op1b = this.DupOutPt(op1, false);
                                op2b = this.DupOutPt(op2, true);
                                op1.Prev = op2;
                                op2.Next = op1;
                                op1b.Next = op2b;
                                op2b.Prev = op1b;
                                j.OutPt1 = op1;
                                j.OutPt2 = op1b;
                                return true;
                            } else {
                                op1b = this.DupOutPt(op1, true);
                                op2b = this.DupOutPt(op2, false);
                                op1.Next = op2;
                                op2.Prev = op1;
                                op1b.Prev = op2b;
                                op2b.Next = op1b;
                                j.OutPt1 = op1;
                                j.OutPt2 = op1b;
                                return true;
                            }
                        } else if (isHorizontal) {
                            op1b = op1;
                            while(op1.Prev.Pt.Y === op1.Pt.Y && op1.Prev !== op1b && op1.Prev !== op2){
                                op1 = op1.Prev;
                            }
                            while(op1b.Next.Pt.Y === op1b.Pt.Y && op1b.Next !== op1 && op1b.Next !== op2){
                                op1b = op1b.Next;
                            }
                            if (op1b.Next === op1 || op1b.Next === op2) {
                                return false;
                            }
                            op2b = op2;
                            while(op2.Prev.Pt.Y === op2.Pt.Y && op2.Prev !== op2b && op2.Prev !== op1b){
                                op2 = op2.Prev;
                            }
                            while(op2b.Next.Pt.Y === op2b.Pt.Y && op2b.Next !== op2 && op2b.Next !== op1){
                                op2b = op2b.Next;
                            }
                            if (op2b.Next === op2 || op2b.Next === op1) {
                                return false;
                            }
                            var $val = {
                                Left: null,
                                Right: null
                            };
                            if (!this.GetOverlap(op1.Pt.X, op1b.Pt.X, op2.Pt.X, op2b.Pt.X, $val)) {
                                return false;
                            }
                            var Left = $val.Left;
                            var Right = $val.Right;
                            var Pt = new ClipperLib.IntPoint0();
                            var DiscardLeftSide;
                            if (op1.Pt.X >= Left && op1.Pt.X <= Right) {
                                Pt.X = op1.Pt.X;
                                Pt.Y = op1.Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    Pt.Z = op1.Pt.Z;
                                }
                                DiscardLeftSide = op1.Pt.X > op1b.Pt.X;
                            } else if (op2.Pt.X >= Left && op2.Pt.X <= Right) {
                                Pt.X = op2.Pt.X;
                                Pt.Y = op2.Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    Pt.Z = op2.Pt.Z;
                                }
                                DiscardLeftSide = op2.Pt.X > op2b.Pt.X;
                            } else if (op1b.Pt.X >= Left && op1b.Pt.X <= Right) {
                                Pt.X = op1b.Pt.X;
                                Pt.Y = op1b.Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    Pt.Z = op1b.Pt.Z;
                                }
                                DiscardLeftSide = op1b.Pt.X > op1.Pt.X;
                            } else {
                                Pt.X = op2b.Pt.X;
                                Pt.Y = op2b.Pt.Y;
                                if (ClipperLib.use_xyz) {
                                    Pt.Z = op2b.Pt.Z;
                                }
                                DiscardLeftSide = op2b.Pt.X > op2.Pt.X;
                            }
                            j.OutPt1 = op1;
                            j.OutPt2 = op2;
                            return this.JoinHorz(op1, op1b, op2, op2b, Pt, DiscardLeftSide);
                        } else {
                            op1b = op1.Next;
                            while(ClipperLib.IntPoint.op_Equality(op1b.Pt, op1.Pt) && op1b !== op1){
                                op1b = op1b.Next;
                            }
                            var Reverse1 = op1b.Pt.Y > op1.Pt.Y || !ClipperLib.ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange);
                            if (Reverse1) {
                                op1b = op1.Prev;
                                while(ClipperLib.IntPoint.op_Equality(op1b.Pt, op1.Pt) && op1b !== op1){
                                    op1b = op1b.Prev;
                                }
                                if (op1b.Pt.Y > op1.Pt.Y || !ClipperLib.ClipperBase.SlopesEqual4(op1.Pt, op1b.Pt, j.OffPt, this.m_UseFullRange)) {
                                    return false;
                                }
                            }
                            op2b = op2.Next;
                            while(ClipperLib.IntPoint.op_Equality(op2b.Pt, op2.Pt) && op2b !== op2){
                                op2b = op2b.Next;
                            }
                            var Reverse2 = op2b.Pt.Y > op2.Pt.Y || !ClipperLib.ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange);
                            if (Reverse2) {
                                op2b = op2.Prev;
                                while(ClipperLib.IntPoint.op_Equality(op2b.Pt, op2.Pt) && op2b !== op2){
                                    op2b = op2b.Prev;
                                }
                                if (op2b.Pt.Y > op2.Pt.Y || !ClipperLib.ClipperBase.SlopesEqual4(op2.Pt, op2b.Pt, j.OffPt, this.m_UseFullRange)) {
                                    return false;
                                }
                            }
                            if (op1b === op1 || op2b === op2 || op1b === op2b || outRec1 === outRec2 && Reverse1 === Reverse2) {
                                return false;
                            }
                            if (Reverse1) {
                                op1b = this.DupOutPt(op1, false);
                                op2b = this.DupOutPt(op2, true);
                                op1.Prev = op2;
                                op2.Next = op1;
                                op1b.Next = op2b;
                                op2b.Prev = op1b;
                                j.OutPt1 = op1;
                                j.OutPt2 = op1b;
                                return true;
                            } else {
                                op1b = this.DupOutPt(op1, true);
                                op2b = this.DupOutPt(op2, false);
                                op1.Next = op2;
                                op2.Prev = op1;
                                op1b.Prev = op2b;
                                op2b.Next = op1b;
                                j.OutPt1 = op1;
                                j.OutPt2 = op1b;
                                return true;
                            }
                        }
                    };
                    ClipperLib.Clipper.GetBounds = function(paths) {
                        var i = 0, cnt = paths.length;
                        while(i < cnt && paths[i].length === 0){
                            i++;
                        }
                        if (i === cnt) {
                            return new ClipperLib.IntRect(0, 0, 0, 0);
                        }
                        var result = new ClipperLib.IntRect();
                        result.left = paths[i][0].X;
                        result.right = result.left;
                        result.top = paths[i][0].Y;
                        result.bottom = result.top;
                        for(; i < cnt; i++){
                            for(var j = 0, jlen = paths[i].length; j < jlen; j++){
                                if (paths[i][j].X < result.left) {
                                    result.left = paths[i][j].X;
                                } else if (paths[i][j].X > result.right) {
                                    result.right = paths[i][j].X;
                                }
                                if (paths[i][j].Y < result.top) {
                                    result.top = paths[i][j].Y;
                                } else if (paths[i][j].Y > result.bottom) {
                                    result.bottom = paths[i][j].Y;
                                }
                            }
                        }
                        return result;
                    };
                    ClipperLib.Clipper.prototype.GetBounds2 = function(ops) {
                        var opStart = ops;
                        var result = new ClipperLib.IntRect();
                        result.left = ops.Pt.X;
                        result.right = ops.Pt.X;
                        result.top = ops.Pt.Y;
                        result.bottom = ops.Pt.Y;
                        ops = ops.Next;
                        while(ops !== opStart){
                            if (ops.Pt.X < result.left) {
                                result.left = ops.Pt.X;
                            }
                            if (ops.Pt.X > result.right) {
                                result.right = ops.Pt.X;
                            }
                            if (ops.Pt.Y < result.top) {
                                result.top = ops.Pt.Y;
                            }
                            if (ops.Pt.Y > result.bottom) {
                                result.bottom = ops.Pt.Y;
                            }
                            ops = ops.Next;
                        }
                        return result;
                    };
                    ClipperLib.Clipper.PointInPolygon = function(pt, path1) {
                        var result = 0, cnt = path1.length;
                        if (cnt < 3) {
                            return 0;
                        }
                        var ip = path1[0];
                        for(var i = 1; i <= cnt; ++i){
                            var ipNext = i === cnt ? path1[0] : path1[i];
                            if (ipNext.Y === pt.Y) {
                                if (ipNext.X === pt.X || ip.Y === pt.Y && ipNext.X > pt.X === ip.X < pt.X) {
                                    return -1;
                                }
                            }
                            if (ip.Y < pt.Y !== ipNext.Y < pt.Y) {
                                if (ip.X >= pt.X) {
                                    if (ipNext.X > pt.X) {
                                        result = 1 - result;
                                    } else {
                                        var d = (ip.X - pt.X) * (ipNext.Y - pt.Y) - (ipNext.X - pt.X) * (ip.Y - pt.Y);
                                        if (d === 0) {
                                            return -1;
                                        } else if (d > 0 === ipNext.Y > ip.Y) {
                                            result = 1 - result;
                                        }
                                    }
                                } else {
                                    if (ipNext.X > pt.X) {
                                        var d = (ip.X - pt.X) * (ipNext.Y - pt.Y) - (ipNext.X - pt.X) * (ip.Y - pt.Y);
                                        if (d === 0) {
                                            return -1;
                                        } else if (d > 0 === ipNext.Y > ip.Y) {
                                            result = 1 - result;
                                        }
                                    }
                                }
                            }
                            ip = ipNext;
                        }
                        return result;
                    };
                    ClipperLib.Clipper.prototype.PointInPolygon = function(pt, op) {
                        var result = 0;
                        var startOp = op;
                        var ptx = pt.X, pty = pt.Y;
                        var poly0x = op.Pt.X, poly0y = op.Pt.Y;
                        do {
                            op = op.Next;
                            var poly1x = op.Pt.X, poly1y = op.Pt.Y;
                            if (poly1y === pty) {
                                if (poly1x === ptx || poly0y === pty && poly1x > ptx === poly0x < ptx) {
                                    return -1;
                                }
                            }
                            if (poly0y < pty !== poly1y < pty) {
                                if (poly0x >= ptx) {
                                    if (poly1x > ptx) {
                                        result = 1 - result;
                                    } else {
                                        var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
                                        if (d === 0) {
                                            return -1;
                                        }
                                        if (d > 0 === poly1y > poly0y) {
                                            result = 1 - result;
                                        }
                                    }
                                } else {
                                    if (poly1x > ptx) {
                                        var d = (poly0x - ptx) * (poly1y - pty) - (poly1x - ptx) * (poly0y - pty);
                                        if (d === 0) {
                                            return -1;
                                        }
                                        if (d > 0 === poly1y > poly0y) {
                                            result = 1 - result;
                                        }
                                    }
                                }
                            }
                            poly0x = poly1x;
                            poly0y = poly1y;
                        }while (startOp !== op)
                        return result;
                    };
                    ClipperLib.Clipper.prototype.Poly2ContainsPoly1 = function(outPt1, outPt2) {
                        var op = outPt1;
                        do {
                            var res = this.PointInPolygon(op.Pt, outPt2);
                            if (res >= 0) {
                                return res > 0;
                            }
                            op = op.Next;
                        }while (op !== outPt1)
                        return true;
                    };
                    ClipperLib.Clipper.prototype.FixupFirstLefts1 = function(OldOutRec, NewOutRec) {
                        var outRec, firstLeft;
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            outRec = this.m_PolyOuts[i];
                            firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
                            if (outRec.Pts !== null && firstLeft === OldOutRec) {
                                if (this.Poly2ContainsPoly1(outRec.Pts, NewOutRec.Pts)) {
                                    outRec.FirstLeft = NewOutRec;
                                }
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.FixupFirstLefts2 = function(innerOutRec, outerOutRec) {
                        var orfl = outerOutRec.FirstLeft;
                        var outRec, firstLeft;
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            outRec = this.m_PolyOuts[i];
                            if (outRec.Pts === null || outRec === outerOutRec || outRec === innerOutRec) {
                                continue;
                            }
                            firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
                            if (firstLeft !== orfl && firstLeft !== innerOutRec && firstLeft !== outerOutRec) {
                                continue;
                            }
                            if (this.Poly2ContainsPoly1(outRec.Pts, innerOutRec.Pts)) {
                                outRec.FirstLeft = innerOutRec;
                            } else if (this.Poly2ContainsPoly1(outRec.Pts, outerOutRec.Pts)) {
                                outRec.FirstLeft = outerOutRec;
                            } else if (outRec.FirstLeft === innerOutRec || outRec.FirstLeft === outerOutRec) {
                                outRec.FirstLeft = orfl;
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.FixupFirstLefts3 = function(OldOutRec, NewOutRec) {
                        var outRec;
                        var firstLeft;
                        for(var i = 0, ilen = this.m_PolyOuts.length; i < ilen; i++){
                            outRec = this.m_PolyOuts[i];
                            firstLeft = ClipperLib.Clipper.ParseFirstLeft(outRec.FirstLeft);
                            if (outRec.Pts !== null && firstLeft === OldOutRec) {
                                outRec.FirstLeft = NewOutRec;
                            }
                        }
                    };
                    ClipperLib.Clipper.ParseFirstLeft = function(FirstLeft) {
                        while(FirstLeft !== null && FirstLeft.Pts === null){
                            FirstLeft = FirstLeft.FirstLeft;
                        }
                        return FirstLeft;
                    };
                    ClipperLib.Clipper.prototype.JoinCommonEdges = function() {
                        for(var i = 0, ilen = this.m_Joins.length; i < ilen; i++){
                            var join = this.m_Joins[i];
                            var outRec1 = this.GetOutRec(join.OutPt1.Idx);
                            var outRec2 = this.GetOutRec(join.OutPt2.Idx);
                            if (outRec1.Pts === null || outRec2.Pts === null) {
                                continue;
                            }
                            if (outRec1.IsOpen || outRec2.IsOpen) {
                                continue;
                            }
                            var holeStateRec;
                            if (outRec1 === outRec2) {
                                holeStateRec = outRec1;
                            } else if (this.OutRec1RightOfOutRec2(outRec1, outRec2)) {
                                holeStateRec = outRec2;
                            } else if (this.OutRec1RightOfOutRec2(outRec2, outRec1)) {
                                holeStateRec = outRec1;
                            } else {
                                holeStateRec = this.GetLowermostRec(outRec1, outRec2);
                            }
                            if (!this.JoinPoints(join, outRec1, outRec2)) {
                                continue;
                            }
                            if (outRec1 === outRec2) {
                                outRec1.Pts = join.OutPt1;
                                outRec1.BottomPt = null;
                                outRec2 = this.CreateOutRec();
                                outRec2.Pts = join.OutPt2;
                                this.UpdateOutPtIdxs(outRec2);
                                if (this.Poly2ContainsPoly1(outRec2.Pts, outRec1.Pts)) {
                                    outRec2.IsHole = !outRec1.IsHole;
                                    outRec2.FirstLeft = outRec1;
                                    if (this.m_UsingPolyTree) {
                                        this.FixupFirstLefts2(outRec2, outRec1);
                                    }
                                    if ((outRec2.IsHole ^ this.ReverseSolution) == this.Area$1(outRec2) > 0) {
                                        this.ReversePolyPtLinks(outRec2.Pts);
                                    }
                                } else if (this.Poly2ContainsPoly1(outRec1.Pts, outRec2.Pts)) {
                                    outRec2.IsHole = outRec1.IsHole;
                                    outRec1.IsHole = !outRec2.IsHole;
                                    outRec2.FirstLeft = outRec1.FirstLeft;
                                    outRec1.FirstLeft = outRec2;
                                    if (this.m_UsingPolyTree) {
                                        this.FixupFirstLefts2(outRec1, outRec2);
                                    }
                                    if ((outRec1.IsHole ^ this.ReverseSolution) == this.Area$1(outRec1) > 0) {
                                        this.ReversePolyPtLinks(outRec1.Pts);
                                    }
                                } else {
                                    outRec2.IsHole = outRec1.IsHole;
                                    outRec2.FirstLeft = outRec1.FirstLeft;
                                    if (this.m_UsingPolyTree) {
                                        this.FixupFirstLefts1(outRec1, outRec2);
                                    }
                                }
                            } else {
                                outRec2.Pts = null;
                                outRec2.BottomPt = null;
                                outRec2.Idx = outRec1.Idx;
                                outRec1.IsHole = holeStateRec.IsHole;
                                if (holeStateRec === outRec2) {
                                    outRec1.FirstLeft = outRec2.FirstLeft;
                                }
                                outRec2.FirstLeft = outRec1;
                                if (this.m_UsingPolyTree) {
                                    this.FixupFirstLefts3(outRec2, outRec1);
                                }
                            }
                        }
                    };
                    ClipperLib.Clipper.prototype.UpdateOutPtIdxs = function(outrec) {
                        var op = outrec.Pts;
                        do {
                            op.Idx = outrec.Idx;
                            op = op.Prev;
                        }while (op !== outrec.Pts)
                    };
                    ClipperLib.Clipper.prototype.DoSimplePolygons = function() {
                        var i = 0;
                        while(i < this.m_PolyOuts.length){
                            var outrec = this.m_PolyOuts[i++];
                            var op = outrec.Pts;
                            if (op === null || outrec.IsOpen) {
                                continue;
                            }
                            do {
                                var op2 = op.Next;
                                while(op2 !== outrec.Pts){
                                    if (ClipperLib.IntPoint.op_Equality(op.Pt, op2.Pt) && op2.Next !== op && op2.Prev !== op) {
                                        var op3 = op.Prev;
                                        var op4 = op2.Prev;
                                        op.Prev = op4;
                                        op4.Next = op;
                                        op2.Prev = op3;
                                        op3.Next = op2;
                                        outrec.Pts = op;
                                        var outrec2 = this.CreateOutRec();
                                        outrec2.Pts = op2;
                                        this.UpdateOutPtIdxs(outrec2);
                                        if (this.Poly2ContainsPoly1(outrec2.Pts, outrec.Pts)) {
                                            outrec2.IsHole = !outrec.IsHole;
                                            outrec2.FirstLeft = outrec;
                                            if (this.m_UsingPolyTree) {
                                                this.FixupFirstLefts2(outrec2, outrec);
                                            }
                                        } else if (this.Poly2ContainsPoly1(outrec.Pts, outrec2.Pts)) {
                                            outrec2.IsHole = outrec.IsHole;
                                            outrec.IsHole = !outrec2.IsHole;
                                            outrec2.FirstLeft = outrec.FirstLeft;
                                            outrec.FirstLeft = outrec2;
                                            if (this.m_UsingPolyTree) {
                                                this.FixupFirstLefts2(outrec, outrec2);
                                            }
                                        } else {
                                            outrec2.IsHole = outrec.IsHole;
                                            outrec2.FirstLeft = outrec.FirstLeft;
                                            if (this.m_UsingPolyTree) {
                                                this.FixupFirstLefts1(outrec, outrec2);
                                            }
                                        }
                                        op2 = op;
                                    }
                                    op2 = op2.Next;
                                }
                                op = op.Next;
                            }while (op !== outrec.Pts)
                        }
                    };
                    ClipperLib.Clipper.Area = function(poly) {
                        if (!Array.isArray(poly)) {
                            return 0;
                        }
                        var cnt = poly.length;
                        if (cnt < 3) {
                            return 0;
                        }
                        var a = 0;
                        for(var i = 0, j = cnt - 1; i < cnt; ++i){
                            a += (poly[j].X + poly[i].X) * (poly[j].Y - poly[i].Y);
                            j = i;
                        }
                        return -a * 0.5;
                    };
                    ClipperLib.Clipper.prototype.Area = function(op) {
                        var opFirst = op;
                        if (op === null) {
                            return 0;
                        }
                        var a = 0;
                        do {
                            a = a + (op.Prev.Pt.X + op.Pt.X) * (op.Prev.Pt.Y - op.Pt.Y);
                            op = op.Next;
                        }while (op !== opFirst)
                        return a * 0.5;
                    };
                    ClipperLib.Clipper.prototype.Area$1 = function(outRec) {
                        return this.Area(outRec.Pts);
                    };
                    ClipperLib.Clipper.SimplifyPolygon = function(poly, fillType) {
                        var result = new Array();
                        var c = new ClipperLib.Clipper(0);
                        c.StrictlySimple = true;
                        c.AddPath(poly, ClipperLib.PolyType.ptSubject, true);
                        c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
                        return result;
                    };
                    ClipperLib.Clipper.SimplifyPolygons = function(polys, fillType) {
                        if (typeof fillType === "undefined") {
                            fillType = ClipperLib.PolyFillType.pftEvenOdd;
                        }
                        var result = new Array();
                        var c = new ClipperLib.Clipper(0);
                        c.StrictlySimple = true;
                        c.AddPaths(polys, ClipperLib.PolyType.ptSubject, true);
                        c.Execute(ClipperLib.ClipType.ctUnion, result, fillType, fillType);
                        return result;
                    };
                    ClipperLib.Clipper.DistanceSqrd = function(pt1, pt2) {
                        var dx = pt1.X - pt2.X;
                        var dy = pt1.Y - pt2.Y;
                        return dx * dx + dy * dy;
                    };
                    ClipperLib.Clipper.DistanceFromLineSqrd = function(pt, ln1, ln2) {
                        var A = ln1.Y - ln2.Y;
                        var B = ln2.X - ln1.X;
                        var C = A * ln1.X + B * ln1.Y;
                        C = A * pt.X + B * pt.Y - C;
                        return C * C / (A * A + B * B);
                    };
                    ClipperLib.Clipper.SlopesNearCollinear = function(pt1, pt2, pt3, distSqrd) {
                        if (Math.abs(pt1.X - pt2.X) > Math.abs(pt1.Y - pt2.Y)) {
                            if (pt1.X > pt2.X === pt1.X < pt3.X) {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
                            } else if (pt2.X > pt1.X === pt2.X < pt3.X) {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
                            } else {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
                            }
                        } else {
                            if (pt1.Y > pt2.Y === pt1.Y < pt3.Y) {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt1, pt2, pt3) < distSqrd;
                            } else if (pt2.Y > pt1.Y === pt2.Y < pt3.Y) {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt2, pt1, pt3) < distSqrd;
                            } else {
                                return ClipperLib.Clipper.DistanceFromLineSqrd(pt3, pt1, pt2) < distSqrd;
                            }
                        }
                    };
                    ClipperLib.Clipper.PointsAreClose = function(pt1, pt2, distSqrd) {
                        var dx = pt1.X - pt2.X;
                        var dy = pt1.Y - pt2.Y;
                        return dx * dx + dy * dy <= distSqrd;
                    };
                    ClipperLib.Clipper.ExcludeOp = function(op) {
                        var result = op.Prev;
                        result.Next = op.Next;
                        op.Next.Prev = result;
                        result.Idx = 0;
                        return result;
                    };
                    ClipperLib.Clipper.CleanPolygon = function(path1, distance) {
                        if (typeof distance === "undefined") {
                            distance = 1.415;
                        }
                        var cnt = path1.length;
                        if (cnt === 0) {
                            return new Array();
                        }
                        var outPts = new Array(cnt);
                        for(var i = 0; i < cnt; ++i){
                            outPts[i] = new ClipperLib.OutPt();
                        }
                        for(var i = 0; i < cnt; ++i){
                            outPts[i].Pt = path1[i];
                            outPts[i].Next = outPts[(i + 1) % cnt];
                            outPts[i].Next.Prev = outPts[i];
                            outPts[i].Idx = 0;
                        }
                        var distSqrd = distance * distance;
                        var op = outPts[0];
                        while(op.Idx === 0 && op.Next !== op.Prev){
                            if (ClipperLib.Clipper.PointsAreClose(op.Pt, op.Prev.Pt, distSqrd)) {
                                op = ClipperLib.Clipper.ExcludeOp(op);
                                cnt--;
                            } else if (ClipperLib.Clipper.PointsAreClose(op.Prev.Pt, op.Next.Pt, distSqrd)) {
                                ClipperLib.Clipper.ExcludeOp(op.Next);
                                op = ClipperLib.Clipper.ExcludeOp(op);
                                cnt -= 2;
                            } else if (ClipperLib.Clipper.SlopesNearCollinear(op.Prev.Pt, op.Pt, op.Next.Pt, distSqrd)) {
                                op = ClipperLib.Clipper.ExcludeOp(op);
                                cnt--;
                            } else {
                                op.Idx = 1;
                                op = op.Next;
                            }
                        }
                        if (cnt < 3) {
                            cnt = 0;
                        }
                        var result = new Array(cnt);
                        for(var i = 0; i < cnt; ++i){
                            result[i] = new ClipperLib.IntPoint1(op.Pt);
                            op = op.Next;
                        }
                        outPts = null;
                        return result;
                    };
                    ClipperLib.Clipper.CleanPolygons = function(polys, distance) {
                        var result = new Array(polys.length);
                        for(var i = 0, ilen = polys.length; i < ilen; i++){
                            result[i] = ClipperLib.Clipper.CleanPolygon(polys[i], distance);
                        }
                        return result;
                    };
                    ClipperLib.Clipper.Minkowski = function(pattern, path1, IsSum, IsClosed) {
                        var delta = IsClosed ? 1 : 0;
                        var polyCnt = pattern.length;
                        var pathCnt = path1.length;
                        var result = new Array();
                        if (IsSum) {
                            for(var i = 0; i < pathCnt; i++){
                                var p = new Array(polyCnt);
                                for(var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j]){
                                    p[j] = new ClipperLib.IntPoint2(path1[i].X + ip.X, path1[i].Y + ip.Y);
                                }
                                result.push(p);
                            }
                        } else {
                            for(var i = 0; i < pathCnt; i++){
                                var p = new Array(polyCnt);
                                for(var j = 0, jlen = pattern.length, ip = pattern[j]; j < jlen; j++, ip = pattern[j]){
                                    p[j] = new ClipperLib.IntPoint2(path1[i].X - ip.X, path1[i].Y - ip.Y);
                                }
                                result.push(p);
                            }
                        }
                        var quads = new Array();
                        for(var i = 0; i < pathCnt - 1 + delta; i++){
                            for(var j = 0; j < polyCnt; j++){
                                var quad = new Array();
                                quad.push(result[i % pathCnt][j % polyCnt]);
                                quad.push(result[(i + 1) % pathCnt][j % polyCnt]);
                                quad.push(result[(i + 1) % pathCnt][(j + 1) % polyCnt]);
                                quad.push(result[i % pathCnt][(j + 1) % polyCnt]);
                                if (!ClipperLib.Clipper.Orientation(quad)) {
                                    quad.reverse();
                                }
                                quads.push(quad);
                            }
                        }
                        return quads;
                    };
                    ClipperLib.Clipper.MinkowskiSum = function(pattern, path_or_paths, pathIsClosed) {
                        if (!(path_or_paths[0] instanceof Array)) {
                            var path1 = path_or_paths;
                            var paths = ClipperLib.Clipper.Minkowski(pattern, path1, true, pathIsClosed);
                            var c = new ClipperLib.Clipper();
                            c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
                            c.Execute(ClipperLib.ClipType.ctUnion, paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                            return paths;
                        } else {
                            var paths = path_or_paths;
                            var solution = new ClipperLib.Paths();
                            var c = new ClipperLib.Clipper();
                            for(var i = 0; i < paths.length; ++i){
                                var tmp = ClipperLib.Clipper.Minkowski(pattern, paths[i], true, pathIsClosed);
                                c.AddPaths(tmp, ClipperLib.PolyType.ptSubject, true);
                                if (pathIsClosed) {
                                    var path1 = ClipperLib.Clipper.TranslatePath(paths[i], pattern[0]);
                                    c.AddPath(path1, ClipperLib.PolyType.ptClip, true);
                                }
                            }
                            c.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                            return solution;
                        }
                    };
                    ClipperLib.Clipper.TranslatePath = function(path2, delta) {
                        var outPath = new ClipperLib.Path();
                        for(var i = 0; i < path2.length; i++){
                            outPath.push(new ClipperLib.IntPoint2(path2[i].X + delta.X, path2[i].Y + delta.Y));
                        }
                        return outPath;
                    };
                    ClipperLib.Clipper.MinkowskiDiff = function(poly1, poly2) {
                        var paths = ClipperLib.Clipper.Minkowski(poly1, poly2, false, true);
                        var c = new ClipperLib.Clipper();
                        c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
                        c.Execute(ClipperLib.ClipType.ctUnion, paths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
                        return paths;
                    };
                    ClipperLib.Clipper.PolyTreeToPaths = function(polytree) {
                        var result = new Array();
                        ClipperLib.Clipper.AddPolyNodeToPaths(polytree, ClipperLib.Clipper.NodeType.ntAny, result);
                        return result;
                    };
                    ClipperLib.Clipper.AddPolyNodeToPaths = function(polynode, nt, paths) {
                        var match = true;
                        switch(nt){
                            case ClipperLib.Clipper.NodeType.ntOpen:
                                return;
                            case ClipperLib.Clipper.NodeType.ntClosed:
                                match = !polynode.IsOpen;
                                break;
                        }
                        if (polynode.m_polygon.length > 0 && match) {
                            paths.push(polynode.m_polygon);
                        }
                        for(var $i3 = 0, $t3 = polynode.Childs(), $l3 = $t3.length, pn = $t3[$i3]; $i3 < $l3; $i3++, pn = $t3[$i3]){
                            ClipperLib.Clipper.AddPolyNodeToPaths(pn, nt, paths);
                        }
                    };
                    ClipperLib.Clipper.OpenPathsFromPolyTree = function(polytree) {
                        var result = new ClipperLib.Paths();
                        for(var i = 0, ilen = polytree.ChildCount(); i < ilen; i++){
                            if (polytree.Childs()[i].IsOpen) {
                                result.push(polytree.Childs()[i].m_polygon);
                            }
                        }
                        return result;
                    };
                    ClipperLib.Clipper.ClosedPathsFromPolyTree = function(polytree) {
                        var result = new ClipperLib.Paths();
                        ClipperLib.Clipper.AddPolyNodeToPaths(polytree, ClipperLib.Clipper.NodeType.ntClosed, result);
                        return result;
                    };
                    Inherit(ClipperLib.Clipper, ClipperLib.ClipperBase);
                    ClipperLib.Clipper.NodeType = {
                        ntAny: 0,
                        ntOpen: 1,
                        ntClosed: 2
                    };
                    ClipperLib.ClipperOffset = function(miterLimit, arcTolerance) {
                        if (typeof miterLimit === "undefined") {
                            miterLimit = 2;
                        }
                        if (typeof arcTolerance === "undefined") {
                            arcTolerance = ClipperLib.ClipperOffset.def_arc_tolerance;
                        }
                        this.m_destPolys = new ClipperLib.Paths();
                        this.m_srcPoly = new ClipperLib.Path();
                        this.m_destPoly = new ClipperLib.Path();
                        this.m_normals = new Array();
                        this.m_delta = 0;
                        this.m_sinA = 0;
                        this.m_sin = 0;
                        this.m_cos = 0;
                        this.m_miterLim = 0;
                        this.m_StepsPerRad = 0;
                        this.m_lowest = new ClipperLib.IntPoint0();
                        this.m_polyNodes = new ClipperLib.PolyNode();
                        this.MiterLimit = miterLimit;
                        this.ArcTolerance = arcTolerance;
                        this.m_lowest.X = -1;
                    };
                    ClipperLib.ClipperOffset.two_pi = 6.28318530717959;
                    ClipperLib.ClipperOffset.def_arc_tolerance = 0.25;
                    ClipperLib.ClipperOffset.prototype.Clear = function() {
                        ClipperLib.Clear(this.m_polyNodes.Childs());
                        this.m_lowest.X = -1;
                    };
                    ClipperLib.ClipperOffset.Round = ClipperLib.Clipper.Round;
                    ClipperLib.ClipperOffset.prototype.AddPath = function(path2, joinType, endType) {
                        var highI = path2.length - 1;
                        if (highI < 0) {
                            return;
                        }
                        var newNode = new ClipperLib.PolyNode();
                        newNode.m_jointype = joinType;
                        newNode.m_endtype = endType;
                        if (endType === ClipperLib.EndType.etClosedLine || endType === ClipperLib.EndType.etClosedPolygon) {
                            while(highI > 0 && ClipperLib.IntPoint.op_Equality(path2[0], path2[highI])){
                                highI--;
                            }
                        }
                        newNode.m_polygon.push(path2[0]);
                        var j = 0, k = 0;
                        for(var i = 1; i <= highI; i++){
                            if (ClipperLib.IntPoint.op_Inequality(newNode.m_polygon[j], path2[i])) {
                                j++;
                                newNode.m_polygon.push(path2[i]);
                                if (path2[i].Y > newNode.m_polygon[k].Y || path2[i].Y === newNode.m_polygon[k].Y && path2[i].X < newNode.m_polygon[k].X) {
                                    k = j;
                                }
                            }
                        }
                        if (endType === ClipperLib.EndType.etClosedPolygon && j < 2) {
                            return;
                        }
                        this.m_polyNodes.AddChild(newNode);
                        if (endType !== ClipperLib.EndType.etClosedPolygon) {
                            return;
                        }
                        if (this.m_lowest.X < 0) {
                            this.m_lowest = new ClipperLib.IntPoint2(this.m_polyNodes.ChildCount() - 1, k);
                        } else {
                            var ip = this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon[this.m_lowest.Y];
                            if (newNode.m_polygon[k].Y > ip.Y || newNode.m_polygon[k].Y === ip.Y && newNode.m_polygon[k].X < ip.X) {
                                this.m_lowest = new ClipperLib.IntPoint2(this.m_polyNodes.ChildCount() - 1, k);
                            }
                        }
                    };
                    ClipperLib.ClipperOffset.prototype.AddPaths = function(paths, joinType, endType) {
                        for(var i = 0, ilen = paths.length; i < ilen; i++){
                            this.AddPath(paths[i], joinType, endType);
                        }
                    };
                    ClipperLib.ClipperOffset.prototype.FixOrientations = function() {
                        if (this.m_lowest.X >= 0 && !ClipperLib.Clipper.Orientation(this.m_polyNodes.Childs()[this.m_lowest.X].m_polygon)) {
                            for(var i = 0; i < this.m_polyNodes.ChildCount(); i++){
                                var node = this.m_polyNodes.Childs()[i];
                                if (node.m_endtype === ClipperLib.EndType.etClosedPolygon || node.m_endtype === ClipperLib.EndType.etClosedLine && ClipperLib.Clipper.Orientation(node.m_polygon)) {
                                    node.m_polygon.reverse();
                                }
                            }
                        } else {
                            for(var i = 0; i < this.m_polyNodes.ChildCount(); i++){
                                var node = this.m_polyNodes.Childs()[i];
                                if (node.m_endtype === ClipperLib.EndType.etClosedLine && !ClipperLib.Clipper.Orientation(node.m_polygon)) {
                                    node.m_polygon.reverse();
                                }
                            }
                        }
                    };
                    ClipperLib.ClipperOffset.GetUnitNormal = function(pt1, pt2) {
                        var dx = pt2.X - pt1.X;
                        var dy = pt2.Y - pt1.Y;
                        if (dx === 0 && dy === 0) {
                            return new ClipperLib.DoublePoint2(0, 0);
                        }
                        var f = 1 / Math.sqrt(dx * dx + dy * dy);
                        dx *= f;
                        dy *= f;
                        return new ClipperLib.DoublePoint2(dy, -dx);
                    };
                    ClipperLib.ClipperOffset.prototype.DoOffset = function(delta) {
                        this.m_destPolys = new Array();
                        this.m_delta = delta;
                        if (ClipperLib.ClipperBase.near_zero(delta)) {
                            for(var i = 0; i < this.m_polyNodes.ChildCount(); i++){
                                var node = this.m_polyNodes.Childs()[i];
                                if (node.m_endtype === ClipperLib.EndType.etClosedPolygon) {
                                    this.m_destPolys.push(node.m_polygon);
                                }
                            }
                            return;
                        }
                        if (this.MiterLimit > 2) {
                            this.m_miterLim = 2 / (this.MiterLimit * this.MiterLimit);
                        } else {
                            this.m_miterLim = 0.5;
                        }
                        var y;
                        if (this.ArcTolerance <= 0) {
                            y = ClipperLib.ClipperOffset.def_arc_tolerance;
                        } else if (this.ArcTolerance > Math.abs(delta) * ClipperLib.ClipperOffset.def_arc_tolerance) {
                            y = Math.abs(delta) * ClipperLib.ClipperOffset.def_arc_tolerance;
                        } else {
                            y = this.ArcTolerance;
                        }
                        var steps = 3.14159265358979 / Math.acos(1 - y / Math.abs(delta));
                        this.m_sin = Math.sin(ClipperLib.ClipperOffset.two_pi / steps);
                        this.m_cos = Math.cos(ClipperLib.ClipperOffset.two_pi / steps);
                        this.m_StepsPerRad = steps / ClipperLib.ClipperOffset.two_pi;
                        if (delta < 0) {
                            this.m_sin = -this.m_sin;
                        }
                        for(var i = 0; i < this.m_polyNodes.ChildCount(); i++){
                            var node = this.m_polyNodes.Childs()[i];
                            this.m_srcPoly = node.m_polygon;
                            var len = this.m_srcPoly.length;
                            if (len === 0 || delta <= 0 && (len < 3 || node.m_endtype !== ClipperLib.EndType.etClosedPolygon)) {
                                continue;
                            }
                            this.m_destPoly = new Array();
                            if (len === 1) {
                                if (node.m_jointype === ClipperLib.JoinType.jtRound) {
                                    var X = 1, Y = 0;
                                    for(var j = 1; j <= steps; j++){
                                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
                                        var X2 = X;
                                        X = X * this.m_cos - this.m_sin * Y;
                                        Y = X2 * this.m_sin + Y * this.m_cos;
                                    }
                                } else {
                                    var X = -1, Y = -1;
                                    for(var j = 0; j < 4; ++j){
                                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + Y * delta)));
                                        if (X < 0) {
                                            X = 1;
                                        } else if (Y < 0) {
                                            Y = 1;
                                        } else {
                                            X = -1;
                                        }
                                    }
                                }
                                this.m_destPolys.push(this.m_destPoly);
                                continue;
                            }
                            this.m_normals.length = 0;
                            for(var j = 0; j < len - 1; j++){
                                this.m_normals.push(ClipperLib.ClipperOffset.GetUnitNormal(this.m_srcPoly[j], this.m_srcPoly[j + 1]));
                            }
                            if (node.m_endtype === ClipperLib.EndType.etClosedLine || node.m_endtype === ClipperLib.EndType.etClosedPolygon) {
                                this.m_normals.push(ClipperLib.ClipperOffset.GetUnitNormal(this.m_srcPoly[len - 1], this.m_srcPoly[0]));
                            } else {
                                this.m_normals.push(new ClipperLib.DoublePoint1(this.m_normals[len - 2]));
                            }
                            if (node.m_endtype === ClipperLib.EndType.etClosedPolygon) {
                                var k = len - 1;
                                for(var j = 0; j < len; j++){
                                    k = this.OffsetPoint(j, k, node.m_jointype);
                                }
                                this.m_destPolys.push(this.m_destPoly);
                            } else if (node.m_endtype === ClipperLib.EndType.etClosedLine) {
                                var k = len - 1;
                                for(var j = 0; j < len; j++){
                                    k = this.OffsetPoint(j, k, node.m_jointype);
                                }
                                this.m_destPolys.push(this.m_destPoly);
                                this.m_destPoly = new Array();
                                var n = this.m_normals[len - 1];
                                for(var j = len - 1; j > 0; j--){
                                    this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y);
                                }
                                this.m_normals[0] = new ClipperLib.DoublePoint2(-n.X, -n.Y);
                                k = 0;
                                for(var j = len - 1; j >= 0; j--){
                                    k = this.OffsetPoint(j, k, node.m_jointype);
                                }
                                this.m_destPolys.push(this.m_destPoly);
                            } else {
                                var k = 0;
                                for(var j = 1; j < len - 1; ++j){
                                    k = this.OffsetPoint(j, k, node.m_jointype);
                                }
                                var pt1;
                                if (node.m_endtype === ClipperLib.EndType.etOpenButt) {
                                    var j = len - 1;
                                    pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * delta));
                                    this.m_destPoly.push(pt1);
                                    pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X - this.m_normals[j].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y - this.m_normals[j].Y * delta));
                                    this.m_destPoly.push(pt1);
                                } else {
                                    var j = len - 1;
                                    k = len - 2;
                                    this.m_sinA = 0;
                                    this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j].X, -this.m_normals[j].Y);
                                    if (node.m_endtype === ClipperLib.EndType.etOpenSquare) {
                                        this.DoSquare(j, k);
                                    } else {
                                        this.DoRound(j, k);
                                    }
                                }
                                for(var j = len - 1; j > 0; j--){
                                    this.m_normals[j] = new ClipperLib.DoublePoint2(-this.m_normals[j - 1].X, -this.m_normals[j - 1].Y);
                                }
                                this.m_normals[0] = new ClipperLib.DoublePoint2(-this.m_normals[1].X, -this.m_normals[1].Y);
                                k = len - 1;
                                for(var j = k - 1; j > 0; --j){
                                    k = this.OffsetPoint(j, k, node.m_jointype);
                                }
                                if (node.m_endtype === ClipperLib.EndType.etOpenButt) {
                                    pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X - this.m_normals[0].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y - this.m_normals[0].Y * delta));
                                    this.m_destPoly.push(pt1);
                                    pt1 = new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].X + this.m_normals[0].X * delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[0].Y + this.m_normals[0].Y * delta));
                                    this.m_destPoly.push(pt1);
                                } else {
                                    k = 1;
                                    this.m_sinA = 0;
                                    if (node.m_endtype === ClipperLib.EndType.etOpenSquare) {
                                        this.DoSquare(0, 1);
                                    } else {
                                        this.DoRound(0, 1);
                                    }
                                }
                                this.m_destPolys.push(this.m_destPoly);
                            }
                        }
                    };
                    ClipperLib.ClipperOffset.prototype.Execute = function() {
                        var a = arguments, ispolytree = a[0] instanceof ClipperLib.PolyTree;
                        if (!ispolytree) {
                            var solution = a[0], delta = a[1];
                            ClipperLib.Clear(solution);
                            this.FixOrientations();
                            this.DoOffset(delta);
                            var clpr = new ClipperLib.Clipper(0);
                            clpr.AddPaths(this.m_destPolys, ClipperLib.PolyType.ptSubject, true);
                            if (delta > 0) {
                                clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftPositive, ClipperLib.PolyFillType.pftPositive);
                            } else {
                                var r = ClipperLib.Clipper.GetBounds(this.m_destPolys);
                                var outer = new ClipperLib.Path();
                                outer.push(new ClipperLib.IntPoint2(r.left - 10, r.bottom + 10));
                                outer.push(new ClipperLib.IntPoint2(r.right + 10, r.bottom + 10));
                                outer.push(new ClipperLib.IntPoint2(r.right + 10, r.top - 10));
                                outer.push(new ClipperLib.IntPoint2(r.left - 10, r.top - 10));
                                clpr.AddPath(outer, ClipperLib.PolyType.ptSubject, true);
                                clpr.ReverseSolution = true;
                                clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNegative, ClipperLib.PolyFillType.pftNegative);
                                if (solution.length > 0) {
                                    solution.splice(0, 1);
                                }
                            }
                        } else {
                            var solution = a[0], delta = a[1];
                            solution.Clear();
                            this.FixOrientations();
                            this.DoOffset(delta);
                            var clpr = new ClipperLib.Clipper(0);
                            clpr.AddPaths(this.m_destPolys, ClipperLib.PolyType.ptSubject, true);
                            if (delta > 0) {
                                clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftPositive, ClipperLib.PolyFillType.pftPositive);
                            } else {
                                var r = ClipperLib.Clipper.GetBounds(this.m_destPolys);
                                var outer = new ClipperLib.Path();
                                outer.push(new ClipperLib.IntPoint2(r.left - 10, r.bottom + 10));
                                outer.push(new ClipperLib.IntPoint2(r.right + 10, r.bottom + 10));
                                outer.push(new ClipperLib.IntPoint2(r.right + 10, r.top - 10));
                                outer.push(new ClipperLib.IntPoint2(r.left - 10, r.top - 10));
                                clpr.AddPath(outer, ClipperLib.PolyType.ptSubject, true);
                                clpr.ReverseSolution = true;
                                clpr.Execute(ClipperLib.ClipType.ctUnion, solution, ClipperLib.PolyFillType.pftNegative, ClipperLib.PolyFillType.pftNegative);
                                if (solution.ChildCount() === 1 && solution.Childs()[0].ChildCount() > 0) {
                                    var outerNode = solution.Childs()[0];
                                    solution.Childs()[0] = outerNode.Childs()[0];
                                    solution.Childs()[0].m_Parent = solution;
                                    for(var i = 1; i < outerNode.ChildCount(); i++){
                                        solution.AddChild(outerNode.Childs()[i]);
                                    }
                                } else {
                                    solution.Clear();
                                }
                            }
                        }
                    };
                    ClipperLib.ClipperOffset.prototype.OffsetPoint = function(j, k, jointype) {
                        this.m_sinA = this.m_normals[k].X * this.m_normals[j].Y - this.m_normals[j].X * this.m_normals[k].Y;
                        if (Math.abs(this.m_sinA * this.m_delta) < 1) {
                            var cosA = this.m_normals[k].X * this.m_normals[j].X + this.m_normals[j].Y * this.m_normals[k].Y;
                            if (cosA > 0) {
                                this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k].X * this.m_delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k].Y * this.m_delta)));
                                return k;
                            }
                        } else if (this.m_sinA > 1) {
                            this.m_sinA = 1;
                        } else if (this.m_sinA < -1) {
                            this.m_sinA = -1;
                        }
                        if (this.m_sinA * this.m_delta < 0) {
                            this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[k].X * this.m_delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[k].Y * this.m_delta)));
                            this.m_destPoly.push(new ClipperLib.IntPoint1(this.m_srcPoly[j]));
                            this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
                        } else {
                            switch(jointype){
                                case ClipperLib.JoinType.jtMiter:
                                    {
                                        var r = 1 + (this.m_normals[j].X * this.m_normals[k].X + this.m_normals[j].Y * this.m_normals[k].Y);
                                        if (r >= this.m_miterLim) {
                                            this.DoMiter(j, k, r);
                                        } else {
                                            this.DoSquare(j, k);
                                        }
                                        break;
                                    }
                                case ClipperLib.JoinType.jtSquare:
                                    this.DoSquare(j, k);
                                    break;
                                case ClipperLib.JoinType.jtRound:
                                    this.DoRound(j, k);
                                    break;
                            }
                        }
                        k = j;
                        return k;
                    };
                    ClipperLib.ClipperOffset.prototype.DoSquare = function(j, k) {
                        var dx = Math.tan(Math.atan2(this.m_sinA, this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y) / 4);
                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[k].X - this.m_normals[k].Y * dx)), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[k].Y + this.m_normals[k].X * dx))));
                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_delta * (this.m_normals[j].X + this.m_normals[j].Y * dx)), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_delta * (this.m_normals[j].Y - this.m_normals[j].X * dx))));
                    };
                    ClipperLib.ClipperOffset.prototype.DoMiter = function(j, k, r) {
                        var q = this.m_delta / r;
                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + (this.m_normals[k].X + this.m_normals[j].X) * q), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + (this.m_normals[k].Y + this.m_normals[j].Y) * q)));
                    };
                    ClipperLib.ClipperOffset.prototype.DoRound = function(j, k) {
                        var a = Math.atan2(this.m_sinA, this.m_normals[k].X * this.m_normals[j].X + this.m_normals[k].Y * this.m_normals[j].Y);
                        var steps = Math.max(ClipperLib.Cast_Int32(ClipperLib.ClipperOffset.Round(this.m_StepsPerRad * Math.abs(a))), 1);
                        var X = this.m_normals[k].X, Y = this.m_normals[k].Y, X2;
                        for(var i = 0; i < steps; ++i){
                            this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + X * this.m_delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + Y * this.m_delta)));
                            X2 = X;
                            X = X * this.m_cos - this.m_sin * Y;
                            Y = X2 * this.m_sin + Y * this.m_cos;
                        }
                        this.m_destPoly.push(new ClipperLib.IntPoint2(ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].X + this.m_normals[j].X * this.m_delta), ClipperLib.ClipperOffset.Round(this.m_srcPoly[j].Y + this.m_normals[j].Y * this.m_delta)));
                    };
                    ClipperLib.Error = function(message) {
                        try {
                            throw new Error(message);
                        } catch (err) {
                            alert(err.message);
                        }
                    };
                    ClipperLib.JS = {
                    };
                    ClipperLib.JS.AreaOfPolygon = function(poly, scale) {
                        if (!scale) {
                            scale = 1;
                        }
                        return ClipperLib.Clipper.Area(poly) / (scale * scale);
                    };
                    ClipperLib.JS.AreaOfPolygons = function(poly, scale) {
                        if (!scale) {
                            scale = 1;
                        }
                        var area = 0;
                        for(var i = 0; i < poly.length; i++){
                            area += ClipperLib.Clipper.Area(poly[i]);
                        }
                        return area / (scale * scale);
                    };
                    ClipperLib.JS.BoundsOfPath = function(path2, scale) {
                        return ClipperLib.JS.BoundsOfPaths([
                            path2
                        ], scale);
                    };
                    ClipperLib.JS.BoundsOfPaths = function(paths, scale) {
                        if (!scale) {
                            scale = 1;
                        }
                        var bounds = ClipperLib.Clipper.GetBounds(paths);
                        bounds.left /= scale;
                        bounds.bottom /= scale;
                        bounds.right /= scale;
                        bounds.top /= scale;
                        return bounds;
                    };
                    ClipperLib.JS.Clean = function(polygon1, delta) {
                        if (!(polygon1 instanceof Array)) {
                            return [];
                        }
                        var isPolygons = polygon1[0] instanceof Array;
                        var polygon1 = ClipperLib.JS.Clone(polygon1);
                        if (typeof delta !== "number" || delta === null) {
                            ClipperLib.Error("Delta is not a number in Clean().");
                            return polygon1;
                        }
                        if (polygon1.length === 0 || polygon1.length === 1 && polygon1[0].length === 0 || delta < 0) {
                            return polygon1;
                        }
                        if (!isPolygons) {
                            polygon1 = [
                                polygon1
                            ];
                        }
                        var k_length = polygon1.length;
                        var len, poly, result, d, p, j, i;
                        var results = [];
                        for(var k = 0; k < k_length; k++){
                            poly = polygon1[k];
                            len = poly.length;
                            if (len === 0) {
                                continue;
                            } else if (len < 3) {
                                result = poly;
                                results.push(result);
                                continue;
                            }
                            result = poly;
                            d = delta * delta;
                            p = poly[0];
                            j = 1;
                            for(i = 1; i < len; i++){
                                if ((poly[i].X - p.X) * (poly[i].X - p.X) + (poly[i].Y - p.Y) * (poly[i].Y - p.Y) <= d) {
                                    continue;
                                }
                                result[j] = poly[i];
                                p = poly[i];
                                j++;
                            }
                            p = poly[j - 1];
                            if ((poly[0].X - p.X) * (poly[0].X - p.X) + (poly[0].Y - p.Y) * (poly[0].Y - p.Y) <= d) {
                                j--;
                            }
                            if (j < len) {
                                result.splice(j, len - j);
                            }
                            if (result.length) {
                                results.push(result);
                            }
                        }
                        if (!isPolygons && results.length) {
                            results = results[0];
                        } else if (!isPolygons && results.length === 0) {
                            results = [];
                        } else if (isPolygons && results.length === 0) {
                            results = [
                                [], 
                            ];
                        }
                        return results;
                    };
                    ClipperLib.JS.Clone = function(polygon1) {
                        if (!(polygon1 instanceof Array)) {
                            return [];
                        }
                        if (polygon1.length === 0) {
                            return [];
                        } else if (polygon1.length === 1 && polygon1[0].length === 0) {
                            return [
                                [], 
                            ];
                        }
                        var isPolygons = polygon1[0] instanceof Array;
                        if (!isPolygons) {
                            polygon1 = [
                                polygon1
                            ];
                        }
                        var len = polygon1.length, plen, i, j, result;
                        var results = new Array(len);
                        for(i = 0; i < len; i++){
                            plen = polygon1[i].length;
                            result = new Array(plen);
                            for(j = 0; j < plen; j++){
                                result[j] = {
                                    X: polygon1[i][j].X,
                                    Y: polygon1[i][j].Y
                                };
                            }
                            results[i] = result;
                        }
                        if (!isPolygons) {
                            results = results[0];
                        }
                        return results;
                    };
                    ClipperLib.JS.Lighten = function(polygon1, tolerance) {
                        if (!(polygon1 instanceof Array)) {
                            return [];
                        }
                        if (typeof tolerance !== "number" || tolerance === null) {
                            ClipperLib.Error("Tolerance is not a number in Lighten().");
                            return ClipperLib.JS.Clone(polygon1);
                        }
                        if (polygon1.length === 0 || polygon1.length === 1 && polygon1[0].length === 0 || tolerance < 0) {
                            return ClipperLib.JS.Clone(polygon1);
                        }
                        var isPolygons = polygon1[0] instanceof Array;
                        if (!isPolygons) {
                            polygon1 = [
                                polygon1
                            ];
                        }
                        var i, j, poly, k, poly2, plen, A, B, P, d, rem, addlast;
                        var bxax, byay, l, ax, ay;
                        var len = polygon1.length;
                        var toleranceSq = tolerance * tolerance;
                        var results = [];
                        for(i = 0; i < len; i++){
                            poly = polygon1[i];
                            plen = poly.length;
                            if (plen === 0) {
                                continue;
                            }
                            for(k = 0; k < 1000000; k++){
                                poly2 = [];
                                plen = poly.length;
                                if (poly[plen - 1].X !== poly[0].X || poly[plen - 1].Y !== poly[0].Y) {
                                    addlast = 1;
                                    poly.push({
                                        X: poly[0].X,
                                        Y: poly[0].Y
                                    });
                                    plen = poly.length;
                                } else {
                                    addlast = 0;
                                }
                                rem = [];
                                for(j = 0; j < plen - 2; j++){
                                    A = poly[j];
                                    P = poly[j + 1];
                                    B = poly[j + 2];
                                    ax = A.X;
                                    ay = A.Y;
                                    bxax = B.X - ax;
                                    byay = B.Y - ay;
                                    if (bxax !== 0 || byay !== 0) {
                                        l = ((P.X - ax) * bxax + (P.Y - ay) * byay) / (bxax * bxax + byay * byay);
                                        if (l > 1) {
                                            ax = B.X;
                                            ay = B.Y;
                                        } else if (l > 0) {
                                            ax += bxax * l;
                                            ay += byay * l;
                                        }
                                    }
                                    bxax = P.X - ax;
                                    byay = P.Y - ay;
                                    d = bxax * bxax + byay * byay;
                                    if (d <= toleranceSq) {
                                        rem[j + 1] = 1;
                                        j++;
                                    }
                                }
                                poly2.push({
                                    X: poly[0].X,
                                    Y: poly[0].Y
                                });
                                for(j = 1; j < plen - 1; j++){
                                    if (!rem[j]) {
                                        poly2.push({
                                            X: poly[j].X,
                                            Y: poly[j].Y
                                        });
                                    }
                                }
                                poly2.push({
                                    X: poly[plen - 1].X,
                                    Y: poly[plen - 1].Y
                                });
                                if (addlast) {
                                    poly.pop();
                                }
                                if (!rem.length) {
                                    break;
                                } else {
                                    poly = poly2;
                                }
                            }
                            plen = poly2.length;
                            if (poly2[plen - 1].X === poly2[0].X && poly2[plen - 1].Y === poly2[0].Y) {
                                poly2.pop();
                            }
                            if (poly2.length > 2) {
                                results.push(poly2);
                            }
                        }
                        if (!isPolygons) {
                            results = results[0];
                        }
                        if (typeof results === "undefined") {
                            results = [];
                        }
                        return results;
                    };
                    ClipperLib.JS.PerimeterOfPath = function(path2, closed, scale) {
                        if (typeof path2 === "undefined") {
                            return 0;
                        }
                        var sqrt = Math.sqrt;
                        var perimeter = 0;
                        var p1, p2, p1x = 0, p1y = 0, p2x = 0, p2y = 0;
                        var j = path2.length;
                        if (j < 2) {
                            return 0;
                        }
                        if (closed) {
                            path2[j] = path2[0];
                            j++;
                        }
                        while(--j){
                            p1 = path2[j];
                            p1x = p1.X;
                            p1y = p1.Y;
                            p2 = path2[j - 1];
                            p2x = p2.X;
                            p2y = p2.Y;
                            perimeter += sqrt((p1x - p2x) * (p1x - p2x) + (p1y - p2y) * (p1y - p2y));
                        }
                        if (closed) {
                            path2.pop();
                        }
                        return perimeter / scale;
                    };
                    ClipperLib.JS.PerimeterOfPaths = function(paths, closed, scale) {
                        if (!scale) {
                            scale = 1;
                        }
                        var perimeter = 0;
                        for(var i = 0; i < paths.length; i++){
                            perimeter += ClipperLib.JS.PerimeterOfPath(paths[i], closed, scale);
                        }
                        return perimeter;
                    };
                    ClipperLib.JS.ScaleDownPath = function(path2, scale) {
                        var i, p;
                        if (!scale) {
                            scale = 1;
                        }
                        i = path2.length;
                        while(i--){
                            p = path2[i];
                            p.X = p.X / scale;
                            p.Y = p.Y / scale;
                        }
                    };
                    ClipperLib.JS.ScaleDownPaths = function(paths, scale) {
                        var i, j, p;
                        if (!scale) {
                            scale = 1;
                        }
                        i = paths.length;
                        while(i--){
                            j = paths[i].length;
                            while(j--){
                                p = paths[i][j];
                                p.X = p.X / scale;
                                p.Y = p.Y / scale;
                            }
                        }
                    };
                    ClipperLib.JS.ScaleUpPath = function(path2, scale) {
                        var i, p, round = Math.round;
                        if (!scale) {
                            scale = 1;
                        }
                        i = path2.length;
                        while(i--){
                            p = path2[i];
                            p.X = round(p.X * scale);
                            p.Y = round(p.Y * scale);
                        }
                    };
                    ClipperLib.JS.ScaleUpPaths = function(paths, scale) {
                        var i, j, p, round = Math.round;
                        if (!scale) {
                            scale = 1;
                        }
                        i = paths.length;
                        while(i--){
                            j = paths[i].length;
                            while(j--){
                                p = paths[i][j];
                                p.X = round(p.X * scale);
                                p.Y = round(p.Y * scale);
                            }
                        }
                    };
                    ClipperLib.ExPolygons = function() {
                        return [];
                    };
                    ClipperLib.ExPolygon = function() {
                        this.outer = null;
                        this.holes = null;
                    };
                    ClipperLib.JS.AddOuterPolyNodeToExPolygons = function(polynode, expolygons) {
                        var ep = new ClipperLib.ExPolygon();
                        ep.outer = polynode.Contour();
                        var childs = polynode.Childs();
                        var ilen = childs.length;
                        ep.holes = new Array(ilen);
                        var node, n, i, j, childs2, jlen;
                        for(i = 0; i < ilen; i++){
                            node = childs[i];
                            ep.holes[i] = node.Contour();
                            for(j = 0, childs2 = node.Childs(), jlen = childs2.length; j < jlen; j++){
                                n = childs2[j];
                                ClipperLib.JS.AddOuterPolyNodeToExPolygons(n, expolygons);
                            }
                        }
                        expolygons.push(ep);
                    };
                    ClipperLib.JS.ExPolygonsToPaths = function(expolygons) {
                        var a, i, alen, ilen;
                        var paths = new ClipperLib.Paths();
                        for(a = 0, alen = expolygons.length; a < alen; a++){
                            paths.push(expolygons[a].outer);
                            for(i = 0, ilen = expolygons[a].holes.length; i < ilen; i++){
                                paths.push(expolygons[a].holes[i]);
                            }
                        }
                        return paths;
                    };
                    ClipperLib.JS.PolyTreeToExPolygons = function(polytree) {
                        var expolygons = new ClipperLib.ExPolygons();
                        var node, i, childs, ilen;
                        for(i = 0, childs = polytree.Childs(), ilen = childs.length; i < ilen; i++){
                            node = childs[i];
                            ClipperLib.JS.AddOuterPolyNodeToExPolygons(node, expolygons);
                        }
                        return expolygons;
                    };
                })();
            });
            exports_1("default", clipper);
            exports_1("__esModule", __esModule = true);
        }
    };
});
System.register("-/clipper-js@v1.0.2-Mou0diNPTgyilhisGDlW/dist=es2020/clipper-js", [
    "-/clipper-lib@v6.4.2-JisZmmhC7gDAFmHQLYDu/dist=es2020/clipper-lib"
], function(exports_2, context_2) {
    "use strict";
    var dist_es2020_from_clipper_js_1, lib, index, __esModule;
    var __moduleName = context_2 && context_2.id;
    function unwrapExports(x) {
        return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
    }
    function createCommonjsModule(fn, basedir, module) {
        return module = {
            path: basedir,
            exports: {
            },
            require: function(path2, base) {
                return commonjsRequire(path2, base === undefined || base === null ? module.path : base);
            }
        }, fn(module, module.exports), module.exports;
    }
    function commonjsRequire() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
    }
    return {
        setters: [
            function(dist_es2020_from_clipper_js_1_1) {
                dist_es2020_from_clipper_js_1 = dist_es2020_from_clipper_js_1_1;
            }, 
        ],
        execute: function() {
            lib = createCommonjsModule(function(module, exports) {
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.setErrorCallback = undefined;
                var _createClass = function() {
                    function defineProperties(target, props) {
                        for(var i = 0; i < props.length; i++){
                            var descriptor = props[i];
                            descriptor.enumerable = descriptor.enumerable || false;
                            descriptor.configurable = true;
                            if ("value" in descriptor) {
                                descriptor.writable = true;
                            }
                            Object.defineProperty(target, descriptor.key, descriptor);
                        }
                    }
                    return function(Constructor, protoProps, staticProps) {
                        if (protoProps) {
                            defineProperties(Constructor.prototype, protoProps);
                        }
                        if (staticProps) {
                            defineProperties(Constructor, staticProps);
                        }
                        return Constructor;
                    };
                }();
                var _clipperLib2 = _interopRequireDefault(dist_es2020_from_clipper_js_1.default);
                function _interopRequireDefault(obj) {
                    return obj && obj.__esModule ? obj : {
                        default: obj
                    };
                }
                function _toConsumableArray(arr) {
                    if (Array.isArray(arr)) {
                        for(var i = 0, arr2 = Array(arr.length); i < arr.length; i++){
                            arr2[i] = arr[i];
                        }
                        return arr2;
                    } else {
                        return Array.from(arr);
                    }
                }
                function _classCallCheck(instance, Constructor) {
                    if (!(instance instanceof Constructor)) {
                        throw new TypeError("Cannot call a class as a function");
                    }
                }
                var errorCallback = void 0;
                var setErrorCallback = exports.setErrorCallback = function setErrorCallback1(callback) {
                    errorCallback = callback;
                };
                _clipperLib2.default.Error = function(message) {
                    if (errorCallback) {
                        errorCallback(message);
                    }
                };
                var CLIPPER = new _clipperLib2.default.Clipper();
                var CLIPPER_OFFSET = new _clipperLib2.default.ClipperOffset();
                var Shape = function() {
                    function Shape1() {
                        var paths = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
                        var closed = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
                        var capitalConversion = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                        var integerConversion = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
                        var removeDuplicates = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
                        _classCallCheck(this, Shape1);
                        this.paths = paths;
                        if (capitalConversion) {
                            this.paths = this.paths.map(mapLowerToCapital);
                        }
                        if (integerConversion) {
                            this.paths = this.paths.map(mapToRound);
                        }
                        if (removeDuplicates) {
                            this.paths = this.paths.map(filterPathsDuplicates);
                        }
                        this.closed = closed;
                    }
                    _createClass(Shape1, [
                        {
                            key: "_clip",
                            value: function _clip(clipShape, type) {
                                var solution = new _clipperLib2.default.PolyTree();
                                CLIPPER.Clear();
                                CLIPPER.AddPaths(this.paths, _clipperLib2.default.PolyType.ptSubject, this.closed);
                                CLIPPER.AddPaths(clipShape.paths, _clipperLib2.default.PolyType.ptClip, clipShape.closed);
                                CLIPPER.Execute(type, solution);
                                var newShape = _clipperLib2.default.Clipper.PolyTreeToPaths(solution);
                                return new Shape1(newShape, this.closed);
                            }
                        },
                        {
                            key: "union",
                            value: function union(clipShape) {
                                return this._clip(clipShape, _clipperLib2.default.ClipType.ctUnion);
                            }
                        },
                        {
                            key: "difference",
                            value: function difference(clipShape) {
                                return this._clip(clipShape, _clipperLib2.default.ClipType.ctDifference);
                            }
                        },
                        {
                            key: "intersect",
                            value: function intersect(clipShape) {
                                return this._clip(clipShape, _clipperLib2.default.ClipType.ctIntersection);
                            }
                        },
                        {
                            key: "xor",
                            value: function xor(clipShape) {
                                return this._clip(clipShape, _clipperLib2.default.ClipType.ctXor);
                            }
                        },
                        {
                            key: "offset",
                            value: function offset(_offset) {
                                var options = arguments.length <= 1 || arguments[1] === undefined ? {
                                } : arguments[1];
                                var _options$jointType = options.jointType;
                                var jointType = _options$jointType === undefined ? "jtSquare" : _options$jointType;
                                var _options$endType = options.endType;
                                var endType = _options$endType === undefined ? "etClosedPolygon" : _options$endType;
                                var _options$miterLimit = options.miterLimit;
                                var miterLimit = _options$miterLimit === undefined ? 2 : _options$miterLimit;
                                var _options$roundPrecisi = options.roundPrecision;
                                var roundPrecision = _options$roundPrecisi === undefined ? 0.25 : _options$roundPrecisi;
                                CLIPPER_OFFSET.Clear();
                                CLIPPER_OFFSET.ArcTolerance = roundPrecision;
                                CLIPPER_OFFSET.MiterLimit = miterLimit;
                                var offsetPaths = new _clipperLib2.default.Paths();
                                CLIPPER_OFFSET.AddPaths(this.paths, _clipperLib2.default.JoinType[jointType], _clipperLib2.default.EndType[endType]);
                                CLIPPER_OFFSET.Execute(offsetPaths, _offset);
                                return new Shape1(offsetPaths, true);
                            }
                        },
                        {
                            key: "scaleUp",
                            value: function scaleUp(factor) {
                                _clipperLib2.default.JS.ScaleUpPaths(this.paths, factor);
                                return this;
                            }
                        },
                        {
                            key: "scaleDown",
                            value: function scaleDown(factor) {
                                _clipperLib2.default.JS.ScaleDownPaths(this.paths, factor);
                                return this;
                            }
                        },
                        {
                            key: "firstPoint",
                            value: function firstPoint() {
                                var toLower = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
                                if (this.paths.length === 0) {
                                    return;
                                }
                                var firstPath = this.paths[0];
                                var firstPoint = firstPath[0];
                                if (toLower) {
                                    return vectorToLower(firstPoint);
                                } else {
                                    return firstPoint;
                                }
                            }
                        },
                        {
                            key: "lastPoint",
                            value: function lastPoint() {
                                var toLower = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
                                if (this.paths.length === 0) {
                                    return;
                                }
                                var lastPath = this.paths[this.paths.length - 1];
                                var lastPoint = this.closed ? lastPath[0] : lastPath[lastPath.length - 1];
                                if (toLower) {
                                    return vectorToLower(lastPoint);
                                } else {
                                    return lastPoint;
                                }
                            }
                        },
                        {
                            key: "areas",
                            value: function areas() {
                                var _this = this;
                                var areas = this.paths.map(function(path2, i) {
                                    return _this.area(i);
                                });
                                return areas;
                            }
                        },
                        {
                            key: "area",
                            value: function area(index1) {
                                var path2 = this.paths[index1];
                                var area = _clipperLib2.default.Clipper.Area(path2);
                                return area;
                            }
                        },
                        {
                            key: "totalArea",
                            value: function totalArea() {
                                return this.areas().reduce(function(totalArea1, area) {
                                    return totalArea1 + area;
                                }, 0);
                            }
                        },
                        {
                            key: "perimeter",
                            value: function perimeter(index1) {
                                var path2 = this.paths[index1];
                                var perimeter = _clipperLib2.default.JS.PerimeterOfPath(path2, this.closed, 1);
                                return perimeter;
                            }
                        },
                        {
                            key: "perimeters",
                            value: function perimeters() {
                                var _this2 = this;
                                return this.paths.map(function(path2) {
                                    return _clipperLib2.default.JS.PerimeterOfPath(path2, _this2.closed, 1);
                                });
                            }
                        },
                        {
                            key: "totalPerimeter",
                            value: function totalPerimeter() {
                                var perimeter = _clipperLib2.default.JS.PerimeterOfPaths(this.paths, this.closed);
                                return perimeter;
                            }
                        },
                        {
                            key: "reverse",
                            value: function reverse() {
                                _clipperLib2.default.Clipper.ReversePaths(this.paths);
                                return this;
                            }
                        },
                        {
                            key: "thresholdArea",
                            value: function thresholdArea(minArea) {
                                var _arr = [].concat(_toConsumableArray(this.paths));
                                for(var _i = 0; _i < _arr.length; _i++){
                                    var path2 = _arr[_i];
                                    var area = Math.abs(_clipperLib2.default.Clipper.Area(shape));
                                    if (area < minArea) {
                                        var index1 = this.paths.indexOf(path2);
                                        this.splice(index1, 1);
                                    }
                                }
                            }
                        },
                        {
                            key: "join",
                            value: function join(shape) {
                                var _paths;
                                (_paths = this.paths).splice.apply(_paths, [
                                    this.paths.length,
                                    0
                                ].concat(_toConsumableArray(shape.paths)));
                                return this;
                            }
                        },
                        {
                            key: "clone",
                            value: function clone() {
                                return new Shape1(_clipperLib2.default.JS.Clone(this.paths), this.closed);
                            }
                        },
                        {
                            key: "shapeBounds",
                            value: function shapeBounds() {
                                var bounds = _clipperLib2.default.JS.BoundsOfPaths(this.paths);
                                bounds.width = bounds.right - bounds.left;
                                bounds.height = bounds.bottom - bounds.top;
                                bounds.size = bounds.width * bounds.height;
                                return bounds;
                            }
                        },
                        {
                            key: "pathBounds",
                            value: function pathBounds(index2) {
                                var path3 = this.paths[index2];
                                var bounds = _clipperLib2.default.JS.BoundsOfPath(path3);
                                bounds.width = bounds.right - bounds.left;
                                bounds.height = bounds.bottom - bounds.top;
                                bounds.size = bounds.width * bounds.height;
                                return bounds;
                            }
                        },
                        {
                            key: "clean",
                            value: function clean(cleanDelta) {
                                return new Shape1(_clipperLib2.default.Clipper.CleanPolygons(this.paths, cleanDelta), this.closed);
                            }
                        },
                        {
                            key: "orientation",
                            value: function orientation(index2) {
                                var path3 = this.paths[index2];
                                return _clipperLib2.default.Clipper.Orientation(path3);
                            }
                        },
                        {
                            key: "pointInShape",
                            value: function pointInShape(point) {
                                var capitalConversion = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
                                var integerConversion = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                                if (capitalConversion) {
                                    point = vectorToCapital(point);
                                }
                                if (integerConversion) {
                                    point = roundVector(point);
                                }
                                for(var i = 0; i < this.paths.length; i++){
                                    var pointInPath = this.pointInPath(i, point);
                                    var orientation = this.orientation(i);
                                    if (!pointInPath && orientation || pointInPath && !orientation) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                        },
                        {
                            key: "pointInPath",
                            value: function pointInPath(index2, point) {
                                var capitalConversion = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                                var integerConversion = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
                                if (capitalConversion) {
                                    point = vectorToCapital(point);
                                }
                                if (integerConversion) {
                                    point = roundVector(point);
                                }
                                var path3 = this.paths[index2];
                                var intPoint = {
                                    X: Math.round(point.X),
                                    Y: Math.round(point.Y)
                                };
                                return _clipperLib2.default.Clipper.PointInPolygon(intPoint, path3) > 0;
                            }
                        },
                        {
                            key: "fixOrientation",
                            value: function fixOrientation() {
                                if (!this.closed) {
                                    return this;
                                }
                                if (this.totalArea() < 0) {
                                    this.reverse();
                                }
                                return this;
                            }
                        },
                        {
                            key: "removeOverlap",
                            value: function removeOverlap() {
                                console.warn("Shape.removeOverlap is being depricated, use Shape.simplify('pftNonZero') instead");
                                this.simplify("pftNonZero");
                            }
                        },
                        {
                            key: "simplify",
                            value: function simplify(fillType) {
                                if (this.closed) {
                                    var _shape = _clipperLib2.default.Clipper.SimplifyPolygons(this.paths, _clipperLib2.default.PolyFillType[fillType]);
                                    return new Shape1(_shape, true);
                                } else {
                                    return this;
                                }
                            }
                        },
                        {
                            key: "seperateShapes",
                            value: function seperateShapes() {
                                var _this3 = this;
                                var shapes = [];
                                if (!this.closed) {
                                    var _iteratorNormalCompletion = true;
                                    var _didIteratorError = false;
                                    var _iteratorError = undefined;
                                    try {
                                        for(var _iterator = this.paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                                            var path3 = _step.value;
                                            shapes.push(new Shape1([
                                                path3
                                            ], false));
                                        }
                                    } catch (err) {
                                        _didIteratorError = true;
                                        _iteratorError = err;
                                    } finally{
                                        try {
                                            if (!_iteratorNormalCompletion && _iterator.return) {
                                                _iterator.return();
                                            }
                                        } finally{
                                            if (_didIteratorError) {
                                                throw _iteratorError;
                                            }
                                        }
                                    }
                                } else {
                                    (function() {
                                        var areas = new WeakMap();
                                        var outlines = [];
                                        var holes = [];
                                        for(var i = 0; i < _this3.paths.length; i++){
                                            var _path = _this3.paths[i];
                                            var orientation = _this3.orientation(i);
                                            if (orientation) {
                                                var area = _this3.area(i);
                                                areas.set(_path, area);
                                                outlines.push(_path);
                                            } else {
                                                holes.push(_path);
                                            }
                                        }
                                        outlines.sort(function(a, b) {
                                            return areas.get(a) - areas.get(b);
                                        });
                                        var _iteratorNormalCompletion2 = true;
                                        var _didIteratorError2 = false;
                                        var _iteratorError2 = undefined;
                                        try {
                                            for(var _iterator2 = outlines[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                                                var outline = _step2.value;
                                                var _shape2 = [
                                                    outline
                                                ];
                                                var index2 = _this3.paths.indexOf(outline);
                                                var _arr2 = [].concat(holes);
                                                for(var _i2 = 0; _i2 < _arr2.length; _i2++){
                                                    var hole = _arr2[_i2];
                                                    var pointInHole = _this3.pointInPath(index2, hole[0]);
                                                    if (pointInHole) {
                                                        _shape2.push(hole);
                                                        var _index = holes.indexOf(hole);
                                                        holes.splice(_index, 1);
                                                    }
                                                }
                                                shapes.push(new Shape1(_shape2, true));
                                            }
                                        } catch (err) {
                                            _didIteratorError2 = true;
                                            _iteratorError2 = err;
                                        } finally{
                                            try {
                                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                                    _iterator2.return();
                                                }
                                            } finally{
                                                if (_didIteratorError2) {
                                                    throw _iteratorError2;
                                                }
                                            }
                                        }
                                    })();
                                }
                                return shapes;
                            }
                        },
                        {
                            key: "round",
                            value: function round() {
                                return new Shape1(this.paths.map(mapToRound), this.closed);
                            }
                        },
                        {
                            key: "removeDuplicates",
                            value: function removeDuplicates() {
                                return new Shape1(this.paths.map(filterPathsDuplicates), this.closed);
                            }
                        },
                        {
                            key: "mapToLower",
                            value: function mapToLower() {
                                return this.paths.map(mapCapitalToLower);
                            }
                        }
                    ]);
                    return Shape1;
                }();
                exports.default = Shape;
                function mapCapitalToLower(path4) {
                    return path4.map(vectorToLower);
                }
                function vectorToLower(_ref) {
                    var X = _ref.X;
                    var Y = _ref.Y;
                    return {
                        x: X,
                        y: Y
                    };
                }
                function mapLowerToCapital(path4) {
                    return path4.map(vectorToCapital);
                }
                function vectorToCapital(_ref2) {
                    var x = _ref2.x;
                    var y = _ref2.y;
                    return {
                        X: x,
                        Y: y
                    };
                }
                function mapToRound(path4) {
                    return path4.map(roundVector);
                }
                function roundVector(_ref3) {
                    var X = _ref3.X;
                    var Y = _ref3.Y;
                    return {
                        X: Math.round(X),
                        Y: Math.round(Y)
                    };
                }
                function filterPathsDuplicates(path4) {
                    return path4.filter(filterPathDuplicates);
                }
                function filterPathDuplicates(point, i, array) {
                    if (i === 0) {
                        return true;
                    }
                    var prevPoint = array[i - 1];
                    return !(point.X === prevPoint.X && point.Y === prevPoint.Y);
                }
            });
            index = unwrapExports(lib);
            exports_2("default", index);
            exports_2("__esModule", __esModule = true);
        }
    };
});
System.register("clipper-js", [
    "-/clipper-js@v1.0.2-Mou0diNPTgyilhisGDlW/dist=es2020/clipper-js"
], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var exportedNames_1 = {
        "default": true
    };
    function exportStar_1(m) {
        var exports = {
        };
        for(var n in m){
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) {
                exports[n] = m[n];
            }
        }
        exports_3(exports);
    }
    return {
        setters: [
            function(dist_es2020_1_1) {
                exportStar_1(dist_es2020_1_1);
                exports_3({
                    "default": dist_es2020_1_1["default"]
                });
            }, 
        ],
        execute: function() {
        }
    };
});
const __exp = __instantiate("clipper-js");
const __default = __exp["default"];
const pointConversion = (point)=>{
    if (Array.isArray(point)) return {
        x: point[0],
        y: point[1]
    };
    else return point;
};
function copy(turtle) {
    return new Turtle(JSON.parse(JSON.stringify({
        angle: turtle.angle,
        path: turtle.path
    })));
}
function createPath() {
    return [
        {
            points: [
                {
                    x: 0,
                    y: 0
                }
            ],
            fillColor: "none",
            strokeWidth: 1,
            strokeColor: "black",
            construction: false,
            dashed: 0,
            linecap: "butt",
            linejoin: "mitre"
        }
    ];
}
function move(point0, point1, turtle) {
    const { x: x0 , y: y0  } = point0;
    const { x: x1 , y: y1  } = point1;
    turtle.translate(x1 - x0, y1 - y0);
    return turtle;
}
function translate(x, y, turtle) {
    turtle.path = turtle.pointMap((point)=>({
            x: point.x + x,
            y: point.y + y
        })
    );
    return turtle;
}
function rotate(point, angle, turtle) {
    turtle.path = turtle.pointMap((p)=>{
        let delta = angle * 2 * Math.PI / 360;
        let hereX = p.x - point.x;
        let hereY = p.y - point.y;
        let newPoint = {
            x: hereX * Math.cos(delta) - hereY * Math.sin(delta) + point.x,
            y: hereY * Math.cos(delta) + hereX * Math.sin(delta) + point.y
        };
        return newPoint;
    });
    turtle.angle = turtle.angle + angle;
    return turtle;
}
function scale(xScale, yScale, turtle) {
    if (!yScale) yScale = xScale;
    let origin = turtle.start;
    turtle.path = turtle.pointMap((p)=>{
        let hereX = p.x;
        let hereY = p.y;
        let newPoint = {
            x: hereX * xScale,
            y: hereY * yScale
        };
        return newPoint;
    });
    turtle.alignHead();
    return turtle;
}
function goTo(point, down, turtle) {
    const end = turtle.end;
    const { x , y  } = point;
    turtle.addPoint({
        x,
        y
    }, down);
    turtle.angle = Math.atan2(end.y - y, end.x - x) * 180 / Math.PI + 180;
    return turtle;
}
function setAngle(angle, turtle) {
    turtle.angle = angle;
    return turtle;
}
function reverse(turtle) {
    turtle.path = turtle.path.map((x)=>({
            ...x,
            points: x.points.reverse()
        })
    );
    turtle.alignHead();
    return turtle;
}
const SCALE = 100;
const SCALE1 = 100;
function construction(turtle) {
    turtle.pathMap((p)=>p.construction = true
    );
    return turtle;
}
function lastPath(turtle) {
    let last = turtle.path;
    while(Array.isArray(last)){
        last = last[last.length - 1];
    }
    return last;
}
function firstPath(turtle) {
    return firstPathHelper(turtle.path);
}
function pointsFromLast(i, turtle) {
    return turtle.lastPath().points.slice(-1 - i)[0];
}
function pointsFromFirst(i, turtle) {
    return turtle.firstPath().points[i];
}
function flatten1(items) {
    const flat = [];
    items.forEach((item)=>{
        if (Array.isArray(item)) {
            flat.push(...flatten1(item));
        } else {
            flat.push(item);
        }
    });
    return flat;
}
function addPoint(point, down, turtle) {
    const lastPath1 = turtle.lastPath();
    const lastPathPoints = lastPath1.points;
    if (down) lastPathPoints.push(point);
    else if (lastPathPoints.length === 1) lastPath1.points = [
        point
    ];
    else {
        turtle.path.push({
            points: [
                point
            ],
            fillColor: "none",
            strokeWidth: 1,
            strokeColor: "black",
            construction: false,
            linecap: "butt",
            linejoin: "mitre"
        });
    }
    return turtle;
}
function pathMap(f, turtle) {
    return turtle.path.map((path4)=>pathMapHelper(path4, f)
    );
}
function pointMap(f, turtle) {
    return turtle.pathMap((path4)=>({
            ...path4,
            points: path4.points.map(f)
        })
    );
}
function pointFilter(f, turtle) {
    return turtle.pathMap((shape)=>({
            ...shape,
            points: shape.points.filter(f)
        })
    );
}
function lastAngle(turtle) {
    let angle;
    if (turtle.points.length > 1) {
        let lastPoint = turtle.pointsFromLast(0);
        let secondLastPoint = turtle.pointsFromLast(1);
        let x = lastPoint.x - secondLastPoint.x;
        let y = lastPoint.y - secondLastPoint.y;
        angle = Math.atan2(y, x) * 180 / Math.PI;
    } else {
        angle = 0;
    }
    return angle;
}
function alignHead(turtle) {
    turtle.angle = turtle.lastAngle();
    return turtle;
}
function extrema(turtle) {
    let xMin = Number.POSITIVE_INFINITY;
    let xMax = Number.NEGATIVE_INFINITY;
    let yMin = Number.POSITIVE_INFINITY;
    let yMax = Number.NEGATIVE_INFINITY;
    turtle.points.forEach((p)=>{
        if (xMin > p.x) xMin = p.x;
        if (xMax < p.x) xMax = p.x;
        if (yMin > p.y) yMin = p.y;
        if (yMax < p.y) yMax = p.y;
    });
    return {
        xMin,
        xMax,
        yMin,
        yMax
    };
}
function width1(turtle) {
    const { xMin , xMax  } = turtle.extrema();
    return Math.abs(xMin - xMax);
}
function height1(turtle) {
    const { yMin , yMax  } = turtle.extrema();
    return Math.abs(yMin - yMax);
}
function fillColor(color, turtle) {
    turtle.pathMap((p)=>p.fillColor = color
    );
    return turtle;
}
function polygonArea(vertices) {
    var area = 0;
    for(var i = 0; i < vertices.length; i++){
        let j = (i + 1) % vertices.length;
        area += vertices[i].x * vertices[j].y;
        area -= vertices[j].x * vertices[i].y;
    }
    return area / 2;
}
function strokeWidth(width1, turtle) {
    turtle.pathMap((p)=>p.strokeWidth = width1
    );
    return turtle;
}
function strokeColor(color, turtle) {
    turtle.pathMap((p)=>p.strokeColor = color
    );
    return turtle;
}
function strokeLinecap(type, turtle) {
    const TYPES = [
        "round",
        "butt",
        "square"
    ];
    if (!TYPES.includes(type)) throw "Unrecognized type: " + type;
    turtle.pathMap((p)=>p.linecap = type
    );
    return turtle;
}
function strokeLinejoin(type, turtle) {
    const TYPES = [
        "round",
        "mitre",
        "bevel"
    ];
    if (!TYPES.includes(type)) throw "Unrecognized type: " + type;
    turtle.pathMap((p)=>p.linejoin = type
    );
    return turtle;
}
function turn(turn1, turtle) {
    const angle = turtle.angle + turn1 % 360;
    turtle.angle = angle;
    return turtle;
}
const degreesToRad = (deg)=>deg / 360 * 2 * Math.PI
;
function turnForward(turn1, distance, turtle) {
    turtle.turn(turn1);
    turtle.forward(distance);
    return turtle;
}
function closePath(turtle) {
    turtle.addPoint({
        ...turtle.start
    });
    turtle.alignHead();
    return turtle;
}
function point1(target, turtle) {
    if (target === "start") return turtle.pointsFromFirst(0);
    else if (target === "end") return turtle.pointsFromLast(0);
    let { xMax , xMin , yMax , yMin  } = turtle.extrema();
    let middX = (xMax + xMin) / 2;
    let middY = (yMax + yMin) / 2;
    if (target === "center" || target === "center center" || target === "cc") return {
        x: middX,
        y: middY
    };
    else if (target === "min" || target === "left bottom" || target === "lb") return {
        x: xMin,
        y: yMin
    };
    else if (target === "max" || target === "right top" || target === "rt") return {
        x: xMax,
        y: yMax
    };
    else if (target === "min center" || target === "left center" || target === "lc") return {
        x: xMin,
        y: middY
    };
    else if (target === "min max" || target === "left top" || target === "lt") return {
        x: xMin,
        y: yMax
    };
    else if (target === "center min" || target === "center bottom" || target === "cb") return {
        x: middX,
        y: yMin
    };
    else if (target === "center max" || target === "center top" || target === "ct") return {
        x: middX,
        y: yMax
    };
    else if (target === "max min" || target === "right bottom" || target === "rb") return {
        x: xMax,
        y: yMin
    };
    else if (target === "max center" || target === "right center" || target === "rc") return {
        x: xMax,
        y: middY
    };
    else throw "\"" + target + "\"" + ` is not an origin point. "right" or "left" come first then "bottom" or "top"`;
}
function arc(angle, radius, down, turtle) {
    const chord = (r, theta)=>2 * r * Math.sin(theta * Math.PI / 360)
    ;
    const newPoint = (curAngle, curPoint, distance)=>{
        const xCos = Math.cos(curAngle * Math.PI / 180);
        const ySin = Math.sin(curAngle * Math.PI / 180);
        const x = curPoint.x + distance * xCos;
        const y = curPoint.y + distance * ySin;
        return {
            x,
            y
        };
    };
    if (angle < 0) radius = -radius;
    const endPoint = turtle.end;
    const ogAngle = turtle.angle;
    const res = Math.abs(Math.floor(angle / 2));
    [
        ...Array(res).keys()
    ].forEach((step)=>{
        const ang = 180 - (360 - angle / res * (step + 1)) / 2 + ogAngle;
        const { x , y  } = newPoint(ang, endPoint, chord(radius, angle / res * (step + 1)));
        turtle.goTo({
            x,
            y
        }, down);
    });
    turtle.setAngle(angle + ogAngle);
    return turtle;
}
function flip(direction, turtle) {
    const center = turtle.point("cc");
    let xDist, yDist;
    turtle.path = turtle.pointMap((p)=>{
        xDist = Math.abs(center.x - p.x);
        yDist = Math.abs(center.y - p.y);
        if (direction.includes("y")) {
            p.x = p.x < center.x ? p.x + 2 * xDist : p.x - 2 * xDist;
        }
        if (direction.includes("x")) {
            p.y = p.y < center.y ? p.y + 2 * yDist : p.y - 2 * yDist;
        }
        return p;
    });
    return turtle;
}
function repeat(num, turtle) {
    let ogTurtle = turtle.copy();
    let start = ogTurtle.start;
    let startAngle = turtle.angle;
    let newTurtle, end;
    for(let i = 0; i < num; i++){
        newTurtle = ogTurtle.copy();
        end = turtle.end;
        newTurtle.translate(end.x - start.x, end.y - start.y);
        newTurtle.rotate(newTurtle.point("start"), startAngle * (i + 1));
        newTurtle.points.forEach((p, i1)=>{
            if (i1 !== 0) turtle.addPoint(p);
        });
    }
    turtle.angle = startAngle * (num + 1);
    return turtle;
}
function mirror(turtle) {
    let newTurtle = turtle.copy();
    newTurtle.reverse();
    newTurtle.flip("y");
    const { x , y  } = turtle.point("end");
    newTurtle.move(newTurtle.point("start"), {
        x,
        y
    });
    newTurtle.rotate(newTurtle.point("start"), turtle.angle * 2);
    newTurtle.points.forEach((p, i)=>{
        if (i > 0) turtle.addPoint(p);
    });
    turtle.alignHead();
    return turtle;
}
const getDistance = (p1, p2)=>Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
;
function flatGoTo(point1, axis, turtle) {
    const { x , y  } = point1;
    const angle = turtle.angle;
    const end = turtle.end;
    const m = Math.tan(angle * Math.PI / 180);
    const b = end.y - m * end.x;
    if (axis === "x") {
        const nextX = (y - b) / m;
        turtle.goTo({
            x: nextX,
            y
        });
    } else if (axis === "y") {
        const nextY = m * x + b;
        turtle.goTo({
            x,
            y: nextY
        });
    }
    turtle.goTo({
        x,
        y
    });
    return turtle;
}
function originate(turtle) {
    return turtle.move(turtle.cc, {
        x: 0,
        y: 0
    });
}
function union(turtle, args) {
    turtle = args.length > 0 ? group(turtle, group(...args)) : turtle;
    const [subjectPaths, clipPaths] = turtle.getBooleanForm();
    if (clipPaths === undefined || subjectPaths === undefined) return turtle;
    const subject = new __default(subjectPaths, true);
    const clip = new __default(clipPaths, true);
    const result = subject.union(clip);
    turtle.setBooleanForm(result);
    return turtle;
}
function difference(turtle, args) {
    turtle = args.length > 0 ? group(turtle, group(...args)) : turtle;
    const [subjectPaths, clipPaths] = turtle.getBooleanForm();
    if (clipPaths === undefined || subjectPaths === undefined) return turtle;
    const subject = new __default(subjectPaths, true);
    const clip = new __default(clipPaths, true);
    const result = subject.difference(clip);
    turtle.setBooleanForm(result);
    return turtle;
}
function intersect(turtle, args) {
    turtle = args.length > 0 ? group(turtle, group(...args)) : turtle;
    const [subjectPaths, clipPaths] = turtle.getBooleanForm();
    if (clipPaths === undefined || subjectPaths === undefined) return turtle;
    const subject = new __default(subjectPaths, true);
    const clip = new __default(clipPaths, true);
    const result = subject.intersect(clip);
    turtle.setBooleanForm(result);
    return turtle;
}
function xor(turtle) {
    const [subjectPaths, clipPaths] = turtle.getBooleanForm();
    if (clipPaths === undefined || subjectPaths === undefined) return turtle;
    const subject = new __default(subjectPaths, true);
    const clip = new __default(clipPaths, true);
    const result = subject.xor(clip);
    turtle.setBooleanForm(result);
    return turtle;
}
const overlap = (p0, p1)=>0.00000001 > Math.abs(p0.x - p1.x) + Math.abs(p0.y - p1.y)
;
function copyPaste(num, transformations, turtle) {
    let newTurtles = [];
    let lastTurtle = turtle.copy();
    let angle;
    for(let i = 0; i < num; i++){
        transformations(lastTurtle);
        newTurtles.push(lastTurtle);
        lastTurtle = lastTurtle.copy();
        angle = lastTurtle.angle;
    }
    let path4 = [
        ...turtle.path
    ];
    for (const newTurtle of newTurtles){
        path4 = [
            ...path4,
            ...newTurtle.path
        ];
    }
    turtle.path = path4;
    turtle.angle = angle;
    return turtle;
}
function newStroke(start, type, turtle) {
    const { x , y  } = turtle.end;
    if (Math.abs(start.x - x) < 0.00001 && Math.abs(start.y - y) < 0.00001) return turtle;
    const ps = turtle.points;
    if (ps.length === 1) {
        turtle.lastPath().points[0] = start;
    } else {
        turtle.path.push({
            points: [
                start
            ],
            fillColor: "none",
            strokeWidth: 1,
            strokeColor: "black",
            construction: false,
            linecap: "butt",
            linejoin: "mitre"
        });
        turtle.angle = 0;
    }
    return turtle;
}
function getSqDist(p1, p2) {
    var dx = p1[0] - p2[0], dy = p1[1] - p2[1];
    return dx * dx + dy * dy;
}
const getDistance1 = (p1, p2)=>Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
;
function placeAlong(turtle, ogTurtle) {
    const fp = turtle.start;
    const lp = turtle.end;
    const newTurtles = turtle.points.reduce((acc, cur, i)=>{
        const newTurtle = ogTurtle.copy().move(ogTurtle.cc, cur);
        return acc.concat(newTurtle);
    }, []);
    const grouped = group(...newTurtles);
    ogTurtle.path = grouped.path;
    return ogTurtle;
}
function trim(start, end, turtle) {
    const newTurtle = new Turtle();
    let count = 0;
    turtle.pathMap((path4)=>{
        let started = false;
        path4.points.forEach((p)=>{
            if (count >= start && count <= end) {
                if (!started) {
                    newTurtle.newStroke(p);
                    started = true;
                } else {
                    newTurtle.addPoint(p);
                }
            }
            count++;
        });
    });
    turtle.path = newTurtle.path;
    turtle.alignHead();
    return turtle;
}
function dashed(num, turtle) {
    turtle.pathMap((p)=>p.dashed = num
    );
    return turtle;
}
function centroid(turtle) {
    const pts = turtle.points;
    if (pts.length === 1) return pts[0];
    else if (pts.length === 2) return {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
    };
    var first = pts[0], last = pts[pts.length - 1];
    if (first.x != last.x || first.y != last.y) pts.push(first);
    var twicearea = 0, x = 0, y = 0, nPts = pts.length, p1, p2, f;
    for(var i = 0, j = nPts - 1; i < nPts; j = i++){
        p1 = pts[i];
        p2 = pts[j];
        f = p1.x * p2.y - p2.x * p1.y;
        twicearea += f;
        x += (p1.x + p2.x) * f;
        y += (p1.y + p2.y) * f;
    }
    f = twicearea * 3;
    return {
        x: x / f,
        y: y / f
    };
}
function vec(x, y, down, turtle) {
    if (x === 0 && y === 0) return turtle;
    const { x: lx , y: ly  } = turtle.end;
    turtle.addPoint({
        x: lx + x,
        y: ly + y
    }, down);
    turtle.angle = Math.atan2(y, x) * 180 / Math.PI;
    return turtle;
}
function bezier(string, turtle) {
    const polylines = flattenPath(string).map((x)=>x.points
    );
    polylines.forEach((pl)=>{
        pl.forEach((point1, i)=>i === 0 ? turtle.newStroke(point1) : turtle.goTo(point1)
        );
    });
    return turtle;
}
function slide(angle, distance, turtle) {
    turtle.path = turtle.pointMap((point1)=>({
            x: point1.x + distance * Math.cos(angle / 180 * Math.PI),
            y: point1.y + distance * Math.sin(angle / 180 * Math.PI)
        })
    );
    return turtle;
}
const round = (num, prec = 0)=>prec === 0 ? num : Math.round(num * prec) / prec
;
function lSystem({ axiom , rules , instructions , steps , max ,  }, turtle) {
    let state = typeof axiom === "string" ? axiom.split("") : axiom;
    for(let i = 0; i < steps; i++){
        let newState = [];
        state.forEach((symbol)=>{
            let replacement = rules[symbol] ?? [
                symbol
            ];
            if (typeof replacement === "string") replacement = replacement.split("");
            newState.push(...replacement);
        });
        state = newState;
    }
    const t = turtle;
    t.l_system_tape = state;
    state.forEach((c, i1)=>{
        if ((max === undefined || i1 < max) && instructions[c]) return instructions[c](t);
    });
    return t;
}
function group() {
    const turtles = arguments;
    let path4 = [];
    for (const turtle of turtles){
        if (turtle.points.length === 1) continue;
        path4 = turtle.path.length === 1 ? [
            ...path4,
            ...turtle.path
        ] : [
            ...path4,
            turtle.path
        ];
    }
    const __final = new Turtle();
    if (path4.length > 0) __final.path = path4;
    __final.angle = turtles[turtles.length - 1].angle;
    return __final;
}
function setBooleanForm(clippedPaths, turtle) {
    let newPaths = Object.values(clippedPaths.paths).map((p)=>{
        p = p.map(({ X , Y  })=>({
                x: X / SCALE,
                y: Y / SCALE
            })
        );
        const points = [
            ...p,
            p[0]
        ];
        return {
            points,
            fillColor: "none",
            strokeWidth: 1,
            strokeColor: "black",
            construction: false
        };
    });
    turtle.path = newPaths;
    return turtle;
}
function flatten2(items) {
    const flat = [];
    items.forEach((item)=>{
        if (Array.isArray(item)) {
            flat.push(...flatten2(item));
        } else {
            flat.push(item);
        }
    });
    return flat;
}
const pointAdjust = (p)=>{
    const temp = {
    };
    temp["X"] = Math.round(p.x * SCALE1);
    temp["Y"] = Math.round(p.y * SCALE1);
    return temp;
};
function getBooleanForm(turtle) {
    let [tool, ...body] = turtle.path.reverse();
    tool = Array.isArray(tool) ? flatten2(tool) : [
        tool
    ];
    body = Array.isArray(body) ? flatten2(body) : [
        body
    ];
    tool = tool.map((p)=>p.points.map(pointAdjust)
    );
    body = body.map((p)=>p.points.map(pointAdjust)
    );
    return body && tool ? [
        body,
        tool
    ] : tool;
}
function forward(distance, down, turtle) {
    if (distance === 0) return turtle;
    const lastPoint = turtle.end;
    const angle = turtle.angle;
    const xCos = Math.cos(degreesToRad(angle));
    const ySin = Math.sin(degreesToRad(angle));
    const x = lastPoint.x + distance * xCos;
    const y = lastPoint.y + distance * ySin;
    turtle.addPoint({
        x,
        y
    }, down);
    return turtle;
}
const getAngle = (p1, p2)=>180 / Math.PI * Math.atan2(p2.y - p1.y, p2.x - p1.x)
;
const getIntraDist = (turtle, i0, i1)=>getDistance(turtle.pointsFromLast(i0), turtle.pointsFromLast(i1))
;
const getIntraAngle = (turtle, i0, i1)=>getAngle(turtle.pointsFromLast(i0), turtle.pointsFromLast(i1))
;
const isClosed = ({ points  })=>{
    const path4 = points;
    const EPSILON = 0.00000001;
    const firstPoint = path4[0];
    const lastPoint = path4[path4.length - 1];
    const xDelta = Math.abs(firstPoint.x - lastPoint.x);
    const yDelta = Math.abs(firstPoint.y - lastPoint.y);
    const closed = xDelta < 0.00000001 && yDelta < 0.00000001;
    return closed;
};
function fillet(radius, turtle) {
    const lastPath1 = turtle.lastPath();
    const l = lastPath1.points.length;
    if (l < 3) return turtle;
    const dist1 = getIntraDist(turtle, 0, 1);
    const dist0 = getIntraDist(turtle, 1, 2);
    const ang0 = getIntraAngle(turtle, 1, 0);
    const ang1 = getIntraAngle(turtle, 2, 1);
    const ang = ang0 - ang1;
    const lose = Math.abs(Math.tan(ang / 360 * Math.PI) * radius);
    lastPath1.points = lastPath1.points.slice(0, -2);
    turtle.setAngle(ang1);
    turtle.forward(dist0 - lose);
    let circleAng = ang;
    if (circleAng > 180) {
        circleAng = ang - 360;
    } else if (circleAng < -180) {
        circleAng = 360 + ang;
    }
    arc(circleAng, radius, true, turtle);
    turtle.forward(dist1 - lose);
    return turtle;
}
function offset1(distance, ops, turtle) {
    let { endType , jointType ="jtRound" , miterLimit =2 , roundPrecision =0.25  } = ops;
    if (!endType) {
        const closed = overlap(turtle.start, turtle.end);
        endType = closed ? 'etClosedRound' : "etOpenRound";
    }
    const paths = turtle.getBooleanForm().flat();
    const subject = new __default(paths, true);
    const result = subject.offset(distance * 100, {
        jointType,
        endType,
        miterLimit,
        roundPrecision
    });
    turtle.setBooleanForm(result);
    return turtle;
}
function getSqSegDist(p, p1, p2) {
    var x = p1[0], y = p1[1], dx = p2[0] - x, dy = p2[1] - y;
    if (dx !== 0 || dy !== 0) {
        var t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x = p2[0];
            y = p2[1];
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
}
function simplifyRadialDist(points, sqTolerance) {
    var prevPoint = points[0], newPoints = [
        prevPoint
    ], point1;
    for(var i = 1, len = points.length; i < len; i++){
        point1 = points[i];
        if (getSqDist(point1, prevPoint) > sqTolerance) {
            newPoints.push(point1);
            prevPoint = point1;
        }
    }
    if (prevPoint !== point1) newPoints.push(point1);
    return newPoints;
}
function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance, index3;
    for(var i = first + 1; i < last; i++){
        var sqDist = getSqSegDist(points[i], points[first], points[last]);
        if (sqDist > maxSqDist) {
            index3 = i;
            maxSqDist = sqDist;
        }
    }
    if (maxSqDist > sqTolerance) {
        if (index3 - first > 1) simplifyDPStep(points, first, index3, sqTolerance, simplified);
        simplified.push(points[index3]);
        if (last - index3 > 1) simplifyDPStep(points, index3, last, sqTolerance, simplified);
    }
}
function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;
    var simplified = [
        points[0]
    ];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);
    return simplified;
}
function simplify(points, tolerance, highestQuality) {
    if (points.length <= 2) return points;
    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);
    return points;
}
function resize(canvas) {
    const { width: w , height: h  } = canvas.getBoundingClientRect();
    canvas.width = w;
    canvas.height = h;
    return {
        w,
        h
    };
}
const getImgData = (canvas)=>canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
;
function draw(textString, canvas, resizeIt = true) {
    const { w , h  } = resize(canvas);
    var ctx = canvas.getContext("2d");
    const padding = 0;
    ctx.font = "100pt helvetica";
    ctx.textBaseline = 'middle';
    ctx.textAlign = "center";
    const mT = ctx.measureText(textString);
    const tw = mT.width + 0;
    const textHeight = mT.fontBoundingBoxAscent + mT.fontBoundingBoxDescent;
    if (resizeIt) {
        canvas.style.height = `${textHeight}px`;
        canvas.style.width = `${tw}px`;
    }
    ctx.fillText(textString, tw / 2, h / 2);
    if (resizeIt) draw(textString, canvas, false);
}
function interpolate(side, neighbors, step) {
    let y0, y1;
    if (side === 0) {
        y0 = neighbors[0];
        y1 = neighbors[1];
    } else if (side === 1) {
        y0 = neighbors[1];
        y1 = neighbors[2];
    } else if (side === 2) {
        y0 = neighbors[3];
        y1 = neighbors[2];
    } else if (side === 3) {
        y0 = neighbors[3];
        y1 = neighbors[0];
    }
    let x0 = -1;
    let x1 = 1;
    let m = (y1 - y0) / (x1 - x0);
    let b = y1 - m * x1;
    let pointFiveX = (0.5 - b) / m;
    return step * pointFiveX;
}
const RULES_INTERPOLATED = {
    "0000": ([x, y], step, neighbors)=>[]
    ,
    "0001": ([x, y], step, neighbors)=>[
            [
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ],
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ]
            ]
        ]
    ,
    "0010": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ],
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ]
            ]
        ]
    ,
    "0100": ([x, y], step, neighbors)=>[
            [
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ],
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ]
            ]
        ]
    ,
    "1000": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ],
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ]
            ]
        ]
    ,
    "0011": ([x, y], step, neighbors)=>[
            [
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ],
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ]
            ]
        ]
    ,
    "0101": ([x, y], step, neighbors)=>[
            [
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ],
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ]
            ],
            [
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ],
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ]
            ]
        ]
    ,
    "1001": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ],
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ]
            ]
        ]
    ,
    "0110": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ],
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ]
            ]
        ]
    ,
    "1010": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ],
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ]
            ],
            [
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ],
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ]
            ]
        ]
    ,
    "1100": ([x, y], step, neighbors)=>[
            [
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ],
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ]
            ]
        ]
    ,
    "0111": ([x, y], step, neighbors)=>[
            [
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ],
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ]
            ]
        ]
    ,
    "1011": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(0, neighbors, step),
                    y - step
                ],
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ]
            ]
        ]
    ,
    "1110": ([x, y], step, neighbors)=>[
            [
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ],
                [
                    x - step,
                    y - interpolate(3, neighbors, step)
                ]
            ]
        ]
    ,
    "1101": ([x, y], step, neighbors)=>[
            [
                [
                    x + step,
                    y + interpolate(1, neighbors, step)
                ],
                [
                    x + interpolate(2, neighbors, step),
                    y + step
                ]
            ]
        ]
    ,
    "1111": ([x, y], step, neighbors)=>[]
};
const DIRECTION = {
    "0000": undefined,
    "0001": "down",
    "0010": "right",
    "0100": "up",
    "1000": "left",
    "0011": "right",
    "0101": undefined,
    "1001": "down",
    "0110": "up",
    "1010": undefined,
    "1100": "left",
    "0111": "up",
    "1011": "right",
    "1110": "left",
    "1101": "down",
    "1111": undefined
};
function marchImage(imgData) {
    let { data: og , width: w , height: h  } = imgData;
    const getGrey = (row, col)=>og[(row * w + col) * 4 + 3] / 255
    ;
    const getNeighbors = (row, col)=>[
            getGrey(row - 1, col - 1),
            getGrey(row - 1, col),
            getGrey(row, col),
            getGrey(row, col - 1), 
        ]
    ;
    const getCode = (neighbors)=>neighbors.map((x)=>x >= 0.5 ? 1 : 0
        ).join("")
    ;
    const allLines = [];
    const seen = {
    };
    let last = [];
    for(let y = 1; y < h; y++){
        for(let x = 1; x < w; x++){
            if (seen[`${x},${y}`]) continue;
            let neighbors = getNeighbors(y, x);
            let string = getCode(neighbors);
            let rule = RULES_INTERPOLATED[string];
            let direction = DIRECTION[string];
            const lines = rule([
                x,
                y
            ], 0.5, neighbors);
            seen[`${x},${y}`] = true;
            let newPoints = lines.flat();
            if (newPoints.length > 0) allLines.push(lines.flat());
            if (direction) {
                let last1 = [
                    x,
                    y
                ];
                while(direction){
                    if (direction === "up") y -= 1;
                    else if (direction === "down") y += 1;
                    else if (direction === "right") x += 1;
                    else if (direction === "left") x -= 1;
                    if (seen[`${x},${y}`] === true) break;
                    neighbors = getNeighbors(y, x);
                    string = getCode(neighbors);
                    rule = RULES_INTERPOLATED[string];
                    direction = DIRECTION[string];
                    seen[`${x},${y}`] = true;
                    let lines1 = rule([
                        x,
                        y
                    ], 0.5, neighbors);
                    let lastPolyLine = allLines[allLines.length - 1];
                    lines1.forEach((l)=>{
                        lastPolyLine.push(l[1]);
                    });
                }
                [x, y] = last1;
            }
        }
    }
    return allLines;
}
function textToPolylines(str) {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    draw(str, canvas);
    const imgData = getImgData(canvas);
    let lines = marchImage(imgData);
    lines = lines.map((line1)=>{
        line1 = simplify(line1, 0.1);
        return line1.reverse();
    });
    document.body.removeChild(canvas);
    return lines;
}
const cache = {
};
function text1(string, turtle) {
    const polylines = cache[string] || textToPolylines(string);
    cache[string] = polylines;
    polylines.forEach((pl)=>{
        pl.forEach((point1, i)=>{
            if (i === 0) turtle.newStroke(point1);
            turtle.goTo(point1);
        });
    });
    turtle.flip("x");
    return turtle;
}
function flatten3(items) {
    const flat = [];
    items.forEach((item)=>{
        if (Array.isArray(item)) {
            flat.push(...flatten3(item));
        } else {
            flat.push(item);
        }
    });
    return flat;
}
function polylines(asArray, prec, turtle) {
    turtle.floodFill("black");
    const roundPathPts = (path4)=>({
            inside: path4.fillColor === "white",
            pts: path4.points.map(({ x , y  })=>asArray ? [
                    round(x, prec),
                    round(y, prec)
                ] : {
                    x: round(x, prec),
                    y: round(y, prec)
                }
            )
        })
    ;
    let pls = flatten3(turtle.path).map(roundPathPts);
    return pls;
}
function crossProduct(a, b) {
    return a.x * b.y - b.x * a.y;
}
function doBoundingBoxesIntersect(a, b) {
    return a.xMin <= b.xMax && a.xMax >= b.xMin && a.yMin <= b.yMax && a.yMax >= b.yMin;
}
function isPointRightOfLine(line1, point1) {
    let aTmp = [
        {
            x: 0,
            y: 0
        },
        {
            x: line1[1].x - line1[0].x,
            y: line1[1].y - line1[0].y
        }
    ];
    let bTmp = {
        x: point1.x - line1[0].x,
        y: point1.y - line1[0].y
    };
    let r = crossProduct(aTmp[1], bTmp);
    return r < 0;
}
function lineSegmentCrossesLine(a, b) {
    return isPointRightOfLine(a, b[0]) ^ isPointRightOfLine(a, b[1]);
}
function getBoundingBox(line1) {
    let xMin = Math.min(line1[0].x, line1[1].x);
    let xMax = Math.max(line1[0].x, line1[1].x);
    let yMin = Math.min(line1[0].y, line1[1].y);
    let yMax = Math.max(line1[0].y, line1[1].y);
    return {
        xMin,
        xMax,
        yMin,
        yMax
    };
}
function doLinesIntersect(a, b) {
    let box1 = getBoundingBox(a);
    let box2 = getBoundingBox(b);
    return doBoundingBoxesIntersect(box1, box2) && lineSegmentCrossesLine(a, b) && lineSegmentCrossesLine(b, a);
}
function isRectangle({ x: x0 , y: y0  }, { x: x1 , y: y1  }, { x: x2 , y: y2  }, { x: x3 , y: y3  }) {
    let cx, cy, dd0, dd1, dd2, dd3;
    cx = (x0 + x1 + x2 + x3) / 4;
    cy = (y0 + y1 + y2 + y3) / 4;
    dd0 = (cx - x0) ** 2 + (cy - y0) ** 2;
    dd1 = (cx - x1) ** 2 + (cy - y1) ** 2;
    dd2 = (cx - x2) ** 2 + (cy - y2) ** 2;
    dd3 = (cx - x3) ** 2 + (cy - y3) ** 2;
    return approxEq(dd0, dd1) && approxEq(dd0, dd2) && approxEq(dd0, dd3);
}
const approxEq = (x, y)=>Math.abs(x - y) < 1
;
const samePt = (pt0, pt1)=>approxEq(pt0.x, pt1.x) && approxEq(pt0.y, pt1.y)
;
const dist2 = (pt0, pt1)=>(pt1.x - pt0.x) ** 2 + (pt1.y - pt0.y) ** 2
;
function getMidpoint(p0, p1) {
    return {
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2
    };
}
function ptContained(pt, pts) {
    let numPoints = pts.length;
    let intersections = 0;
    for(let i = 0, j = 1; j < numPoints; j++, i++){
        let seg = [
            pts[i],
            pts[j]
        ];
        let ray = [
            pt,
            {
                x: pt.x,
                y: -999999999999
            }
        ];
        if (doLinesIntersect(seg, ray)) intersections++;
    }
    return intersections % 2 !== 0;
}
function ptsAreRight(p0, p1, p2) {
    const midPt = getMidpoint(p0, p2);
    const a = dist2(p0, p1);
    const b = dist2(p1, p2);
    const c = dist2(p0, p2);
    const isRight = approxEq(a + b, c);
    return {
        isRight,
        midPt
    };
}
function getTabsPls(pls) {
    let tabs = [];
    for(let i = 0; i < pls.length; i++){
        let pl = pls[i];
        const n = pl.pts.length;
        for(let i1 = 0; i1 < n - 2; i1++){
            const [p0, p1, p2] = pl.pts.slice(i1);
            const { isRight , midPt  } = ptsAreRight(p0, p1, p2);
            if (isRight) {
                let contained = ptContained(midPt, pl.pts);
                tabs.push({
                    contained: contained && !pl.inside,
                    midPt,
                    pts: [
                        p0,
                        p1,
                        p2
                    ]
                });
                const fivePts = pl.pts.length === 5;
                if (fivePts) {
                    const [p01, p11, p21, p3] = pl.pts;
                    let isRect = isRectangle(p01, p11, p21, p3);
                    if (isRect) i1 += 1;
                }
            }
            if (i1 === n - 3) {
                const p21 = pl.pts[1];
                const [p01, p11] = pl.pts.slice(i1 + 1);
                const { isRight: isRight1 , midPt: midPt1  } = ptsAreRight(p01, p11, p21);
                if (true) {
                    let contained = ptContained(midPt1, pl.pts);
                    tabs.push({
                        contained: contained && !pl.inside,
                        midPt: midPt1,
                        pts: [
                            p01,
                            p11,
                            p21
                        ],
                        last: true
                    });
                    const fivePts = pl.pts.length === 5;
                    if (fivePts) {
                        const [p02, p12, p22, p3] = pl.pts;
                        let isRect = isRectangle(p02, p12, p22, p3);
                        if (isRect) i1 += 1;
                    }
                }
            }
        }
    }
    const fusedTabs = [];
    for(let i1 = 0; i1 < tabs.length; i1++){
        let tab0 = tabs[i1];
        for(let j = i1 + 1; j < tabs.length; j++){
            let tab1 = tabs[j];
            if (samePt(tab0.midPt, tab1.midPt)) {
                tab0.pts.push(tab1.pts[2]);
                fusedTabs.push(tab0);
            }
        }
    }
    return [
        tabs,
        fusedTabs
    ];
}
function getTabs(turtle) {
    return getTabsPls(turtle.copy().polylines());
}
function points(turtle) {
    return flatten1(turtle.pathMap((x)=>x.points
    ));
}
const clockwise = (ps)=>polygonArea(ps) > 0
;
function floodFill(color, turtle) {
    turtle.xor();
    turtle.pathMap((p, i)=>{
        let cw = clockwise(p.points);
        if (cw) p.fillColor = color;
        else p.fillColor = "white";
    });
    return turtle;
}
class Turtle {
    constructor(init){
        this.angle = 0;
        this.path = createPath();
        this.savedStates = [];
        if (init) {
            this.angle = init.angle;
            this.path = init.path;
        }
    }
    firstPath() {
        return firstPath(this);
    }
    lastPath() {
        return lastPath(this);
    }
    pointsFromLast(i) {
        return pointsFromLast(i, this);
    }
    pointsFromFirst(i) {
        return pointsFromFirst(i, this);
    }
    addPoint(point, down = true) {
        return addPoint(point, down, this);
    }
    pathMap(func) {
        return pathMap(func, this);
    }
    pointMap(func) {
        return pointMap(func, this);
    }
    pointFilter(func) {
        return pointFilter(func, this);
    }
    extrema() {
        return extrema(this);
    }
    copy() {
        return copy(this);
    }
    setBooleanForm(paths) {
        return setBooleanForm(paths, this);
    }
    getBooleanForm() {
        return getBooleanForm(this);
    }
    point(target) {
        return point1(target, this);
    }
    store() {
        this.savedStates.push({
            pos: this.end,
            angle: this.angle
        });
        return this;
    }
    restore() {
        const state = this.savedStates.pop();
        this.goTo(state.pos, false);
        this.angle = state.angle;
        return this;
    }
    newStroke(start = [
        0,
        0
    ], type = "point") {
        return newStroke(pointConversion(start), type, this);
    }
    construction() {
        return construction(this);
    }
    lastAngle() {
        return lastAngle(this);
    }
    alignHead() {
        return alignHead(this);
    }
    fillColor(color) {
        return fillColor(color, this);
    }
    strokeWidth(thickness) {
        return strokeWidth(thickness, this);
    }
    strokeColor(color) {
        return strokeColor(color, this);
    }
    strokeLinecap(type) {
        return strokeLinecap(type, this);
    }
    strokeLinejoin(type) {
        return strokeLinejoin(type, this);
    }
    turn(angle) {
        return turn(angle, this);
    }
    goTo(point, down = true) {
        return goTo(pointConversion(point), down, this);
    }
    forward(distance, down = true) {
        return forward(distance, down, this);
    }
    arc(angle, radius, down = true) {
        return arc(angle, radius, down, this);
    }
    turnForward(angle, distance) {
        return turnForward(angle, distance, this);
    }
    vec(x, y, down = true) {
        return vec(x, y, down, this);
    }
    closePath() {
        return closePath(this);
    }
    move(point0, point1) {
        return move(pointConversion(point0), pointConversion(point1), this);
    }
    translate(x, y) {
        return translate(x, y, this);
    }
    rotate(point, angle) {
        return rotate(pointConversion(point), angle, this);
    }
    scale(xScale, yScale) {
        return scale(xScale, yScale, this);
    }
    originate() {
        return originate(this);
    }
    setAngle(angle) {
        return setAngle(angle, this);
    }
    reverse() {
        return reverse(this);
    }
    flip(axis) {
        return flip(axis, this);
    }
    repeat(num) {
        return repeat(num, this);
    }
    mirror() {
        return mirror(this);
    }
    fillet(radius) {
        return fillet(radius, this);
    }
    roundCorners(radius, all = false) {
        return roundCorners(radius, all, this);
    }
    thicken(thickness) {
        return thicken(thickness, this);
    }
    flatGoTo(point, axis) {
        return flatGoTo(pointConversion(point), axis, this);
    }
    copyPaste(num, transformations) {
        return copyPaste(num, transformations, this);
    }
    offset(distance, options = {
    }) {
        return offset1(distance, options, this);
    }
    outline() {
        return offset1(0, {
            endType: "etClosedPolygon"
        }, this);
    }
    expand(distance) {
        return offset1(distance, {
            endType: "etClosedPolygon"
        }, this);
    }
    intersect() {
        return intersect(this, arguments);
    }
    difference() {
        return difference(this, arguments);
    }
    union() {
        return union(this, arguments);
    }
    xor() {
        return xor(this);
    }
    text(word) {
        return text1(word, this);
    }
    dogbone(radius, all = false) {
        return dogbone(radius, all, this);
    }
    right(angle) {
        return turn(-angle, this);
    }
    left(angle) {
        return turn(angle, this);
    }
    trim(start, end) {
        return trim(start, end, this);
    }
    placeAlong(turtle) {
        return placeAlong(turtle, this);
    }
    dashed(number) {
        return dashed(number, this);
    }
    bezier(string) {
        return bezier(string, this);
    }
    slide(angle, distance) {
        return slide(angle, distance, this);
    }
    polylines(asArray = false, prec = 0) {
        return polylines(asArray, prec, this);
    }
    getTabs() {
        return getTabs(this);
    }
    lSystem(args) {
        return lSystem(args, this);
    }
    get start() {
        return point1("start", this);
    }
    get end() {
        return point1("end", this);
    }
    get lt() {
        return point1("lt", this);
    }
    get lc() {
        return point1("lc", this);
    }
    get lb() {
        return point1("lb", this);
    }
    get ct() {
        return point1("ct", this);
    }
    get cc() {
        return point1("cc", this);
    }
    get cb() {
        return point1("cb", this);
    }
    get rt() {
        return point1("rt", this);
    }
    get rc() {
        return point1("rc", this);
    }
    get rb() {
        return point1("rb", this);
    }
    get centroid() {
        return centroid(this);
    }
    get width() {
        return width1(this);
    }
    get height() {
        return height1(this);
    }
    get points() {
        return points(this);
    }
    floodFill(color) {
        return floodFill(color, this);
    }
}
function firstPathHelper(path4) {
    const first = path4[0];
    return Array.isArray(first) ? firstPathHelper(first) : first;
}
function pathMapHelper(path4, f) {
    return Array.isArray(path4) ? path4.map((p)=>pathMapHelper(p, f)
    ) : f(path4);
}
const getIntraDist2 = (path4, i0, i1)=>getDistance(path4[i0], path4[i1])
;
const getIntraAngle2 = (path4, i0, i1)=>getAngle(path4[i0], path4[i1])
;
function roundCornersPath(radius, all, path4) {
    const l = path4.points.length;
    if (l < 3) return path4;
    const newTurtle = new Turtle();
    const numPoints = path4.points.length;
    const { x , y  } = path4.points[0];
    newTurtle.move(newTurtle.start, {
        x,
        y
    });
    let remove = 0;
    let firstLose = 0;
    for(let i = 0; i < numPoints - 2; i++){
        const dist0 = getIntraDist2(path4.points, i, i + 1);
        const dist1 = getIntraDist2(path4.points, i + 1, i + 2);
        const ang0 = getIntraAngle2(path4.points, i, i + 1);
        const ang1 = getIntraAngle2(path4.points, i + 1, i + 2);
        let ang = ang1 - ang0;
        if (Math.abs(ang) < 3 && !all) {
            newTurtle.goTo(path4.points[i + 1]);
            if (i === path4.points.length - 3) {
                newTurtle.goTo(path4.points[i + 2]);
            }
            remove = 0;
            continue;
        }
        let lose = Math.abs(Math.tan(ang / 360 * Math.PI) * radius);
        if (i === 0) firstLose = lose;
        newTurtle.setAngle(ang0);
        newTurtle.forward(dist0 - lose - remove);
        if (ang > 180) ang -= 360;
        else if (ang < -180) ang += 360;
        arc(ang, radius, true, newTurtle);
        if (i === path4.points.length - 3) {
            if (isClosed(path4)) {
                const dist21 = getIntraDist2(path4.points, 0, 1);
                const ang2 = getIntraAngle2(path4.points, 0, 1);
                let ang3 = ang2 - ang1;
                const lose2 = Math.abs(Math.tan(ang3 / 360 * Math.PI) * radius);
                newTurtle.path = newTurtle.pointFilter((x1, i1)=>i1 !== 0
                );
                newTurtle.forward(dist1 - lose - lose2);
                if (ang3 > 180) ang3 -= 360;
                else if (ang3 < -180) ang3 += 360;
                arc(ang3, radius, true, newTurtle);
                newTurtle.forward(dist21 - lose2 - firstLose);
            } else {
                newTurtle.forward(dist1 - lose);
            }
        }
        remove = lose;
    }
    return newTurtle.path;
}
function roundCorners(radius, all, turtle) {
    turtle.path = turtle.pathMap((p)=>roundCornersPath(radius, all, p)
    );
    return turtle;
}
function overlap1(p0, p1) {
    return 0.0000001 > Math.abs(p0.x - p1.x) + Math.abs(p0.y - p1.y);
}
function deepFlatten(array) {
    var result = [];
    array.forEach(function(elem) {
        if (Array.isArray(elem)) {
            result = result.concat(deepFlatten(elem));
        } else {
            result.push(elem);
        }
    });
    return result;
}
function thicken(distance, turtle) {
    const turtles = deepFlatten(turtle.pathMap((p)=>new Turtle({
            angle: 0,
            path: [
                p
            ]
        })
    ));
    turtles.forEach((t)=>{
        const endType = overlap1(t.start, t.end) ? "etClosedLine" : "etOpenButt";
        t.offset(distance / 2, {
            endType,
            jointType: "jtMiter"
        });
    });
    turtle.path = group(...turtles).path;
    return turtle;
}
const getAngle1 = (p1, p2)=>180 / Math.PI * Math.atan2(p2.y - p1.y, p2.x - p1.x)
;
const getIntraDist1 = (path4, i0, i1)=>getDistance1(path4[i0], path4[i1])
;
const getIntraAngle1 = (path4, i0, i1)=>getAngle1(path4[i0], path4[i1])
;
const isClosed1 = ({ points: points1  })=>{
    const path4 = points1;
    const EPSILON = 0.00000001;
    const firstPoint = path4[0];
    const lastPoint = path4[path4.length - 1];
    const xDelta = Math.abs(firstPoint.x - lastPoint.x);
    const yDelta = Math.abs(firstPoint.y - lastPoint.y);
    const closed = xDelta < 0.00000001 && yDelta < 0.00000001;
    return closed;
};
function dogbonePath(radius, all, path4) {
    const l = path4.points.length;
    if (l < 3) return path4;
    const newTurtle = new Turtle();
    const numPoints = path4.points.length;
    const { x , y  } = path4.points[0];
    newTurtle.move(newTurtle.start, {
        x,
        y
    });
    let remove = 0;
    let firstLose = 0;
    for(let i = 0; i < numPoints - 2; i++){
        const dist0 = getIntraDist1(path4.points, i, i + 1);
        const ang0 = getIntraAngle1(path4.points, i, i + 1);
        const ang1 = getIntraAngle1(path4.points, i + 1, i + 2);
        let ang = ang1 - ang0;
        if (ang > 180) ang -= 360;
        else if (ang < -180) ang += ang;
        if (Math.abs(ang) < 3 && !all) {
            newTurtle.goTo(path4.points[i + 1]);
            if (i === path4.points.length - 3) {
                newTurtle.goTo(path4.points[i + 2]);
            }
            remove = 0;
            continue;
        }
        let lose = Math.abs(2 * radius * Math.sin(ang * Math.PI / 180 / 2));
        if (i === 0) firstLose = lose;
        newTurtle.forward(dist0 - lose - remove).left(-ang / 2).arc(2 * ang, radius).left(-ang / 2);
        remove = lose;
        if (i === path4.points.length - 3) {
            const dist1 = getIntraDist1(path4.points, i + 1, i + 2);
            if (isClosed1(path4)) {
                const dist21 = getIntraDist1(path4.points, 0, 1);
                const ang2 = getIntraAngle1(path4.points, 0, 1);
                let ang3 = ang2 - ang1;
                const lose2 = Math.abs(2 * radius * Math.sin(ang3 * Math.PI / 180 / 2));
                newTurtle.path = newTurtle.pointFilter((x1, i1)=>i1 !== 0
                );
                newTurtle.forward(dist1 - lose - lose2);
                newTurtle.left(-ang3 / 2).arc(2 * ang3, radius).left(-ang3 / 2).forward(dist21 - lose2 - firstLose);
            } else {
                newTurtle.forward(dist1 - lose);
            }
        }
    }
    return newTurtle.path;
}
function dogbone(radius, all, turtle) {
    turtle.path = turtle.pathMap((p)=>dogbonePath(radius, all, p)
    );
    return turtle;
}
const directives = new WeakMap();
const directive = (f)=>(...args)=>{
        const d = f(...args);
        directives.set(d, true);
        return d;
    }
;
const isDirective = (o)=>{
    return typeof o === "function" && directives.has(o);
};
const isCEPolyfill = typeof window !== "undefined" && window.customElements != null && window.customElements.polyfillWrapFlushCallback !== void 0;
const reparentNodes = (container, start, end = null, before = null)=>{
    while(start !== end){
        const n = start.nextSibling;
        container.insertBefore(start, before);
        start = n;
    }
};
const removeNodes = (container, start, end = null)=>{
    while(start !== end){
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};
const noChange = {
};
const nothing = {
};
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
const boundAttributeSuffix = "$lit$";
class Template {
    constructor(result, element5){
        this.parts = [];
        this.element = element5;
        const nodesToRemove = [];
        const stack = [];
        const walker = document.createTreeWalker(element5.content, 133, null, false);
        let lastPartIndex = 0;
        let index3 = -1;
        let partIndex = 0;
        const { strings: strings5 , values: { length  }  } = result;
        while(partIndex < length){
            const node = walker.nextNode();
            if (node === null) {
                walker.currentNode = stack.pop();
                continue;
            }
            index3++;
            if (node.nodeType === 1) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length: length2  } = attributes;
                    let count = 0;
                    for(let i = 0; i < length2; i++){
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while((count--) > 0){
                        const stringForPart = strings5[partIndex];
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({
                            type: "attribute",
                            index: index3,
                            name,
                            strings: statics
                        });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === "TEMPLATE") {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            } else if (node.nodeType === 3) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings2 = data.split(markerRegex);
                    const lastIndex = strings2.length - 1;
                    for(let i = 0; i < lastIndex; i++){
                        let insert;
                        let s = strings2[i];
                        if (s === "") {
                            insert = createMarker();
                        } else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] + match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({
                            type: "node",
                            index: ++index3
                        });
                    }
                    if (strings2[lastIndex] === "") {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    } else {
                        node.data = strings2[lastIndex];
                    }
                    partIndex += lastIndex;
                }
            } else if (node.nodeType === 8) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    if (node.previousSibling === null || index3 === lastPartIndex) {
                        index3++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index3;
                    this.parts.push({
                        type: "node",
                        index: index3
                    });
                    if (node.nextSibling === null) {
                        node.data = "";
                    } else {
                        nodesToRemove.push(node);
                        index3--;
                    }
                    partIndex++;
                } else {
                    let i = -1;
                    while((i = node.data.indexOf(marker, i + 1)) !== -1){
                        this.parts.push({
                            type: "node",
                            index: -1
                        });
                        partIndex++;
                    }
                }
            }
        }
        for (const n of nodesToRemove){
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix)=>{
    const index4 = str.length - suffix.length;
    return index4 >= 0 && str.slice(index4) === suffix;
};
const isTemplatePartActive = (part)=>part.index !== -1
;
const createMarker = ()=>document.createComment("")
;
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;
class TemplateInstance {
    constructor(template, processor, options2){
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options2;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts){
            if (part !== void 0) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part1 of this.__parts){
            if (part1 !== void 0) {
                part1.commit();
            }
        }
    }
    _clone() {
        const fragment = isCEPolyfill ? this.template.element.content.cloneNode(true) : document.importNode(this.template.element.content, true);
        const stack1 = [];
        const parts2 = this.template.parts;
        const walker1 = document.createTreeWalker(fragment, 133, null, false);
        let partIndex1 = 0;
        let nodeIndex = 0;
        let part;
        let node = walker1.nextNode();
        while(partIndex1 < parts2.length){
            part = parts2[partIndex1];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(void 0);
                partIndex1++;
                continue;
            }
            while(nodeIndex < part.index){
                nodeIndex++;
                if (node.nodeName === "TEMPLATE") {
                    stack1.push(node);
                    walker1.currentNode = node.content;
                }
                if ((node = walker1.nextNode()) === null) {
                    walker1.currentNode = stack1.pop();
                    node = walker1.nextNode();
                }
            }
            if (part.type === "node") {
                const part2 = this.processor.handleTextExpression(this.options);
                part2.insertAfterNode(node.previousSibling);
                this.__parts.push(part2);
            } else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex1++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}
const policy = window.trustedTypes && trustedTypes.createPolicy("lit-html", {
    createHTML: (s)=>s
});
const commentMarker = ` ${marker} `;
class TemplateResult {
    constructor(strings1, values, type1, processor1){
        this.strings = strings1;
        this.values = values;
        this.type = type1;
        this.processor = processor1;
    }
    getHTML() {
        const l = this.strings.length - 1;
        let html2 = "";
        let isCommentBinding = false;
        for(let i = 0; i < l; i++){
            const s = this.strings[i];
            const commentOpen = s.lastIndexOf("<!--");
            isCommentBinding = (commentOpen > -1 || isCommentBinding) && s.indexOf("-->", commentOpen + 1) === -1;
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                html2 += s + (isCommentBinding ? commentMarker : nodeMarker);
            } else {
                html2 += s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] + marker;
            }
        }
        html2 += this.strings[l];
        return html2;
    }
    getTemplateElement() {
        const template1 = document.createElement("template");
        let value = this.getHTML();
        if (policy !== void 0) {
            value = policy.createHTML(value);
        }
        template1.innerHTML = value;
        return template1;
    }
}
class SVGTemplateResult extends TemplateResult {
    getHTML() {
        return `<svg>${super.getHTML()}</svg>`;
    }
    getTemplateElement() {
        const template1 = super.getTemplateElement();
        const content = template1.content;
        const svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
        return template1;
    }
}
const isPrimitive = (value)=>{
    return value === null || !(typeof value === "object" || typeof value === "function");
};
const isIterable = (value)=>{
    return Array.isArray(value) || !!(value && value[Symbol.iterator]);
};
class AttributeCommitter {
    constructor(element1, name3, strings2){
        this.dirty = true;
        this.element = element1;
        this.name = name3;
        this.strings = strings2;
        this.parts = [];
        for(let i = 0; i < strings2.length - 1; i++){
            this.parts[i] = this._createPart();
        }
    }
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings3 = this.strings;
        const l = strings3.length - 1;
        const parts2 = this.parts;
        if (l === 1 && strings3[0] === "" && strings3[1] === "") {
            const v = parts2[0].value;
            if (typeof v === "symbol") {
                return String(v);
            }
            if (typeof v === "string" || !isIterable(v)) {
                return v;
            }
        }
        let text1 = "";
        for(let i1 = 0; i1 < l; i1++){
            text1 += strings3[i1];
            const part = parts2[i1];
            if (part !== void 0) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text1 += typeof v === "string" ? v : String(v);
                } else {
                    for (const t of v){
                        text1 += typeof t === "string" ? t : String(t);
                    }
                }
            }
        }
        text1 += strings3[l];
        return text1;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
class AttributePart {
    constructor(committer){
        this.value = void 0;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while(isDirective(this.value)){
            const directive2 = this.value;
            this.value = noChange;
            directive2(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
class NodePart {
    constructor(options1){
        this.value = void 0;
        this.__pendingValue = void 0;
        this.options = options1;
    }
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while(isDirective(this.__pendingValue)){
            const directive2 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive2(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        } else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        } else if (value instanceof Node) {
            this.__commitNode(value);
        } else if (isIterable(value)) {
            this.__commitIterable(value);
        } else if (value === nothing) {
            this.value = nothing;
            this.clear();
        } else {
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? "" : value;
        const valueAsString = typeof value === "string" ? value : String(value);
        if (node === this.endNode.previousSibling && node.nodeType === 3) {
            node.data = valueAsString;
        } else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template1 = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance && this.value.template === template1) {
            this.value.update(value.values);
        } else {
            const instance = new TemplateInstance(template1, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        const itemParts = this.value;
        let partIndex1 = 0;
        let itemPart;
        for (const item of value){
            itemPart = itemParts[partIndex1];
            if (itemPart === void 0) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex1 === 0) {
                    itemPart.appendIntoPart(this);
                } else {
                    itemPart.insertAfterPart(itemParts[partIndex1 - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex1++;
        }
        if (partIndex1 < itemParts.length) {
            itemParts.length = partIndex1;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
class BooleanAttributePart {
    constructor(element2, name1, strings3){
        this.value = void 0;
        this.__pendingValue = void 0;
        if (strings3.length !== 2 || strings3[0] !== "" || strings3[1] !== "") {
            throw new Error("Boolean attributes can only contain a single expression");
        }
        this.element = element2;
        this.name = name1;
        this.strings = strings3;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive2 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive2(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, "");
            } else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
class PropertyCommitter extends AttributeCommitter {
    constructor(element3, name2, strings4){
        super(element3, name2, strings4);
        this.single = strings4.length === 2 && strings4[0] === "" && strings4[1] === "";
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
let eventOptionsSupported = false;
(()=>{
    try {
        const options2 = {
            get capture () {
                eventOptionsSupported = true;
                return false;
            }
        };
        window.addEventListener("test", options2, options2);
        window.removeEventListener("test", options2, options2);
    } catch (_e) {
    }
})();
class EventPart {
    constructor(element4, eventName, eventContext){
        this.value = void 0;
        this.__pendingValue = void 0;
        this.element = element4;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e)=>this.handleEvent(e)
        ;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while(isDirective(this.__pendingValue)){
            const directive2 = this.__pendingValue;
            this.__pendingValue = noChange;
            directive2(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null || oldListener != null && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === "function") {
            this.value.call(this.eventContext || this.element, event);
        } else {
            this.value.handleEvent(event);
        }
    }
}
const getOptions = (o)=>o && (eventOptionsSupported ? {
        capture: o.capture,
        passive: o.passive,
        once: o.once
    } : o.capture)
;
class DefaultTemplateProcessor {
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === ".") {
            const committer2 = new PropertyCommitter(element, name.slice(1), strings);
            return committer2.parts;
        }
        if (prefix === "@") {
            return [
                new EventPart(element, name.slice(1), options.eventContext)
            ];
        }
        if (prefix === "?") {
            return [
                new BooleanAttributePart(element, name.slice(1), strings)
            ];
        }
        const committer1 = new AttributeCommitter(element, name, strings);
        return committer1.parts;
    }
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();
function templateFactory(result1) {
    let templateCache = templateCaches.get(result1.type);
    if (templateCache === void 0) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result1.type, templateCache);
    }
    let template1 = templateCache.stringsArray.get(result1.strings);
    if (template1 !== void 0) {
        return template1;
    }
    const key = result1.strings.join(marker);
    template1 = templateCache.keyString.get(key);
    if (template1 === void 0) {
        template1 = new Template(result1, result1.getTemplateElement());
        templateCache.keyString.set(key, template1);
    }
    templateCache.stringsArray.set(result1.strings, template1);
    return template1;
}
const templateCaches = new Map();
const parts = new WeakMap();
const render = (result1, container, options3)=>{
    let part = parts.get(container);
    if (part === void 0) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({
            templateFactory
        }, options3)));
        part.appendInto(container);
    }
    part.setValue(result1);
    part.commit();
};
if (typeof window !== "undefined") {
    (window["litHtmlVersions"] || (window["litHtmlVersions"] = [])).push("1.3.0");
}
const html = (strings6, ...values1)=>new TemplateResult(strings6, values1, "html", defaultTemplateProcessor)
;
const svg = (strings6, ...values1)=>new SVGTemplateResult(strings6, values1, "svg", defaultTemplateProcessor)
;
const last = (arr)=>arr[arr.length - 1]
;
function drawTurtle(turtle, { showTurtles =true , showPoints =false , filterConstruction =false  } = {
}) {
    const paths = turtle.pathMap((x, i1)=>drawPath(x, showPoints, filterConstruction)
    );
    return showTurtles ? [
        ...paths,
        drawTurtleHead(turtle)
    ] : paths;
}
function drawTurtleHead(turtle) {
    const points1 = turtle.points;
    const lastPoint = last(points1);
    const angle = turtle.angle;
    const drawingViews = document.getElementById("inner-svg-view");
    const w = Number(drawingViews.getAttribute("width").replace("px", ""));
    const viewBox = drawingViews.getAttribute("viewBox").split(" ");
    const vw = Number(viewBox[2]);
    const headScale = vw / w;
    const turtleSize = 12;
    return svg`\n    <g transform="scale(1, -1)">\n      <polyline\n          class="scale-with-viewer"\n          fill = "orange"\n          vector-effect="non-scaling-stroke"\n          points="\n            ${lastPoint.x - 12 / 2}, ${lastPoint.y - 12} \n            ${lastPoint.x}, ${lastPoint.y} \n            ${lastPoint.x + 12 / 2}, ${lastPoint.y - 12}\n          "\n          transform="\n            rotate(${angle - 90}) \n            scale(${headScale})\n          "\n          transform-origin="${lastPoint.x} ${lastPoint.y}"/>\n    </g>\n  `;
}
const drawPath = (path4, showPoints, filterConstruction)=>{
    if (path4.construction && filterConstruction) return "";
    let points1 = path4.points.reduce((acc, point2)=>acc + ` ${point2.x},${point2.y}`
    , " ");
    let polyline1 = svg`\n    <g transform="scale(1, -1)">\n      <polyline \n        points="${points1}" \n        fill=${path4.fillColor} \n        stroke=${path4.strokeColor}\n        stroke-width="${path4.strokeWidth}px"\n        stroke-dasharray="${path4.dashed ? path4.dashed : "none"}"\n        stroke-linejoin=${path4.linejoin}\n        stroke-linecap=${path4.linecap}\n        vector-effect="non-scaling-stroke"/>\n      ${showPoints ? path4.points.map((p)=>svg`\n            <circle \n              cx="${p.x}" \n              cy="${p.y}" \n              r="0.05" \n              stroke="black" \n              stroke-width="0" \n              fill="red"/>\n          `
    ) : ""}\n    </g>\n  `;
    return polyline1;
};
const add = (x, y)=>{
    if (typeof x !== typeof y) throw "Types of args to + don't match.";
    if (Array.isArray(x) && Array.isArray(y)) return x.concat(y);
    else return x + y;
};
const KEYWORDS = [
    "if",
    "elif",
    "else",
    "for",
    "skip",
    "break",
    "import",
    "as",
    "def",
    "dict"
];
class Environment {
    constructor(builtIns){
        this.scopes = [
            {
            }
        ];
        this.turtles = [
            new Turtle()
        ];
        this.shown = [];
        this.mergeMarker = [];
        this.logs = [];
        Object.entries(builtIns).forEach(([name4, value])=>{
            this.add(name4, value);
        });
    }
    add(name, value, constant = false) {
        this.scopes[0][name] = {
            value,
            constant
        };
        return value;
    }
    remove(name) {
        delete this.scopes[0][name];
    }
    addGlobal(name, value) {
        this.scopes[this.scopes.length - 1][name] = value;
        return value;
    }
    isConstant(name) {
        const value = this.scopes[0][name];
        return value ? value.constant : false;
    }
    find(name) {
        let i1 = 0;
        let value;
        while(i1 < this.scopes.length){
            value = this.scopes[i1][name];
            if (value !== undefined) break;
            i1++;
        }
        return value ? value.value : value;
    }
    newScope(scope = {
    }) {
        this.scopes.unshift(scope);
    }
    closeScope() {
        this.scopes.shift();
    }
    currentScope() {
        return {
            ...this.scopes[0]
        };
    }
    isFunction(name) {
        let value = this.find(name);
        return value !== undefined && value.type === "function";
    }
    clean() {
        this.scopes[0] = Object.fromEntries(Object.entries(this.scopes[0]).filter(([k, v])=>v.builtIn
        ));
    }
    turtle() {
        if (this.turtles.length === 0) throw "No shape exists.";
        return this.turtles[this.turtles.length - 1];
    }
    newTurtle(turtle = new Turtle()) {
        this.turtles.push(turtle);
        return turtle;
    }
    show(color) {
        color = color ? color : "orange";
        const showTurtle = this.turtle().copy();
        showTurtle.strokeColor(color);
        this.shown.push(showTurtle);
        return showTurtle;
    }
    log(value) {
        this.logs.push(value);
        return value;
    }
    setMergeMarker() {
        this.mergeMarker.push(this.turtles.length);
    }
    mergeFromMarker(offset = 0) {
        this.merge(this.turtles.length - this.mergeMarker.pop() + offset);
    }
    merge(num) {
        if (num === 0) return;
        const l = this.turtles.length;
        const turtles = [];
        for(let i1 = l - 1; i1 >= l - num; i1--){
            let current = this.turtles.pop();
            turtles.unshift(current);
        }
        const __final = group(...turtles);
        this.newTurtle(__final);
    }
}
const encloseInLayer = (func, env)=>{
    env.setMergeMarker();
    env.newTurtle();
    func();
    const result1 = env.turtle();
    env.mergeFromMarker(1);
    return result1;
};
const sub = (x, y)=>{
    if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers.";
    else return x - y;
};
const div = (x, y)=>{
    if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers.";
    else if (y === 0) throw "Can not divide by zero.";
    else return x / y;
};
const mul = (x, y)=>{
    if (typeof x !== "number" || typeof y !== "number") throw "Expected both args to be numbers.";
    else return x * y;
};
const power = (x, y)=>x ** y
;
const mod = (x, y)=>x % y
;
const eq = (x, y)=>x === y
;
const lt = (x, y)=>x < y
;
const lteq = (x, y)=>x <= y
;
const gt = (x, y)=>x > y
;
const gteq = (x, y)=>x >= y
;
const range = (start, stop, step)=>{
    if (typeof stop == 'undefined') {
        stop = start;
        start = 0;
    }
    if (typeof step == 'undefined') {
        step = start < stop ? 1 : -1;
    }
    var result1 = [];
    for(var i1 = start; step > 0 ? i1 < stop : i1 > stop; i1 += step)result1.push(i1);
    return result1;
};
const SKIP = "SWg@3y5WeXnTr2#&7v";
const BREAK = "RcizZ9qcYE3e2A&Z&5";
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result2 = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result2 === null) result2 = [];
    return result2;
}
function isFunction(functionToCheck) {
    return functionToCheck && ({
    }).toString.call(functionToCheck) === '[object Function]';
}
class Stream {
    constructor(expressions){
        this.index = 0;
        this.expressions = expressions;
    }
    peek(offset = 0) {
        return this.expressions[this.index + offset];
    }
    next() {
        const current = this.expressions[this.index];
        this.index++;
        return current;
    }
    eof() {
        return this.index === this.expressions.length;
    }
}
function callFunc(value, env, ast, startLine) {
    const arity = value.arity;
    const params = value.params || getParamNames(value.value);
    let args = [];
    for(let i2 = 0; i2 < arity; i2++){
        if (ast.eof()) break;
        if (ast.peek().loc.line === startLine) args.push(ast.next());
    }
    args = args.map((a)=>evaluate(a, env, ast)
    );
    if (args.length < arity) throw `Error on line ${startLine}. Expected ${arity} arguments but received ${args.length}.`;
    let result2;
    if (value.builtIn || isFunction(value.value)) {
        result2 = value.value(...args, env);
    } else {
        env.newScope();
        if (value.extend) {
            for(const key in value.extend){
                env.add(key, value.extend[key].value);
            }
        }
        args.forEach((arg, i3)=>{
            const name4 = params[i3];
            env.add(name4, arg);
        });
        result2 = evaluate(value.body, env);
        if (result2 && result2.type === "function") result2.extend = env.currentScope();
        env.closeScope();
    }
    return result2;
}
function setKeyValue(node, env, ast) {
    const map = evaluate(node.left.left, env, ast);
    const key = evaluate(node.left.right, env, ast);
    const value = evaluate(node.right, env, ast);
    map[key] = value;
    return value;
}
function assign(node, env, ast) {
    const constant = false || node.constant;
    if (node.left.type === "binary" && node.left.operator === ".") return setKeyValue(node, env, ast);
    const canWrite = makeCanWrite(env);
    let right = evaluate(node.right, env, ast);
    if (node.left.type === "array") {
        if (!Array.isArray(right)) throw "Right value is not an array so can't be destructured.";
        node.left.value.forEach((token, i2)=>{
            if (right[i2] === undefined) throw "More symbols than array values.";
            const symbol = canWrite(token);
            env.add(symbol, right[i2], constant);
        });
    } else {
        const symbol = canWrite(node.left);
        env.add(symbol, right, constant);
    }
    return right;
}
function pipe(node, env, ast) {
    node.right.loc = node.left.loc;
    const value = node.right.type === "expression" ? [
        ...node.right.value,
        node.left
    ] : [
        node.right,
        node.left
    ];
    return evaluate(value, env);
}
function access(left, right, node, env, ast) {
    let val;
    if (Array.isArray(right)) {
        if (right.length === 2) val = left.slice(right[0], right[1]);
        else if (right.length === 1) val = left[right[0]];
        else throw "Expected 2 args in array index.";
    } else {
        val = left[right];
    }
    return val && val.type === "function" ? callFunc(val, env, ast, node.loc.line) : val;
}
const makeCanWrite = (env)=>(token)=>{
        if (token.type !== "symbol") throw "Assignment to non-symbol.";
        const symbol = token.value;
        const current = env.find(symbol);
        if (current && current.builtIn) throw "Can't overwrite built-in symbols.";
        if (env.isConstant(symbol)) throw "Can't overwrite constant symbols.";
        return symbol;
    }
;
let evaluate = (node, env, ast = [])=>{
    const literals = [
        "number",
        "string",
        "boolean"
    ];
    if (Array.isArray(node)) return runProgram(new Stream(node), env);
    else if (node instanceof Stream) return runProgram(node, env);
    else if (node.type === "array") {
        const results = [];
        let s = new Stream(node.value);
        while(!s.eof()){
            results.push(evaluate(s.next(), env, s));
        }
        return results;
    } else if (literals.includes(node.type)) {
        return node.value;
    } else if (node.type === "expression") {
        return evaluate(node.value, env);
    } else if (node.type === "binary") {
        if (node.operator === "=") return assign(node, env, ast);
        else if (node.operator === "|") return pipe(node, env, ast);
        const left = evaluate(node.left, env, ast);
        const right = evaluate(node.right, env, ast);
        if (node.operator === "+") return add(left, right);
        else if (node.operator === "*") return mul(left, right);
        else if (node.operator === "/") return div(left, right);
        else if (node.operator === "-") return sub(left, right);
        else if (node.operator === "^") return power(left, right);
        else if (node.operator === "%") return mod(left, right);
        else if (node.operator === "==") return eq(left, right);
        else if (node.operator === "!=") return !eq(left, right);
        else if (node.operator === "<") return lt(left, right);
        else if (node.operator === "<=") return lteq(left, right);
        else if (node.operator === ">") return gt(left, right);
        else if (node.operator === ">=") return gteq(left, right);
        else if (node.operator === "and") return left && right;
        else if (node.operator === "or") return left || right;
        else if (node.operator === "to") return range(left, right, left < right ? 1 : -1);
        else if (node.operator === ".") return access(left, right, node, env, ast);
    } else if (node.type === "unary") {
        const arg = evaluate(node.arg, env, ast);
        if (node.operator === "~") return -arg;
        else if (node.operator === "!") return !arg;
        else if (node.operator === "?") return arg !== undefined;
        else if (node.operator === "@") return callFunc(arg, env, ast, node.arg.loc.line);
    } else if (node.type === "if") {
        if (evaluate(node.cond, env, ast)) return evaluate(node.then, env, ast);
        else if (node.else) return evaluate(node.else, env, ast);
        else return undefined;
    } else if (node.type === "hash-map") {
        const hashMap = {
        };
        for (const entry of node.body){
            if (entry[1].type !== "body") throw "value must be block";
            const key = evaluate(entry[0], env, ast);
            const value = evaluate(entry[1].value, env);
            if (key && typeof key !== "string") throw "key must be a string";
            hashMap[key] = value;
        }
        return hashMap;
    } else if (node.type === "symbol") {
        if (env.find(node.value) === undefined) throw "Unknown symbol used: " + node.value;
        const value = env.find(node.value);
        if (value.type === "import") {
            const { env: newEnv , function: func  } = value;
            const result2 = callFunc(func, newEnv, ast, node.loc.line, env);
            if (result2 instanceof Turtle) env.newTurtle(result2);
            return result2;
        } else if (value.type === "function") {
            return callFunc(value, env, ast, node.loc.line);
        } else {
            return value;
        }
    } else if (node.type === "skip") return SKIP;
    else if (node.type === "break") return BREAK;
    else if (node.type === "for") {
        let results = [];
        let iterable = evaluate(node.iterable, env, ast);
        let iterator = node.iterator !== undefined ? node.iterator : undefined;
        if (!isNaN(iterable) && !Array.isArray(iterable)) iterable = range(iterable);
        if (!Array.isArray(iterable)) throw "Iterable must be an array.";
        for(let i2 = 0; i2 < iterable.length; i2++){
            if (iterator !== undefined) env.add(iterator, iterable[i2]);
            let next = evaluate(node.body, env);
            if (next === SKIP) continue;
            else if (next === BREAK) break;
            else results.push(next);
        }
        env.remove(iterator);
        return results;
    } else if (node.type === "function") {
        return node;
    } else if (node.type === "body") {
        return node.value;
    } else {
        console.log(node);
        throw `Unexpected: ${JSON.stringify(node)}.`;
    }
};
let builtIns1 = {
    eval: {
        arity: 1,
        value (body, env) {
            return evaluate(body, env);
        }
    },
    originate: {
        arity: 0,
        value (env) {
            const turtle = env.turtle();
            return turtle.move(turtle.cc, {
                x: 0,
                y: 0
            });
        }
    },
    copypaste: {
        arity: 2,
        value (number, body, env) {
            env.setMergeMarker();
            for(let i2 = 0; i2 < number; i2++){
                env.newTurtle(env.turtle().copy());
                evaluate(body, env);
            }
            env.mergeFromMarker();
            if (env.turtles.length < 2) throw "Less than two shapes, can't merge in \"grouplast\".";
            if (number >= 1) env.merge(2);
            return env.turtle();
        }
    },
    layer: {
        arity: 1,
        value (body, env) {
            env.setMergeMarker();
            env.newTurtle();
            evaluate(body, env);
            const result2 = env.turtle();
            env.mergeFromMarker(1);
            return result2;
        }
    },
    forward: {
        arity: 1,
        value (dist, env) {
            return env.turtle().forward(dist);
        }
    },
    turn: {
        arity: 1,
        value (angle, env) {
            return env.turtle().turn(angle);
        }
    },
    right: {
        arity: 1,
        value (angle, env) {
            return env.turtle().turn(-angle);
        }
    },
    left: {
        arity: 1,
        value (angle, env) {
            return env.turtle().turn(angle);
        }
    },
    turnforward: {
        arity: 2,
        value (angle, dist, env) {
            return env.turtle().turnForward(angle, dist);
        }
    },
    fillcolor: {
        arity: 1,
        value (color, env) {
            return env.turtle().fillColor(color);
        }
    },
    floodfill: {
        arity: 1,
        value (color, env) {
            return env.turtle().floodFill(color);
        }
    },
    strokewidth: {
        arity: 1,
        value (width, env) {
            return env.turtle().strokeWidth(width);
        }
    },
    strokelinecap: {
        arity: 1,
        value (type, env) {
            return env.turtle().strokeLinecap(type);
        }
    },
    strokelinejoin: {
        arity: 1,
        value (type, env) {
            return env.turtle().strokeLinejoin(type);
        }
    },
    strokecolor: {
        arity: 1,
        value (color, env) {
            return env.turtle().strokeColor(color);
        }
    },
    rotate: {
        arity: 2,
        value (point, angle, env) {
            return env.turtle().rotate(point, angle);
        }
    },
    translate: {
        arity: 2,
        value (x, y, env) {
            return env.turtle().translate(x, y);
        }
    },
    scale: {
        arity: 2,
        value (x, y, env) {
            return env.turtle().scale(x, y);
        }
    },
    move: {
        arity: 2,
        value (draggedPoint, targetPoint, env) {
            return env.turtle().move(draggedPoint, targetPoint);
        }
    },
    goto: {
        arity: 1,
        value (point, env) {
            return env.turtle().goTo(point);
        }
    },
    flatgoto: {
        arity: 2,
        value: (point2, axis, env)=>env.turtle().flatGoTo(point2, axis)
    },
    closepath: {
        arity: 0,
        value (env) {
            return env.turtle().closePath();
        }
    },
    setangle: {
        arity: 1,
        value (angle, env) {
            return env.turtle().setAngle(angle);
        }
    },
    reverse: {
        arity: 0,
        value (env) {
            return env.turtle().reverse();
        }
    },
    "this": {
        arity: 0,
        value (env) {
            return env.turtle();
        }
    },
    arc: {
        arity: 2,
        value (angle, radius, env) {
            return env.turtle().arc(angle, radius);
        }
    },
    circle: {
        arity: 1,
        value (radius, env) {
            const body = ()=>{
                const turtle = env.turtle();
                turtle.arc(360, radius);
                turtle.move(turtle.cc, {
                    x: 0,
                    y: 0
                });
            };
            return encloseInLayer(body, env);
        }
    },
    flip: {
        arity: 1,
        value (direction, env) {
            return env.turtle().flip(direction);
        }
    },
    fillet: {
        arity: 1,
        value (radius, env) {
            return env.turtle().fillet(radius);
        }
    },
    repeat: {
        arity: 1,
        value (number, env) {
            return env.turtle().repeat(number);
        }
    },
    vec: {
        arity: 2,
        value (x, y, env) {
            return env.turtle().vec(x, y);
        }
    },
    bezier: {
        arity: 1,
        value (string, env) {
            return env.turtle().bezier(string);
        }
    },
    slide: {
        arity: 2,
        value (angle, distance, env) {
            return env.turtle().slide(angle, distance);
        }
    },
    rectangle: {
        arity: 2,
        value (width, height, env) {
            const body = ()=>{
                const turtle = env.turtle();
                turtle.forward(width).right(90).forward(height).right(90).repeat(1);
                turtle.move(turtle.cc, {
                    x: 0,
                    y: 0
                });
            };
            return encloseInLayer(body, env);
        }
    },
    mirror: {
        arity: 0,
        value (env) {
            return env.turtle().mirror();
        }
    },
    alignhead: {
        arity: 0,
        value (env) {
            return env.turtle().alignHead();
        }
    },
    union: {
        arity: 0,
        value (env) {
            return env.turtle().union();
        }
    },
    difference: {
        arity: 0,
        value (env) {
            return env.turtle().difference();
        }
    },
    intersect: {
        arity: 0,
        value (env) {
            return env.turtle().intersect();
        }
    },
    offset: {
        arity: 2,
        value (distance, options, env) {
            return env.turtle().offset(distance, options);
        }
    },
    outline: {
        arity: 0,
        value: (env)=>env.turtle().outline()
    },
    thicken: {
        arity: 1,
        value: (distance, env)=>env.turtle().thicken(distance)
    },
    newstroke: {
        arity: 1,
        value: (startPoint, env)=>env.turtle().newStroke(startPoint)
    },
    show: {
        arity: 1,
        value: (_color, env)=>env.show(_color)
    },
    roundcorners: {
        arity: 1,
        value: (radius, env)=>env.turtle().roundCorners(radius)
    },
    dogbone: {
        arity: 1,
        value: (radius, env)=>env.turtle().dogbone(radius)
    },
    expand: {
        arity: 1,
        value: (distance, env)=>env.turtle().expand(distance)
    },
    construction: {
        arity: 0,
        value (env) {
            return env.turtle().construction();
        }
    },
    dashed: {
        arity: 1,
        value (number, env) {
            return env.turtle().dashed(number);
        }
    },
    range: {
        arity: 3,
        value (start, stop, step) {
            if (typeof stop == 'undefined') {
                stop = start;
                start = 0;
            }
            if (typeof step == 'undefined') {
                step = start < stop ? 1 : -1;
            }
            if (step > 0 && start >= stop || step < 0 && start <= stop) return [];
            var result2 = [];
            for(var i2 = start; step > 0 ? i2 < stop : i2 > stop; i2 += step)result2.push(i2);
            return result2;
        }
    },
    neg: {
        arity: 1,
        value (a) {
            return -a;
        }
    },
    length: {
        arity: 1,
        value (list) {
            return list.length;
        }
    },
    pick: {
        arity: 1,
        value (arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }
    },
    index: {
        arity: 2,
        value (index, list) {
            return index >= 0 ? list[index] : list[index + list.length];
        }
    },
    sin: {
        arity: 1,
        value (number) {
            return Math.sin(number);
        }
    },
    cos: {
        arity: 1,
        value (number) {
            return Math.cos(number);
        }
    },
    tan: {
        arity: 1,
        value (number) {
            return Math.tan(number);
        }
    },
    asin: {
        arity: 1,
        value (number) {
            return Math.asin(number);
        }
    },
    acos: {
        arity: 1,
        value (number) {
            return Math.acos(number);
        }
    },
    atan: {
        arity: 1,
        value (number) {
            return Math.atan(number);
        }
    },
    ln: {
        arity: 1,
        value (number) {
            return Math.log(number);
        }
    },
    pi: {
        arity: 0,
        value () {
            return Math.PI;
        }
    },
    sqrt: {
        arity: 1,
        value (number) {
            return Math.sqrt(number);
        }
    },
    abs: {
        arity: 1,
        value (number) {
            return Math.abs(number);
        }
    },
    print: {
        arity: 1,
        value (value, env) {
            env.log(value);
            console.log(value);
            return value;
        }
    },
    head: {
        arity: 1,
        value (list) {
            return list[0];
        }
    },
    tail: {
        arity: 1,
        value (list) {
            return list.slice(1);
        }
    },
    init: {
        arity: 1,
        value (list) {
            return list.slice(0, -1);
        }
    },
    take: {
        arity: 2,
        value (number, list) {
            return list.slice(0, number);
        }
    },
    drop: {
        arity: 2,
        value (number, list) {
            return list.slice(number);
        }
    },
    rev: {
        arity: 1,
        value (list) {
            return list.reverse();
        }
    },
    text: {
        arity: 1,
        value (text, env) {
            return env.turtle().text(text);
        }
    },
    xor: {
        arity: 0,
        value (env) {
            return env.turtle().xor();
        }
    },
    placealong: {
        arity: 1,
        value (turtle, env) {
            return env.turtle().placeAlong(turtle);
        }
    },
    trim: {
        arity: 2,
        value: (start, end, env)=>{
            return env.turtle().trim(start, end);
        }
    },
    gettabs: {
        arity: 0,
        value: (env)=>{
            return env.turtle().getTabs();
        }
    }
};
for(const entry in builtIns1){
    builtIns1[entry] = {
        ...builtIns1[entry],
        builtIn: true,
        type: "function"
    };
}
const runProgram = (ast, env)=>{
    let last1;
    while(!ast.eof())last1 = evaluate(ast.next(), env, ast);
    return last1;
};
const loggingEvaluate = (line1, col, oldEvaluate)=>(node, env, ast)=>{
        const show = node.type === "symbol" && line1 + 1 === node.loc.line && col === node.loc.col;
        if (show) env.logLineTurtleBefore = env.turtle().copy();
        const result3 = oldEvaluate(node, env, ast);
        if (show) env.logLineTurtleAfter = env.show("");
        return result3;
    }
;
const ogEval = evaluate;
const OPERATORS = [
    [
        "="
    ],
    [
        "to",
        "or",
        "and",
        "<",
        ">",
        "<=",
        ">=",
        "==",
        "!=",
        "+",
        "-",
        "*",
        "/",
        "%",
        "^",
        "|"
    ],
    [],
    [
        "."
    ]
];
const PRECEDENCE = Object.fromEntries(OPERATORS.map((level, i3)=>level.map((op)=>[
            op,
            i3 + 1
        ]
    )
).flat());
const MAX_PRECEDENCE = OPERATORS.length;
class InputStream {
    constructor(string){
        this.pos = 0;
        this.line = 1;
        this.col = 0;
        this.input = string;
    }
    next() {
        let ch = this.input.charAt(this.pos++);
        if (ch === "\n") {
            this.line++;
            this.col = 0;
        } else this.col++;
        return ch;
    }
    peek(offset = 0) {
        return this.input.charAt(this.pos + offset);
    }
    eof() {
        return this.peek() === "";
    }
    loc() {
        return {
            line: this.line,
            col: this.col
        };
    }
    croak(msg) {
        if (msg === "Can't handle character: #") msg += "\n # replaced with .() for accessing";
        throw new Error(msg + " (" + this.line + ":" + this.col + ")");
    }
}
const is_keyword = (x)=>KEYWORDS.includes(x)
;
const is_digit = (ch)=>/[0-9]/i.test(ch)
;
const is_symbol_start = (ch)=>/[a-z]/i.test(ch)
;
const is_symbol = (ch)=>is_symbol_start(ch) || "0123456789_".indexOf(ch) >= 0
;
const is_op_char = (ch)=>[
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        "|",
        "<",
        ">",
        "!",
        "^"
    ].includes(ch)
;
const is_whitespace = (ch)=>" \t\r\n".indexOf(ch) >= 0
;
const is_punc_char = (ch)=>[
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
        ":"
    ].includes(ch)
;
const is_unary = (ch)=>[
        "?",
        "@",
        "~"
    ].includes(ch)
;
function TokenStream(string1) {
    let input = new InputStream(string1);
    let current = null;
    let currentLine = 1;
    let firstColOfLine = 0;
    return {
        next: next,
        peek: peek,
        eof: eof,
        croak: input.croak
    };
    function read_while(predicate) {
        let ch = input.peek();
        let str = "";
        while(!input.eof() && predicate(input.peek()))str += input.next();
        return str;
    }
    function read_symbol() {
        let symbol = read_while(is_symbol).toLowerCase();
        if (symbol === "true") return {
            type: "boolean",
            value: true
        };
        else if (symbol === "false") return {
            type: "boolean",
            value: false
        };
        else if (symbol in PRECEDENCE) return {
            type: "op",
            value: symbol
        };
        else return {
            type: is_keyword(symbol) ? "keyword" : "symbol",
            value: symbol
        };
    }
    function read_escaped(end) {
        let escaped = false, str = "";
        input.next();
        while(!input.eof()){
            let ch = input.next();
            if (escaped) {
                str += ch;
                escaped = false;
            } else if (ch === "\\") {
                escaped = true;
            } else if (ch === end) {
                break;
            } else {
                str += ch;
            }
        }
        return str;
    }
    function read_string() {
        return {
            type: "string",
            value: read_escaped(`"`)
        };
    }
    function read_number() {
        let dots_seen = 0;
        let number = read_while(function(ch) {
            if (ch === ".") {
                dots_seen++;
                if (dots_seen > 1) input.croak("Multiple decimals in number.");
                return true;
            } else return is_digit(ch);
        });
        let parsedNum = parseFloat(number);
        if (isNaN(parsedNum)) input.croak("Not a number.");
        return {
            type: "number",
            value: parsedNum
        };
    }
    function skip_comment() {
        read_while((ch)=>ch !== "\n"
        );
        input.next();
    }
    function read_dot_operator() {
        input.next();
        return {
            value: ".",
            type: "op"
        };
    }
    function getLocation() {
        let loc = input.loc();
        if (loc.line !== currentLine) {
            firstColOfLine = loc.col;
            currentLine = loc.line;
        }
        loc.firstColOfLine = firstColOfLine;
        return loc;
    }
    function read_token() {
        read_while(is_whitespace);
        let loc = getLocation();
        if (input.eof()) return null;
        let ch = input.peek();
        let result3;
        if (ch === "." && !is_digit(input.peek(1))) result3 = read_dot_operator();
        else if (is_punc_char(ch)) result3 = {
            type: "punc",
            value: input.next()
        };
        else if (is_unary(ch)) result3 = {
            type: "unary",
            value: input.next()
        };
        else if (is_op_char(ch)) {
            const value = read_while(is_op_char);
            if (value === "//") {
                skip_comment();
                return read_token();
            } else if (value === "!") {
                result3 = {
                    type: "unary",
                    value: "!"
                };
            } else if (OPERATORS.flat().includes(value)) {
                result3 = {
                    type: "op",
                    value
                };
            } else {
                input.croak(`Unexpected operator: ${value}`);
            }
        } else if (is_symbol_start(ch)) result3 = read_symbol();
        else if (ch === '"') result3 = read_string();
        else if (ch === '\\') {
            input.next();
            result3 = {
                type: "anon-function"
            };
        } else if (is_digit(ch) || ch === ".") result3 = read_number();
        if (input.peek(0) === "." && is_digit(input.peek(1))) input.croak("Please place number index in '( )'.");
        if (result3) return {
            ...result3,
            loc
        };
        else input.croak("Can't handle character: " + ch);
    }
    function peek() {
        return current || (current = read_token());
    }
    function next() {
        var tok = current;
        current = null;
        return tok || read_token();
    }
    function eof() {
        return peek() === null;
    }
}
function parse(string1) {
    const input = TokenStream(string1);
    return parse_toplevel();
    function is_punc(ch) {
        var tok = input.peek();
        return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
    }
    function skip_punc(ch) {
        if (is_punc(ch)) input.next();
        else input.croak("Expecting punctuation: \"" + ch + "\"");
    }
    function is_op(op) {
        var tok = input.peek();
        return tok && tok.type === "op" && (!op || tok.value === op) && tok;
    }
    function is_kw(kw) {
        var tok = input.peek();
        return tok && tok.type === "keyword" && (!kw || tok.value === kw) && tok;
    }
    function skip_kw(kw) {
        if (is_kw(kw)) input.next();
        else input.croak("Expecting keyword: \"" + kw + "\"");
    }
    function unexpected(tok) {
        input.croak("Unexpected token: " + JSON.stringify(tok));
    }
    function maybe_binary(left, my_prec) {
        var tok = is_op();
        if (!tok) return left;
        var his_prec = PRECEDENCE[tok.value];
        if (his_prec > my_prec) {
            input.next();
            const right = parse_expression(his_prec);
            if (right.type === "symbol" && tok.value === ".") right.type = "string";
            return maybe_binary({
                type: "binary",
                operator: tok.value,
                left: left,
                right,
                loc: left.loc
            }, my_prec);
        } else {
            return left;
        }
    }
    function parse_cond() {
        const cond = [];
        while(!input.eof()){
            cond.push(parse_expression());
            if (is_punc(":") || is_punc("{")) break;
        }
        return cond;
    }
    function parse_if(elif = false) {
        if (!elif) skip_kw("if");
        const cond = parse_cond();
        const result3 = {
            type: "if",
            cond: {
                type: "expression",
                value: cond
            },
            then: {
                type: "expression",
                value: parse_body().value
            },
            else: undefined
        };
        if (is_kw("elif")) {
            skip_kw("elif");
            result3.else = parse_if(true);
        } else if (is_kw("else")) {
            skip_kw("else");
            result3.else = {
                type: "expression",
                value: parse_body().value
            };
        }
        return result3;
    }
    function parse_for() {
        skip_kw("for");
        let loop = {
            type: "for",
            iterable: parse_expression(),
            iterator: undefined
        };
        if (is_kw("as")) {
            skip_kw("as");
            if (input.peek().type !== "symbol") throw "Iterator must be symbol.";
            loop.iterator = input.next().value;
        }
        const body = parse_body();
        loop.body = body.value;
        return loop;
    }
    function parse_colon() {
        const body = [];
        const loc = input.peek().loc;
        const { line: currentLine , firstColOfLine  } = loc;
        skip_punc(":");
        const closingPunc = ()=>is_punc("]") || is_punc(")") || is_punc("}")
        ;
        if (input.peek() && input.peek().loc.line === currentLine) {
            while(input.peek() && input.peek().loc.line === currentLine && !closingPunc()){
                body.push(parse_expression());
            }
        } else {
            let first = true;
            let col = firstColOfLine;
            while(input.peek() && input.peek().loc.col > firstColOfLine){
                if (first) {
                    first = false;
                    col = input.peek().loc.firstColOfLine;
                } else if (col !== input.peek().loc.firstColOfLine) input.croak(`Misaligned block on line: ${input.peek().loc.line}`);
                body.push(parse_expression());
            }
        }
        return {
            type: "body",
            value: body
        };
    }
    function parse_curly() {
        const body = [];
        skip_punc("{");
        while(!is_punc("}"))body.push(parse_expression());
        skip_punc("}");
        return {
            type: "body",
            value: body
        };
    }
    function parse_body(prec = 0) {
        const body = parse_expression(prec);
        if (body.type !== "body") input.croak("Expecting { or :");
        return body;
    }
    function parse_fun(anon = false) {
        input.next();
        const name4 = !anon ? input.next() : undefined;
        if (name4 && name4.type !== "symbol") input.croak("Expecting symbol.");
        const params = parse_params();
        const body = parse_body(MAX_PRECEDENCE);
        const func = {
            type: "function",
            arity: params.length,
            params,
            body: body.value,
            builtIn: false
        };
        return anon ? func : {
            type: "binary",
            operator: "=",
            constant: true,
            left: name4,
            right: func
        };
    }
    function parse_params() {
        const params = [];
        while(!input.eof() && input.peek().type === "symbol")params.push(input.next().value);
        return params;
    }
    function parse_import() {
        skip_kw("import");
        const importExp = {
            type: "import"
        };
        if (input.peek().type !== "string") throw "Please specify string of source.";
        importExp.source = input.next().value;
        skip_kw("as");
        if (input.peek().type !== "symbol") throw "Please specify symbol of import.";
        importExp.name = input.next().value;
        return importExp;
    }
    function parse_array() {
        let value = [];
        skip_punc("[");
        while(!is_punc("]") && !input.eof())value.push(parse_expression());
        skip_punc("]");
        return {
            type: "array",
            value
        };
    }
    function parse_paren() {
        let value = [];
        skip_punc("(");
        while(!is_punc(")") && !input.eof())value.push(parse_expression());
        skip_punc(")");
        return {
            type: "expression",
            value
        };
    }
    function parse_hash_map() {
        const body = [];
        skip_kw("dict");
        skip_punc("[");
        while(!is_punc("]")){
            const key = parse_expression();
            if (key.type === "symbol") key.type = "string";
            const value = parse_expression();
            body.push([
                key,
                value
            ]);
        }
        skip_punc("]");
        return {
            type: "hash-map",
            body
        };
    }
    function parse_atom() {
        const { type: type2 , loc  } = input.peek();
        let tok;
        if (is_punc("(")) tok = parse_paren();
        else if (is_punc("[")) tok = parse_array();
        else if (is_kw("if")) tok = parse_if();
        else if (is_kw("def")) tok = parse_fun();
        else if (type2 === "anon-function") tok = parse_fun(true);
        else if (is_kw("for")) tok = parse_for();
        else if (is_kw("import")) tok = parse_import();
        else if (is_kw("skip")) {
            input.next();
            tok = {
                type: "skip"
            };
        } else if (is_kw("break")) {
            input.next();
            tok = {
                type: "break"
            };
        } else if (is_punc("{")) tok = parse_curly();
        else if (is_punc(":")) tok = parse_colon();
        else if (is_kw("dict")) tok = parse_hash_map();
        else if (type2 === "unary") {
            tok = {
                type: "unary",
                operator: input.next().value,
                arg: parse_expression(MAX_PRECEDENCE - 1)
            };
        } else {
            const literals = [
                "number",
                "string",
                "boolean",
                "symbol"
            ];
            tok = input.next();
            if (!literals.includes(tok.type)) unexpected(tok);
        }
        return {
            ...tok,
            loc
        };
    }
    function parse_toplevel() {
        var prog = [];
        while(!input.eof())prog.push(parse_expression());
        return {
            type: "prog",
            prog: prog
        };
    }
    function parse_expression(prec = 0) {
        return maybe_binary(parse_atom(), prec);
    }
}
const run = async (ast, env, { line: line1 = -1 , col =0  })=>{
    evaluate = loggingEvaluate(line1, col, ogEval);
    const astStream = new Stream(ast);
    let imports = [];
    while(!astStream.eof() && astStream.peek().type === "import")imports.push(astStream.next());
    for (const imp of imports){
        const src = await fetch(imp.source);
        const importAst = parse(await src.text());
        const importEnv = new Environment(builtIns1);
        const val = await run(importAst.prog, importEnv);
        if (val.type !== "function") throw "Can only import functions.";
        env.add(imp.name, {
            type: "import",
            function: val,
            env: importEnv
        });
    }
    return evaluate(astStream, env);
};
const is_letter = (ch)=>/[a-z]/i.test(ch)
;
const regExString = `${Object.keys(builtIns1).sort((a, b)=>b.length - a.length
).reduce((acc, cur, i3)=>acc + "(" + cur + "(\\s|\\b))" + (i3 !== Object.keys(builtIns1).length - 1 ? `|` : "")
, "")}`;
const builtInRegEx = new RegExp(regExString, "i");
const kw = [
    "layer",
    ...KEYWORDS
];
const keywords = new RegExp("(" + kw.join("|") + ")\\b");
const literalOps = OPERATORS.flat().map((op)=>op.split("").map((__char)=>is_letter(__char) ? __char : `\\${__char}`
    ).join("")
);
const opsString = "(" + literalOps.map((op)=>/[a-zA-Z]/.test(op[0]) ? `(\s|\\b)${op}(\s|\\b)` : `${op}`
).join("|") + ")";
var operators = new RegExp(`(${opsString})`);
CodeMirror.defineSimpleMode("simplemode", {
    meta: {
        lineComment: '\/\/'
    },
    start: [
        {
            regex: /(def)( *[a-z|0-9|?]*)([a-z| |0-9|?]*)(:|{)/i,
            token: [
                "keyword",
                null,
                "variable-2",
                null
            ]
        },
        {
            regex: /(\\)([a-z| |0-9|?]*)(:|{)/i,
            token: [
                "keyword",
                "variable-2",
                null
            ]
        },
        {
            regex: /"(?:[^\\]|\\.)*?(?:"|$)/,
            token: "string"
        },
        {
            regex: keywords,
            token: "keyword"
        },
        {
            regex: /true|false|undefined/,
            token: "atom"
        },
        {
            regex: /\/\/.*/,
            token: "comment"
        },
        {
            regex: operators,
            token: "operator"
        },
        {
            regex: /\d+|\d+\.\d+/i,
            token: "number"
        },
        {
            regex: builtInRegEx,
            token: "built-in"
        },
        {
            regex: /[a-z$][\w$]*/,
            token: "variable"
        }
    ]
});
function indent(cm) {
    cm.indentSelection("add");
}
function dedent(cm) {
    cm.indentSelection("subtract");
}
function wordAt(cm, pos) {
    var start = pos.ch, end = start, line1 = cm.getLine(pos.line);
    while(start && CodeMirror.isWordChar(line1.charAt(start - 1)))--start;
    while(end < line1.length && CodeMirror.isWordChar(line1.charAt(end)))++end;
    return {
        from: CodeMirror.Pos(pos.line, start),
        to: CodeMirror.Pos(pos.line, end),
        word: line1.slice(start, end)
    };
}
function isSelectedRange(ranges, from, to) {
    for(var i3 = 0; i3 < ranges.length; i3++)if (CodeMirror.cmpPos(ranges[i3].from(), from) == 0 && CodeMirror.cmpPos(ranges[i3].to(), to) == 0) return true;
    return false;
}
function selectNextOccurrence(cm) {
    var from = cm.getCursor("from"), to = cm.getCursor("to");
    var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
    if (CodeMirror.cmpPos(from, to) == 0) {
        var word = wordAt(cm, from);
        if (!word.word) return;
        cm.setSelection(word.from, word.to);
        fullWord = true;
    } else {
        var text2 = cm.getRange(from, to);
        var query = fullWord ? new RegExp("\\b" + text2 + "\\b") : text2;
        var cur = cm.getSearchCursor(query, to);
        var found = cur.findNext();
        if (!found) {
            cur = cm.getSearchCursor(query, CodeMirror.Pos(cm.firstLine(), 0));
            found = cur.findNext();
        }
        if (!found || isSelectedRange(cm.listSelections(), cur.from(), cur.to())) return;
        cm.addSelection(cur.from(), cur.to());
    }
    if (fullWord) cm.state.sublimeFindFullWord = cm.doc.sel;
}
function toggleComment(cm) {
    cm.toggleComment();
}
function initCodeEditor(main1, state) {
    const codemirror = CodeMirror(document.querySelector('#code-editor'), {
        lineNumbers: true,
        tabSize: 2,
        value: main1,
        styleActiveLine: {
            nonEmpty: false
        },
        extraKeys: {
            Tab: indent,
            "Shift-Tab": dedent,
            "Cmd-D": selectNextOccurrence,
            "Cmd-/": toggleComment,
            "Ctrl-/": toggleComment
        }
    });
    const DONT_OPEN = [
        "Enter",
        "Escape",
        "Tab",
        "Key",
        "ArrowRight",
        "ArrowLeft",
        "ArrowUp",
        "ArrowDown"
    ];
    codemirror.on("keyup", function(cm, event) {
        if (!cm.state.completionActive && !DONT_OPEN.includes(event.code) && state.hints) {
            snippet();
        }
    });
    var STRIP_COMMENTS1 = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES1 = /([^\s,]+)/g;
    function getParamNames1(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS1, '');
        var result3 = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES1);
        if (result3 === null) result3 = [];
        return result3;
    }
    const snippets = Object.keys(builtIns1).map((x)=>{
        const value = builtIns1[x].value || builtIns1[x];
        let params = getParamNames1(value);
        if (params[params.length - 1] === "env") params = params.slice(0, params.length - 1);
        let text3 = x;
        if (params.length !== 0) text3 += " " + params.join(" ");
        return {
            text: x,
            displayText: text3
        };
    });
    function snippet() {
        CodeMirror.showHint(codemirror, function() {
            const cursor = codemirror.getCursor();
            const token = codemirror.getTokenAt(cursor);
            const start = token.start;
            const end = cursor.ch;
            const line1 = cursor.line;
            const currentWord = token.string;
            const list = snippets.filter(function(item) {
                return item.text.indexOf(currentWord) >= 0;
            });
            return {
                list: list.length && currentWord !== "" ? list : [],
                from: CodeMirror.Pos(line1, start),
                to: CodeMirror.Pos(line1, end)
            };
        }, {
            completeSingle: false,
            extraKeys: {
                Enter: "newlineAndIndent"
            }
        });
    }
    return codemirror;
}
async function runtime(string1, builtIns2, logLine = -1) {
    let env = new Environment(builtIns2);
    const ast = parse(string1);
    const result3 = await run(ast.prog, env, logLine);
    return {
        result: result3,
        turtles: [
            ...env.turtles,
            ...env.shown
        ],
        env
    };
}
function downloads(name4) {
    return html`\n    <div id="downloads" class="menu-item">\n      download\n      <div class="button-menu">\n        <input class="menu-option name" type="text" placeholder=${name4}></input>\n        <button id="downloadSVG" class="menu-option menu-item">SVG</button>\n        <button id="downloadTxt" class="menu-option menu-item">txt</button>\n        <button id="download-url" class="menu-option menu-item">URL</button>\n      </div>\n    </div>\n  `;
}
function view({ svgCloth , hints , showTurtles , showDimensions , draw: draw1 , autorun , consoleMessage , content , experimental , grid , name: name4  }) {
    return html`\n    <div id="code-editor"></div>\n    <div id="buttons">\n      <div id="run" class="menu-item">run (Shift + Enter)</div>\n      <div id="center" class="menu-item">view</div>\n      ${downloads(name4)}\n      <div id="options" class="menu-item">\n        options\n        <div class="button-menu">\n          <div id="show-turtles" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${showTurtles ? "filled" : ""}"></div>\n              <span>show turtle</span>\n            </span>\n          </div>\n          <div id="show-dimensions" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${showDimensions ? "filled" : ""}"></div>\n              <span>dimensions</span>\n            </span>\n          </div>\n          <div id="autorun" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${autorun ? "filled" : ""}"></div>\n              <span>autorun</span>\n            </span>\n          </div>\n          <div id="hints" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${hints ? "filled" : ""}"></div>\n              <span>hints</span>\n            </span>\n          </div>\n          <div id="draw" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${draw1 ? "filled" : ""}"></div>\n              <span>draw</span>\n            </span>\n          </div>\n          <div id="grid" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${grid ? "filled" : ""}"></div>\n              <span>grid</span>\n            </span>\n          </div>\n          <div id="experimental" class="menu-option checkbox">\n            <span>\n              <div class="fillbox ${experimental ? "filled" : ""}"></div>\n              <span>experimental</span>\n            </span>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div id="vertical-bar"></div>\n    <div id="viewer">\n      ${svgCloth.draw(content)}\n      <div class="\n        console \n        ${consoleMessage.error ? "console-erred" : ""} \n        ${consoleMessage.value !== "" ? "console-show" : ""}">\n        ${consoleMessage.value}\n      </div>    \n    </div>\n	`;
}
const end = (type2, line1, turtle, args, initScale)=>{
    const { x , y  } = turtle.end;
    return svg`\n    <style>\n      .manipulator:hover {\n        fill: red;\n      }\n    </style>\n    <g transform="scale(1, -1)">\n      <circle \n        @mousedown=${(e)=>dispatch("DRAG_HANDLE_TARGET", {
            dragging: true
        })
    } \n        class="manipulator ${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${x}" \n        cy="${y}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${x} ${y}"/>\n    </g>\n  `;
};
const cc = (type2, line1, turtle, args, initScale)=>{
    const { x , y  } = turtle.centroid;
    return svg`\n    <style>\n      .manipulator:hover {\n        fill: red;\n      }\n    </style>\n    <g transform="scale(1, -1)">\n      <circle \n        @mousedown=${(e)=>dispatch("DRAG_HANDLE_TARGET", {
            dragging: true
        })
    } \n        class="manipulator ${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${x}" \n        cy="${y}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${x} ${y}"/>\n    </g>\n  `;
};
const scale1 = (type2, line1, turtle, args, initScale)=>{
    const { x: ccx , y: ccy  } = turtle.centroid;
    const { x: rtx , y: rty  } = turtle.rt;
    return svg`\n    <style>\n      .manipulator:hover {\n        fill: red;\n      }\n    </style>\n    <g transform="scale(1, -1)">\n      <circle\n        class="${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${ccx}" \n        cy="${ccy}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${ccx} ${ccy}"/>\n    </g>\n    <g transform="scale(1, -1)">\n      <circle \n        @mousedown=${(e)=>dispatch("DRAG_HANDLE_TARGET", {
            dragging: true
        })
    } \n        class="manipulator ${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${rtx}" \n        cy="${rty}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${rtx} ${rty}"/>\n    </g>\n  `;
};
const rotate1 = (type2, line1, turtle, args, initScale)=>{
    const { x: ccx , y: ccy  } = turtle.centroid;
    return svg`\n    <style>\n      .manipulator:hover {\n        fill: red;\n      }\n    </style>\n    <g transform="scale(1, -1)">\n      <circle\n        class="${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${ccx}" \n        cy="${ccy}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${ccx} ${ccy}"/>\n    </g>\n    <g transform="scale(1, -1)">\n      <circle \n        @mousedown=${(e)=>dispatch("DRAG_HANDLE_TARGET", {
            dragging: true
        })
    } \n        class="manipulator ${type2} scale-with-viewer handle"\n        data-line=${line1}\n        cx="${ccx}" \n        cy="${ccy + turtle.height / 2}" \n        r="5" \n        stroke="black" \n        stroke-width="0" \n        fill="orange"\n        transform="scale(${initScale}, ${initScale})"\n        transform-origin="${ccx} ${ccy + turtle.height / 2}"/>\n    </g>\n  `;
};
function drawDirectEditHandle({ type: type2 , line: line1 , turtleAfter: turtle , args  }, svgCloth) {
    let result3 = "";
    let initScale = svgCloth.getInitScaleWithViewer();
    if (turtle) {
        if (type2 === "turnforward") return end(type2, line1, turtle, args, initScale);
        else if (type2 === "goto") return end(type2, line1, turtle, args, initScale);
        else if (type2 === "arc") return end(type2, line1, turtle, args, initScale);
        else if (type2 === "rotate") return rotate1(type2, line1, turtle, args, initScale);
        else if (type2 === "scale") return scale1(type2, line1, turtle, args, initScale);
        else if (type2 === "translate") return cc(type2, line1, turtle, args, initScale);
        else if (type2 === "move") return cc(type2, line1, turtle, args, initScale);
    }
}
const drawLine = ([p0, p1])=>svg`\n  <g transform="scale(1, -1)">\n    <polyline \n      points="${p0.x},${p0.y} ${p1.x},${p1.y}" \n      stroke="black"\n      stroke-width="2px"\n      vector-effect="non-scaling-stroke"/>\n  </g>\n`
;
function group1() {
    const turtles = arguments;
    let path4 = [];
    for (const turtle of turtles){
        if (turtle.path.length === 1) {
            if (turtle.path[0].points.length === 1) continue;
        }
        path4 = [
            ...path4,
            ...turtle.path
        ];
    }
    const __final = new Turtle();
    if (path4.length > 0) __final.path = path4;
    __final.angle = turtles[turtles.length - 1].angle;
    return __final;
}
const round1 = (num)=>Math.round(num * 100) / 100
;
const drawDims = (turtles)=>{
    const turtle = group1(...turtles);
    if (!turtle) return "";
    const { width: w , height: h , ct , rc  } = turtle;
    return svg`\n    <defs>\n      <marker \n        id="start-arrow" \n        viewBox="0 0 10 10"\n        markerWidth="10" markerHeight="7" \n        refX="0" refY="3.5" \n        orient="auto">\n          <polygon points="10 0, 10 7, 0 3.5" fill="black" />\n      </marker>\n      <marker \n        id="end-arrow" \n        viewBox="0 0 10 10"\n        markerWidth="10" markerHeight="7" \n        refX="10" refY="3.5" \n        orient="auto" \n        markerUnits="strokeWidth">\n          <polygon points="0 0, 10 3.5, 0 7" fill="black" />\n      </marker>\n      <path \n        id="width-baseline"\n        d="M ${ct.x + w / 2},${ct.y + h * 0.07} L ${ct.x - w / 2},${ct.y + h * 0.07}" \n        stroke="none"\n        stroke-width="0px"/>\n      <path \n        id="height-baseline"\n        d="M ${rc.x + w * 0.07},${rc.y - h / 2} L ${rc.x + w * 0.07},${rc.y + h / 2} " \n        stroke="none"\n        stroke-width="0px"/>\n    </defs>\n    <g transform="scale(1, -1)">\n      <path \n        id="width"\n        marker-start="url(#start-arrow)"\n        marker-end="url(#end-arrow)"\n        d="M ${ct.x + w / 2},${ct.y + h * 0.05} L ${ct.x - w / 2},${ct.y + h * 0.05}" \n        stroke="black"\n        stroke-width="1px"\n        vector-effect="non-scaling-stroke"/>\n      <path \n        id="height"\n        marker-start="url(#start-arrow)"\n        marker-end="url(#end-arrow)"\n        d="M ${rc.x + w * 0.05},${rc.y - h / 2} L ${rc.x + w * 0.05},${rc.y + h / 2} " \n        stroke="black"\n        stroke-width="1px"\n        vector-effect="non-scaling-stroke"/>\n      <g transform="scale(1, -1)" transform-origin="${rc.x} ${rc.y}">\n        <text \n          style="\n            font-size: ${h / 10}px;\n          " \n          text-anchor="middle">\n          <textPath \n            href="#height-baseline" \n            startOffset="50%">\n            ${round1(h)} mm\n          </textPath>\n        </text>\n      </g>\n      <g transform="scale(-1, 1)" transform-origin="${ct.x} ${ct.y}">\n        <text \n          style="\n            font-size: ${w / 10}px;\n          " \n          text-anchor="middle">\n          <textPath \n            href="#width-baseline" \n            startOffset="50%">\n            ${round1(w)} mm\n          </textPath>\n        </text>\n      </g>\n    </g>\n  `;
};
const renderApp = (state)=>{
    const turtles = state.turtles;
    const content = turtles.map((turtle, i3)=>drawTurtle(turtle, {
            showTurtles: state.showTurtles
        })
    );
    if (state.draw && state.tempLine) content.push(drawLine(state.tempLine));
    if (state.showDimensions) content.push(drawDims(turtles));
    if (state.directEditHandle) content.push(drawDirectEditHandle(state.directEditHandle, state.svgCloth));
    state.svgCloth.grid = state.grid;
    state.content = content;
    render(view(state), document.getElementById("root"));
};
function Delegate(root) {
    this.listenerMap = [
        {
        },
        {
        }
    ];
    if (root) {
        this.root(root);
    }
    this.handle = Delegate.prototype.handle.bind(this);
    this._removedListeners = [];
}
Delegate.prototype.root = function(root) {
    const listenerMap = this.listenerMap;
    let eventType;
    if (this.rootElement) {
        for(eventType in listenerMap[1]){
            if (listenerMap[1].hasOwnProperty(eventType)) {
                this.rootElement.removeEventListener(eventType, this.handle, true);
            }
        }
        for(eventType in listenerMap[0]){
            if (listenerMap[0].hasOwnProperty(eventType)) {
                this.rootElement.removeEventListener(eventType, this.handle, false);
            }
        }
    }
    if (!root || !root.addEventListener) {
        if (this.rootElement) {
            delete this.rootElement;
        }
        return this;
    }
    this.rootElement = root;
    for(eventType in listenerMap[1]){
        if (listenerMap[1].hasOwnProperty(eventType)) {
            this.rootElement.addEventListener(eventType, this.handle, true);
        }
    }
    for(eventType in listenerMap[0]){
        if (listenerMap[0].hasOwnProperty(eventType)) {
            this.rootElement.addEventListener(eventType, this.handle, false);
        }
    }
    return this;
};
Delegate.prototype.captureForType = function(eventType) {
    return [
        'blur',
        'error',
        'focus',
        'load',
        'resize',
        'scroll'
    ].indexOf(eventType) !== -1;
};
Delegate.prototype.on = function(eventType, selector, handler, useCapture) {
    let root;
    let listenerMap;
    let matcher;
    let matcherParam;
    if (!eventType) {
        throw new TypeError('Invalid event type: ' + eventType);
    }
    if (typeof selector === 'function') {
        useCapture = handler;
        handler = selector;
        selector = null;
    }
    if (useCapture === undefined) {
        useCapture = this.captureForType(eventType);
    }
    if (typeof handler !== 'function') {
        throw new TypeError('Handler must be a type of Function');
    }
    root = this.rootElement;
    listenerMap = this.listenerMap[useCapture ? 1 : 0];
    if (!listenerMap[eventType]) {
        if (root) {
            root.addEventListener(eventType, this.handle, useCapture);
        }
        listenerMap[eventType] = [];
    }
    if (!selector) {
        matcherParam = null;
        matcher = matchesRoot.bind(this);
    } else if (/^[a-z]+$/i.test(selector)) {
        matcherParam = selector;
        matcher = matchesTag;
    } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
        matcherParam = selector.slice(1);
        matcher = matchesId;
    } else {
        matcherParam = selector;
        matcher = Element.prototype.matches;
    }
    listenerMap[eventType].push({
        selector: selector,
        handler: handler,
        matcher: matcher,
        matcherParam: matcherParam
    });
    return this;
};
Delegate.prototype.off = function(eventType, selector, handler, useCapture) {
    let i3;
    let listener;
    let listenerMap;
    let listenerList;
    let singleEventType;
    if (typeof selector === 'function') {
        useCapture = handler;
        handler = selector;
        selector = null;
    }
    if (useCapture === undefined) {
        this.off(eventType, selector, handler, true);
        this.off(eventType, selector, handler, false);
        return this;
    }
    listenerMap = this.listenerMap[useCapture ? 1 : 0];
    if (!eventType) {
        for(singleEventType in listenerMap){
            if (listenerMap.hasOwnProperty(singleEventType)) {
                this.off(singleEventType, selector, handler);
            }
        }
        return this;
    }
    listenerList = listenerMap[eventType];
    if (!listenerList || !listenerList.length) {
        return this;
    }
    for(i3 = listenerList.length - 1; i3 >= 0; i3--){
        listener = listenerList[i3];
        if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
            this._removedListeners.push(listener);
            listenerList.splice(i3, 1);
        }
    }
    if (!listenerList.length) {
        delete listenerMap[eventType];
        if (this.rootElement) {
            this.rootElement.removeEventListener(eventType, this.handle, useCapture);
        }
    }
    return this;
};
Delegate.prototype.handle = function(event) {
    let i3;
    let l;
    const type2 = event.type;
    let root;
    let phase;
    let listener;
    let returned;
    let listenerList = [];
    let target;
    const eventIgnore = 'ftLabsDelegateIgnore';
    if (event[eventIgnore] === true) {
        return;
    }
    target = event.target;
    if (target.nodeType === 3) {
        target = target.parentNode;
    }
    if (target.correspondingUseElement) {
        target = target.correspondingUseElement;
    }
    root = this.rootElement;
    phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);
    switch(phase){
        case 1:
            listenerList = this.listenerMap[1][type2];
            break;
        case 2:
            if (this.listenerMap[0] && this.listenerMap[0][type2]) {
                listenerList = listenerList.concat(this.listenerMap[0][type2]);
            }
            if (this.listenerMap[1] && this.listenerMap[1][type2]) {
                listenerList = listenerList.concat(this.listenerMap[1][type2]);
            }
            break;
        case 3:
            listenerList = this.listenerMap[0][type2];
            break;
    }
    let toFire = [];
    l = listenerList.length;
    while(target && l){
        for(i3 = 0; i3 < l; i3++){
            listener = listenerList[i3];
            if (!listener) {
                break;
            }
            if (target.tagName && [
                "button",
                "input",
                "select",
                "textarea"
            ].indexOf(target.tagName.toLowerCase()) > -1 && target.hasAttribute("disabled")) {
                toFire = [];
            } else if (listener.matcher.call(target, listener.matcherParam, target)) {
                toFire.push([
                    event,
                    target,
                    listener
                ]);
            }
        }
        if (target === root) {
            break;
        }
        l = listenerList.length;
        target = target.parentElement || target.parentNode;
        if (target instanceof HTMLDocument) {
            break;
        }
    }
    let ret;
    for(i3 = 0; i3 < toFire.length; i3++){
        if (this._removedListeners.indexOf(toFire[i3][2]) > -1) {
            continue;
        }
        returned = this.fire.apply(this, toFire[i3]);
        if (returned === false) {
            toFire[i3][0][eventIgnore] = true;
            toFire[i3][0].preventDefault();
            ret = false;
            break;
        }
    }
    return ret;
};
Delegate.prototype.fire = function(event, target, listener) {
    return listener.handler.call(target, event, target);
};
function matchesTag(tagName, element6) {
    return tagName.toLowerCase() === element6.tagName.toLowerCase();
}
function matchesRoot(selector, element6) {
    if (this.rootElement === window) {
        return element6 === document || element6 === document.documentElement || element6 === window;
    }
    return this.rootElement === element6;
}
function matchesId(id, element6) {
    return id === element6.id;
}
Delegate.prototype.destroy = function() {
    this.off();
    this.root();
};
const getDistance2 = (p1, p2)=>Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
;
const getAngle2 = (p1, p2)=>180 / Math.PI * Math.atan2(p2.y - p1.y, p2.x - p1.x)
;
const round2 = (x, precision = 1)=>Math.round(x * precision) / precision
;
const negate = (x)=>x < 0 ? `~${x.toString().substring(1)}` : x
;
const numToGram = (x, precision = 1)=>negate(round2(x, precision))
;
const forwardturn = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const lastPoint = turtle.pointsFromLast(0);
    const lastPoint2 = turtle.pointsFromLast(1);
    mouseLocation.y = -mouseLocation.y;
    const d = getDistance2(mouseLocation, lastPoint);
    const a = (turtle.points.length > 1 ? 0 : 180) + (getAngle2(mouseLocation, lastPoint) - getAngle2(lastPoint, lastPoint2));
    const newLine = `${type2} ${numToGram(a)} ${numToGram(d)}`;
    return newLine;
};
const __goto = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const { x , y  } = mouseLocation;
    const newLine = `${type2} [ ${numToGram(x)} ${numToGram(-y)} ]`;
    return newLine;
};
const arc1 = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const lastPoint = turtle.pointsFromLast(0);
    const lastPoint2 = turtle.pointsFromLast(1);
    mouseLocation.y = -mouseLocation.y;
    const d = getDistance2(mouseLocation, lastPoint);
    let a = (turtle.points.length > 1 ? 0 : 180) + (getAngle2(mouseLocation, lastPoint) - getAngle2(lastPoint, lastPoint2));
    let a1 = Math.abs(a * 2 - 180) / 2;
    let d1 = d / 2 / Math.cos(a1 / 180 * Math.PI);
    if (d1 < 0) {
        d1 *= -1;
        a = -Math.abs(360 - a);
    }
    const newLine = `${type2} ${numToGram(a * 2 % 360)} ${numToGram(d1, 10)}`;
    return newLine;
};
const rotate2 = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    mouseLocation.y = -mouseLocation.y;
    const a = getAngle2(mouseLocation, turtle.centroid);
    const newLine = `${type2} this|centroidof ${numToGram(a)}`;
    return newLine;
};
const scale2 = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const x = mouseLocation.x;
    const y = -mouseLocation.y;
    const { x: rtx , y: rty  } = turtle.rt;
    const { x: ccx , y: ccy  } = turtle.centroid;
    const newdx = x - ccx;
    const ogdx = rtx - ccx;
    let xScale = newdx / ogdx;
    const newdy = y - ccy;
    const ogdy = rty - ccy;
    let yScale = newdy / ogdy;
    const newLine = `${type2} ${numToGram(xScale, 100)} ${numToGram(yScale, 100)}`;
    return newLine;
};
const translate1 = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const { x , y  } = mouseLocation;
    const { x: x2 , y: y2  } = turtle.centroid;
    const newLine = `${type2} ${numToGram(x - x2)} ${numToGram(-y - y2)}`;
    return newLine;
};
const move1 = (directEditHandle, mouseLocation)=>{
    const { type: type2 , turtleBefore: turtle  } = directEditHandle;
    const { x , y  } = mouseLocation;
    const newLine = `${type2} this|centroidof [ ${numToGram(x)} ${numToGram(-y)} ]`;
    return newLine;
};
function handleLineMaker(directEditHandle, mouseLocation) {
    const type2 = directEditHandle.type;
    let result3;
    if (type2 === "turnforward") result3 = forwardturn(directEditHandle, mouseLocation);
    else if (type2 === "goto") result3 = __goto(directEditHandle, mouseLocation);
    else if (type2 === "arc") result3 = arc1(directEditHandle, mouseLocation);
    else if (type2 === "rotate") result3 = rotate2(directEditHandle, mouseLocation);
    else if (type2 === "scale") result3 = scale2(directEditHandle, mouseLocation);
    else if (type2 === "translate") result3 = translate1(directEditHandle, mouseLocation);
    else if (type2 === "move") result3 = move1(directEditHandle, mouseLocation);
    if (result3) {
        return `${" ".repeat(directEditHandle.col)}${result3}`;
    }
}
const isInfinity = (num)=>num < -10000000 || num > 10000000
;
function minsMaxes(turtles) {
    let xMin = Number.POSITIVE_INFINITY;
    let xMax = Number.NEGATIVE_INFINITY;
    let yMin = Number.POSITIVE_INFINITY;
    let yMax = Number.NEGATIVE_INFINITY;
    for (const turtle of turtles){
        let { xMin: curMinX , yMin: curMinY , xMax: curMaxX , yMax: curMaxY  } = turtle.extrema();
        if (xMin > curMinX) xMin = curMinX;
        if (xMax < curMaxX) xMax = curMaxX;
        if (yMin > curMinY) yMin = curMinY;
        if (yMax < curMaxY) yMax = curMaxY;
    }
    if (isInfinity(xMin)) xMin = 0;
    if (isInfinity(xMax)) xMax = 0;
    if (isInfinity(yMin)) yMin = 0;
    if (isInfinity(yMax)) yMax = 0;
    return {
        xMin,
        xMax,
        yMin,
        yMax
    };
}
function readTxtSVG(file) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = (event)=>{
        let text3 = reader.result;
        const container = document.createElement("div");
        container.innerHTML = text3;
        const recoveredTxt = container.firstChild.dataset.txt;
        dispatch("SET_CODE", {
            txt: recoveredTxt
        });
    };
}
function createElementFromHTML(htmlString) {
    var div1 = document.createElement('div');
    div1.innerHTML = htmlString.trim();
    return div1.firstChild;
}
function readImg(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (event)=>{
        const htmlStringWithDelete = `\n\n      <div\n        style="\n          position: absolute;\n          left: 0px;\n          top: 0px;\n          z-index: -99;\n        "\n        class="resize-manual"\n        >\n        <style>\n          .delete-ghost {\n            z-index: 10 !important;\n          }\n\n          .delete-ghost:hover {\n            color: red;\n          }\n\n        </style>\n        <img \n          src="${reader.result}" \n          ><img/>\n        <div class="delete-ghost" style="z-index: 99;">delete</div>\n      </div>\n    `;
        const htmlString = `\n\n      <div\n        style="\n          position: absolute;\n          left: 0px;\n          top: 0px;\n          z-index: -99;\n        "\n        class="resize-manual"\n        >\n        <img \n          src="${reader.result}" \n          ><img/>\n      </div>\n    `;
        const img = createElementFromHTML(htmlString);
        const container = document.getElementById("viewer");
        document.getElementById("svg-view").style.opacity = 0.5;
        container.appendChild(img);
    };
}
function upload(files, extensions = []) {
    let file = files[0];
    let fileName = file.name.split(".");
    let name4 = fileName[0];
    const extension = fileName[fileName.length - 1];
    if (extensions.length > 0 && extensions.includes(enxtension)) throw "Extension not recongized: " + fileName;
    console.log(file);
    if ([
        "txt",
        "svg"
    ].includes(extension)) readTxtSVG(file);
    else if ([
        "png",
        "JPG"
    ].includes(extension)) readImg(file);
    else console.log("Unknown extension:", extension);
}
function downloadSVG(filename, turtles, txt) {
    const { xMin , xMax , yMin , yMax  } = minsMaxes(turtles);
    const margin = 5;
    const oneTurtle = turtles.reduce((acc, cur)=>{
        acc.path = [
            ...acc.path,
            ...cur.path
        ];
        return acc;
    }, new Turtle());
    const atOrigin = oneTurtle.move(oneTurtle.point("lt"), {
        x: 5,
        y: -5
    });
    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const width2 = xMax - xMin + 2 * 5;
    const height2 = yMax - yMin + 2 * 5;
    svg1.setAttribute("width", `${width2}mm`);
    svg1.setAttribute("height", `${height2}mm`);
    svg1.setAttribute("viewBox", `0 0 ${width2} ${height2}`);
    svg1.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg1.dataset.txt = txt;
    document.body.appendChild(svg1);
    const litsvg = drawTurtle(atOrigin, {
        showTurtles: false,
        filterConstruction: true
    });
    render(litsvg, svg1);
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg1);
    const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `${filename}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    document.body.removeChild(svg1);
}
function download(filename, txt) {
    const blob = new Blob([
        txt
    ], {
        type: "text/plain"
    });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}`;
    link.click();
    URL.revokeObjectURL(link);
}
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path4, base) {
            return commonjsRequire1(path4, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire1() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var inherits_browser = createCommonjsModule(function(module) {
    if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
            if (superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            }
        };
    } else {
        module.exports = function inherits(ctor, superCtor) {
            if (superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function() {
                };
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
            }
        };
    }
});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {
};
var browser = deprecate;
function deprecate(fn, msg) {
    if (config("noDeprecation")) {
        return fn;
    }
    var warned = false;
    function deprecated() {
        if (!warned) {
            if (config("throwDeprecation")) {
                throw new Error(msg);
            } else if (config("traceDeprecation")) {
                console.trace(msg);
            } else {
                console.warn(msg);
            }
            warned = true;
        }
        return fn.apply(this, arguments);
    }
    return deprecated;
}
function config(name4) {
    try {
        if (!commonjsGlobal.localStorage) return false;
    } catch (_) {
        return false;
    }
    var val = commonjsGlobal.localStorage[name4];
    if (val == null) return false;
    return String(val).toLowerCase() === "true";
}
var global$1 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {
};
var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var inited = false;
function init1() {
    inited = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(var i3 = 0, len = code.length; i3 < len; ++i3){
        lookup[i3] = code[i3];
        revLookup[code.charCodeAt(i3)] = i3;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
}
function toByteArray(b64) {
    if (!inited) {
        init1();
    }
    var i3, j, l, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for(i3 = 0, j = 0; i3 < l; i3 += 4, j += 3){
        tmp = revLookup[b64.charCodeAt(i3)] << 18 | revLookup[b64.charCodeAt(i3 + 1)] << 12 | revLookup[b64.charCodeAt(i3 + 2)] << 6 | revLookup[b64.charCodeAt(i3 + 3)];
        arr[L++] = tmp >> 16 & 255;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
        tmp = revLookup[b64.charCodeAt(i3)] << 2 | revLookup[b64.charCodeAt(i3 + 1)] >> 4;
        arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
        tmp = revLookup[b64.charCodeAt(i3)] << 10 | revLookup[b64.charCodeAt(i3 + 1)] << 4 | revLookup[b64.charCodeAt(i3 + 2)] >> 2;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    return arr;
}
function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end1) {
    var tmp;
    var output = [];
    for(var i3 = start; i3 < end1; i3 += 3){
        tmp = (uint8[i3] << 16) + (uint8[i3 + 1] << 8) + uint8[i3 + 2];
        output.push(tripletToBase64(tmp));
    }
    return output.join("");
}
function fromByteArray(uint8) {
    if (!inited) {
        init1();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts1 = [];
    var maxChunkLength = 16383;
    for(var i3 = 0, len2 = len - extraBytes; i3 < len2; i3 += maxChunkLength){
        parts1.push(encodeChunk(uint8, i3, i3 + maxChunkLength > len2 ? len2 : i3 + maxChunkLength));
    }
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup[tmp >> 2];
        output += lookup[tmp << 4 & 63];
        output += "==";
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        output += lookup[tmp >> 10];
        output += lookup[tmp >> 4 & 63];
        output += lookup[tmp << 2 & 63];
        output += "=";
    }
    parts1.push(output);
    return parts1.join("");
}
function read(buffer, offset2, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i3 = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset2 + i3];
    i3 += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset2 + i3], i3 += d, nBits -= 8){
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset2 + i3], i3 += d, nBits -= 8){
    }
    if (e === 0) {
        e = 1 - eBias;
    } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write(buffer, value, offset2, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i3 = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset2 + i3] = m & 255, i3 += d, m /= 256, mLen -= 8){
    }
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset2 + i3] = e & 255, i3 += d, e /= 256, eLen -= 8){
    }
    buffer[offset2 + i3 - d] |= s * 128;
}
var toString = {
}.toString;
var isArray = Array.isArray || function(arr) {
    return toString.call(arr) == "[object Array]";
};
var INSPECT_MAX_BYTES = 50;
Buffer2.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== void 0 ? global$1.TYPED_ARRAY_SUPPORT : true;
var _kMaxLength = kMaxLength1();
function kMaxLength1() {
    return Buffer2.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function createBuffer(that, length1) {
    if (kMaxLength1() < length1) {
        throw new RangeError("Invalid typed array length");
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        that = new Uint8Array(length1);
        that.__proto__ = Buffer2.prototype;
    } else {
        if (that === null) {
            that = new Buffer2(length1);
        }
        that.length = length1;
    }
    return that;
}
function Buffer2(arg, encodingOrOffset, length1) {
    if (!Buffer2.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer2)) {
        return new Buffer2(arg, encodingOrOffset, length1);
    }
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
            throw new Error("If encoding is specified then the first argument must be a string");
        }
        return allocUnsafe1(this, arg);
    }
    return from1(this, arg, encodingOrOffset, length1);
}
Buffer2.poolSize = 8192;
Buffer2._augment = function(arr) {
    arr.__proto__ = Buffer2.prototype;
    return arr;
};
function from1(that, value, encodingOrOffset, length1) {
    if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
        return fromArrayBuffer1(that, value, encodingOrOffset, length1);
    }
    if (typeof value === "string") {
        return fromString1(that, value, encodingOrOffset);
    }
    return fromObject1(that, value);
}
Buffer2.from = function(value, encodingOrOffset, length1) {
    return from1(null, value, encodingOrOffset, length1);
};
if (Buffer2.TYPED_ARRAY_SUPPORT) {
    Buffer2.prototype.__proto__ = Uint8Array.prototype;
    Buffer2.__proto__ = Uint8Array;
}
function assertSize(size) {
    if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }
}
function alloc(that, size, fill2, encoding) {
    assertSize(size);
    if (size <= 0) {
        return createBuffer(that, size);
    }
    if (fill2 !== void 0) {
        return typeof encoding === "string" ? createBuffer(that, size).fill(fill2, encoding) : createBuffer(that, size).fill(fill2);
    }
    return createBuffer(that, size);
}
Buffer2.alloc = function(size, fill2, encoding) {
    return alloc(null, size, fill2, encoding);
};
function allocUnsafe1(that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked1(size) | 0);
    if (!Buffer2.TYPED_ARRAY_SUPPORT) {
        for(var i3 = 0; i3 < size; ++i3){
            that[i3] = 0;
        }
    }
    return that;
}
Buffer2.allocUnsafe = function(size) {
    return allocUnsafe1(null, size);
};
Buffer2.allocUnsafeSlow = function(size) {
    return allocUnsafe1(null, size);
};
function fromString1(that, string1, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length1 = byteLength1(string1, encoding) | 0;
    that = createBuffer(that, length1);
    var actual = that.write(string1, encoding);
    if (actual !== length1) {
        that = that.slice(0, actual);
    }
    return that;
}
function fromArrayLike(that, array) {
    var length1 = array.length < 0 ? 0 : checked1(array.length) | 0;
    that = createBuffer(that, length1);
    for(var i4 = 0; i4 < length1; i4 += 1){
        that[i4] = array[i4] & 255;
    }
    return that;
}
function fromArrayBuffer1(that, array, byteOffset, length1) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length1 || 0)) {
        throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length1 === void 0) {
        array = new Uint8Array(array);
    } else if (length1 === void 0) {
        array = new Uint8Array(array, byteOffset);
    } else {
        array = new Uint8Array(array, byteOffset, length1);
    }
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        that = array;
        that.__proto__ = Buffer2.prototype;
    } else {
        that = fromArrayLike(that, array);
    }
    return that;
}
function fromObject1(that, obj) {
    if (internalIsBuffer1(obj)) {
        var len = checked1(obj.length) | 0;
        that = createBuffer(that, len);
        if (that.length === 0) {
            return that;
        }
        obj.copy(that, 0, 0, len);
        return that;
    }
    if (obj) {
        if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if (typeof obj.length !== "number" || isnan1(obj.length)) {
                return createBuffer(that, 0);
            }
            return fromArrayLike(that, obj);
        }
        if (obj.type === "Buffer" && isArray(obj.data)) {
            return fromArrayLike(that, obj.data);
        }
    }
    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function checked1(length1) {
    if (length1 >= kMaxLength1()) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength1().toString(16) + " bytes");
    }
    return length1 | 0;
}
function SlowBuffer(length1) {
    if (+length1 != length1) {
        length1 = 0;
    }
    return Buffer2.alloc(+length1);
}
Buffer2.isBuffer = isBuffer1;
function internalIsBuffer1(b) {
    return !!(b != null && b._isBuffer);
}
Buffer2.compare = function compare(a, b) {
    if (!internalIsBuffer1(a) || !internalIsBuffer1(b)) {
        throw new TypeError("Arguments must be Buffers");
    }
    if (a === b) return 0;
    var x = a.length;
    var y = b.length;
    for(var i4 = 0, len = Math.min(x, y); i4 < len; ++i4){
        if (a[i4] !== b[i4]) {
            x = a[i4];
            y = b[i4];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
Buffer2.isEncoding = function isEncoding(encoding) {
    switch(String(encoding).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return true;
        default:
            return false;
    }
};
Buffer2.concat = function concat(list, length1) {
    if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
        return Buffer2.alloc(0);
    }
    var i4;
    if (length1 === void 0) {
        length1 = 0;
        for(i4 = 0; i4 < list.length; ++i4){
            length1 += list[i4].length;
        }
    }
    var buffer = Buffer2.allocUnsafe(length1);
    var pos = 0;
    for(i4 = 0; i4 < list.length; ++i4){
        var buf = list[i4];
        if (!internalIsBuffer1(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength1(string1, encoding) {
    if (internalIsBuffer1(string1)) {
        return string1.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string1) || string1 instanceof ArrayBuffer)) {
        return string1.byteLength;
    }
    if (typeof string1 !== "string") {
        string1 = "" + string1;
    }
    var len = string1.length;
    if (len === 0) return 0;
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "ascii":
            case "latin1":
            case "binary":
                return len;
            case "utf8":
            case "utf-8":
            case void 0:
                return utf8ToBytes1(string1).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return len * 2;
            case "hex":
                return len >>> 1;
            case "base64":
                return base64ToBytes1(string1).length;
            default:
                if (loweredCase) return utf8ToBytes1(string1).length;
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer2.byteLength = byteLength1;
function slowToString(encoding, start, end1) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
        start = 0;
    }
    if (start > this.length) {
        return "";
    }
    if (end1 === void 0 || end1 > this.length) {
        end1 = this.length;
    }
    if (end1 <= 0) {
        return "";
    }
    end1 >>>= 0;
    start >>>= 0;
    if (end1 <= start) {
        return "";
    }
    if (!encoding) encoding = "utf8";
    while(true){
        switch(encoding){
            case "hex":
                return hexSlice1(this, start, end1);
            case "utf8":
            case "utf-8":
                return utf8Slice1(this, start, end1);
            case "ascii":
                return asciiSlice1(this, start, end1);
            case "latin1":
            case "binary":
                return latin1Slice1(this, start, end1);
            case "base64":
                return base64Slice1(this, start, end1);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return utf16leSlice1(this, start, end1);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer2.prototype._isBuffer = true;
function swap(b, n1, m) {
    var i4 = b[n1];
    b[n1] = b[m];
    b[m] = i4;
}
Buffer2.prototype.swap16 = function swap16() {
    var len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for(var i4 = 0; i4 < len; i4 += 2){
        swap(this, i4, i4 + 1);
    }
    return this;
};
Buffer2.prototype.swap32 = function swap32() {
    var len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for(var i4 = 0; i4 < len; i4 += 4){
        swap(this, i4, i4 + 3);
        swap(this, i4 + 1, i4 + 2);
    }
    return this;
};
Buffer2.prototype.swap64 = function swap64() {
    var len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for(var i4 = 0; i4 < len; i4 += 8){
        swap(this, i4, i4 + 7);
        swap(this, i4 + 1, i4 + 6);
        swap(this, i4 + 2, i4 + 5);
        swap(this, i4 + 3, i4 + 4);
    }
    return this;
};
Buffer2.prototype.toString = function toString2() {
    var length1 = this.length | 0;
    if (length1 === 0) return "";
    if (arguments.length === 0) return utf8Slice1(this, 0, length1);
    return slowToString.apply(this, arguments);
};
Buffer2.prototype.equals = function equals(b) {
    if (!internalIsBuffer1(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return Buffer2.compare(this, b) === 0;
};
Buffer2.prototype.inspect = function inspect() {
    var str = "";
    var max = INSPECT_MAX_BYTES;
    if (this.length > 0) {
        str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
        if (this.length > max) str += " ... ";
    }
    return "<Buffer " + str + ">";
};
Buffer2.prototype.compare = function compare2(target, start, end1, thisStart, thisEnd) {
    if (!internalIsBuffer1(target)) {
        throw new TypeError("Argument must be a Buffer");
    }
    if (start === void 0) {
        start = 0;
    }
    if (end1 === void 0) {
        end1 = target ? target.length : 0;
    }
    if (thisStart === void 0) {
        thisStart = 0;
    }
    if (thisEnd === void 0) {
        thisEnd = this.length;
    }
    if (start < 0 || end1 > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end1) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end1) {
        return 1;
    }
    start >>>= 0;
    end1 >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    var x = thisEnd - thisStart;
    var y = end1 - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end1);
    for(var i4 = 0; i4 < len; ++i4){
        if (thisCopy[i4] !== targetCopy[i4]) {
            x = thisCopy[i4];
            y = targetCopy[i4];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0) return -1;
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
    }
    if (internalIsBuffer1(val)) {
        if (val.length === 0) {
            return -1;
        }
        return arrayIndexOf1(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
        val = val & 255;
        if (Buffer2.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
        }
        return arrayIndexOf1(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf1(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
                return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read2(buf, i21) {
        if (indexSize === 1) {
            return buf[i21];
        } else {
            return buf.readUInt16BE(i21 * indexSize);
        }
    }
    var i4;
    if (dir) {
        var foundIndex = -1;
        for(i4 = byteOffset; i4 < arrLength; i4++){
            if (read2(arr, i4) === read2(val, foundIndex === -1 ? 0 : i4 - foundIndex)) {
                if (foundIndex === -1) foundIndex = i4;
                if (i4 - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
                if (foundIndex !== -1) i4 -= i4 - foundIndex;
                foundIndex = -1;
            }
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i4 = byteOffset; i4 >= 0; i4--){
            var found = true;
            for(var j = 0; j < valLength; j++){
                if (read2(arr, i4 + j) !== read2(val, j)) {
                    found = false;
                    break;
                }
            }
            if (found) return i4;
        }
    }
    return -1;
}
Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string1, offset2, length1) {
    offset2 = Number(offset2) || 0;
    var remaining = buf.length - offset2;
    if (!length1) {
        length1 = remaining;
    } else {
        length1 = Number(length1);
        if (length1 > remaining) {
            length1 = remaining;
        }
    }
    var strLen = string1.length;
    if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
    if (length1 > strLen / 2) {
        length1 = strLen / 2;
    }
    for(var i4 = 0; i4 < length1; ++i4){
        var parsed = parseInt(string1.substr(i4 * 2, 2), 16);
        if (isNaN(parsed)) return i4;
        buf[offset2 + i4] = parsed;
    }
    return i4;
}
function utf8Write(buf, string1, offset2, length1) {
    return blitBuffer1(utf8ToBytes1(string1, buf.length - offset2), buf, offset2, length1);
}
function asciiWrite(buf, string1, offset2, length1) {
    return blitBuffer1(asciiToBytes1(string1), buf, offset2, length1);
}
function latin1Write(buf, string1, offset2, length1) {
    return asciiWrite(buf, string1, offset2, length1);
}
function base64Write(buf, string1, offset2, length1) {
    return blitBuffer1(base64ToBytes1(string1), buf, offset2, length1);
}
function ucs2Write(buf, string1, offset2, length1) {
    return blitBuffer1(utf16leToBytes1(string1, buf.length - offset2), buf, offset2, length1);
}
Buffer2.prototype.write = function write2(string1, offset2, length1, encoding) {
    if (offset2 === void 0) {
        encoding = "utf8";
        length1 = this.length;
        offset2 = 0;
    } else if (length1 === void 0 && typeof offset2 === "string") {
        encoding = offset2;
        length1 = this.length;
        offset2 = 0;
    } else if (isFinite(offset2)) {
        offset2 = offset2 | 0;
        if (isFinite(length1)) {
            length1 = length1 | 0;
            if (encoding === void 0) encoding = "utf8";
        } else {
            encoding = length1;
            length1 = void 0;
        }
    } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    }
    var remaining = this.length - offset2;
    if (length1 === void 0 || length1 > remaining) length1 = remaining;
    if (string1.length > 0 && (length1 < 0 || offset2 < 0) || offset2 > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding) encoding = "utf8";
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "hex":
                return hexWrite(this, string1, offset2, length1);
            case "utf8":
            case "utf-8":
                return utf8Write(this, string1, offset2, length1);
            case "ascii":
                return asciiWrite(this, string1, offset2, length1);
            case "latin1":
            case "binary":
                return latin1Write(this, string1, offset2, length1);
            case "base64":
                return base64Write(this, string1, offset2, length1);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return ucs2Write(this, string1, offset2, length1);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
};
Buffer2.prototype.toJSON = function toJSON() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice1(buf, start, end1) {
    if (start === 0 && end1 === buf.length) {
        return fromByteArray(buf);
    } else {
        return fromByteArray(buf.slice(start, end1));
    }
}
function utf8Slice1(buf, start, end1) {
    end1 = Math.min(buf.length, end1);
    var res = [];
    var i4 = start;
    while(i4 < end1){
        var firstByte = buf[i4];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i4 + bytesPerSequence <= end1) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i4 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i4 + 1];
                    thirdByte = buf[i4 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i4 + 1];
                    thirdByte = buf[i4 + 2];
                    fourthByte = buf[i4 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i4 += bytesPerSequence;
    }
    return decodeCodePointsArray1(res);
}
var MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray1(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i4 = 0;
    while(i4 < len){
        res += String.fromCharCode.apply(String, codePoints.slice(i4, i4 += MAX_ARGUMENTS_LENGTH));
    }
    return res;
}
function asciiSlice1(buf, start, end1) {
    var ret = "";
    end1 = Math.min(buf.length, end1);
    for(var i4 = start; i4 < end1; ++i4){
        ret += String.fromCharCode(buf[i4] & 127);
    }
    return ret;
}
function latin1Slice1(buf, start, end1) {
    var ret = "";
    end1 = Math.min(buf.length, end1);
    for(var i4 = start; i4 < end1; ++i4){
        ret += String.fromCharCode(buf[i4]);
    }
    return ret;
}
function hexSlice1(buf, start, end1) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end1 || end1 < 0 || end1 > len) end1 = len;
    var out = "";
    for(var i4 = start; i4 < end1; ++i4){
        out += toHex1(buf[i4]);
    }
    return out;
}
function utf16leSlice1(buf, start, end1) {
    var bytes = buf.slice(start, end1);
    var res = "";
    for(var i4 = 0; i4 < bytes.length; i4 += 2){
        res += String.fromCharCode(bytes[i4] + bytes[i4 + 1] * 256);
    }
    return res;
}
Buffer2.prototype.slice = function slice(start, end1) {
    var len = this.length;
    start = ~~start;
    end1 = end1 === void 0 ? len : ~~end1;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) {
        start = len;
    }
    if (end1 < 0) {
        end1 += len;
        if (end1 < 0) end1 = 0;
    } else if (end1 > len) {
        end1 = len;
    }
    if (end1 < start) end1 = start;
    var newBuf;
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end1);
        newBuf.__proto__ = Buffer2.prototype;
    } else {
        var sliceLen = end1 - start;
        newBuf = new Buffer2(sliceLen, void 0);
        for(var i4 = 0; i4 < sliceLen; ++i4){
            newBuf[i4] = this[i4 + start];
        }
    }
    return newBuf;
};
function checkOffset(offset2, ext, length1) {
    if (offset2 % 1 !== 0 || offset2 < 0) throw new RangeError("offset is not uint");
    if (offset2 + ext > length1) throw new RangeError("Trying to access beyond buffer length");
}
Buffer2.prototype.readUIntLE = function readUIntLE(offset2, byteLength2, noAssert) {
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) checkOffset(offset2, byteLength2, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i5 = 0;
    while((++i5) < byteLength2 && (mul1 *= 256)){
        val += this[offset2 + i5] * mul1;
    }
    return val;
};
Buffer2.prototype.readUIntBE = function readUIntBE(offset2, byteLength2, noAssert) {
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) {
        checkOffset(offset2, byteLength2, this.length);
    }
    var val = this[offset2 + --byteLength2];
    var mul1 = 1;
    while(byteLength2 > 0 && (mul1 *= 256)){
        val += this[offset2 + --byteLength2] * mul1;
    }
    return val;
};
Buffer2.prototype.readUInt8 = function readUInt8(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 1, this.length);
    return this[offset2];
};
Buffer2.prototype.readUInt16LE = function readUInt16LE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 2, this.length);
    return this[offset2] | this[offset2 + 1] << 8;
};
Buffer2.prototype.readUInt16BE = function readUInt16BE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 2, this.length);
    return this[offset2] << 8 | this[offset2 + 1];
};
Buffer2.prototype.readUInt32LE = function readUInt32LE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return (this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16) + this[offset2 + 3] * 16777216;
};
Buffer2.prototype.readUInt32BE = function readUInt32BE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return this[offset2] * 16777216 + (this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3]);
};
Buffer2.prototype.readIntLE = function readIntLE(offset2, byteLength2, noAssert) {
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) checkOffset(offset2, byteLength2, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i5 = 0;
    while((++i5) < byteLength2 && (mul1 *= 256)){
        val += this[offset2 + i5] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength2);
    return val;
};
Buffer2.prototype.readIntBE = function readIntBE(offset2, byteLength2, noAssert) {
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) checkOffset(offset2, byteLength2, this.length);
    var i5 = byteLength2;
    var mul1 = 1;
    var val = this[offset2 + --i5];
    while(i5 > 0 && (mul1 *= 256)){
        val += this[offset2 + --i5] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength2);
    return val;
};
Buffer2.prototype.readInt8 = function readInt8(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 1, this.length);
    if (!(this[offset2] & 128)) return this[offset2];
    return (255 - this[offset2] + 1) * -1;
};
Buffer2.prototype.readInt16LE = function readInt16LE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 2, this.length);
    var val = this[offset2] | this[offset2 + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer2.prototype.readInt16BE = function readInt16BE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 2, this.length);
    var val = this[offset2 + 1] | this[offset2] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer2.prototype.readInt32LE = function readInt32LE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16 | this[offset2 + 3] << 24;
};
Buffer2.prototype.readInt32BE = function readInt32BE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return this[offset2] << 24 | this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3];
};
Buffer2.prototype.readFloatLE = function readFloatLE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return read(this, offset2, true, 23, 4);
};
Buffer2.prototype.readFloatBE = function readFloatBE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 4, this.length);
    return read(this, offset2, false, 23, 4);
};
Buffer2.prototype.readDoubleLE = function readDoubleLE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 8, this.length);
    return read(this, offset2, true, 52, 8);
};
Buffer2.prototype.readDoubleBE = function readDoubleBE(offset2, noAssert) {
    if (!noAssert) checkOffset(offset2, 8, this.length);
    return read(this, offset2, false, 52, 8);
};
function checkInt(buf, value, offset2, ext, max, min) {
    if (!internalIsBuffer1(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
}
Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset2, byteLength2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset2, byteLength2, maxBytes, 0);
    }
    var mul1 = 1;
    var i5 = 0;
    this[offset2] = value & 255;
    while((++i5) < byteLength2 && (mul1 *= 256)){
        this[offset2 + i5] = value / mul1 & 255;
    }
    return offset2 + byteLength2;
};
Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset2, byteLength2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength2 = byteLength2 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset2, byteLength2, maxBytes, 0);
    }
    var i5 = byteLength2 - 1;
    var mul1 = 1;
    this[offset2 + i5] = value & 255;
    while((--i5) >= 0 && (mul1 *= 256)){
        this[offset2 + i5] = value / mul1 & 255;
    }
    return offset2 + byteLength2;
};
Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 1, 255, 0);
    if (!Buffer2.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset2] = value & 255;
    return offset2 + 1;
};
function objectWriteUInt16(buf, value, offset2, littleEndian) {
    if (value < 0) value = 65535 + value + 1;
    for(var i5 = 0, j = Math.min(buf.length - offset2, 2); i5 < j; ++i5){
        buf[offset2 + i5] = (value & 255 << 8 * (littleEndian ? i5 : 1 - i5)) >>> (littleEndian ? i5 : 1 - i5) * 8;
    }
}
Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 2, 65535, 0);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt16(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 2, 65535, 0);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt16(this, value, offset2, false);
    }
    return offset2 + 2;
};
function objectWriteUInt32(buf, value, offset2, littleEndian) {
    if (value < 0) value = 4294967295 + value + 1;
    for(var i5 = 0, j = Math.min(buf.length - offset2, 4); i5 < j; ++i5){
        buf[offset2 + i5] = value >>> (littleEndian ? i5 : 3 - i5) * 8 & 255;
    }
}
Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 4, 4294967295, 0);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2 + 3] = value >>> 24;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 1] = value >>> 8;
        this[offset2] = value & 255;
    } else {
        objectWriteUInt32(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 4, 4294967295, 0);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt32(this, value, offset2, false);
    }
    return offset2 + 4;
};
Buffer2.prototype.writeIntLE = function writeIntLE(value, offset2, byteLength2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset2, byteLength2, limit - 1, -limit);
    }
    var i5 = 0;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2] = value & 255;
    while((++i5) < byteLength2 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i5 - 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i5] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength2;
};
Buffer2.prototype.writeIntBE = function writeIntBE(value, offset2, byteLength2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset2, byteLength2, limit - 1, -limit);
    }
    var i5 = byteLength2 - 1;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2 + i5] = value & 255;
    while((--i5) >= 0 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i5 + 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i5] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength2;
};
Buffer2.prototype.writeInt8 = function writeInt8(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 1, 127, -128);
    if (!Buffer2.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 255 + value + 1;
    this[offset2] = value & 255;
    return offset2 + 1;
};
Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 2, 32767, -32768);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt16(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 2, 32767, -32768);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt16(this, value, offset2, false);
    }
    return offset2 + 2;
};
Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 4, 2147483647, -2147483648);
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 3] = value >>> 24;
    } else {
        objectWriteUInt32(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt(this, value, offset2, 4, 2147483647, -2147483648);
    if (value < 0) value = 4294967295 + value + 1;
    if (Buffer2.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt32(this, value, offset2, false);
    }
    return offset2 + 4;
};
function checkIEEE754(buf, value, offset2, ext, max, min) {
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
    if (offset2 < 0) throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE754(buf, value, offset2, 4);
    }
    write(buf, value, offset2, littleEndian, 23, 4);
    return offset2 + 4;
}
Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset2, noAssert) {
    return writeFloat(this, value, offset2, true, noAssert);
};
Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset2, noAssert) {
    return writeFloat(this, value, offset2, false, noAssert);
};
function writeDouble(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE754(buf, value, offset2, 8);
    }
    write(buf, value, offset2, littleEndian, 52, 8);
    return offset2 + 8;
}
Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset2, noAssert) {
    return writeDouble(this, value, offset2, true, noAssert);
};
Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset2, noAssert) {
    return writeDouble(this, value, offset2, false, noAssert);
};
Buffer2.prototype.copy = function copy1(target, targetStart, start, end1) {
    if (!start) start = 0;
    if (!end1 && end1 !== 0) end1 = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end1 > 0 && end1 < start) end1 = start;
    if (end1 === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
    if (end1 < 0) throw new RangeError("sourceEnd out of bounds");
    if (end1 > this.length) end1 = this.length;
    if (target.length - targetStart < end1 - start) {
        end1 = target.length - targetStart + start;
    }
    var len = end1 - start;
    var i5;
    if (this === target && start < targetStart && targetStart < end1) {
        for(i5 = len - 1; i5 >= 0; --i5){
            target[i5 + targetStart] = this[i5 + start];
        }
    } else if (len < 1000 || !Buffer2.TYPED_ARRAY_SUPPORT) {
        for(i5 = 0; i5 < len; ++i5){
            target[i5 + targetStart] = this[i5 + start];
        }
    } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }
    return len;
};
Buffer2.prototype.fill = function fill(val, start, end1, encoding) {
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end1 = this.length;
        } else if (typeof end1 === "string") {
            encoding = end1;
            end1 = this.length;
        }
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
                val = code;
            }
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
        }
    } else if (typeof val === "number") {
        val = val & 255;
    }
    if (start < 0 || this.length < start || this.length < end1) {
        throw new RangeError("Out of range index");
    }
    if (end1 <= start) {
        return this;
    }
    start = start >>> 0;
    end1 = end1 === void 0 ? this.length : end1 >>> 0;
    if (!val) val = 0;
    var i5;
    if (typeof val === "number") {
        for(i5 = start; i5 < end1; ++i5){
            this[i5] = val;
        }
    } else {
        var bytes = internalIsBuffer1(val) ? val : utf8ToBytes1(new Buffer2(val, encoding).toString());
        var len = bytes.length;
        for(i5 = 0; i5 < end1 - start; ++i5){
            this[i5 + start] = bytes[i5 % len];
        }
    }
    return this;
};
var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
function base64clean(str) {
    str = stringtrim1(str).replace(INVALID_BASE64_RE, "");
    if (str.length < 2) return "";
    while(str.length % 4 !== 0){
        str = str + "=";
    }
    return str;
}
function stringtrim1(str) {
    if (str.trim) return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
}
function toHex1(n1) {
    if (n1 < 16) return "0" + n1.toString(16);
    return n1.toString(16);
}
function utf8ToBytes1(string1, units) {
    units = units || Infinity;
    var codePoint;
    var length1 = string1.length;
    var leadSurrogate = null;
    var bytes = [];
    for(var i5 = 0; i5 < length1; ++i5){
        codePoint = string1.charCodeAt(i5);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                } else if (i5 + 1 === length1) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function asciiToBytes1(str) {
    var byteArray = [];
    for(var i5 = 0; i5 < str.length; ++i5){
        byteArray.push(str.charCodeAt(i5) & 255);
    }
    return byteArray;
}
function utf16leToBytes1(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for(var i5 = 0; i5 < str.length; ++i5){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i5);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes1(str) {
    return toByteArray(base64clean(str));
}
function blitBuffer1(src, dst, offset2, length1) {
    for(var i5 = 0; i5 < length1; ++i5){
        if (i5 + offset2 >= dst.length || i5 >= src.length) break;
        dst[i5 + offset2] = src[i5];
    }
    return i5;
}
function isnan1(val) {
    return val !== val;
}
function isBuffer1(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer1(obj) || isSlowBuffer1(obj));
}
function isFastBuffer1(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer1(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer1(obj.slice(0, 0));
}
var bufferEs6 = Object.freeze({
    __proto__: null,
    Buffer: Buffer2,
    INSPECT_MAX_BYTES,
    SlowBuffer,
    isBuffer: isBuffer1,
    kMaxLength: _kMaxLength
});
function createCommonjsModule1(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path4, base) {
            return commonjsRequire2(path4, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire2() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var safeBuffer = createCommonjsModule1(function(module, exports) {
    var Buffer2 = bufferEs6.Buffer;
    function copyProps(src, dst) {
        for(var key in src){
            dst[key] = src[key];
        }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
        module.exports = bufferEs6;
    } else {
        copyProps(bufferEs6, exports);
        exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length1) {
        return Buffer2(arg, encodingOrOffset, length1);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length1) {
        if (typeof arg === "number") {
            throw new TypeError("Argument must not be a number");
        }
        return Buffer2(arg, encodingOrOffset, length1);
    };
    SafeBuffer.alloc = function(size, fill2, encoding) {
        if (typeof size !== "number") {
            throw new TypeError("Argument must be a number");
        }
        var buf = Buffer2(size);
        if (fill2 !== void 0) {
            if (typeof encoding === "string") {
                buf.fill(fill2, encoding);
            } else {
                buf.fill(fill2);
            }
        } else {
            buf.fill(0);
        }
        return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
            throw new TypeError("Argument must be a number");
        }
        return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
            throw new TypeError("Argument must be a number");
        }
        return bufferEs6.SlowBuffer(size);
    };
});
var Buffer1 = safeBuffer.Buffer;
var isEncoding1 = Buffer1.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch(encoding && encoding.toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
            return true;
        default:
            return false;
    }
};
function _normalizeEncoding(enc) {
    if (!enc) return "utf8";
    var retried;
    while(true){
        switch(enc){
            case "utf8":
            case "utf-8":
                return "utf8";
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return "utf16le";
            case "latin1":
            case "binary":
                return "latin1";
            case "base64":
            case "ascii":
            case "hex":
                return enc;
            default:
                if (retried) return;
                enc = ("" + enc).toLowerCase();
                retried = true;
        }
    }
}
function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer1.isEncoding === isEncoding1 || !isEncoding1(enc))) throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
}
var StringDecoder_1 = StringDecoder;
function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch(this.encoding){
        case "utf16le":
            this.text = utf16Text;
            this.end = utf16End;
            nb = 4;
            break;
        case "utf8":
            this.fillLast = utf8FillLast;
            nb = 4;
            break;
        case "base64":
            this.text = base64Text;
            this.end = base64End;
            nb = 3;
            break;
        default:
            this.write = simpleWrite;
            this.end = simpleEnd;
            return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer1.allocUnsafe(nb);
}
StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0) return "";
    var r;
    var i5;
    if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i5 = this.lastNeed;
        this.lastNeed = 0;
    } else {
        i5 = 0;
    }
    if (i5 < buf.length) return r ? r + this.text(buf, i5) : this.text(buf, i5);
    return r || "";
};
StringDecoder.prototype.end = utf8End;
StringDecoder.prototype.text = utf8Text;
StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
};
function utf8CheckByte(__byte) {
    if (__byte <= 127) return 0;
    else if (__byte >> 5 === 6) return 2;
    else if (__byte >> 4 === 14) return 3;
    else if (__byte >> 3 === 30) return 4;
    return __byte >> 6 === 2 ? -1 : -2;
}
function utf8CheckIncomplete(self, buf, i5) {
    var j = buf.length - 1;
    if (j < i5) return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0) self.lastNeed = nb - 1;
        return nb;
    }
    if ((--j) < i5 || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0) self.lastNeed = nb - 2;
        return nb;
    }
    if ((--j) < i5 || nb === -2) return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
        if (nb > 0) {
            if (nb === 2) nb = 0;
            else self.lastNeed = nb - 3;
        }
        return nb;
    }
    return 0;
}
function utf8CheckExtraBytes(self, buf, p) {
    if ((buf[0] & 192) !== 128) {
        self.lastNeed = 0;
        return "\uFFFD";
    }
    if (self.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
            self.lastNeed = 1;
            return "\uFFFD";
        }
        if (self.lastNeed > 2 && buf.length > 2) {
            if ((buf[2] & 192) !== 128) {
                self.lastNeed = 2;
                return "\uFFFD";
            }
        }
    }
}
function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0) return r;
    if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
}
function utf8Text(buf, i5) {
    var total = utf8CheckIncomplete(this, buf, i5);
    if (!this.lastNeed) return buf.toString("utf8", i5);
    this.lastTotal = total;
    var end1 = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end1);
    return buf.toString("utf8", i5, end1);
}
function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + "\uFFFD";
    return r;
}
function utf16Text(buf, i5) {
    if ((buf.length - i5) % 2 === 0) {
        var r = buf.toString("utf16le", i5);
        if (r) {
            var c = r.charCodeAt(r.length - 1);
            if (c >= 55296 && c <= 56319) {
                this.lastNeed = 2;
                this.lastTotal = 4;
                this.lastChar[0] = buf[buf.length - 2];
                this.lastChar[1] = buf[buf.length - 1];
                return r.slice(0, -1);
            }
        }
        return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i5, buf.length - 1);
}
function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
        var end1 = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end1);
    }
    return r;
}
function base64Text(buf, i5) {
    var n1 = (buf.length - i5) % 3;
    if (n1 === 0) return buf.toString("base64", i5);
    this.lastNeed = 3 - n1;
    this.lastTotal = 3;
    if (n1 === 1) {
        this.lastChar[0] = buf[buf.length - 1];
    } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i5, buf.length - n1);
}
function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
}
function simpleWrite(buf) {
    return buf.toString(this.encoding);
}
function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
}
var string_decoder = {
    StringDecoder: StringDecoder_1
};
var commonjsGlobal1 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {
};
function createCommonjsModule2(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path4, base) {
            return commonjsRequire3(path4, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function getDefaultExportFromNamespaceIfNotNamed(n1) {
    return n1 && Object.prototype.hasOwnProperty.call(n1, "default") && Object.keys(n1).length === 1 ? n1["default"] : n1;
}
function commonjsRequire3() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
    globalContext = window;
} else if (typeof self !== "undefined") {
    globalContext = self;
} else {
    globalContext = {
    };
}
if (typeof globalContext.setTimeout === "function") {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
    cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker1) {
    if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker1);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker1);
    }
    try {
        return cachedClearTimeout(marker1);
    } catch (e) {
        try {
            return cachedClearTimeout.call(null, marker1);
        } catch (e2) {
            return cachedClearTimeout.call(this, marker1);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue1();
    }
}
function drainQueue1() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while(len){
        currentQueue = queue;
        queue = [];
        while((++queueIndex) < len){
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for(var i5 = 1; i5 < arguments.length; i5++){
            args[i5 - 1] = arguments[i5];
        }
    }
    queue.push(new Item1(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue1);
    }
}
function Item1(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item1.prototype.run = function() {
    this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser1 = true;
var argv = [];
var version = "";
var versions = {
};
var release = {
};
var config1 = {
};
function noop() {
}
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name4) {
    throw new Error("process.binding is not supported");
}
function cwd() {
    return "/";
}
function chdir(dir) {
    throw new Error("process.chdir is not supported");
}
function umask() {
    return 0;
}
var performance1 = globalContext.performance || {
};
var performanceNow = performance1.now || performance1.mozNow || performance1.msNow || performance1.oNow || performance1.webkitNow || function() {
    return new Date().getTime();
};
function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance1) * 0.001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1000000000);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1000000000;
        }
    }
    return [
        seconds,
        nanoseconds
    ];
}
var startTime = new Date();
function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
}
var process = {
    nextTick,
    title,
    browser: browser1,
    env: {
        NODE_ENV: "production"
    },
    argv,
    version,
    versions,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    binding,
    cwd,
    chdir,
    umask,
    hrtime,
    platform,
    release,
    config: config1,
    uptime
};
var domain;
function EventHandlers() {
}
EventHandlers.prototype = Object.create(null);
function EventEmitter() {
    EventEmitter.init.call(this);
}
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.usingDomains = false;
EventEmitter.prototype.domain = void 0;
EventEmitter.prototype._events = void 0;
EventEmitter.prototype._maxListeners = void 0;
EventEmitter.defaultMaxListeners = 10;
EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
        if (domain.active) ;
    }
    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
    }
    this._maxListeners = this._maxListeners || void 0;
};
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n1) {
    if (typeof n1 !== "number" || n1 < 0 || isNaN(n1)) throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n1;
    return this;
};
function $getMaxListeners(that) {
    if (that._maxListeners === void 0) return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
}
EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
};
function emitNone(handler, isFn, self2) {
    if (isFn) handler.call(self2);
    else {
        var len = handler.length;
        var listeners2 = arrayClone(handler, len);
        for(var i6 = 0; i6 < len; ++i6)listeners2[i6].call(self2);
    }
}
function emitOne(handler, isFn, self2, arg1) {
    if (isFn) handler.call(self2, arg1);
    else {
        var len = handler.length;
        var listeners2 = arrayClone(handler, len);
        for(var i7 = 0; i7 < len; ++i7)listeners2[i7].call(self2, arg1);
    }
}
function emitTwo(handler, isFn, self2, arg1, arg2) {
    if (isFn) handler.call(self2, arg1, arg2);
    else {
        var len = handler.length;
        var listeners2 = arrayClone(handler, len);
        for(var i8 = 0; i8 < len; ++i8)listeners2[i8].call(self2, arg1, arg2);
    }
}
function emitThree(handler, isFn, self2, arg1, arg2, arg3) {
    if (isFn) handler.call(self2, arg1, arg2, arg3);
    else {
        var len = handler.length;
        var listeners2 = arrayClone(handler, len);
        for(var i9 = 0; i9 < len; ++i9)listeners2[i9].call(self2, arg1, arg2, arg3);
    }
}
function emitMany(handler, isFn, self2, args) {
    if (isFn) handler.apply(self2, args);
    else {
        var len = handler.length;
        var listeners2 = arrayClone(handler, len);
        for(var i10 = 0; i10 < len; ++i10)listeners2[i10].apply(self2, args);
    }
}
EventEmitter.prototype.emit = function emit2(type2) {
    var er, handler, len, args, i11, events2, domain2;
    var doError = type2 === "error";
    events2 = this._events;
    if (events2) doError = doError && events2.error == null;
    else if (!doError) return false;
    domain2 = this.domain;
    if (doError) {
        er = arguments[1];
        if (domain2) {
            if (!er) er = new Error('Uncaught, unspecified "error" event');
            er.domainEmitter = this;
            er.domain = domain2;
            er.domainThrown = false;
            domain2.emit("error", er);
        } else if (er instanceof Error) {
            throw er;
        } else {
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
            err.context = er;
            throw err;
        }
        return false;
    }
    handler = events2[type2];
    if (!handler) return false;
    var isFn = typeof handler === "function";
    len = arguments.length;
    switch(len){
        case 1:
            emitNone(handler, isFn, this);
            break;
        case 2:
            emitOne(handler, isFn, this, arguments[1]);
            break;
        case 3:
            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
            break;
        case 4:
            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
            break;
        default:
            args = new Array(len - 1);
            for(i11 = 1; i11 < len; i11++)args[i11 - 1] = arguments[i11];
            emitMany(handler, isFn, this, args);
    }
    return true;
};
function _addListener(target, type2, listener, prepend) {
    var m;
    var events2;
    var existing;
    if (typeof listener !== "function") throw new TypeError('"listener" argument must be a function');
    events2 = target._events;
    if (!events2) {
        events2 = target._events = new EventHandlers();
        target._eventsCount = 0;
    } else {
        if (events2.newListener) {
            target.emit("newListener", type2, listener.listener ? listener.listener : listener);
            events2 = target._events;
        }
        existing = events2[type2];
    }
    if (!existing) {
        existing = events2[type2] = listener;
        ++target._eventsCount;
    } else {
        if (typeof existing === "function") {
            existing = events2[type2] = prepend ? [
                listener,
                existing
            ] : [
                existing,
                listener
            ];
        } else {
            if (prepend) {
                existing.unshift(listener);
            } else {
                existing.push(listener);
            }
        }
        if (!existing.warned) {
            m = $getMaxListeners(target);
            if (m && m > 0 && existing.length > m) {
                existing.warned = true;
                var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + type2 + " listeners added. Use emitter.setMaxListeners() to increase limit");
                w.name = "MaxListenersExceededWarning";
                w.emitter = target;
                w.type = type2;
                w.count = existing.length;
                emitWarning(w);
            }
        }
    }
    return target;
}
function emitWarning(e) {
    typeof console.warn === "function" ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener2(type2, listener) {
    return _addListener(this, type2, listener, false);
};
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.prependListener = function prependListener(type2, listener) {
    return _addListener(this, type2, listener, true);
};
function _onceWrap(target, type2, listener) {
    var fired = false;
    function g() {
        target.removeListener(type2, g);
        if (!fired) {
            fired = true;
            listener.apply(target, arguments);
        }
    }
    g.listener = listener;
    return g;
}
EventEmitter.prototype.once = function once2(type2, listener) {
    if (typeof listener !== "function") throw new TypeError('"listener" argument must be a function');
    this.on(type2, _onceWrap(this, type2, listener));
    return this;
};
EventEmitter.prototype.prependOnceListener = function prependOnceListener(type2, listener) {
    if (typeof listener !== "function") throw new TypeError('"listener" argument must be a function');
    this.prependListener(type2, _onceWrap(this, type2, listener));
    return this;
};
EventEmitter.prototype.removeListener = function removeListener2(type2, listener) {
    var list, events2, position, i11, originalListener;
    if (typeof listener !== "function") throw new TypeError('"listener" argument must be a function');
    events2 = this._events;
    if (!events2) return this;
    list = events2[type2];
    if (!list) return this;
    if (list === listener || list.listener && list.listener === listener) {
        if ((--this._eventsCount) === 0) this._events = new EventHandlers();
        else {
            delete events2[type2];
            if (events2.removeListener) this.emit("removeListener", type2, list.listener || listener);
        }
    } else if (typeof list !== "function") {
        position = -1;
        for(i11 = list.length; (i11--) > 0;){
            if (list[i11] === listener || list[i11].listener && list[i11].listener === listener) {
                originalListener = list[i11].listener;
                position = i11;
                break;
            }
        }
        if (position < 0) return this;
        if (list.length === 1) {
            list[0] = void 0;
            if ((--this._eventsCount) === 0) {
                this._events = new EventHandlers();
                return this;
            } else {
                delete events2[type2];
            }
        } else {
            spliceOne(list, position);
        }
        if (events2.removeListener) this.emit("removeListener", type2, originalListener || listener);
    }
    return this;
};
EventEmitter.prototype.removeAllListeners = function removeAllListeners2(type2) {
    var listeners2, events2;
    events2 = this._events;
    if (!events2) return this;
    if (!events2.removeListener) {
        if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
        } else if (events2[type2]) {
            if ((--this._eventsCount) === 0) this._events = new EventHandlers();
            else delete events2[type2];
        }
        return this;
    }
    if (arguments.length === 0) {
        var keys = Object.keys(events2);
        for(var i11 = 0, key; i11 < keys.length; ++i11){
            key = keys[i11];
            if (key === "removeListener") continue;
            this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
    }
    listeners2 = events2[type2];
    if (typeof listeners2 === "function") {
        this.removeListener(type2, listeners2);
    } else if (listeners2) {
        do {
            this.removeListener(type2, listeners2[listeners2.length - 1]);
        }while (listeners2[0])
    }
    return this;
};
EventEmitter.prototype.listeners = function listeners(type2) {
    var evlistener;
    var ret;
    var events2 = this._events;
    if (!events2) ret = [];
    else {
        evlistener = events2[type2];
        if (!evlistener) ret = [];
        else if (typeof evlistener === "function") ret = [
            evlistener.listener || evlistener
        ];
        else ret = unwrapListeners(evlistener);
    }
    return ret;
};
EventEmitter.listenerCount = function(emitter, type2) {
    if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type2);
    } else {
        return listenerCount.call(emitter, type2);
    }
};
EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type2) {
    var events2 = this._events;
    if (events2) {
        var evlistener = events2[type2];
        if (typeof evlistener === "function") {
            return 1;
        } else if (evlistener) {
            return evlistener.length;
        }
    }
    return 0;
}
EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};
function spliceOne(list, index4) {
    for(var i12 = index4, k = i12 + 1, n1 = list.length; k < n1; i12 += 1, k += 1)list[i12] = list[k];
    list.pop();
}
function arrayClone(arr, i12) {
    var copy2 = new Array(i12);
    while(i12--)copy2[i12] = arr[i12];
    return copy2;
}
function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for(var i12 = 0; i12 < ret.length; ++i12){
        ret[i12] = arr[i12].listener || arr[i12];
    }
    return ret;
}
var events = Object.freeze({
    __proto__: null,
    default: EventEmitter,
    EventEmitter
});
var streamBrowser = events.EventEmitter;
var global$11 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {
};
var lookup1 = [];
var revLookup1 = [];
var Arr1 = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var inited1 = false;
function init2() {
    inited1 = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(var i12 = 0, len = code.length; i12 < len; ++i12){
        lookup1[i12] = code[i12];
        revLookup1[code.charCodeAt(i12)] = i12;
    }
    revLookup1["-".charCodeAt(0)] = 62;
    revLookup1["_".charCodeAt(0)] = 63;
}
function toByteArray1(b64) {
    if (!inited1) {
        init2();
    }
    var i12, j, l, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr1(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for(i12 = 0, j = 0; i12 < l; i12 += 4, j += 3){
        tmp = revLookup1[b64.charCodeAt(i12)] << 18 | revLookup1[b64.charCodeAt(i12 + 1)] << 12 | revLookup1[b64.charCodeAt(i12 + 2)] << 6 | revLookup1[b64.charCodeAt(i12 + 3)];
        arr[L++] = tmp >> 16 & 255;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
        tmp = revLookup1[b64.charCodeAt(i12)] << 2 | revLookup1[b64.charCodeAt(i12 + 1)] >> 4;
        arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
        tmp = revLookup1[b64.charCodeAt(i12)] << 10 | revLookup1[b64.charCodeAt(i12 + 1)] << 4 | revLookup1[b64.charCodeAt(i12 + 2)] >> 2;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    return arr;
}
function tripletToBase641(num) {
    return lookup1[num >> 18 & 63] + lookup1[num >> 12 & 63] + lookup1[num >> 6 & 63] + lookup1[num & 63];
}
function encodeChunk1(uint8, start, end2) {
    var tmp;
    var output = [];
    for(var i12 = start; i12 < end2; i12 += 3){
        tmp = (uint8[i12] << 16) + (uint8[i12 + 1] << 8) + uint8[i12 + 2];
        output.push(tripletToBase641(tmp));
    }
    return output.join("");
}
function fromByteArray1(uint8) {
    if (!inited1) {
        init2();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts1 = [];
    var maxChunkLength = 16383;
    for(var i12 = 0, len2 = len - extraBytes; i12 < len2; i12 += maxChunkLength){
        parts1.push(encodeChunk1(uint8, i12, i12 + maxChunkLength > len2 ? len2 : i12 + maxChunkLength));
    }
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup1[tmp >> 2];
        output += lookup1[tmp << 4 & 63];
        output += "==";
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        output += lookup1[tmp >> 10];
        output += lookup1[tmp >> 4 & 63];
        output += lookup1[tmp << 2 & 63];
        output += "=";
    }
    parts1.push(output);
    return parts1.join("");
}
function read1(buffer, offset2, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i12 = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset2 + i12];
    i12 += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset2 + i12], i12 += d, nBits -= 8){
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset2 + i12], i12 += d, nBits -= 8){
    }
    if (e === 0) {
        e = 1 - eBias;
    } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write1(buffer, value, offset2, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i12 = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset2 + i12] = m & 255, i12 += d, m /= 256, mLen -= 8){
    }
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset2 + i12] = e & 255, i12 += d, e /= 256, eLen -= 8){
    }
    buffer[offset2 + i12 - d] |= s * 128;
}
var toString1 = {
}.toString;
var isArray1 = Array.isArray || function(arr) {
    return toString1.call(arr) == "[object Array]";
};
var INSPECT_MAX_BYTES1 = 50;
Buffer3.TYPED_ARRAY_SUPPORT = global$11.TYPED_ARRAY_SUPPORT !== void 0 ? global$11.TYPED_ARRAY_SUPPORT : true;
var _kMaxLength1 = kMaxLength2();
function kMaxLength2() {
    return Buffer3.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function createBuffer1(that, length1) {
    if (kMaxLength2() < length1) {
        throw new RangeError("Invalid typed array length");
    }
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        that = new Uint8Array(length1);
        that.__proto__ = Buffer3.prototype;
    } else {
        if (that === null) {
            that = new Buffer3(length1);
        }
        that.length = length1;
    }
    return that;
}
function Buffer3(arg, encodingOrOffset, length1) {
    if (!Buffer3.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer3)) {
        return new Buffer3(arg, encodingOrOffset, length1);
    }
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
            throw new Error("If encoding is specified then the first argument must be a string");
        }
        return allocUnsafe2(this, arg);
    }
    return from2(this, arg, encodingOrOffset, length1);
}
Buffer3.poolSize = 8192;
Buffer3._augment = function(arr) {
    arr.__proto__ = Buffer3.prototype;
    return arr;
};
function from2(that, value, encodingOrOffset, length1) {
    if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
        return fromArrayBuffer2(that, value, encodingOrOffset, length1);
    }
    if (typeof value === "string") {
        return fromString2(that, value, encodingOrOffset);
    }
    return fromObject2(that, value);
}
Buffer3.from = function(value, encodingOrOffset, length1) {
    return from2(null, value, encodingOrOffset, length1);
};
if (Buffer3.TYPED_ARRAY_SUPPORT) {
    Buffer3.prototype.__proto__ = Uint8Array.prototype;
    Buffer3.__proto__ = Uint8Array;
}
function assertSize1(size) {
    if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }
}
function alloc1(that, size, fill2, encoding) {
    assertSize1(size);
    if (size <= 0) {
        return createBuffer1(that, size);
    }
    if (fill2 !== void 0) {
        return typeof encoding === "string" ? createBuffer1(that, size).fill(fill2, encoding) : createBuffer1(that, size).fill(fill2);
    }
    return createBuffer1(that, size);
}
Buffer3.alloc = function(size, fill2, encoding) {
    return alloc1(null, size, fill2, encoding);
};
function allocUnsafe2(that, size) {
    assertSize1(size);
    that = createBuffer1(that, size < 0 ? 0 : checked2(size) | 0);
    if (!Buffer3.TYPED_ARRAY_SUPPORT) {
        for(var i12 = 0; i12 < size; ++i12){
            that[i12] = 0;
        }
    }
    return that;
}
Buffer3.allocUnsafe = function(size) {
    return allocUnsafe2(null, size);
};
Buffer3.allocUnsafeSlow = function(size) {
    return allocUnsafe2(null, size);
};
function fromString2(that, string1, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
    }
    if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length1 = byteLength2(string1, encoding) | 0;
    that = createBuffer1(that, length1);
    var actual = that.write(string1, encoding);
    if (actual !== length1) {
        that = that.slice(0, actual);
    }
    return that;
}
function fromArrayLike1(that, array) {
    var length1 = array.length < 0 ? 0 : checked2(array.length) | 0;
    that = createBuffer1(that, length1);
    for(var i13 = 0; i13 < length1; i13 += 1){
        that[i13] = array[i13] & 255;
    }
    return that;
}
function fromArrayBuffer2(that, array, byteOffset, length1) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length1 || 0)) {
        throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length1 === void 0) {
        array = new Uint8Array(array);
    } else if (length1 === void 0) {
        array = new Uint8Array(array, byteOffset);
    } else {
        array = new Uint8Array(array, byteOffset, length1);
    }
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        that = array;
        that.__proto__ = Buffer3.prototype;
    } else {
        that = fromArrayLike1(that, array);
    }
    return that;
}
function fromObject2(that, obj) {
    if (internalIsBuffer2(obj)) {
        var len = checked2(obj.length) | 0;
        that = createBuffer1(that, len);
        if (that.length === 0) {
            return that;
        }
        obj.copy(that, 0, 0, len);
        return that;
    }
    if (obj) {
        if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if (typeof obj.length !== "number" || isnan2(obj.length)) {
                return createBuffer1(that, 0);
            }
            return fromArrayLike1(that, obj);
        }
        if (obj.type === "Buffer" && isArray1(obj.data)) {
            return fromArrayLike1(that, obj.data);
        }
    }
    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function checked2(length1) {
    if (length1 >= kMaxLength2()) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength2().toString(16) + " bytes");
    }
    return length1 | 0;
}
function SlowBuffer1(length1) {
    if (+length1 != length1) {
        length1 = 0;
    }
    return Buffer3.alloc(+length1);
}
Buffer3.isBuffer = isBuffer2;
function internalIsBuffer2(b) {
    return !!(b != null && b._isBuffer);
}
Buffer3.compare = function compare1(a, b) {
    if (!internalIsBuffer2(a) || !internalIsBuffer2(b)) {
        throw new TypeError("Arguments must be Buffers");
    }
    if (a === b) return 0;
    var x = a.length;
    var y = b.length;
    for(var i13 = 0, len = Math.min(x, y); i13 < len; ++i13){
        if (a[i13] !== b[i13]) {
            x = a[i13];
            y = b[i13];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
Buffer3.isEncoding = function isEncoding2(encoding) {
    switch(String(encoding).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return true;
        default:
            return false;
    }
};
Buffer3.concat = function concat1(list, length1) {
    if (!isArray1(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
        return Buffer3.alloc(0);
    }
    var i13;
    if (length1 === void 0) {
        length1 = 0;
        for(i13 = 0; i13 < list.length; ++i13){
            length1 += list[i13].length;
        }
    }
    var buffer = Buffer3.allocUnsafe(length1);
    var pos = 0;
    for(i13 = 0; i13 < list.length; ++i13){
        var buf = list[i13];
        if (!internalIsBuffer2(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength2(string1, encoding) {
    if (internalIsBuffer2(string1)) {
        return string1.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string1) || string1 instanceof ArrayBuffer)) {
        return string1.byteLength;
    }
    if (typeof string1 !== "string") {
        string1 = "" + string1;
    }
    var len = string1.length;
    if (len === 0) return 0;
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "ascii":
            case "latin1":
            case "binary":
                return len;
            case "utf8":
            case "utf-8":
            case void 0:
                return utf8ToBytes2(string1).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return len * 2;
            case "hex":
                return len >>> 1;
            case "base64":
                return base64ToBytes2(string1).length;
            default:
                if (loweredCase) return utf8ToBytes2(string1).length;
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer3.byteLength = byteLength2;
function slowToString1(encoding, start, end2) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
        start = 0;
    }
    if (start > this.length) {
        return "";
    }
    if (end2 === void 0 || end2 > this.length) {
        end2 = this.length;
    }
    if (end2 <= 0) {
        return "";
    }
    end2 >>>= 0;
    start >>>= 0;
    if (end2 <= start) {
        return "";
    }
    if (!encoding) encoding = "utf8";
    while(true){
        switch(encoding){
            case "hex":
                return hexSlice2(this, start, end2);
            case "utf8":
            case "utf-8":
                return utf8Slice2(this, start, end2);
            case "ascii":
                return asciiSlice2(this, start, end2);
            case "latin1":
            case "binary":
                return latin1Slice2(this, start, end2);
            case "base64":
                return base64Slice2(this, start, end2);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return utf16leSlice2(this, start, end2);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer3.prototype._isBuffer = true;
function swap1(b, n1, m) {
    var i13 = b[n1];
    b[n1] = b[m];
    b[m] = i13;
}
Buffer3.prototype.swap16 = function swap161() {
    var len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for(var i13 = 0; i13 < len; i13 += 2){
        swap1(this, i13, i13 + 1);
    }
    return this;
};
Buffer3.prototype.swap32 = function swap321() {
    var len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for(var i13 = 0; i13 < len; i13 += 4){
        swap1(this, i13, i13 + 3);
        swap1(this, i13 + 1, i13 + 2);
    }
    return this;
};
Buffer3.prototype.swap64 = function swap641() {
    var len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for(var i13 = 0; i13 < len; i13 += 8){
        swap1(this, i13, i13 + 7);
        swap1(this, i13 + 1, i13 + 6);
        swap1(this, i13 + 2, i13 + 5);
        swap1(this, i13 + 3, i13 + 4);
    }
    return this;
};
Buffer3.prototype.toString = function toString21() {
    var length1 = this.length | 0;
    if (length1 === 0) return "";
    if (arguments.length === 0) return utf8Slice2(this, 0, length1);
    return slowToString1.apply(this, arguments);
};
Buffer3.prototype.equals = function equals1(b) {
    if (!internalIsBuffer2(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return Buffer3.compare(this, b) === 0;
};
Buffer3.prototype.inspect = function inspect1() {
    var str = "";
    var max = INSPECT_MAX_BYTES1;
    if (this.length > 0) {
        str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
        if (this.length > max) str += " ... ";
    }
    return "<Buffer " + str + ">";
};
Buffer3.prototype.compare = function compare21(target, start, end2, thisStart, thisEnd) {
    if (!internalIsBuffer2(target)) {
        throw new TypeError("Argument must be a Buffer");
    }
    if (start === void 0) {
        start = 0;
    }
    if (end2 === void 0) {
        end2 = target ? target.length : 0;
    }
    if (thisStart === void 0) {
        thisStart = 0;
    }
    if (thisEnd === void 0) {
        thisEnd = this.length;
    }
    if (start < 0 || end2 > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end2) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end2) {
        return 1;
    }
    start >>>= 0;
    end2 >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    var x = thisEnd - thisStart;
    var y = end2 - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end2);
    for(var i13 = 0; i13 < len; ++i13){
        if (thisCopy[i13] !== targetCopy[i13]) {
            x = thisCopy[i13];
            y = targetCopy[i13];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
function bidirectionalIndexOf1(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0) return -1;
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
    }
    if (internalIsBuffer2(val)) {
        if (val.length === 0) {
            return -1;
        }
        return arrayIndexOf2(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
        val = val & 255;
        if (Buffer3.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
        }
        return arrayIndexOf2(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf2(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
                return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read2(buf, i21) {
        if (indexSize === 1) {
            return buf[i21];
        } else {
            return buf.readUInt16BE(i21 * indexSize);
        }
    }
    var i13;
    if (dir) {
        var foundIndex = -1;
        for(i13 = byteOffset; i13 < arrLength; i13++){
            if (read2(arr, i13) === read2(val, foundIndex === -1 ? 0 : i13 - foundIndex)) {
                if (foundIndex === -1) foundIndex = i13;
                if (i13 - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
                if (foundIndex !== -1) i13 -= i13 - foundIndex;
                foundIndex = -1;
            }
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i13 = byteOffset; i13 >= 0; i13--){
            var found = true;
            for(var j = 0; j < valLength; j++){
                if (read2(arr, i13 + j) !== read2(val, j)) {
                    found = false;
                    break;
                }
            }
            if (found) return i13;
        }
    }
    return -1;
}
Buffer3.prototype.includes = function includes1(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer3.prototype.indexOf = function indexOf1(val, byteOffset, encoding) {
    return bidirectionalIndexOf1(this, val, byteOffset, encoding, true);
};
Buffer3.prototype.lastIndexOf = function lastIndexOf1(val, byteOffset, encoding) {
    return bidirectionalIndexOf1(this, val, byteOffset, encoding, false);
};
function hexWrite1(buf, string1, offset2, length1) {
    offset2 = Number(offset2) || 0;
    var remaining = buf.length - offset2;
    if (!length1) {
        length1 = remaining;
    } else {
        length1 = Number(length1);
        if (length1 > remaining) {
            length1 = remaining;
        }
    }
    var strLen = string1.length;
    if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
    if (length1 > strLen / 2) {
        length1 = strLen / 2;
    }
    for(var i13 = 0; i13 < length1; ++i13){
        var parsed = parseInt(string1.substr(i13 * 2, 2), 16);
        if (isNaN(parsed)) return i13;
        buf[offset2 + i13] = parsed;
    }
    return i13;
}
function utf8Write1(buf, string1, offset2, length1) {
    return blitBuffer2(utf8ToBytes2(string1, buf.length - offset2), buf, offset2, length1);
}
function asciiWrite1(buf, string1, offset2, length1) {
    return blitBuffer2(asciiToBytes2(string1), buf, offset2, length1);
}
function latin1Write1(buf, string1, offset2, length1) {
    return asciiWrite1(buf, string1, offset2, length1);
}
function base64Write1(buf, string1, offset2, length1) {
    return blitBuffer2(base64ToBytes2(string1), buf, offset2, length1);
}
function ucs2Write1(buf, string1, offset2, length1) {
    return blitBuffer2(utf16leToBytes2(string1, buf.length - offset2), buf, offset2, length1);
}
Buffer3.prototype.write = function write21(string1, offset2, length1, encoding) {
    if (offset2 === void 0) {
        encoding = "utf8";
        length1 = this.length;
        offset2 = 0;
    } else if (length1 === void 0 && typeof offset2 === "string") {
        encoding = offset2;
        length1 = this.length;
        offset2 = 0;
    } else if (isFinite(offset2)) {
        offset2 = offset2 | 0;
        if (isFinite(length1)) {
            length1 = length1 | 0;
            if (encoding === void 0) encoding = "utf8";
        } else {
            encoding = length1;
            length1 = void 0;
        }
    } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    }
    var remaining = this.length - offset2;
    if (length1 === void 0 || length1 > remaining) length1 = remaining;
    if (string1.length > 0 && (length1 < 0 || offset2 < 0) || offset2 > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding) encoding = "utf8";
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "hex":
                return hexWrite1(this, string1, offset2, length1);
            case "utf8":
            case "utf-8":
                return utf8Write1(this, string1, offset2, length1);
            case "ascii":
                return asciiWrite1(this, string1, offset2, length1);
            case "latin1":
            case "binary":
                return latin1Write1(this, string1, offset2, length1);
            case "base64":
                return base64Write1(this, string1, offset2, length1);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return ucs2Write1(this, string1, offset2, length1);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
};
Buffer3.prototype.toJSON = function toJSON1() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice2(buf, start, end2) {
    if (start === 0 && end2 === buf.length) {
        return fromByteArray1(buf);
    } else {
        return fromByteArray1(buf.slice(start, end2));
    }
}
function utf8Slice2(buf, start, end2) {
    end2 = Math.min(buf.length, end2);
    var res = [];
    var i13 = start;
    while(i13 < end2){
        var firstByte = buf[i13];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i13 + bytesPerSequence <= end2) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i13 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i13 + 1];
                    thirdByte = buf[i13 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i13 + 1];
                    thirdByte = buf[i13 + 2];
                    fourthByte = buf[i13 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i13 += bytesPerSequence;
    }
    return decodeCodePointsArray2(res);
}
var MAX_ARGUMENTS_LENGTH1 = 4096;
function decodeCodePointsArray2(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH1) {
        return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i13 = 0;
    while(i13 < len){
        res += String.fromCharCode.apply(String, codePoints.slice(i13, i13 += MAX_ARGUMENTS_LENGTH1));
    }
    return res;
}
function asciiSlice2(buf, start, end2) {
    var ret = "";
    end2 = Math.min(buf.length, end2);
    for(var i13 = start; i13 < end2; ++i13){
        ret += String.fromCharCode(buf[i13] & 127);
    }
    return ret;
}
function latin1Slice2(buf, start, end2) {
    var ret = "";
    end2 = Math.min(buf.length, end2);
    for(var i13 = start; i13 < end2; ++i13){
        ret += String.fromCharCode(buf[i13]);
    }
    return ret;
}
function hexSlice2(buf, start, end2) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end2 || end2 < 0 || end2 > len) end2 = len;
    var out = "";
    for(var i13 = start; i13 < end2; ++i13){
        out += toHex2(buf[i13]);
    }
    return out;
}
function utf16leSlice2(buf, start, end2) {
    var bytes = buf.slice(start, end2);
    var res = "";
    for(var i13 = 0; i13 < bytes.length; i13 += 2){
        res += String.fromCharCode(bytes[i13] + bytes[i13 + 1] * 256);
    }
    return res;
}
Buffer3.prototype.slice = function slice1(start, end2) {
    var len = this.length;
    start = ~~start;
    end2 = end2 === void 0 ? len : ~~end2;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) {
        start = len;
    }
    if (end2 < 0) {
        end2 += len;
        if (end2 < 0) end2 = 0;
    } else if (end2 > len) {
        end2 = len;
    }
    if (end2 < start) end2 = start;
    var newBuf;
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end2);
        newBuf.__proto__ = Buffer3.prototype;
    } else {
        var sliceLen = end2 - start;
        newBuf = new Buffer3(sliceLen, void 0);
        for(var i13 = 0; i13 < sliceLen; ++i13){
            newBuf[i13] = this[i13 + start];
        }
    }
    return newBuf;
};
function checkOffset1(offset2, ext, length1) {
    if (offset2 % 1 !== 0 || offset2 < 0) throw new RangeError("offset is not uint");
    if (offset2 + ext > length1) throw new RangeError("Trying to access beyond buffer length");
}
Buffer3.prototype.readUIntLE = function readUIntLE1(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset1(offset2, byteLength21, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i14 = 0;
    while((++i14) < byteLength21 && (mul1 *= 256)){
        val += this[offset2 + i14] * mul1;
    }
    return val;
};
Buffer3.prototype.readUIntBE = function readUIntBE1(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        checkOffset1(offset2, byteLength21, this.length);
    }
    var val = this[offset2 + --byteLength21];
    var mul1 = 1;
    while(byteLength21 > 0 && (mul1 *= 256)){
        val += this[offset2 + --byteLength21] * mul1;
    }
    return val;
};
Buffer3.prototype.readUInt8 = function readUInt81(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 1, this.length);
    return this[offset2];
};
Buffer3.prototype.readUInt16LE = function readUInt16LE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 2, this.length);
    return this[offset2] | this[offset2 + 1] << 8;
};
Buffer3.prototype.readUInt16BE = function readUInt16BE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 2, this.length);
    return this[offset2] << 8 | this[offset2 + 1];
};
Buffer3.prototype.readUInt32LE = function readUInt32LE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return (this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16) + this[offset2 + 3] * 16777216;
};
Buffer3.prototype.readUInt32BE = function readUInt32BE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return this[offset2] * 16777216 + (this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3]);
};
Buffer3.prototype.readIntLE = function readIntLE1(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset1(offset2, byteLength21, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i14 = 0;
    while((++i14) < byteLength21 && (mul1 *= 256)){
        val += this[offset2 + i14] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength21);
    return val;
};
Buffer3.prototype.readIntBE = function readIntBE1(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset1(offset2, byteLength21, this.length);
    var i14 = byteLength21;
    var mul1 = 1;
    var val = this[offset2 + --i14];
    while(i14 > 0 && (mul1 *= 256)){
        val += this[offset2 + --i14] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength21);
    return val;
};
Buffer3.prototype.readInt8 = function readInt81(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 1, this.length);
    if (!(this[offset2] & 128)) return this[offset2];
    return (255 - this[offset2] + 1) * -1;
};
Buffer3.prototype.readInt16LE = function readInt16LE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 2, this.length);
    var val = this[offset2] | this[offset2 + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer3.prototype.readInt16BE = function readInt16BE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 2, this.length);
    var val = this[offset2 + 1] | this[offset2] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer3.prototype.readInt32LE = function readInt32LE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16 | this[offset2 + 3] << 24;
};
Buffer3.prototype.readInt32BE = function readInt32BE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return this[offset2] << 24 | this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3];
};
Buffer3.prototype.readFloatLE = function readFloatLE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return read1(this, offset2, true, 23, 4);
};
Buffer3.prototype.readFloatBE = function readFloatBE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 4, this.length);
    return read1(this, offset2, false, 23, 4);
};
Buffer3.prototype.readDoubleLE = function readDoubleLE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 8, this.length);
    return read1(this, offset2, true, 52, 8);
};
Buffer3.prototype.readDoubleBE = function readDoubleBE1(offset2, noAssert) {
    if (!noAssert) checkOffset1(offset2, 8, this.length);
    return read1(this, offset2, false, 52, 8);
};
function checkInt1(buf, value, offset2, ext, max, min) {
    if (!internalIsBuffer2(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
}
Buffer3.prototype.writeUIntLE = function writeUIntLE1(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength21) - 1;
        checkInt1(this, value, offset2, byteLength21, maxBytes, 0);
    }
    var mul1 = 1;
    var i14 = 0;
    this[offset2] = value & 255;
    while((++i14) < byteLength21 && (mul1 *= 256)){
        this[offset2 + i14] = value / mul1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer3.prototype.writeUIntBE = function writeUIntBE1(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength21) - 1;
        checkInt1(this, value, offset2, byteLength21, maxBytes, 0);
    }
    var i14 = byteLength21 - 1;
    var mul1 = 1;
    this[offset2 + i14] = value & 255;
    while((--i14) >= 0 && (mul1 *= 256)){
        this[offset2 + i14] = value / mul1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer3.prototype.writeUInt8 = function writeUInt81(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 1, 255, 0);
    if (!Buffer3.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset2] = value & 255;
    return offset2 + 1;
};
function objectWriteUInt161(buf, value, offset2, littleEndian) {
    if (value < 0) value = 65535 + value + 1;
    for(var i14 = 0, j = Math.min(buf.length - offset2, 2); i14 < j; ++i14){
        buf[offset2 + i14] = (value & 255 << 8 * (littleEndian ? i14 : 1 - i14)) >>> (littleEndian ? i14 : 1 - i14) * 8;
    }
}
Buffer3.prototype.writeUInt16LE = function writeUInt16LE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 2, 65535, 0);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt161(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer3.prototype.writeUInt16BE = function writeUInt16BE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 2, 65535, 0);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt161(this, value, offset2, false);
    }
    return offset2 + 2;
};
function objectWriteUInt321(buf, value, offset2, littleEndian) {
    if (value < 0) value = 4294967295 + value + 1;
    for(var i14 = 0, j = Math.min(buf.length - offset2, 4); i14 < j; ++i14){
        buf[offset2 + i14] = value >>> (littleEndian ? i14 : 3 - i14) * 8 & 255;
    }
}
Buffer3.prototype.writeUInt32LE = function writeUInt32LE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 4, 4294967295, 0);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2 + 3] = value >>> 24;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 1] = value >>> 8;
        this[offset2] = value & 255;
    } else {
        objectWriteUInt321(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer3.prototype.writeUInt32BE = function writeUInt32BE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 4, 4294967295, 0);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt321(this, value, offset2, false);
    }
    return offset2 + 4;
};
Buffer3.prototype.writeIntLE = function writeIntLE1(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength21 - 1);
        checkInt1(this, value, offset2, byteLength21, limit - 1, -limit);
    }
    var i14 = 0;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2] = value & 255;
    while((++i14) < byteLength21 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i14 - 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i14] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer3.prototype.writeIntBE = function writeIntBE1(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength21 - 1);
        checkInt1(this, value, offset2, byteLength21, limit - 1, -limit);
    }
    var i14 = byteLength21 - 1;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2 + i14] = value & 255;
    while((--i14) >= 0 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i14 + 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i14] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer3.prototype.writeInt8 = function writeInt81(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 1, 127, -128);
    if (!Buffer3.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 255 + value + 1;
    this[offset2] = value & 255;
    return offset2 + 1;
};
Buffer3.prototype.writeInt16LE = function writeInt16LE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 2, 32767, -32768);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt161(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer3.prototype.writeInt16BE = function writeInt16BE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 2, 32767, -32768);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt161(this, value, offset2, false);
    }
    return offset2 + 2;
};
Buffer3.prototype.writeInt32LE = function writeInt32LE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 4, 2147483647, -2147483648);
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 3] = value >>> 24;
    } else {
        objectWriteUInt321(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer3.prototype.writeInt32BE = function writeInt32BE1(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt1(this, value, offset2, 4, 2147483647, -2147483648);
    if (value < 0) value = 4294967295 + value + 1;
    if (Buffer3.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt321(this, value, offset2, false);
    }
    return offset2 + 4;
};
function checkIEEE7541(buf, value, offset2, ext, max, min) {
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
    if (offset2 < 0) throw new RangeError("Index out of range");
}
function writeFloat1(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE7541(buf, value, offset2, 4);
    }
    write1(buf, value, offset2, littleEndian, 23, 4);
    return offset2 + 4;
}
Buffer3.prototype.writeFloatLE = function writeFloatLE1(value, offset2, noAssert) {
    return writeFloat1(this, value, offset2, true, noAssert);
};
Buffer3.prototype.writeFloatBE = function writeFloatBE1(value, offset2, noAssert) {
    return writeFloat1(this, value, offset2, false, noAssert);
};
function writeDouble1(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE7541(buf, value, offset2, 8);
    }
    write1(buf, value, offset2, littleEndian, 52, 8);
    return offset2 + 8;
}
Buffer3.prototype.writeDoubleLE = function writeDoubleLE1(value, offset2, noAssert) {
    return writeDouble1(this, value, offset2, true, noAssert);
};
Buffer3.prototype.writeDoubleBE = function writeDoubleBE1(value, offset2, noAssert) {
    return writeDouble1(this, value, offset2, false, noAssert);
};
Buffer3.prototype.copy = function copy2(target, targetStart, start, end2) {
    if (!start) start = 0;
    if (!end2 && end2 !== 0) end2 = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end2 > 0 && end2 < start) end2 = start;
    if (end2 === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
    if (end2 < 0) throw new RangeError("sourceEnd out of bounds");
    if (end2 > this.length) end2 = this.length;
    if (target.length - targetStart < end2 - start) {
        end2 = target.length - targetStart + start;
    }
    var len = end2 - start;
    var i14;
    if (this === target && start < targetStart && targetStart < end2) {
        for(i14 = len - 1; i14 >= 0; --i14){
            target[i14 + targetStart] = this[i14 + start];
        }
    } else if (len < 1000 || !Buffer3.TYPED_ARRAY_SUPPORT) {
        for(i14 = 0; i14 < len; ++i14){
            target[i14 + targetStart] = this[i14 + start];
        }
    } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }
    return len;
};
Buffer3.prototype.fill = function fill1(val, start, end2, encoding) {
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end2 = this.length;
        } else if (typeof end2 === "string") {
            encoding = end2;
            end2 = this.length;
        }
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
                val = code;
            }
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
        }
    } else if (typeof val === "number") {
        val = val & 255;
    }
    if (start < 0 || this.length < start || this.length < end2) {
        throw new RangeError("Out of range index");
    }
    if (end2 <= start) {
        return this;
    }
    start = start >>> 0;
    end2 = end2 === void 0 ? this.length : end2 >>> 0;
    if (!val) val = 0;
    var i14;
    if (typeof val === "number") {
        for(i14 = start; i14 < end2; ++i14){
            this[i14] = val;
        }
    } else {
        var bytes = internalIsBuffer2(val) ? val : utf8ToBytes2(new Buffer3(val, encoding).toString());
        var len = bytes.length;
        for(i14 = 0; i14 < end2 - start; ++i14){
            this[i14 + start] = bytes[i14 % len];
        }
    }
    return this;
};
var INVALID_BASE64_RE1 = /[^+\/0-9A-Za-z-_]/g;
function base64clean1(str) {
    str = stringtrim2(str).replace(INVALID_BASE64_RE1, "");
    if (str.length < 2) return "";
    while(str.length % 4 !== 0){
        str = str + "=";
    }
    return str;
}
function stringtrim2(str) {
    if (str.trim) return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
}
function toHex2(n1) {
    if (n1 < 16) return "0" + n1.toString(16);
    return n1.toString(16);
}
function utf8ToBytes2(string1, units) {
    units = units || Infinity;
    var codePoint;
    var length1 = string1.length;
    var leadSurrogate = null;
    var bytes = [];
    for(var i14 = 0; i14 < length1; ++i14){
        codePoint = string1.charCodeAt(i14);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                } else if (i14 + 1 === length1) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function asciiToBytes2(str) {
    var byteArray = [];
    for(var i14 = 0; i14 < str.length; ++i14){
        byteArray.push(str.charCodeAt(i14) & 255);
    }
    return byteArray;
}
function utf16leToBytes2(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for(var i14 = 0; i14 < str.length; ++i14){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i14);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes2(str) {
    return toByteArray1(base64clean1(str));
}
function blitBuffer2(src, dst, offset2, length1) {
    for(var i14 = 0; i14 < length1; ++i14){
        if (i14 + offset2 >= dst.length || i14 >= src.length) break;
        dst[i14 + offset2] = src[i14];
    }
    return i14;
}
function isnan2(val) {
    return val !== val;
}
function isBuffer2(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer2(obj) || isSlowBuffer2(obj));
}
function isFastBuffer2(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer2(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer2(obj.slice(0, 0));
}
var bufferEs61 = Object.freeze({
    __proto__: null,
    Buffer: Buffer3,
    INSPECT_MAX_BYTES: INSPECT_MAX_BYTES1,
    SlowBuffer: SlowBuffer1,
    isBuffer: isBuffer2,
    kMaxLength: _kMaxLength1
});
var _nodeResolve_empty = {
};
var _nodeResolve_empty$1 = Object.freeze({
    __proto__: null,
    default: _nodeResolve_empty
});
var debugUtil = getDefaultExportFromNamespaceIfNotNamed(_nodeResolve_empty$1);
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread(target) {
    for(var i14 = 1; i14 < arguments.length; i14++){
        var source = arguments[i14] != null ? arguments[i14] : {
        };
        if (i14 % 2) {
            ownKeys(Object(source), true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(Object(source)).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i14 = 0; i14 < props.length; i14++){
        var descriptor = props[i14];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var Buffer$1 = bufferEs61.Buffer;
var inspect2 = debugUtil.inspect;
var custom = inspect2 && inspect2.custom || "inspect";
function copyBuffer(src, target, offset2) {
    Buffer$1.prototype.copy.call(src, target, offset2);
}
var buffer_list = function() {
    function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    _createClass(BufferList, [
        {
            key: "push",
            value: function push(v) {
                var entry1 = {
                    data: v,
                    next: null
                };
                if (this.length > 0) this.tail.next = entry1;
                else this.head = entry1;
                this.tail = entry1;
                ++this.length;
            }
        },
        {
            key: "unshift",
            value: function unshift(v) {
                var entry1 = {
                    data: v,
                    next: this.head
                };
                if (this.length === 0) this.tail = entry1;
                this.head = entry1;
                ++this.length;
            }
        },
        {
            key: "shift",
            value: function shift() {
                if (this.length === 0) return;
                var ret = this.head.data;
                if (this.length === 1) this.head = this.tail = null;
                else this.head = this.head.next;
                --this.length;
                return ret;
            }
        },
        {
            key: "clear",
            value: function clear() {
                this.head = this.tail = null;
                this.length = 0;
            }
        },
        {
            key: "join",
            value: function join(s) {
                if (this.length === 0) return "";
                var p = this.head;
                var ret = "" + p.data;
                while(p = p.next){
                    ret += s + p.data;
                }
                return ret;
            }
        },
        {
            key: "concat",
            value: function concat2(n1) {
                if (this.length === 0) return Buffer$1.alloc(0);
                var ret = Buffer$1.allocUnsafe(n1 >>> 0);
                var p = this.head;
                var i14 = 0;
                while(p){
                    copyBuffer(p.data, ret, i14);
                    i14 += p.data.length;
                    p = p.next;
                }
                return ret;
            }
        },
        {
            key: "consume",
            value: function consume(n1, hasStrings) {
                var ret;
                if (n1 < this.head.data.length) {
                    ret = this.head.data.slice(0, n1);
                    this.head.data = this.head.data.slice(n1);
                } else if (n1 === this.head.data.length) {
                    ret = this.shift();
                } else {
                    ret = hasStrings ? this._getString(n1) : this._getBuffer(n1);
                }
                return ret;
            }
        },
        {
            key: "first",
            value: function first() {
                return this.head.data;
            }
        },
        {
            key: "_getString",
            value: function _getString(n1) {
                var p = this.head;
                var c = 1;
                var ret = p.data;
                n1 -= ret.length;
                while(p = p.next){
                    var str = p.data;
                    var nb = n1 > str.length ? str.length : n1;
                    if (nb === str.length) ret += str;
                    else ret += str.slice(0, n1);
                    n1 -= nb;
                    if (n1 === 0) {
                        if (nb === str.length) {
                            ++c;
                            if (p.next) this.head = p.next;
                            else this.head = this.tail = null;
                        } else {
                            this.head = p;
                            p.data = str.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                this.length -= c;
                return ret;
            }
        },
        {
            key: "_getBuffer",
            value: function _getBuffer(n1) {
                var ret = Buffer$1.allocUnsafe(n1);
                var p = this.head;
                var c = 1;
                p.data.copy(ret);
                n1 -= p.data.length;
                while(p = p.next){
                    var buf = p.data;
                    var nb = n1 > buf.length ? buf.length : n1;
                    buf.copy(ret, ret.length - n1, 0, nb);
                    n1 -= nb;
                    if (n1 === 0) {
                        if (nb === buf.length) {
                            ++c;
                            if (p.next) this.head = p.next;
                            else this.head = this.tail = null;
                        } else {
                            this.head = p;
                            p.data = buf.slice(nb);
                        }
                        break;
                    }
                    ++c;
                }
                this.length -= c;
                return ret;
            }
        },
        {
            key: custom,
            value: function value(_, options3) {
                return inspect2(this, _objectSpread({
                }, options3, {
                    depth: 0,
                    customInspect: false
                }));
            }
        }
    ]);
    return BufferList;
}();
function destroy(err, cb) {
    var _this = this;
    var readableDestroyed = this._readableState && this._readableState.destroyed;
    var writableDestroyed = this._writableState && this._writableState.destroyed;
    if (readableDestroyed || writableDestroyed) {
        if (cb) {
            cb(err);
        } else if (err) {
            if (!this._writableState) {
                process.nextTick(emitErrorNT, this, err);
            } else if (!this._writableState.errorEmitted) {
                this._writableState.errorEmitted = true;
                process.nextTick(emitErrorNT, this, err);
            }
        }
        return this;
    }
    if (this._readableState) {
        this._readableState.destroyed = true;
    }
    if (this._writableState) {
        this._writableState.destroyed = true;
    }
    this._destroy(err || null, function(err2) {
        if (!cb && err2) {
            if (!_this._writableState) {
                process.nextTick(emitErrorAndCloseNT, _this, err2);
            } else if (!_this._writableState.errorEmitted) {
                _this._writableState.errorEmitted = true;
                process.nextTick(emitErrorAndCloseNT, _this, err2);
            } else {
                process.nextTick(emitCloseNT, _this);
            }
        } else if (cb) {
            process.nextTick(emitCloseNT, _this);
            cb(err2);
        } else {
            process.nextTick(emitCloseNT, _this);
        }
    });
    return this;
}
function emitErrorAndCloseNT(self2, err) {
    emitErrorNT(self2, err);
    emitCloseNT(self2);
}
function emitCloseNT(self2) {
    if (self2._writableState && !self2._writableState.emitClose) return;
    if (self2._readableState && !self2._readableState.emitClose) return;
    self2.emit("close");
}
function undestroy() {
    if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
    }
    if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
    }
}
function emitErrorNT(self2, err) {
    self2.emit("error", err);
}
function errorOrDestroy(stream, err) {
    var rState = stream._readableState;
    var wState = stream._writableState;
    if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);
    else stream.emit("error", err);
}
var destroy_1 = {
    destroy,
    undestroy,
    errorOrDestroy
};
function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
}
var codes = {
};
function createErrorType(code, message, Base) {
    if (!Base) {
        Base = Error;
    }
    function getMessage(arg1, arg2, arg3) {
        if (typeof message === "string") {
            return message;
        } else {
            return message(arg1, arg2, arg3);
        }
    }
    var NodeError = function(_Base) {
        _inheritsLoose(NodeError2, _Base);
        function NodeError2(arg1, arg2, arg3) {
            return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
        }
        return NodeError2;
    }(Base);
    NodeError.prototype.name = Base.name;
    NodeError.prototype.code = code;
    codes[code] = NodeError;
}
function oneOf(expected, thing) {
    if (Array.isArray(expected)) {
        var len = expected.length;
        expected = expected.map(function(i14) {
            return String(i14);
        });
        if (len > 2) {
            return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1];
        } else if (len === 2) {
            return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
        } else {
            return "of ".concat(thing, " ").concat(expected[0]);
        }
    } else {
        return "of ".concat(thing, " ").concat(String(expected));
    }
}
function startsWith(str, search, pos) {
    return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}
function endsWith1(str, search, this_len) {
    if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
    }
    return str.substring(this_len - search.length, this_len) === search;
}
function includes2(str, search, start) {
    if (typeof start !== "number") {
        start = 0;
    }
    if (start + search.length > str.length) {
        return false;
    } else {
        return str.indexOf(search, start) !== -1;
    }
}
createErrorType("ERR_INVALID_OPT_VALUE", function(name4, value) {
    return 'The value "' + value + '" is invalid for option "' + name4 + '"';
}, TypeError);
createErrorType("ERR_INVALID_ARG_TYPE", function(name4, expected, actual) {
    var determiner;
    if (typeof expected === "string" && startsWith(expected, "not ")) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
    } else {
        determiner = "must be";
    }
    var msg;
    if (endsWith1(name4, " argument")) {
        msg = "The ".concat(name4, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
    } else {
        var type2 = includes2(name4, ".") ? "property" : "argument";
        msg = 'The "'.concat(name4, '" ').concat(type2, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
    }
    msg += ". Received type ".concat(typeof actual);
    return msg;
}, TypeError);
createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name4) {
    return "The " + name4 + " method is not implemented";
});
createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
createErrorType("ERR_STREAM_DESTROYED", function(name4) {
    return "Cannot call " + name4 + " after a stream was destroyed";
});
createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
    return "Unknown encoding: " + arg;
}, TypeError);
createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
var codes_1 = codes;
var errorsBrowser = {
    codes: codes_1
};
var ERR_INVALID_OPT_VALUE = errorsBrowser.codes.ERR_INVALID_OPT_VALUE;
function highWaterMarkFrom(options3, isDuplex, duplexKey) {
    return options3.highWaterMark != null ? options3.highWaterMark : isDuplex ? options3[duplexKey] : null;
}
function getHighWaterMark(state2, options3, duplexKey, isDuplex) {
    var hwm = highWaterMarkFrom(options3, isDuplex, duplexKey);
    if (hwm != null) {
        if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
            var name4 = isDuplex ? duplexKey : "highWaterMark";
            throw new ERR_INVALID_OPT_VALUE(name4, hwm);
        }
        return Math.floor(hwm);
    }
    return state2.objectMode ? 16 : 16 * 1024;
}
var state1 = {
    getHighWaterMark
};
var _stream_writable = Writable;
function CorkedRequest(state2) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
        onCorkedFinish(_this, state2);
    };
}
var Duplex;
Writable.WritableState = WritableState;
var internalUtil = {
    deprecate: browser
};
var Buffer$2 = bufferEs61.Buffer;
var OurUint8Array = commonjsGlobal1.Uint8Array || function() {
};
function _uint8ArrayToBuffer(chunk) {
    return Buffer$2.from(chunk);
}
function _isUint8Array(obj) {
    return Buffer$2.isBuffer(obj) || obj instanceof OurUint8Array;
}
var getHighWaterMark$1 = state1.getHighWaterMark;
var _require$codes = errorsBrowser.codes, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK, ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE, ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED, ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES, ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END, ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy$1 = destroy_1.errorOrDestroy;
inherits_browser(Writable, streamBrowser);
function nop() {
}
function WritableState(options3, stream, isDuplex) {
    Duplex = Duplex || _stream_duplex;
    options3 = options3 || {
    };
    if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
    this.objectMode = !!options3.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options3.writableObjectMode;
    this.highWaterMark = getHighWaterMark$1(this, options3, "writableHighWaterMark", isDuplex);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options3.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options3.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
        onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.emitClose = options3.emitClose !== false;
    this.autoDestroy = !!options3.autoDestroy;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while(current){
        out.push(current);
        current = current.next;
    }
    return out;
};
(function() {
    try {
        Object.defineProperty(WritableState.prototype, "buffer", {
            get: internalUtil.deprecate(function writableStateBufferGetter() {
                return this.getBuffer();
            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
    } catch (_) {
    }
})();
var realHasInstance;
if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function value(object) {
            if (realHasInstance.call(this, object)) return true;
            if (this !== Writable) return false;
            return object && object._writableState instanceof WritableState;
        }
    });
} else {
    realHasInstance = function realHasInstance2(object) {
        return object instanceof this;
    };
}
function Writable(options3) {
    Duplex = Duplex || _stream_duplex;
    var isDuplex = this instanceof Duplex;
    if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options3);
    this._writableState = new WritableState(options3, this, isDuplex);
    this.writable = true;
    if (options3) {
        if (typeof options3.write === "function") this._write = options3.write;
        if (typeof options3.writev === "function") this._writev = options3.writev;
        if (typeof options3.destroy === "function") this._destroy = options3.destroy;
        if (typeof options3.final === "function") this._final = options3.final;
    }
    streamBrowser.call(this);
}
Writable.prototype.pipe = function() {
    errorOrDestroy$1(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
    var er = new ERR_STREAM_WRITE_AFTER_END();
    errorOrDestroy$1(stream, er);
    process.nextTick(cb, er);
}
function validChunk(stream, state2, chunk, cb) {
    var er;
    if (chunk === null) {
        er = new ERR_STREAM_NULL_VALUES();
    } else if (typeof chunk !== "string" && !state2.objectMode) {
        er = new ERR_INVALID_ARG_TYPE("chunk", [
            "string",
            "Buffer"
        ], chunk);
    }
    if (er) {
        errorOrDestroy$1(stream, er);
        process.nextTick(cb, er);
        return false;
    }
    return true;
}
Writable.prototype.write = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    var ret = false;
    var isBuf = !state2.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer$2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
    }
    if (isBuf) encoding = "buffer";
    else if (!encoding) encoding = state2.defaultEncoding;
    if (typeof cb !== "function") cb = nop;
    if (state2.ending) writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state2, chunk, cb)) {
        state2.pendingcb++;
        ret = writeOrBuffer(this, state2, isBuf, chunk, encoding, cb);
    }
    return ret;
};
Writable.prototype.cork = function() {
    this._writableState.corked++;
};
Writable.prototype.uncork = function() {
    var state2 = this._writableState;
    if (state2.corked) {
        state2.corked--;
        if (!state2.writing && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) clearBuffer(this, state2);
    }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string") encoding = encoding.toLowerCase();
    if (!([
        "hex",
        "utf8",
        "utf-8",
        "ascii",
        "binary",
        "base64",
        "ucs2",
        "ucs-2",
        "utf16le",
        "utf-16le",
        "raw"
    ].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
};
Object.defineProperty(Writable.prototype, "writableBuffer", {
    enumerable: false,
    get: function get() {
        return this._writableState && this._writableState.getBuffer();
    }
});
function decodeChunk(state2, chunk, encoding) {
    if (!state2.objectMode && state2.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer$2.from(chunk, encoding);
    }
    return chunk;
}
Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get2() {
        return this._writableState.highWaterMark;
    }
});
function writeOrBuffer(stream, state2, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
        var newChunk = decodeChunk(state2, chunk, encoding);
        if (chunk !== newChunk) {
            isBuf = true;
            encoding = "buffer";
            chunk = newChunk;
        }
    }
    var len = state2.objectMode ? 1 : chunk.length;
    state2.length += len;
    var ret = state2.length < state2.highWaterMark;
    if (!ret) state2.needDrain = true;
    if (state2.writing || state2.corked) {
        var last1 = state2.lastBufferedRequest;
        state2.lastBufferedRequest = {
            chunk,
            encoding,
            isBuf,
            callback: cb,
            next: null
        };
        if (last1) {
            last1.next = state2.lastBufferedRequest;
        } else {
            state2.bufferedRequest = state2.lastBufferedRequest;
        }
        state2.bufferedRequestCount += 1;
    } else {
        doWrite(stream, state2, false, len, chunk, encoding, cb);
    }
    return ret;
}
function doWrite(stream, state2, writev, len, chunk, encoding, cb) {
    state2.writelen = len;
    state2.writecb = cb;
    state2.writing = true;
    state2.sync = true;
    if (state2.destroyed) state2.onwrite(new ERR_STREAM_DESTROYED("write"));
    else if (writev) stream._writev(chunk, state2.onwrite);
    else stream._write(chunk, encoding, state2.onwrite);
    state2.sync = false;
}
function onwriteError(stream, state2, sync, er, cb) {
    --state2.pendingcb;
    if (sync) {
        process.nextTick(cb, er);
        process.nextTick(finishMaybe, stream, state2);
        stream._writableState.errorEmitted = true;
        errorOrDestroy$1(stream, er);
    } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        errorOrDestroy$1(stream, er);
        finishMaybe(stream, state2);
    }
}
function onwriteStateUpdate(state2) {
    state2.writing = false;
    state2.writecb = null;
    state2.length -= state2.writelen;
    state2.writelen = 0;
}
function onwrite(stream, er) {
    var state2 = stream._writableState;
    var sync = state2.sync;
    var cb = state2.writecb;
    if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
    onwriteStateUpdate(state2);
    if (er) onwriteError(stream, state2, sync, er, cb);
    else {
        var finished2 = needFinish(state2) || stream.destroyed;
        if (!finished2 && !state2.corked && !state2.bufferProcessing && state2.bufferedRequest) {
            clearBuffer(stream, state2);
        }
        if (sync) {
            process.nextTick(afterWrite, stream, state2, finished2, cb);
        } else {
            afterWrite(stream, state2, finished2, cb);
        }
    }
}
function afterWrite(stream, state2, finished2, cb) {
    if (!finished2) onwriteDrain(stream, state2);
    state2.pendingcb--;
    cb();
    finishMaybe(stream, state2);
}
function onwriteDrain(stream, state2) {
    if (state2.length === 0 && state2.needDrain) {
        state2.needDrain = false;
        stream.emit("drain");
    }
}
function clearBuffer(stream, state2) {
    state2.bufferProcessing = true;
    var entry1 = state2.bufferedRequest;
    if (stream._writev && entry1 && entry1.next) {
        var l = state2.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state2.corkedRequestsFree;
        holder.entry = entry1;
        var count = 0;
        var allBuffers = true;
        while(entry1){
            buffer[count] = entry1;
            if (!entry1.isBuf) allBuffers = false;
            entry1 = entry1.next;
            count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state2, true, state2.length, buffer, "", holder.finish);
        state2.pendingcb++;
        state2.lastBufferedRequest = null;
        if (holder.next) {
            state2.corkedRequestsFree = holder.next;
            holder.next = null;
        } else {
            state2.corkedRequestsFree = new CorkedRequest(state2);
        }
        state2.bufferedRequestCount = 0;
    } else {
        while(entry1){
            var chunk = entry1.chunk;
            var encoding = entry1.encoding;
            var cb = entry1.callback;
            var len = state2.objectMode ? 1 : chunk.length;
            doWrite(stream, state2, false, len, chunk, encoding, cb);
            entry1 = entry1.next;
            state2.bufferedRequestCount--;
            if (state2.writing) {
                break;
            }
        }
        if (entry1 === null) state2.lastBufferedRequest = null;
    }
    state2.bufferedRequest = entry1;
    state2.bufferProcessing = false;
}
Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
};
Writable.prototype._writev = null;
Writable.prototype.end = function(chunk, encoding, cb) {
    var state2 = this._writableState;
    if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
    } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
    }
    if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
    if (state2.corked) {
        state2.corked = 1;
        this.uncork();
    }
    if (!state2.ending) endWritable(this, state2, cb);
    return this;
};
Object.defineProperty(Writable.prototype, "writableLength", {
    enumerable: false,
    get: function get3() {
        return this._writableState.length;
    }
});
function needFinish(state2) {
    return state2.ending && state2.length === 0 && state2.bufferedRequest === null && !state2.finished && !state2.writing;
}
function callFinal(stream, state2) {
    stream._final(function(err) {
        state2.pendingcb--;
        if (err) {
            errorOrDestroy$1(stream, err);
        }
        state2.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state2);
    });
}
function prefinish(stream, state2) {
    if (!state2.prefinished && !state2.finalCalled) {
        if (typeof stream._final === "function" && !state2.destroyed) {
            state2.pendingcb++;
            state2.finalCalled = true;
            process.nextTick(callFinal, stream, state2);
        } else {
            state2.prefinished = true;
            stream.emit("prefinish");
        }
    }
}
function finishMaybe(stream, state2) {
    var need = needFinish(state2);
    if (need) {
        prefinish(stream, state2);
        if (state2.pendingcb === 0) {
            state2.finished = true;
            stream.emit("finish");
            if (state2.autoDestroy) {
                var rState = stream._readableState;
                if (!rState || rState.autoDestroy && rState.endEmitted) {
                    stream.destroy();
                }
            }
        }
    }
    return need;
}
function endWritable(stream, state2, cb) {
    state2.ending = true;
    finishMaybe(stream, state2);
    if (cb) {
        if (state2.finished) process.nextTick(cb);
        else stream.once("finish", cb);
    }
    state2.ended = true;
    stream.writable = false;
}
function onCorkedFinish(corkReq, state2, err) {
    var entry1 = corkReq.entry;
    corkReq.entry = null;
    while(entry1){
        var cb = entry1.callback;
        state2.pendingcb--;
        cb(err);
        entry1 = entry1.next;
    }
    state2.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, "destroyed", {
    enumerable: false,
    get: function get4() {
        if (this._writableState === void 0) {
            return false;
        }
        return this._writableState.destroyed;
    },
    set: function set(value) {
        if (!this._writableState) {
            return;
        }
        this._writableState.destroyed = value;
    }
});
Writable.prototype.destroy = destroy_1.destroy;
Writable.prototype._undestroy = destroy_1.undestroy;
Writable.prototype._destroy = function(err, cb) {
    cb(err);
};
var objectKeys = Object.keys || function(obj) {
    var keys = [];
    for(var key in obj){
        keys.push(key);
    }
    return keys;
};
var _stream_duplex = Duplex$1;
inherits_browser(Duplex$1, _stream_readable);
{
    var keys = objectKeys(_stream_writable.prototype);
    for(var v = 0; v < keys.length; v++){
        var method = keys[v];
        if (!Duplex$1.prototype[method]) Duplex$1.prototype[method] = _stream_writable.prototype[method];
    }
}function Duplex$1(options3) {
    if (!(this instanceof Duplex$1)) return new Duplex$1(options3);
    _stream_readable.call(this, options3);
    _stream_writable.call(this, options3);
    this.allowHalfOpen = true;
    if (options3) {
        if (options3.readable === false) this.readable = false;
        if (options3.writable === false) this.writable = false;
        if (options3.allowHalfOpen === false) {
            this.allowHalfOpen = false;
            this.once("end", onend);
        }
    }
}
Object.defineProperty(Duplex$1.prototype, "writableHighWaterMark", {
    enumerable: false,
    get: function get5() {
        return this._writableState.highWaterMark;
    }
});
Object.defineProperty(Duplex$1.prototype, "writableBuffer", {
    enumerable: false,
    get: function get6() {
        return this._writableState && this._writableState.getBuffer();
    }
});
Object.defineProperty(Duplex$1.prototype, "writableLength", {
    enumerable: false,
    get: function get7() {
        return this._writableState.length;
    }
});
function onend() {
    if (this._writableState.ended) return;
    process.nextTick(onEndNT, this);
}
function onEndNT(self2) {
    self2.end();
}
Object.defineProperty(Duplex$1.prototype, "destroyed", {
    enumerable: false,
    get: function get8() {
        if (this._readableState === void 0 || this._writableState === void 0) {
            return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function set2(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
            return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
    }
});
var ERR_STREAM_PREMATURE_CLOSE = errorsBrowser.codes.ERR_STREAM_PREMATURE_CLOSE;
function once$1(callback) {
    var called = false;
    return function() {
        if (called) return;
        called = true;
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        callback.apply(this, args);
    };
}
function noop$1() {
}
function isRequest(stream) {
    return stream.setHeader && typeof stream.abort === "function";
}
function eos(stream, opts, callback) {
    if (typeof opts === "function") return eos(stream, null, opts);
    if (!opts) opts = {
    };
    callback = once$1(callback || noop$1);
    var readable = opts.readable || opts.readable !== false && stream.readable;
    var writable = opts.writable || opts.writable !== false && stream.writable;
    var onlegacyfinish = function onlegacyfinish2() {
        if (!stream.writable) onfinish();
    };
    var writableEnded = stream._writableState && stream._writableState.finished;
    var onfinish = function onfinish2() {
        writable = false;
        writableEnded = true;
        if (!readable) callback.call(stream);
    };
    var readableEnded = stream._readableState && stream._readableState.endEmitted;
    var onend2 = function onend3() {
        readable = false;
        readableEnded = true;
        if (!writable) callback.call(stream);
    };
    var onerror = function onerror2(err) {
        callback.call(stream, err);
    };
    var onclose = function onclose2() {
        var err;
        if (readable && !readableEnded) {
            if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err);
        }
        if (writable && !writableEnded) {
            if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
            return callback.call(stream, err);
        }
    };
    var onrequest = function onrequest2() {
        stream.req.on("finish", onfinish);
    };
    if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req) onrequest();
        else stream.on("request", onrequest);
    } else if (writable && !stream._writableState) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
    }
    stream.on("end", onend2);
    stream.on("finish", onfinish);
    if (opts.error !== false) stream.on("error", onerror);
    stream.on("close", onclose);
    return function() {
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("end", onend2);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
    };
}
var endOfStream = eos;
var _Object$setPrototypeO;
function _defineProperty$1(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var kLastResolve = Symbol("lastResolve");
var kLastReject = Symbol("lastReject");
var kError = Symbol("error");
var kEnded = Symbol("ended");
var kLastPromise = Symbol("lastPromise");
var kHandlePromise = Symbol("handlePromise");
var kStream = Symbol("stream");
function createIterResult(value, done2) {
    return {
        value,
        done: done2
    };
}
function readAndResolve(iter) {
    var resolve = iter[kLastResolve];
    if (resolve !== null) {
        var data = iter[kStream].read();
        if (data !== null) {
            iter[kLastPromise] = null;
            iter[kLastResolve] = null;
            iter[kLastReject] = null;
            resolve(createIterResult(data, false));
        }
    }
}
function onReadable(iter) {
    process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
    return function(resolve, reject) {
        lastPromise.then(function() {
            if (iter[kEnded]) {
                resolve(createIterResult(void 0, true));
                return;
            }
            iter[kHandlePromise](resolve, reject);
        }, reject);
    };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
    get stream () {
        return this[kStream];
    },
    next: function next() {
        var _this = this;
        var error = this[kError];
        if (error !== null) {
            return Promise.reject(error);
        }
        if (this[kEnded]) {
            return Promise.resolve(createIterResult(void 0, true));
        }
        if (this[kStream].destroyed) {
            return new Promise(function(resolve, reject) {
                process.nextTick(function() {
                    if (_this[kError]) {
                        reject(_this[kError]);
                    } else {
                        resolve(createIterResult(void 0, true));
                    }
                });
            });
        }
        var lastPromise = this[kLastPromise];
        var promise;
        if (lastPromise) {
            promise = new Promise(wrapForNext(lastPromise, this));
        } else {
            var data = this[kStream].read();
            if (data !== null) {
                return Promise.resolve(createIterResult(data, false));
            }
            promise = new Promise(this[kHandlePromise]);
        }
        this[kLastPromise] = promise;
        return promise;
    }
}, _defineProperty$1(_Object$setPrototypeO, Symbol.asyncIterator, function() {
    return this;
}), _defineProperty$1(_Object$setPrototypeO, "return", function _return() {
    var _this2 = this;
    return new Promise(function(resolve, reject) {
        _this2[kStream].destroy(null, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(createIterResult(void 0, true));
        });
    });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
    var _Object$create;
    var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {
    }, _defineProperty$1(_Object$create, kStream, {
        value: stream,
        writable: true
    }), _defineProperty$1(_Object$create, kLastResolve, {
        value: null,
        writable: true
    }), _defineProperty$1(_Object$create, kLastReject, {
        value: null,
        writable: true
    }), _defineProperty$1(_Object$create, kError, {
        value: null,
        writable: true
    }), _defineProperty$1(_Object$create, kEnded, {
        value: stream._readableState.endEmitted,
        writable: true
    }), _defineProperty$1(_Object$create, kHandlePromise, {
        value: function value(resolve, reject) {
            var data = iterator[kStream].read();
            if (data) {
                iterator[kLastPromise] = null;
                iterator[kLastResolve] = null;
                iterator[kLastReject] = null;
                resolve(createIterResult(data, false));
            } else {
                iterator[kLastResolve] = resolve;
                iterator[kLastReject] = reject;
            }
        },
        writable: true
    }), _Object$create));
    iterator[kLastPromise] = null;
    endOfStream(stream, function(err) {
        if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
            var reject = iterator[kLastReject];
            if (reject !== null) {
                iterator[kLastPromise] = null;
                iterator[kLastResolve] = null;
                iterator[kLastReject] = null;
                reject(err);
            }
            iterator[kError] = err;
            return;
        }
        var resolve = iterator[kLastResolve];
        if (resolve !== null) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            resolve(createIterResult(void 0, true));
        }
        iterator[kEnded] = true;
    });
    stream.on("readable", onReadable.bind(null, iterator));
    return iterator;
};
var async_iterator = createReadableStreamAsyncIterator;
var fromBrowser = function() {
    throw new Error("Readable.from is not available in the browser");
};
var _stream_readable = Readable;
var Duplex$2;
Readable.ReadableState = ReadableState;
var EElistenerCount = function EElistenerCount2(emitter, type3) {
    return emitter.listeners(type3).length;
};
var Buffer$3 = bufferEs61.Buffer;
var OurUint8Array$1 = commonjsGlobal1.Uint8Array || function() {
};
function _uint8ArrayToBuffer$1(chunk) {
    return Buffer$3.from(chunk);
}
function _isUint8Array$1(obj) {
    return Buffer$3.isBuffer(obj) || obj instanceof OurUint8Array$1;
}
var debug;
if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
} else {
    debug = function debug2() {
    };
}
var getHighWaterMark$2 = state1.getHighWaterMark;
var _require$codes$1 = errorsBrowser.codes, ERR_INVALID_ARG_TYPE$1 = _require$codes$1.ERR_INVALID_ARG_TYPE, ERR_STREAM_PUSH_AFTER_EOF = _require$codes$1.ERR_STREAM_PUSH_AFTER_EOF, ERR_METHOD_NOT_IMPLEMENTED$1 = _require$codes$1.ERR_METHOD_NOT_IMPLEMENTED, ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes$1.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
var StringDecoder1;
var createReadableStreamAsyncIterator$1;
var from$1;
inherits_browser(Readable, streamBrowser);
var errorOrDestroy$2 = destroy_1.errorOrDestroy;
var kProxyEvents = [
    "error",
    "close",
    "destroy",
    "pause",
    "resume"
];
function prependListener2(emitter, event, fn) {
    if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
    else emitter._events[event] = [
        fn,
        emitter._events[event]
    ];
}
function ReadableState(options3, stream, isDuplex) {
    Duplex$2 = Duplex$2 || _stream_duplex;
    options3 = options3 || {
    };
    if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex$2;
    this.objectMode = !!options3.objectMode;
    if (isDuplex) this.objectMode = this.objectMode || !!options3.readableObjectMode;
    this.highWaterMark = getHighWaterMark$2(this, options3, "readableHighWaterMark", isDuplex);
    this.buffer = new buffer_list();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.paused = true;
    this.emitClose = options3.emitClose !== false;
    this.autoDestroy = !!options3.autoDestroy;
    this.destroyed = false;
    this.defaultEncoding = options3.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options3.encoding) {
        if (!StringDecoder1) StringDecoder1 = string_decoder.StringDecoder;
        this.decoder = new StringDecoder1(options3.encoding);
        this.encoding = options3.encoding;
    }
}
function Readable(options3) {
    Duplex$2 = Duplex$2 || _stream_duplex;
    if (!(this instanceof Readable)) return new Readable(options3);
    var isDuplex = this instanceof Duplex$2;
    this._readableState = new ReadableState(options3, this, isDuplex);
    this.readable = true;
    if (options3) {
        if (typeof options3.read === "function") this._read = options3.read;
        if (typeof options3.destroy === "function") this._destroy = options3.destroy;
    }
    streamBrowser.call(this);
}
Object.defineProperty(Readable.prototype, "destroyed", {
    enumerable: false,
    get: function get9() {
        if (this._readableState === void 0) {
            return false;
        }
        return this._readableState.destroyed;
    },
    set: function set3(value) {
        if (!this._readableState) {
            return;
        }
        this._readableState.destroyed = value;
    }
});
Readable.prototype.destroy = destroy_1.destroy;
Readable.prototype._undestroy = destroy_1.undestroy;
Readable.prototype._destroy = function(err, cb) {
    cb(err);
};
Readable.prototype.push = function(chunk, encoding) {
    var state2 = this._readableState;
    var skipChunkCheck;
    if (!state2.objectMode) {
        if (typeof chunk === "string") {
            encoding = encoding || state2.defaultEncoding;
            if (encoding !== state2.encoding) {
                chunk = Buffer$3.from(chunk, encoding);
                encoding = "";
            }
            skipChunkCheck = true;
        }
    } else {
        skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};
Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    debug("readableAddChunk", chunk);
    var state2 = stream._readableState;
    if (chunk === null) {
        state2.reading = false;
        onEofChunk(stream, state2);
    } else {
        var er;
        if (!skipChunkCheck) er = chunkInvalid(state2, chunk);
        if (er) {
            errorOrDestroy$2(stream, er);
        } else if (state2.objectMode || chunk && chunk.length > 0) {
            if (typeof chunk !== "string" && !state2.objectMode && Object.getPrototypeOf(chunk) !== Buffer$3.prototype) {
                chunk = _uint8ArrayToBuffer$1(chunk);
            }
            if (addToFront) {
                if (state2.endEmitted) errorOrDestroy$2(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
                else addChunk(stream, state2, chunk, true);
            } else if (state2.ended) {
                errorOrDestroy$2(stream, new ERR_STREAM_PUSH_AFTER_EOF());
            } else if (state2.destroyed) {
                return false;
            } else {
                state2.reading = false;
                if (state2.decoder && !encoding) {
                    chunk = state2.decoder.write(chunk);
                    if (state2.objectMode || chunk.length !== 0) addChunk(stream, state2, chunk, false);
                    else maybeReadMore(stream, state2);
                } else {
                    addChunk(stream, state2, chunk, false);
                }
            }
        } else if (!addToFront) {
            state2.reading = false;
            maybeReadMore(stream, state2);
        }
    }
    return !state2.ended && (state2.length < state2.highWaterMark || state2.length === 0);
}
function addChunk(stream, state2, chunk, addToFront) {
    if (state2.flowing && state2.length === 0 && !state2.sync) {
        state2.awaitDrain = 0;
        stream.emit("data", chunk);
    } else {
        state2.length += state2.objectMode ? 1 : chunk.length;
        if (addToFront) state2.buffer.unshift(chunk);
        else state2.buffer.push(chunk);
        if (state2.needReadable) emitReadable(stream);
    }
    maybeReadMore(stream, state2);
}
function chunkInvalid(state2, chunk) {
    var er;
    if (!_isUint8Array$1(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state2.objectMode) {
        er = new ERR_INVALID_ARG_TYPE$1("chunk", [
            "string",
            "Buffer",
            "Uint8Array"
        ], chunk);
    }
    return er;
}
Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
};
Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder1) StringDecoder1 = string_decoder.StringDecoder;
    var decoder = new StringDecoder1(enc);
    this._readableState.decoder = decoder;
    this._readableState.encoding = this._readableState.decoder.encoding;
    var p = this._readableState.buffer.head;
    var content = "";
    while(p !== null){
        content += decoder.write(p.data);
        p = p.next;
    }
    this._readableState.buffer.clear();
    if (content !== "") this._readableState.buffer.push(content);
    this._readableState.length = content.length;
    return this;
};
var MAX_HWM = 1073741824;
function computeNewHighWaterMark(n1) {
    if (n1 >= MAX_HWM) {
        n1 = MAX_HWM;
    } else {
        n1--;
        n1 |= n1 >>> 1;
        n1 |= n1 >>> 2;
        n1 |= n1 >>> 4;
        n1 |= n1 >>> 8;
        n1 |= n1 >>> 16;
        n1++;
    }
    return n1;
}
function howMuchToRead(n1, state2) {
    if (n1 <= 0 || state2.length === 0 && state2.ended) return 0;
    if (state2.objectMode) return 1;
    if (n1 !== n1) {
        if (state2.flowing && state2.length) return state2.buffer.head.data.length;
        else return state2.length;
    }
    if (n1 > state2.highWaterMark) state2.highWaterMark = computeNewHighWaterMark(n1);
    if (n1 <= state2.length) return n1;
    if (!state2.ended) {
        state2.needReadable = true;
        return 0;
    }
    return state2.length;
}
Readable.prototype.read = function(n1) {
    debug("read", n1);
    n1 = parseInt(n1, 10);
    var state2 = this._readableState;
    var nOrig = n1;
    if (n1 !== 0) state2.emittedReadable = false;
    if (n1 === 0 && state2.needReadable && ((state2.highWaterMark !== 0 ? state2.length >= state2.highWaterMark : state2.length > 0) || state2.ended)) {
        debug("read: emitReadable", state2.length, state2.ended);
        if (state2.length === 0 && state2.ended) endReadable(this);
        else emitReadable(this);
        return null;
    }
    n1 = howMuchToRead(n1, state2);
    if (n1 === 0 && state2.ended) {
        if (state2.length === 0) endReadable(this);
        return null;
    }
    var doRead = state2.needReadable;
    debug("need readable", doRead);
    if (state2.length === 0 || state2.length - n1 < state2.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
    }
    if (state2.ended || state2.reading) {
        doRead = false;
        debug("reading or ended", doRead);
    } else if (doRead) {
        debug("do read");
        state2.reading = true;
        state2.sync = true;
        if (state2.length === 0) state2.needReadable = true;
        this._read(state2.highWaterMark);
        state2.sync = false;
        if (!state2.reading) n1 = howMuchToRead(nOrig, state2);
    }
    var ret;
    if (n1 > 0) ret = fromList(n1, state2);
    else ret = null;
    if (ret === null) {
        state2.needReadable = state2.length <= state2.highWaterMark;
        n1 = 0;
    } else {
        state2.length -= n1;
        state2.awaitDrain = 0;
    }
    if (state2.length === 0) {
        if (!state2.ended) state2.needReadable = true;
        if (nOrig !== n1 && state2.ended) endReadable(this);
    }
    if (ret !== null) this.emit("data", ret);
    return ret;
};
function onEofChunk(stream, state2) {
    debug("onEofChunk");
    if (state2.ended) return;
    if (state2.decoder) {
        var chunk = state2.decoder.end();
        if (chunk && chunk.length) {
            state2.buffer.push(chunk);
            state2.length += state2.objectMode ? 1 : chunk.length;
        }
    }
    state2.ended = true;
    if (state2.sync) {
        emitReadable(stream);
    } else {
        state2.needReadable = false;
        if (!state2.emittedReadable) {
            state2.emittedReadable = true;
            emitReadable_(stream);
        }
    }
}
function emitReadable(stream) {
    var state2 = stream._readableState;
    debug("emitReadable", state2.needReadable, state2.emittedReadable);
    state2.needReadable = false;
    if (!state2.emittedReadable) {
        debug("emitReadable", state2.flowing);
        state2.emittedReadable = true;
        process.nextTick(emitReadable_, stream);
    }
}
function emitReadable_(stream) {
    var state2 = stream._readableState;
    debug("emitReadable_", state2.destroyed, state2.length, state2.ended);
    if (!state2.destroyed && (state2.length || state2.ended)) {
        stream.emit("readable");
        state2.emittedReadable = false;
    }
    state2.needReadable = !state2.flowing && !state2.ended && state2.length <= state2.highWaterMark;
    flow(stream);
}
function maybeReadMore(stream, state2) {
    if (!state2.readingMore) {
        state2.readingMore = true;
        process.nextTick(maybeReadMore_, stream, state2);
    }
}
function maybeReadMore_(stream, state2) {
    while(!state2.reading && !state2.ended && (state2.length < state2.highWaterMark || state2.flowing && state2.length === 0)){
        var len = state2.length;
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state2.length) break;
    }
    state2.readingMore = false;
}
Readable.prototype._read = function(n1) {
    errorOrDestroy$2(this, new ERR_METHOD_NOT_IMPLEMENTED$1("_read()"));
};
Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state2 = this._readableState;
    switch(state2.pipesCount){
        case 0:
            state2.pipes = dest;
            break;
        case 1:
            state2.pipes = [
                state2.pipes,
                dest
            ];
            break;
        default:
            state2.pipes.push(dest);
            break;
    }
    state2.pipesCount += 1;
    debug("pipe count=%d opts=%j", state2.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend2 : unpipe;
    if (state2.endEmitted) process.nextTick(endFn);
    else src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
            if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
                unpipeInfo.hasUnpiped = true;
                cleanup();
            }
        }
    }
    function onend2() {
        debug("onend");
        dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend2);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state2.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }
    src.on("data", ondata);
    function ondata(chunk) {
        debug("ondata");
        var ret = dest.write(chunk);
        debug("dest.write", ret);
        if (ret === false) {
            if ((state2.pipesCount === 1 && state2.pipes === dest || state2.pipesCount > 1 && indexOf2(state2.pipes, dest) !== -1) && !cleanedUp) {
                debug("false write response, pause", state2.awaitDrain);
                state2.awaitDrain++;
            }
            src.pause();
        }
    }
    function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0) errorOrDestroy$2(dest, er);
    }
    prependListener2(dest, "error", onerror);
    function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state2.flowing) {
        debug("pipe resume");
        src.resume();
    }
    return dest;
};
function pipeOnDrain(src) {
    return function pipeOnDrainFunctionResult() {
        var state2 = src._readableState;
        debug("pipeOnDrain", state2.awaitDrain);
        if (state2.awaitDrain) state2.awaitDrain--;
        if (state2.awaitDrain === 0 && EElistenerCount(src, "data")) {
            state2.flowing = true;
            flow(src);
        }
    };
}
Readable.prototype.unpipe = function(dest) {
    var state2 = this._readableState;
    var unpipeInfo = {
        hasUnpiped: false
    };
    if (state2.pipesCount === 0) return this;
    if (state2.pipesCount === 1) {
        if (dest && dest !== state2.pipes) return this;
        if (!dest) dest = state2.pipes;
        state2.pipes = null;
        state2.pipesCount = 0;
        state2.flowing = false;
        if (dest) dest.emit("unpipe", this, unpipeInfo);
        return this;
    }
    if (!dest) {
        var dests = state2.pipes;
        var len = state2.pipesCount;
        state2.pipes = null;
        state2.pipesCount = 0;
        state2.flowing = false;
        for(var i14 = 0; i14 < len; i14++){
            dests[i14].emit("unpipe", this, {
                hasUnpiped: false
            });
        }
        return this;
    }
    var index4 = indexOf2(state2.pipes, dest);
    if (index4 === -1) return this;
    state2.pipes.splice(index4, 1);
    state2.pipesCount -= 1;
    if (state2.pipesCount === 1) state2.pipes = state2.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
};
Readable.prototype.on = function(ev, fn) {
    var res = streamBrowser.prototype.on.call(this, ev, fn);
    var state2 = this._readableState;
    if (ev === "data") {
        state2.readableListening = this.listenerCount("readable") > 0;
        if (state2.flowing !== false) this.resume();
    } else if (ev === "readable") {
        if (!state2.endEmitted && !state2.readableListening) {
            state2.readableListening = state2.needReadable = true;
            state2.flowing = false;
            state2.emittedReadable = false;
            debug("on readable", state2.length, state2.reading);
            if (state2.length) {
                emitReadable(this);
            } else if (!state2.reading) {
                process.nextTick(nReadingNextTick, this);
            }
        }
    }
    return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function(ev, fn) {
    var res = streamBrowser.prototype.removeListener.call(this, ev, fn);
    if (ev === "readable") {
        process.nextTick(updateReadableListening, this);
    }
    return res;
};
Readable.prototype.removeAllListeners = function(ev) {
    var res = streamBrowser.prototype.removeAllListeners.apply(this, arguments);
    if (ev === "readable" || ev === void 0) {
        process.nextTick(updateReadableListening, this);
    }
    return res;
};
function updateReadableListening(self2) {
    var state2 = self2._readableState;
    state2.readableListening = self2.listenerCount("readable") > 0;
    if (state2.resumeScheduled && !state2.paused) {
        state2.flowing = true;
    } else if (self2.listenerCount("data") > 0) {
        self2.resume();
    }
}
function nReadingNextTick(self2) {
    debug("readable nexttick read 0");
    self2.read(0);
}
Readable.prototype.resume = function() {
    var state2 = this._readableState;
    if (!state2.flowing) {
        debug("resume");
        state2.flowing = !state2.readableListening;
        resume(this, state2);
    }
    state2.paused = false;
    return this;
};
function resume(stream, state2) {
    if (!state2.resumeScheduled) {
        state2.resumeScheduled = true;
        process.nextTick(resume_, stream, state2);
    }
}
function resume_(stream, state2) {
    debug("resume", state2.reading);
    if (!state2.reading) {
        stream.read(0);
    }
    state2.resumeScheduled = false;
    stream.emit("resume");
    flow(stream);
    if (state2.flowing && !state2.reading) stream.read(0);
}
Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
    }
    this._readableState.paused = true;
    return this;
};
function flow(stream) {
    var state2 = stream._readableState;
    debug("flow", state2.flowing);
    while(state2.flowing && stream.read() !== null){
    }
}
Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state2 = this._readableState;
    var paused = false;
    stream.on("end", function() {
        debug("wrapped end");
        if (state2.decoder && !state2.ended) {
            var chunk = state2.decoder.end();
            if (chunk && chunk.length) _this.push(chunk);
        }
        _this.push(null);
    });
    stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state2.decoder) chunk = state2.decoder.write(chunk);
        if (state2.objectMode && (chunk === null || chunk === void 0)) return;
        else if (!state2.objectMode && (!chunk || !chunk.length)) return;
        var ret = _this.push(chunk);
        if (!ret) {
            paused = true;
            stream.pause();
        }
    });
    for(var i15 in stream){
        if (this[i15] === void 0 && typeof stream[i15] === "function") {
            this[i15] = (function methodWrap(method) {
                return function methodWrapReturnFunction() {
                    return stream[method].apply(stream, arguments);
                };
            })(i15);
        }
    }
    for(var n1 = 0; n1 < kProxyEvents.length; n1++){
        stream.on(kProxyEvents[n1], this.emit.bind(this, kProxyEvents[n1]));
    }
    this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
            paused = false;
            stream.resume();
        }
    };
    return this;
};
if (typeof Symbol === "function") {
    Readable.prototype[Symbol.asyncIterator] = function() {
        if (createReadableStreamAsyncIterator$1 === void 0) {
            createReadableStreamAsyncIterator$1 = async_iterator;
        }
        return createReadableStreamAsyncIterator$1(this);
    };
}
Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    enumerable: false,
    get: function get10() {
        return this._readableState.highWaterMark;
    }
});
Object.defineProperty(Readable.prototype, "readableBuffer", {
    enumerable: false,
    get: function get11() {
        return this._readableState && this._readableState.buffer;
    }
});
Object.defineProperty(Readable.prototype, "readableFlowing", {
    enumerable: false,
    get: function get12() {
        return this._readableState.flowing;
    },
    set: function set4(state2) {
        if (this._readableState) {
            this._readableState.flowing = state2;
        }
    }
});
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, "readableLength", {
    enumerable: false,
    get: function get13() {
        return this._readableState.length;
    }
});
function fromList(n1, state2) {
    if (state2.length === 0) return null;
    var ret;
    if (state2.objectMode) ret = state2.buffer.shift();
    else if (!n1 || n1 >= state2.length) {
        if (state2.decoder) ret = state2.buffer.join("");
        else if (state2.buffer.length === 1) ret = state2.buffer.first();
        else ret = state2.buffer.concat(state2.length);
        state2.buffer.clear();
    } else {
        ret = state2.buffer.consume(n1, state2.decoder);
    }
    return ret;
}
function endReadable(stream) {
    var state2 = stream._readableState;
    debug("endReadable", state2.endEmitted);
    if (!state2.endEmitted) {
        state2.ended = true;
        process.nextTick(endReadableNT, state2, stream);
    }
}
function endReadableNT(state2, stream) {
    debug("endReadableNT", state2.endEmitted, state2.length);
    if (!state2.endEmitted && state2.length === 0) {
        state2.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
        if (state2.autoDestroy) {
            var wState = stream._writableState;
            if (!wState || wState.autoDestroy && wState.finished) {
                stream.destroy();
            }
        }
    }
}
if (typeof Symbol === "function") {
    Readable.from = function(iterable, opts) {
        if (from$1 === void 0) {
            from$1 = fromBrowser;
        }
        return from$1(Readable, iterable, opts);
    };
}
function indexOf2(xs, x) {
    for(var i15 = 0, l = xs.length; i15 < l; i15++){
        if (xs[i15] === x) return i15;
    }
    return -1;
}
var _stream_transform = Transform;
var _require$codes$2 = errorsBrowser.codes, ERR_METHOD_NOT_IMPLEMENTED$2 = _require$codes$2.ERR_METHOD_NOT_IMPLEMENTED, ERR_MULTIPLE_CALLBACK$1 = _require$codes$2.ERR_MULTIPLE_CALLBACK, ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes$2.ERR_TRANSFORM_ALREADY_TRANSFORMING, ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes$2.ERR_TRANSFORM_WITH_LENGTH_0;
inherits_browser(Transform, _stream_duplex);
function afterTransform(er, data) {
    var ts = this._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (cb === null) {
        return this.emit("error", new ERR_MULTIPLE_CALLBACK$1());
    }
    ts.writechunk = null;
    ts.writecb = null;
    if (data != null) this.push(data);
    cb(er);
    var rs = this._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
    }
}
function Transform(options3) {
    if (!(this instanceof Transform)) return new Transform(options3);
    _stream_duplex.call(this, options3);
    this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
    };
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options3) {
        if (typeof options3.transform === "function") this._transform = options3.transform;
        if (typeof options3.flush === "function") this._flush = options3.flush;
    }
    this.on("prefinish", prefinish$1);
}
function prefinish$1() {
    var _this = this;
    if (typeof this._flush === "function" && !this._readableState.destroyed) {
        this._flush(function(er, data) {
            done(_this, er, data);
        });
    } else {
        done(this, null, null);
    }
}
Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return _stream_duplex.prototype.push.call(this, chunk, encoding);
};
Transform.prototype._transform = function(chunk, encoding, cb) {
    cb(new ERR_METHOD_NOT_IMPLEMENTED$2("_transform()"));
};
Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
};
Transform.prototype._read = function(n1) {
    var ts = this._transformState;
    if (ts.writechunk !== null && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
        ts.needTransform = true;
    }
};
Transform.prototype._destroy = function(err, cb) {
    _stream_duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
    });
};
function done(stream, er, data) {
    if (er) return stream.emit("error", er);
    if (data != null) stream.push(data);
    if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
    if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
    return stream.push(null);
}
var _stream_passthrough = PassThrough;
inherits_browser(PassThrough, _stream_transform);
function PassThrough(options3) {
    if (!(this instanceof PassThrough)) return new PassThrough(options3);
    _stream_transform.call(this, options3);
}
PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
};
var eos$1;
function once$2(callback) {
    var called = false;
    return function() {
        if (called) return;
        called = true;
        callback.apply(void 0, arguments);
    };
}
var _require$codes$3 = errorsBrowser.codes, ERR_MISSING_ARGS = _require$codes$3.ERR_MISSING_ARGS, ERR_STREAM_DESTROYED$1 = _require$codes$3.ERR_STREAM_DESTROYED;
function noop$2(err) {
    if (err) throw err;
}
function isRequest$1(stream) {
    return stream.setHeader && typeof stream.abort === "function";
}
function destroyer(stream, reading, writing, callback) {
    callback = once$2(callback);
    var closed = false;
    stream.on("close", function() {
        closed = true;
    });
    if (eos$1 === void 0) eos$1 = endOfStream;
    eos$1(stream, {
        readable: reading,
        writable: writing
    }, function(err) {
        if (err) return callback(err);
        closed = true;
        callback();
    });
    var destroyed = false;
    return function(err) {
        if (closed) return;
        if (destroyed) return;
        destroyed = true;
        if (isRequest$1(stream)) return stream.abort();
        if (typeof stream.destroy === "function") return stream.destroy();
        callback(err || new ERR_STREAM_DESTROYED$1("pipe"));
    };
}
function call(fn) {
    fn();
}
function pipe1(from21, to) {
    return from21.pipe(to);
}
function popCallback(streams) {
    if (!streams.length) return noop$2;
    if (typeof streams[streams.length - 1] !== "function") return noop$2;
    return streams.pop();
}
function pipeline() {
    for(var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++){
        streams[_key] = arguments[_key];
    }
    var callback = popCallback(streams);
    if (Array.isArray(streams[0])) streams = streams[0];
    if (streams.length < 2) {
        throw new ERR_MISSING_ARGS("streams");
    }
    var error;
    var destroys = streams.map(function(stream, i15) {
        var reading = i15 < streams.length - 1;
        var writing = i15 > 0;
        return destroyer(stream, reading, writing, function(err) {
            if (!error) error = err;
            if (err) destroys.forEach(call);
            if (reading) return;
            destroys.forEach(call);
            callback(error);
        });
    });
    return streams.reduce(pipe1);
}
var pipeline_1 = pipeline;
var readableBrowser = createCommonjsModule2(function(module, exports) {
    exports = module.exports = _stream_readable;
    exports.Stream = exports;
    exports.Readable = exports;
    exports.Writable = _stream_writable;
    exports.Duplex = _stream_duplex;
    exports.Transform = _stream_transform;
    exports.PassThrough = _stream_passthrough;
    exports.finished = endOfStream;
    exports.pipeline = pipeline_1;
});
var global$12 = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {
};
var lookup2 = [];
var revLookup2 = [];
var Arr2 = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
var inited2 = false;
function init3() {
    inited2 = true;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for(var i15 = 0, len = code.length; i15 < len; ++i15){
        lookup2[i15] = code[i15];
        revLookup2[code.charCodeAt(i15)] = i15;
    }
    revLookup2["-".charCodeAt(0)] = 62;
    revLookup2["_".charCodeAt(0)] = 63;
}
function toByteArray2(b64) {
    if (!inited2) {
        init3();
    }
    var i15, j, l, tmp, placeHolders, arr;
    var len = b64.length;
    if (len % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
    }
    placeHolders = b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
    arr = new Arr2(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for(i15 = 0, j = 0; i15 < l; i15 += 4, j += 3){
        tmp = revLookup2[b64.charCodeAt(i15)] << 18 | revLookup2[b64.charCodeAt(i15 + 1)] << 12 | revLookup2[b64.charCodeAt(i15 + 2)] << 6 | revLookup2[b64.charCodeAt(i15 + 3)];
        arr[L++] = tmp >> 16 & 255;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    if (placeHolders === 2) {
        tmp = revLookup2[b64.charCodeAt(i15)] << 2 | revLookup2[b64.charCodeAt(i15 + 1)] >> 4;
        arr[L++] = tmp & 255;
    } else if (placeHolders === 1) {
        tmp = revLookup2[b64.charCodeAt(i15)] << 10 | revLookup2[b64.charCodeAt(i15 + 1)] << 4 | revLookup2[b64.charCodeAt(i15 + 2)] >> 2;
        arr[L++] = tmp >> 8 & 255;
        arr[L++] = tmp & 255;
    }
    return arr;
}
function tripletToBase642(num) {
    return lookup2[num >> 18 & 63] + lookup2[num >> 12 & 63] + lookup2[num >> 6 & 63] + lookup2[num & 63];
}
function encodeChunk2(uint8, start, end2) {
    var tmp;
    var output = [];
    for(var i15 = start; i15 < end2; i15 += 3){
        tmp = (uint8[i15] << 16) + (uint8[i15 + 1] << 8) + uint8[i15 + 2];
        output.push(tripletToBase642(tmp));
    }
    return output.join("");
}
function fromByteArray2(uint8) {
    if (!inited2) {
        init3();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = "";
    var parts1 = [];
    var maxChunkLength = 16383;
    for(var i15 = 0, len2 = len - extraBytes; i15 < len2; i15 += maxChunkLength){
        parts1.push(encodeChunk2(uint8, i15, i15 + maxChunkLength > len2 ? len2 : i15 + maxChunkLength));
    }
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        output += lookup2[tmp >> 2];
        output += lookup2[tmp << 4 & 63];
        output += "==";
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        output += lookup2[tmp >> 10];
        output += lookup2[tmp >> 4 & 63];
        output += lookup2[tmp << 2 & 63];
        output += "=";
    }
    parts1.push(output);
    return parts1.join("");
}
function read2(buffer, offset2, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i15 = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset2 + i15];
    i15 += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset2 + i15], i15 += d, nBits -= 8){
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset2 + i15], i15 += d, nBits -= 8){
    }
    if (e === 0) {
        e = 1 - eBias;
    } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
}
function write3(buffer, value, offset2, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i15 = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) {
            value += rt / c;
        } else {
            value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset2 + i15] = m & 255, i15 += d, m /= 256, mLen -= 8){
    }
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset2 + i15] = e & 255, i15 += d, e /= 256, eLen -= 8){
    }
    buffer[offset2 + i15 - d] |= s * 128;
}
var toString3 = {
}.toString;
var isArray2 = Array.isArray || function(arr) {
    return toString3.call(arr) == "[object Array]";
};
var INSPECT_MAX_BYTES2 = 50;
Buffer4.TYPED_ARRAY_SUPPORT = global$12.TYPED_ARRAY_SUPPORT !== void 0 ? global$12.TYPED_ARRAY_SUPPORT : true;
function kMaxLength3() {
    return Buffer4.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function createBuffer2(that, length1) {
    if (kMaxLength3() < length1) {
        throw new RangeError("Invalid typed array length");
    }
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        that = new Uint8Array(length1);
        that.__proto__ = Buffer4.prototype;
    } else {
        if (that === null) {
            that = new Buffer4(length1);
        }
        that.length = length1;
    }
    return that;
}
function Buffer4(arg, encodingOrOffset, length1) {
    if (!Buffer4.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer4)) {
        return new Buffer4(arg, encodingOrOffset, length1);
    }
    if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
            throw new Error("If encoding is specified then the first argument must be a string");
        }
        return allocUnsafe3(this, arg);
    }
    return from3(this, arg, encodingOrOffset, length1);
}
Buffer4.poolSize = 8192;
Buffer4._augment = function(arr) {
    arr.__proto__ = Buffer4.prototype;
    return arr;
};
function from3(that, value, encodingOrOffset, length1) {
    if (typeof value === "number") {
        throw new TypeError('"value" argument must not be a number');
    }
    if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
        return fromArrayBuffer3(that, value, encodingOrOffset, length1);
    }
    if (typeof value === "string") {
        return fromString3(that, value, encodingOrOffset);
    }
    return fromObject3(that, value);
}
Buffer4.from = function(value, encodingOrOffset, length1) {
    return from3(null, value, encodingOrOffset, length1);
};
if (Buffer4.TYPED_ARRAY_SUPPORT) {
    Buffer4.prototype.__proto__ = Uint8Array.prototype;
    Buffer4.__proto__ = Uint8Array;
}
function assertSize2(size) {
    if (typeof size !== "number") {
        throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative');
    }
}
function alloc2(that, size, fill2, encoding) {
    assertSize2(size);
    if (size <= 0) {
        return createBuffer2(that, size);
    }
    if (fill2 !== void 0) {
        return typeof encoding === "string" ? createBuffer2(that, size).fill(fill2, encoding) : createBuffer2(that, size).fill(fill2);
    }
    return createBuffer2(that, size);
}
Buffer4.alloc = function(size, fill2, encoding) {
    return alloc2(null, size, fill2, encoding);
};
function allocUnsafe3(that, size) {
    assertSize2(size);
    that = createBuffer2(that, size < 0 ? 0 : checked3(size) | 0);
    if (!Buffer4.TYPED_ARRAY_SUPPORT) {
        for(var i15 = 0; i15 < size; ++i15){
            that[i15] = 0;
        }
    }
    return that;
}
Buffer4.allocUnsafe = function(size) {
    return allocUnsafe3(null, size);
};
Buffer4.allocUnsafeSlow = function(size) {
    return allocUnsafe3(null, size);
};
function fromString3(that, string1, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
    }
    if (!Buffer4.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding');
    }
    var length1 = byteLength3(string1, encoding) | 0;
    that = createBuffer2(that, length1);
    var actual = that.write(string1, encoding);
    if (actual !== length1) {
        that = that.slice(0, actual);
    }
    return that;
}
function fromArrayLike2(that, array) {
    var length1 = array.length < 0 ? 0 : checked3(array.length) | 0;
    that = createBuffer2(that, length1);
    for(var i16 = 0; i16 < length1; i16 += 1){
        that[i16] = array[i16] & 255;
    }
    return that;
}
function fromArrayBuffer3(that, array, byteOffset, length1) {
    array.byteLength;
    if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError("'offset' is out of bounds");
    }
    if (array.byteLength < byteOffset + (length1 || 0)) {
        throw new RangeError("'length' is out of bounds");
    }
    if (byteOffset === void 0 && length1 === void 0) {
        array = new Uint8Array(array);
    } else if (length1 === void 0) {
        array = new Uint8Array(array, byteOffset);
    } else {
        array = new Uint8Array(array, byteOffset, length1);
    }
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        that = array;
        that.__proto__ = Buffer4.prototype;
    } else {
        that = fromArrayLike2(that, array);
    }
    return that;
}
function fromObject3(that, obj) {
    if (internalIsBuffer3(obj)) {
        var len = checked3(obj.length) | 0;
        that = createBuffer2(that, len);
        if (that.length === 0) {
            return that;
        }
        obj.copy(that, 0, 0, len);
        return that;
    }
    if (obj) {
        if (typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if (typeof obj.length !== "number" || isnan3(obj.length)) {
                return createBuffer2(that, 0);
            }
            return fromArrayLike2(that, obj);
        }
        if (obj.type === "Buffer" && isArray2(obj.data)) {
            return fromArrayLike2(that, obj.data);
        }
    }
    throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function checked3(length1) {
    if (length1 >= kMaxLength3()) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength3().toString(16) + " bytes");
    }
    return length1 | 0;
}
Buffer4.isBuffer = isBuffer3;
function internalIsBuffer3(b) {
    return !!(b != null && b._isBuffer);
}
Buffer4.compare = function compare3(a, b) {
    if (!internalIsBuffer3(a) || !internalIsBuffer3(b)) {
        throw new TypeError("Arguments must be Buffers");
    }
    if (a === b) return 0;
    var x = a.length;
    var y = b.length;
    for(var i16 = 0, len = Math.min(x, y); i16 < len; ++i16){
        if (a[i16] !== b[i16]) {
            x = a[i16];
            y = b[i16];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
Buffer4.isEncoding = function isEncoding3(encoding) {
    switch(String(encoding).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return true;
        default:
            return false;
    }
};
Buffer4.concat = function concat2(list, length1) {
    if (!isArray2(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
        return Buffer4.alloc(0);
    }
    var i16;
    if (length1 === void 0) {
        length1 = 0;
        for(i16 = 0; i16 < list.length; ++i16){
            length1 += list[i16].length;
        }
    }
    var buffer = Buffer4.allocUnsafe(length1);
    var pos = 0;
    for(i16 = 0; i16 < list.length; ++i16){
        var buf = list[i16];
        if (!internalIsBuffer3(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
        }
        buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function byteLength3(string1, encoding) {
    if (internalIsBuffer3(string1)) {
        return string1.length;
    }
    if (typeof ArrayBuffer !== "undefined" && typeof ArrayBuffer.isView === "function" && (ArrayBuffer.isView(string1) || string1 instanceof ArrayBuffer)) {
        return string1.byteLength;
    }
    if (typeof string1 !== "string") {
        string1 = "" + string1;
    }
    var len = string1.length;
    if (len === 0) return 0;
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "ascii":
            case "latin1":
            case "binary":
                return len;
            case "utf8":
            case "utf-8":
            case void 0:
                return utf8ToBytes3(string1).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return len * 2;
            case "hex":
                return len >>> 1;
            case "base64":
                return base64ToBytes3(string1).length;
            default:
                if (loweredCase) return utf8ToBytes3(string1).length;
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer4.byteLength = byteLength3;
function slowToString2(encoding, start, end2) {
    var loweredCase = false;
    if (start === void 0 || start < 0) {
        start = 0;
    }
    if (start > this.length) {
        return "";
    }
    if (end2 === void 0 || end2 > this.length) {
        end2 = this.length;
    }
    if (end2 <= 0) {
        return "";
    }
    end2 >>>= 0;
    start >>>= 0;
    if (end2 <= start) {
        return "";
    }
    if (!encoding) encoding = "utf8";
    while(true){
        switch(encoding){
            case "hex":
                return hexSlice3(this, start, end2);
            case "utf8":
            case "utf-8":
                return utf8Slice3(this, start, end2);
            case "ascii":
                return asciiSlice3(this, start, end2);
            case "latin1":
            case "binary":
                return latin1Slice3(this, start, end2);
            case "base64":
                return base64Slice3(this, start, end2);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return utf16leSlice3(this, start, end2);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = (encoding + "").toLowerCase();
                loweredCase = true;
        }
    }
}
Buffer4.prototype._isBuffer = true;
function swap2(b, n1, m) {
    var i16 = b[n1];
    b[n1] = b[m];
    b[m] = i16;
}
Buffer4.prototype.swap16 = function swap162() {
    var len = this.length;
    if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for(var i16 = 0; i16 < len; i16 += 2){
        swap2(this, i16, i16 + 1);
    }
    return this;
};
Buffer4.prototype.swap32 = function swap322() {
    var len = this.length;
    if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for(var i16 = 0; i16 < len; i16 += 4){
        swap2(this, i16, i16 + 3);
        swap2(this, i16 + 1, i16 + 2);
    }
    return this;
};
Buffer4.prototype.swap64 = function swap642() {
    var len = this.length;
    if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for(var i16 = 0; i16 < len; i16 += 8){
        swap2(this, i16, i16 + 7);
        swap2(this, i16 + 1, i16 + 6);
        swap2(this, i16 + 2, i16 + 5);
        swap2(this, i16 + 3, i16 + 4);
    }
    return this;
};
Buffer4.prototype.toString = function toString22() {
    var length1 = this.length | 0;
    if (length1 === 0) return "";
    if (arguments.length === 0) return utf8Slice3(this, 0, length1);
    return slowToString2.apply(this, arguments);
};
Buffer4.prototype.equals = function equals2(b) {
    if (!internalIsBuffer3(b)) throw new TypeError("Argument must be a Buffer");
    if (this === b) return true;
    return Buffer4.compare(this, b) === 0;
};
Buffer4.prototype.inspect = function inspect3() {
    var str = "";
    var max = INSPECT_MAX_BYTES2;
    if (this.length > 0) {
        str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
        if (this.length > max) str += " ... ";
    }
    return "<Buffer " + str + ">";
};
Buffer4.prototype.compare = function compare22(target, start, end2, thisStart, thisEnd) {
    if (!internalIsBuffer3(target)) {
        throw new TypeError("Argument must be a Buffer");
    }
    if (start === void 0) {
        start = 0;
    }
    if (end2 === void 0) {
        end2 = target ? target.length : 0;
    }
    if (thisStart === void 0) {
        thisStart = 0;
    }
    if (thisEnd === void 0) {
        thisEnd = this.length;
    }
    if (start < 0 || end2 > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end2) {
        return 0;
    }
    if (thisStart >= thisEnd) {
        return -1;
    }
    if (start >= end2) {
        return 1;
    }
    start >>>= 0;
    end2 >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    var x = thisEnd - thisStart;
    var y = end2 - start;
    var len = Math.min(x, y);
    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end2);
    for(var i16 = 0; i16 < len; ++i16){
        if (thisCopy[i16] !== targetCopy[i16]) {
            x = thisCopy[i16];
            y = targetCopy[i16];
            break;
        }
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
function bidirectionalIndexOf2(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0) return -1;
    if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (isNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    if (typeof val === "string") {
        val = Buffer4.from(val, encoding);
    }
    if (internalIsBuffer3(val)) {
        if (val.length === 0) {
            return -1;
        }
        return arrayIndexOf3(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
        val = val & 255;
        if (Buffer4.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
                return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
                return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
        }
        return arrayIndexOf3(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf3(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;
    if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
                return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read21(buf, i21) {
        if (indexSize === 1) {
            return buf[i21];
        } else {
            return buf.readUInt16BE(i21 * indexSize);
        }
    }
    var i16;
    if (dir) {
        var foundIndex = -1;
        for(i16 = byteOffset; i16 < arrLength; i16++){
            if (read21(arr, i16) === read21(val, foundIndex === -1 ? 0 : i16 - foundIndex)) {
                if (foundIndex === -1) foundIndex = i16;
                if (i16 - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
                if (foundIndex !== -1) i16 -= i16 - foundIndex;
                foundIndex = -1;
            }
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i16 = byteOffset; i16 >= 0; i16--){
            var found = true;
            for(var j = 0; j < valLength; j++){
                if (read21(arr, i16 + j) !== read21(val, j)) {
                    found = false;
                    break;
                }
            }
            if (found) return i16;
        }
    }
    return -1;
}
Buffer4.prototype.includes = function includes3(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer4.prototype.indexOf = function indexOf3(val, byteOffset, encoding) {
    return bidirectionalIndexOf2(this, val, byteOffset, encoding, true);
};
Buffer4.prototype.lastIndexOf = function lastIndexOf2(val, byteOffset, encoding) {
    return bidirectionalIndexOf2(this, val, byteOffset, encoding, false);
};
function hexWrite2(buf, string1, offset2, length1) {
    offset2 = Number(offset2) || 0;
    var remaining = buf.length - offset2;
    if (!length1) {
        length1 = remaining;
    } else {
        length1 = Number(length1);
        if (length1 > remaining) {
            length1 = remaining;
        }
    }
    var strLen = string1.length;
    if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
    if (length1 > strLen / 2) {
        length1 = strLen / 2;
    }
    for(var i16 = 0; i16 < length1; ++i16){
        var parsed = parseInt(string1.substr(i16 * 2, 2), 16);
        if (isNaN(parsed)) return i16;
        buf[offset2 + i16] = parsed;
    }
    return i16;
}
function utf8Write2(buf, string1, offset2, length1) {
    return blitBuffer3(utf8ToBytes3(string1, buf.length - offset2), buf, offset2, length1);
}
function asciiWrite2(buf, string1, offset2, length1) {
    return blitBuffer3(asciiToBytes3(string1), buf, offset2, length1);
}
function latin1Write2(buf, string1, offset2, length1) {
    return asciiWrite2(buf, string1, offset2, length1);
}
function base64Write2(buf, string1, offset2, length1) {
    return blitBuffer3(base64ToBytes3(string1), buf, offset2, length1);
}
function ucs2Write2(buf, string1, offset2, length1) {
    return blitBuffer3(utf16leToBytes3(string1, buf.length - offset2), buf, offset2, length1);
}
Buffer4.prototype.write = function write22(string1, offset2, length1, encoding) {
    if (offset2 === void 0) {
        encoding = "utf8";
        length1 = this.length;
        offset2 = 0;
    } else if (length1 === void 0 && typeof offset2 === "string") {
        encoding = offset2;
        length1 = this.length;
        offset2 = 0;
    } else if (isFinite(offset2)) {
        offset2 = offset2 | 0;
        if (isFinite(length1)) {
            length1 = length1 | 0;
            if (encoding === void 0) encoding = "utf8";
        } else {
            encoding = length1;
            length1 = void 0;
        }
    } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    }
    var remaining = this.length - offset2;
    if (length1 === void 0 || length1 > remaining) length1 = remaining;
    if (string1.length > 0 && (length1 < 0 || offset2 < 0) || offset2 > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding) encoding = "utf8";
    var loweredCase = false;
    for(;;){
        switch(encoding){
            case "hex":
                return hexWrite2(this, string1, offset2, length1);
            case "utf8":
            case "utf-8":
                return utf8Write2(this, string1, offset2, length1);
            case "ascii":
                return asciiWrite2(this, string1, offset2, length1);
            case "latin1":
            case "binary":
                return latin1Write2(this, string1, offset2, length1);
            case "base64":
                return base64Write2(this, string1, offset2, length1);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
                return ucs2Write2(this, string1, offset2, length1);
            default:
                if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                encoding = ("" + encoding).toLowerCase();
                loweredCase = true;
        }
    }
};
Buffer4.prototype.toJSON = function toJSON2() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function base64Slice3(buf, start, end2) {
    if (start === 0 && end2 === buf.length) {
        return fromByteArray2(buf);
    } else {
        return fromByteArray2(buf.slice(start, end2));
    }
}
function utf8Slice3(buf, start, end2) {
    end2 = Math.min(buf.length, end2);
    var res = [];
    var i16 = start;
    while(i16 < end2){
        var firstByte = buf[i16];
        var codePoint = null;
        var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i16 + bytesPerSequence <= end2) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf[i16 + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf[i16 + 1];
                    thirdByte = buf[i16 + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf[i16 + 1];
                    thirdByte = buf[i16 + 2];
                    fourthByte = buf[i16 + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i16 += bytesPerSequence;
    }
    return decodeCodePointsArray3(res);
}
var MAX_ARGUMENTS_LENGTH2 = 4096;
function decodeCodePointsArray3(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH2) {
        return String.fromCharCode.apply(String, codePoints);
    }
    var res = "";
    var i16 = 0;
    while(i16 < len){
        res += String.fromCharCode.apply(String, codePoints.slice(i16, i16 += MAX_ARGUMENTS_LENGTH2));
    }
    return res;
}
function asciiSlice3(buf, start, end2) {
    var ret = "";
    end2 = Math.min(buf.length, end2);
    for(var i16 = start; i16 < end2; ++i16){
        ret += String.fromCharCode(buf[i16] & 127);
    }
    return ret;
}
function latin1Slice3(buf, start, end2) {
    var ret = "";
    end2 = Math.min(buf.length, end2);
    for(var i16 = start; i16 < end2; ++i16){
        ret += String.fromCharCode(buf[i16]);
    }
    return ret;
}
function hexSlice3(buf, start, end2) {
    var len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end2 || end2 < 0 || end2 > len) end2 = len;
    var out = "";
    for(var i16 = start; i16 < end2; ++i16){
        out += toHex3(buf[i16]);
    }
    return out;
}
function utf16leSlice3(buf, start, end2) {
    var bytes = buf.slice(start, end2);
    var res = "";
    for(var i16 = 0; i16 < bytes.length; i16 += 2){
        res += String.fromCharCode(bytes[i16] + bytes[i16 + 1] * 256);
    }
    return res;
}
Buffer4.prototype.slice = function slice2(start, end2) {
    var len = this.length;
    start = ~~start;
    end2 = end2 === void 0 ? len : ~~end2;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) {
        start = len;
    }
    if (end2 < 0) {
        end2 += len;
        if (end2 < 0) end2 = 0;
    } else if (end2 > len) {
        end2 = len;
    }
    if (end2 < start) end2 = start;
    var newBuf;
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end2);
        newBuf.__proto__ = Buffer4.prototype;
    } else {
        var sliceLen = end2 - start;
        newBuf = new Buffer4(sliceLen, void 0);
        for(var i16 = 0; i16 < sliceLen; ++i16){
            newBuf[i16] = this[i16 + start];
        }
    }
    return newBuf;
};
function checkOffset2(offset2, ext, length1) {
    if (offset2 % 1 !== 0 || offset2 < 0) throw new RangeError("offset is not uint");
    if (offset2 + ext > length1) throw new RangeError("Trying to access beyond buffer length");
}
Buffer4.prototype.readUIntLE = function readUIntLE2(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset2(offset2, byteLength21, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i17 = 0;
    while((++i17) < byteLength21 && (mul1 *= 256)){
        val += this[offset2 + i17] * mul1;
    }
    return val;
};
Buffer4.prototype.readUIntBE = function readUIntBE2(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        checkOffset2(offset2, byteLength21, this.length);
    }
    var val = this[offset2 + --byteLength21];
    var mul1 = 1;
    while(byteLength21 > 0 && (mul1 *= 256)){
        val += this[offset2 + --byteLength21] * mul1;
    }
    return val;
};
Buffer4.prototype.readUInt8 = function readUInt82(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 1, this.length);
    return this[offset2];
};
Buffer4.prototype.readUInt16LE = function readUInt16LE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 2, this.length);
    return this[offset2] | this[offset2 + 1] << 8;
};
Buffer4.prototype.readUInt16BE = function readUInt16BE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 2, this.length);
    return this[offset2] << 8 | this[offset2 + 1];
};
Buffer4.prototype.readUInt32LE = function readUInt32LE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return (this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16) + this[offset2 + 3] * 16777216;
};
Buffer4.prototype.readUInt32BE = function readUInt32BE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return this[offset2] * 16777216 + (this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3]);
};
Buffer4.prototype.readIntLE = function readIntLE2(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset2(offset2, byteLength21, this.length);
    var val = this[offset2];
    var mul1 = 1;
    var i17 = 0;
    while((++i17) < byteLength21 && (mul1 *= 256)){
        val += this[offset2 + i17] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength21);
    return val;
};
Buffer4.prototype.readIntBE = function readIntBE2(offset2, byteLength21, noAssert) {
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) checkOffset2(offset2, byteLength21, this.length);
    var i17 = byteLength21;
    var mul1 = 1;
    var val = this[offset2 + --i17];
    while(i17 > 0 && (mul1 *= 256)){
        val += this[offset2 + --i17] * mul1;
    }
    mul1 *= 128;
    if (val >= mul1) val -= Math.pow(2, 8 * byteLength21);
    return val;
};
Buffer4.prototype.readInt8 = function readInt82(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 1, this.length);
    if (!(this[offset2] & 128)) return this[offset2];
    return (255 - this[offset2] + 1) * -1;
};
Buffer4.prototype.readInt16LE = function readInt16LE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 2, this.length);
    var val = this[offset2] | this[offset2 + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer4.prototype.readInt16BE = function readInt16BE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 2, this.length);
    var val = this[offset2 + 1] | this[offset2] << 8;
    return val & 32768 ? val | 4294901760 : val;
};
Buffer4.prototype.readInt32LE = function readInt32LE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return this[offset2] | this[offset2 + 1] << 8 | this[offset2 + 2] << 16 | this[offset2 + 3] << 24;
};
Buffer4.prototype.readInt32BE = function readInt32BE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return this[offset2] << 24 | this[offset2 + 1] << 16 | this[offset2 + 2] << 8 | this[offset2 + 3];
};
Buffer4.prototype.readFloatLE = function readFloatLE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return read2(this, offset2, true, 23, 4);
};
Buffer4.prototype.readFloatBE = function readFloatBE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 4, this.length);
    return read2(this, offset2, false, 23, 4);
};
Buffer4.prototype.readDoubleLE = function readDoubleLE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 8, this.length);
    return read2(this, offset2, true, 52, 8);
};
Buffer4.prototype.readDoubleBE = function readDoubleBE2(offset2, noAssert) {
    if (!noAssert) checkOffset2(offset2, 8, this.length);
    return read2(this, offset2, false, 52, 8);
};
function checkInt2(buf, value, offset2, ext, max, min) {
    if (!internalIsBuffer3(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
}
Buffer4.prototype.writeUIntLE = function writeUIntLE2(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength21) - 1;
        checkInt2(this, value, offset2, byteLength21, maxBytes, 0);
    }
    var mul1 = 1;
    var i17 = 0;
    this[offset2] = value & 255;
    while((++i17) < byteLength21 && (mul1 *= 256)){
        this[offset2 + i17] = value / mul1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer4.prototype.writeUIntBE = function writeUIntBE2(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    byteLength21 = byteLength21 | 0;
    if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength21) - 1;
        checkInt2(this, value, offset2, byteLength21, maxBytes, 0);
    }
    var i17 = byteLength21 - 1;
    var mul1 = 1;
    this[offset2 + i17] = value & 255;
    while((--i17) >= 0 && (mul1 *= 256)){
        this[offset2 + i17] = value / mul1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer4.prototype.writeUInt8 = function writeUInt82(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 1, 255, 0);
    if (!Buffer4.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset2] = value & 255;
    return offset2 + 1;
};
function objectWriteUInt162(buf, value, offset2, littleEndian) {
    if (value < 0) value = 65535 + value + 1;
    for(var i17 = 0, j = Math.min(buf.length - offset2, 2); i17 < j; ++i17){
        buf[offset2 + i17] = (value & 255 << 8 * (littleEndian ? i17 : 1 - i17)) >>> (littleEndian ? i17 : 1 - i17) * 8;
    }
}
Buffer4.prototype.writeUInt16LE = function writeUInt16LE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 2, 65535, 0);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt162(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer4.prototype.writeUInt16BE = function writeUInt16BE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 2, 65535, 0);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt162(this, value, offset2, false);
    }
    return offset2 + 2;
};
function objectWriteUInt322(buf, value, offset2, littleEndian) {
    if (value < 0) value = 4294967295 + value + 1;
    for(var i17 = 0, j = Math.min(buf.length - offset2, 4); i17 < j; ++i17){
        buf[offset2 + i17] = value >>> (littleEndian ? i17 : 3 - i17) * 8 & 255;
    }
}
Buffer4.prototype.writeUInt32LE = function writeUInt32LE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 4, 4294967295, 0);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2 + 3] = value >>> 24;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 1] = value >>> 8;
        this[offset2] = value & 255;
    } else {
        objectWriteUInt322(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer4.prototype.writeUInt32BE = function writeUInt32BE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 4, 4294967295, 0);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt322(this, value, offset2, false);
    }
    return offset2 + 4;
};
Buffer4.prototype.writeIntLE = function writeIntLE2(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength21 - 1);
        checkInt2(this, value, offset2, byteLength21, limit - 1, -limit);
    }
    var i17 = 0;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2] = value & 255;
    while((++i17) < byteLength21 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i17 - 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i17] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer4.prototype.writeIntBE = function writeIntBE2(value, offset2, byteLength21, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength21 - 1);
        checkInt2(this, value, offset2, byteLength21, limit - 1, -limit);
    }
    var i17 = byteLength21 - 1;
    var mul1 = 1;
    var sub1 = 0;
    this[offset2 + i17] = value & 255;
    while((--i17) >= 0 && (mul1 *= 256)){
        if (value < 0 && sub1 === 0 && this[offset2 + i17 + 1] !== 0) {
            sub1 = 1;
        }
        this[offset2 + i17] = (value / mul1 >> 0) - sub1 & 255;
    }
    return offset2 + byteLength21;
};
Buffer4.prototype.writeInt8 = function writeInt82(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 1, 127, -128);
    if (!Buffer4.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 255 + value + 1;
    this[offset2] = value & 255;
    return offset2 + 1;
};
Buffer4.prototype.writeInt16LE = function writeInt16LE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 2, 32767, -32768);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
    } else {
        objectWriteUInt162(this, value, offset2, true);
    }
    return offset2 + 2;
};
Buffer4.prototype.writeInt16BE = function writeInt16BE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 2, 32767, -32768);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 8;
        this[offset2 + 1] = value & 255;
    } else {
        objectWriteUInt162(this, value, offset2, false);
    }
    return offset2 + 2;
};
Buffer4.prototype.writeInt32LE = function writeInt32LE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 4, 2147483647, -2147483648);
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value & 255;
        this[offset2 + 1] = value >>> 8;
        this[offset2 + 2] = value >>> 16;
        this[offset2 + 3] = value >>> 24;
    } else {
        objectWriteUInt322(this, value, offset2, true);
    }
    return offset2 + 4;
};
Buffer4.prototype.writeInt32BE = function writeInt32BE2(value, offset2, noAssert) {
    value = +value;
    offset2 = offset2 | 0;
    if (!noAssert) checkInt2(this, value, offset2, 4, 2147483647, -2147483648);
    if (value < 0) value = 4294967295 + value + 1;
    if (Buffer4.TYPED_ARRAY_SUPPORT) {
        this[offset2] = value >>> 24;
        this[offset2 + 1] = value >>> 16;
        this[offset2 + 2] = value >>> 8;
        this[offset2 + 3] = value & 255;
    } else {
        objectWriteUInt322(this, value, offset2, false);
    }
    return offset2 + 4;
};
function checkIEEE7542(buf, value, offset2, ext, max, min) {
    if (offset2 + ext > buf.length) throw new RangeError("Index out of range");
    if (offset2 < 0) throw new RangeError("Index out of range");
}
function writeFloat2(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE7542(buf, value, offset2, 4);
    }
    write3(buf, value, offset2, littleEndian, 23, 4);
    return offset2 + 4;
}
Buffer4.prototype.writeFloatLE = function writeFloatLE2(value, offset2, noAssert) {
    return writeFloat2(this, value, offset2, true, noAssert);
};
Buffer4.prototype.writeFloatBE = function writeFloatBE2(value, offset2, noAssert) {
    return writeFloat2(this, value, offset2, false, noAssert);
};
function writeDouble2(buf, value, offset2, littleEndian, noAssert) {
    if (!noAssert) {
        checkIEEE7542(buf, value, offset2, 8);
    }
    write3(buf, value, offset2, littleEndian, 52, 8);
    return offset2 + 8;
}
Buffer4.prototype.writeDoubleLE = function writeDoubleLE2(value, offset2, noAssert) {
    return writeDouble2(this, value, offset2, true, noAssert);
};
Buffer4.prototype.writeDoubleBE = function writeDoubleBE2(value, offset2, noAssert) {
    return writeDouble2(this, value, offset2, false, noAssert);
};
Buffer4.prototype.copy = function copy3(target, targetStart, start, end2) {
    if (!start) start = 0;
    if (!end2 && end2 !== 0) end2 = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end2 > 0 && end2 < start) end2 = start;
    if (end2 === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
    if (end2 < 0) throw new RangeError("sourceEnd out of bounds");
    if (end2 > this.length) end2 = this.length;
    if (target.length - targetStart < end2 - start) {
        end2 = target.length - targetStart + start;
    }
    var len = end2 - start;
    var i17;
    if (this === target && start < targetStart && targetStart < end2) {
        for(i17 = len - 1; i17 >= 0; --i17){
            target[i17 + targetStart] = this[i17 + start];
        }
    } else if (len < 1000 || !Buffer4.TYPED_ARRAY_SUPPORT) {
        for(i17 = 0; i17 < len; ++i17){
            target[i17 + targetStart] = this[i17 + start];
        }
    } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }
    return len;
};
Buffer4.prototype.fill = function fill2(val, start, end2, encoding) {
    if (typeof val === "string") {
        if (typeof start === "string") {
            encoding = start;
            start = 0;
            end2 = this.length;
        } else if (typeof end2 === "string") {
            encoding = end2;
            end2 = this.length;
        }
        if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
                val = code;
            }
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer4.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
        }
    } else if (typeof val === "number") {
        val = val & 255;
    }
    if (start < 0 || this.length < start || this.length < end2) {
        throw new RangeError("Out of range index");
    }
    if (end2 <= start) {
        return this;
    }
    start = start >>> 0;
    end2 = end2 === void 0 ? this.length : end2 >>> 0;
    if (!val) val = 0;
    var i17;
    if (typeof val === "number") {
        for(i17 = start; i17 < end2; ++i17){
            this[i17] = val;
        }
    } else {
        var bytes = internalIsBuffer3(val) ? val : utf8ToBytes3(new Buffer4(val, encoding).toString());
        var len = bytes.length;
        for(i17 = 0; i17 < end2 - start; ++i17){
            this[i17 + start] = bytes[i17 % len];
        }
    }
    return this;
};
var INVALID_BASE64_RE2 = /[^+\/0-9A-Za-z-_]/g;
function base64clean2(str) {
    str = stringtrim3(str).replace(INVALID_BASE64_RE2, "");
    if (str.length < 2) return "";
    while(str.length % 4 !== 0){
        str = str + "=";
    }
    return str;
}
function stringtrim3(str) {
    if (str.trim) return str.trim();
    return str.replace(/^\s+|\s+$/g, "");
}
function toHex3(n1) {
    if (n1 < 16) return "0" + n1.toString(16);
    return n1.toString(16);
}
function utf8ToBytes3(string1, units) {
    units = units || Infinity;
    var codePoint;
    var length1 = string1.length;
    var leadSurrogate = null;
    var bytes = [];
    for(var i17 = 0; i17 < length1; ++i17){
        codePoint = string1.charCodeAt(i17);
        if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
                if (codePoint > 56319) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                } else if (i17 + 1 === length1) {
                    if ((units -= 3) > -1) bytes.push(239, 191, 189);
                    continue;
                }
                leadSurrogate = codePoint;
                continue;
            }
            if (codePoint < 56320) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                leadSurrogate = codePoint;
                continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
            throw new Error("Invalid code point");
        }
    }
    return bytes;
}
function asciiToBytes3(str) {
    var byteArray = [];
    for(var i17 = 0; i17 < str.length; ++i17){
        byteArray.push(str.charCodeAt(i17) & 255);
    }
    return byteArray;
}
function utf16leToBytes3(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for(var i17 = 0; i17 < str.length; ++i17){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i17);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function base64ToBytes3(str) {
    return toByteArray2(base64clean2(str));
}
function blitBuffer3(src, dst, offset2, length1) {
    for(var i17 = 0; i17 < length1; ++i17){
        if (i17 + offset2 >= dst.length || i17 >= src.length) break;
        dst[i17 + offset2] = src[i17];
    }
    return i17;
}
function isnan3(val) {
    return val !== val;
}
function isBuffer3(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer3(obj) || isSlowBuffer3(obj));
}
function isFastBuffer3(obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
}
function isSlowBuffer3(obj) {
    return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isFastBuffer3(obj.slice(0, 0));
}
function defaultSetTimout1() {
    throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout1() {
    throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout1 = defaultSetTimout1;
var cachedClearTimeout1 = defaultClearTimeout1;
var globalContext1;
if (typeof window !== "undefined") {
    globalContext1 = window;
} else if (typeof self !== "undefined") {
    globalContext1 = self;
} else {
    globalContext1 = {
    };
}
if (typeof globalContext1.setTimeout === "function") {
    cachedSetTimeout1 = setTimeout;
}
if (typeof globalContext1.clearTimeout === "function") {
    cachedClearTimeout1 = clearTimeout;
}
function runTimeout1(fun) {
    if (cachedSetTimeout1 === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout1 === defaultSetTimout1 || !cachedSetTimeout1) && setTimeout) {
        cachedSetTimeout1 = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout1(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout1.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout1.call(this, fun, 0);
        }
    }
}
function runClearTimeout1(marker1) {
    if (cachedClearTimeout1 === clearTimeout) {
        return clearTimeout(marker1);
    }
    if ((cachedClearTimeout1 === defaultClearTimeout1 || !cachedClearTimeout1) && clearTimeout) {
        cachedClearTimeout1 = clearTimeout;
        return clearTimeout(marker1);
    }
    try {
        return cachedClearTimeout1(marker1);
    } catch (e) {
        try {
            return cachedClearTimeout1.call(null, marker1);
        } catch (e2) {
            return cachedClearTimeout1.call(this, marker1);
        }
    }
}
var queue1 = [];
var draining1 = false;
var currentQueue1;
var queueIndex1 = -1;
function cleanUpNextTick1() {
    if (!draining1 || !currentQueue1) {
        return;
    }
    draining1 = false;
    if (currentQueue1.length) {
        queue1 = currentQueue1.concat(queue1);
    } else {
        queueIndex1 = -1;
    }
    if (queue1.length) {
        drainQueue2();
    }
}
function drainQueue2() {
    if (draining1) {
        return;
    }
    var timeout = runTimeout1(cleanUpNextTick1);
    draining1 = true;
    var len = queue1.length;
    while(len){
        currentQueue1 = queue1;
        queue1 = [];
        while((++queueIndex1) < len){
            if (currentQueue1) {
                currentQueue1[queueIndex1].run();
            }
        }
        queueIndex1 = -1;
        len = queue1.length;
    }
    currentQueue1 = null;
    draining1 = false;
    runClearTimeout1(timeout);
}
function nextTick1(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for(var i17 = 1; i17 < arguments.length; i17++){
            args[i17 - 1] = arguments[i17];
        }
    }
    queue1.push(new Item2(fun, args));
    if (queue1.length === 1 && !draining1) {
        runTimeout1(drainQueue2);
    }
}
function Item2(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item2.prototype.run = function() {
    this.fun.apply(null, this.array);
};
var title1 = "browser";
var platform1 = "browser";
var browser2 = true;
var argv1 = [];
var version1 = "";
var versions1 = {
};
var release1 = {
};
var config2 = {
};
function noop1() {
}
var on1 = noop1;
var addListener1 = noop1;
var once1 = noop1;
var off1 = noop1;
var removeListener1 = noop1;
var removeAllListeners1 = noop1;
var emit1 = noop1;
function binding1(name5) {
    throw new Error("process.binding is not supported");
}
function cwd1() {
    return "/";
}
function chdir1(dir) {
    throw new Error("process.chdir is not supported");
}
function umask1() {
    return 0;
}
var performance$1 = globalContext1.performance || {
};
var performanceNow1 = performance$1.now || performance$1.mozNow || performance$1.msNow || performance$1.oNow || performance$1.webkitNow || function() {
    return new Date().getTime();
};
function hrtime1(previousTimestamp) {
    var clocktime = performanceNow1.call(performance$1) * 0.001;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1000000000);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1000000000;
        }
    }
    return [
        seconds,
        nanoseconds
    ];
}
var startTime1 = new Date();
function uptime1() {
    var currentTime = new Date();
    var dif = currentTime - startTime1;
    return dif / 1000;
}
var process1 = {
    nextTick: nextTick1,
    title: title1,
    browser: browser2,
    env: {
        NODE_ENV: "production"
    },
    argv: argv1,
    version: version1,
    versions: versions1,
    on: on1,
    addListener: addListener1,
    once: once1,
    off: off1,
    removeListener: removeListener1,
    removeAllListeners: removeAllListeners1,
    emit: emit1,
    binding: binding1,
    cwd: cwd1,
    chdir: chdir1,
    umask: umask1,
    hrtime: hrtime1,
    platform: platform1,
    release: release1,
    config: config2,
    uptime: uptime1
};
var commonjsGlobal2 = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {
};
function createCommonjsModule3(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {
        },
        require: function(path4, base) {
            return commonjsRequire4(path4, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire4() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var lzutf8 = createCommonjsModule3(function(module) {
    var LZUTF8;
    (function(LZUTF82) {
        LZUTF82.runningInNodeJS = function() {
            return typeof process1 === "object" && typeof process1.versions === "object" && typeof process1.versions.node === "string";
        };
        LZUTF82.runningInMainNodeJSModule = function() {
            return LZUTF82.runningInNodeJS() && require.main === module;
        };
        LZUTF82.commonJSAvailable = function() {
            return true;
        };
        LZUTF82.runningInWebWorker = function() {
            return typeof window === "undefined" && typeof self === "object" && typeof self.addEventListener === "function" && typeof self.close === "function";
        };
        LZUTF82.runningInNodeChildProcess = function() {
            return LZUTF82.runningInNodeJS() && typeof process1.send === "function";
        };
        LZUTF82.runningInNullOrigin = function() {
            if (typeof window !== "object" || typeof window.location !== "object" || typeof document !== "object") return false;
            return document.location.protocol !== "http:" && document.location.protocol !== "https:";
        };
        LZUTF82.webWorkersAvailable = function() {
            if (typeof Worker !== "function" || LZUTF82.runningInNullOrigin()) return false;
            if (LZUTF82.runningInNodeJS()) return false;
            if (navigator && navigator.userAgent && navigator.userAgent.indexOf("Android 4.3") >= 0) return false;
            return true;
        };
        LZUTF82.log = function(message, appendToDocument) {
            if (appendToDocument === void 0) {
                appendToDocument = false;
            }
            if (typeof console !== "object") return;
            console.log(message);
            if (appendToDocument && typeof document == "object") document.body.innerHTML += message + "<br/>";
        };
        LZUTF82.createErrorMessage = function(exception, title2) {
            if (title2 === void 0) {
                title2 = "Unhandled exception";
            }
            if (exception == null) return title2;
            title2 += ": ";
            if (typeof exception.content === "object") {
                if (LZUTF82.runningInNodeJS()) {
                    return title2 + exception.content.stack;
                } else {
                    var exceptionJSON = JSON.stringify(exception.content);
                    if (exceptionJSON !== "{}") return title2 + exceptionJSON;
                    else return title2 + exception.content;
                }
            } else if (typeof exception.content === "string") {
                return title2 + exception.content;
            } else {
                return title2 + exception;
            }
        };
        LZUTF82.printExceptionAndStackTraceToConsole = function(exception, title2) {
            if (title2 === void 0) {
                title2 = "Unhandled exception";
            }
            LZUTF82.log(LZUTF82.createErrorMessage(exception, title2));
        };
        LZUTF82.getGlobalObject = function() {
            if (typeof commonjsGlobal2 === "object") return commonjsGlobal2;
            else if (typeof window === "object") return window;
            else if (typeof self === "object") return self;
            else return {
            };
        };
        LZUTF82.toString = Object.prototype.toString;
        if (LZUTF82.commonJSAvailable()) module.exports = LZUTF82;
    })(LZUTF8 || (LZUTF8 = {
    }));
    (function(IE10SubarrayBugPatcher) {
        if (typeof Uint8Array === "function" && new Uint8Array(1).subarray(1).byteLength !== 0) {
            var subarray = function(start, end2) {
                var clamp = function(v, min, max) {
                    return v < min ? min : v > max ? max : v;
                };
                start = start | 0;
                end2 = end2 | 0;
                if (arguments.length < 1) start = 0;
                if (arguments.length < 2) end2 = this.length;
                if (start < 0) start = this.length + start;
                if (end2 < 0) end2 = this.length + end2;
                start = clamp(start, 0, this.length);
                end2 = clamp(end2, 0, this.length);
                var len = end2 - start;
                if (len < 0) len = 0;
                return new this.constructor(this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
            };
            var types = [
                "Int8Array",
                "Uint8Array",
                "Uint8ClampedArray",
                "Int16Array",
                "Uint16Array",
                "Int32Array",
                "Uint32Array",
                "Float32Array",
                "Float64Array"
            ];
            var globalObject = void 0;
            if (typeof window === "object") globalObject = window;
            else if (typeof self === "object") globalObject = self;
            if (globalObject !== void 0) {
                for(var i18 = 0; i18 < types.length; i18++){
                    if (globalObject[types[i18]]) globalObject[types[i18]].prototype.subarray = subarray;
                }
            }
        }
    })();
    var LZUTF8;
    (function(LZUTF82) {
        var AsyncCompressor2 = function() {
            function AsyncCompressor3() {
            }
            AsyncCompressor3.compressAsync = function(input, options3, callback) {
                var timer = new LZUTF82.Timer();
                var compressor = new LZUTF82.Compressor();
                if (!callback) throw new TypeError("compressAsync: No callback argument given");
                if (typeof input === "string") {
                    input = LZUTF82.encodeUTF8(input);
                } else if (input == null || !(input instanceof Uint8Array)) {
                    callback(void 0, new TypeError("compressAsync: Invalid input argument, only 'string' and 'Uint8Array' are supported"));
                    return;
                }
                var sourceBlocks = LZUTF82.ArrayTools.splitByteArray(input, options3.blockSize);
                var compressedBlocks = [];
                var compressBlocksStartingAt = function(index4) {
                    if (index4 < sourceBlocks.length) {
                        var compressedBlock = void 0;
                        try {
                            compressedBlock = compressor.compressBlock(sourceBlocks[index4]);
                        } catch (e) {
                            callback(void 0, e);
                            return;
                        }
                        compressedBlocks.push(compressedBlock);
                        if (timer.getElapsedTime() <= 20) {
                            compressBlocksStartingAt(index4 + 1);
                        } else {
                            LZUTF82.enqueueImmediate(function() {
                                return compressBlocksStartingAt(index4 + 1);
                            });
                            timer.restart();
                        }
                    } else {
                        var joinedCompressedBlocks_1 = LZUTF82.ArrayTools.concatUint8Arrays(compressedBlocks);
                        LZUTF82.enqueueImmediate(function() {
                            var result3;
                            try {
                                result3 = LZUTF82.CompressionCommon.encodeCompressedBytes(joinedCompressedBlocks_1, options3.outputEncoding);
                            } catch (e) {
                                callback(void 0, e);
                                return;
                            }
                            LZUTF82.enqueueImmediate(function() {
                                return callback(result3);
                            });
                        });
                    }
                };
                LZUTF82.enqueueImmediate(function() {
                    return compressBlocksStartingAt(0);
                });
            };
            AsyncCompressor3.createCompressionStream = function() {
                var compressor = new LZUTF82.Compressor();
                var NodeStream = readableBrowser;
                var compressionStream = new NodeStream.Transform({
                    decodeStrings: true,
                    highWaterMark: 65536
                });
                compressionStream._transform = function(data, encoding, done1) {
                    var buffer;
                    try {
                        buffer = LZUTF82.BufferTools.uint8ArrayToBuffer(compressor.compressBlock(LZUTF82.BufferTools.bufferToUint8Array(data)));
                    } catch (e) {
                        compressionStream.emit("error", e);
                        return;
                    }
                    compressionStream.push(buffer);
                    done1();
                };
                return compressionStream;
            };
            return AsyncCompressor3;
        }();
        LZUTF82.AsyncCompressor = AsyncCompressor2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var AsyncDecompressor2 = function() {
            function AsyncDecompressor3() {
            }
            AsyncDecompressor3.decompressAsync = function(input, options3, callback) {
                if (!callback) throw new TypeError("decompressAsync: No callback argument given");
                var timer = new LZUTF82.Timer();
                try {
                    input = LZUTF82.CompressionCommon.decodeCompressedBytes(input, options3.inputEncoding);
                } catch (e) {
                    callback(void 0, e);
                    return;
                }
                var decompressor = new LZUTF82.Decompressor();
                var sourceBlocks = LZUTF82.ArrayTools.splitByteArray(input, options3.blockSize);
                var decompressedBlocks = [];
                var decompressBlocksStartingAt = function(index4) {
                    if (index4 < sourceBlocks.length) {
                        var decompressedBlock = void 0;
                        try {
                            decompressedBlock = decompressor.decompressBlock(sourceBlocks[index4]);
                        } catch (e) {
                            callback(void 0, e);
                            return;
                        }
                        decompressedBlocks.push(decompressedBlock);
                        if (timer.getElapsedTime() <= 20) {
                            decompressBlocksStartingAt(index4 + 1);
                        } else {
                            LZUTF82.enqueueImmediate(function() {
                                return decompressBlocksStartingAt(index4 + 1);
                            });
                            timer.restart();
                        }
                    } else {
                        var joinedDecompressedBlocks_1 = LZUTF82.ArrayTools.concatUint8Arrays(decompressedBlocks);
                        LZUTF82.enqueueImmediate(function() {
                            var result3;
                            try {
                                result3 = LZUTF82.CompressionCommon.encodeDecompressedBytes(joinedDecompressedBlocks_1, options3.outputEncoding);
                            } catch (e) {
                                callback(void 0, e);
                                return;
                            }
                            LZUTF82.enqueueImmediate(function() {
                                return callback(result3);
                            });
                        });
                    }
                };
                LZUTF82.enqueueImmediate(function() {
                    return decompressBlocksStartingAt(0);
                });
            };
            AsyncDecompressor3.createDecompressionStream = function() {
                var decompressor = new LZUTF82.Decompressor();
                var NodeStream = readableBrowser;
                var decompressionStream = new NodeStream.Transform({
                    decodeStrings: true,
                    highWaterMark: 65536
                });
                decompressionStream._transform = function(data, encoding, done1) {
                    var buffer;
                    try {
                        buffer = LZUTF82.BufferTools.uint8ArrayToBuffer(decompressor.decompressBlock(LZUTF82.BufferTools.bufferToUint8Array(data)));
                    } catch (e) {
                        decompressionStream.emit("error", e);
                        return;
                    }
                    decompressionStream.push(buffer);
                    done1();
                };
                return decompressionStream;
            };
            return AsyncDecompressor3;
        }();
        LZUTF82.AsyncDecompressor = AsyncDecompressor2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var WebWorker2;
        (function(WebWorker3) {
            WebWorker3.compressAsync = function(input, options3, callback) {
                if (options3.inputEncoding == "ByteArray") {
                    if (!(input instanceof Uint8Array)) {
                        callback(void 0, new TypeError("compressAsync: input is not a Uint8Array"));
                        return;
                    }
                }
                var request = {
                    token: Math.random().toString(),
                    type: "compress",
                    data: input,
                    inputEncoding: options3.inputEncoding,
                    outputEncoding: options3.outputEncoding
                };
                var responseListener = function(e) {
                    var response = e.data;
                    if (!response || response.token != request.token) return;
                    WebWorker3.globalWorker.removeEventListener("message", responseListener);
                    if (response.type == "error") callback(void 0, new Error(response.error));
                    else callback(response.data);
                };
                WebWorker3.globalWorker.addEventListener("message", responseListener);
                WebWorker3.globalWorker.postMessage(request, []);
            };
            WebWorker3.decompressAsync = function(input, options3, callback) {
                var request = {
                    token: Math.random().toString(),
                    type: "decompress",
                    data: input,
                    inputEncoding: options3.inputEncoding,
                    outputEncoding: options3.outputEncoding
                };
                var responseListener = function(e) {
                    var response = e.data;
                    if (!response || response.token != request.token) return;
                    WebWorker3.globalWorker.removeEventListener("message", responseListener);
                    if (response.type == "error") callback(void 0, new Error(response.error));
                    else callback(response.data);
                };
                WebWorker3.globalWorker.addEventListener("message", responseListener);
                WebWorker3.globalWorker.postMessage(request, []);
            };
            WebWorker3.installWebWorkerIfNeeded = function() {
                if (typeof self == "object" && self.document === void 0 && self.addEventListener != void 0) {
                    self.addEventListener("message", function(e) {
                        var request = e.data;
                        if (request.type == "compress") {
                            var compressedData = void 0;
                            try {
                                compressedData = LZUTF82.compress(request.data, {
                                    outputEncoding: request.outputEncoding
                                });
                            } catch (e2) {
                                self.postMessage({
                                    token: request.token,
                                    type: "error",
                                    error: LZUTF82.createErrorMessage(e2)
                                }, []);
                                return;
                            }
                            var response = {
                                token: request.token,
                                type: "compressionResult",
                                data: compressedData,
                                encoding: request.outputEncoding
                            };
                            if (response.data instanceof Uint8Array && navigator.appVersion.indexOf("MSIE 10") === -1) self.postMessage(response, [
                                response.data.buffer
                            ]);
                            else self.postMessage(response, []);
                        } else if (request.type == "decompress") {
                            var decompressedData = void 0;
                            try {
                                decompressedData = LZUTF82.decompress(request.data, {
                                    inputEncoding: request.inputEncoding,
                                    outputEncoding: request.outputEncoding
                                });
                            } catch (e2) {
                                self.postMessage({
                                    token: request.token,
                                    type: "error",
                                    error: LZUTF82.createErrorMessage(e2)
                                }, []);
                                return;
                            }
                            var response = {
                                token: request.token,
                                type: "decompressionResult",
                                data: decompressedData,
                                encoding: request.outputEncoding
                            };
                            if (response.data instanceof Uint8Array && navigator.appVersion.indexOf("MSIE 10") === -1) self.postMessage(response, [
                                response.data.buffer
                            ]);
                            else self.postMessage(response, []);
                        }
                    });
                    self.addEventListener("error", function(e) {
                        LZUTF82.log(LZUTF82.createErrorMessage(e.error, "Unexpected LZUTF8 WebWorker exception"));
                    });
                }
            };
            WebWorker3.createGlobalWorkerIfNeeded = function() {
                if (WebWorker3.globalWorker) return true;
                if (!LZUTF82.webWorkersAvailable()) return false;
                if (!WebWorker3.scriptURI && typeof document === "object") {
                    var scriptElement = document.getElementById("lzutf8");
                    if (scriptElement != null) WebWorker3.scriptURI = scriptElement.getAttribute("src") || void 0;
                }
                if (WebWorker3.scriptURI) {
                    WebWorker3.globalWorker = new Worker(WebWorker3.scriptURI);
                    return true;
                } else {
                    return false;
                }
            };
            WebWorker3.terminate = function() {
                if (WebWorker3.globalWorker) {
                    WebWorker3.globalWorker.terminate();
                    WebWorker3.globalWorker = void 0;
                }
            };
        })(WebWorker2 = LZUTF82.WebWorker || (LZUTF82.WebWorker = {
        }));
        WebWorker2.installWebWorkerIfNeeded();
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var ArraySegment2 = function() {
            function ArraySegment3(container, startPosition, length1) {
                this.container = container;
                this.startPosition = startPosition;
                this.length = length1;
            }
            ArraySegment3.prototype.get = function(index4) {
                return this.container[this.startPosition + index4];
            };
            ArraySegment3.prototype.getInReversedOrder = function(reverseIndex) {
                return this.container[this.startPosition + this.length - 1 - reverseIndex];
            };
            ArraySegment3.prototype.set = function(index4, value) {
                this.container[this.startPosition + index4] = value;
            };
            return ArraySegment3;
        }();
        LZUTF82.ArraySegment = ArraySegment2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(ArrayTools2) {
            ArrayTools2.copyElements = function(source, sourceIndex, destination, destinationIndex, count) {
                while(count--)destination[destinationIndex++] = source[sourceIndex++];
            };
            ArrayTools2.zeroElements = function(collection, index4, count) {
                while(count--)collection[index4++] = 0;
            };
            ArrayTools2.countNonzeroValuesInArray = function(array) {
                var result3 = 0;
                for(var i19 = 0; i19 < array.length; i19++)if (array[i19]) result3++;
                return result3;
            };
            ArrayTools2.truncateStartingElements = function(array, truncatedLength) {
                if (array.length <= truncatedLength) throw new RangeError("truncateStartingElements: Requested length should be smaller than array length");
                var sourcePosition = array.length - truncatedLength;
                for(var i19 = 0; i19 < truncatedLength; i19++)array[i19] = array[sourcePosition + i19];
                array.length = truncatedLength;
            };
            ArrayTools2.doubleByteArrayCapacity = function(array) {
                var newArray = new Uint8Array(array.length * 2);
                newArray.set(array);
                return newArray;
            };
            ArrayTools2.concatUint8Arrays = function(arrays) {
                var totalLength = 0;
                for(var _i = 0, arrays_1 = arrays; _i < arrays_1.length; _i++){
                    var array = arrays_1[_i];
                    totalLength += array.length;
                }
                var result3 = new Uint8Array(totalLength);
                var offset2 = 0;
                for(var _a = 0, arrays_2 = arrays; _a < arrays_2.length; _a++){
                    var array = arrays_2[_a];
                    result3.set(array, offset2);
                    offset2 += array.length;
                }
                return result3;
            };
            ArrayTools2.splitByteArray = function(byteArray, maxPartLength) {
                var result3 = [];
                for(var offset2 = 0; offset2 < byteArray.length;){
                    var blockLength = Math.min(maxPartLength, byteArray.length - offset2);
                    result3.push(byteArray.subarray(offset2, offset2 + blockLength));
                    offset2 += blockLength;
                }
                return result3;
            };
        })(LZUTF82.ArrayTools || (LZUTF82.ArrayTools = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(BufferTools2) {
            BufferTools2.convertToUint8ArrayIfNeeded = function(input) {
                if (typeof Buffer4 === "function" && Buffer4.isBuffer(input)) return BufferTools2.bufferToUint8Array(input);
                else return input;
            };
            BufferTools2.uint8ArrayToBuffer = function(arr) {
                if (Buffer4.prototype instanceof Uint8Array) {
                    var arrClone = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
                    Object["setPrototypeOf"](arrClone, Buffer4.prototype);
                    return arrClone;
                } else {
                    var len = arr.length;
                    var buf = new Buffer4(len);
                    for(var i19 = 0; i19 < len; i19++)buf[i19] = arr[i19];
                    return buf;
                }
            };
            BufferTools2.bufferToUint8Array = function(buf) {
                if (Buffer4.prototype instanceof Uint8Array) {
                    return new Uint8Array(buf["buffer"], buf["byteOffset"], buf["byteLength"]);
                } else {
                    var len = buf.length;
                    var arr = new Uint8Array(len);
                    for(var i20 = 0; i20 < len; i20++)arr[i20] = buf[i20];
                    return arr;
                }
            };
        })(LZUTF82.BufferTools || (LZUTF82.BufferTools = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(CompressionCommon2) {
            CompressionCommon2.getCroppedBuffer = function(buffer, cropStartOffset, cropLength, additionalCapacity) {
                if (additionalCapacity === void 0) {
                    additionalCapacity = 0;
                }
                var croppedBuffer = new Uint8Array(cropLength + additionalCapacity);
                croppedBuffer.set(buffer.subarray(cropStartOffset, cropStartOffset + cropLength));
                return croppedBuffer;
            };
            CompressionCommon2.getCroppedAndAppendedByteArray = function(bytes, cropStartOffset, cropLength, byteArrayToAppend) {
                return LZUTF82.ArrayTools.concatUint8Arrays([
                    bytes.subarray(cropStartOffset, cropStartOffset + cropLength),
                    byteArrayToAppend
                ]);
            };
            CompressionCommon2.detectCompressionSourceEncoding = function(input) {
                if (input == null) throw new TypeError("detectCompressionSourceEncoding: input is null or undefined");
                if (typeof input === "string") return "String";
                else if (input instanceof Uint8Array || typeof Buffer4 === "function" && Buffer4.isBuffer(input)) return "ByteArray";
                else throw new TypeError("detectCompressionSourceEncoding: input must be of type 'string', 'Uint8Array' or 'Buffer'");
            };
            CompressionCommon2.encodeCompressedBytes = function(compressedBytes, outputEncoding) {
                switch(outputEncoding){
                    case "ByteArray":
                        return compressedBytes;
                    case "Buffer":
                        return LZUTF82.BufferTools.uint8ArrayToBuffer(compressedBytes);
                    case "Base64":
                        return LZUTF82.encodeBase64(compressedBytes);
                    case "BinaryString":
                        return LZUTF82.encodeBinaryString(compressedBytes);
                    case "StorageBinaryString":
                        return LZUTF82.encodeStorageBinaryString(compressedBytes);
                    default:
                        throw new TypeError("encodeCompressedBytes: invalid output encoding requested");
                }
            };
            CompressionCommon2.decodeCompressedBytes = function(compressedData, inputEncoding) {
                if (inputEncoding == null) throw new TypeError("decodeCompressedData: Input is null or undefined");
                switch(inputEncoding){
                    case "ByteArray":
                    case "Buffer":
                        var normalizedBytes = LZUTF82.BufferTools.convertToUint8ArrayIfNeeded(compressedData);
                        if (!(normalizedBytes instanceof Uint8Array)) throw new TypeError("decodeCompressedData: 'ByteArray' or 'Buffer' input type was specified but input is not a Uint8Array or Buffer");
                        return normalizedBytes;
                    case "Base64":
                        if (typeof compressedData !== "string") throw new TypeError("decodeCompressedData: 'Base64' input type was specified but input is not a string");
                        return LZUTF82.decodeBase64(compressedData);
                    case "BinaryString":
                        if (typeof compressedData !== "string") throw new TypeError("decodeCompressedData: 'BinaryString' input type was specified but input is not a string");
                        return LZUTF82.decodeBinaryString(compressedData);
                    case "StorageBinaryString":
                        if (typeof compressedData !== "string") throw new TypeError("decodeCompressedData: 'StorageBinaryString' input type was specified but input is not a string");
                        return LZUTF82.decodeStorageBinaryString(compressedData);
                    default:
                        throw new TypeError("decodeCompressedData: invalid input encoding requested: '" + inputEncoding + "'");
                }
            };
            CompressionCommon2.encodeDecompressedBytes = function(decompressedBytes, outputEncoding) {
                switch(outputEncoding){
                    case "String":
                        return LZUTF82.decodeUTF8(decompressedBytes);
                    case "ByteArray":
                        return decompressedBytes;
                    case "Buffer":
                        if (typeof Buffer4 !== "function") throw new TypeError("encodeDecompressedBytes: a 'Buffer' type was specified but is not supported at the current envirnment");
                        return LZUTF82.BufferTools.uint8ArrayToBuffer(decompressedBytes);
                    default:
                        throw new TypeError("encodeDecompressedBytes: invalid output encoding requested");
                }
            };
        })(LZUTF82.CompressionCommon || (LZUTF82.CompressionCommon = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var EventLoop2;
        (function(EventLoop3) {
            var queuedFunctions = [];
            var asyncFlushFunc;
            EventLoop3.enqueueImmediate = function(func) {
                queuedFunctions.push(func);
                if (queuedFunctions.length === 1) asyncFlushFunc();
            };
            EventLoop3.initializeScheduler = function() {
                var flush = function() {
                    for(var _i = 0, queuedFunctions_1 = queuedFunctions; _i < queuedFunctions_1.length; _i++){
                        var func = queuedFunctions_1[_i];
                        try {
                            func.call(void 0);
                        } catch (exception) {
                            LZUTF82.printExceptionAndStackTraceToConsole(exception, "enqueueImmediate exception");
                        }
                    }
                    queuedFunctions.length = 0;
                };
                if (LZUTF82.runningInNodeJS()) {
                    asyncFlushFunc = function() {
                        return setImmediate(function() {
                            return flush();
                        });
                    };
                }
                if (typeof window === "object" && typeof window.addEventListener === "function" && typeof window.postMessage === "function") {
                    var token_1 = "enqueueImmediate-" + Math.random().toString();
                    window.addEventListener("message", function(event) {
                        if (event.data === token_1) flush();
                    });
                    var targetOrigin_1;
                    if (LZUTF82.runningInNullOrigin()) targetOrigin_1 = "*";
                    else targetOrigin_1 = window.location.href;
                    asyncFlushFunc = function() {
                        return window.postMessage(token_1, targetOrigin_1);
                    };
                } else if (typeof MessageChannel === "function" && typeof MessagePort === "function") {
                    var channel_1 = new MessageChannel();
                    channel_1.port1.onmessage = function() {
                        return flush();
                    };
                    asyncFlushFunc = function() {
                        return channel_1.port2.postMessage(0);
                    };
                } else {
                    asyncFlushFunc = function() {
                        return setTimeout(function() {
                            return flush();
                        }, 0);
                    };
                }
            };
            EventLoop3.initializeScheduler();
        })(EventLoop2 = LZUTF82.EventLoop || (LZUTF82.EventLoop = {
        }));
        LZUTF82.enqueueImmediate = function(func) {
            return EventLoop2.enqueueImmediate(func);
        };
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(ObjectTools2) {
            ObjectTools2.override = function(obj, newPropertyValues) {
                return ObjectTools2.extend(obj, newPropertyValues);
            };
            ObjectTools2.extend = function(obj, newProperties) {
                if (obj == null) throw new TypeError("obj is null or undefined");
                if (typeof obj !== "object") throw new TypeError("obj is not an object");
                if (newProperties == null) newProperties = {
                };
                if (typeof newProperties !== "object") throw new TypeError("newProperties is not an object");
                if (newProperties != null) {
                    for(var property in newProperties)obj[property] = newProperties[property];
                }
                return obj;
            };
        })(LZUTF82.ObjectTools || (LZUTF82.ObjectTools = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        LZUTF82.getRandomIntegerInRange = function(low, high) {
            return low + Math.floor(Math.random() * (high - low));
        };
        LZUTF82.getRandomUTF16StringOfLength = function(length1) {
            var randomString = "";
            for(var i21 = 0; i21 < length1; i21++){
                var randomCodePoint = void 0;
                do {
                    randomCodePoint = LZUTF82.getRandomIntegerInRange(0, 1114111 + 1);
                }while (randomCodePoint >= 55296 && randomCodePoint <= 57343)
                randomString += LZUTF82.Encoding.CodePoint.decodeToString(randomCodePoint);
            }
            return randomString;
        };
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var StringBuilder2 = function() {
            function StringBuilder3(outputBufferCapacity) {
                if (outputBufferCapacity === void 0) {
                    outputBufferCapacity = 1024;
                }
                this.outputBufferCapacity = outputBufferCapacity;
                this.outputPosition = 0;
                this.outputString = "";
                this.outputBuffer = new Uint16Array(this.outputBufferCapacity);
            }
            StringBuilder3.prototype.appendCharCode = function(charCode) {
                this.outputBuffer[this.outputPosition++] = charCode;
                if (this.outputPosition === this.outputBufferCapacity) this.flushBufferToOutputString();
            };
            StringBuilder3.prototype.appendCharCodes = function(charCodes) {
                for(var i21 = 0, length_1 = charCodes.length; i21 < length_1; i21++)this.appendCharCode(charCodes[i21]);
            };
            StringBuilder3.prototype.appendString = function(str) {
                for(var i21 = 0, length_2 = str.length; i21 < length_2; i21++)this.appendCharCode(str.charCodeAt(i21));
            };
            StringBuilder3.prototype.appendCodePoint = function(codePoint) {
                if (codePoint <= 65535) {
                    this.appendCharCode(codePoint);
                } else if (codePoint <= 1114111) {
                    this.appendCharCode(55296 + (codePoint - 65536 >>> 10));
                    this.appendCharCode(56320 + (codePoint - 65536 & 1023));
                } else throw new Error("appendCodePoint: A code point of " + codePoint + " cannot be encoded in UTF-16");
            };
            StringBuilder3.prototype.getOutputString = function() {
                this.flushBufferToOutputString();
                return this.outputString;
            };
            StringBuilder3.prototype.flushBufferToOutputString = function() {
                if (this.outputPosition === this.outputBufferCapacity) this.outputString += String.fromCharCode.apply(null, this.outputBuffer);
                else this.outputString += String.fromCharCode.apply(null, this.outputBuffer.subarray(0, this.outputPosition));
                this.outputPosition = 0;
            };
            return StringBuilder3;
        }();
        LZUTF82.StringBuilder = StringBuilder2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var Timer2 = function() {
            function Timer3() {
                this.restart();
            }
            Timer3.prototype.restart = function() {
                this.startTime = Timer3.getTimestamp();
            };
            Timer3.prototype.getElapsedTime = function() {
                return Timer3.getTimestamp() - this.startTime;
            };
            Timer3.prototype.getElapsedTimeAndRestart = function() {
                var elapsedTime = this.getElapsedTime();
                this.restart();
                return elapsedTime;
            };
            Timer3.prototype.logAndRestart = function(title2, logToDocument) {
                if (logToDocument === void 0) {
                    logToDocument = true;
                }
                var elapsedTime = this.getElapsedTime();
                var message = title2 + ": " + elapsedTime.toFixed(3) + "ms";
                LZUTF82.log(message, logToDocument);
                this.restart();
                return elapsedTime;
            };
            Timer3.getTimestamp = function() {
                if (!this.timestampFunc) this.createGlobalTimestampFunction();
                return this.timestampFunc();
            };
            Timer3.getMicrosecondTimestamp = function() {
                return Math.floor(Timer3.getTimestamp() * 1000);
            };
            Timer3.createGlobalTimestampFunction = function() {
                if (typeof process1 === "object" && typeof process1.hrtime === "function") {
                    var baseTimestamp_1 = 0;
                    this.timestampFunc = function() {
                        var nodeTimeStamp = process1.hrtime();
                        var millisecondTime = nodeTimeStamp[0] * 1000 + nodeTimeStamp[1] / 1000000;
                        return baseTimestamp_1 + millisecondTime;
                    };
                    baseTimestamp_1 = Date.now() - this.timestampFunc();
                } else if (typeof chrome === "object" && chrome.Interval) {
                    var baseTimestamp_2 = Date.now();
                    var chromeIntervalObject_1 = new chrome.Interval();
                    chromeIntervalObject_1.start();
                    this.timestampFunc = function() {
                        return baseTimestamp_2 + chromeIntervalObject_1.microseconds() / 1000;
                    };
                } else if (typeof performance === "object" && performance.now) {
                    var baseTimestamp_3 = Date.now() - performance.now();
                    this.timestampFunc = function() {
                        return baseTimestamp_3 + performance.now();
                    };
                } else if (Date.now) {
                    this.timestampFunc = function() {
                        return Date.now();
                    };
                } else {
                    this.timestampFunc = function() {
                        return new Date().getTime();
                    };
                }
            };
            return Timer3;
        }();
        LZUTF82.Timer = Timer2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var Compressor2 = function() {
            function Compressor3(useCustomHashTable) {
                if (useCustomHashTable === void 0) {
                    useCustomHashTable = true;
                }
                this.MinimumSequenceLength = 4;
                this.MaximumSequenceLength = 31;
                this.MaximumMatchDistance = 32767;
                this.PrefixHashTableSize = 65537;
                this.inputBufferStreamOffset = 1;
                if (useCustomHashTable && typeof Uint32Array == "function") this.prefixHashTable = new LZUTF82.CompressorCustomHashTable(this.PrefixHashTableSize);
                else this.prefixHashTable = new LZUTF82.CompressorSimpleHashTable(this.PrefixHashTableSize);
            }
            Compressor3.prototype.compressBlock = function(input) {
                if (input === void 0 || input === null) throw new TypeError("compressBlock: undefined or null input received");
                if (typeof input == "string") input = LZUTF82.encodeUTF8(input);
                input = LZUTF82.BufferTools.convertToUint8ArrayIfNeeded(input);
                return this.compressUtf8Block(input);
            };
            Compressor3.prototype.compressUtf8Block = function(utf8Bytes) {
                if (!utf8Bytes || utf8Bytes.length == 0) return new Uint8Array(0);
                var bufferStartingReadOffset = this.cropAndAddNewBytesToInputBuffer(utf8Bytes);
                var inputBuffer = this.inputBuffer;
                var inputBufferLength = this.inputBuffer.length;
                this.outputBuffer = new Uint8Array(utf8Bytes.length);
                this.outputBufferPosition = 0;
                var latestMatchEndPosition = 0;
                for(var readPosition = bufferStartingReadOffset; readPosition < inputBufferLength; readPosition++){
                    var inputValue = inputBuffer[readPosition];
                    var withinAMatchedRange = readPosition < latestMatchEndPosition;
                    if (readPosition > inputBufferLength - this.MinimumSequenceLength) {
                        if (!withinAMatchedRange) this.outputRawByte(inputValue);
                        continue;
                    }
                    var targetBucketIndex = this.getBucketIndexForPrefix(readPosition);
                    if (!withinAMatchedRange) {
                        var matchLocator = this.findLongestMatch(readPosition, targetBucketIndex);
                        if (matchLocator != null) {
                            this.outputPointerBytes(matchLocator.length, matchLocator.distance);
                            latestMatchEndPosition = readPosition + matchLocator.length;
                            withinAMatchedRange = true;
                        }
                    }
                    if (!withinAMatchedRange) this.outputRawByte(inputValue);
                    var inputStreamPosition = this.inputBufferStreamOffset + readPosition;
                    this.prefixHashTable.addValueToBucket(targetBucketIndex, inputStreamPosition);
                }
                return this.outputBuffer.subarray(0, this.outputBufferPosition);
            };
            Compressor3.prototype.findLongestMatch = function(matchedSequencePosition, bucketIndex) {
                var bucket = this.prefixHashTable.getArraySegmentForBucketIndex(bucketIndex, this.reusableArraySegmentObject);
                if (bucket == null) return null;
                var input = this.inputBuffer;
                var longestMatchDistance;
                var longestMatchLength = 0;
                for(var i21 = 0; i21 < bucket.length; i21++){
                    var testedSequencePosition = bucket.getInReversedOrder(i21) - this.inputBufferStreamOffset;
                    var testedSequenceDistance = matchedSequencePosition - testedSequencePosition;
                    var lengthToSurpass = void 0;
                    if (longestMatchDistance === void 0) lengthToSurpass = this.MinimumSequenceLength - 1;
                    else if (longestMatchDistance < 128 && testedSequenceDistance >= 128) lengthToSurpass = longestMatchLength + (longestMatchLength >>> 1);
                    else lengthToSurpass = longestMatchLength;
                    if (testedSequenceDistance > this.MaximumMatchDistance || lengthToSurpass >= this.MaximumSequenceLength || matchedSequencePosition + lengthToSurpass >= input.length) break;
                    if (input[testedSequencePosition + lengthToSurpass] !== input[matchedSequencePosition + lengthToSurpass]) continue;
                    for(var offset2 = 0;; offset2++){
                        if (matchedSequencePosition + offset2 === input.length || input[testedSequencePosition + offset2] !== input[matchedSequencePosition + offset2]) {
                            if (offset2 > lengthToSurpass) {
                                longestMatchDistance = testedSequenceDistance;
                                longestMatchLength = offset2;
                            }
                            break;
                        } else if (offset2 === this.MaximumSequenceLength) return {
                            distance: testedSequenceDistance,
                            length: this.MaximumSequenceLength
                        };
                    }
                }
                if (longestMatchDistance !== void 0) return {
                    distance: longestMatchDistance,
                    length: longestMatchLength
                };
                else return null;
            };
            Compressor3.prototype.getBucketIndexForPrefix = function(startPosition) {
                return (this.inputBuffer[startPosition] * 7880599 + this.inputBuffer[startPosition + 1] * 39601 + this.inputBuffer[startPosition + 2] * 199 + this.inputBuffer[startPosition + 3]) % this.PrefixHashTableSize;
            };
            Compressor3.prototype.outputPointerBytes = function(length1, distance) {
                if (distance < 128) {
                    this.outputRawByte(192 | length1);
                    this.outputRawByte(distance);
                } else {
                    this.outputRawByte(224 | length1);
                    this.outputRawByte(distance >>> 8);
                    this.outputRawByte(distance & 255);
                }
            };
            Compressor3.prototype.outputRawByte = function(value) {
                this.outputBuffer[this.outputBufferPosition++] = value;
            };
            Compressor3.prototype.cropAndAddNewBytesToInputBuffer = function(newInput) {
                if (this.inputBuffer === void 0) {
                    this.inputBuffer = newInput;
                    return 0;
                } else {
                    var cropLength = Math.min(this.inputBuffer.length, this.MaximumMatchDistance);
                    var cropStartOffset = this.inputBuffer.length - cropLength;
                    this.inputBuffer = LZUTF82.CompressionCommon.getCroppedAndAppendedByteArray(this.inputBuffer, cropStartOffset, cropLength, newInput);
                    this.inputBufferStreamOffset += cropStartOffset;
                    return cropLength;
                }
            };
            return Compressor3;
        }();
        LZUTF82.Compressor = Compressor2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var CompressorCustomHashTable2 = function() {
            function CompressorCustomHashTable3(bucketCount) {
                this.minimumBucketCapacity = 4;
                this.maximumBucketCapacity = 64;
                this.bucketLocators = new Uint32Array(bucketCount * 2);
                this.storage = new Uint32Array(bucketCount * 2);
                this.storageIndex = 1;
            }
            CompressorCustomHashTable3.prototype.addValueToBucket = function(bucketIndex, valueToAdd) {
                bucketIndex <<= 1;
                if (this.storageIndex >= this.storage.length >>> 1) this.compact();
                var startPosition = this.bucketLocators[bucketIndex];
                var length1;
                if (startPosition === 0) {
                    startPosition = this.storageIndex;
                    length1 = 1;
                    this.storage[this.storageIndex] = valueToAdd;
                    this.storageIndex += this.minimumBucketCapacity;
                } else {
                    length1 = this.bucketLocators[bucketIndex + 1];
                    if (length1 === this.maximumBucketCapacity - 1) length1 = this.truncateBucketToNewerElements(startPosition, length1, this.maximumBucketCapacity / 2);
                    var endPosition = startPosition + length1;
                    if (this.storage[endPosition] === 0) {
                        this.storage[endPosition] = valueToAdd;
                        if (endPosition === this.storageIndex) this.storageIndex += length1;
                    } else {
                        LZUTF82.ArrayTools.copyElements(this.storage, startPosition, this.storage, this.storageIndex, length1);
                        startPosition = this.storageIndex;
                        this.storageIndex += length1;
                        this.storage[this.storageIndex++] = valueToAdd;
                        this.storageIndex += length1;
                    }
                    length1++;
                }
                this.bucketLocators[bucketIndex] = startPosition;
                this.bucketLocators[bucketIndex + 1] = length1;
            };
            CompressorCustomHashTable3.prototype.truncateBucketToNewerElements = function(startPosition, bucketLength, truncatedBucketLength) {
                var sourcePosition = startPosition + bucketLength - truncatedBucketLength;
                LZUTF82.ArrayTools.copyElements(this.storage, sourcePosition, this.storage, startPosition, truncatedBucketLength);
                LZUTF82.ArrayTools.zeroElements(this.storage, startPosition + truncatedBucketLength, bucketLength - truncatedBucketLength);
                return truncatedBucketLength;
            };
            CompressorCustomHashTable3.prototype.compact = function() {
                var oldBucketLocators = this.bucketLocators;
                var oldStorage = this.storage;
                this.bucketLocators = new Uint32Array(this.bucketLocators.length);
                this.storageIndex = 1;
                for(var bucketIndex = 0; bucketIndex < oldBucketLocators.length; bucketIndex += 2){
                    var length_3 = oldBucketLocators[bucketIndex + 1];
                    if (length_3 === 0) continue;
                    this.bucketLocators[bucketIndex] = this.storageIndex;
                    this.bucketLocators[bucketIndex + 1] = length_3;
                    this.storageIndex += Math.max(Math.min(length_3 * 2, this.maximumBucketCapacity), this.minimumBucketCapacity);
                }
                this.storage = new Uint32Array(this.storageIndex * 8);
                for(var bucketIndex = 0; bucketIndex < oldBucketLocators.length; bucketIndex += 2){
                    var sourcePosition = oldBucketLocators[bucketIndex];
                    if (sourcePosition === 0) continue;
                    var destPosition = this.bucketLocators[bucketIndex];
                    var length_4 = this.bucketLocators[bucketIndex + 1];
                    LZUTF82.ArrayTools.copyElements(oldStorage, sourcePosition, this.storage, destPosition, length_4);
                }
            };
            CompressorCustomHashTable3.prototype.getArraySegmentForBucketIndex = function(bucketIndex, outputObject) {
                bucketIndex <<= 1;
                var startPosition = this.bucketLocators[bucketIndex];
                if (startPosition === 0) return null;
                if (outputObject === void 0) outputObject = new LZUTF82.ArraySegment(this.storage, startPosition, this.bucketLocators[bucketIndex + 1]);
                return outputObject;
            };
            CompressorCustomHashTable3.prototype.getUsedBucketCount = function() {
                return Math.floor(LZUTF82.ArrayTools.countNonzeroValuesInArray(this.bucketLocators) / 2);
            };
            CompressorCustomHashTable3.prototype.getTotalElementCount = function() {
                var result3 = 0;
                for(var i21 = 0; i21 < this.bucketLocators.length; i21 += 2)result3 += this.bucketLocators[i21 + 1];
                return result3;
            };
            return CompressorCustomHashTable3;
        }();
        LZUTF82.CompressorCustomHashTable = CompressorCustomHashTable2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var CompressorSimpleHashTable2 = function() {
            function CompressorSimpleHashTable3(size) {
                this.maximumBucketCapacity = 64;
                this.buckets = new Array(size);
            }
            CompressorSimpleHashTable3.prototype.addValueToBucket = function(bucketIndex, valueToAdd) {
                var bucket = this.buckets[bucketIndex];
                if (bucket === void 0) {
                    this.buckets[bucketIndex] = [
                        valueToAdd
                    ];
                } else {
                    if (bucket.length === this.maximumBucketCapacity - 1) LZUTF82.ArrayTools.truncateStartingElements(bucket, this.maximumBucketCapacity / 2);
                    bucket.push(valueToAdd);
                }
            };
            CompressorSimpleHashTable3.prototype.getArraySegmentForBucketIndex = function(bucketIndex, outputObject) {
                var bucket = this.buckets[bucketIndex];
                if (bucket === void 0) return null;
                if (outputObject === void 0) outputObject = new LZUTF82.ArraySegment(bucket, 0, bucket.length);
                return outputObject;
            };
            CompressorSimpleHashTable3.prototype.getUsedBucketCount = function() {
                return LZUTF82.ArrayTools.countNonzeroValuesInArray(this.buckets);
            };
            CompressorSimpleHashTable3.prototype.getTotalElementCount = function() {
                var currentSum = 0;
                for(var i21 = 0; i21 < this.buckets.length; i21++){
                    if (this.buckets[i21] !== void 0) currentSum += this.buckets[i21].length;
                }
                return currentSum;
            };
            return CompressorSimpleHashTable3;
        }();
        LZUTF82.CompressorSimpleHashTable = CompressorSimpleHashTable2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        var Decompressor2 = function() {
            function Decompressor3() {
                this.MaximumMatchDistance = 32767;
                this.outputPosition = 0;
            }
            Decompressor3.prototype.decompressBlockToString = function(input) {
                input = LZUTF82.BufferTools.convertToUint8ArrayIfNeeded(input);
                return LZUTF82.decodeUTF8(this.decompressBlock(input));
            };
            Decompressor3.prototype.decompressBlock = function(input) {
                if (this.inputBufferRemainder) {
                    input = LZUTF82.ArrayTools.concatUint8Arrays([
                        this.inputBufferRemainder,
                        input
                    ]);
                    this.inputBufferRemainder = void 0;
                }
                var outputStartPosition = this.cropOutputBufferToWindowAndInitialize(Math.max(input.length * 4, 1024));
                for(var readPosition = 0, inputLength = input.length; readPosition < inputLength; readPosition++){
                    var inputValue = input[readPosition];
                    if (inputValue >>> 6 != 3) {
                        this.outputByte(inputValue);
                        continue;
                    }
                    var sequenceLengthIdentifier = inputValue >>> 5;
                    if (readPosition == inputLength - 1 || readPosition == inputLength - 2 && sequenceLengthIdentifier == 7) {
                        this.inputBufferRemainder = input.subarray(readPosition);
                        break;
                    }
                    if (input[readPosition + 1] >>> 7 === 1) {
                        this.outputByte(inputValue);
                    } else {
                        var matchLength = inputValue & 31;
                        var matchDistance = void 0;
                        if (sequenceLengthIdentifier == 6) {
                            matchDistance = input[readPosition + 1];
                            readPosition += 1;
                        } else {
                            matchDistance = input[readPosition + 1] << 8 | input[readPosition + 2];
                            readPosition += 2;
                        }
                        var matchPosition = this.outputPosition - matchDistance;
                        for(var offset3 = 0; offset3 < matchLength; offset3++)this.outputByte(this.outputBuffer[matchPosition + offset3]);
                    }
                }
                this.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence();
                return LZUTF82.CompressionCommon.getCroppedBuffer(this.outputBuffer, outputStartPosition, this.outputPosition - outputStartPosition);
            };
            Decompressor3.prototype.outputByte = function(value) {
                if (this.outputPosition === this.outputBuffer.length) this.outputBuffer = LZUTF82.ArrayTools.doubleByteArrayCapacity(this.outputBuffer);
                this.outputBuffer[this.outputPosition++] = value;
            };
            Decompressor3.prototype.cropOutputBufferToWindowAndInitialize = function(initialCapacity) {
                if (!this.outputBuffer) {
                    this.outputBuffer = new Uint8Array(initialCapacity);
                    return 0;
                }
                var cropLength = Math.min(this.outputPosition, this.MaximumMatchDistance);
                this.outputBuffer = LZUTF82.CompressionCommon.getCroppedBuffer(this.outputBuffer, this.outputPosition - cropLength, cropLength, initialCapacity);
                this.outputPosition = cropLength;
                if (this.outputBufferRemainder) {
                    for(var i21 = 0; i21 < this.outputBufferRemainder.length; i21++)this.outputByte(this.outputBufferRemainder[i21]);
                    this.outputBufferRemainder = void 0;
                }
                return cropLength;
            };
            Decompressor3.prototype.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence = function() {
                for(var offset4 = 1; offset4 <= 4 && this.outputPosition - offset4 >= 0; offset4++){
                    var value = this.outputBuffer[this.outputPosition - offset4];
                    if (offset4 < 4 && value >>> 3 === 30 || offset4 < 3 && value >>> 4 === 14 || offset4 < 2 && value >>> 5 === 6) {
                        this.outputBufferRemainder = this.outputBuffer.subarray(this.outputPosition - offset4, this.outputPosition);
                        this.outputPosition -= offset4;
                        return;
                    }
                }
            };
            return Decompressor3;
        }();
        LZUTF82.Decompressor = Decompressor2;
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(Base64) {
                var charCodeMap = new Uint8Array([
                    65,
                    66,
                    67,
                    68,
                    69,
                    70,
                    71,
                    72,
                    73,
                    74,
                    75,
                    76,
                    77,
                    78,
                    79,
                    80,
                    81,
                    82,
                    83,
                    84,
                    85,
                    86,
                    87,
                    88,
                    89,
                    90,
                    97,
                    98,
                    99,
                    100,
                    101,
                    102,
                    103,
                    104,
                    105,
                    106,
                    107,
                    108,
                    109,
                    110,
                    111,
                    112,
                    113,
                    114,
                    115,
                    116,
                    117,
                    118,
                    119,
                    120,
                    121,
                    122,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    43,
                    47
                ]);
                var reverseCharCodeMap = new Uint8Array([
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    62,
                    255,
                    255,
                    255,
                    63,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    58,
                    59,
                    60,
                    61,
                    255,
                    255,
                    255,
                    0,
                    255,
                    255,
                    255,
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    255,
                    255,
                    255,
                    255,
                    255,
                    255,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31,
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    255,
                    255,
                    255,
                    255
                ]);
                var paddingCharacter = "=";
                var paddingCharCode = 61;
                Base64.encode = function(inputBytes) {
                    if (!inputBytes || inputBytes.length == 0) return "";
                    if (LZUTF82.runningInNodeJS()) {
                        return LZUTF82.BufferTools.uint8ArrayToBuffer(inputBytes).toString("base64");
                    } else {
                        return Base64.encodeWithJS(inputBytes);
                    }
                };
                Base64.decode = function(base64String) {
                    if (!base64String) return new Uint8Array(0);
                    if (LZUTF82.runningInNodeJS()) {
                        return LZUTF82.BufferTools.bufferToUint8Array(Buffer4.from(base64String, "base64"));
                    } else {
                        return Base64.decodeWithJS(base64String);
                    }
                };
                Base64.encodeWithJS = function(inputBytes, addPadding) {
                    if (addPadding === void 0) {
                        addPadding = true;
                    }
                    if (!inputBytes || inputBytes.length == 0) return "";
                    var map = charCodeMap;
                    var output = new LZUTF82.StringBuilder();
                    var uint24;
                    for(var readPosition = 0, length_5 = inputBytes.length; readPosition < length_5; readPosition += 3){
                        if (readPosition <= length_5 - 3) {
                            uint24 = inputBytes[readPosition] << 16 | inputBytes[readPosition + 1] << 8 | inputBytes[readPosition + 2];
                            output.appendCharCode(map[uint24 >>> 18 & 63]);
                            output.appendCharCode(map[uint24 >>> 12 & 63]);
                            output.appendCharCode(map[uint24 >>> 6 & 63]);
                            output.appendCharCode(map[uint24 & 63]);
                            uint24 = 0;
                        } else if (readPosition === length_5 - 2) {
                            uint24 = inputBytes[readPosition] << 16 | inputBytes[readPosition + 1] << 8;
                            output.appendCharCode(map[uint24 >>> 18 & 63]);
                            output.appendCharCode(map[uint24 >>> 12 & 63]);
                            output.appendCharCode(map[uint24 >>> 6 & 63]);
                            if (addPadding) output.appendCharCode(paddingCharCode);
                        } else if (readPosition === length_5 - 1) {
                            uint24 = inputBytes[readPosition] << 16;
                            output.appendCharCode(map[uint24 >>> 18 & 63]);
                            output.appendCharCode(map[uint24 >>> 12 & 63]);
                            if (addPadding) {
                                output.appendCharCode(paddingCharCode);
                                output.appendCharCode(paddingCharCode);
                            }
                        }
                    }
                    return output.getOutputString();
                };
                Base64.decodeWithJS = function(base64String, outputBuffer) {
                    if (!base64String || base64String.length == 0) return new Uint8Array(0);
                    var lengthModulo4 = base64String.length % 4;
                    if (lengthModulo4 === 1) throw new Error("Invalid Base64 string: length % 4 == 1");
                    else if (lengthModulo4 === 2) base64String += paddingCharacter + paddingCharacter;
                    else if (lengthModulo4 === 3) base64String += paddingCharacter;
                    if (!outputBuffer) outputBuffer = new Uint8Array(base64String.length);
                    var outputPosition = 0;
                    var length1 = base64String.length;
                    for(var i22 = 0; i22 < length1; i22 += 4){
                        var uint24 = reverseCharCodeMap[base64String.charCodeAt(i22)] << 18 | reverseCharCodeMap[base64String.charCodeAt(i22 + 1)] << 12 | reverseCharCodeMap[base64String.charCodeAt(i22 + 2)] << 6 | reverseCharCodeMap[base64String.charCodeAt(i22 + 3)];
                        outputBuffer[outputPosition++] = uint24 >>> 16 & 255;
                        outputBuffer[outputPosition++] = uint24 >>> 8 & 255;
                        outputBuffer[outputPosition++] = uint24 & 255;
                    }
                    if (base64String.charCodeAt(length1 - 1) == paddingCharCode) outputPosition--;
                    if (base64String.charCodeAt(length1 - 2) == paddingCharCode) outputPosition--;
                    return outputBuffer.subarray(0, outputPosition);
                };
            })(Encoding2.Base64 || (Encoding2.Base64 = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(BinaryString) {
                BinaryString.encode = function(input) {
                    if (input == null) throw new TypeError("BinaryString.encode: undefined or null input received");
                    if (input.length === 0) return "";
                    var inputLength = input.length;
                    var outputStringBuilder = new LZUTF82.StringBuilder();
                    var remainder = 0;
                    var state1 = 1;
                    for(var i22 = 0; i22 < inputLength; i22 += 2){
                        var value = void 0;
                        if (i22 == inputLength - 1) value = input[i22] << 8;
                        else value = input[i22] << 8 | input[i22 + 1];
                        outputStringBuilder.appendCharCode(remainder << 16 - state1 | value >>> state1);
                        remainder = value & (1 << state1) - 1;
                        if (state1 === 15) {
                            outputStringBuilder.appendCharCode(remainder);
                            remainder = 0;
                            state1 = 1;
                        } else {
                            state1 += 1;
                        }
                        if (i22 >= inputLength - 2) outputStringBuilder.appendCharCode(remainder << 16 - state1);
                    }
                    outputStringBuilder.appendCharCode(32768 | inputLength % 2);
                    return outputStringBuilder.getOutputString();
                };
                BinaryString.decode = function(input) {
                    if (typeof input !== "string") throw new TypeError("BinaryString.decode: invalid input type");
                    if (input == "") return new Uint8Array(0);
                    var output = new Uint8Array(input.length * 3);
                    var outputPosition = 0;
                    var appendToOutput = function(value2) {
                        output[outputPosition++] = value2 >>> 8;
                        output[outputPosition++] = value2 & 255;
                    };
                    var remainder = 0;
                    var state1 = 0;
                    for(var i22 = 0; i22 < input.length; i22++){
                        var value = input.charCodeAt(i22);
                        if (value >= 32768) {
                            if (value == (32768 | 1)) outputPosition--;
                            state1 = 0;
                            continue;
                        }
                        if (state1 == 0) {
                            remainder = value;
                        } else {
                            appendToOutput(remainder << state1 | value >>> 15 - state1);
                            remainder = value & (1 << 15 - state1) - 1;
                        }
                        if (state1 == 15) state1 = 0;
                        else state1 += 1;
                    }
                    return output.subarray(0, outputPosition);
                };
            })(Encoding2.BinaryString || (Encoding2.BinaryString = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(CodePoint) {
                CodePoint.encodeFromString = function(str, position) {
                    var charCode = str.charCodeAt(position);
                    if (charCode < 55296 || charCode > 56319) return charCode;
                    else {
                        var nextCharCode = str.charCodeAt(position + 1);
                        if (nextCharCode >= 56320 && nextCharCode <= 57343) return 65536 + ((charCode - 55296 << 10) + (nextCharCode - 56320));
                        else throw new Error("getUnicodeCodePoint: Received a lead surrogate character, char code " + charCode + ", followed by " + nextCharCode + ", which is not a trailing surrogate character code.");
                    }
                };
                CodePoint.decodeToString = function(codePoint) {
                    if (codePoint <= 65535) return String.fromCharCode(codePoint);
                    else if (codePoint <= 1114111) return String.fromCharCode(55296 + (codePoint - 65536 >>> 10), 56320 + (codePoint - 65536 & 1023));
                    else throw new Error("getStringFromUnicodeCodePoint: A code point of " + codePoint + " cannot be encoded in UTF-16");
                };
            })(Encoding2.CodePoint || (Encoding2.CodePoint = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(DecimalString) {
                var lookupTable = [
                    "000",
                    "001",
                    "002",
                    "003",
                    "004",
                    "005",
                    "006",
                    "007",
                    "008",
                    "009",
                    "010",
                    "011",
                    "012",
                    "013",
                    "014",
                    "015",
                    "016",
                    "017",
                    "018",
                    "019",
                    "020",
                    "021",
                    "022",
                    "023",
                    "024",
                    "025",
                    "026",
                    "027",
                    "028",
                    "029",
                    "030",
                    "031",
                    "032",
                    "033",
                    "034",
                    "035",
                    "036",
                    "037",
                    "038",
                    "039",
                    "040",
                    "041",
                    "042",
                    "043",
                    "044",
                    "045",
                    "046",
                    "047",
                    "048",
                    "049",
                    "050",
                    "051",
                    "052",
                    "053",
                    "054",
                    "055",
                    "056",
                    "057",
                    "058",
                    "059",
                    "060",
                    "061",
                    "062",
                    "063",
                    "064",
                    "065",
                    "066",
                    "067",
                    "068",
                    "069",
                    "070",
                    "071",
                    "072",
                    "073",
                    "074",
                    "075",
                    "076",
                    "077",
                    "078",
                    "079",
                    "080",
                    "081",
                    "082",
                    "083",
                    "084",
                    "085",
                    "086",
                    "087",
                    "088",
                    "089",
                    "090",
                    "091",
                    "092",
                    "093",
                    "094",
                    "095",
                    "096",
                    "097",
                    "098",
                    "099",
                    "100",
                    "101",
                    "102",
                    "103",
                    "104",
                    "105",
                    "106",
                    "107",
                    "108",
                    "109",
                    "110",
                    "111",
                    "112",
                    "113",
                    "114",
                    "115",
                    "116",
                    "117",
                    "118",
                    "119",
                    "120",
                    "121",
                    "122",
                    "123",
                    "124",
                    "125",
                    "126",
                    "127",
                    "128",
                    "129",
                    "130",
                    "131",
                    "132",
                    "133",
                    "134",
                    "135",
                    "136",
                    "137",
                    "138",
                    "139",
                    "140",
                    "141",
                    "142",
                    "143",
                    "144",
                    "145",
                    "146",
                    "147",
                    "148",
                    "149",
                    "150",
                    "151",
                    "152",
                    "153",
                    "154",
                    "155",
                    "156",
                    "157",
                    "158",
                    "159",
                    "160",
                    "161",
                    "162",
                    "163",
                    "164",
                    "165",
                    "166",
                    "167",
                    "168",
                    "169",
                    "170",
                    "171",
                    "172",
                    "173",
                    "174",
                    "175",
                    "176",
                    "177",
                    "178",
                    "179",
                    "180",
                    "181",
                    "182",
                    "183",
                    "184",
                    "185",
                    "186",
                    "187",
                    "188",
                    "189",
                    "190",
                    "191",
                    "192",
                    "193",
                    "194",
                    "195",
                    "196",
                    "197",
                    "198",
                    "199",
                    "200",
                    "201",
                    "202",
                    "203",
                    "204",
                    "205",
                    "206",
                    "207",
                    "208",
                    "209",
                    "210",
                    "211",
                    "212",
                    "213",
                    "214",
                    "215",
                    "216",
                    "217",
                    "218",
                    "219",
                    "220",
                    "221",
                    "222",
                    "223",
                    "224",
                    "225",
                    "226",
                    "227",
                    "228",
                    "229",
                    "230",
                    "231",
                    "232",
                    "233",
                    "234",
                    "235",
                    "236",
                    "237",
                    "238",
                    "239",
                    "240",
                    "241",
                    "242",
                    "243",
                    "244",
                    "245",
                    "246",
                    "247",
                    "248",
                    "249",
                    "250",
                    "251",
                    "252",
                    "253",
                    "254",
                    "255"
                ];
                DecimalString.encode = function(binaryBytes) {
                    var resultArray = [];
                    for(var i22 = 0; i22 < binaryBytes.length; i22++)resultArray.push(lookupTable[binaryBytes[i22]]);
                    return resultArray.join(" ");
                };
            })(Encoding2.DecimalString || (Encoding2.DecimalString = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(StorageBinaryString) {
                StorageBinaryString.encode = function(input) {
                    return Encoding2.BinaryString.encode(input).replace(/\0/g, "\u8002");
                };
                StorageBinaryString.decode = function(input) {
                    return Encoding2.BinaryString.decode(input.replace(/\u8002/g, "\0"));
                };
            })(Encoding2.StorageBinaryString || (Encoding2.StorageBinaryString = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        (function(Encoding2) {
            (function(UTF8) {
                var nativeTextEncoder;
                var nativeTextDecoder;
                UTF8.encode = function(str) {
                    if (!str || str.length == 0) return new Uint8Array(0);
                    if (LZUTF82.runningInNodeJS()) {
                        return LZUTF82.BufferTools.bufferToUint8Array(Buffer4.from(str, "utf8"));
                    } else if (UTF8.createNativeTextEncoderAndDecoderIfAvailable()) {
                        return nativeTextEncoder.encode(str);
                    } else {
                        return UTF8.encodeWithJS(str);
                    }
                };
                UTF8.decode = function(utf8Bytes) {
                    if (!utf8Bytes || utf8Bytes.length == 0) return "";
                    if (LZUTF82.runningInNodeJS()) {
                        return LZUTF82.BufferTools.uint8ArrayToBuffer(utf8Bytes).toString("utf8");
                    } else if (UTF8.createNativeTextEncoderAndDecoderIfAvailable()) {
                        return nativeTextDecoder.decode(utf8Bytes);
                    } else {
                        return UTF8.decodeWithJS(utf8Bytes);
                    }
                };
                UTF8.encodeWithJS = function(str, outputArray) {
                    if (!str || str.length == 0) return new Uint8Array(0);
                    if (!outputArray) outputArray = new Uint8Array(str.length * 4);
                    var writeIndex = 0;
                    for(var readIndex = 0; readIndex < str.length; readIndex++){
                        var charCode = Encoding2.CodePoint.encodeFromString(str, readIndex);
                        if (charCode <= 127) {
                            outputArray[writeIndex++] = charCode;
                        } else if (charCode <= 2047) {
                            outputArray[writeIndex++] = 192 | charCode >>> 6;
                            outputArray[writeIndex++] = 128 | charCode & 63;
                        } else if (charCode <= 65535) {
                            outputArray[writeIndex++] = 224 | charCode >>> 12;
                            outputArray[writeIndex++] = 128 | charCode >>> 6 & 63;
                            outputArray[writeIndex++] = 128 | charCode & 63;
                        } else if (charCode <= 1114111) {
                            outputArray[writeIndex++] = 240 | charCode >>> 18;
                            outputArray[writeIndex++] = 128 | charCode >>> 12 & 63;
                            outputArray[writeIndex++] = 128 | charCode >>> 6 & 63;
                            outputArray[writeIndex++] = 128 | charCode & 63;
                            readIndex++;
                        } else throw new Error("Invalid UTF-16 string: Encountered a character unsupported by UTF-8/16 (RFC 3629)");
                    }
                    return outputArray.subarray(0, writeIndex);
                };
                UTF8.decodeWithJS = function(utf8Bytes, startOffset, endOffset) {
                    if (startOffset === void 0) {
                        startOffset = 0;
                    }
                    if (!utf8Bytes || utf8Bytes.length == 0) return "";
                    if (endOffset === void 0) endOffset = utf8Bytes.length;
                    var output = new LZUTF82.StringBuilder();
                    var outputCodePoint;
                    var leadByte;
                    for(var readIndex = startOffset, length_6 = endOffset; readIndex < length_6;){
                        leadByte = utf8Bytes[readIndex];
                        if (leadByte >>> 7 === 0) {
                            outputCodePoint = leadByte;
                            readIndex += 1;
                        } else if (leadByte >>> 5 === 6) {
                            if (readIndex + 1 >= endOffset) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + readIndex);
                            outputCodePoint = (leadByte & 31) << 6 | utf8Bytes[readIndex + 1] & 63;
                            readIndex += 2;
                        } else if (leadByte >>> 4 === 14) {
                            if (readIndex + 2 >= endOffset) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + readIndex);
                            outputCodePoint = (leadByte & 15) << 12 | (utf8Bytes[readIndex + 1] & 63) << 6 | utf8Bytes[readIndex + 2] & 63;
                            readIndex += 3;
                        } else if (leadByte >>> 3 === 30) {
                            if (readIndex + 3 >= endOffset) throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position " + readIndex);
                            outputCodePoint = (leadByte & 7) << 18 | (utf8Bytes[readIndex + 1] & 63) << 12 | (utf8Bytes[readIndex + 2] & 63) << 6 | utf8Bytes[readIndex + 3] & 63;
                            readIndex += 4;
                        } else throw new Error("Invalid UTF-8 stream: An invalid lead byte value encountered at position " + readIndex);
                        output.appendCodePoint(outputCodePoint);
                    }
                    return output.getOutputString();
                };
                UTF8.createNativeTextEncoderAndDecoderIfAvailable = function() {
                    if (nativeTextEncoder) return true;
                    if (typeof TextEncoder == "function") {
                        nativeTextEncoder = new TextEncoder("utf-8");
                        nativeTextDecoder = new TextDecoder("utf-8");
                        return true;
                    } else return false;
                };
            })(Encoding2.UTF8 || (Encoding2.UTF8 = {
            }));
        })(LZUTF82.Encoding || (LZUTF82.Encoding = {
        }));
    })(LZUTF8 || (LZUTF8 = {
    }));
    var LZUTF8;
    (function(LZUTF82) {
        function compress2(input, options3) {
            if (options3 === void 0) {
                options3 = {
                };
            }
            if (input == null) throw new TypeError("compress: undefined or null input received");
            var inputEncoding = LZUTF82.CompressionCommon.detectCompressionSourceEncoding(input);
            options3 = LZUTF82.ObjectTools.override({
                inputEncoding,
                outputEncoding: "ByteArray"
            }, options3);
            var compressor = new LZUTF82.Compressor();
            var compressedBytes = compressor.compressBlock(input);
            return LZUTF82.CompressionCommon.encodeCompressedBytes(compressedBytes, options3.outputEncoding);
        }
        LZUTF82.compress = compress2;
        function decompress2(input, options3) {
            if (options3 === void 0) {
                options3 = {
                };
            }
            if (input == null) throw new TypeError("decompress: undefined or null input received");
            options3 = LZUTF82.ObjectTools.override({
                inputEncoding: "ByteArray",
                outputEncoding: "String"
            }, options3);
            var inputBytes = LZUTF82.CompressionCommon.decodeCompressedBytes(input, options3.inputEncoding);
            var decompressor = new LZUTF82.Decompressor();
            var decompressedBytes = decompressor.decompressBlock(inputBytes);
            return LZUTF82.CompressionCommon.encodeDecompressedBytes(decompressedBytes, options3.outputEncoding);
        }
        LZUTF82.decompress = decompress2;
        function compressAsync2(input, options3, callback) {
            if (callback == null) callback = function() {
            };
            var inputEncoding;
            try {
                inputEncoding = LZUTF82.CompressionCommon.detectCompressionSourceEncoding(input);
            } catch (e) {
                callback(void 0, e);
                return;
            }
            options3 = LZUTF82.ObjectTools.override({
                inputEncoding,
                outputEncoding: "ByteArray",
                useWebWorker: true,
                blockSize: 65536
            }, options3);
            LZUTF82.enqueueImmediate(function() {
                if (options3.useWebWorker && LZUTF82.WebWorker.createGlobalWorkerIfNeeded()) {
                    LZUTF82.WebWorker.compressAsync(input, options3, callback);
                } else {
                    LZUTF82.AsyncCompressor.compressAsync(input, options3, callback);
                }
            });
        }
        LZUTF82.compressAsync = compressAsync2;
        function decompressAsync2(input, options3, callback) {
            if (callback == null) callback = function() {
            };
            if (input == null) {
                callback(void 0, new TypeError("decompressAsync: undefined or null input received"));
                return;
            }
            options3 = LZUTF82.ObjectTools.override({
                inputEncoding: "ByteArray",
                outputEncoding: "String",
                useWebWorker: true,
                blockSize: 65536
            }, options3);
            var normalizedInput = LZUTF82.BufferTools.convertToUint8ArrayIfNeeded(input);
            LZUTF82.EventLoop.enqueueImmediate(function() {
                if (options3.useWebWorker && LZUTF82.WebWorker.createGlobalWorkerIfNeeded()) {
                    LZUTF82.WebWorker.decompressAsync(normalizedInput, options3, callback);
                } else {
                    LZUTF82.AsyncDecompressor.decompressAsync(input, options3, callback);
                }
            });
        }
        LZUTF82.decompressAsync = decompressAsync2;
        function createCompressionStream2() {
            return LZUTF82.AsyncCompressor.createCompressionStream();
        }
        LZUTF82.createCompressionStream = createCompressionStream2;
        function createDecompressionStream2() {
            return LZUTF82.AsyncDecompressor.createDecompressionStream();
        }
        LZUTF82.createDecompressionStream = createDecompressionStream2;
        function encodeUTF82(str) {
            return LZUTF82.Encoding.UTF8.encode(str);
        }
        LZUTF82.encodeUTF8 = encodeUTF82;
        function decodeUTF82(input) {
            return LZUTF82.Encoding.UTF8.decode(input);
        }
        LZUTF82.decodeUTF8 = decodeUTF82;
        function encodeBase642(input) {
            return LZUTF82.Encoding.Base64.encode(input);
        }
        LZUTF82.encodeBase64 = encodeBase642;
        function decodeBase642(str) {
            return LZUTF82.Encoding.Base64.decode(str);
        }
        LZUTF82.decodeBase64 = decodeBase642;
        function encodeBinaryString2(input) {
            return LZUTF82.Encoding.BinaryString.encode(input);
        }
        LZUTF82.encodeBinaryString = encodeBinaryString2;
        function decodeBinaryString2(str) {
            return LZUTF82.Encoding.BinaryString.decode(str);
        }
        LZUTF82.decodeBinaryString = decodeBinaryString2;
        function encodeStorageBinaryString2(input) {
            return LZUTF82.Encoding.StorageBinaryString.encode(input);
        }
        LZUTF82.encodeStorageBinaryString = encodeStorageBinaryString2;
        function decodeStorageBinaryString2(str) {
            return LZUTF82.Encoding.StorageBinaryString.decode(str);
        }
        LZUTF82.decodeStorageBinaryString = decodeStorageBinaryString2;
    })(LZUTF8 || (LZUTF8 = {
    }));
});
const getDistance3 = (p1, p2)=>Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
;
const getAngle3 = (p1, p2)=>180 / Math.PI * Math.atan2(p2.y - p1.y, p2.x - p1.x)
;
const round3 = (x, precision = 1)=>Math.round(x * precision) / precision
;
const negate1 = (x)=>x < 0 ? `~${x.toString().substring(1)}` : x
;
function pauseEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}
function getStartEndSelection(editor) {
    const cursor = editor.getCursor();
    const line1 = cursor.line;
    let token = editor.getTokenAt(cursor);
    let start = {
        line: line1,
        ch: token.start
    };
    let end2 = {
        line: line1,
        ch: token.end
    };
    if (token.type !== "number") {
        token = editor.getTokenAt({
            line: line1,
            ch: token.end + 1
        });
        start = {
            line: line1,
            ch: token.start
        };
        end2 = {
            line: line1,
            ch: token.end
        };
    }
    return {
        start,
        end: end2
    };
}
function addImgPanZoom(body) {
    let mousedown = false;
    let scale3 = 1;
    let pointX = 0;
    let pointY = 0;
    let start = {
        x: 0,
        y: 0
    };
    function setTransform(el) {
        el.style.transformOrigin = `${0}px ${0}px`;
        el.style.transform = "translate(" + pointX + "px, " + pointY + "px) scale(" + scale3 + ")";
    }
    body.on("mousedown", "#viewer", (e)=>{
        mousedown = true;
        start = {
            x: e.offsetX - pointX,
            y: e.offsetY - pointY
        };
    });
    body.on("mousemove", "#viewer", (e)=>{
        if (!mousedown) return;
        pointX = e.offsetX - start.x;
        pointY = e.offsetY - start.y;
        const imgs = document.querySelectorAll(".resize-manual");
        for (const img of imgs){
            setTransform(img);
        }
    });
    body.on("mouseup", "#viewer", (evt)=>{
        mousedown = false;
    });
    body.on("wheel", "#viewer", (e)=>{
        let xs = (e.offsetX - pointX) / scale3;
        let ys = (e.offsetY - pointY) / scale3;
        let delta = Math.sign(e.deltaY) > 0 ? -1 : 1;
        if (delta > 0) scale3 *= 1.03;
        else scale3 /= 1.03;
        pointX = e.offsetX - xs * scale3;
        pointY = e.offsetY - ys * scale3;
        const imgs = document.querySelectorAll(".resize-manual");
        for (const img of imgs){
            setTransform(img);
        }
    });
    body.on("keydown", (e)=>{
        let code = e.code;
        if (code === "Backspace" && event.shiftKey) {
            event.preventDefault();
            const imgs = document.querySelectorAll(".resize-manual");
            for (const img of imgs){
                img.remove();
            }
        }
    });
}
function addEvents(state1) {
    document.getElementById("run").addEventListener("click", ()=>dispatch("RUN")
    );
    document.getElementById("center").addEventListener("click", function() {
        const extrema1 = minsMaxes(state1.turtles);
        state1.svgCloth.focusOn(extrema1);
    });
    document.getElementById("downloadSVG").addEventListener("click", function() {
        downloadSVG(state1.name, state1.turtles, state1.codemirror.getValue());
    });
    document.getElementById("downloadTxt").addEventListener("click", function() {
        download(`${state1.name}.txt`, state1.codemirror.getValue());
    });
    function copy4(str) {
        const inp = document.createElement('input');
        document.body.appendChild(inp);
        inp.value = str;
        inp.select();
        document.execCommand('copy', false);
        inp.remove();
    }
    document.getElementById("download-url").addEventListener("click", function() {
        const rawCode = state1.codemirror.getValue();
        const encoded = lzutf8.compress(rawCode, {
            outputEncoding: "StorageBinaryString"
        });
        copy4(`https://leomcelroy.com/gram/?code=${encoded}`);
        state1.consoleMessage = {
            error: false,
            value: `URL copied to clipboard.\n\nThere is a size limit for URL files.\n\nFor reliable saving download txt.`
        };
        dispatch("RENDER");
    });
    document.getElementById("show-turtles").addEventListener("click", function() {
        state1.showTurtles = !state1.showTurtles;
        dispatch("RENDER");
    });
    document.getElementById("show-dimensions").addEventListener("click", function() {
        state1.showDimensions = !state1.showDimensions;
        dispatch("RENDER");
    });
    document.getElementById("draw").addEventListener("click", function() {
        state1.draw = !state1.draw;
        dispatch("RENDER");
    });
    document.getElementById("experimental").addEventListener("click", function() {
        state1.experimental = !state1.experimental;
        dispatch("RENDER");
    });
    document.getElementById("grid").addEventListener("click", function() {
        state1.grid = !state1.grid;
        dispatch("RENDER");
    });
    document.getElementById("hints").addEventListener("click", function() {
        state1.hints = !state1.hints;
        dispatch("RENDER");
    });
    document.getElementById("autorun").addEventListener("click", function() {
        state1.autorun = !state1.autorun;
        dispatch("RENDER");
    });
    document.addEventListener("keydown", function(event) {
        let code = event.code;
        if (code === "Enter" && event.shiftKey) {
            event.preventDefault();
            dispatch("RUN");
        }
    });
    document.addEventListener("keyup", function(event) {
        let code = event.code;
        if (state1.autorun) dispatch("RUN");
        if (state1.directEditHandle.line !== -1) dispatch("CHANGE_DIRECT_EDIT_HANDLE", {
            type: ""
        });
    });
    const body = new Delegate(document.body);
    body.on("mousedown", (e)=>{
        if (e.detail === 1) state1.lastClickedLine = state1.codemirror.getCursor().line;
        if (e.detail === 3 && state1.experimental) {
            const text3 = state1.codemirror.getSelection();
            dispatch("CHANGE_DIRECT_EDIT_HANDLE", {
                type: ""
            });
            if (!text3) return;
            const { prog: ast  } = parse(text3);
            const line1 = state1.lastClickedLine;
            const [cmd, ...args] = ast;
            if (!cmd) return;
            const { value , type: type3  } = cmd;
            const HANDLEABLE = [
                "turnforward",
                "goto",
                "arc",
                "rotate",
                "scale",
                "translate",
                "move"
            ];
            if (type3 === "symbol") {
                if (HANDLEABLE.includes(value.toLowerCase())) {
                    dispatch("CHANGE_DIRECT_EDIT_HANDLE", {
                        type: value.toLowerCase(),
                        line: line1,
                        col: cmd.loc.col,
                        args
                    }, false);
                }
            }
        }
    });
    body.on("mousedown", "#inner-svg-view", (e)=>{
        if (state1.draw) {
            const newPoint = state1.svgCloth.getPoint(e);
            const code = state1.codemirror.getValue();
            const ast = parse(code).prog;
            const lastTurtle = state1.turtles[0];
            const lastPoint = lastTurtle.end;
            newPoint.y = -newPoint.y;
            const lastAngle1 = lastTurtle.angle;
            const d = getDistance3(newPoint, lastPoint);
            const a = getAngle3(newPoint, lastPoint) - lastAngle1 + 180;
            const newCode = code + `\nturnforward ${negate1(round3(a))} ${negate1(round3(d))}`;
            state1.codemirror.setValue(newCode);
            dispatch("RUN");
        }
    });
    body.on("mousemove", "#inner-svg-view", (e)=>{
        if (state1.draw) {
            const newPoint = state1.svgCloth.getPoint(e);
            const lastTurtle = state1.turtles[0].copy();
            const lastPoint = lastTurtle.end;
            newPoint.y = -newPoint.y;
            const lastAngle1 = lastTurtle.angle;
            const d = getDistance3(newPoint, lastPoint);
            const a = getAngle3(newPoint, lastPoint) - lastAngle1 + 180;
            lastTurtle.turnForward(a, d);
            const tempLine = [
                lastTurtle.pointsFromLast(1),
                lastTurtle.pointsFromLast(0)
            ];
            state1.tempLine = tempLine;
            dispatch("RENDER");
        } else if (state1.directEditHandle.dragging) {
            const mouseLocation = state1.svgCloth.getPoint(e);
            const newLine = handleLineMaker(state1.directEditHandle, mouseLocation);
            var doc = state1.codemirror.getDoc();
            const { line: line1  } = state1.directEditHandle;
            var lineContents = doc.getLine(line1);
            var pos = {
                line: line1,
                ch: lineContents.length
            };
            doc.replaceRange(newLine, {
                line: line1,
                ch: 0
            }, pos);
            dispatch("RUN");
        }
    });
    body.on("mousedown", ".cm-number", (e)=>{
        state1.dragTarget = Number(e.target.innerHTML);
    });
    body.on("mousemove", (e)=>{
        if (state1.dragTarget === "#vertical-bar") {
            const dx = e.movementX / window.innerWidth * 100;
            let cur = getComputedStyle(document.documentElement).getPropertyValue('--vertical-bar').slice(0, -1);
            cur = parseFloat(cur);
            let x = cur + dx;
            const minX = 0;
            const maxX = 99;
            if (x < 0) x = minX;
            if (x > 99) x = maxX;
            document.documentElement.style.setProperty("--vertical-bar", `${x}%`);
            pauseEvent(e);
        } else if (state1.dragTarget !== undefined) {
            state1.dragTarget += e.movementX;
            if (state1.dragTarget < 0) state1.dragTarget = 0;
            const { start , end: end2  } = getStartEndSelection(state1.codemirror);
            state1.codemirror.getDoc().replaceRange(`${state1.dragTarget}`, start, end2);
            dispatch("RUN");
            if (state1.directEditHandle.line !== -1) dispatch("CHANGE_DIRECT_EDIT_HANDLE", {
                type: ""
            });
            pauseEvent(e);
        }
    });
    body.on("mouseleave", (e)=>{
        if (state1.dragTarget !== undefined) state1.dragTarget = undefined;
    });
    body.on("mouseup", (e)=>{
        if (state1.dragTarget !== undefined) state1.dragTarget = undefined;
        if (state1.directEditHandle.dragging) state1.directEditHandle.dragging = false;
    });
    body.on("mousedown", "#vertical-bar", function(evt) {
        state1.dragTarget = "#vertical-bar";
    });
    body.on("drop", function(evt) {
        let dt = evt.dataTransfer;
        let files = dt.files;
        upload(files);
        pauseEvent(evt);
    });
    body.on("dragover", function(evt) {
        pauseEvent(evt);
    });
    body.on("keyup", ".name", function(evt) {
        dispatch("CHANGE_NAME", {
            name: evt.target.value
        });
    });
    addImgPanZoom(body);
    window.onbeforeunload = function() {
        return "Are you sure? You will lose work you haven't downloaded.";
    };
}
class svgCloth {
    constructor(){
        this.pan = true;
        this.grid = false;
        this.mousedown = false;
        this.clickedTarget = "";
        this.viewBox = {
            v0: 0,
            v1: 0,
            v2: 500,
            v3: 500
        };
        this.rulers = {
            draw: false,
            mouseLoc: {
                x: 0,
                y: 0
            },
            w: 0,
            h: 0,
            corners: undefined
        };
    }
    getPoint(event) {
        return getSVGpoint(event);
    }
    getInitScaleWithViewer() {
        const svg1 = document.getElementById("inner-svg-view");
        let initScale = 1;
        if (svg1) {
            const w = Number(svg1.getAttribute("width").replace("px", ""));
            let vw = this.viewBox.v2;
            initScale = vw / w;
        }
        return initScale;
    }
    setPan(bool) {
        this.pan = bool;
    }
    focusOn(boundingBox) {
        var svg1 = document.getElementById("inner-svg-view");
        let viewer = document.getElementById("svg-view");
        let { xMin , xMax , yMin , yMax  } = boundingBox;
        let temp = yMax;
        yMax = -yMin;
        yMin = -temp;
        let newWidth = Math.abs(xMax - xMin) / (viewer.clientWidth / svg1.width.baseVal.value);
        let newHeight = Math.abs(yMax - yMin) / (viewer.clientHeight / svg1.height.baseVal.value);
        let v2v3 = newWidth > newHeight ? newWidth : newHeight;
        this.viewBox.v0 = xMin - viewer.clientWidth * v2v3 / 10000 / 2 + Math.abs(xMax - xMin) / 2;
        this.viewBox.v1 = yMin - viewer.clientHeight * v2v3 / 10000 / 2 + Math.abs(yMax - yMin) / 2;
        this.viewBox.v2 = v2v3;
        this.viewBox.v3 = v2v3;
        svg1.setAttribute("viewBox", `${this.viewBox.v0} ${this.viewBox.v1} ${this.viewBox.v2} ${this.viewBox.v3}`);
        let w2 = Number(svg1.getAttribute("width").replace("px", ""));
        let vw = this.viewBox.v2;
        let headScale = vw / w2;
        let els = document.getElementsByClassName("scale-with-viewer");
        for(let i22 = 0; i22 < els.length; i22++){
            let current = els[i22].getAttribute("transform");
            current = current.replace(/scale\([0-9]*.*[0-9]*\)/, `scale(${headScale})`);
            els[i22].setAttribute("transform", current);
        }
        if (this.grid) setRulers({
            x: 0,
            y: 0
        }, this);
    }
    download() {
    }
    draw(content) {
        return html`\n      <style>\n        #svg-view {\n          width: 100%;\n          height: 100%;\n          overflow: hidden;\n          border: dashed 2px black;\n          box-sizing: border-box;\n        }\n\n        .noselect {\n          -webkit-touch-callout: none; /* iOS Safari */\n            -webkit-user-select: none; /* Safari */\n             -khtml-user-select: none; /* Konqueror HTML */\n               -moz-user-select: none; /* Old versions of Firefox */\n                -ms-user-select: none; /* Internet Explorer/Edge */\n                    user-select: none; /* Non-prefixed version, currently\n                                          supported by Chrome, Edge, Opera and Firefox */\n        }\n\n\n        #inner-svg-view {\n          background: white;\n        }\n\n        #svg-top {\n          position: absolute;\n          left: 0px;\n          top: 2px;\n          background: white;\n        }\n\n        #svg-left {\n          position: absolute;\n          left: 2px;\n          top: 0px;\n          background: white;\n        }\n\n        #svg-rulers-corner {\n          position: absolute;\n          left: 0px;\n          top: 0px;\n          background: white;\n          border-left: dashed 2px black;\n          border-top: dashed 2px black;\n        }\n\n        .grid-line {}\n      </style>\n      <div id="svg-view">\n        ${svg`\n          <svg\n            id="inner-svg-view"\n            preserveAspectRatio="xMidYMid meet"\n            width=10000px\n            height=10000px\n            viewBox="${this.viewBox.v0} ${this.viewBox.v1} ${this.viewBox.v2} ${this.viewBox.v3}"\n            @wheel=${(e)=>{
            handleWheel(e, this.viewBox);
            if (this.grid) setRulers(getSVGpoint(e), this);
        }}\n            @mousemove=${(e)=>{
            const clickedHandle = this.clickedTarget && this.clickedTarget.classList.contains("handle");
            handleMouseMove(e, this.viewBox, this.mousedown && this.pan && !clickedHandle);
            if (this.grid) setRulers(getSVGpoint(e), this);
        }}\n            @mousedown=${(e)=>{
            this.mousedown = true;
            this.clickedTarget = e.target;
        }}\n            @mouseup=${(e)=>{
            this.mousedown = false;
            this.clickedTarget = "";
        }}\n            @resize=${(e)=>{
        }}>\n\n            ${this.grid && this.rulers.draw ? [
            divisionsToLines(this.rulers),
            origin(this.rulers)
        ] : ""}\n            ${content}\n            ${this.grid && this.rulers.draw ? drawLocationGuides(this.rulers, this.getInitScaleWithViewer()) : ""}\n\n          </svg>\n          ${this.grid && this.rulers.draw ? drawRulers(this.rulers) : ""}\n        `}\n      </div>\n    `;
    }
}
function drawRulers(rulers) {
    return svg`\n    <svg width=100% height=20px id="svg-top">${divisionsToTop(rulers)}</svg>\n    <svg width=20px height=100% id="svg-left">${divisionsToLeft(rulers)}</svg>\n    <svg width=20px height=20px id="svg-rulers-corner"></svg>\n  `;
}
function getSVGpoint(evt) {
    var el = document.getElementById("inner-svg-view");
    var pt = el.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(el.getScreenCTM().inverse());
}
function getSVGPointFromPt(p) {
    var el = document.getElementById("inner-svg-view");
    var pt = el.createSVGPoint();
    pt.x = p.x;
    pt.y = p.y;
    return pt.matrixTransform(el.getScreenCTM().inverse());
}
function getCorners() {
    const outerSVG = document.getElementById("svg-view");
    if (outerSVG === null) return null;
    const { left , right , bottom , top  } = outerSVG.getBoundingClientRect();
    const rt = getSVGPointFromPt({
        x: right,
        y: top
    });
    rt.y = -rt.y;
    const lt1 = getSVGPointFromPt({
        x: left,
        y: top
    });
    lt1.y = -lt1.y;
    const rb = getSVGPointFromPt({
        x: right,
        y: bottom
    });
    rb.y = -rb.y;
    const lb = getSVGPointFromPt({
        x: left,
        y: bottom
    });
    lb.y = -lb.y;
    return {
        rt,
        lt: lt1,
        rb,
        lb
    };
}
function handleWheel(evt, viewBox) {
    evt.preventDefault();
    let scaleFactor = 1;
    if (evt.deltaY > 0) {
        scaleFactor = 1.03;
        viewBox.v2 *= scaleFactor;
        viewBox.v3 *= scaleFactor;
    } else {
        scaleFactor = 1.03;
        viewBox.v2 /= scaleFactor;
        viewBox.v3 /= scaleFactor;
    }
    var el = document.getElementById("inner-svg-view");
    let w = el.clientWidth;
    let h = el.clientHeight;
    let xFactor, yFactor, s;
    var rect1 = el.getBoundingClientRect();
    var x = evt.clientX - rect1.left;
    var y = evt.clientY - rect1.top;
    if (w > h) {
        s = Math.abs(0.5 - x / w);
        xFactor = viewBox.v2 / w;
        yFactor = viewBox.v3 / h;
    } else {
        s = Math.abs(0.5 - y / h);
        xFactor = viewBox.v2 / w;
        yFactor = viewBox.v3 / h;
    }
    let svgPoint = getSVGpoint(evt);
    viewBox.v0 = svgPoint.x - x * xFactor;
    viewBox.v1 = svgPoint.y - y * yFactor;
    el.setAttribute("viewBox", `${viewBox.v0} ${viewBox.v1} ${viewBox.v2} ${viewBox.v3}`);
    let w2 = Number(el.getAttribute("width").replace("px", ""));
    let vw = viewBox.v2;
    let headScale = vw / w2;
    let els = document.getElementsByClassName("scale-with-viewer");
    for(let i22 = 0; i22 < els.length; i22++){
        let current = els[i22].getAttribute("transform");
        current = current.replace(/scale\([0-9]*.*[0-9]*\)/, `scale(${headScale})`);
        els[i22].setAttribute("transform", current);
    }
}
function convert(n1) {
    var order = Math.floor(Math.log(n1) / Math.LN10 + 0.000000001);
    return Math.pow(10, order);
}
function setRulers(pt, that) {
    pt.y = -pt.y;
    const mouseLoc = pt;
    const draw1 = true;
    const corners = getCorners();
    const w = Math.abs(corners.lt.x - corners.rt.x);
    const h = Math.abs(corners.lt.y - corners.lb.y);
    const size = w < h ? w / 15 : h / 15;
    const orderMagW = convert(w);
    const stepW = orderMagW / 2;
    const orderMagH = convert(h);
    const stepH = orderMagH / 2;
    const step = stepW < stepH ? stepW : stepH;
    const r = (n1)=>step * Math.ceil(n1 / step)
    ;
    const wDivs = [];
    for(let i22 = r(corners.lt.x); i22 <= r(corners.rt.x); i22 += step)wDivs.push(i22);
    const hDivs = [];
    for(let i23 = r(corners.lb.y); i23 <= r(corners.lt.y); i23 += step)hDivs.push(i23);
    const outerSVG = document.getElementById("svg-view");
    if (outerSVG === null) return null;
    const bb = outerSVG.getBoundingClientRect();
    const actualWidth = bb.width;
    const actualHeight = bb.height;
    that.rulers = {
        draw: draw1,
        w,
        h,
        actualWidth,
        actualHeight,
        mouseLoc,
        size,
        corners,
        wDivs,
        hDivs
    };
    dispatch("RENDER");
}
function divisionsToLines({ wDivs , corners , size , hDivs , w , h  }) {
    return svg`<g>\n    ${wDivs.map((d)=>svg`\n        <line\n          class = "grid-line"\n          x1=${d} y1=${-corners.lt.y + h} \n          x2=${d} y2=${-corners.lt.y} \n          stroke="lightgrey"\n          vector-effect="non-scaling-stroke"/>\n    `
    )}\n    ${hDivs.map((d)=>svg`\n        <line \n          class = "grid-line"\n          x1=${corners.lt.x + w} y1=${-d} \n          x2=${corners.lt.x} y2=${-d} \n          stroke="lightgrey"\n          vector-effect="non-scaling-stroke"/>\n    `
    )}\n  </g>`;
}
const round4 = (x, precision = 1)=>Math.round(x * precision) / precision
;
function divisionsToTop(rulers) {
    const ws = rulers.wDivs;
    const odd = ws.indexOf(0) < 0 ? ws.length % 2 : ws.indexOf(0) % 2;
    return svg`\n    <g class="noselect" transform="translate(${-rulers.corners.lt.x / rulers.w * rulers.actualWidth}, 0)"">\n      ${ws.map((d, i22)=>svg`\n          <!--\n          <circle \n            cx="${d / rulers.w * rulers.actualWidth}" \n            cy="10" \n            r="4" \n            fill="black"/>\n          -->\n          <text \n            font-size="smaller"\n            text-anchor="middle" \n            x="${d / rulers.w * rulers.actualWidth}" \n            y="15">\n            ${ws.length < 8 || i22 % 2 === odd ? round4(d, 2) : ""}\n          </text>\n      `
    )}\n    </g>\n  `;
}
function divisionsToLeft(rulers) {
    const hs = rulers.hDivs;
    const odd = hs.indexOf(0) < 0 ? hs.length % 2 : hs.indexOf(0) % 2;
    return svg`\n    <g class="noselect" transform="translate(0, ${rulers.corners.lt.y / rulers.h * rulers.actualHeight})">\n      ${hs.map((d, i22)=>svg`\n          <text \n            font-size="smaller"\n            text-anchor="middle" \n            x="15" \n            y="${-d / rulers.h * rulers.actualHeight}"\n            transform-origin="${15} ${-d / rulers.h * rulers.actualHeight}"\n            transform="rotate(-90)">\n            ${hs.length < 8 || i22 % 2 === odd ? round4(d, 2) : ""}\n          </text>\n      `
    )}\n    </g>\n  `;
}
function drawLocationGuides(rulers, initScale) {
    const size = 7;
    return svg`<g>\n    <!--\n    <circle \n      cx="${rulers.mouseLoc.x}" \n      cy="${-rulers.corners.lt.y}" \n      r="3" \n      fill="black"\n      class="scale-with-viewer"\n      transform="scale(${initScale}, ${initScale}) translate(0, 26)"\n      transform-origin="${rulers.mouseLoc.x} ${-rulers.corners.lt.y}"/>\n    <circle \n      cx="${rulers.corners.lt.x}" \n      cy="${-rulers.mouseLoc.y}" \n      r="3" \n      fill="black"\n      class="scale-with-viewer"\n      transform="scale(${initScale}, ${initScale}) translate(26, 0)"\n      transform-origin="${rulers.corners.lt.x} ${-rulers.mouseLoc.y}"/>\n    -->\n\n\n    <polyline \n      points="\n        ${rulers.mouseLoc.x - 7} ${-rulers.corners.lt.y} \n        ${rulers.mouseLoc.x} ${-rulers.corners.lt.y + 7} \n        ${rulers.mouseLoc.x + 7} ${-rulers.corners.lt.y}"\n      class="scale-with-viewer"\n      transform="scale(${initScale}, ${initScale}) translate(0, 20)"\n      transform-origin="${rulers.mouseLoc.x} ${-rulers.corners.lt.y}"\n      fill="black"/>\n    <polyline \n      points="\n        ${rulers.corners.lt.x} ${-rulers.mouseLoc.y + 7} \n        ${rulers.corners.lt.x + 7} ${-rulers.mouseLoc.y} \n        ${rulers.corners.lt.x} ${-rulers.mouseLoc.y - 7}"\n      class="scale-with-viewer"\n      transform="scale(${initScale}, ${initScale}) translate(20, 0)"\n      transform-origin="${rulers.corners.lt.x} ${-rulers.mouseLoc.y}"\n      fill="black"/>\n  \n\n    <!--\n    <line \n      x1=${rulers.mouseLoc.x} y1=${-rulers.corners.lt.y + rulers.size} \n      x2=${rulers.mouseLoc.x} y2=${-rulers.corners.lt.y} \n      stroke="black"\n      vector-effect="non-scaling-stroke"/>\n    <line \n      x1=${rulers.corners.lt.x + rulers.size} y1=${-rulers.mouseLoc.y} \n      x2=${rulers.corners.lt.x} y2=${-rulers.mouseLoc.y} \n      stroke="black"\n      vector-effect="non-scaling-stroke"/>\n    -->\n  <g>`;
}
function origin(rulers) {
    return svg`<g>\n    <line \n      x1=${0} y1=${-rulers.corners.lt.y + rulers.h} \n      x2=${0} y2=${-rulers.corners.lt.y} \n      stroke="lightgrey"\n      stroke-width="3"\n      vector-effect="non-scaling-stroke"/>\n    <line \n      x1=${rulers.corners.lt.x + rulers.w} y1=${0} \n      x2=${rulers.corners.lt.x} y2=${0} \n      stroke="lightgrey"\n      stroke-width="3"\n      vector-effect="non-scaling-stroke"/>\n  <g>`;
}
function handleMouseMove(e, viewBox, pan) {
    if (pan) {
        var el = document.getElementById("inner-svg-view");
        let xFactor = viewBox.v2 / (el.clientWidth - 6);
        let yFactor = viewBox.v3 / (el.clientHeight - 6);
        let scale3 = xFactor > yFactor ? xFactor : yFactor;
        viewBox.v0 -= e.movementX * scale3;
        viewBox.v1 -= e.movementY * scale3;
        el.setAttribute("viewBox", `${viewBox.v0} ${viewBox.v1} ${viewBox.v2} ${viewBox.v3}`);
    }
}
const STATE = {
    svgCloth: new svgCloth(),
    codemirror: undefined,
    showTurtles: false,
    showDimensions: false,
    turtles: [],
    hints: true,
    consoleMessage: {
        error: false,
        value: ""
    },
    dragTarget: undefined,
    draw: false,
    autorun: false,
    tempLine: undefined,
    lastClickedLine: -1,
    directEditHandle: {
        type: "",
        line: -1,
        col: 0,
        args: [],
        dragging: false
    },
    grid: false,
    experimental: false,
    name: "name_here"
};
async function run1(state1, first) {
    const code = state1.codemirror.getValue();
    let result3;
    try {
        const { directEditHandle  } = state1;
        result3 = await runtime(code, builtIns1, directEditHandle);
        state1.turtles = result3.turtles;
        state1.consoleMessage.error = false;
        state1.consoleMessage.value = result3.env.logs.join(", ");
        state1.directEditHandle.turtleBefore = result3.env.logLineTurtleBefore;
        state1.directEditHandle.turtleAfter = result3.env.logLineTurtleAfter;
        if (first) {
            document.getElementById("center").click();
        }
    } catch (err) {
        console.log(err);
        state1.consoleMessage.error = true;
        state1.consoleMessage.value = err;
    }
    dispatch("RENDER");
}
const ACTIONS = {
    INIT (args, state) {
        dispatch("RENDER");
        state.codemirror = initCodeEditor(main, STATE);
        addEvents(state);
        const url = new URL(window.location.href);
        const search = window.location.search;
        const code = new URLSearchParams(search).get("code");
        const file = new URLSearchParams(search).get("file");
        if (code) {
            const decoded = lzutf8.decompress(code, {
                inputEncoding: "StorageBinaryString"
            });
            state.codemirror.setValue(decoded);
            dispatch("RUN", {
                first: true
            });
        } else if (file) {
            let file_url = file;
            if (!file.startsWith("http")) file_url = `${url.origin}/gram-examples/${file}`;
            fetch(file_url, {
                mode: 'cors'
            }).then((file1)=>file1.text().then((txt)=>{
                    state.codemirror.setValue(txt);
                    dispatch("RUN", {
                        first: true
                    });
                })
            );
        }
        dispatch("RUN", {
            first: true
        });
    },
    CHANGE_CONSOLE_MESSAGE ({ msg  }, state) {
        console.log("changing console message to", msg);
        state.consoleMessage.value = msg;
        state.consoleMessage.error = false;
    },
    CHANGE_DIRECT_EDIT_HANDLE ({ type , line , col , args  }, state) {
        if (type !== "") state.directEditHandle = {
            type,
            line,
            col,
            args
        };
        else state.directEditHandle = {
            type,
            line: -1,
            col: 0,
            args: [],
            dragging: false
        };
        dispatch("RUN", {
            first: false
        });
    },
    DRAG_HANDLE_TARGET ({ dragging  }, state) {
        state.directEditHandle.dragging = true;
    },
    RUN ({ first =false  } = {
    }, state) {
        run1(state, first);
    },
    SET_CODE ({ txt  }, state) {
        state.codemirror.setValue(txt);
        run1(state, true);
    },
    CHANGE_NAME ({ name  }, state) {
        state.name = name !== "" ? name : "name_here";
    },
    RENDER (args, state) {
    },
    STATE (args, state) {
        console.log(state);
    }
};
function dispatch(action, args = {
}, rerender = true) {
    const trigger = ACTIONS[action];
    if (trigger) trigger(args, STATE);
    else console.log("Action not recongnized:", action);
    const dont_rerender = [
        "RUN"
    ];
    if (rerender && !dont_rerender.includes(action)) {
        renderApp(STATE);
    }
}
window.dispatch = dispatch;
window.addEventListener("load", ()=>dispatch("INIT")
);
