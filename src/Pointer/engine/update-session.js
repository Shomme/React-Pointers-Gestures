import { calcMainAngle, calcCenter, calcRadius } from './helpers'

export default function updateSession(timeStamp) {
	const { session, activePointers } = this.pointersState
	const touchesLength = activePointers.length

	clearInterval(this.thresholdResetIntervalID)

	if ( touchesLength > 1) {
		const startCenter = calcCenter(activePointers)
		const startAngle = calcMainAngle(activePointers, startCenter)
		const startRadius = calcRadius(activePointers, startCenter)

		this.pointersState.session = {
			startX: startCenter.clientX,
			startY: startCenter.clientY,
			startAngle,
			startRadius,
			startTime: timeStamp
		}

		this.pointersState.currentCenter = startCenter
		this.pointersState.currentAngle = startAngle
		this.pointersState.currentRadius = startRadius

		this.pointersState.rotationDistance = 0
		this.pointersState.rotationPosition = 0
		this.pointersState.scaleDistance = 0
		this.pointersState.scalePosition = 0

		this.thresholdResetIntervalID = setInterval(() => {
			if (Math.abs(this.pointersState.rotationPosition) < this.rotateDistanceThreshold) {
				this.rotating = false

			}
			if (Math.abs(this.pointersState.scalePosition) < this.scaleDistanceThreshold) {
				this.scaling = false
			}
			this.pointersState.rotationPosition *= this.thresholdResetCoeff
			this.pointersState.scalePosition *= this.thresholdResetCoeff
		}, this.thresholdResetTimer)

		return
	}

	if ( touchesLength === 1) {
		const { clientX, clientY } = activePointers[Object.keys(activePointers)[0]]

		this.pointersState.session = {
			startX: clientX,
			startY: clientY,
			startTime: timeStamp
		}

		return
	}

}
