

const getDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const getAngle = (p1, p2) => (180 / Math.PI) * Math.atan2(p2.y - p1.y, p2.x - p1.x);
const round = (x, precision = 1) => Math.round(x*precision)/precision
const negate = x => x < 0 ? `~${x.toString().substring(1)}` : x;
const numToGram = (x, precision = 1) => negate(round(x, precision));


// turnforward 32 32
// goto [0 0]
// arc 10 130
// rotate this\cc 10
// scale 10 10
// translate 10 10
// move this\cc [10 10]

const forwardturn = (directEditHandle, mouseLocation) => {

	const { type, turtleBefore: turtle } = directEditHandle;

	const lastPoint = turtle.pointsFromLast(0);
	const lastPoint2 = turtle.pointsFromLast(1); // TODO: what if this doesn't exist
	mouseLocation.y = -mouseLocation.y;
	const d = getDistance(mouseLocation, lastPoint);
	const a = (turtle.points.length > 1 ? 0 : 180) + (getAngle(mouseLocation, lastPoint) - getAngle(lastPoint, lastPoint2));
	const newLine = `${type} ${numToGram(a)} ${numToGram(d)}`

	return newLine;
}

const goto = (directEditHandle, mouseLocation) => {

	const { type, turtleBefore: turtle } = directEditHandle;

	const { x, y } = mouseLocation;
	const newLine = `${type} [ ${numToGram(x)} ${numToGram(-y)} ]`

	return newLine;
}

const arc = (directEditHandle, mouseLocation) => { // TODO

	const { type, turtleBefore: turtle } = directEditHandle;

	const lastPoint = turtle.pointsFromLast(0);
	const lastPoint2 = turtle.pointsFromLast(1); // TODO: what if this doesn't exist
	mouseLocation.y = -mouseLocation.y;

	const d = getDistance(mouseLocation, lastPoint);
	let a = (turtle.points.length > 1 ? 0 : 180) + (getAngle(mouseLocation, lastPoint) - getAngle(lastPoint, lastPoint2));
	// console.log(lastPoint, a);

	let a1 = Math.abs(a*2-180)/2
	let d1 = (d/2)/Math.cos(a1/180*Math.PI)
	if (d1 < 0) {
		d1 *= -1;
		a = -Math.abs((360-a));
	}
	const newLine = `${type} ${numToGram((a*2)%360)} ${numToGram(d1, 10)}`

	return newLine;
}

const rotate = (directEditHandle, mouseLocation) => {
	
	const { type, turtleBefore: turtle } = directEditHandle;

	mouseLocation.y = -mouseLocation.y;

	const a = getAngle(mouseLocation, turtle.centroid);


	const newLine = `${type} this|centroidof ${numToGram(a)}`


	return newLine;
}

const scale = (directEditHandle, mouseLocation) => {

	const { type, turtleBefore: turtle } = directEditHandle;

	const x = mouseLocation.x;
	const y = -mouseLocation.y;
	const { x: rtx, y: rty } = turtle.rt;
	const { x: ccx, y: ccy } = turtle.centroid;

	const newdx = x - ccx;
	const ogdx = rtx - ccx;
	let xScale = newdx/ogdx;

	const newdy = y - ccy;
	const ogdy = rty - ccy;
	let yScale = newdy/ogdy;

	const newLine = `${type} ${numToGram(xScale, 100)} ${numToGram(yScale, 100)}`

	return newLine;
}

const translate = (directEditHandle, mouseLocation) => {

	const { type, turtleBefore: turtle } = directEditHandle;

	const { x, y } = mouseLocation;
	const { x: x2, y: y2 } = turtle.centroid;

	const newLine = `${type} ${numToGram(x - x2)} ${numToGram(-y - y2)}`

	return newLine;
}

const move = (directEditHandle, mouseLocation) => {

	const { type, turtleBefore: turtle } = directEditHandle;

	const { x, y } = mouseLocation;
	const newLine = `${type} this|centroidof [ ${numToGram(x)} ${numToGram(-y)} ]`

	return newLine;
}

export function handleLineMaker(directEditHandle, mouseLocation) {
	const type = directEditHandle.type;

	let result;
	if (type === "turnforward") result = forwardturn(directEditHandle, mouseLocation);
	else if (type === "goto") result = goto(directEditHandle, mouseLocation);
    else if (type === "arc") result = arc(directEditHandle, mouseLocation); // TODO
    else if (type === "rotate") result = rotate(directEditHandle, mouseLocation);
    else if (type === "scale") result = scale(directEditHandle, mouseLocation);
    else if (type === "translate") result = translate(directEditHandle, mouseLocation);
    else if (type === "move") result = move(directEditHandle, mouseLocation);

    if (result) {
    	return `${" ".repeat(directEditHandle.col)}${result}`
    }
}