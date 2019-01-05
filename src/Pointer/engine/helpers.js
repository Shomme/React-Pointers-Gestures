export function calcMainAngle(pointers, center) {
	const { clientX, clientY } = pointers[Object.keys(pointers)[0]]

	return Math.atan2(clientY - center.clientY, clientX - center.clientX) * 180 / Math.PI
}

export function calcCenter(pointers) {
	const pointersLength = pointers.length

	let sumX = 0
	let sumY = 0
	for (let pointerID in pointers) {
		const touch = pointers[pointerID]
		sumX += touch.clientX
		sumY += touch.clientY
	}

	return {
		clientX: sumX / pointersLength,
		clientY: sumY / pointersLength
	}
}

export function calcRadius(pointers, center) {
	const pointersLength = pointers.length

	let distancesSum = 0
	const { clientX: centerX, clientY: centerY } = center
	for (let pointerID in pointers) {
		const { clientX, clientY } = pointers[pointerID]
		distancesSum += calcDistance( clientX, clientY, centerX, centerY)
	}

	return distancesSum / pointersLength
}

export function calcDistance(x1, y1, x2, y2) {
	return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
}
