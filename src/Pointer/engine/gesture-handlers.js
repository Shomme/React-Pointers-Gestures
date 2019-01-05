import { calcMainAngle, calcCenter, calcRadius, calcDistance } from './helpers'

export function handlePress(e) {
	const { activePointers, session } = this.pointersState
	const { timeStamp, pointerId, pointerType, target } = e
	const activePointer = activePointers[pointerId]

	if (activePointer) {
		const { distance } = activePointer
		if ( distance < this.pressDistance ) {
			activePointer.pressed = true
			this.ee.emit('pressdown', {
				session,
				target,
				timeStamp,
				pointerId,
				pointerType,
				srcEvent: e,
				type: 'pressdown'
			})
		}
	}
}

export function handleDoubleTap(e) {
	const { lastTap } = this.pointersState
	const { clientX, clientY, timeStamp, pointerId, pointerType, target } = e

	const distanceBreak = calcDistance(clientX, clientY, lastTap.clientX, lastTap.clientY)
	const timeBreak = timeStamp - lastTap.timeStamp

	if ( distanceBreak < this.doubleTapDistance && timeBreak < this.doubleTapTimer ) {
		this.ee.emit('doubletap', {
			target,
			clientX,
			clientY,
			timeStamp,
			pointerId,
			pointerType,
			type: 'doubletap',
			srcEvent: e
		})
	}

	this.ee.removeListener('tap', this.handleDoubleTap)
}

export function handlePan(e) {
	const { activePointers, session } = this.pointersState
	const { target } = e


	const activePointer = activePointers[Object.keys(activePointers)[0]]


	if (activePointer.panning) {
		const { clientX, clientY, deltaX, deltaY, timeStamp, startTime, distance, pointerId, pointerType } = activePointer

		this.ee.emit('pan', {
			session,
			timeStamp,
			clientX,
			clientY,
			deltaX,
			deltaY,
			distance,
			pointerId,
			pointerType,
			target,
			srcEvent: e,
			type: 'pan'
		})
	}


}

export function handlePinch(e, changedActivePointers) {
	const { activePointers, session, currentCenter, currentAngle, currentRadius, rotationDistance, scaleDistance } = this.pointersState
	const { target, pointerId, pointerType } = e

	const { startX, startY, startRadius, startAngle, startTime } = session

	const newCenter = calcCenter(activePointers)
	const newRadius = calcRadius(activePointers, newCenter)
	const newAngle = calcMainAngle(activePointers, newCenter)
	const deltaX = newCenter.clientX - currentCenter.clientX
	const deltaY = newCenter.clientY - currentCenter.clientY
	const deltaRotation = newAngle - currentAngle
	const deltaRadius = newRadius - currentRadius
	const deltaScale = deltaRadius / startRadius

	const distance = calcDistance(startX, startY, newCenter.clientX, newCenter.clientY)
	const rotation = newAngle - startAngle
	const scale = newRadius / startRadius

	this.pointersState.currentCenter = newCenter
	this.pointersState.currentAngle = newAngle
	this.pointersState.currentRadius = newRadius

	this.pointersState.rotationPosition += deltaRotation
	this.pointersState.rotationDistance += Math.abs(deltaRotation)
	this.pointersState.scalePosition += deltaScale
	this.pointersState.scaleDistance += Math.abs(deltaScale)

	this.ee.emit('pan', {
		pointers: Object.assign({}, activePointers),
		session,
		target,
		center: newCenter,
		deltaX,
		deltaY,
		distance,
		srcEvent: e,
		type: 'pinch'
	})

	if (!this.scaling && (Math.abs(this.pointersState.scalePosition) > this.scalePositionThreshold) ) {
		this.pointersState.scalePosition = 0
		this.scaling = true
	}

	if (this.scaling) {
		this.ee.emit('pinch', {
			pointers: Object.assign({}, activePointers),
			session,
			target,
			center: newCenter,
			deltaX,
			deltaY,
			distance,
			deltaScale,
			scale,
			srcEvent: e,
			type: 'pinch'
		})
	}


	if (!this.rotating && (Math.abs(this.pointersState.rotationPosition) > this.rotatePositionThreshold) ) {
		this.pointersState.rotationPosition = 0
		this.rotating = true
	}

	if (this.rotating) {
		this.ee.emit('rotate', {
			pointers: Object.assign({}, activePointers),
			session,
			target,
			center: newCenter,
			rotation,
			deltaRotation,
			srcEvent: e,
			type: 'rotate'
		})
	}
}
