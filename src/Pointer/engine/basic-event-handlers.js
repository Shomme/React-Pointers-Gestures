import { calcDistance } from './helpers'

export function handleMove({ pointerId, pointerType, clientX, clientY, srcEvent, timeStamp, target }) {
	const { activePointers, session } = this.pointersState
	const activePointer = activePointers[pointerId]

	if (activePointer) {
		activePointer.deltaX = clientX - activePointer.clientX
		activePointer.deltaY = clientY - activePointer.clientY
		activePointer.clientX = clientX
		activePointer.clientY = clientY
		activePointer.timeStamp = timeStamp

		activePointer.distance = calcDistance(activePointer.startX, activePointer.startY, clientX, clientY)

		const pointerDuration = timeStamp - session.startTime
		if (!activePointer.panning && pointerDuration > this.tapTimer && activePointer.distance > this.tapDistance) {
			activePointer.panning = true
			this.ee.emit('panstart', {
				timeStamp,
				session,
				target,
				pointerId: pointerId,
				pointerType: pointerType,
				clientX,
				clientY,
				srcEvent,
				type: 'panstart'
			})
		}

		return true
	}
}



export function handleAdd({ target, clientX, clientY, timeStamp, pointerId, pointerType, srcEvent }) {
	const { activePointers, session } = this.pointersState

	activePointers[pointerId] = {
		clientX,
		clientY,
		timeStamp,
		startX: clientX,
		startY: clientY,
		startTime: timeStamp,
		distance: 0,
		pointerId: pointerId,
		pointerType: pointerType,
		panning: false,
		target
	}

	this.ee.emit('pressdown', {
		timeStamp,
		session,
		target,
		pointerId: pointerId,
		pointerType: pointerType,
		clientX,
		clientY,
		srcEvent,
		type: 'pressdown'
	})

	activePointers.length += 1
}


export function handleRemove({ pointerId, pointerType, clientX, clientY, target, timeStamp, srcEvent }) {
	const { activePointers, session } = this.pointersState
	const activePointer = activePointers[pointerId]

	if (activePointer) {
		const { startX, startY } = activePointer
		const pointerDuration = timeStamp - activePointer.timeStamp
		const distance = calcDistance( startX, startY, clientX, clientY )


		this.ee.emit('pressup', {
			session,
			target,
			clientX,
			clientY,
			timeStamp,
			pointerId: pointerId,
			pointerType: pointerType,
			distance,
			srcEvent,
			type: 'pressup'
		})

		if (pointerDuration < this.tapTimer && distance < this.tapDistance) {
			const tapEvent = {
				session,
				target,
				timeStamp,
				pointerId: pointerId,
				pointerType: pointerType,
				clientX,
				clientY,
				distance,
				srcEvent,
				type: 'tap'
			}
			this.ee.emit('tap', tapEvent)
			if (srcEvent instanceof TouchEvent) {
				target.click()
			}
			this.ee.on('tap', this.handleDoubleTap)
			this.pointersState.lastTap = tapEvent
		}

		if (activePointer.panning) {
			this.ee.emit('panend', {
				session,
				target,
				distance,
				pointerId: pointerId,
				pointerType: pointerType,
				clientX,
				clientY,
				timeStamp,
				srcEvent,
				type: 'panend'
			})
		}

		delete activePointers[pointerId]
		activePointers.length -= 1

	}
}
